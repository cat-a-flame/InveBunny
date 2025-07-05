'use client';

import { useState } from 'react';
import { Button } from '@/src/components/Button/button';
import { CgMathPlus } from 'react-icons/cg';
import { AddInventoryDialog } from './AddInventoryDialog';

export function AddButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="cta" onClick={() => setOpen(true)} icon={<CgMathPlus />}>Add new inventory</Button>
            {open && <AddInventoryDialog open={open} onClose={() => setOpen(false)} />}
        </>
    );
}
