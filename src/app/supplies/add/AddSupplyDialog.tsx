'use client';

import { useState } from 'react';
import { Button } from '../../../components/Button/button';
import { useToast } from '../../../components/Toast/toast';

type Props = {
    dialogRef: React.RefObject<HTMLDialogElement>;
};

export function AddSupplyDialog({ dialogRef }: Props) {
    const [supplyName, setSupplyName] = useState('');
    const [supplyCategory, setsupplyCategory] = useState('');
    const toast = useToast();

    const closeDialog = () => dialogRef.current?.close();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/supplies/addNewSupply', {
            method: 'POST',
            body: JSON.stringify({ supply_name: supplyName, supply_category: supplyCategory }),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (result.success) {
            toast('✅ Supply created!');
            closeDialog();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <dialog className="dialog" ref={dialogRef}>
            <form onSubmit={handleSubmit} method="dialog">
                <h2 className="dialog-title">Add new supply</h2>

                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input value={supplyName} onChange={(e) => setSupplyName(e.target.value)} required />
                </div>

                <div className="input-group">
                    <label className="input-label">Category</label>
                    <input value={supplyCategory} onChange={(e) => setsupplyCategory(e.target.value)} required />
                </div>

                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </dialog>
    );
}
