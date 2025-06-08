'use client';

import { AddVariantDialog } from './AddVariantDialog';
import { Button } from '../../../components/Button/button';
import { CgMathPlus } from 'react-icons/cg';
import { useState } from 'react';

export function AddButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="cta" onClick={() => setOpen(true)} icon={<CgMathPlus />}>
                Add new variant
            </Button>

            {open &&  <AddVariantDialog open={open} onClose={() => setOpen(false)} /> }
        </>
    );
}
