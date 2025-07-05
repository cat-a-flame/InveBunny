'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/Button/button';
import { Dialog } from '@/src/components/Dialog/dialog';
import { useToast } from '@/src/components/Toast/toast';

type Props = {
    id: string;
    currentName: string;
    open: boolean;
    onClose: () => void;
};

export function EditInventoryDialog({ id, currentName, open, onClose }: Props) {
    const [name, setName] = useState(currentName);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        if (open) setName(currentName);
    }, [open, currentName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/inventories/updateInventory', {
            method: 'PUT',
            body: JSON.stringify({ id, inventory_name: name }),
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (result.success) {
            toast('✅ Inventory updated!');
            router.refresh();
            onClose();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Edit inventory">
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
