'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/src/components/Button/button';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { useToast } from '@/src/components/Toast/toast';
import { useRouter } from 'next/navigation';

export type EditInventoryItemDialogProps = {
    open: boolean;
    onClose: () => void;
    productId: string;
    inventoryId: string;
    productName: string;
    productCategoryName: string;
    productSku: string | null;
    productQuantity: number | null;
    onSuccess?: () => void;
};

export function EditInventoryItemDialog({
    open,
    onClose,
    productId,
    inventoryId,
    productName,
    productCategoryName,
    productSku,
    productQuantity,
    onSuccess,
}: EditInventoryItemDialogProps) {
    const [formData, setFormData] = useState({
        sku: productSku || '',
        quantity: productQuantity ?? 0,
    });
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();
    const router = useRouter();
    const isMounted = useRef(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (open) {
            isMounted.current = true;
            setFormData({ sku: productSku || '', quantity: productQuantity ?? 0 });
            setTimeout(() => setIsOpen(true), 50);
        } else {
            setIsOpen(false);
            isMounted.current = false;
        }
    }, [open, productSku, productQuantity]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/inventory/updateInventoryItem', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: productId,
                    inventory_id: inventoryId,
                    product_sku: formData.sku,
                    product_quantity: formData.quantity,
                }),
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.error || 'Failed to update');
            toast('✅ Inventory item updated!');
            router.refresh();
            onClose();
            onSuccess && onSuccess();
        } catch (error: any) {
            toast(`❌ ${error.message || 'Error updating item'}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title" id="dialog-title">Edit inventory item</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>
                <form onSubmit={handleSubmit} className="side-panel-form">
                    <div className="side-panel-content">
                        <div className="input-group">
                            <label className="input-label">Product name</label>
                            <input type="text" value={productName} disabled className="input-max-width" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Category</label>
                            <input type="text" value={productCategoryName} disabled className="input-max-width" />
                        </div>
                        <div className="double-input-group">
                            <div className="input-group input-grow">
                                <label className="input-label" htmlFor="sku">SKU</label>
                                <input id="sku" name="sku" type="text" className="input-max-width" value={formData.sku} onChange={handleChange} />
                            </div>
                            <div className="input-group input-shrink">
                                <label className="input-label" htmlFor="quantity">Quantity</label>
                                <input id="quantity" name="quantity" type="number" min="0" className="input-max-width" value={formData.quantity} onChange={handleChange} />
                            </div>
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
