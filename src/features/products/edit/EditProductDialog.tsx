'use client';

import { Button } from '../../../components/Button/button';
import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Select, { components, OptionProps, MultiValue } from 'react-select';
import styles from '../add/addproductdialog.module.css';

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

const CheckboxOption = (
    props: OptionProps<{ value: string; label: string }>
) => (
    <components.Option {...props}>
        <input
            type="checkbox"
            checked={props.isSelected}
            onChange={() => null}
            style={{ marginRight: 8 }}
        />
        {props.label}
    </components.Option>
);

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

    const inventoryOptions = inventories.map(inv => ({
        value: inv.id,
        label: inv.inventory_name,
    }));

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
        inventories: Array<{
            inventoryId: string;
            sku: string | null;
            quantity: number;
            details: string | null;
        }>;
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
                        inventories: (v.inventories || []).map((inv: any) => ({
                            inventoryId: inv.inventory_id,
                            sku: inv.product_sku ?? null,
                            quantity: typeof inv.product_quantity === 'number'
                                ? inv.product_quantity
                                : 0,
                            details: inv.product_details ?? null,
                        })),
                    }));
                    setVariantEntries(
                        entries.length > 0 ? entries : [{ variantId: '', inventories: [] }]
                    );
                } else {
                    setVariantEntries([{ variantId: '', inventories: [] }]);
                }
            } catch {
                setVariantEntries([{ variantId: '', inventories: [] }]);
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

    const handleVariantIdChange = (index: number, variantId: string) => {
        setVariantEntries(prev => {
            const updated = [...prev];
            const current = updated[index] ?? { variantId: '', inventories: [] };
            updated[index] = { ...current, variantId };
            return updated;
        });
    };

    const handleInventorySelection = (
        index: number,
        selected: MultiValue<{ value: string; label: string }>
    ) => {
        setVariantEntries(prev => {
            const updated = [...prev];
            const current = updated[index];
            if (!current) return prev;

            const existingMap = new Map(
                (current.inventories || []).map(inv => [inv.inventoryId, inv])
            );

            const selectedIds = selected.map(option => option.value);

            const nextInventories = selectedIds.map(id => {
                const existing = existingMap.get(id);
                return existing
                    ? existing
                    : { inventoryId: id, sku: null, quantity: 0, details: null };
            });

            updated[index] = { ...current, inventories: nextInventories };
            return updated;
        });
    };

    const addVariantRow = () => {
        setVariantEntries(prev => [
            ...prev,
            { variantId: '', inventories: [] },
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
                    inventories: (entry.inventories || []).map(inv => ({
                        inventoryId: inv.inventoryId,
                        sku: inv.sku ?? null,
                        quantity: typeof inv.quantity === 'number' ? inv.quantity : 0,
                        details: inv.details ?? null,
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
                            <div key={index} className={styles['variant-entry']}>
                                <div className="input-group">
                                    <label htmlFor="categoryId" className="input-label">Variant</label>
                                    <select
                                        value={entry.variantId}
                                        className="input-max-width"
                                        onChange={e => handleVariantIdChange(index, e.target.value)}
                                    >
                                        <option value="">Select a variant</option>
                                        {variants.map(variant => (
                                            <option key={variant.id} value={variant.id}>
                                                {variant.variant_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="categoryId" className="input-label">Inventory</label>
                                    <Select
                                        isMulti
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                        classNamePrefix="react-select"
                                        className="input-max-width"
                                        options={inventoryOptions}
                                        components={{ Option: CheckboxOption }}
                                        value={inventoryOptions.filter(opt => entry.inventories.some(inv => inv.inventoryId === opt.value))}
                                        onChange={(selected: MultiValue<{ value: string; label: string }>) =>
                                            handleInventorySelection(index, selected)
                                        }
                                        placeholder="Select inventories"
                                    />

                                    <IconButton
                                        icon={<i className="fa-regular fa-trash-can"></i>}
                                        onClick={() => removeVariantRow(index)}
                                        title="Delete variant"
                                        disabled={variantEntries.length <= 1}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="input-group">
                            <Button type="button" variant="ghost" size="sm" onClick={addVariantRow}>+ Add another variant</Button>
                        </div>

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