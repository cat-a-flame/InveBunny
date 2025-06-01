import { Button } from "../../../components/Button/button";
import { Dialog } from "../../../components/Dialog/dialog";

export type DeleteConfirmationDialogHandle = {
    open: () => void;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    variantName: string;
};

export const DeleteConfirmationDialog = ({ open, onClose, onConfirm, variantName }: Props) => {
    const handleClose = () => {
        onClose();
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} title="Delete this variant?">
            <p>You are about to send <strong>{variantName}</strong> to the digital abyss.</p>
            <p>Items assigned to this variant won't be deleted, but they'll be confused.</p>

            <div className="dialog-buttons">
                <Button variant="ghost" onClick={handleClose} type="button">Never mind</Button>
                <Button variant="destructive" onClick={handleConfirm}>Yes, delete</Button>
            </div>
        </Dialog>
    );
}