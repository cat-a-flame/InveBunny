import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { Button } from '@/src/components/Button/button';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { useToast } from '@/src/components/Toast/toast';
import { SupplyOption, SupplyBatchOption, ProductBatchSupply } from './AddProductBatchPanel';

export type ProductBatch = {
    id: string;
    p_batch_name: string;
    date_made: string;
    is_active: boolean;
    supplies: ProductBatchSupply[];
};

interface Props {
    open: boolean;
    onClose: () => void;
    batch: ProductBatch;
    onUpdated: () => void;
}

export default function EditProductBatchPanel({ open, onClose, batch, onUpdated }: Props) {
    const toast = useToast();
    const isMounted = useRef(false);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        p_batch_name: batch.p_batch_name,
        date_made: batch.date_made,
        is_active: batch.is_active,
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
    }, [open, batch]);

    useEffect(() => {
        if (!open) return;
        setFormData({
            p_batch_name: batch.p_batch_name,
            date_made: batch.date_made,
            is_active: batch.is_active,
        });
        setSupplyEntries(
            (batch.supplies || []).map((s) => ({
                supplyId: s.supplyId,
                batchId: (s as any).batchId ?? (s as any).supplyBatchId,
                supplyName: s.supplyName,
                batchName: s.batchName,
            }))
        );
    }, [open, batch]);

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

    // When the panel closes, prime the loading flag so the loader
    // appears immediately the next time it opens
    useEffect(() => {
        if (!open) {
            setLoadingSupplies(true);
        }
    }, [open]);

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

    // Recompute which supplies still have available batches
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (supplyEntries.length === 0) {
            toast('Add at least one supply batch');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`/api/products/batches/${batch.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    supplies: supplyEntries.map(se => se.batchId),
                }),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                toast('✅ Batch updated!');
                onUpdated();
                onClose();
            } else {
                toast(result.error || 'Failed to update batch');
            }
        } catch (err) {
            console.error(err);
            toast('Something went wrong.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title">Edit product batch</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>
                <form id="edit-batch-form" onSubmit={handleSubmit} className="side-panel-content form-grid">
                <div className="input-group">
                    <label className="input-label">Batch name</label>
                    <input className="input-max-width" name="p_batch_name" value={formData.p_batch_name} onChange={e => setFormData({ ...formData, p_batch_name: e.target.value })} required />
                </div>

                <div className="double-input-group">
                    <div className="input-grow">
                        <label className="input-label">Date made</label>
                        <input className="input-max-width" type="date" name="date_made" value={formData.date_made ? new Date(formData.date_made).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, date_made: e.target.value })} required />
                    </div>

                    <div className="input-shrink">
                        <label className="input-label">Active batch</label>
                        <label className="switch">
                            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <h4 className="section-subtitle">Supplies</h4>

                <div className="input-group">
                    <label className="input-label">Supply</label>
                    <Select
                        classNamePrefix="react-select"
                        options={groupedOptions}
                        value={selectedSupplyOption}
                        onChange={opt => setSelectedSupply(opt ? (opt as any).value : '')}
                        placeholder="Select supply"
                        isClearable
                        isLoading={loadingSupplies}
                        noOptionsMessage={() =>
                            loadingSupplies ? 'Loading…' : 'Loading...'
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

                <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Button type="button" variant="secondary" size="sm" onClick={addEntry} disabled={!selectedSupply || !selectedBatch}>Add</Button>
                </div>

                {supplyEntries.length > 0 && (
                    <ul className="supply-entries">
                        {supplyEntries.map((se, idx) => (
                            <li className="supply-entry" key={idx}>
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
                    <Button type="submit" form="edit-batch-form" variant="primary" disabled={submitting || supplyEntries.length === 0}>Save</Button>
                </div>
            </div>
        </>
    );
}
