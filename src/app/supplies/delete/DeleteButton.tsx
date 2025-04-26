'use client';

import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useRef } from 'react';
import { DeleteConfirmationDialog, DeleteConfirmationDialogHandle } from './DeleteConfirmationDialog';

type Props = {
    supplyId: string;
};

export const DeleteButton = ({ supplyId }: Props) => {
    const dialogRef = useRef<DeleteConfirmationDialogHandle>(null);
    const toast = useToast();

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/supplies/deleteSupply?id=${supplyId}`, { method: 'DELETE' });
            if (res.ok) {
                toast('✅ Supply successfully deleted');
            } else {
                toast('🚫 Failed to delete supply');
            }
        } catch (error) {
            console.error('Error deleting supply', error);
        }
    };

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => dialogRef.current?.open()} title="Delete product" />

            <DeleteConfirmationDialog ref={dialogRef} onConfirm={handleDelete} />
        </>
    );
};
