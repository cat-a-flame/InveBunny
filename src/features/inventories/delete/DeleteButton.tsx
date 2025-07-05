'use client';

import { useState } from 'react';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { useToast } from '@/src/components/Toast/toast';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

type Props = {
    inventoryId: string;
    inventoryName: string;
    productCount: number;
};

export const DeleteButton = ({ inventoryId, inventoryName, productCount }: Props) => {
    const [open, setOpen] = useState(false);
    const toast = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/inventories/deleteInventory?id=${inventoryId}`, { method: 'DELETE' });
            if (res.ok) {
                toast('✅ Inventory successfully deleted');
                router.refresh();
            } else {
                const data = await res.json();
                toast(`🚫 ${data.error || 'Failed to delete inventory'}`);
            }
        } catch (error) {
            console.error('Error deleting inventory', error);
        }
    };

    const disabled = productCount > 0;

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => !disabled && setOpen(true)} title="Delete inventory" disabled={disabled} />
            {open && (
                <DeleteConfirmationDialog open={open} onClose={() => setOpen(false)} onConfirm={handleDelete} inventoryName={inventoryName} />
            )}
        </>
    );
};
