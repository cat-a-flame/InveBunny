import { Button } from "../../../components/Button/button";
import { Dialog } from '@/src/components/Dialog/dialog';
import { useToast } from '../../../components/Toast/toast';
import { useEffect, useState } from 'react';

type DeleteBatchDialogProps = {
    open: boolean;
    onClose: () => void;
    batchName: string;
    batchId: string;
    onDeleted: () => void;
};

export default function DeleteBatchDialog({ open, onClose, batchName, batchId, onDeleted }: DeleteBatchDialogProps) {
    const toast = useToast();
    const [usage, setUsage] = useState<{ id: string; p_batch_name: string }[]>([]);

    useEffect(() => {
        if (!open) return;
        const fetchUsage = async () => {
            try {
                const res = await fetch(`/api/supplies/batches/usage?batchId=${batchId}`);
                if (res.ok) {
                    const data = await res.json();
                    setUsage(data.batches || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsage();
    }, [open, batchId]);

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/supplies/batches/${batchId}`, {
                method: 'DELETE',
            });

            const result = await res.json();

            if (res.ok && result.success) {
                toast('✅ Batch deleted!');
                onDeleted();
                
            } else {
                toast(result.error || 'Failed to delete batch');
            }
        } catch (error) {
            console.error(error);
            toast('Failed to delete batch');
        }
        
    };

    return (
        <Dialog open={open} onClose={onClose} title="Delete this batch?">
            <p>You are about to send <strong>{batchName}</strong> to the digital abyss.</p>
            {usage.length > 0 && (
                <>
                    <p>This batch is used in the following product batches:</p>
                    <ul>
                        {usage.map(u => (
                            <li key={u.id}>{u.p_batch_name}</li>
                        ))}
                    </ul>
                </>
            )}
            <p>{"Items using this batch won't be deleted, but they'll lose this supply batch."}</p>

            <div className="dialog-buttons">
                <Button type="button" variant="ghost" onClick={onClose}>Never mind</Button>
                <Button variant="destructive" onClick={handleDelete}>Yes, delete</Button>
            </div>
        </Dialog>
    );
}
