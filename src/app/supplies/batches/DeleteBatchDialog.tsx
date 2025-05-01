import { Button } from "../../../components/Button/button";
import { Dialog } from '@/src/components/Dialog/dialog';
import { useToast } from '../../../components/Toast/toast';

type DeleteBatchDialogProps = {
    open: boolean;
    onClose: () => void;
    batchName: string;
    batchId: string;
    onDeleted: () => void;
};

export default function DeleteBatchDialog({ open, onClose, batchName, batchId, onDeleted }: DeleteBatchDialogProps) {
    const toast = useToast();

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
        <Dialog open={open} onClose={onClose} title="Delete batch">
            <p>Are you sure you want to delete batch <strong>{batchName}</strong>? This cannot be undone. </p>

            <div className="dialog-buttons">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
        </Dialog>
    );
}
