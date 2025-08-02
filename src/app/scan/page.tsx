"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/src/components/Button/button';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { useToast } from '@/src/components/Toast/toast';
import styles from './scan.module.css';

interface ScannedItem {
    sku: string;
    name: string;
    quantity: number;
}

export default function ScanPage() {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const toast = useToast();

    const handleAdd = async () => {
        const sku = input.trim();
        if (!sku) return;

        try {
            const response = await fetch(`/api/products/searchBySku?sku=${encodeURIComponent(sku)}`);
            const data = await response.json();

            if (!data.success || !data.product) {
                setError('Product not found');
                return;
            }

            setScannedItems((prev) => {
                const existing = prev.find((item) => item.sku === sku);
                if (existing) {
                    return prev.map((item) =>
                        item.sku === sku
                            ? { ...item, quantity: item.quantity + 1 }
                            : item,
                    );
                }
                return [
                    ...prev,
                    {
                        sku,
                        name: data.product.product_name || 'Unknown product',
                        quantity: 1,
                    },
                ];
            });

            setInput('');
            setError('');
        } catch (e) {
            console.error(e);
            setError('Error searching for product');
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            await handleAdd();
        }
    };

    const increment = (sku: string) =>
        setScannedItems((prev) =>
            prev.map((item) =>
                item.sku === sku ? { ...item, quantity: item.quantity + 1 } : item,
            ),
        );

    const decrement = (sku: string) =>
        setScannedItems((prev) =>
            prev.flatMap((item) => {
                if (item.sku !== sku) return [item];
                const quantity = item.quantity - 1;
                return quantity > 0 ? [{ ...item, quantity }] : [];
            }),
        );

    const remove = (sku: string) =>
        setScannedItems((prev) => prev.filter((item) => item.sku !== sku));

    const reset = () => {
        setScannedItems([]);
        setInput('');
        setError('');
    };

    const handleCopy = () => {
        const text = Array.from(new Set(scannedItems.map((item) => item.sku))).join('\n');
        navigator.clipboard.writeText(text);
        toast('SKUs copied to clipboard');
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/inventory/updateStockBySku', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: scannedItems.map((item) => ({
                        sku: item.sku,
                        quantity: item.quantity,
                    })),
                }),
            });
            const result = await response.json();
            if (result.success) {
                toast('Inventories updated');
                reset();
            } else {
                toast(result.error || 'Failed to update inventories');
            }
        } catch (e) {
            console.error(e);
            toast('Failed to update inventories');
        }
    };

    const total = scannedItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Scan items</h2>
            </div>

            <div className={styles['scanning-area']}>
                <Image
                    src="/images/scan_barcode.png"
                    alt="Scan items"
                    className={styles['barcode-image']}
                    width={200}
                    height={200}
                />

                <input
                    type="text"
                    className={styles['barcode-input']}
                    placeholder="Scan or enter SKU"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                {error && <div className={styles.error}>{error}</div>}

                {scannedItems.length > 0 && (
                    <div className={styles['scanned-items-list']}>
                        <ul className={styles.list} id="scannedItemsList">
                            {scannedItems.map((item) => (
                                <li key={item.sku} className={styles.item}>
                                    <span>
                                        {item.name} <span className={styles.sku}>{item.sku}</span>
                                    </span>
                                    <div className={styles.controls}>
                                        <IconButton
                                            size="sm"
                                            title="Decrease"
                                            onClick={() => decrement(item.sku)}
                                            disabled={item.quantity <= 1}
                                            icon={<i className="fa-solid fa-minus"></i>}
                                        />
                                        <span className={styles.counter}>{item.quantity}</span>
                                        <IconButton
                                            size="sm"
                                            title="Increase"
                                            onClick={() => increment(item.sku)}
                                            icon={<i className="fa-solid fa-plus"></i>}
                                        />
                                        <IconButton
                                            size="sm"
                                            title="Remove"
                                            onClick={() => remove(item.sku)}
                                            icon={<i className="fa-regular fa-trash-can"></i>}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className={styles['total-scanned-items']}>
                            <span>Total scanned items:</span>
                            {total}
                        </div>

                        <Button
                            variant="primary"
                            className={styles['copy-button']}
                            onClick={handleCopy}
                        >
                            Copy SKUs
                        </Button>
                        <Button
                            variant="primary"
                            className={styles['submit-button']}
                            onClick={handleSubmit}
                            disabled={scannedItems.length === 0}
                        >
                            Update stock
                        </Button>
                    </div>
                )}

                <Button
                    variant="secondary"
                    className={styles['reset-button']}
                    onClick={reset}
                    disabled={scannedItems.length === 0}
                >
                    Reset list
                </Button>
            </div>
        </>
    );
}
