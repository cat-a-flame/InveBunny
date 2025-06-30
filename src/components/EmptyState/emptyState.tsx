"use client";

import { Button } from "../Button/button";
import { CgMathPlus } from "react-icons/cg";
import { ReactNode } from "react";
import styles from "./emptyState.module.css";

type EmptyStatenProps ={
    icon?: ReactNode;
    image?: string;
    title?: string;
    subtitle?: string;
}

export function EmptyState({ icon, title, subtitle, ...props }: EmptyStatenProps) {

    return (
        <div className={styles.box}>
            <img />

            <h4 className={styles.title}>No active batches</h4>
            <p className={styles.subtitle}>Create a new batch to get started.</p>
           
           <Button variant="primary" icon={<CgMathPlus />} onClick={}>Button label</Button>
        </div>
    );
};