'use client';

import { Button } from '../../../components/Button/button';
import { Panel } from '../../../components/Panel/panel';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/Toast/toast';

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddCategoryDialog({ open, onClose }: Props) {
    const [categoryName, setCategoryName] = useState('');
    const toast = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/categories/addNewCategory', {
            method: 'POST',
            body: JSON.stringify({ category_name: categoryName }),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (result.success) {
            toast('✅ Category created!');
            router.refresh();
            onClose();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <Panel isOpen={open} onClose={onClose} title="Add new category">
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
            </Panel>
        </>
    );
}
