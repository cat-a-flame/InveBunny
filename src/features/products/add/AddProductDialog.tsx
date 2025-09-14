'use client';

import { Button } from '../../../components/Button/button';
import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Select, { components, OptionProps, MultiValue } from 'react-select';
import styles from './addproductdialog.module.css';

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
        status: true
    });

    const [variantEntries, setVariantEntries] = useState([
        { variantId: '', inventoryIds: [] as string[] }
    ]);

    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            { variantId: '', inventoryIds: [] }
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
                        sku: '',
                        quantity: 0,
                    }))
                }));

            if (variantPayload.length === 0) {
                toast('❌ At least one variant is required.');
                setSubmitting(false);
                return;
            }
            const response = await fetch('/api/products/addNewProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: formData.productName,
                    product_category: formData.categoryId,
                    product_status: formData.status,
                    variants: variantPayload
                })
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
                status: true
            });
            setVariantEntries([{ variantId: '', inventoryIds: [] }]);

        } catch (error) {
            console.error('Error:', error);
            toast(`❌ Failed to create product.`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title" id="dialog-title">Add new product</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>

                <form onSubmit={handleSubmit} className="side-panel-form">
                    <div className="side-panel-content">
                        <div className="input-group">
                            <label htmlFor="productName" className="input-label">Product name</label>
                            <input name="productName" type="text" className="input-max-width" value={formData.productName} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label htmlFor="categoryId" className="input-label">Category</label>
                            <select name="categoryId" className="input-max-width" value={formData.categoryId} onChange={handleChange} required>
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                                />
                                Product is active
                            </label>
                        </div>

                        {variantEntries.map((entry, index) => (
                            <div key={index} className={styles['variant-entry']}>
                                <div className="input-group">
                                    <label htmlFor="categoryId" className="input-label">Variant</label>
                                    <select
                                        value={entry.variantId}
                                        className="input-max-width"
                                        onChange={(e) => handleVariantChange(index, 'variantId', e.target.value)}>
                                        <option value="">Select a variant</option>
                                        {variants.map((variant) => (
                                            <option key={variant.id} value={variant.id}>{variant.variant_name}</option>
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
                                        value={inventoryOptions.filter(opt => entry.inventoryIds.includes(opt.value))}
                                        onChange={(selected: MultiValue<{ value: string; label: string }>) =>
                                            handleVariantChange(
                                                index,
                                                'inventoryIds',
                                                selected.map(s => s.value)
                                            )
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
                    </div>

                    <div className="side-panel-footer">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={submitting}>Add product</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
