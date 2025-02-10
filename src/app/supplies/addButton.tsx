"use client";

import { useRef, useState } from "react";

export function AddButton() {
    const [isOpen, setIsOpen] = useState(false);
    const showDialog = () => {
        openDialog.current.showModal();
    };

    const openDialog = useRef<HTMLDialogElement>(null);

    return (
        <>
            <button className="button-cta" onClick={showDialog}>
                <i className="fa-solid fa-plus"></i> Add new supply
            </button>

            <dialog className="modal" ref={openDialog}>
                <h4 className="dialog-title">Add new supply</h4>

                <div className="input-group">
                    <label htmlFor="supplyName">Supply name</label>
                    <input type="text" placeholder="Supply name" />
                </div>

                <div className="input-group">
                    <label htmlFor="supplyPrefix">Batch ID prefix</label>
                    <input type="text" placeholder="eg. mysupply" />
                    <span className="help-text">Use only lowercase letters, numbers, and dashes.</span>
                </div>

                <div className="button-group">
                    <button className="button-ghost">Cancel</button>
                    <button className="button-primary" id="saveDialogButton">Save supply</button>
                </div>
            </dialog>
        </>
    );
};