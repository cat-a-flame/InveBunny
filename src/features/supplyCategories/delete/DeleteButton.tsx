'use client';

import { useState } from 'react';
import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

type Props = {
    categoryId: string;
    categoryName: string;
    onDeleted?: () => void;
};

export const DeleteButton = ({ categoryId, categoryName, onDeleted }: Props) => {
    const [open, setOpen] = useState(false);
    const toast = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/supplyCategories/deleteCategory?uuid=${categoryId}`, { method: 'DELETE' });
            if (res.ok) {
                toast('✅ Category successfully deleted');
                router.refresh();
                onDeleted && onDeleted();
            } else {
                toast('🚫 Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category', error);
        }
    };

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => setOpen(true)} title="Delete category" />
            {open && (
                <DeleteConfirmationDialog open={open} onClose={() => setOpen(false)} onConfirm={handleDelete} categoryName={categoryName} />
            )}
        </>
    );
};
