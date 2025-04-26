import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./iconButton.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &{
    icon?: ReactNode;
    title?: string;
    size?: "sm" | "md";
}

export function IconButton({ icon, className, title, size, ...props }: ButtonProps) {
    const sizeClass = size === "sm" ? styles["icon-button-sm"] : "";

    return (
        <button className={`${styles["icon-button"]} ${sizeClass}`} title={title}  {...props}>
            {icon && <span className={styles.icon}>{icon}</span>}
        </button>
    );
};