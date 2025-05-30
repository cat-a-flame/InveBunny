import { AddButton } from './add/AddButton';
import { createClient } from '@/src/utils/supabase/server';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { DeleteProductButton } from './delete/DeleteProductButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import styles from './inventory.module.css';
import { EditProductButton } from './edit/EditProductButton';
import { slugify } from '@/src/utils/slugify';

type SearchParams = {
    page?: string;
    query?: string;
    inventory?: string;
};

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient();

    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || '1');
    const query = resolvedSearchParams.query || '';
    const inventorySlug = resolvedSearchParams.inventory;

    const { data: inventories } = await supabase
        .from('inventories')
        .select('id, inventory_name, is_default')
        .order('inventory_name');

    inventories.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));

    let selectedInventory = inventorySlug ? inventories.find(inv => slugify(inv.inventory_name) === inventorySlug) : undefined;

    if (!selectedInventory) {
        selectedInventory = inventories.find(inv => inv.is_default) || inventories[0];
    }

    const inventoryId = selectedInventory?.id;

    if (!inventoryId) {
        return (
            <main>
                <p>No inventories found.</p>
            </main>
        );
    }

    const pageSize = 10;

    const { data: productInventories, count: productInventoriesCount } = await supabase
        .from('product_inventories')
        .select('id, product_id, product_quantity, product_sku, product_status', { count: 'exact' })
        .eq('inventory_id', inventoryId)
        .range((page - 1) * pageSize, page * pageSize - 1);

    const productIds = productInventories?.map(pi => pi.product_id) || [];

    const { data: products } = await supabase
        .from('products')
        .select(`
            id,
            product_name,
            product_category,
            product_variant,
            categories(id, category_name),
            variants(id, variant_name)
        `)
        .in('id', productIds)
        .order('product_name', { ascending: true });

    const inventoryMap = new Map(productInventories?.map(pi => [pi.product_id, pi]));

    products?.sort((a, b) => a.product_name.localeCompare(b.product_name));

    const { data: categories } = await supabase
        .from('categories')
        .select('id, category_name')
        .order('category_name');

    const { data: variants } = await supabase
        .from('variants')
        .select('id, variant_name')
        .order('variant_name');

    const totalProducts = productInventories?.length || 0;
    const lowStockCount = productInventories?.filter(p => p.product_quantity > 0 && p.product_quantity <= 5).length || 0;
    const outOfStockCount = productInventories?.filter(p => p.product_quantity === 0).length || 0;

    const totalCount = productInventoriesCount ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <main>
            <div className="pageHeader">
                <h2 className="heading-title">Inventory</h2>
                <AddButton categories={categories || []} variants={variants} inventories={inventories} />
            </div>

            <ul className="tabs">
                {inventories.map(inv => {
                    const invSlug = slugify(inv.inventory_name);
                    return (
                        <li key={inv.id} className={invSlug === slugify(selectedInventory.inventory_name) ? 'active' : ''}>
                            <a href={`/inventory?inventory=${invSlug}`}>{inv.inventory_name}</a>
                        </li>
                    );
                })}
            </ul>

            <div className="content inventory-content">
                <table>
                    <thead>
                        <tr>
                            <th>Product name & SKU</th>
                            <th>Quantity</th>
                            <th>Category</th>
                            <th>Variant</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.map(product => {
                            const inventoryInfo = inventoryMap.get(product.id);
                            return (
                                <tr key={product.id}>
                                    <td>
                                        <span className="item-name">{product.product_name}</span>
                                        <span className="item-sku">{inventoryInfo?.product_sku || '-'}</span>
                                    </td>
                                    <td>
                                        <div className={`quantity-badge ${inventoryInfo?.product_quantity === 0 ? 'out-of-stock' : inventoryInfo?.product_quantity <= 5 ? 'low-stock' : ''}`}>
                                            {inventoryInfo?.product_quantity ?? '-'}
                                        </div>
                                    </td>
                                    <td>{product.categories?.category_name || '-'}</td>
                                    <td>{product.variants?.variant_name || '-'}</td>
                                    <td>
                                        <div className="table-actions">
                                            <DeleteProductButton productId={product.id} productName={product.product_name} inventoryId={inventoryId} />
                                            <IconButton icon={<i className="fa-solid fa-layer-group"></i>} title="Batches" />

                                            <EditProductButton
                                                id={product.id}
                                                product_name={product.product_name || ''}
                                                product_category={product.product_category || ''}
                                                product_variant={product.product_variant || ''}
                                                product_status={inventoryInfo?.product_status || false}
                                                product_sku={inventoryInfo?.product_sku || ''}
                                                product_quantity={inventoryInfo?.product_quantity || 0}
                                                categories={categories}
                                                variants={variants}
                                                inventories={inventories}
                                                currentInventoryId={inventoryId}
                                                productInventories={productInventories || []}
                                            />

                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="pagination inventory-page">
                <div className={styles['inventory-summary']}>
                    <div className={styles.total}>
                        <strong>{totalProducts}</strong> products
                    </div>

                    <div className={styles['stock-info']}>
                        <span className={`${styles['low-stock']} ${styles['stock-status']}`}>
                            <span></span> Low stock: {lowStockCount}
                        </span>
                        <span className={`${styles['out-of-stock']} ${styles['stock-status']}`}>
                            <span></span> Out of stock: {outOfStockCount}
                        </span>
                    </div>
                </div>

                <Pagination totalPages={totalPages} currentPage={page} />
            </div>
        </main>
    );
}
