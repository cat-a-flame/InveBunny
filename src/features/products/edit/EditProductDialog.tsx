'use client';

import { Button } from '../../../components/Button/button';
import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Category = {
    id: string;
    category_name: string;
};

type Inventory = {
    id: string;
    inventory_name: string;
};

type Variant = {
    id: string;
    variant_name: string;
};

type ProductInventoryData = {
    inventory_id: string;
};

type ProductData = {
    id: string;
    product_name: string;
    product_category: string;
    product_variant: string | null;
    product_status: boolean;
    inventories: ProductInventoryData[];
    currentInventoryId?: string;
};

type EditProductDialogProps = {
    open: boolean;
    onClose: () => void;
    product: ProductData;
    categories: Category[];
    variants?: Variant[];
    inventories: Inventory[];
    onSuccess?: () => void;
};

export function EditProductDialog({
    open,
    onClose,
    product,
    categories,
    variants = [],
    inventories,
    onSuccess,
}: EditProductDialogProps) {
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const isMounted = useRef(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (open) {
            isMounted.current = true;
            setTimeout(() => setIsOpen(true), 50);
        } else {
            setIsOpen(false);
            isMounted.current = false;
        }
    }, [open]);

    const [formData, setFormData] = useState({
        product_name: product.product_name || '',
        product_category: product.product_category || '',
        product_variant: product.product_variant || '',
        product_status: product.product_status ?? false,
    });

    const [inventoryEntries, setInventoryEntries] = useState<Array<{ inventoryId: string }>>([]);

    useEffect(() => {
        if (!open) return;

        setFormData({
            product_name: product.product_name || '',
            product_category: product.product_category || '',
            product_variant: product.product_variant || '',
            product_status: product.product_status ?? false,
        });

        const loadInventories = async () => {
            try {
                const res = await fetch(`/api/inventory/productInventories?productId=${product.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const entries = (data.inventories || []).map((inv: any) => ({
                        inventoryId: inv.inventory_id,
                    }));
                    setInventoryEntries(entries.length > 0 ? entries : [{ inventoryId: '' }]);
                } else {
                    const fallback = product.inventories.map(pi => ({
                        inventoryId: pi.inventory_id,
                    }));
                    setInventoryEntries(fallback.length > 0 ? fallback : [{ inventoryId: '' }]);
                }
            } catch {
                const fallback = product.inventories.map(pi => ({
                    inventoryId: pi.inventory_id,
                }));
                setInventoryEntries(fallback.length > 0 ? fallback : [{ inventoryId: '' }]);
            }
        };

        loadInventories();
    }, [open, product, inventories]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: name === 'product_status'
                ? (e.target instanceof HTMLInputElement ? e.target.checked : false)
                : value,
        }));
    };

    const handleInventoryChange = (index: number, field: string, value: string | number) => {
        setInventoryEntries(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addInventoryRow = () => {
        setInventoryEntries(prev => [...prev, { inventoryId: '' }]);
    };

    const removeInventoryRow = (index: number) => {
        setInventoryEntries(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/inventory/updateProductInventories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: product.id,
                    product_name: formData.product_name,
                    product_category: formData.product_category,
                    product_variant: formData.product_variant,
                    product_status: formData.product_status,
                    inventories: inventoryEntries.map(entry => ({
                        inventory_id: entry.inventoryId,
                        product_sku: '',
                        product_quantity: 0,
                    }))
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to update product');
            }

            toast('✅ Product updated successfully!');
            router.refresh();
            onClose();
            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            let errorMessage = 'Error updating product!';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast(`❌ ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }

    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel side-panel-md ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title" id="dialog-title">Edit product</h3>
                </div>

                <form onSubmit={handleSubmit} className="side-panel-form">
                    <div className="side-panel-content">
                        <div className="input-group">
                            <label htmlFor="product_name" className="input-label">Product name</label>
                            <input name="product_name" type="text" className="input-max-width" value={formData.product_name} onChange={handleChange} required />
                        </div>

                        <div className="double-input-group">
                            <div className="input-equal">
                                <label htmlFor="product_category" className="input-label">
                                    Category
                                </label>
                                <select name="product_category" className="input-max-width" value={formData.product_category} onChange={handleChange} required>
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
                                <select name="product_variant" className="input-max-width" value={formData.product_variant} onChange={handleChange}>
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
                            <label htmlFor="product_status" className="input-label">Status</label>
                            <label>
                                <input name="product_status" type="checkbox" checked={formData.product_status} onChange={(e) => setFormData((prev) => ({ ...prev, product_status: e.target.checked, }))} />
                                Product is active
                            </label>
                        </div>

                        <div className="boxed-section">
                            <h4 className="section-subtitle">Inventories</h4>

                            {inventoryEntries.map((entry, index) => (
                                <div key={index} className="double-input-group">
                                    <div>
                                        <label className="input-label">Inventory name</label>
                                        <select value={entry.inventoryId} onChange={e => handleInventoryChange(index, 'inventoryId', e.target.value)} required>
                                            <option value="">Select an inventory</option>
                                            {inventories
                                                .filter(inv =>
                                                    inv.id === entry.inventoryId ||
                                                    !inventoryEntries.some(
                                                        (e, idx) => idx !== index && e.inventoryId === inv.id
                                                    )
                                                )
                                                .map(inv => (
                                                    <option key={inv.id} value={inv.id}>{inv.inventory_name}</option>
                                                ))}
                                        </select>
                                    </div>



                                    {inventoryEntries.length > 1 && (
                                        <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => removeInventoryRow(index)} title="Remove inventory" />
                                    )}
                                </div>
                            ))}

                            <IconButton type="button" icon={<i className="fa-regular fa-plus"></i>} onClick={addInventoryRow} title="Add new inventory" />
                        </div>

                    </div>

                    <div className="side-panel-footer">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={submitting}>Save</Button>
                    </div>
                </form>
            </div>
        </>
    );
}