"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import styles from "./searchBar.module.css";

export function Search({ query }: { query: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleSearch = useDebouncedCallback((newQuery: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("query", newQuery);
        params.set("page", "1");

        router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className={styles.searchBar}>
            <input type="search" placeholder="Search for supply name" defaultValue={query} onChange={(e) => handleSearch(e.target.value)} className={styles.input} />
        </div>
    );
}
