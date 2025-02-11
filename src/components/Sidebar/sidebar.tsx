"use client";

import { usePathname } from 'next/navigation';
import { useState } from "react";
import Link from 'next/link';
import styles from "./sidebar.module.css";

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
            <div>
                <Link href="/" className={styles.logoLink}>
                    <span className={styles.logo}>🐰</span>
                    {!isCollapsed && <span>Ivenbunny</span>}
                </Link>
                <nav className={styles.navigation}>
                    <ul>
                        <li>
                            <Link className={`${styles.navigationLink} ${pathname === '/inventory' ? styles.active : ''}`} href="/" title="Inventory">
                                <i className="fa-solid fa-box-open"></i>
                                {!isCollapsed && <span>Iventory</span>}
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