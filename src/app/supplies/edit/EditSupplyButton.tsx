'use client';

import { useState } from 'react';
import { EditSupplyDialog } from './EditSupplyDialog';
import { IconButton } from '../../../components/IconButton/iconButton';

type EditSupplyButtonProps = {
    supplyId: string;
    currentName: string;
    currentCategory: string;
};

export function EditSupplyButton({ supplyId, currentName, currentCategory }: EditSupplyButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>}  onClick={() => setOpen(true)} title="Edit" />

            {open && (
                <EditSupplyDialog
                    id={supplyId}
                    currentName={currentName}
                    currentCategory={currentCategory}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
