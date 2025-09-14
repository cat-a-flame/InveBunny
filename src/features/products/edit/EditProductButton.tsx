'use client';

import { useState } from 'react';
import { EditProductDialog } from './EditProductDialog';
import { IconButton } from '../../../components/IconButton/iconButton';

type Inventory = {
    id: string;
    inventory_name: string;
};

type Variant = {
    id: string;
    variant_name: string;
};

type EditProductButtonProps = {
    id: string;
    product_name: string;
    product_category: string;
    product_status: boolean;
    categories: Array<{ id: string; category_name: string }>;
    variants?: Variant[];
    inventories: Inventory[];
    currentInventoryId?: string;
    onSuccess?: () => void;
};

export function EditProductButton({
    id,
    product_name,
    product_category,
    product_status,
    categories,
    variants,
    inventories,
    currentInventoryId,
    onSuccess,
}: EditProductButtonProps) {
    const [open, setOpen] = useState(false);

    const productData = {
        id,
        product_name,
        product_category,
        product_status,
        currentInventoryId,
    };


    return (
        <>
            <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} onClick={() => setOpen(true)} title="Edit" />

            {open && (
                <EditProductDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    product={productData}
                    categories={categories}
                    variants={variants}
                    inventories={inventories}
                    onSuccess={onSuccess}
                />
            )}
        </>
    );
}