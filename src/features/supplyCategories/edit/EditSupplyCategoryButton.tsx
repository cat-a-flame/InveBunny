'use client';

import { useState } from 'react';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { EditSupplyCategoryDialog } from './EditSupplyCategoryDialog';

type Props = {
    id: string;
    currentName: string;
    onUpdated?: () => void;
};

export function EditSupplyCategoryButton({ id, currentName, onUpdated }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} onClick={() => setOpen(true)} title="Edit" />
            {open && (
                <EditSupplyCategoryDialog
                    id={id}
                    currentName={currentName}
                    open={open}
                    onClose={() => setOpen(false)}
                    onUpdated={onUpdated}
                />
            )}
        </>
    );
}
