import { Button } from '@/src/components/Button/button';
import { Dialog } from '@/src/components/Dialog/dialog';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    inventoryName: string;
};

export const DeleteConfirmationDialog = ({ open, onClose, onConfirm, inventoryName }: Props) => {
    const handleClose = () => {
        onClose();
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} title="Delete this inventory?">
            <p>You are about to send <strong>{inventoryName}</strong> to the digital abyss.</p>
            <p>This action is only allowed for empty inventories.</p>
            <div className="dialog-buttons">
                <Button variant="ghost" onClick={handleClose} type="button">Never mind</Button>
                <Button variant="destructive" onClick={handleConfirm}>Yes, delete</Button>
            </div>
        </Dialog>
    );
};
