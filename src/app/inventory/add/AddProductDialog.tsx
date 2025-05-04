'use client';

import { useState } from 'react';
import { Button } from '../../../components/Button/button';
import { Dialog } from '../../../components/Dialog/dialog';
import { useToast } from '../../../components/Toast/toast';

type Category = {
    id: string;
    category_name: string;
};

type Variant = {
    id: string;
    variant_name: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    variants?: Variant[];
};

export function AddProductDialog({ open, onClose, categories = [], variants = [] }: Props) {
    const [formData, setFormData] = useState({
        productName: '',
        sku: '',
        quantity: 0,
        categoryId: '',
        variantId: '',
        status: true,
    });
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/inventory/addNewProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_name: formData.productName,
                    product_sku: formData.sku,
                    product_quantity: formData.quantity,
                    product_category: formData.categoryId,
                    product_variant: formData.variantId,
                    product_status: formData.status,
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to create product');
            }

            toast('✅ Product created successfully!');
            onClose();
            setFormData({
                productName: '',
                sku: '',
                quantity: 0,
                categoryId: '',
                variantId: '',
                status: true
            });

        } catch (error) {
            console.error('Error:', error);
            toast(`❌ Failed to create product.`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Add new product">
            <form onSubmit={handleSubmit} className="dialog-form">
                <div className="input-group">
                    <label htmlFor="productName" className="input-label">Product name</label>
                    <input name="productName" type="text" value={formData.productName} onChange={handleChange} required />
                </div>

                <div className="double-input-group">
                    <div className="input-group">
                        <label htmlFor="sku" className="input-label">SKU</label>
                        <input name="sku" type="text" value={formData.sku} onChange={handleChange} required />
                    </div>

                    <div className="input-grow">
                        <label htmlFor="quantity" className="input-label">Quantity</label>
                        <input name="quantity" type="number" min="0" max="1024" value={formData.quantity} onChange={handleChange} required />
                    </div>
                </div>

                <div className="double-input-group">
                    <div className="input-equal">
                        <label htmlFor="categoryId" className="input-label">Category</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-equal">
                        <label htmlFor="variantId" className="input-label">Variant</label>
                        <select name="variantId" value={formData.variantId} onChange={handleChange} required>
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
                    <label className="input-label">Status</label>
                    <label className="switch">
                        <input type="checkbox" checked={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked }))} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="dialog-buttons">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">Create</Button>
                </div>
            </form>
        </Dialog>
    );
}