import { AddButton } from '@/src/features/inventory/add/AddButton';
import { DeleteProductButton } from '@/src/features/inventory/delete/DeleteProductButton';
import { EditProductButton } from '@/src/features/inventory/edit/EditProductButton';
import { FilterBar } from '@/src/features/products/FilterBar';
import { ViewBatchButton } from '@/src/features/inventory/batches/ViewBatchButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import { createClient } from '@/src/utils/supabase/server';
import { slugify } from '@/src/utils/slugify';

type SearchParams = {
    query?: string;
    page?: string;
    inventory?: string;
    tab?: string;
    statusFilter?: 'active' | 'inactive' | 'all';
    categoryFilter?: string;
    variantFilter?: string;
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

    const productIds = filteredProducts.map(p => p.id);
    const { data: inventoryAssignments } = await supabase
        .from('product_inventories')
        .select('product_id, inventories(id, inventory_name)')
        .in('product_id', productIds.length > 0 ? productIds : [0]);

    const inventoryNamesMap = new Map<string, string[]>();
    (inventoryAssignments || []).forEach((row: any) => {
        const name = row.inventories?.inventory_name as string | undefined;
        if (!name) return;
        if (!inventoryNamesMap.has(row.product_id)) {
            inventoryNamesMap.set(row.product_id, []);
        }
        inventoryNamesMap.get(row.product_id)!.push(name);
    });

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
                <AddButton categories={categories || []} variants={variants || []} inventories={inventories}/>
            </div>

            {/* Main Content */}
            <div className="content inventory-content">
                <FilterBar
                    statusFilter={statusFilter}
                    categoryFilter={categoryFilter}
                    variantFilter={variantFilter}
                    categories={categories || []}
                    variants={variants || []}
                />

                <table>
                    <thead>
                        <tr>
                            <th>Product name & SKU</th>
                            <th>Category</th>
                            <th>Inventories</th>
                            <th>Status</th>
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
                                    </td>
                                    <td>{(product.categories as any)?.category_name || '-'}</td>
                                    <td>
                                        <div className="badge">
                                            {(inventoryNamesMap.get(product.id) || []).join(', ') || '-'}
                                        </div>
                                    </td>
                                    <td>{product.product_status ? 'Active' : 'Discontinued'}</td>
                                    <td>
                                        <div className="table-actions">
                                            <DeleteProductButton productId={product.id} productName={product.product_name} inventoryId={inventoryId}/>
                                            <ViewBatchButton productId={product.id} />

                                            <EditProductButton
                                                id={product.id}
                                                product_name={product.product_name || ''}
                                                product_category={product.product_category || ''}
                                                product_variant={product.product_variant || ''}
                                                product_status={product.product_status || false}
                                                product_sku={inventoryInfo?.product_sku || ''}
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

            <div className="pagination">
                <Pagination totalPages={totalPages} currentPage={page} />
            </div>
        </main>
    );
}