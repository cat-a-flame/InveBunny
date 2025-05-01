'use client';

import { AddSupplyDialog } from './AddSupplyDialog';
import { Button } from '../../../components/Button/button';
import { CgMathPlus } from 'react-icons/cg';
import { useState } from 'react';

export function AddButton() {
    const [open, setOpen] = useState(false);

    return (
        <>        
            <Button variant="cta" onClick={() => setOpen(true)} icon={<CgMathPlus />}>Add new supply</Button>
            {open && <AddSupplyDialog open={open} onClose={() => setOpen(false)} />}
        </>
    );
}
