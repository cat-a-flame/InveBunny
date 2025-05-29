'use client';

import { Button } from '../../../components/Button/button';
import { Dialog } from '../../../components/Dialog/dialog';
import { useToast } from '../../../components/Toast/toast';
import { useState } from 'react';

type Category = {
    id: string;
    category_name: string;
};

type Variant = {
    id: string;
    variant_name: string;
};

type Inventory = {
    id: string;
    inventory_name: string;
    is_default?: boolean;
};

type Props = {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    variants?: Variant[];
    inventories: Inventory[];
};

export function AddProductDialog({ open, onClose, categories = [], variants = [], inventories = [] }: Props) {
    const [formData, setFormData] = useState({
        productName: '',
        categoryId: '',
        variantId: '',
        status: true
    });

    const [inventoryEntries, setInventoryEntries] = useState([
        { inventoryId: '', quantity: 0, status: true, sku: '' }
    ]);

    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInventoryChange = (index: number, field: string, value: string | number | boolean) => {
        setInventoryEntries(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addInventoryRow = () => {
        setInventoryEntries(prev => [...prev, { inventoryId: '', quantity: 0, status: true, sku: '' }]);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/inventory/addNewProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: formData.productName,
                    product_category: formData.categoryId,
                    product_variant: formData.variantId,
                    product_status: formData.status,
                    inventories: inventoryEntries
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
                categoryId: '',
                variantId: '',
                status: true
            });
            setInventoryEntries([{ inventoryId: '', quantity: 0, status: true, sku: '' }]);

        } catch (error) {
            console.error('Error:', error);
            toast(`❌ Failed to create product.`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Add new product" size="md">
            <form onSubmit={handleSubmit} className="dialog-form">
                <div className="input-group">
                    <label htmlFor="productName" className="input-label">Product name</label>
                    <input name="productName" type="text" value={formData.productName} onChange={handleChange} required />
                </div>

                <div className="double-input-group">
                    <div className="input-equal">
                        <label htmlFor="categoryId" className="input-label">Category</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-equal">
                        <label htmlFor="variantId" className="input-label">Variant</label>
                        <select name="variantId" value={formData.variantId} onChange={handleChange} required>
                            <option value="">Select a variant</option>
                            {variants.map((variant) => (
                                <option key={variant.id} value={variant.id}>{variant.variant_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label>
                        <input type="checkbox" checked={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))} />
                        Product is active
                    </label>
                </div>

                {inventoryEntries.map((entry, index) => (
                    <div key={index} className="double-input-group">
                        <div className="input-group-wrapper">
                            <label className="input-label">Inventory</label>
                            <select value={entry.inventoryId} onChange={(e) => handleInventoryChange(index, 'inventoryId', e.target.value)} required>
                                <option value="">Select an inventory</option>
                                {[...inventories]
                                    .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
                                    .map((inv) => (
                                        <option key={inv.id} value={inv.id}>{inv.inventory_name}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="input-group-wrapper">
                            <label className="input-label">SKU</label>
                            <input type="text" value={entry.sku} onChange={(e) => handleInventoryChange(index, 'sku', e.target.value)} required />
                        </div>

                        <div className="input-group-wrapper input-group-quantity">
                            <label className="input-label">Quantity</label>
                            <input type="number" min="0" value={entry.quantity} onChange={(e) => handleInventoryChange(index, 'quantity', Number(e.target.value))} required />
                        </div>
                    </div>
                ))}

                <Button type="button" variant="ghost" size="sm" onClick={addInventoryRow}>Add inventory</Button>

                <div className="dialog-buttons">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={submitting}>Add product</Button>
                </div>
            </form>
        </Dialog>
    );
}
