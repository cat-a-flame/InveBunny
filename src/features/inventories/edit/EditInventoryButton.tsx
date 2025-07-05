'use client';

import { useState } from 'react';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { EditInventoryDialog } from './EditInventoryDialog';

type Props = {
    inventoryId: string;
    currentName: string;
};

export function EditInventoryButton({ inventoryId, currentName }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} onClick={() => setOpen(true)} title="Edit" />
            {open && (
                <EditInventoryDialog id={inventoryId} currentName={currentName} open={open} onClose={() => setOpen(false)} />
            )}
        </>
    );
}
