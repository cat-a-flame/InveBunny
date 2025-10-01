'use client';

import { useState } from 'react';
import { EditSupplyDialog } from './EditSupplyDialog';
import { IconButton } from '../../../components/IconButton/iconButton';

type Props = {
    supplyId: string;
    currentName: string;
    currentCategoryId: string;
    currentQuantity: number | null;
};

export function EditSupplyButton({ supplyId, currentName, currentCategoryId, currentQuantity }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} onClick={() => setOpen(true)} title="Edit" />

            {open && (
                <EditSupplyDialog
                    id={supplyId}
                    currentName={currentName}
                    currentCategoryId={currentCategoryId}
                    currentQuantity={currentQuantity ?? 0}
                    open={open}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
