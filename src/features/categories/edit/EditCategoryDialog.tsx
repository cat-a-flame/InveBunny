'use client';

import { Button } from '../../../components/Button/button';
import { Panel } from '../../../components/Panel/panel';
import { useToast } from '../../../components/Toast/toast';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type EditCategoryDialogProps = {
    id: string;
    currentName: string;
    open: boolean;
    onClose: () => void;
};

export function EditCategoryDialog({ id, currentName, open, onClose }: EditCategoryDialogProps) {
    const [categoryName, setCategoryName] = useState(currentName);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        if (open) {
            setCategoryName(currentName);
        }
    }, [open, currentName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch(`/api/categories/updateCategory`, {
            method: 'PUT',
            body: JSON.stringify({
                id,
                category_name: categoryName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (result.success) {
            toast('✅ Category updated!');
            router.refresh();
            onClose();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <Panel isOpen={open} onClose={onClose} title="Edit category">
            <form onSubmit={handleSubmit} method="dialog">
                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                    />
                </div>

                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
            </Panel>
        </>
    );
}
