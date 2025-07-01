import { Button } from '../../../components/Button/button';
import { Panel } from '@/src/components/Panel/panel';
import { useState } from 'react';
import { useToast } from '../../../components/Toast/toast';

type EditBatchDialogProps = {
    open: boolean;
    onClose: () => void;
    batch: {
        id: string;
        batch_name: string;
        supplier_name: string;
        order_date: string;
        vendor_name: string;
        order_id: string;
        status: boolean;
    };
    onUpdated: () => void;
};

export default function EditBatchDialog({ open, onClose, batch, onUpdated }: EditBatchDialogProps) {
    const [formData, setFormData] = useState(batch);
    const toast = useToast();

    const handleSubmit = async () => {
        try {
            const res = await fetch(`/api/supplies/batches/${batch.id}`, {
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
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <Panel isOpen={open} onClose={onClose} title="Edit batch">
            <form onSubmit={handleSubmit} className="form-grid">
                <div className="input-group">
                    <label className="input-label">Batch name</label>
                    <input name="batch_name" value={formData.batch_name} onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })} required />
                </div>

                <div className="input-group">
                    <label className="input-label">Supplier name</label>
                    <input name="supplier_name" value={formData.supplier_name} onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })} autoFocus required />
                </div>

                <div className="input-group">
                    <label className="input-label">Vendor name</label>
                    <input name="vendor_name" value={formData.vendor_name} onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })} required />
                </div>

                <div className="input-group">
                    <label className="input-label">Order number</label>
                    <input name="order_id" value={formData.order_id} onChange={(e) => setFormData({ ...formData, order_id: e.target.value })} required />
                </div>

                <div className="double-input-group">
                    <div className="input-grow">
                        <label className="input-label">Date of purchase</label>
                        <input name="order_date" type="date" value={formData.order_date ? new Date(formData.order_date).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, order_date: e.target.value })} required />
                    </div>

                    <div className="input-shrink">
                        <label className="input-label">Active batch</label>
                        <label className="switch">
                            <input type="checkbox" checked={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked }))} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="dialog-buttons">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="button" variant="primary" onClick={handleSubmit}>Save</Button>
                </div>
            </form>
            </Panel>
        </>
    );
}
