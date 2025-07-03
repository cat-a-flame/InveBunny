import { DeleteProductButton } from '@/src/features/products/delete/DeleteProductButton';
import { FilterBar } from '@/src/features/inventory/FilterBar';
import { ViewBatchButton } from '@/src/features/products/batches/ViewBatchButton';
import { InventoryTabs } from '@/src/features/inventory/InventoryTabs';
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
type StockFilter = (typeof validStockFilters)[number];

function isStockFilter(value: unknown): value is StockFilter {
  return typeof value === 'string' && validStockFilters.includes(value as StockFilter);
}

const PAGE_SIZE = 10;

export default async function Home({ searchParams}: {searchParams: Promise<SearchParams>}) {
    const supabase = await createClient();
    const resolvedSearchParams = await searchParams;

    // ========== PARAM PROCESSING ==========
    const statusFilterRaw = resolvedSearchParams.statusFilter;
    const stockFilterRaw = resolvedSearchParams.stockFilter;
    const statusFilter = statusFilterRaw === 'all' ? 'all' : statusFilterRaw === 'inactive' ? 'inactive' : 'active';
    const stockFilter = isStockFilter(stockFilterRaw) ? stockFilterRaw : 'all';

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
    // Prepare queries that don't depend on each other's results
    const productInventoriesPromise = supabase
        .from('product_inventories')
        .select('id, product_id, product_quantity, product_sku, inventory_id')
        .eq('inventory_id', inventoryId);

    const inventoryMatchesPromise = query ?
        supabase
            .from('product_inventories')
            .select('product_id')
            .ilike('product_sku', `%${query}%`)
            .eq('inventory_id', inventoryId) :
        Promise.resolve({ data: null });

    const categoriesPromise = supabase
        .from('categories')
        .select('id, category_name')
        .order('category_name');

    const variantsPromise = supabase
        .from('variants')
        .select('id, variant_name')
        .order('variant_name');

    const [{ data: allProductInventories }, { data: inventoryMatches }, { data: categories }, { data: variants }] =
        await Promise.all([productInventoriesPromise, inventoryMatchesPromise, categoriesPromise, variantsPromise]);

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
        productsQuery = productsQuery.or(
            `product_name.ilike.%${query}%${skuMatchedIds.length ? `,id.in.(${skuMatchedIds.join(',')})` : ''}`
        );
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

    // ========== RENDER ==========
    return (
        <main className="inventory-page">
            {/* Header Section */}
            <div className="pageHeader">
                <h2 className="heading-title">Inventory</h2>
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
                                    <td>{(product.categories as any)?.category_name || '-'}</td>
                                    <td>{(product.variants as any)?.variant_name || '-'}</td>
                                    <td>
                                        <div className="table-actions">
                                            <DeleteProductButton productId={product.id} productName={product.product_name} inventoryId={inventoryId}/>
                                            <ViewBatchButton productId={product.id} />

                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="pagination total-count">
                <div className={styles['inventory-summary']}>
                    <div className={styles.total}>
                        <strong>{totalCount}</strong> products
                    </div>

                    <div className={styles['stock-info']}>
                        <span className={`${styles['low-stock']} ${styles['stock-status']}`}>
                            <span className={styles.status}></span> Low stock: {lowStockCount}
                        </span>
                        <span className={`${styles['out-of-stock']} ${styles['stock-status']}`}>
                            <span className={styles.status}></span> Out of stock: {outOfStockCount}
                        </span>
                    </div>
                </div>

                <Pagination totalPages={totalPages} currentPage={page} />
            </div>
        </main>
    );
}