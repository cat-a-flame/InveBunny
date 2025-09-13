'use client';

import { useState } from 'react';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { EditInventoryItemDialog } from './EditInventoryItemDialog';

export type InventoryItemProps = {
    productId: string;
    inventoryId: string;
    productName: string;
    productCategoryName: string;
    productSku: string | null;
    productQuantity: number | null;
    productDetails: string | null;
    onSuccess?: () => void;
};

export function EditInventoryItemButton({
    productId,
    inventoryId,
    productName,
    productCategoryName,
    productSku,
    productQuantity,
    productDetails,
    onSuccess,
}: InventoryItemProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} onClick={() => setOpen(true)} title="Edit" />
            {open && (
                <EditInventoryItemDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    productId={productId}
                    inventoryId={inventoryId}
                    productName={productName}
                    productCategoryName={productCategoryName}
                    productSku={productSku}
                    productQuantity={productQuantity}
                    productDetails={productDetails}
                    onSuccess={onSuccess}
                />
            )}
        </>
    );
}
