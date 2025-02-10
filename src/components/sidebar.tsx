"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="sidebar collapsed">
            <Link href="/" className="logoLink">
                <span className="logo">🐰</span>
                <span className="label">Ivenbunny</span>
            </Link>
            <nav className="navigation">
                <ul>
                    <li>
                        <Link className="navigationLink ${pathname === '/' ? styles.active : ''}" href="/" title="Iventory">
                            <i className="fa-solid fa-box-open"></i>
                            <span className="label">Iventory</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="navigationLink ${pathname === '/scan' ? styles.active : ''}" href="/scan" title="Scan items">
                            <i className="fa-solid fa-barcode"></i>
                            <span className="label">Scan items</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="navigationLink ${pathname === '/supplies' ? styles.active : ''}" href="/supplies" title="Supplies">
                            <i className="fa-solid fa-layer-group"></i>
                            <span className="label">Supplies</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="navigationLink" href="/categories" title="Categories">
                            <i className="fa-solid fa-boxes-stacked"></i>
                            <span className="label">Categories</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="navigationLink" href="/variants" title="Variants">
                            <i className="fa-solid fa-sitemap"></i>
                            <span className="label">Variants</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <button className="collapseButton">
                <i className="fa-solid fa-arrow-right"></i>
            </button>
        </aside>
    );
};

export default Sidebar;