'use client';

import { Button } from '../../../components/Button/button';
import { IconButton } from '../../../components/IconButton/iconButton';
import { useToast } from '../../../components/Toast/toast';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type EditSupplyDialogProps = {
    id: string;
    currentName: string;
    currentCategoryId: string;
    open: boolean;
    onClose: () => void;
};

export function EditSupplyDialog({ id, currentName, currentCategoryId, open, onClose }: EditSupplyDialogProps) {
    const [supplyName, setSupplyName] = useState(currentName);
    const [supplyCategoryId, setSupplyCategoryId] = useState(currentCategoryId);
    const [categories, setCategories] = useState<{ id: string; category_name: string }[]>([]);
    const toast = useToast();
    const router = useRouter();
    const isMounted = useRef(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setSupplyName(currentName);
            setSupplyCategoryId(currentCategoryId);
            isMounted.current = true;
            setTimeout(() => setIsOpen(true), 50);
            const load = async () => {
                try {
                    const res = await fetch('/api/supplyCategories');
                    if (res.ok) {
                        const data = await res.json();
                        setCategories(data.categories || []);
                    }
                } catch (err) {
                    console.error(err);
                }
            };
            load();
        } else {
            setIsOpen(false);
            isMounted.current = false;
        }
    }, [open, currentName, currentCategoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch(`/api/supplies/updateSupply`, {
            method: 'PUT',
            body: JSON.stringify({
                id,
                supply_name: supplyName,
                supply_category_id: supplyCategoryId,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (result.success) {
            toast('✅ Supply updated!');
            router.refresh();
            onClose();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title" id="dialog-title">Edit supply</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>
                <form onSubmit={handleSubmit} className="side-panel-content">
                    <div className="input-group">
                        <label className="input-label">Name</label>
                        <input value={supplyName} onChange={(e) => setSupplyName(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <select value={supplyCategoryId} onChange={(e) => setSupplyCategoryId(e.target.value)} required>
                            <option value="">Select category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.category_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="side-panel-footer">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary">Save</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
