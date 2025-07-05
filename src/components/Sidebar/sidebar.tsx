"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import Link from 'next/link';
import { slugify } from '@/src/utils/slugify';
import styles from "./sidebar.module.css";

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [inventories, setInventories] = useState<{ id: number; inventory_name: string }[]>([]);
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
        setInventoryOpen(pathname.startsWith('/inventory'));
        const settingsPaths = ['/categories', '/supplies', '/inventories'];
        setSettingsOpen(settingsPaths.some(p => pathname.startsWith(p)));
    }, [pathname]);

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
            <div>
                <Link href="/" className={styles.logoLink}>
                    <span className={styles.logo}>🐰</span>
                    {!isCollapsed && <span>InveBunny</span>}
                </Link>
                <nav className={styles.navigation}>
                    <ul>
                        <li>
                            <button type="button" className={`${styles.navigationLink} ${pathname.startsWith('/inventory') ? styles.active : ''}`} onClick={() => setInventoryOpen((prev) => !prev)}>
                                <i className="fa-solid fa-warehouse"></i>
                                {!isCollapsed && <span>Inventory</span>}
                                {!isCollapsed && <i className={`${styles.chevron} fa-solid ${inventoryOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>}
                            </button>
                            {!isCollapsed && inventoryOpen && (
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
                                {!isCollapsed && <span>Products</span>}
                            </Link>
                        </li>
                        <li>
                            <Link className={`${styles.navigationLink} ${pathname === '/scan' ? styles.active : ''}`} href="/scan" title="Scan items">
                                <i className="fa-solid fa-barcode"></i>
                                {!isCollapsed && <span>Scan items</span>}
                            </Link>
                        </li>
                        <li>
                            <button type="button" className={`${styles.navigationLink} ${pathname.startsWith('/supplies') || pathname.startsWith('/categories') || pathname.startsWith('/inventories') ? styles.active : ''}`} onClick={() => setSettingsOpen(prev => !prev)}>
                                <i className="fa-solid fa-gear"></i>
                                {!isCollapsed && <span>Settings</span>}
                                {!isCollapsed && <i className={`${styles.chevron} fa-solid ${settingsOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>}
                            </button>
                            {!isCollapsed && settingsOpen && (
                                <ul className={styles.subMenu}>
                                    <li>
                                        <Link href="/inventories" className={`${styles.subLink} ${pathname === '/inventories' ? styles.active : ''}`}>Inventories</Link>
                                    </li>
                                    <li>
                                        <Link href="/supplies" className={`${styles.subLink} ${pathname === '/supplies' ? styles.active : ''}`}>Supplies</Link>
                                    </li>
                                    <li>
                                        <Link href="/categories" className={`${styles.subLink} ${pathname === '/categories' ? styles.active : ''}`}>Categories</Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <Link className={`${styles.navigationLink} ${pathname === '/variants' ? styles.active : ''}`} href="/variants" title="Variants">
                                <i className="fa-solid fa-sitemap"></i>
                                {!isCollapsed && <span>Variants</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            <button className={styles.button} onClick={() => setIsCollapsed((prev) => !prev)} title={`${isCollapsed ? "Expand" : "Collapse"}`}>
                <i className={`fa-solid ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
            </button>
        </aside>
    );
};

export default Sidebar;