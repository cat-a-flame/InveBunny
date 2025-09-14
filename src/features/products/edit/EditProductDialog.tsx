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

type ProductData = {
    id: string;
    product_name: string;
    product_category: string;
    product_status: boolean;
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
        product_status: product.product_status ?? false,
    });

    const [variantEntries, setVariantEntries] = useState<Array<{
        variantId: string;
        inventoryIds: string[];
    }>>([]);

    useEffect(() => {
        if (!open) return;

        setFormData({
            product_name: product.product_name || '',
            product_category: product.product_category || '',
            product_status: product.product_status ?? false,
        });

        const loadVariants = async () => {
            try {
                const res = await fetch(`/api/products/productVariants?productId=${product.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const entries = (data.variants || []).map((v: any) => ({
                        variantId: v.variant_id,
                        inventoryIds: (v.inventories || []).map((inv: any) => inv.inventory_id),
                    }));
                    setVariantEntries(
                        entries.length > 0 ? entries : [{ variantId: '', inventoryIds: [] }]
                    );
                } else {
                    setVariantEntries([{ variantId: '', inventoryIds: [] }]);
                }
            } catch {
                setVariantEntries([{ variantId: '', inventoryIds: [] }]);
            }
        };

        loadVariants();
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

    const handleVariantChange = (index: number, field: 'variantId' | 'inventoryIds', value: any) => {
        setVariantEntries(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addVariantRow = () => {
        setVariantEntries(prev => [
            ...prev,
            { variantId: '', inventoryIds: [] },
        ]);
    };

    const removeVariantRow = (index: number) => {
        setVariantEntries(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const variantPayload = variantEntries
                .filter(entry => entry.variantId)
                .map(entry => ({
                    variantId: entry.variantId,
                    inventories: (entry.inventoryIds || []).map(invId => ({
                        inventoryId: invId,
                        product_sku: '',
                        product_quantity: 0,
                    })),
                }));

            if (variantPayload.length === 0) {
                toast('❌ At least one variant is required.');
                setSubmitting(false);
                return;
            }

            const response = await fetch('/api/inventory/updateProductInventories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: product.id,
                    product_name: formData.product_name,
                    product_category: formData.product_category,
                    product_status: formData.product_status,
                    variants: variantPayload,
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
            <div className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title" id="dialog-title">Edit product</h3>
                </div>

                <form onSubmit={handleSubmit} className="side-panel-form">
                    <div className="side-panel-content">
                        <div className="input-group">
                            <label htmlFor="product_name" className="input-label">Product name</label>
                            <input name="product_name" type="text" className="input-max-width" value={formData.product_name} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
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

                        <h4 className="section-subtitle">Variants</h4>

                        {variantEntries.map((entry, index) => (
                            <div key={index} className="double-input-group">
                                <select
                                    value={entry.variantId}
                                    className="input-max-width"
                                    onChange={e => handleVariantChange(index, 'variantId', e.target.value)}
                                >
                                    <option value="">Select a variant</option>
                                    {variants.map(variant => (
                                        <option key={variant.id} value={variant.id}>
                                            {variant.variant_name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    multiple
                                    value={entry.inventoryIds}
                                    className="input-max-width"
                                    onChange={(e) =>
                                        handleVariantChange(
                                            index,
                                            'inventoryIds',
                                            Array.from(e.target.selectedOptions, option => option.value)
                                        )
                                    }
                                >
                                    {inventories.map(inv => (
                                        <option key={inv.id} value={inv.id}>{inv.inventory_name}</option>
                                    ))}
                                </select>

                                <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => removeVariantRow(index)} title="Remove variant" disabled={index <= 0 && (true)} />
                            </div>
                        ))}

                        <IconButton type="button" icon={<i className="fa-regular fa-plus"></i>} onClick={addVariantRow} title="Add new variant" />

                        <div className="input-group">
                            <label>
                                <input name="product_status" type="checkbox" checked={formData.product_status} onChange={(e) => setFormData((prev) => ({ ...prev, product_status: e.target.checked, }))} />
                                Product is active
                            </label>
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