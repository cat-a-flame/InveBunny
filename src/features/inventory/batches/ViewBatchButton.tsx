'use client';

import { IconButton } from '../../../components/IconButton/iconButton';
import { useState } from 'react';
import ProductBatchPanel from './ProductBatchPanel';

interface Props {
    productId: string;
}

export function ViewBatchButton({ productId }: Props) {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <IconButton icon={<i className="fa-solid fa-layer-group"></i>} onClick={() => setOpen(true)} title="Batches" />
            {open && (
                <ProductBatchPanel open={open} onClose={handleClose} productId={productId} />
            )}
        </>
    );
}
