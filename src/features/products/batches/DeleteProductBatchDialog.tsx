import { Button } from "@/src/components/Button/button";
import { Dialog } from '@/src/components/Dialog/dialog';
import { useToast } from '@/src/components/Toast/toast';

interface Props {
    open: boolean;
    onClose: () => void;
    batchName: string;
    batchId: string;
    onDeleted: () => void;
}

export default function DeleteProductBatchDialog({ open, onClose, batchName, batchId, onDeleted }: Props) {
    const toast = useToast();

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/products/batches/${batchId}`, {
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
            <p>You are about to delete <strong>{batchName}</strong>.</p>
            <div className="dialog-buttons">
                <Button type="button" variant="ghost" onClick={onClose}>Never mind</Button>
                <Button variant="destructive" onClick={handleDelete}>Yes, delete</Button>
            </div>
        </Dialog>
    );
}
