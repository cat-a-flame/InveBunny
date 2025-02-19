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
        alert("Supply saved!");
        setIsDialogOpen(false);
    };

    return (
        <>
            <Button variant="cta" onClick={() => setIsDialogOpen(true)} icon={<CgMathPlus />}>Add new supply</Button>


            <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Add new supply"
                onCancel={handleCancel}
                onCta={handleConfirm}
                cancelLabel="Cancel"
                ctaLabel="Save supply">

                <div className="input-group">
                    <label className="input-label" htmlFor="supplyName">Supply name</label>
                    <input type="text" placeholder="Supply name" />
                </div>

{/*}
                <div className="input-group">
                    <label className="input-label" htmlFor="supplyPrefix">Batch ID prefix</label>
                    <input type="text" placeholder="eg. mysupply" />
                    <span className="help-text">Use only lowercase letters, numbers, and dashes.</span>
                </div>
*/}
            </Dialog>
        </>
    );
};