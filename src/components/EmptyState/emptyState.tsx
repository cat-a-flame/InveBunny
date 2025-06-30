"use client";

import { ReactNode } from "react";
import styles from "./emptyState.module.css";

export type EmptyStateProps = {
  icon?: ReactNode;
  image?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
};

export function EmptyState({ icon, image, title, subtitle, children }: EmptyStateProps) {
  return (
    <div className={styles.box}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {image && <img src={image} alt="" className={styles.image} />}
      {title && <h4 className={styles.title}>{title}</h4>}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
