'use client';

import { Button } from '../../../components/Button/button';
import { Dialog } from '../../../components/Dialog/dialog';
import { useToast } from '../../../components/Toast/toast';
import { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (open) {
            setSupplyName(currentName);
            setSupplyCategoryId(currentCategoryId);
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
        <Dialog open={open} onClose={onClose} title="Edit supply">
            <form onSubmit={handleSubmit} method="dialog">
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

                <div className="dialog-buttons">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </Dialog>
    );
}
