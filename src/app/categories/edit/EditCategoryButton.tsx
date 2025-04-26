'use client';

import { useState } from 'react';
import { EditCategoryDialog } from './EditCategoryDialog';
import { IconButton } from '../../../components/IconButton/iconButton';

type EditCategoryButtonProps = {
    categoryId: string;
    currentName: string;
};

export function EditCategoryButton({ categoryId, currentName }: EditCategoryButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>}  onClick={() => setOpen(true)} title="Edit" />

            {open && (
                <EditCategoryDialog
                    id={categoryId}
                    currentName={currentName}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
