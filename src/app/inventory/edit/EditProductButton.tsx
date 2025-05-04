'use client';

import { useState } from 'react';
import { EditProductDialog } from './EditProductDialog';
import { IconButton } from '../../../components/IconButton/iconButton';

type EditProductButtonProps = {
    id: string;
    product_name: string;
    product_sku: string;
    product_quantity: number;
    product_category: string; // ✅ this is now the category ID
    product_variant: string;  // ✅ this is now the variant ID
    product_status: boolean;
    categories: Array<{ id: string; category_name: string }>;
    variants: Array<{ id: string; variant_name: string }>;
    onSuccess?: () => void;
  };
  

export function EditProductButton({
    id,
    product_name,
    product_sku,
    product_quantity,
    product_category,
    product_variant,
    product_status,
    categories,
    variants,
    onSuccess
}: EditProductButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton 
                icon={<i className="fa-regular fa-pen-to-square"></i>}  
                onClick={() => setOpen(true)} 
                title="Edit" 
            />

            {open && (
                <EditProductDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    product={{
                        id,
                        product_name,
                        product_sku,
                        product_quantity,
                        product_category,
                        product_variant,
                        product_status: product_status
                    }}
                    categories={categories}
                    variants={variants}
                    onSuccess={onSuccess}
                />
            )}
        </>
    );
}