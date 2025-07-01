'use client';

import { Button } from '../../../components/Button/button';
import { Dialog } from '../../../components/Dialog/dialog';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/Toast/toast';

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddSupplyDialog({ open, onClose }: Props) {
    const [supplyName, setSupplyName] = useState('');
    const [supplyCategoryId, setSupplyCategoryId] = useState('');
    const [categories, setCategories] = useState<{ id: string; category_name: string }[]>([]);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!open) return;
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
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/supplies/addNewSupply', {
            method: 'POST',
            body: JSON.stringify({ supply_name: supplyName, supply_category_id: supplyCategoryId }),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (result.success) {
            toast('✅ Supply created!');
            router.refresh();
            onClose();
            setSupplyName('');
            setSupplyCategoryId('');
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Add new supply">
            <form onSubmit={handleSubmit} method="dialog">
                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input value={supplyName} onChange={(e) => setSupplyName(e.target.value)} required />
                </div>

                <div className="input-group">
                    <label className="input-label">Category</label>
                    <select value={supplyCategoryId} onChange={(e) => setSupplyCategoryId(e.target.value)} required>
                        <option value="">Select category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.category_name}</option>
                        ))}
                    </select>
                </div>

                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </Dialog>
    );
}
