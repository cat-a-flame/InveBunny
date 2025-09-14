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

// ========== CONSTANTS ==========
const PAGE_SIZE = 10;

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const supabase = await createClient();
    const resolvedSearchParams = await searchParams;

    // ========== PARAM PROCESSING ==========
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

    // ========== INVENTORY FETCHING ==========
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



    // ========== PRODUCT DATA FETCHING ==========
    // Prepare queries that don't depend on each other's results
    const productInventoriesPromise = supabase
        .from('product_inventories')
        .select('id, product_id, inventory_id');

    const categoriesPromise = supabase
        .from('categories')
        .select('id, category_name')
        .order('category_name');

    const variantsPromise = supabase
        .from('variants')
        .select('id, variant_name')
        .order('variant_name');

    const [{ data: productInventories }, { data: categories }, { data: variants }] =
        await Promise.all([productInventoriesPromise, categoriesPromise, variantsPromise]);

    // Build base products query (without status filter)
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
        .order('product_name', { ascending: true });

    if (query) {
        productsQuery = productsQuery.ilike('product_name', `%${query}%`);
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

    const statusCounts = {
        active: allFilteredProducts.filter(p => p.product_status).length,
        inactive: allFilteredProducts.filter(p => !p.product_status).length,
    };

    const filteredProducts =
        statusFilter === 'active'
            ? allFilteredProducts.filter(p => p.product_status)
            : statusFilter === 'inactive'
                ? allFilteredProducts.filter(p => !p.product_status)
                : allFilteredProducts;

    // ========== DATA PROCESSING ==========
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


    // Pagination
    const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ========== RENDER ==========
    return (
        <div className="inventory-page">
            {/* Header Section */}
            <div className="pageHeader">
                <h2 className="heading-title">Products</h2>
                <AddButton categories={categories || []} variants={variants || []} inventories={inventories} />
            </div>

            {/* Main Content */}
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
                        {pagedProducts.map((product) => {
                            return (
                                <tr key={product.id}>
                                    <td>
                                        <span className="item-name">{product.product_name}</span>
                                    </td>
                                    <td>{(product.categories as any)?.category_name || '-'}</td>
                                    <td>{(product.variants as any)?.variant_name || '-'}</td>
                                    <td>
                                        {(inventoryNamesMap.get(product.id) || []).length > 0
                                            ? (inventoryNamesMap.get(product.id) || []).map((name, index) => (
                                                <span className={styles.badge} key={index}>{name}</span>
                                            )) : '-'}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <DeleteProductButton productId={product.id} productName={product.product_name} inventoryId="" />
                                            <ViewBatchButton productId={product.id} />

                                            <EditProductButton
                                                id={product.id}
                                                product_name={product.product_name || ''}
                                                product_category={product.product_category || ''}
                                                product_status={product.product_status || false}
                                                categories={categories || []}
                                                variants={variants || []}
                                                inventories={inventories}
                                                currentInventoryId=""
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