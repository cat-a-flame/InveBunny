"use client";

import { cn } from "@/src/utils/utils";
import { useRef, useEffect } from "react";
import styles from "./dialog.module.css";

interface DialogProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    open: boolean;
    size?: "sm" | "md" | "lg";
    onClose: () => void;
}

const dialogSizes = {
    sm: styles["dialog-sm"],
    md: styles["dialog-md"],
    lg: styles["dialog-lg"],
};

export function Dialog({title, subtitle, children, open, size="sm", onClose,}: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const sizeClass = dialogSizes[size];

    useEffect(() => {
        if (open) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [open]);

    return (
        <dialog ref={dialogRef} className={cn(styles.dialog, sizeClass)}  onCancel={onClose}>
            <div className={styles.content}>
                {title && <h2 className={styles.title}>{title}</h2>}
                {subtitle && <h3 className={styles.subtitle}>Supply name: {subtitle}</h3>}

                <div className={styles.body}>{children}</div>
            </div>
        </dialog>
    );
}