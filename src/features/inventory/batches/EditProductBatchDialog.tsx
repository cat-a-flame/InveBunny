import { useState } from 'react';
import { Dialog } from '@/src/components/Dialog/dialog';
import { Button } from '@/src/components/Button/button';
import { useToast } from '@/src/components/Toast/toast';

export type ProductBatch = {
    id: string;
    p_batch_name: string;
    date_made: string;
    is_active: boolean;
    supplies?: { supplyName?: string; batchName?: string }[];
};

interface Props {
    open: boolean;
    onClose: () => void;
    batch: ProductBatch;
    onUpdated: () => void;
}

export default function EditProductBatchDialog({ open, onClose, batch, onUpdated }: Props) {
    const toast = useToast();
    const [formData, setFormData] = useState(batch);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/products/batches/${batch.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
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
        <Dialog open={open} onClose={onClose} title="Edit product batch">
            <form onSubmit={handleSubmit} className="form-grid">
                <div className="input-group">
                    <label className="input-label">Batch name</label>
                    <input name="p_batch_name" value={formData.p_batch_name} onChange={e => setFormData({ ...formData, p_batch_name: e.target.value })} required />
                </div>

                <div className="input-group">
                    <label className="input-label">Date made</label>
                    <input type="date" name="date_made" value={formData.date_made ? new Date(formData.date_made).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, date_made: e.target.value })} required />
                </div>

                <div className="input-group">
                    <label className="input-label">Active batch</label>
                    <label className="switch">
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="dialog-buttons">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={submitting}>Save</Button>
                </div>
            </form>
        </Dialog>
    );
}
