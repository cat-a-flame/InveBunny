'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/src/components/Dialog/dialog';
import { Button } from '@/src/components/Button/button';
import { useToast } from '@/src/components/Toast/toast';

// Basic types for supply and batch options
export type SupplyOption = { id: string; supply_name: string };
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

export default function AddProductBatchDialog({ open, onClose, productId, productName, onCreated }: Props) {
    const toast = useToast();

    const [form, setForm] = useState({
        p_batch_name: '',
        date_made: '',
        is_active: true,
    });

    const [supplies, setSupplies] = useState<SupplyOption[]>([]);
    const [supplyEntries, setSupplyEntries] = useState<ProductBatchSupply[]>([]);

    const [selectedSupply, setSelectedSupply] = useState('');
    const [availableBatches, setAvailableBatches] = useState<SupplyBatchOption[]>([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch list of supplies when dialog opens
    useEffect(() => {
        if (!open) return;
        const fetchSupplies = async () => {
            try {
                const res = await fetch('/api/supplies?fields=id,supply_name&withBatches=true');
                if (res.ok) {
                    const data = await res.json();
                    setSupplies(data.supplies || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchSupplies();
    }, [open]);

    // Fetch batches for selected supply
    useEffect(() => {
        if (!selectedSupply) {
            setAvailableBatches([]);
            return;
        }
        const fetchBatches = async () => {
            try {
                const res = await fetch(`/api/supplies/batches/?supplyId=${selectedSupply}`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailableBatches(data.batches || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchBatches();
    }, [selectedSupply]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

    return (
        <Dialog open={open} onClose={onClose} title="Create product batch">
            <form onSubmit={handleSubmit} className="form-grid">
                <div className="input-group">
                    <label className="input-label">Product name</label>
                    <input value={productName} readOnly />
                </div>

                <div className="input-group">
                    <label className="input-label">Batch name</label>
                    <input name="p_batch_name" value={form.p_batch_name} onChange={e => setForm(prev => ({ ...prev, p_batch_name: e.target.value }))} required />
                </div>

                <div className="double-input-group">
                    <div className="input-grow">
                        <label className="input-label">Date made</label>
                        <input type="date" name="date_made" value={form.date_made} onChange={e => setForm(prev => ({ ...prev, date_made: e.target.value }))} required />
                    </div>
                    <div className="input-shrink">
                        <label className="input-label">Active batch</label>
                        <label className="switch">
                            <input type="checkbox" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="double-input-group">
                    <div className="input-grow">
                        <label className="input-label">Supply</label>
                        <select value={selectedSupply} onChange={e => setSelectedSupply(e.target.value)}>
                            <option value="">Select supply</option>
                            {supplies.map(s => (
                                <option key={s.id} value={s.id}>{s.supply_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-grow">
                        <label className="input-label">Supply batch</label>
                        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} disabled={!selectedSupply}>
                            <option value="">Select batch</option>
                            {availableBatches.map(b => (
                                <option key={b.id} value={b.id}>{b.batch_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-shrink" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button type="button" variant="ghost" size="sm" onClick={addEntry} disabled={!selectedSupply || !selectedBatch}>Add</Button>
                    </div>
                </div>

                {supplyEntries.length > 0 && (
                    <ul>
                        {supplyEntries.map((se, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{se.supplyName} - {se.batchName}</span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeEntry(idx)}>&times;</Button>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="dialog-buttons">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={submitting}>Create batch</Button>
                </div>
            </form>
        </Dialog>
    );
}
