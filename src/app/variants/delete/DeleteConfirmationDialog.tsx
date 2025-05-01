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
        <Dialog open={open} onClose={handleClose} title="Delete variant">
            <p>Are you sure you want to delete <strong>{variantName}</strong> variant?</p>

            <div className="dialog-buttons">
                <Button variant="ghost" onClick={handleClose} type="button">Cancel</Button>
                <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
            </div>
        </Dialog>
    );
}