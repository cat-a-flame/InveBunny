import { Button } from "../../../components/Button/button";
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Dialog } from "../../../components/Dialog/dialog";

export type DeleteConfirmationDialogHandle = {
  open: () => void;
};

type Props = {
  onConfirm: () => void;
  supplyName: string;
};

export const DeleteConfirmationDialog = forwardRef<DeleteConfirmationDialogHandle, Props>(
  ({ onConfirm, supplyName }, ref) => {
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }));

    const handleClose = () => {
      setOpen(false);
    };

    const handleConfirm = () => {
      onConfirm();
      handleClose();
    };

    return (
      <Dialog open={open} onClose={handleClose} title="Delete supply">
        <p>Are you sure you want to delete <strong>{supplyName}</strong>?</p>
        <p>This action will also permanently remove all batches linked to this supply!</p>

        <div className="dialog-buttons">
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
        </div>
      </Dialog>
    );
  }
);

DeleteConfirmationDialog.displayName = 'DeleteConfirmationDialog';
