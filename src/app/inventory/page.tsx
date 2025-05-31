import { AddButton } from './add/AddButton';
import { DeleteProductButton } from './delete/DeleteProductButton';
import { EditProductButton } from './edit/EditProductButton';
import { FilterBar } from './FilterBar';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { InventoryTabs } from './InventoryTabs';
import { Pagination } from '@/src/components/Pagination/pagination';
import { createClient } from '@/src/utils/supabase/server';
import { slugify } from '@/src/utils/slugify';
import styles from './inventory.module.css';

type SearchParams = {
    query?: string;
    page?: string;
    inventory?: string;
    tab?: string;
    statusFilter?: 'active' | 'inactive' | 'all';
    categoryFilter?: string;
    variantFilter?: string;
    stockFilter?: 'all' | 'low' | 'out' | 'in';
};

// ========== CONSTANTS ==========
const validStockFilters = ['all', 'low', 'out', 'in'] as const;
const PAGE_SIZE = 10;

export default async function Home({ searchParams}: {searchParams: Promise<SearchParams>}) {
    const supabase = await createClient();
    const resolvedSearchParams = await searchParams;

    // ========== PARAM PROCESSING ==========
    const statusFilterRaw = resolvedSearchParams.statusFilter;
    const stockFilterRaw = resolvedSearchParams.stockFilter;
    const statusFilter = statusFilterRaw === 'all' ? 'all' : statusFilterRaw === 'inactive' ? 'inactive' : 'active';
    const stockFilter = validStockFilters.includes(stockFilterRaw as any) ? stockFilterRaw : 'all';

    const categoryFilter = resolvedSearchParams.categoryFilter || 'all';
    const variantFilter = resolvedSearchParams.variantFilter || 'all';
    const page = Math.max(1, parseInt(resolvedSearchParams.page || '1'));
    const query = resolvedSearchParams.query || '';
    const inventorySlug = resolvedSearchParams.inventory;
    const tab = resolvedSearchParams.tab || 'active';

    // ========== INVENTORY FETCHING & PROCESSING ==========
    const { data: inventories } = await supabase
        .from('inventories')
        .select('id, inventory_name, is_default')
        .order('inventory_name');

    if (!inventories || inventories.length === 0) {
        return (
            <main>
                <p>No inventories found.</p>
            </main>
        );
    }

    inventories.sort((a, b) => {
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        return 0;
    });

    let selectedInventory = inventorySlug
        ? inventories.find((inv) => slugify(inv.inventory_name) === inventorySlug)
        : undefined;

    if (!selectedInventory) {
        selectedInventory = inventories.find((inv) => inv.is_default) || inventories[0];
    }

    const inventoryId = selectedInventory?.id;

    if (!inventoryId) {
        return (
            <main>
                <p>No inventory selected.</p>
            </main>
        );
    }

    // ========== PRODUCT DATA FETCHING ==========
    // Fetch all product inventories for the selected inventory
    const { data: allProductInventories } = await supabase
        .from('product_inventories')
        .select('id, product_id, product_quantity, product_sku')
        .eq('inventory_id', inventoryId);

    // Filter by stock level if needed
    let filteredByStock = allProductInventories || [];
    if (stockFilter !== 'all') {
        filteredByStock = filteredByStock.filter((pi) => {
            if (stockFilter === 'low') return pi.product_quantity > 0 && pi.product_quantity <= 5;
            if (stockFilter === 'out') return pi.product_quantity === 0;
            if (stockFilter === 'in') return pi.product_quantity > 5;
            return true;
        });
    }

    const productIdsFromStockFilter = filteredByStock.map((pi) => pi.product_id);

    // Search functionality
    const { data: inventoryMatches } = query ? await supabase
        .from('product_inventories')
        .select('product_id')
        .ilike('product_sku', `%${query}%`)
        .eq('inventory_id', inventoryId) : { data: null };

    // Build main products query
    let productsQuery = supabase
        .from('products')
        .select(`
            id,
            product_name,
            product_category,
            product_variant,
            product_status,
            categories(id, category_name),
            variants(id, variant_name)
        `)
        .order('product_name', { ascending: true })
        .in('id', productIdsFromStockFilter.length > 0 ? productIdsFromStockFilter : [0]);

    if (query) {
        const skuMatchedIds = inventoryMatches?.map(i => i.product_id) || [];
        productsQuery = productsQuery.or(`product_name.ilike.%${query}%${skuMatchedIds.length ? `,id.in.(${skuMatchedIds.join(',')})` : ''}`);
    }

    if (query) {
        const skuMatchedIds = inventoryMatches?.map(i => i.product_id) || [];
        productsQuery = productsQuery.or(`product_name.ilike.%${query}%${skuMatchedIds.length ? `,id.in.(${skuMatchedIds.join(',')})` : ''}`);
    }

    // Apply filters
    if (statusFilter === 'active') {
        productsQuery = productsQuery.eq('product_status', true);
    } else if (statusFilter === 'inactive') {
        productsQuery = productsQuery.eq('product_status', false);
    }

    if (categoryFilter !== 'all') {
        productsQuery = productsQuery.eq('product_category', categoryFilter);
    }

    if (variantFilter !== 'all') {
        productsQuery = productsQuery.eq('product_variant', variantFilter);
    }

    const { data: products } = await productsQuery;

    // ========== DATA PROCESSING ==========
    const filteredProducts = products || [];
    const totalCount = filteredProducts.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const filteredProductIds = filteredProducts.map(p => p.id);
    const filteredInventoryItems = (allProductInventories || []).filter(pi => filteredProductIds.includes(pi.product_id));

    // Stock calculations
    const lowStockCount = filteredInventoryItems.filter((pi) => pi.product_quantity > 0 && pi.product_quantity <= 5).length;
    const outOfStockCount = filteredInventoryItems.filter((pi) => pi.product_quantity === 0).length;

    // Pagination
    const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const inventoryMap = new Map(
        (allProductInventories || [])
            .filter(pi => pagedProducts.some(p => p.id === pi.product_id))
            .map(pi => [pi.product_id, pi])
    );

    // ========== SUPPLEMENTARY DATA FETCHING ==========
    const { data: categories } = await supabase
        .from('categories')
        .select('id, category_name')
        .order('category_name');

    const { data: variants } = await supabase
        .from('variants')
        .select('id, variant_name')
        .order('variant_name');

    // ========== RENDER ==========
    return (
        <main className="inventory-page">
            {/* Header Section */}
            <div className="pageHeader">
                <h2 className="heading-title">Inventory</h2>
                <AddButton categories={categories || []} variants={variants || []} inventories={inventories}/>
            </div>

            {/* Inventory Tabs */}
            <InventoryTabs inventories={inventories} selectedInventory={selectedInventory} tab={tab}/>

            {/* Main Content */}
            <div className="content inventory-content">
                <FilterBar
                    statusFilter={statusFilter}
                    categoryFilter={categoryFilter}
                    variantFilter={variantFilter}
                    stockFilter={stockFilter}
                    categories={categories || []}
                    variants={variants || []}
                />

                {/* Products Table */}
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
                        {pagedProducts.map((product) => {
                            const inventoryInfo = inventoryMap.get(product.id);
                            return (
                                <tr key={product.id}>
                                    <td>
                                        <span className="item-name">{product.product_name}</span>
                                        <span className="item-sku">{inventoryInfo?.product_sku || '-'}</span>
                                    </td>
                                    <td>
                                        <div className={`quantity-badge ${inventoryInfo?.product_quantity === 0 ? 'out-of-stock': inventoryInfo?.product_quantity <= 5 ? 'low-stock': ''}`}>
                                            {inventoryInfo?.product_quantity ?? '-'}
                                        </div>
                                    </td>
                                    <td>{product.categories?.category_name || '-'}</td>
                                    <td>{product.variants?.variant_name || '-'}</td>
                                    <td>
                                        <div className="table-actions">
                                            <DeleteProductButton productId={product.id} productName={product.product_name} inventoryId={inventoryId}/>
                                            <IconButton icon={<i className="fa-solid fa-layer-group"></i>} title="Batches" />

                                            <EditProductButton
                                                id={product.id}
                                                product_name={product.product_name || ''}
                                                product_category={product.product_category || ''}
                                                product_variant={product.product_variant || ''}
                                                product_status={product.product_status || false}
                                                product_sku={inventoryInfo?.product_sku || ''}
                                                product_quantity={inventoryInfo?.product_quantity || 0}
                                                categories={categories || []}
                                                variants={variants || []}
                                                inventories={inventories}
                                                currentInventoryId={inventoryId}
                                                productInventories={filteredByStock}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer Section */}
            <div className="pagination inventory-page">
                <div className={styles['inventory-summary']}>
                    <div className={styles.total}>
                        <strong>{totalCount}</strong> products
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