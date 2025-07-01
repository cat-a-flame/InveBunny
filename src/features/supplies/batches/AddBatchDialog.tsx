'use client';

import { useState, useEffect, useRef } from 'react';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { Button } from '@/src/components/Button/button';
import { useToast } from '../../../components/Toast/toast';

type Props = {
    open: boolean;
    onClose: () => void;
    supplyId: string;
    supplyName: string;
    onCreated: () => void;
};

export default function CreateBatchDialog({ open, onClose, supplyId, supplyName, onCreated }: Props) {
    const toast = useToast();
    const isMounted = useRef(false);
    const [isOpen, setIsOpen] = useState(false);

    const [form, setForm] = useState({
        supplier_name: '',
        order_date: '',
        vendor_name: '',
        order_id: '',
        batch_name: '',
        status: true,
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            isMounted.current = true;
            setTimeout(() => setIsOpen(true), 50);
        } else {
            setIsOpen(false);
            isMounted.current = false;
        }
    }, [open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const res = await fetch('/api/supplies/batches/create', {
            method: 'POST',
            body: JSON.stringify({ ...form, supply_id: supplyId }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
            toast('Supply batch added!');
            onCreated();
            onClose();
        } else {
            console.error(await res.json());
        }

        setSubmitting(false);
    };

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            <div className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="dialog-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title" id="dialog-title">Create new batch</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>
                <form onSubmit={handleSubmit} className="side-panel-content form-grid">
                <div className="input-group">
                    <label className="input-label">Supply name</label>
                    <input name="supply_name" value={supplyName} readOnly />
                </div>

                <div className="input-group">
                    <label className="input-label">Batch name</label>
                    <input name="batch_name" value={form.batch_name} onChange={handleChange} required placeholder="For example 'supply-001'" />
                </div>

                <div className="input-group">
                    <label className="input-label">Supplier name</label>
                    <input name="supplier_name" value={form.supplier_name} onChange={handleChange} autoFocus required />
                </div>
                
                <div className="input-group">
                    <label className="input-label">Vendor name</label>
                    <input name="vendor_name" value={form.vendor_name} onChange={handleChange} required />
                </div>

                <div className="input-group">
                    <label className="input-label">Order number</label>
                    <input name="order_id" value={form.order_id} onChange={handleChange} required />
                </div>

                <div className="double-input-group">
                    <div className="input-grow">
                        <label className="input-label">Date of purchase</label>
                        <input name="order_date" type="date" value={form.order_date} onChange={handleChange} required />
                    </div>

                    <div className="input-shrink">
                        <label className="input-label">Active batch</label>
                        <label className="switch">
                            <input type="checkbox" checked={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked }))} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                    <div className="side-panel-footer">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={submitting}>Create batch</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
