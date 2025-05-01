'use client';

import { useState } from 'react';
import { EditSupplyDialog } from './EditSupplyDialog';
import { IconButton } from '../../../components/IconButton/iconButton';

type Props = {
    supplyId: string;
    currentName: string;
    currentCategory: string;
};

export function EditSupplyButton({ supplyId, currentName, currentCategory }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} onClick={() => setOpen(true)} title="Edit" />

            {open && (
                <EditSupplyDialog
                    id={supplyId}
                    currentName={currentName}
                    currentCategory={currentCategory}
                    open={open}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
