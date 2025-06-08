'use client';

import { AddCategoryDialog } from './AddCategoryDialog';
import { CgMathPlus } from 'react-icons/cg';
import { Button } from '../../../components/Button/button';
import { useState } from 'react';

export function AddButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="cta" onClick={() => setOpen(true)} icon={<CgMathPlus />}>
                Add new category
            </Button>

            {open &&  <AddCategoryDialog open={open} onClose={() => setOpen(false)} /> }
        </>
    );
}
