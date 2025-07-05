import { Button } from "../../../components/Button/button";
import { Dialog } from "../../../components/Dialog/dialog";

export type DeleteConfirmationDialogHandle = {
	open: () => void;
};

type Props = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	productName: string;
};

export const DeleteConfirmationDialog = ({ open, onClose, onConfirm, productName }: Props) => {
	const handleClose = () => {
		onClose();
	};

	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} title="Delete this product?">
			<p>You are about to remove <strong>{productName}</strong> from this inventory.</p>

			<div className="dialog-buttons">
				<Button variant="ghost" onClick={handleClose} type="button">Never mind</Button>
				<Button variant="destructive" onClick={handleConfirm}>Yes, delete</Button>
			</div>
		</Dialog>
	);
};