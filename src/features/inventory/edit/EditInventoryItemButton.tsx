'use client';

import { useState } from 'react';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { EditInventoryItemDialog } from './EditInventoryItemDialog';

export type InventoryItemProps = {
    inventoryItemId: string;
    productName: string;
    productCategoryName: string;
    productSku: string | null;
    productQuantity: number | null;
    productDetails: string | null;
    onSuccess?: () => void;
};

export function EditInventoryItemButton({
    inventoryItemId,
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
                    inventoryItemId={inventoryItemId}
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
