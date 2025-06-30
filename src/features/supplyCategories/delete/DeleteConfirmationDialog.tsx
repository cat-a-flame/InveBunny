import { Button } from "../../../components/Button/button";
import { Dialog } from "../../../components/Dialog/dialog";

export type DeleteConfirmationDialogHandle = {
    open: () => void;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    categoryName?: string;
};

export const DeleteConfirmationDialog = ({ open, onClose, onConfirm, categoryName }: Props) => {
    const handleClose = () => {
        onClose();
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} title="Delete this category?">
            <p>You are about to remove <strong>{categoryName}</strong> forever.</p>
            <div className="dialog-buttons">
                <Button type="button" variant="ghost" onClick={handleClose}>Never mind</Button>
                <Button variant="destructive" onClick={handleConfirm}>Yes, delete</Button>
            </div>
        </Dialog>
    );
};
