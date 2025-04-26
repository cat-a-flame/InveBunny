'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/Button/button';
import { useToast } from '../../../components/Toast/toast';

type EditVariantDialogProps = {
    id: string;
    currentName: string;
    onClose: () => void;
};

export function EditVariantDialog({ id, currentName, onClose }: EditVariantDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [variantName, setVariantName] = useState(currentName);
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
            toast('Variant updated!');
            handleClose();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <dialog className="dialog" ref={dialogRef} onClose={handleClose}>
            <form onSubmit={handleSubmit} method="dialog">
                <h2 className="dialog-title">Edit variant</h2>

                <div className="input-group">
                    <label className="input-label">Name</label>
                    <input
                        value={variantName}
                        onChange={(e) => setVariantName(e.target.value)}
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
