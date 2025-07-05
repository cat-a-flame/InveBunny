import { DeleteProductButton } from '@/src/features/inventory/delete/DeleteProductButton';
import { FilterBar } from '@/src/features/inventory/FilterBar';
import { EditInventoryItemButton } from '@/src/features/inventory/edit/EditInventoryItemButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import { createClient } from '@/src/utils/supabase/server';
import { slugify } from '@/src/utils/slugify';
import styles from './inventory.module.css';

type SearchParams = {
    query?: string;
    page?: string;
    inventory?: string;
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

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const supabase = await createClient();
    const resolvedSearchParams = await searchParams;

    // ========== PARAM PROCESSING ==========
    const statusFilterRaw = resolvedSearchParams.statusFilter;
    const stockFilterRaw = resolvedSearchParams.stockFilter;
    const statusFilter = statusFilterRaw === 'all' ? 'all' : statusFilterRaw === 'inactive' ? 'inactive' : 'active';
    const stockFilter = isStockFilter(stockFilterRaw) ? stockFilterRaw : 'all';

    const categoryFilter = resolvedSearchParams.categoryFilter
        ? resolvedSearchParams.categoryFilter.split(',').filter(Boolean)
        : [];
    const variantFilter = resolvedSearchParams.variantFilter
        ? resolvedSearchParams.variantFilter.split(',').filter(Boolean)
        : [];
    const page = Math.max(1, parseInt(resolvedSearchParams.page || '1'));
    const query = resolvedSearchParams.query || '';
    const inventorySlug = resolvedSearchParams.inventory;

    // ========== INVENTORY FETCHING & PROCESSING ==========
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


    let selectedInventory = inventorySlug
        ? inventories.find((inv) => slugify(inv.inventory_name) === inventorySlug)
        : undefined;

    if (!selectedInventory) {
        selectedInventory = inventories[0];
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

    let filteredInventories = allProductInventories || [];

    if (stockFilter !== 'all') {
        filteredInventories = filteredInventories.filter((pi) => {
            if (stockFilter === 'low') return pi.product_quantity > 0 && pi.product_quantity <= 5;
            if (stockFilter === 'out') return pi.product_quantity === 0;
            if (stockFilter === 'in') return pi.product_quantity > 5;
            return true;
        });
    }

    const productIdsFromFilters = filteredInventories.map((pi) => pi.product_id);

    // Build base products query (without status filter)
    let productsQuery = supabase
        .from('products')
        .select(`
            id,
            product_name,
            product_category,
            product_status,
            product_variant,
            categories(id, category_name),
            variants(id, variant_name)
        `)
        .order('product_name', { ascending: true })
        .in('id', productIdsFromFilters.length > 0 ? productIdsFromFilters : [0]);

    if (query) {
        const skuMatchedIds = inventoryMatches?.map(i => i.product_id) || [];
        productsQuery = productsQuery.or(
            `product_name.ilike.%${query}%${skuMatchedIds.length ? `,id.in.(${skuMatchedIds.join(',')})` : ''}`
        );
    }

    // Apply filters except status
    if (categoryFilter.length > 0) {
        productsQuery = productsQuery.in('product_category', categoryFilter);
    }

    if (variantFilter.length > 0) {
        productsQuery = productsQuery.in('product_variant', variantFilter);
    }

    const { data: productsBase } = await productsQuery;

    const allFilteredProducts = productsBase || [];

    // Status counts before applying status filter
    const statusCounts = {
        active: allFilteredProducts.filter(p => p.product_status).length,
        inactive: allFilteredProducts.filter(p => !p.product_status).length,
    };

    // Apply status filter in-memory
    const filteredProducts =
        statusFilter === 'active'
            ? allFilteredProducts.filter(p => p.product_status)
            : statusFilter === 'inactive'
                ? allFilteredProducts.filter(p => !p.product_status)
                : allFilteredProducts;

    // ========== DATA PROCESSING ==========
    const totalCount = filteredProducts.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const filteredProductIds = filteredProducts.map(p => p.id);
    const filteredInventoryItems = (filteredInventories || []).filter(pi => filteredProductIds.includes(pi.product_id));

    // Stock calculations
    const lowStockCount = filteredInventoryItems.filter((pi) => pi.product_quantity > 0 && pi.product_quantity <= 5).length;
    const outOfStockCount = filteredInventoryItems.filter((pi) => pi.product_quantity === 0).length;

    const categoryCounts: Record<string, number> = {};
    const variantCounts: Record<string, number> = {};
    filteredProducts.forEach(p => {
        if (p.product_category) {
            categoryCounts[p.product_category] = (categoryCounts[p.product_category] || 0) + 1;
        }
        if (p.product_variant) {
            variantCounts[p.product_variant] = (variantCounts[p.product_variant] || 0) + 1;
        }
    });

    const stockCounts = {
        all: filteredInventoryItems.length,
        low: lowStockCount,
        out: outOfStockCount,
        in: filteredInventoryItems.filter(pi => pi.product_quantity > 5).length,
    };

    // Pagination
    const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const inventoryMap = new Map(
        (filteredInventories || [])
            .filter(pi => pagedProducts.some(p => p.id === pi.product_id))
            .map(pi => [pi.product_id, pi])
    );

    // ========== RENDER ==========
    return (
        <main className="inventory-page">
            {/* Header Section */}
            <div className="pageHeader">
                <div>
                    <h2 className="heading-title">Inventory</h2>
                    <h3 className="heading-subtitle">{selectedInventory?.inventory_name}</h3>
                </div>
            </div>

            {/* Main Content */}
            <div className="content inventory-content">
                <FilterBar
                    statusFilter={statusFilter}
                    categoryFilter={categoryFilter}
                    variantFilter={variantFilter}
                    stockFilter={stockFilter}
                    categories={categories || []}
                    variants={variants || []}
                    categoryCounts={categoryCounts}
                    variantCounts={variantCounts}
                    totalCount={totalCount}
                    statusCounts={statusCounts}
                    stockCounts={stockCounts}
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
                                        <div className={`quantity-badge ${inventoryInfo?.product_quantity === 0 ? 'out-of-stock' : inventoryInfo?.product_quantity <= 5 ? 'low-stock' : ''}`}>
                                            {inventoryInfo?.product_quantity ?? '-'}
                                        </div>
                                    </td>
                                    <td>{(product.categories as any)?.category_name || '-'}</td>
                                    <td>{(product.variants as any)?.variant_name || '-'}</td>
                                    <td className="table-actions">
                                        <DeleteProductButton
                                            productId={product.id}
                                            productName={product.product_name}
                                            inventoryId={inventoryId}
                                        />

                                        <EditInventoryItemButton
                                            productId={product.id}
                                            inventoryId={inventoryId.toString()}
                                            productName={product.product_name || ''}
                                            productCategoryName={(product.categories as any)?.category_name || ''}
                                            productSku={inventoryInfo?.product_sku || ''}
                                            productQuantity={inventoryInfo?.product_quantity ?? 0}
                                        />
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