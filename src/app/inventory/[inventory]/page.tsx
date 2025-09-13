"use client";

import { useEffect, useState } from 'react';

interface InventoryItem {
    id: number;
    sku: string;
    quantity: number;
    product_name: string;
    variant_name: string;
}

export default function InventorySlugPage({ params }: { params: { inventory: string } }) {
    const [inventoryName, setInventoryName] = useState('');
    const [items, setItems] = useState<InventoryItem[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/inventory/items?slug=${params.inventory}`);
                if (res.ok) {
                    const data = await res.json();
                    setInventoryName(data.inventory.inventory_name);
                    setItems(data.items || []);
                }
            } catch (err) {
                console.error('Failed to load inventory', err);
            }
        };
        load();
    }, [params.inventory]);

    if (!inventoryName) {
        return (
            <main>
                <p>Inventory not found.</p>
            </main>
        );
    }

    return (
        <main>
            <div className="pageHeader">
                <h2 className="heading-title">Inventory</h2>
                <h3 className="heading-subtitle">{inventoryName}</h3>
            </div>

            <div className="content">
                <table>
                    <thead>
                        <tr>
                            <th>Product name</th>
                            <th>Variant</th>
                            <th>SKU</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>{item.product_name || '-'}</td>
                                <td>{item.variant_name || '-'}</td>
                                <td>{item.sku}</td>
                                <td>{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
