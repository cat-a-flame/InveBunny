'use client';

import { Button } from '../../../components/Button/button';
import { IconButton } from '../../../components/IconButton/iconButton';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/Toast/toast';

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddSupplyDialog({ open, onClose }: Props) {
    const [supplyName, setSupplyName] = useState('');
    const [supplyCategoryId, setSupplyCategoryId] = useState('');
    const [categories, setCategories] = useState<{ id: string; category_name: string }[]>([]);
    const toast = useToast();
    const router = useRouter();
    const isMounted = useRef(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (open) {
            isMounted.current = true;
            setTimeout(() => setIsOpen(true), 50);
        } else {
            setIsOpen(false);
            isMounted.current = false;
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const load = async () => {
            try {
                const res = await fetch('/api/supplyCategories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.categories || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        load();
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/supplies/addNewSupply', {
            method: 'POST',
            body: JSON.stringify({ supply_name: supplyName, supply_category_id: supplyCategoryId }),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (result.success) {
            toast('✅ Supply created!');
            router.refresh();
            onClose();
            setSupplyName('');
            setSupplyCategoryId('');
        } else {
            toast(`Error: ${result.error}`);
        }
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title" id="dialog-title">Add new supply</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>
                <form onSubmit={handleSubmit} className="side-panel-content">
                    <div className="input-group">
                        <label className="input-label">Name</label>
                        <input value={supplyName} onChange={(e) => setSupplyName(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <select value={supplyCategoryId} onChange={(e) => setSupplyCategoryId(e.target.value)} required>
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.category_name}</option>
                            ))}
                        </select>
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
