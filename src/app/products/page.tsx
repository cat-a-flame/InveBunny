import { AddButton } from '@/src/features/products/add/AddButton';
import { DeleteProductButton } from '@/src/features/products/delete/DeleteProductButton';
import { EditProductButton } from '@/src/features/products/edit/EditProductButton';
import { FilterBar } from '@/src/features/products/FilterBar';
import { ViewBatchButton } from '@/src/features/products/batches/ViewBatchButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import { createClient } from '@/src/utils/supabase/server';

type SearchParams = {
    query?: string;
    page?: string;
    statusFilter?: 'active' | 'inactive' | 'all';
    categoryFilter?: string;
};

// ========== CONSTANTS ==========
const PAGE_SIZE = 10;

export default async function Home({ searchParams}: {searchParams: Promise<SearchParams>}) {
    const supabase = await createClient();
    const resolvedSearchParams = await searchParams;

    // ========== PARAM PROCESSING ==========
    const statusFilterRaw = resolvedSearchParams.statusFilter;
    const statusFilter = statusFilterRaw === 'all' ? 'all' : statusFilterRaw === 'inactive' ? 'inactive' : 'active';

    const categoryFilter = resolvedSearchParams.categoryFilter || 'all';
    const page = Math.max(1, parseInt(resolvedSearchParams.page || '1'));
    const query = resolvedSearchParams.query || '';

    // ========== INVENTORY FETCHING ==========
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

    // ========== PRODUCT DATA FETCHING ==========
    // Prepare queries that don't depend on each other's results
    const productInventoriesPromise = supabase
        .from('product_inventories')
        .select('id, product_id, inventory_id');

    const categoriesPromise = supabase
        .from('categories')
        .select('id, category_name')
        .order('category_name');

    const [{ data: productInventories }, { data: categories }] =
        await Promise.all([productInventoriesPromise, categoriesPromise]);

    // Build main products query
    let productsQuery = supabase
        .from('products')
        .select(`
            id,
            product_name,
            product_category,
            product_status,
            categories(id, category_name)
        `)
        .order('product_name', { ascending: true });

    if (query) {
        productsQuery = productsQuery.ilike('product_name', `%${query}%`);
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


    // ========== RENDER ==========
    return (
        <main className="inventory-page">
            {/* Header Section */}
            <div className="pageHeader">
                <h2 className="heading-title">Products</h2>
                <AddButton categories={categories || []} inventories={inventories}/>
            </div>

            {/* Main Content */}
            <div className="content inventory-content">
                <FilterBar
                    statusFilter={statusFilter}
                    categoryFilter={categoryFilter}
                    categories={categories || []}
                />

                <table>
                    <thead>
                        <tr>
                            <th>Product name</th>
                            <th>Category</th>
                            <th>Inventories</th>
                            <th>Status</th>
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
                                    <td>
                                        <div className="badge">
                                            {(inventoryNamesMap.get(product.id) || []).join(', ') || '-'}
                                        </div>
                                    </td>
                                    <td>{product.product_status ? 'Active' : 'Discontinued'}</td>
                                    <td>
                                        <div className="table-actions">
                                            <DeleteProductButton productId={product.id} productName={product.product_name} inventoryId=""/>
                                            <ViewBatchButton productId={product.id} />

                                            <EditProductButton
                                                id={product.id}
                                                product_name={product.product_name || ''}
                                                product_category={product.product_category || ''}
                                                product_status={product.product_status || false}
                                                product_sku=""
                                                product_quantity={0}
                                                categories={categories || []}
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

            <div className="pagination">
                <Pagination totalPages={totalPages} currentPage={page} />
            </div>
        </main>
    );
}