'use client';

import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
    productId: string;
    productName: string;
    inventoryId: string; // 🔸 Add this prop
};

export const DeleteProductButton = ({ productId, productName, inventoryId }: Props) => {
    const [open, setOpen] = useState(false);
    const toast = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const res = await fetch(
                `/api/inventory/deleteProduct?id=${productId}&inventory_id=${inventoryId}`,
                { method: 'DELETE' }
            );
            if (res.ok) {
                toast('✅ Product successfully deleted');
                router.refresh();
            } else {
                toast('🚫 Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product', error);
        }
    };

    return (
        <>
            <IconButton
                icon={<i className="fa-regular fa-trash-can"></i>}
                onClick={() => setOpen(true)}
                title="Delete product"
            />

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
