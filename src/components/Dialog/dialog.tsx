"use client";

import { useRef, useEffect } from "react";
import { Button } from "../Button/button";
import styles from "./dialog.module.css";

interface DialogProps {
  title?: string;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onCta?: () => void;
  cancelLabel?: string;
  ctaLabel?: string;
}

export function Dialog({
  title,
  children,
  open,
  onClose,
  onCancel,
  onCta,
  cancelLabel = "Cancel",
  ctaLabel = "Confirm",
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
        
        <div>{children}</div>

        <div className={styles.buttons}>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          )}
          {onCta && (
            <Button variant="primary" onClick={onCta}>{ctaLabel}</Button>
          )}
        </div>
      </div>
    </dialog>
  );
}