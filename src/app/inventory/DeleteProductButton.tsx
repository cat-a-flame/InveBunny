'use client';

import { IconButton } from '../../components/IconButton/iconButton';
import { useToast } from '../../components/Toast/toast';
import { useRef } from 'react';
import { DeleteConfirmationDialog, DeleteConfirmationDialogHandle } from './DeleteConfirmationDialog';

type Props = {
    productId: string;
};

export const DeleteProductButton = ({ productId }: Props) => {
    const dialogRef = useRef<DeleteConfirmationDialogHandle>(null);
    const toast = useToast();
    
    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/inventory/deleteProduct?id=${productId}`, { method: 'DELETE' });
            if (res.ok) {
                toast('✅ Product successfully deleted');
            } else {
                toast('🚫 Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product', error);
        }
    };

    return (
        <>
            <IconButton icon={<i className="fa-solid fa-trash-can"></i>} onClick={() => dialogRef.current?.open()} title="Delete product" />

            <DeleteConfirmationDialog ref={dialogRef} onConfirm={handleDelete} />
        </>
    );
};
