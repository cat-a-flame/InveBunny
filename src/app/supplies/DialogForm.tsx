'use client';

import { useEffect, useRef, useState } from 'react';
import { CgMathPlus } from "react-icons/cg";
import { Button } from "../../components/Button/button";
import { useToast } from '../../components/Toast/toast';

export function DialogForm() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);

  const toast = useToast();

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({
        product_name: productName,
        product_sku: sku,
        product_quantity: quantity,
        category_id: categoryId,
        variant_id: variantId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      toast('Product created!');
      closeDialog();
    } else {
      toast(`Error: ${result.error}`);
    }
  };

  return (
    <>
      <div className="pageHeader">
        <h2 className="heading-title">Supplies</h2>

        <Button variant="cta" onClick={openDialog} icon={<CgMathPlus />}>Add new product</Button>
      </div>

      <dialog className="dialog" ref={dialogRef}>
        <form onSubmit={handleSubmit} method="dialog">
          <h2 className="dialog-title">Add new product</h2>

          <div className="input-group">
            <label className="input-label">Name</label>
            <input value={productName} onChange={(e) => setProductName(e.target.value)} required />
          </div>

          <div className="dialog-buttons">
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button variant="primary" type="submit">Save product</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
