'use client';

import { Button } from '../../../components/Button/button';
import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Category = { id: string; category_name: string };
type Inventory = { id: string; inventory_name: string };
type Variant = { id: string; variant_name: string };

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
        status: true,
        details: '',
    });
    const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
    const [selectedInventories, setSelectedInventories] = useState<string[]>([]);
    const [variantInventoryData, setVariantInventoryData] =
        useState<Record<string, Record<string, { sku: string; quantity: number }>>>({});
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleVariantsSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(e.target.selectedOptions).map(o => o.value);
        setSelectedVariants(values);
    };

    const handleInventoriesSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(e.target.selectedOptions).map(o => o.value);
        setSelectedInventories(values);
    };

    const handleVariantInventoryChange = (
        variantId: string,
        inventoryId: string,
        field: 'sku' | 'quantity',
        value: string | number,
    ) => {
        setVariantInventoryData(prev => ({
            ...prev,
            [variantId]: {
                ...prev[variantId],
                [inventoryId]: {
                    ...prev[variantId]?.[inventoryId],
                    [field]: value,
                },
            },
        }));
    };

    useEffect(() => {
        setVariantInventoryData(prev => {
            const updated: Record<string, Record<string, { sku: string; quantity: number }>> = {};
            selectedVariants.forEach(variantId => {
                updated[variantId] = {};
                selectedInventories.forEach(invId => {
                    updated[variantId][invId] = prev[variantId]?.[invId] || { sku: '', quantity: 0 };
                });
            });
            return updated;
        });
    }, [selectedVariants, selectedInventories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payloadVariants = selectedVariants.map(variantId => ({
                variant_id: variantId,
                inventories: selectedInventories.map(invId => ({
                    inventory_id: invId,
                    product_sku: variantInventoryData[variantId]?.[invId]?.sku || '',
                    product_quantity: Number(
                        variantInventoryData[variantId]?.[invId]?.quantity || 0,
                    ),
                })),
            }));

            const response = await fetch('/api/products/addNewProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: formData.productName,
                    product_category: formData.categoryId,
                    product_status: formData.status,
                    product_details: formData.details,
                    variants: payloadVariants,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to create product');
            }

            toast('✅ Product created successfully!');
            router.refresh();
            onClose();
            setFormData({
                productName: '',
                categoryId: '',
                status: true,
                details: '',
            });
            setSelectedVariants([]);
            setSelectedInventories([]);
            setVariantInventoryData({});
        } catch (error) {
            console.error('Error:', error);
            toast('❌ Failed to create product.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div
                className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-labelledby="dialog-title"
            >
                <div className="side-panel-header">
                    <h3 className="side-panel-title" id="dialog-title">
                        Add new product
                    </h3>
                    <IconButton
                        icon={<i className="fa-solid fa-close"></i>}
                        onClick={onClose}
                        title="Close panel"
                    />
                </div>

                <form onSubmit={handleSubmit} className="side-panel-form">
                    <div className="side-panel-content">
                        <div className="input-group">
                            <label htmlFor="productName" className="input-label">
                                Product name
                            </label>
                            <input
                                name="productName"
                                type="text"
                                className="input-max-width"
                                value={formData.productName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="double-input-group">
                            <div className="input-equal">
                                <label htmlFor="categoryId" className="input-label">
                                    Category
                                </label>
                                <select
                                    name="categoryId"
                                    className="input-max-width"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.category_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-equal">
                                <label htmlFor="variants" className="input-label">
                                    Variants
                                </label>
                                <select
                                    multiple
                                    name="variants"
                                    className="input-max-width"
                                    value={selectedVariants}
                                    onChange={handleVariantsSelect}
                                >
                                    {variants.map(variant => (
                                        <option key={variant.id} value={variant.id}>
                                            {variant.variant_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="details" className="input-label">
                                Details
                            </label>
                            <textarea
                                name="details"
                                className="input-max-width"
                                value={formData.details}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.status}
                                    onChange={e =>
                                        setFormData(prev => ({
                                            ...prev,
                                            status: e.target.checked,
                                        }))
                                    }
                                />
                                Product is active
                            </label>
                        </div>

                        <div className="input-group">
                            <label htmlFor="inventories" className="input-label">
                                Inventories
                            </label>
                            <select
                                multiple
                                name="inventories"
                                className="input-max-width"
                                value={selectedInventories}
                                onChange={handleInventoriesSelect}
                            >
                                {inventories.map(inv => (
                                    <option key={inv.id} value={inv.id}>
                                        {inv.inventory_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedVariants.map(variantId => (
                            <div key={variantId} className="variant-section">
                                <h4 className="section-subtitle">
                                    {variants.find(v => v.id === variantId)?.variant_name}
                                </h4>
                                {selectedInventories.map(invId => (
                                    <div key={invId} className="double-input-group">
                                        <div className="input-equal">
                                            <label className="input-label">
                                                SKU (
                                                {
                                                    inventories.find(i => i.id === invId)?.inventory_name
                                                }
                                                )
                                            </label>
                                            <input
                                                type="text"
                                                className="input-max-width"
                                                value={
                                                    variantInventoryData[variantId]?.[invId]?.sku || ''
                                                }
                                                onChange={e =>
                                                    handleVariantInventoryChange(
                                                        variantId,
                                                        invId,
                                                        'sku',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="input-equal">
                                            <label className="input-label">Quantity</label>
                                            <input
                                                type="number"
                                                className="input-max-width"
                                                value={
                                                    variantInventoryData[variantId]?.[invId]
                                                        ?.quantity || 0
                                                }
                                                onChange={e =>
                                                    handleVariantInventoryChange(
                                                        variantId,
                                                        invId,
                                                        'quantity',
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="side-panel-footer">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={submitting}>
                            Add product
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

