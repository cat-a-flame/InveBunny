'use client';

import { Button } from '../../../components/Button/button';
import { Dialog } from '../../../components/Dialog/dialog';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/Toast/toast';

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddSupplyDialog({ open, onClose }: Props) {
    const [supplyName, setSupplyName] = useState('');
    const [supplyCategory, setsupplyCategory] = useState('');
    const toast = useToast();
    const router = useRouter();

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
            router.refresh();
            onClose();
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
                    <input value={supplyCategory} onChange={(e) => setsupplyCategory(e.target.value)} required />
                </div>

                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </Dialog>
    );
}
