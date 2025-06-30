'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/src/components/Dialog/dialog';
import { Button } from '@/src/components/Button/button';
import { DeleteButton } from './delete/DeleteButton';
import { EditSupplyCategoryButton } from './edit/EditSupplyCategoryButton';
import { AddSupplyCategoryDialog } from './add/AddSupplyCategoryDialog';

export type SupplyCategory = { uuid: string; category_name: string };

type Props = {
    open: boolean;
    onClose: () => void;
};

export function SupplyCategorySettingsDialog({ open, onClose }: Props) {
    const [categories, setCategories] = useState<SupplyCategory[]>([]);
    const [addOpen, setAddOpen] = useState(false);

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
        }
    }, [open]);

    const handleUpdated = () => loadCategories();

    return (
        <>
            {addOpen && <AddSupplyCategoryDialog open={addOpen} onClose={() => { setAddOpen(false); handleUpdated(); }} onAdded={handleUpdated} />}
            <Dialog open={open} onClose={onClose} title="Supply categories" size="md">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <Button variant="primary" onClick={() => setAddOpen(true)}>Add category</Button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Category name</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.uuid}>
                                <td><span className="item-name">{cat.category_name}</span></td>
                                <td>
                                    <div className="table-actions">
                                        <DeleteButton categoryId={cat.uuid} categoryName={cat.category_name} onDeleted={handleUpdated} />
                                        <EditSupplyCategoryButton uuid={cat.uuid} currentName={cat.category_name} onUpdated={handleUpdated} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Dialog>
        </>
    );
}
