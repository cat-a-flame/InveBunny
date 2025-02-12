"use client";

import { ReactNode } from "react";
import styles from "./panel.module.css";

type PanelProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function Panel({ isOpen, onClose, children, title }: PanelProps) {
  return (
    <div className={`${styles.panel} ${isOpen ? styles.open : ""}`}>
      <div className={styles.header}>
        <h3>{title}</h3>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
