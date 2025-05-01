'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/Button/button';
import { useToast } from '../../../components/Toast/toast';

type EditSupplyDialogProps = {
    id: string;
    currentName: string;
    currentCategory: string;
    onClose: () => void;
};

export function EditSupplyDialog({ id, currentName, currentCategory, onClose }: EditSupplyDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [supplyName, setSupplyName] = useState(currentName);
    const [supplyCategory, setSupplyCategory] = useState(currentCategory);
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

        const response = await fetch(`/api/supplies/updateSupply`, {
            method: 'PUT',
            body: JSON.stringify({
                id,
                supply_name: supplyName,
                supply_category: supplyCategory,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (result.success) {
            toast('Supply updated!');
            handleClose();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <dialog className="dialog" ref={dialogRef} onClose={handleClose}>
            <form onSubmit={handleSubmit} method="dialog">
                <h2 className="dialog-title">Edit supply</h2>

                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input value={supplyName} onChange={(e) => setSupplyName(e.target.value)} required />
                </div>

                <div className="input-group">
                    <label className="input-label">Category</label>
                    <input value={supplyCategory} onChange={(e) => setSupplyCategory(e.target.value)} required />
                </div>

                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </dialog>
    );
}
