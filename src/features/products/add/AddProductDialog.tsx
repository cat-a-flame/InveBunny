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
    is_default?: boolean;
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
        variantId: '',
        status: true
    });

    const [inventoryEntries, setInventoryEntries] = useState([
            { inventoryId: '' }
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

    const handleInventoryChange = (index: number, field: string, value: string | number | boolean) => {
        setInventoryEntries(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addInventoryRow = () => {
        setInventoryEntries(prev => [
            ...prev,
            { inventoryId: '' },
        ]);
    };

    const removeInventoryRow = (index: number) => {
        setInventoryEntries(prev => prev.filter((_, i) => i !== index));
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
                    product_variant: formData.variantId,
                    product_status: formData.status,
                    inventories: inventoryEntries.map(entry => ({
                        inventoryId: entry.inventoryId,
                        sku: '',
                        quantity: 0,
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
                variantId: '',
                status: true
            });
            setInventoryEntries([{ inventoryId: '' }]);

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
            <div className={`side-panel side-panel-md ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
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

                        <div className="double-input-group">
                            <div className="input-equal">
                                <label htmlFor="categoryId" className="input-label">Category</label>
                                <select name="categoryId" className="input-max-width" value={formData.categoryId} onChange={handleChange} required>
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-equal">
                                <label htmlFor="variantId" className="input-label">Variant</label>
                                <select name="variantId" className="input-max-width" value={formData.variantId} onChange={handleChange}>
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

                        <div className="boxed-section">
                            <h3 className="section-subtitle">Inventories</h3>

                            {inventoryEntries.map((entry, index) => (
                                <div key={index} className="double-input-group">
                                    <div>
                                        <label className="input-label">Inventory name</label>
                                        <select value={entry.inventoryId} onChange={(e) => handleInventoryChange(index, 'inventoryId', e.target.value)} required>
                                            <option value="">Select an inventory</option>
                                            {[...inventories]
                                                .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
                                                .map((inv) => (
                                                    <option key={inv.id} value={inv.id}>{inv.inventory_name}</option>
                                                ))}
                                        </select>
                                    </div>



                                    {index > 0 && (
                                        <IconButton icon={<i className="fa-regular fa-trash-can"></i>} onClick={() => removeInventoryRow(index)} title="Remove inventory" />
                                    )}
                                </div>
                            ))}

                            <IconButton type="button" icon={<i className="fa-regular fa-plus"></i>} onClick={addInventoryRow} title="Add new inventory" />
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
