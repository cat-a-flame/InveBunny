"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/utils/utils";
import styles from "./button.module.css";

type ButtonVariant = "cta" | "primary" | "secondary" | "ghost" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &{
    icon?: ReactNode,
    size?: "sm" | "md" | "lg",
    variant: ButtonVariant,
}

const buttonSizes = {
    sm: styles["button-sm"],
    md: styles["button-md"],
    lg: styles["button-lg"],
};

const buttonVariants: Record<ButtonVariant, string> = {
    cta: styles["button-cta"],
    primary: styles["button-primary"],
    secondary: styles["button-secondary"],
    ghost: styles["button-ghost"],
    destructive: styles["button-destructive"],
};

export function Button({ variant, icon, size="md", className, children, ...props }: ButtonProps) {
    const sizeClass = buttonSizes[size];

    return (
        <button className={cn(styles.button, buttonVariants[variant], sizeClass, icon ? styles.buttonWithIcon : undefined, className)} {...props}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {children}
        </button>
    );
};