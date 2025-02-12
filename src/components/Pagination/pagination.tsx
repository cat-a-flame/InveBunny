"use client";

import { useState } from "react";
import { IconButton } from "../IconButton/iconButton";
import styles from "./pagination.module.css";

type PaginationProps = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ totalPages, currentPage, onPageChange }: PaginationProps) {
  const [inputValue, setInputValue] = useState(currentPage);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
    setInputValue(page);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(e.target.value));
  };

  const handleInputBlur = () => {
    goToPage(inputValue);
  };

  return (
      <div className={styles.pagination}>
        <IconButton icon={<i className="fa-solid fa-angles-left"></i>} title="First Page" onClick={() => goToPage(1)} disabled={currentPage === 1} />
        <IconButton icon={<i className="fa-solid fa-chevron-left"></i>} title="Previous" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} />
        
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={styles.pageInput}
          min={1}
          max={totalPages}
        />
        
        <span className={styles.totalPages}>/ {totalPages}</span>
        
        <IconButton icon={<i className="fa-solid fa-chevron-right"></i>} title="Next" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} />
        <IconButton icon={<i className="fa-solid fa-angles-right"></i>} title="Last Page" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} />
      </div>
  );
}
