// components/add/AddButton.tsx
'use client';

import { AddProductDialog } from './AddProductDialog';
import { Button } from '../../../components/Button/button';
import { CgMathPlus } from 'react-icons/cg';
import { useState } from 'react';

type Category = {
    id: string;
    category_name: string;
    inventory_name?: string;
    product_sku: string
};

type Props = {
    categories: Category[];
    variants?: any[];
    inventories?: any[];
};

export function AddButton({ categories, variants, inventories }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="cta"
                onClick={() => setOpen(true)}
                icon={<CgMathPlus />}
            >
                Add new product
            </Button>
            {open && (
                <AddProductDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    categories={categories}
                    variants={variants}
                    inventories={inventories ?? []}
                />
            )}
        </>
    );
}