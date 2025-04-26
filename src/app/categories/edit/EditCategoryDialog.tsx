'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/Button/button';
import { useToast } from '../../../components/Toast/toast';

type EditCategoryDialogProps = {
    id: string;
    currentName: string;
    onClose: () => void;
};

export function EditCategoryDialog({ id, currentName, onClose }: EditCategoryDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [categoryName, setCategoryName] = useState(currentName);
    const toast = useToast();

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    const handleClose = () => {
        dialogRef.current?.close();
        onClose();
    };

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
            toast('Category updated!');
            handleClose();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <dialog className="dialog" ref={dialogRef} onClose={handleClose}>
            <form onSubmit={handleSubmit} method="dialog">
                <h2 className="dialog-title">Edit category</h2>

                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                    />
                </div>

                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </dialog>
    );
}
