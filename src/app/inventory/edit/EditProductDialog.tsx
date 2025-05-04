'use client';

import { Button } from '../../../components/Button/button';
import { Dialog } from '../../../components/Dialog/dialog';
import { useToast } from '../../../components/Toast/toast';
import { useEffect, useState } from 'react';

type Category = {
    id: string;
    category_name: string;
};

type Variant = {
    id: string;
    variant_name: string;
};

type ProductData = {
    id: string;
    product_name: string;
    product_sku: string;
    product_quantity: number;
    product_category: string;
    product_variant: string | null;
    status: boolean;
};

type EditProductDialogProps = {
    open: boolean;
    onClose: () => void;
    product: ProductData;
    categories: Category[];
    variants: Variant[];
    onSuccess?: () => void;
};

export function EditProductDialog({
    open,
    onClose,
    product,
    categories,
    variants,
    onSuccess
}: EditProductDialogProps) {
    const [formData, setFormData] = useState<ProductData>(product);
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (open) {
            setFormData(product);
        }
    }, [open, product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'product_quantity' ? Number(value) :
                name === 'status' ? (e.target as HTMLInputElement).checked :
                    value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/inventory/updateProduct', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: formData.id,
                    product_name: formData.product_name,
                    product_sku: formData.product_sku,
                    product_quantity: formData.product_quantity,
                    product_category: formData.product_category,
                    product_variant: formData.product_variant,
                    product_status: formData.status
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to update product');
            }

            toast('✅ Product updated successfully!');
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            toast(`❌ Error updating product!`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Edit product">
            <form onSubmit={handleSubmit} className="dialog-form">
                <div className="input-group">
                    <label htmlFor="product_name" className="input-label">Product name</label>
                    <input name="product_name" type="text" value={formData.product_name} onChange={handleChange} required />
                </div>

                <div className="double-input-group">
                    <div className="input-grow">
                        <label htmlFor="product_sku" className="input-label">SKU</label>
                        <input name="product_sku" type="text" value={formData.product_sku} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="product_quantity" className="input-label">Quantity</label>
                        <input name="product_quantity" type="number" min="0" value={formData.product_quantity} onChange={handleChange} required />
                    </div>
                </div>

                <div className="double-input-group">
                    <div className="input-equal">
                        <label htmlFor="product_category" className="input-label">Category</label>
                        <select name="product_category" value={formData.product_category} onChange={handleChange} required>
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-equal">
                        <label htmlFor="product_variant" className="input-label">Variant</label>
                        <select name="product_variant" value={formData.product_variant || ''} onChange={handleChange}>
                            <option value="">Select a variant</option>
                            {variants.map((variant) => (
                                <option key={variant.id} value={variant.id}>
                                    {variant.variant_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="status" className="input-label">Status</label>
                    <label className="switch">
                        <input name="status" type="checkbox" checked={formData.status} onChange={handleChange} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="dialog-buttons">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">Save</Button>
                </div>
            </form>
        </Dialog>
    );
}