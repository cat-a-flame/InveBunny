'use client';

import { useState } from 'react';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { EditSupplyCategoryDialog } from './EditSupplyCategoryDialog';

type Props = {
    uuid: string;
    currentName: string;
    onUpdated?: () => void;
};

export function EditSupplyCategoryButton({ uuid, currentName, onUpdated }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} onClick={() => setOpen(true)} title="Edit" />
            {open && (
                <EditSupplyCategoryDialog
                    uuid={uuid}
                    currentName={currentName}
                    open={open}
                    onClose={() => setOpen(false)}
                    onUpdated={onUpdated}
                />
            )}
        </>
    );
}
