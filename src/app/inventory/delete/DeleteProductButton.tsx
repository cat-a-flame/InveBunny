'use client';

import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { useState } from 'react';

type Props = {
    productId: string;
    productName: string;
};

export const DeleteProductButton = ({ productId, productName }: Props) => {
    const [open, setOpen] = useState(false);
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
            <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => setOpen(true)} title="Delete product" />

            {open && (
                <DeleteConfirmationDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    onConfirm={handleDelete}
                    productName={productName}
                />
            )}
        </>
    );
};
