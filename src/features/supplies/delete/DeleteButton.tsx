'use client';

import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

type Props = {
    supplyId: string;
    supplyName: string;
};

export const DeleteButton = ({ supplyId, supplyName }: Props) => {
    const [open, setOpen] = useState(false);
    const toast = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/supplies/deleteSupply?id=${supplyId}`, { method: 'DELETE' });
            if (res.ok) {
                toast('✅ Supply successfully deleted');
                router.refresh();
            } else {
                toast('🚫 Failed to delete supply');
            }
        } catch (error) {
            console.error('Error deleting supply', error);
        }
    };

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => setOpen(true)} title="Delete supply" />
            {open && (
                <DeleteConfirmationDialog open={open} onClose={() => setOpen(false)} onConfirm={handleDelete} supplyName={supplyName} />
            )}
        </>
    );
};
