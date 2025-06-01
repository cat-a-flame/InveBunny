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
        <Dialog open={open} onClose={onClose} title="Delete this batch?">
            <p>You are about to send <strong>{batchName}</strong> to the digital abyss.</p>
            <p>Items using to this batch won't be deleted, but they'll be left empty-handed.</p>

            <div className="dialog-buttons">
                <Button type="button" variant="ghost" onClick={onClose}>Never mind</Button>
                <Button variant="destructive" onClick={handleDelete}>Yes, delete</Button>
            </div>
        </Dialog>
    );
}
