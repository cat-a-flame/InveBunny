"use client";

import { useRef, useEffect } from "react";
import styles from "./dialog.module.css";

interface DialogProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    open: boolean;
    onClose: () => void;
}

export function Dialog({
    title,
    subtitle,
    children,
    open,
    onClose,
}: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [open]);

    return (
        <dialog ref={dialogRef} className={styles.dialog} onCancel={onClose}>
            <div className={styles.content}>
                {title && <h2 className={styles.title}>{title}</h2>}
                {subtitle && <h3 className={styles.subtitle}>Supply name: {subtitle}</h3>}

                <div className={styles.body}>{children}</div>
            </div>
        </dialog>
    );
}