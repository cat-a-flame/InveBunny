"use client";

import { useDebouncedCallback } from "use-debounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./searchBar.module.css";

export function Search({
    query,
    placeholder = "Search for something nice",
}: {
    query: string;
    placeholder?: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [inputValue, setInputValue] = useState(query);

    useEffect(() => {
        setInputValue(query);
    }, [query]);

    const handleSearch = useDebouncedCallback((newQuery: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("query", newQuery);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    }, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        handleSearch(value);
    };

    const handleReset = () => {
        setInputValue("");
        const params = new URLSearchParams(searchParams);
        params.delete("query");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleManualSearch = () => {
        handleSearch.flush();
    };

    const hasActiveSearch = inputValue.trim().length > 0;

    return (
        <div className={styles.searchBar}>
            <input type="search" placeholder={placeholder} value={inputValue} onChange={handleInputChange} className={styles.input} />

            {!hasActiveSearch && (
                <button type="button" onClick={handleManualSearch} className={styles.button}>
                    <span className={styles.label}>Search</span>
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
            )}

            {hasActiveSearch && (
                <button type="button" onClick={handleReset} className={styles.button}>
                    <span className={styles.label}>Reset</span>
                    <i className="fa-solid fa-close"></i>
                </button>
            )}
        </div>
    );
}
