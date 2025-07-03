"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import Link from 'next/link';
import { supabaseClient } from '@/src/utils/supabase/client';
import { slugify } from '@/src/utils/slugify';
import styles from "./sidebar.module.css";

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [inventories, setInventories] = useState<{ id: number; inventory_name: string }[]>([]);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        supabaseClient
            .from('inventories')
            .select('id, inventory_name')
            .order('inventory_name')
            .then(({ data }) => setInventories(data || []));
    }, []);

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
                                {!isCollapsed && <i className={`fa-solid ${inventoryOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>}
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
                            <Link className={`${styles.navigationLink} ${pathname === '/supplies' ? styles.active : ''}`} href="/supplies" title="Supplies">
                                <i className="fa-solid fa-layer-group"></i>
                                {!isCollapsed && <span>Supplies</span>}
                            </Link>
                        </li>
                        <li>
                            <Link className={`${styles.navigationLink} ${pathname === '/categories' ? styles.active : ''}`} href="/categories" title="Categories">
                                <i className="fa-solid fa-boxes-stacked"></i>
                                {!isCollapsed && <span>Categories</span>}
                            </Link>
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