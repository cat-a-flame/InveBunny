import React from 'react';
import { AddButton } from '@/src/features/products/add/AddButton';
import { createClient } from '@/src/utils/supabase/server';
import styles from './products.module.css';

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: inventories } = await supabase
    .from('inventories')
    .select('id, inventory_name')
    .order('inventory_name');

  const { data: categories } = await supabase
    .from('categories')
    .select('id, category_name')
    .order('category_name');

  const { data: variants } = await supabase
    .from('variants')
    .select('id, variant_name')
    .order('variant_name');

  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      product_name,
      product_category,
      product_status,
      product_details,
      categories(id, category_name),
      product_variants(
        id,
        variants(id, variant_name),
        product_variant_inventories(
          inventory_id,
          product_sku,
          product_quantity,
          inventories(id, inventory_name)
        )
      )
    `)
    .order('product_name');

  return (
    <div className="inventory-page">
      <div className="pageHeader">
        <h2 className="heading-title">Products</h2>
        <AddButton
          categories={categories || []}
          variants={variants || []}
          inventories={inventories || []}
        />
      </div>

      <div className="content inventory-content">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Variants</th>
            </tr>
          </thead>
          <tbody>
            {(products || []).map((product: any) => (
              <React.Fragment key={product.id}>
                <tr>
                  <td>
                    <span className="item-name">{product.product_name}</span>
                  </td>
                  <td>{(product.categories as any)?.category_name || '-'}</td>
                  <td>
                    {(product.product_variants || []).map((pv: any) => (
                      <div key={pv.id} className={styles.variantRow}>
                        <strong>{(pv.variants as any)?.variant_name || '-'}:</strong>
                        {(pv.product_variant_inventories || []).map((inv: any) => (
                          <div key={inv.inventory_id} className={styles.inventoryInfo}>
                            {inv.inventories?.inventory_name}: {inv.product_sku} ({inv.product_quantity})
                          </div>
                        ))}
                      </div>
                    ))}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

