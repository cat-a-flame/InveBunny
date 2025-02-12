"use client";

import { useRef, useState } from "react";
import { CgMathPlus } from "react-icons/cg";
import { Button } from "../../components/Button/button";
import { Dialog } from "../../components/Dialog/dialog";
import styles from './inventory.module.css';

export function AddButton() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCancel = () => {
        setIsDialogOpen(false);
    };

    const handleConfirm = () => {
        alert("Supply saved!");
        setIsDialogOpen(false);
    };

    return (
        <>
            <Button variant="cta" onClick={() => setIsDialogOpen(true)} icon={<CgMathPlus />}>Add new product</Button>


            <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Add new product"
                onCancel={handleCancel}
                onCta={handleConfirm}
                cancelLabel="Cancel"
                ctaLabel="Save product">

                <div className="input-group">
                    <label className="input-label" htmlFor="productName">Name</label>
                    <input type="text" />
                </div>

                <div className={styles.wrapper}>
                    <div className="input-group input-group-sku">
                        <label className="input-label" htmlFor="productSKU">SKU</label>
                        <input type="text" />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="productQuantity">Quantity</label>
                        <input type="number" min="0" />
                    </div>
                </div>

                <div className={styles.wrapper}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="productCategory">Category</label>
                        <select>
                            <option value="1">Category 1</option>
                            <option value="2">Category 2</option>
                            <option value="3">Category 3</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="productVariant">Variant</label>
                        <select>
                            <option value="1">Variant 1</option>
                            <option value="2">Variant 2</option>
                            <option value="3">Variant 3</option>
                        </select>
                    </div>
                </div>
            </Dialog>
        </>
    );
};