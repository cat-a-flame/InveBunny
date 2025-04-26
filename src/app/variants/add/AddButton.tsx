'use client';

import { useRef } from 'react';
import { CgMathPlus } from 'react-icons/cg';
import { Button } from '../../../components/Button/button';
import { AddVariantDialog } from './AddVariantDialog';

export function AddButton() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const openDialog = () => dialogRef.current?.showModal();

    return (
        <>
            <Button variant="cta" onClick={openDialog} icon={<CgMathPlus />}>
                Add new variant
            </Button>

            <AddVariantDialog dialogRef={dialogRef} />
        </>
    );
}
