'use client';

import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useRef } from 'react';
import { DeleteConfirmationDialog, DeleteConfirmationDialogHandle } from './DeleteConfirmationDialog';

type Props = {
    categoryId: string;
};

export const DeleteButton = ({ categoryId }: Props) => {
    const dialogRef = useRef<DeleteConfirmationDialogHandle>(null);
    const toast = useToast();

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/categories/deleteCategory?id=${categoryId}`, { method: 'DELETE' });
            if (res.ok) {
                toast('✅ Category successfully deleted');
            } else {
                toast('🚫 Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category', error);
        }
    };

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => dialogRef.current?.open()} title="Delete product" />

            <DeleteConfirmationDialog ref={dialogRef} onConfirm={handleDelete} />
        </>
    );
};
