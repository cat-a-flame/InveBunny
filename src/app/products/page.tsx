import { AddButton } from '@/src/features/products/add/AddButton';
import { DeleteProductButton } from '@/src/features/products/delete/DeleteProductButton';
import { EditProductButton } from '@/src/features/products/edit/EditProductButton';
import { FilterBar } from '@/src/features/products/FilterBar';
import { ViewBatchButton } from '@/src/features/products/batches/ViewBatchButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import { createClient } from '@/src/utils/supabase/server';
import styles from './products.module.css';

type SearchParams = {
  query?: string;
  page?: string;
  statusFilter?: 'active' | 'inactive' | 'all';
  variantFilter?: string;
  categoryFilter?: string;
};

const PAGE_SIZE = 10;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;

  const statusFilterRaw = resolvedSearchParams.statusFilter;
  const statusFilter = statusFilterRaw === 'all' ? 'all' : statusFilterRaw === 'inactive' ? 'inactive' : 'active';

  const categoryFilter = resolvedSearchParams.categoryFilter
    ? resolvedSearchParams.categoryFilter.split(',').filter(Boolean)
    : [];
  const variantFilter = resolvedSearchParams.variantFilter
    ? resolvedSearchParams.variantFilter.split(',').filter(Boolean)
    : [];
  const page = Math.max(1, parseInt(resolvedSearchParams.page || '1'));
  const query = resolvedSearchParams.query || '';

  const { data: inventories } = await supabase
    .from('inventories')
    .select('id, inventory_name')
    .order('inventory_name');

  if (!inventories || inventories.length === 0) {
    return (
      <main>
        <p>No inventories found.</p>
      </main>
    );
  }

  const categoriesPromise = supabase
    .from('categories')
    .select('id, category_name')
    .order('category_name');

  const variantsPromise = supabase
    .from('variants')
    .select('id, variant_name')
    .order('variant_name');

  const [{ data: categories }, { data: variants }] = await Promise.all([
    categoriesPromise,
    variantsPromise,
  ]);

   let productsQuery = supabase
     .from('products')
     .select(`
       id,
       product_name,
       product_category,
       product_status,
       categories(id, category_name),
       product_variants(
         id,
         variant_id,
         variants(id, variant_name),
         product_variant_inventories(id, inventory_id, inventories(id, inventory_name))
       )
     `)
     .order('product_name', { ascending: true });

   if (query) {
     productsQuery = productsQuery.ilike('product_name', `%${query}%`);
   }

   if (categoryFilter.length > 0) {
     productsQuery = productsQuery.in('product_category', categoryFilter);
   }

   const { data: productsBase } = await productsQuery;

   let allFilteredProducts = productsBase || [];
   if (variantFilter.length > 0) {
     allFilteredProducts = allFilteredProducts.filter((p: any) =>
       (p.product_variants || []).some((pv: any) => variantFilter.includes(pv.variant_id))
     );
   }

   const statusCounts = {
     active: allFilteredProducts.filter((p: any) => p.product_status).length,
     inactive: allFilteredProducts.filter((p: any) => !p.product_status).length,
   };

   const filteredProducts =
     statusFilter === 'active'
       ? allFilteredProducts.filter((p: any) => p.product_status)
       : statusFilter === 'inactive'
       ? allFilteredProducts.filter((p: any) => !p.product_status)
       : allFilteredProducts;

   const totalCount = filteredProducts.length;
   const totalPages = Math.ceil(totalCount / PAGE_SIZE);

   const categoryCounts: Record<string, number> = {};
   const variantCounts: Record<string, number> = {};

   filteredProducts.forEach((p: any) => {
     if (p.product_category) {
       categoryCounts[p.product_category] = (categoryCounts[p.product_category] || 0) + 1;
     }
     (p.product_variants || []).forEach((pv: any) => {
       if (pv.variant_id) {
         variantCounts[pv.variant_id] = (variantCounts[pv.variant_id] || 0) + 1;
       }
     });
   });

   const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

   return (
     <div className="inventory-page">
       <div className="pageHeader">
         <h2 className="heading-title">Products</h2>
         <AddButton categories={categories || []} variants={variants || []} inventories={inventories} />
       </div>

       <div className="content inventory-content">
         <FilterBar
           statusFilter={statusFilter}
           categoryFilter={categoryFilter}
           categories={categories || []}
           variants={variants || []}
           variantFilter={variantFilter}
           categoryCounts={categoryCounts}
           variantCounts={variantCounts}
           totalCount={totalCount}
           statusCounts={statusCounts}
         />

         <table>
           <thead>
             <tr>
               <th>Product name</th>
               <th>Category</th>
               <th>Variant</th>
               <th>Inventories</th>
               <th></th>
             </tr>
           </thead>
           <tbody>
             {pagedProducts.map((product: any) => {
               const variantNames = (product.product_variants || [])
                 .map((pv: any) => (pv.variants as any)?.variant_name)
                 .filter(Boolean)
                 .join(', ');

               const inventoryNames = Array.from(
                 new Set(
                   (product.product_variants || []).flatMap((pv: any) =>
                     (pv.product_variant_inventories || []).map((inv: any) => inv.inventories?.inventory_name).filter(Boolean)
                   )
                 )
               );

               const productInventories = (product.product_variants?.[0]?.product_variant_inventories || []).map((inv: any) => ({
                 id: inv.id,
                 inventory_id: inv.inventory_id,
                 product_id: product.id,
               }));

               return (
                 <tr key={product.id}>
                   <td>
                     <span className="item-name">{product.product_name}</span>
                   </td>
                   <td>{(product.categories as any)?.category_name || '-'}</td>
                   <td>{variantNames || '-'}</td>
                   <td>
                     {inventoryNames.length > 0
                       ? inventoryNames.map((name, index) => (
                           <span className={styles.badge} key={index}>
                             {name}
                           </span>
                         ))
                       : '-'}
                   </td>
                   <td>
                     <div className="table-actions">
                       <DeleteProductButton productId={product.id} productName={product.product_name} inventoryId="" />
                       <ViewBatchButton productId={product.id} />
                       <EditProductButton
                         id={product.id}
                         product_name={product.product_name || ''}
                         product_category={product.product_category || ''}
                         product_variant={(product.product_variants?.[0]?.variant_id) || ''}
                         product_status={product.product_status || false}
                         categories={categories || []}
                         variants={variants || []}
                         inventories={inventories}
                         productInventories={productInventories}
                       />
                     </div>
                   </td>
                 </tr>
               );
             })}
           </tbody>
         </table>
       </div>

       <div className="pagination total-count">
         <div className={styles.summary}>
           <div className={styles.total}>
             Total <strong>{totalCount}</strong> products
           </div>
         </div>

         <Pagination totalPages={totalPages} currentPage={page} />
       </div>
     </div>
   );
 }
