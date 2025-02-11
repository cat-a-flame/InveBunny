"use client";

import { useRef, useState } from "react";
import { CgMathPlus } from "react-icons/cg";
import { Button } from "../../components/Button/button";
import { Dialog } from "../../components/Dialog/dialog";

export function AddButton() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCancel = () => {
        setIsDialogOpen(false);
    };

    const handleConfirm = () => {
        alert("Variant saved!");
        setIsDialogOpen(false);
    };

    return (
        <>
            <Button variant="cta" onClick={() => setIsDialogOpen(true)} icon={<CgMathPlus />}>Add new variant</Button>


            <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Add new variant"
                onCancel={handleCancel}
                onCta={handleConfirm}
                cancelLabel="Cancel"
                ctaLabel="Save variant">

                <div className="input-group">
                    <label className="input-label" htmlFor="supplyName">Variant name</label>
                    <input type="text" />
                </div>
            </Dialog>
        </>
    );
};