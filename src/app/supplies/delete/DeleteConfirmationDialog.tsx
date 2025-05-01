import { Button } from "../../../components/Button/button";
import { Dialog } from "../../../components/Dialog/dialog";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    supplyName: string;
};

export const DeleteConfirmationDialog = ({ open, onClose, onConfirm, supplyName }: Props) => {
    const handleClose = () => {
        onClose();
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} title="Delete supply">
            <p>Are you sure you want to delete <strong>{supplyName}</strong>?</p>
            <p>This action will also permanently remove all batches linked to this supply!</p>

            <div className="dialog-buttons">
                <Button variant="ghost" onClick={handleClose} type="button">Cancel</Button>
                <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
            </div>
        </Dialog>
    );
};
