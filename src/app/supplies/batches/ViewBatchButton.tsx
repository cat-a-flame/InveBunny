"use client";

import { IconButton } from '../../../components/IconButton/iconButton';
import { useState } from 'react';
import SupplyBatchPanel from './SupplyBatchPanel';

type ViewBatchButtonProps = {
    supplyId: string;
};

export function ViewBatchButton({ supplyId }: ViewBatchButtonProps) {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <IconButton icon={<i className="fa-solid fa-layer-group"></i>}  onClick={() => setOpen(true)} title="Batches" />

            {open && (
                <SupplyBatchPanel open={open} onClose={handleClose} supplyId={supplyId} />
            )}
        </>
    );
}
