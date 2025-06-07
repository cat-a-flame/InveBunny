'use client';

import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useState } from 'react';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

type Props = {
    variantId: string;
    variantName: string;
};

export const DeleteButton = ({ variantId, variantName }: Props) => {
    const [open, setOpen] = useState(false);
    const toast = useToast();

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/variants/deleteVariant?id=${variantId}`, { method: 'DELETE' });
            if (res.ok) {
                toast('✅ Variant successfully deleted');
            } else {
                toast('🚫 Failed to delete variant');
            }
        } catch (error) {
            console.error('Error deleting variant', error);
        }
    };

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => setOpen(true)} title="Delete product" />

            {open && ( <DeleteConfirmationDialog open={open} onClose={() => setOpen(false)} onConfirm={handleDelete} variantName={variantName}  /> )}
        </>
    );
};
