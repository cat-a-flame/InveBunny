"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/utils/utils";
import styles from "./button.module.css";

type ButtonVariant = "cta" | "primary" | "secondary" | "ghost" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &{
    variant: ButtonVariant,
    icon?: ReactNode
}

const buttonVariants: Record<ButtonVariant, string> = {
    cta: styles["button-cta"],
    primary: styles["button-primary"],
    secondary: styles["button-secondary"],
    ghost: styles["button-ghost"],
    destructive: styles["button-destructive"],
};

export function Button({ variant, icon, className, children, ...props }: ButtonProps) {

    return (
        <button className={cn(styles.button, buttonVariants[variant], icon ? styles.buttonWithIcon : undefined, className)} {...props}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {children}
        </button>
    );
};