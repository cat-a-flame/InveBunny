'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/Button/button';
import { Dialog } from '@/src/components/Dialog/dialog';
import { useToast } from '@/src/components/Toast/toast';

type Props = {
    open: boolean;
    onClose: () => void;
    onAdded?: () => void;
};

export function AddSupplyCategoryDialog({ open, onClose, onAdded }: Props) {
    const [categoryName, setCategoryName] = useState('');
    const toast = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/supplyCategories/addNewCategory', {
            method: 'POST',
            body: JSON.stringify({ category_name: categoryName }),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (result.success) {
            toast('✅ Category created!');
            router.refresh();
            onClose();
            onAdded?.();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Add supply category">
            <form onSubmit={handleSubmit} method="dialog">
                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                </div>
                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </Dialog>
    );
}
