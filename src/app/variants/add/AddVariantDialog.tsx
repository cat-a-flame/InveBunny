'use client';

import { Button } from '../../../components/Button/button';
import { Dialog } from '../../../components/Dialog/dialog';
import { useState } from 'react';
import { useToast } from '../../../components/Toast/toast';

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddVariantDialog({ open, onClose }: Props) {
    const [variantName, setVariantName] = useState('');
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/variants/addNewVariant', {
            method: 'POST',
            body: JSON.stringify({ variant_name: variantName }),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (result.success) {
            toast('✅ Variant created!');
            onClose();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} title="Add new variant">
            <form onSubmit={handleSubmit} method="dialog">
                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input value={variantName} onChange={(e) => setVariantName(e.target.value)} required />
                </div>

                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
        </Dialog>
    );
}
