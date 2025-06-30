'use client';

import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

type Props = {
    categoryId: string;
    categoryName: string;
};

export const DeleteButton = ({ categoryId, categoryName }: Props) => {
    const [open, setOpen] = useState(false);
    const toast = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/categories/deleteCategory?id=${categoryId}`, { method: 'DELETE' });
            if (res.ok) {
                toast('✅ Category successfully deleted');
                router.refresh();
            } else {
                toast('🚫 Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category', error);
        }
    };

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => setOpen(true)} title="Delete product" />
            {open && ( <DeleteConfirmationDialog open={open} onClose={() => setOpen(false)} onConfirm={handleDelete} categoryName={categoryName}  /> )}
        </>
    );
};
