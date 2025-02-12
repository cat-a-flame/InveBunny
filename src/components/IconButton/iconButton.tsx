"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/utils/utils";
import styles from "./iconButton.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &{
    icon?: ReactNode;
    title?: string;
}

export function IconButton({ icon, className, title, ...props }: ButtonProps) {

    return (
        <button className={styles["icon-button"]} title={title}  {...props}>
            {icon && <span className={styles.icon}>{icon}</span>}
        </button>
    );
};