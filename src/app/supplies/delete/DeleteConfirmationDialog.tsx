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
        <Dialog open={open} onClose={handleClose} title="Delete this supply?">
            <p>You are about to send <strong>{supplyName}</strong> to the digital abyss.</p>
            <p>{"This will also delete all its batches, leaving items using this supply empty-handed."}</p>

            <div className="dialog-buttons">
                <Button variant="ghost" onClick={handleClose} type="button">Never mind</Button>
                <Button variant="destructive" onClick={handleConfirm}>Yes, delete</Button>
            </div>
        </Dialog>
    );
};
