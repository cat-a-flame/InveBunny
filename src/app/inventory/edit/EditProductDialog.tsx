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

type Inventory = {
    id: string;
    inventory_name: string;
};

type ProductInventoryData = {
    product_sku: string;
    product_quantity: number;
    inventory_id: string;
};

type ProductData = {
    id: string;
    product_name: string;
    product_category: string;
    product_variant: string | null;
    product_status: boolean;
    product_sku: string;
    product_quantity: number;
    inventories: ProductInventoryData[];
    currentInventoryId?: string;
};

type EditProductDialogProps = {
    open: boolean;
    onClose: () => void;
    product: ProductData;
    categories: Category[];
    variants: Variant[];
    inventories: Inventory[];
    onSuccess?: () => void;
};

export function EditProductDialog({
    open,
    onClose,
    product,
    categories,
    variants,
    inventories,
    onSuccess,
}: EditProductDialogProps) {
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    // Initialize selected inventory with current inventory or first available
    const [selectedInventoryId, setSelectedInventoryId] = useState(
        product.currentInventoryId || product.inventories[0]?.inventory_id || inventories[0]?.id || ''
    );

    // Find the initial inventory data
    const initialInventoryData = product.inventories.find(
        pi => pi.inventory_id === selectedInventoryId
    ) || {
        product_sku: product.product_sku,
        product_quantity: product.product_quantity,
    };

    const [formData, setFormData] = useState({
        product_name: product.product_name || '',
        product_category: product.product_category || '',
        product_variant: product.product_variant || '',
        product_status: product.product_status ?? false,
        product_sku: initialInventoryData.product_sku,
        product_quantity: initialInventoryData.product_quantity,
    });

    useEffect(() => {
        if (open) {
            const defaultInventoryId = product.currentInventoryId ||
                inventories[0]?.id || '';
            setSelectedInventoryId(defaultInventoryId);

            const selectedInventory = product.inventories.find(
                pi => pi.inventory_id === defaultInventoryId
            ) || {
                product_sku: product.product_sku,
                product_quantity: product.product_quantity,
                inventory_id: defaultInventoryId
            };

            setFormData({
                product_name: product.product_name || '',
                product_category: product.product_category || '',
                product_variant: product.product_variant || '',
                product_status: product.product_status ?? false,
                product_sku: selectedInventory.product_sku,
                product_quantity: selectedInventory.product_quantity,
            });
        }
    }, [open, product, inventories]);

    // Update form data when selected inventory changes
    useEffect(() => {
        const selectedInventory = product.inventories.find(
            pi => pi.inventory_id === selectedInventoryId
        ) || {
            product_sku: product.product_sku,
            product_quantity: product.product_quantity,
        };

        setFormData(prev => ({
            ...prev,
            product_sku: selectedInventory.product_sku,
            product_quantity: selectedInventory.product_quantity,
        }));
    }, [selectedInventoryId, product.inventories]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'selectedInventoryId') {
            setSelectedInventoryId(value);
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: name === 'product_quantity' ? Number(value) : name === 'product_status' ? (e.target instanceof HTMLInputElement ? e.target.checked : false) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/inventory/updateProduct', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: product.id,
                    product_name: formData.product_name,
                    product_category: formData.product_category,
                    product_variant: formData.product_variant,
                    product_status: formData.product_status,
                    inventory_id: selectedInventoryId,
                    current_inventory_id: product.currentInventoryId,
                    product_sku: formData.product_sku,
                    product_quantity: formData.product_quantity,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to update product');
            }

            toast('✅ Product updated successfully!');
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            toast(`❌ ${error.message || 'Error updating product!'}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Edit product">
            <form onSubmit={handleSubmit} className="dialog-form">
                <div className="input-group">
                    <label htmlFor="product_name" className="input-label">
                        Product name
                    </label>
                    <input name="product_name" type="text" value={formData.product_name} onChange={handleChange} required />
                </div>

                <div className="double-input-group">
                    <div className="input-grow">
                        <label htmlFor="selectedInventoryId" className="input-label">
                            Inventory
                        </label>
                        <select name="selectedInventoryId" value={selectedInventoryId} onChange={handleChange} required>
                            {inventories.map(inv => (
                                <option key={inv.id} value={inv.id}>
                                    {inv.inventory_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="double-input-group">
                    <div className="input-grow">
                        <label htmlFor="product_sku" className="input-label">
                            SKU
                        </label>
                        <input name="product_sku" type="text" value={formData.product_sku} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="product_quantity" className="input-label">
                            Quantity
                        </label>
                        <input name="product_quantity" type="number" min="0" value={formData.product_quantity} onChange={handleChange} required />
                    </div>
                </div>

                <div className="double-input-group">
                    <div className="input-equal">
                        <label htmlFor="product_category" className="input-label">
                            Category
                        </label>
                        <select name="product_category" value={formData.product_category} onChange={handleChange} required>
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-equal">
                        <label htmlFor="product_variant" className="input-label">
                            Variant
                        </label>
                        <select name="product_variant" value={formData.product_variant || ''} onChange={handleChange}>
                            <option value="">Select a variant</option>
                            {variants.map(variant => (
                                <option key={variant.id} value={variant.id}>
                                    {variant.variant_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="product_status" className="input-label">
                        Status
                    </label>
                    <label>
                        <input name="product_status" type="checkbox" checked={formData.product_status} onChange={(e) => setFormData((prev) => ({ ...prev, product_status: e.target.checked, }))} />
                        Product is active
                    </label>
                </div>

                <div className="dialog-buttons">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={submitting}>Save</Button>
                </div>
            </form>
        </Dialog>
    );
}