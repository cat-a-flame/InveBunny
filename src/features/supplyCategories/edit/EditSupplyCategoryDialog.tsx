'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/Button/button';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { useToast } from '@/src/components/Toast/toast';

type Props = {
    id: string;
    currentName: string;
    open: boolean;
    onClose: () => void;
    onUpdated?: () => void;
};

export function EditSupplyCategoryDialog({ id, currentName, open, onClose, onUpdated }: Props) {
    const [categoryName, setCategoryName] = useState(currentName);
    const toast = useToast();
    const router = useRouter();
    const isMounted = useRef(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setCategoryName(currentName);
            isMounted.current = true;
            setTimeout(() => setIsOpen(true), 50);
        } else {
            setIsOpen(false);
            isMounted.current = false;
        }
    }, [open, currentName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/supplyCategories/updateCategory', {
            method: 'PUT',
            body: JSON.stringify({ id, category_name: categoryName }),
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (result.success) {
            toast('✅ Category updated!');
            router.refresh();
            onClose();
            onUpdated && onUpdated();
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title" id="dialog-title">Edit category</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>
                <form onSubmit={handleSubmit} className="side-panel-content">
                    <div className="input-group">
                        <label className="input-label">Name</label>
                        <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                    </div>
                    <div className="side-panel-footer">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary">Save</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
