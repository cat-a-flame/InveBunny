'use client';

import { Button } from '../../../components/Button/button';
import { Panel } from '../../../components/Panel/panel';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/Toast/toast';

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddVariantDialog({ open, onClose }: Props) {
    const [variantName, setVariantName] = useState('');
    const toast = useToast();
    const router = useRouter();

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
            router.refresh();
            onClose();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <Panel isOpen={open} onClose={onClose} title="Add new variant">
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
            </Panel>
        </>
    );
}
