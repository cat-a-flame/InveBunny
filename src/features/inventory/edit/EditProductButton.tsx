'use client';

import { useState } from 'react';
import { EditProductDialog } from './EditProductDialog';
import { IconButton } from '../../../components/IconButton/iconButton';

type Inventory = {
    id: string;
    inventory_name: string;
    is_default?: boolean;
};

type ProductInventory = {
    id: string;
    inventory_id: string;
    product_id: string;
    product_sku: string;
    product_quantity: number;
    product_status: boolean;
};

type EditProductButtonProps = {
    id: string;
    product_name: string;
    product_category: string;
    product_variant: string;
    product_status: boolean;
    product_sku: string;
    product_quantity: number;
    categories: Array<{ id: string; category_name: string }>;
    variants: Array<{ id: string; variant_name: string }>;
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
    product_sku,
    product_quantity,
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
        product_sku,
        product_quantity,
        inventories: productInventories.map(pi => ({
            inventory_id: pi.inventory_id,
            product_sku: pi.product_sku,
            product_quantity: pi.product_quantity,
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