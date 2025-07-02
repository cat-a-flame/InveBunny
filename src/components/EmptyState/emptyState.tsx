"use client";

import Image from "next/image";
import { ReactNode } from "react";
import styles from "./emptyState.module.css";

export type EmptyStateProps = {
  image?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
};

export function EmptyState({ image, title, subtitle, children }: EmptyStateProps) {
  return (
    <div className={styles.box}>
      {image && <Image src={image} alt="" className={styles.image} width={120} height={120} />}
      {title && <h4 className={styles.title}>{title}</h4>}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
