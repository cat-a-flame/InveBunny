'use client';

import { useState } from 'react';
import { Button } from '../../../components/Button/button';
import { useToast } from '../../../components/Toast/toast';

type Props = {
    dialogRef: React.RefObject<HTMLDialogElement>;
};

export function AddCategoryDialog({ dialogRef }: Props) {
    const [categoryName, setCategoryName] = useState('');
    const toast = useToast();

    const closeDialog = () => dialogRef.current?.close();

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
            closeDialog();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <dialog className="dialog" ref={dialogRef}>
            <form onSubmit={handleSubmit} method="dialog">
                <h2 className="dialog-title">Add new category</h2>

                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                </div>

                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </dialog>
    );
}
