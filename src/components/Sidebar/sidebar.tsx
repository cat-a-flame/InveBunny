"use client";

import Link from 'next/link';
import Image from 'next/image';
import styles from "./sidebar.module.css";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from 'next/navigation';
import { slugify } from '@/src/utils/slugify';
import { useProfile } from '../ProfileContext/profile';

const Sidebar = () => {
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [inventories, setInventories] = useState<{ id: number; inventory_name: string }[]>([]);
    const { username } = useProfile();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/inventories');
                if (res.ok) {
                    const data = await res.json();
                    setInventories(data.inventories || []);
                }
            } catch (err) {
                console.error('Failed to load inventories', err);
            }
        };
        load();
    }, []);



    useEffect(() => {
        const settingsPaths = ['/categories', '/inventories', '/variants'];
        setSettingsOpen(settingsPaths.some(p => pathname.startsWith(p)));
    }, [pathname]);

    return (
        <aside className={styles.sidebar}>
            <div>
                <Link href="/" className={styles.logoLink}>
                    <span className={styles.logo}>🐰</span>
                    <span>InveBunny</span>
                </Link>
                <nav className={styles.navigation}>
                    <ul>
                        <li>
                            <button type="button" className={`${styles.navigationLink} ${pathname.startsWith('/inventory') ? styles.active : ''}`} onClick={() => setInventoryOpen((prev) => !prev)}>
                                <i className="fa-solid fa-warehouse"></i>
                                <span>Inventory</span>
                                <i className={`${styles.chevron} fa-solid ${inventoryOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                            </button>
                            {inventoryOpen && (
                                <ul className={styles.subMenu}>
                                    {inventories.map(inv => {
                                        const slug = slugify(inv.inventory_name);
                                        const isActive = pathname === `/inventory/${slug}` || (pathname === '/inventory' && searchParams.get('inventory') === slug);
                                        return (
                                            <li key={inv.id}>
                                                <Link href={`/inventory/${slug}`} className={`${styles.subLink} ${isActive ? styles.active : ''}`}>{inv.inventory_name}</Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                                                <li>
                            <Link className={`${styles.navigationLink} ${pathname === '/products' ? styles.active : ''}`} href="/products" title="Products">
                                <i className="fa-solid fa-box-open"></i>
                                <span>Products</span>
                            </Link>
                        </li>
                        <li>
                            <Link className={`${styles.navigationLink} ${pathname === '/scan' ? styles.active : ''}`} href="/scan" title="Scan items">
                                <i className="fa-solid fa-barcode"></i>
                                <span>Scan items</span>
                            </Link>
                        </li>
                        <li>
                            <Link className={`${styles.navigationLink} ${pathname === '/supplies' ? styles.active : ''}`} href="/supplies" title="Supplies">
                                <i className="fa-solid fa-layer-group"></i>
                                <span>Supplies</span>
                            </Link>
                        </li>
                        <li>
                            <button type="button" className={`${styles.navigationLink} ${pathname.startsWith('/categories') || pathname.startsWith('/inventories') || pathname.startsWith('/variants') ? styles.active : ''}`} onClick={() => setSettingsOpen(prev => !prev)}>
                                <i className="fa-solid fa-gear"></i>
                                <span>Settings</span>
                                <i className={`${styles.chevron} fa-solid ${settingsOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                            </button>
                            {settingsOpen && (
                                <ul className={styles.subMenu}>
                                    <li>
                                        <Link href="/inventories" className={`${styles.subLink} ${pathname === '/inventories' ? styles.active : ''}`}>Inventories</Link>
                                    </li>
                                    <li>
                                        <Link href="/categories" className={`${styles.subLink} ${pathname === '/categories' ? styles.active : ''}`}>Categories</Link>
                                    </li>
                                    <li>
                                        <Link href="/variants" className={`${styles.subLink} ${pathname === '/variants' ? styles.active : ''}`}>Variants</Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>

            <Link className={`${styles.profileLink} ${pathname === '/profile' ? styles.active : ''}`} href="/profile">
                <span><Image src="/images/avatar.jpg" alt="Profile picture" className={styles["profile-image"]} width={120} height={120} /></span>
                <span className={styles["profile-name"]}>{username || 'Profile'}</span>
            </Link>
        </aside>
    );
};

export default Sidebar;
