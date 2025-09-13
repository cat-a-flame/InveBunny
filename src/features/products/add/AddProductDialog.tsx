'use client';

import { Button } from '../../../components/Button/button';
import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useState, useEffect, useRef } from 'react';
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
    });

    const [variantEntries, setVariantEntries] = useState([
        {
            variantId: '',
            inventories: [
                { inventoryId: '', sku: '', quantity: 0, details: '' }
            ]
        }
    ]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVariantChange = (index: number, value: string) => {
        setVariantEntries(prev => {
            const updated = [...prev];
            updated[index].variantId = value;
            return updated;
        });
    };

    const addVariantRow = () => {
        setVariantEntries(prev => [
            ...prev,
            { variantId: '', inventories: [{ inventoryId: '', sku: '', quantity: 0, details: '' }] }
        ]);
    };

    const removeVariantRow = (index: number) => {
        setVariantEntries(prev => prev.filter((_, i) => i !== index));
    };

    const handleVariantInventoryChange = (
        vIndex: number,
        iIndex: number,
        field: string,
        value: string | number
    ) => {
        setVariantEntries(prev => {
            const updated = [...prev];
            const inventories = [...updated[vIndex].inventories];
            inventories[iIndex] = { ...inventories[iIndex], [field]: value };
            updated[vIndex].inventories = inventories;
            return updated;
        });
    };

    const addInventoryRow = (vIndex: number) => {
        setVariantEntries(prev => {
            const updated = [...prev];
            updated[vIndex].inventories = [
                ...updated[vIndex].inventories,
                { inventoryId: '', sku: '', quantity: 0, details: '' }
            ];
            return updated;
        });
    };

    const removeInventoryRow = (vIndex: number, iIndex: number) => {
        setVariantEntries(prev => {
            const updated = [...prev];
            updated[vIndex].inventories = updated[vIndex].inventories.filter((_, idx) => idx !== iIndex);
            return updated;
        });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/products/addNewProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: formData.productName,
                    product_category: formData.categoryId,
                    product_status: formData.status,
                    variants: variantEntries.map(v => ({
                        variant_id: v.variantId,
                        inventories: v.inventories.map(inv => ({
                            inventory_id: inv.inventoryId,
                            sku: inv.sku,
                            quantity: inv.quantity,
                            details: inv.details,
                        }))
                    }))
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
            setVariantEntries([
                {
                    variantId: '',
                    inventories: [{ inventoryId: '', sku: '', quantity: 0, details: '' }]
                }
            ]);

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
                                <input type="checkbox" checked={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))} />
                                Product is active
                            </label>
                        </div>

                        <h3 className="section-subtitle">Variants</h3>

                        {variantEntries.map((variant, vIndex) => (
                            <div key={vIndex} className="variant-block">
                                <div className="double-input-group">
                                    <select className="input-max-width" value={variant.variantId} onChange={(e) => handleVariantChange(vIndex, e.target.value)} required>
                                        <option value="">Select a variant</option>
                                        {variants.map(v => (
                                            <option key={v.id} value={v.id}>{v.variant_name}</option>
                                        ))}
                                    </select>
                                    <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => removeVariantRow(vIndex)} title="Remove variant" disabled={vIndex === 0 && variantEntries.length === 1} />
                                </div>

                                {variant.inventories.map((inv, iIndex) => (
                                    <div key={iIndex} className="multi-input-group">
                                        <select className="input-max-width" value={inv.inventoryId} onChange={(e) => handleVariantInventoryChange(vIndex, iIndex, 'inventoryId', e.target.value)} required>
                                            <option value="">Select an inventory</option>
                                            {inventories.map(invOpt => (
                                                <option key={invOpt.id} value={invOpt.id}>{invOpt.inventory_name}</option>
                                            ))}
                                        </select>
                                        <input type="text" className="input-max-width" placeholder="SKU" value={inv.sku} onChange={(e) => handleVariantInventoryChange(vIndex, iIndex, 'sku', e.target.value)} />
                                        <input type="number" className="input-max-width" placeholder="Quantity" value={inv.quantity} onChange={(e) => handleVariantInventoryChange(vIndex, iIndex, 'quantity', Number(e.target.value))} />
                                        <input type="text" className="input-max-width" placeholder="Details" value={inv.details} onChange={(e) => handleVariantInventoryChange(vIndex, iIndex, 'details', e.target.value)} />
                                        <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => removeInventoryRow(vIndex, iIndex)} title="Remove inventory" disabled={iIndex === 0 && variant.inventories.length === 1} />
                                    </div>
                                ))}

                                <IconButton type="button" icon={<i className="fa-regular fa-plus"></i>} onClick={() => addInventoryRow(vIndex)} title="Add inventory" />
                            </div>
                        ))}

                        <IconButton type="button" icon={<i className="fa-regular fa-plus"></i>} onClick={addVariantRow} title="Add variant" />
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
