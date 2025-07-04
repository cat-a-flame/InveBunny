'use client';

import { IconButton } from '../../../components/IconButton/iconButton';
import { useState } from 'react';
import ProductBatchPanel from './ProductBatchPanel';
import EditProductBatchPanel, { ProductBatch } from './EditProductBatchPanel';

interface Props {
    productId: string;
}

export function ViewBatchButton({ productId }: Props) {
    const [openList, setOpenList] = useState(false);
    const [editBatch, setEditBatch] = useState<ProductBatch | null>(null);

    const handleCloseList = () => {
        setOpenList(false);
    };

    const handleEdit = (batch: ProductBatch) => {
        setOpenList(false);
        setEditBatch(batch);
    };

    return (
        <>
            <IconButton icon={<i className="fa-solid fa-layer-group"></i>} onClick={() => setOpenList(true)} title="Batches" />
            {openList && (
                <ProductBatchPanel open={openList} onClose={handleCloseList} productId={productId} onEditBatch={handleEdit} />
            )}
            {editBatch && (
                <EditProductBatchPanel
                    open={true}
                    onClose={() => setEditBatch(null)}
                    batch={editBatch}
                    onUpdated={() => {
                        setEditBatch(null);
                        setOpenList(true);
                    }}
                />
            )}
        </>
    );
}
