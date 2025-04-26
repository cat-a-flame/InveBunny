'use client';

import { useRef, useState } from 'react';
import { CgMathPlus } from "react-icons/cg";
import { Button } from "../../components/Button/button";
import { useToast } from '../../components/Toast/toast';

export function DialogForm() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [variantName, setVariantName] = useState('');
  const toast = useToast();

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/variants/addNewVariant', {
      method: 'POST',
      body: JSON.stringify({
        variant_name: variantName,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    

    const result = await response.json();

    if (result.success) {
      toast('Variant created!');
      closeDialog();
    } else {
      toast(`Error: ${result.error}`);
    }
  };

  return (
    <>
      <div className="pageHeader">
        <h2 className="heading-title">Variants</h2>

        <Button variant="cta" onClick={openDialog} icon={<CgMathPlus />}>Add new variant</Button>
      </div>

      <dialog className="dialog" ref={dialogRef}>
        <form onSubmit={handleSubmit} method="dialog">
          <h2 className="dialog-title">Add new variant</h2>

          <div className="input-group">
            <label className="input-label">Name</label>
            <input
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              required
            />
          </div>

          <div className="dialog-buttons">
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
