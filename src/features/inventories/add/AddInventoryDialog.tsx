'use client';

import { Button } from '@/src/components/Button/button';
import { Dialog } from '@/src/components/Dialog/dialog';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/src/components/Toast/toast';

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddInventoryDialog({ open, onClose }: Props) {
    const [name, setName] = useState('');
    const toast = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/inventories/addNewInventory', {
            method: 'POST',
            body: JSON.stringify({ inventory_name: name }),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (result.success) {
            toast('✅ Inventory created!');
            router.refresh();
            onClose();
            setName('');
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Add new inventory">
            <form onSubmit={handleSubmit} method="dialog">
                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </Dialog>
    );
}
