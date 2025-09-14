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
    sortField?: 'name' | 'date';
    sortOrder?: 'asc' | 'desc';
};

const validStockFilters = ['all', 'low', 'out', 'in'] as const;
type StockFilter = (typeof validStockFilters)[number];

function isStockFilter(value: unknown): value is StockFilter {
    return typeof value === 'string' && validStockFilters.includes(value as StockFilter);
}

const PAGE_SIZE = 10;

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const supabase = await createClient();
    const resolvedSearchParams = await searchParams;

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
    const sortFieldRaw = resolvedSearchParams.sortField;
    const sortOrderRaw = resolvedSearchParams.sortOrder;
    const sortField = sortFieldRaw === 'date' ? 'date' : 'name';
    const sortOrder = sortOrderRaw === 'desc' ? 'desc' : 'asc';

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

    const categoriesPromise = supabase
        .from('categories')
        .select('id, category_name')
        .order('category_name');

    const variantsPromise = supabase
        .from('variants')
        .select('id, variant_name')
        .order('variant_name');

    const itemsPromise = supabase
        .from('product_variant_inventories')
        .select(`
            id,
            product_sku,
            product_quantity,
            product_details,
            product_variant_id,
            product_variants (
                product_id,
                variants ( id, variant_name ),
                products (
                    id,
                    product_name,
                    product_status,
                    product_category,
                    created_at,
                    categories ( id, category_name )
                )
            )
        `)
        .eq('inventory_id', inventoryId);

    const [{ data: allItems }, { data: categories }, { data: variants }] =
        await Promise.all([itemsPromise, categoriesPromise, variantsPromise]);

    let filteredItems = (allItems || []).map(item => {
        const pv = Array.isArray(item.product_variants)
            ? item.product_variants[0]
            : item.product_variants;
        const product = Array.isArray(pv?.products) ? pv.products[0] : pv?.products;
        const variant = Array.isArray(pv?.variants) ? pv.variants[0] : pv?.variants;
        return {
            ...item,
            product_variants: {
                ...pv,
                products: product,
                variants: variant,
            },
        };
    }) as any[];

    if (query) {
        const q = query.toLowerCase();
        filteredItems = filteredItems.filter(item => {
            const productName = item.product_variants?.products?.product_name;
            return (
                item.product_sku?.toLowerCase().includes(q) ||
                productName?.toLowerCase().includes(q)
            );
        });
    }

    if (stockFilter !== 'all') {
        filteredItems = filteredItems.filter(item => {
            if (stockFilter === 'low') return item.product_quantity > 0 && item.product_quantity <= 5;
            if (stockFilter === 'out') return item.product_quantity === 0;
            if (stockFilter === 'in') return item.product_quantity > 5;
            return true;
        });
    }

    if (categoryFilter.length > 0) {
        filteredItems = filteredItems.filter(item =>
            item.product_variants?.products?.product_category &&
            categoryFilter.includes(item.product_variants.products.product_category.toString())
        );
    }

    if (variantFilter.length > 0) {
        filteredItems = filteredItems.filter(item =>
            item.product_variants?.variants?.id &&
            variantFilter.includes(item.product_variants.variants.id.toString())
        );
    }

    const preStatusItems = filteredItems;

    const statusCounts = {
        active: preStatusItems.filter(i => i.product_variants?.products?.product_status).length,
        inactive: preStatusItems.filter(i => !i.product_variants?.products?.product_status).length,
    };

    filteredItems = statusFilter === 'active'
        ? preStatusItems.filter(i => i.product_variants?.products?.product_status)
        : statusFilter === 'inactive'
            ? preStatusItems.filter(i => !i.product_variants?.products?.product_status)
            : preStatusItems;

    const lowStockCount = filteredItems.filter(i => i.product_quantity > 0 && i.product_quantity <= 5).length;
    const outOfStockCount = filteredItems.filter(i => i.product_quantity === 0).length;

    const categoryCounts: Record<string, number> = {};
    const variantCounts: Record<string, number> = {};
    preStatusItems.forEach(item => {
        const cat = item.product_variants?.products?.product_category;
        if (cat) {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
        const variantId = item.product_variants?.variants?.id;
        if (variantId) {
            variantCounts[variantId] = (variantCounts[variantId] || 0) + 1;
        }
    });

    const stockCounts = {
        all: preStatusItems.length,
        low: preStatusItems.filter(i => i.product_quantity > 0 && i.product_quantity <= 5).length,
        out: preStatusItems.filter(i => i.product_quantity === 0).length,
        in: preStatusItems.filter(i => i.product_quantity > 5).length,
    };

    filteredItems.sort((a, b) => {
        if (sortField === 'date') {
            const aDate = new Date(a.product_variants?.products?.created_at || '').getTime();
            const bDate = new Date(b.product_variants?.products?.created_at || '').getTime();
            return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        }
        const aName = a.product_variants?.products?.product_name?.toLowerCase() || '';
        const bName = b.product_variants?.products?.product_name?.toLowerCase() || '';
        return sortOrder === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    });

    const totalCount = filteredItems.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <main className="inventory-page">
            <div className="pageHeader">
                <div>
                    <h2 className="heading-title">Inventory</h2>
                    <h3 className="heading-subtitle">{selectedInventory?.inventory_name}</h3>
                </div>
            </div>

            <div className="content inventory-content">
                <FilterBar
                    statusFilter={statusFilter}
                    categoryFilter={categoryFilter}
                    variantFilter={variantFilter}
                    stockFilter={stockFilter}
                    sortField={sortField}
                    sortOrder={sortOrder}
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
                        {pagedItems.map(item => {
                            const product = item.product_variants?.products;
                            const variant = item.product_variants?.variants;
                            return (
                                <tr key={item.id}>
                                    <td>
                                        <span className="item-name">{product?.product_name}</span>
                                        <span className="item-sku">{item.product_sku || '-'}</span>
                                    </td>
                                    <td>
                                        <div className={`quantity-badge ${item.product_quantity === 0 ? 'out-of-stock' : item.product_quantity <= 5 ? 'low-stock' : ''}`}>
                                            {item.product_quantity ?? '-'}
                                        </div>
                                    </td>
                                    <td>{(product?.categories as any)?.category_name || '-'}</td>
                                    <td>{variant?.variant_name || '-'}</td>
                                    <td className="table-actions">
                                        <DeleteProductButton
                                            inventoryItemId={item.id}
                                            productName={product?.product_name || ''}
                                        />
                                        <EditInventoryItemButton
                                            inventoryItemId={item.id}
                                            productName={product?.product_name || ''}
                                            productCategoryName={(product?.categories as any)?.category_name || ''}
                                            productSku={item.product_sku || ''}
                                            productQuantity={item.product_quantity ?? 0}
                                            productDetails={item.product_details || ''}
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

