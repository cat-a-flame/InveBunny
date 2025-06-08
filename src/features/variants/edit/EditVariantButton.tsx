'use client';

import { useState } from 'react';
import { EditVariantDialog } from './EditVariantDialog';
import { IconButton } from '../../../components/IconButton/iconButton';

type EditVariantButtonProps = {
    variantId: string;
    currentName: string;
};

export function EditVariantButton({ variantId, currentName }: EditVariantButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>}  onClick={() => setOpen(true)} title="Edit" />

            {open && (
                <EditVariantDialog
                    id={variantId}
                    currentName={currentName}
                    open={open}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
