'use client';

import { Button } from '../../../components/Button/button';
import { Dialog } from '../../../components/Dialog/dialog';
import { useToast } from '../../../components/Toast/toast';
import { useState, useEffect } from 'react';

type EditSupplyDialogProps = {
    id: string;
    currentName: string;
    currentCategory: string;
    open: boolean;
    onClose: () => void;
};

export function EditSupplyDialog({ id, currentName, currentCategory, open, onClose }: EditSupplyDialogProps) {
    const [supplyName, setSupplyName] = useState(currentName);
    const [supplyCategory, setSupplyCategory] = useState(currentCategory);
    const toast = useToast();

    useEffect(() => {
        if (open) {
            setSupplyName(currentName);
            setSupplyCategory(currentCategory);
        }
    }, [open, currentName, currentCategory]);

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
            toast('✅ Supply updated!');
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
                    <input value={supplyCategory} onChange={(e) => setSupplyCategory(e.target.value)} required />
                </div>

                <div className="dialog-buttons">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </Dialog>
    );
}
