'use client';

import { useEffect, useRef, useState } from 'react';

export function DialogForm() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  // Fetch variants
  useEffect(() => {
    fetch('/api/variants')
      .then(res => res.json())
      .then(data => setVariants(data.variants || []));
  }, []);

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
      alert('Product created!');
      closeDialog();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <>
      <button onClick={openDialog}>Add New Product</button>

      <dialog ref={dialogRef}>
        <form onSubmit={handleSubmit} method="dialog">
          <h2>Add Product</h2>

          <label>
            Name:
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </label>

          <label>
            SKU:
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </label>

          <label>
            Quantity:
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </label>

          <label>
            Category:
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Variant:
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              required
            >
              <option value="">Select variant</option>
              {variants.map((variant: any) => (
                <option key={variant.id} value={variant.id}>
                  {variant.variant_name}
                </option>
              ))}
            </select>
          </label>

          <div style={{ marginTop: '1rem' }}>
            <button type="submit">Save</button>
            <button type="button" onClick={closeDialog}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
