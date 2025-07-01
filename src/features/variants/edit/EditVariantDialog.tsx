'use client';

import { Button } from '../../../components/Button/button';
import { Panel } from '../../../components/Panel/panel';
import { useToast } from '../../../components/Toast/toast';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type EditVariantDialogProps = {
    id: string;
    currentName: string;
    open: boolean;
    onClose: () => void;
};

export function EditVariantDialog({ id, currentName, open, onClose }: EditVariantDialogProps) {
    const [variantName, setVariantName] = useState(currentName);
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        if (open) {
            setVariantName(currentName);
        }
    }, [open, currentName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch(`/api/variants/updateVariant`, {
            method: 'PUT',
            body: JSON.stringify({
                id,
                variant_name: variantName,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (result.success) {
            toast('✅ Variant updated!');
            router.refresh();
            onClose();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <Panel isOpen={open} onClose={onClose} title="Edit variant">
            <form onSubmit={handleSubmit} method="dialog">
                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
                        required
                    />
                </div>

                <div className="dialog-buttons">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </div>
            </form>
            </Panel>
        </>
    );
}
