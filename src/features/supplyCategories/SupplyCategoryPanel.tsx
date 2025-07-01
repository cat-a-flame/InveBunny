'use client';

import { useEffect, useState, useRef } from 'react';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { Button } from '@/src/components/Button/button';
import { DeleteButton } from './delete/DeleteButton';
import { EditSupplyCategoryButton } from './edit/EditSupplyCategoryButton';
import { AddSupplyCategoryDialog } from './add/AddSupplyCategoryDialog';
import { CgMathPlus } from 'react-icons/cg';

export type SupplyCategory = { id: string; category_name: string };

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function SupplyCategoryPanel({ open, onClose }: Props) {
    const [categories, setCategories] = useState<SupplyCategory[]>([]);
    const [addOpen, setAddOpen] = useState(false);
    const isMounted = useRef(false);
    const [isOpen, setIsOpen] = useState(false);

    const loadCategories = async () => {
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

    useEffect(() => {
        if (open) {
            loadCategories();
            isMounted.current = true;
            setTimeout(() => setIsOpen(true), 50);
        } else {
            setIsOpen(false);
            isMounted.current = false;
        }
    }, [open]);

    const handleUpdated = () => loadCategories();

    return (
        <>
            {open && <div className="side-panel-backdrop" onClick={onClose} />}
            {addOpen && (
                <AddSupplyCategoryDialog open={addOpen} onClose={() => { setAddOpen(false); handleUpdated(); }} onAdded={handleUpdated} />
            )}
            <div className={`side-panel side-panel-sm ${isOpen ? 'open' : ''}`} role="dialog" aria-labelledby="panel-title">
                <div className="side-panel-header">
                    <h3 className="side-panel-title" id="panel-title">Supply categories</h3>
                    <IconButton icon={<i className="fa-solid fa-close"></i>} onClick={onClose} title="Close panel" />
                </div>
                <div className="side-panel-content">
                    <table className="batch-list">
                        <thead>
                            <tr>
                                <th>Category name</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td><span className="item-name">{cat.category_name}</span></td>
                                    <td>
                                        <div className="table-actions">
                                            <DeleteButton categoryId={cat.id} categoryName={cat.category_name} onDeleted={handleUpdated} />
                                            <EditSupplyCategoryButton id={cat.id} currentName={cat.category_name} onUpdated={handleUpdated} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="side-panel-footer">
                    <Button variant="primary" icon={<CgMathPlus />} onClick={() => setAddOpen(true)}>Create new category</Button>
                </div>
            </div>
        </>
    );
}
