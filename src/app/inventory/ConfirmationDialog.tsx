'use client';

import React from 'react';

export function ConfirmationDialog({
  productId,
  onDelete,
  onClose,
}: {
  productId: string;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <dialog open className="dialog">
      <p>Are you sure you want to delete this product?</p>
      <div className="dialog-actions">
        <button onClick={() => onDelete(productId)}>Yes, delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </dialog>
  );
}
