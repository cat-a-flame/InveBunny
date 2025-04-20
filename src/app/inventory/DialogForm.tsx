'use client';

import { useEffect, useRef, useState } from 'react';
import { CgMathPlus } from "react-icons/cg";
import { Button } from "../../components/Button/button";
import { useToast } from '../../components/Toast/toast';

type Product = {
  id: string;
  product_name: string;
  product_sku: string;
  product_quantity: number;
  category_id: string;
  variant_id: string;
};

type DialogFormProps = {
  productToEdit?: Product | null;
  onSave?: () => void;
};

export function DialogForm({ productToEdit = null, onSave }: DialogFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);

  const toast = useToast();

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  useEffect(() => {
    fetch('/api/variants')
      .then(res => res.json())
      .then(data => setVariants(data.variants || []));
  }, []);

  useEffect(() => {
    if (productToEdit) {
      setProductName(productToEdit.product_name);
      setSku(productToEdit.product_sku);
      setQuantity(productToEdit.product_quantity);
      setCategoryId(productToEdit.category_id);
      setVariantId(productToEdit.variant_id);
      dialogRef.current?.showModal();
    }
  }, [productToEdit]);

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => {
    dialogRef.current?.close();
    resetForm();
  };

  const resetForm = () => {
    setProductName('');
    setSku('');
    setQuantity(0);
    setCategoryId('');
    setVariantId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = productToEdit
      ? `/api/inventory/updateProduct?id=${productToEdit.id}`
      : '/api/inventory/addNewProduct';

    const method = productToEdit ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
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
      toast(productToEdit ? 'Product updated!' : 'Product created!');
      closeDialog();
      onSave?.();
    } else {
      toast(`Error: ${result.error}`);
    }
  };

  return (
    <>
      {!productToEdit && (
        <div className="pageHeader">
          <h2 className="heading-title">Inventory</h2>
          <Button variant="cta" onClick={openDialog} icon={<CgMathPlus />}>
            Add new product
          </Button>
        </div>
      )}

      <dialog className="dialog" ref={dialogRef}>
        <form onSubmit={handleSubmit} method="dialog">
          <h2 className="dialog-title">
            {productToEdit ? 'Edit product' : 'Add new product'}
          </h2>

          <div className="input-group">
            <label className="input-label">Name</label>
            <input value={productName} onChange={(e) => setProductName(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">SKU</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">Quantity</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
          </div>

          <div className="input-group">
            <label className="input-label">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Select a category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Variant</label>
            <select value={variantId} onChange={(e) => setVariantId(e.target.value)} required>
              <option value="">Select a variant</option>
              {variants.map((variant: any) => (
                <option key={variant.id} value={variant.id}>{variant.variant_name}</option>
              ))}
            </select>
          </div>

          <div className="dialog-buttons">
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button variant="primary" type="submit">
              {productToEdit ? 'Update product' : 'Save product'}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
