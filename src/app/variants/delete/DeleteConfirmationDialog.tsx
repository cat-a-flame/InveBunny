import { Button } from "../../../components/Button/button";
import { useRef, forwardRef, useImperativeHandle } from 'react';

export type DeleteConfirmationDialogHandle = {
  open: () => void;
};

type Props = {
  onConfirm: () => void;
};

export const DeleteConfirmationDialog = forwardRef<DeleteConfirmationDialogHandle, Props>(
  ({ onConfirm }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        const dialog = dialogRef.current;
        if (dialog && typeof dialog.showModal === 'function') {
          dialog.showModal();
        }
      },
    }));

    const handleClose = () => {
      dialogRef.current?.close();
    };

    const handleConfirm = () => {
      onConfirm();
      handleClose();
    };

    return (
      <dialog className="dialog" ref={dialogRef}>
        <div className="dialog-content">
          <h2 className="dialog-title">Delete variant</h2>

          <p>This cannot be undone. Are you sure?</p>

          <div className="dialog-buttons">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
          </div>
        </div>
      </dialog>
    );
  }
);

DeleteConfirmationDialog.displayName = 'DeleteConfirmationDialog';
