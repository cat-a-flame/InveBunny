'use client';

import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { Button } from '@/src/components/Button/button';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { useToast } from '@/src/components/Toast/toast';

// Basic types for supply and batch options
export type SupplyOption = {
    id: string;
    supply_name: string;
    supply_categories?: { id: string; category_name: string };
};
export type SupplyBatchOption = { id: string; batch_name: string };

export type ProductBatchSupply = {
    supplyId: string;
    batchId: string;
    supplyName?: string;
    batchName?: string;
};

interface Props {
    open: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    onCreated: () => void;
}

export default function AddProductBatchPanel({ open, onClose, productId, productName, onCreated }: Props) {
    const toast = useToast();
    const isMounted = useRef(false);
    const [isOpen, setIsOpen] = useState(false);

    const [form, setForm] = useState({
        p_batch_name: '',
        date_made: '',
        is_active: true,
    });

    const [supplies, setSupplies] = useState<SupplyOption[]>([]);
    const [loadingSupplies, setLoadingSupplies] = useState(true);
    const [filteredSupplies, setFilteredSupplies] = useState<SupplyOption[]>([]);
    const [supplyBatches, setSupplyBatches] = useState<Record<string, SupplyBatchOption[]>>({});
    const [supplyEntries, setSupplyEntries] = useState<ProductBatchSupply[]>([]);

    const [selectedSupply, setSelectedSupply] = useState('');
    const [availableBatches, setAvailableBatches] = useState<SupplyBatchOption[]>([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            isMounted.current = true;
            setTimeout(() => setIsOpen(true), 50);
        } else {
            setIsOpen(false);
            isMounted.current = false;
        }
    }, [open]);

    // Fetch list of supplies when dialog opens
    useEffect(() => {
        if (!open) return;
        const fetchSupplies = async () => {
            setLoadingSupplies(true);
            try {
                const res = await fetch('/api/supplies?fields=id,supply_name,supply_categories(id,category_name)&withBatches=true');
                if (res.ok) {
                    const data = await res.json();
                    setSupplies(data.supplies || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingSupplies(false);
            }
        };
        fetchSupplies();
    }, [open]);

    // Reset loading state when panel closes so the loader shows immediately
    // on the next open before supplies are fetched again
    useEffect(() => {
        if (!open) {
            setLoadingSupplies(true);
        }
    }, [open]);

    // Recompute which supplies have available batches
    useEffect(() => {
        if (!open) return;
        const filtered = supplies.filter((s) => {
            const batches = supplyBatches[s.id] || [];
            const usedBatchIds = supplyEntries
                .filter((se) => se.supplyId === s.id)
                .map((se) => se.batchId);
            return batches.some((b) => !usedBatchIds.includes(b.id));
        });
        setFilteredSupplies(filtered);
        if (selectedSupply && !filtered.find((s) => s.id === selectedSupply)) {
            setSelectedSupply('');
            setAvailableBatches([]);
            setSelectedBatch('');
        }
    }, [open, supplies, supplyBatches, supplyEntries, selectedSupply]);

    // After supplies load, fetch batches for each supply
    useEffect(() => {
        if (!open || supplies.length === 0) return;
        const fetchAllBatches = async () => {
            const map: Record<string, SupplyBatchOption[]> = {};
            await Promise.all(
                supplies.map(async (s) => {
                    try {
                        const res = await fetch(`/api/supplies/batches/?supplyId=${s.id}`);
                        if (res.ok) {
                            const data = await res.json();
                            map[s.id] = data.batches || [];
                        }
                    } catch (err) {
                        console.error(err);
                    }
                })
            );
            setSupplyBatches(map);
        };
        fetchAllBatches();
    }, [open, supplies]);

    // Fetch batches for selected supply and filter out already added ones
    useEffect(() => {
        if (!selectedSupply) {
            setAvailableBatches([]);
            return;
        }

        const loadBatches = async () => {
            let batches = supplyBatches[selectedSupply];
            if (!batches) {
                try {
                    const res = await fetch(`/api/supplies/batches/?supplyId=${selectedSupply}`);
                    if (res.ok) {
                        const data = await res.json();
                        batches = data.batches || [];
                        setSupplyBatches((prev) => ({ ...prev, [selectedSupply]: batches! }));
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            if (batches) {
                const usedBatchIds = supplyEntries
                    .filter((se) => se.supplyId === selectedSupply)
                    .map((se) => se.batchId);
                const filtered = batches.filter(
                    (b: SupplyBatchOption) => !usedBatchIds.includes(b.id)
                );
                setAvailableBatches(filtered);
            }
        };

        loadBatches();
    }, [selectedSupply, supplyEntries, supplyBatches]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (supplyEntries.length === 0) {
            toast('Add at least one supply batch');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/products/batches/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: productId,
                    p_batch_name: form.p_batch_name,
                    date_made: form.date_made,
                    is_active: form.is_active,
                    supplies: supplyEntries.map(se => ({ supply_batch_id: se.batchId })),
                }),
            });
            if (res.ok) {
                toast('Product batch created!');
                onCreated();
                onClose();
            } else {
                console.error(await res.json());
                toast('Failed to create batch');
            }
        } catch (err) {
            console.error(err);
            toast('Failed to create batch');
        } finally {
            setSubmitting(false);
        }
    };

    const addEntry = () => {
        if (!selectedSupply || !selectedBatch) return;
        const supplyName = supplies.find(s => s.id === selectedSupply)?.supply_name;
        const batchName = availableBatches.find(b => b.id === selectedBatch)?.batch_name;
        setSupplyEntries(prev => [...prev, {
            supplyId: selectedSupply,
            batchId: selectedBatch,
            supplyName,
            batchName,
        }]);
        setSelectedSupply('');
        setAvailableBatches([]);
        setSelectedBatch('');
    };

    const removeEntry = (index: number) => {
        setSupplyEntries(prev => prev.filter((_, i) => i !== index));
    };

    const supplyGroups = filteredSupplies.reduce<Record<string, { label: string; options: { value: string; label: string }[] }>>((acc, s) => {
        const category = s.supply_categories?.category_name || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = { label: category, options: [] };
        }
        acc[category].options.push({ value: s.id, label: s.supply_name });
        return acc;
    }, {});

    const groupedOptions = Object.values(supplyGroups);
    const selectedSupplyOption = groupedOptions.flatMap(g => g.options).find(o => o.value === selectedSupply) || null;

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title">Create product batch</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>
                <form id="add-batch-form" onSubmit={handleSubmit} className="side-panel-content form-grid">
                <div className="input-group">
                    <label className="input-label">Product name</label>
                    <input className="input-max-width" value={productName} readOnly />
                </div>

                <div className="input-group">
                    <label className="input-label">Batch name</label>
                    <input className="input-max-width" name="p_batch_name" value={form.p_batch_name} onChange={e => setForm(prev => ({ ...prev, p_batch_name: e.target.value }))} required />
                </div>

                <div className="double-input-group">
                    <div className="input-grow">
                        <label className="input-label">Date made</label>
                        <input className="input-max-width" type="date" name="date_made" value={form.date_made} onChange={e => setForm(prev => ({ ...prev, date_made: e.target.value }))} required />
                    </div>
                    <div className="input-shrink">
                        <label className="input-label">Active batch</label>
                        <label className="switch">
                            <input type="checkbox" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <h4 className="section-subtitle">Supplies</h4>

                <div className="input-group">
                    <label className="input-label">Supply name</label>
                    <Select
                        classNamePrefix="react-select"
                        options={groupedOptions}
                        value={selectedSupplyOption}
                        onChange={opt => setSelectedSupply(opt ? (opt as any).value : '')}
                        placeholder="Select supply"
                        isClearable
                        isLoading={loadingSupplies}
                        noOptionsMessage={() =>
                            loadingSupplies ? 'Loading…' : 'No supplies available'
                        }
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Supply batch</label>
                    <select className="input-max-width" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} disabled={!selectedSupply}>
                        <option value="">Select batch</option>
                        {availableBatches.map(b => (
                            <option key={b.id} value={b.id}>{b.batch_name}</option>
                        ))}
                    </select>
                </div>
                <div className="input-group">
                    <Button type="button" variant="secondary" size="sm" onClick={addEntry} disabled={!selectedSupply || !selectedBatch}>Add</Button>
                </div>

                {supplyEntries.length > 0 && (
                    <ul className="supply-entries">
                        {supplyEntries.map((se, idx) => (
                            <li key={idx} className="supply-entry">
                                <div>
                                    <span className="supply-entry-name">{se.supplyName}</span>
                                    <span className="supply-entry-batch">{se.batchName}</span>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeEntry(idx)}>&times;</Button>
                            </li>
                        ))}
                    </ul>
                )}

                </form>
                <div className="side-panel-footer">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="add-batch-form" variant="primary" disabled={submitting || supplyEntries.length === 0}>Create batch</Button>
                </div>
            </div>
        </>
    );
}
