'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/Button/button';
import { Dialog } from '@/src/components/Dialog/dialog';
import { useToast } from '@/src/components/Toast/toast';

type Props = {
    uuid: string;
    currentName: string;
    open: boolean;
    onClose: () => void;
    onUpdated?: () => void;
};

export function EditSupplyCategoryDialog({ uuid, currentName, open, onClose, onUpdated }: Props) {
    const [categoryName, setCategoryName] = useState(currentName);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        if (open) setCategoryName(currentName);
    }, [open, currentName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/supplyCategories/updateCategory', {
            method: 'PUT',
            body: JSON.stringify({ uuid, category_name: categoryName }),
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (result.success) {
            toast('✅ Category updated!');
            router.refresh();
            onClose();
            onUpdated && onUpdated();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Edit category">
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
