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

type ProductInventory = {
    id: string;
    inventory_id: string;
    product_id: string;
};

type EditProductButtonProps = {
    id: string;
    product_name: string;
    product_category: string;
    product_variant: string;
    product_status: boolean;
    categories: Array<{ id: string; category_name: string }>;
    variants?: Variant[];
    inventories: Inventory[];
    productInventories: ProductInventory[];
    currentInventoryId?: string;
    onSuccess?: () => void;
};

export function EditProductButton({
    id,
    product_name,
    product_category,
    product_variant,
    product_status,
    categories,
    variants,
    inventories,
    productInventories,
    currentInventoryId,
    onSuccess,
}: EditProductButtonProps) {
    const [open, setOpen] = useState(false);

    const productData = {
        id,
        product_name,
        product_category,
        product_variant,
        product_status,
        inventories: productInventories.map(pi => ({
            inventory_id: pi.inventory_id,
        })),
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