"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconButton } from "../IconButton/iconButton";
import styles from "./pagination.module.css";

type PaginationProps = {
    totalPages: number;
    currentPage: number;
};

export function Pagination({ totalPages, currentPage }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [inputValue, setInputValue] = useState(currentPage);

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page));
        router.push(`?${params.toString()}`);
        setInputValue(page);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(Number(e.target.value));
    };

    const handleInputBlur = () => {
        goToPage(inputValue);
    };

    useEffect(() => {
        setInputValue(currentPage);
    }, [currentPage]);

    return (
        <div className={styles.pagination}>
            <IconButton icon={<i className="fa-solid fa-angles-left"></i>} title="First Page" onClick={() => goToPage(1)} disabled={currentPage === 1} size="sm" />
            <IconButton icon={<i className="fa-solid fa-chevron-left"></i>} title="Previous" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} size="sm" />

            <span className={styles.totalPages}>Page</span>

            <input type="number" value={inputValue} onChange={handleInputChange} onBlur={handleInputBlur} className={styles.pageInput} min={1} max={totalPages} />

            <span className={styles.totalPages}>of {totalPages}</span>

            <IconButton icon={<i className="fa-solid fa-chevron-right"></i>} title="Next" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} size="sm" />
            <IconButton icon={<i className="fa-solid fa-angles-right"></i>} title="Last Page" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} size="sm" />
        </div>
    );
}
