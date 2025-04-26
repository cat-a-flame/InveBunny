'use client';

import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useRef } from 'react';
import { DeleteConfirmationDialog, DeleteConfirmationDialogHandle } from './DeleteConfirmationDialog';

type Props = {
    variantId: string;
};

export const DeleteButton = ({ variantId }: Props) => {
    const dialogRef = useRef<DeleteConfirmationDialogHandle>(null);
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
            <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => dialogRef.current?.open()} title="Delete product" />

            <DeleteConfirmationDialog ref={dialogRef} onConfirm={handleDelete} />
        </>
    );
};
