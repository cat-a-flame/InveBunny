import { AddButton } from './add/AddButton';
import { createClient } from '@/src/utils/supabase/server';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { DialogForm } from './DialogForm';
import { DeleteProductButton } from './delete/DeleteProductButton';
import { Pagination } from '@/src/components/Pagination/pagination';
import styles from './inventory.module.css';
import { EditProductButton } from './edit/EditProductButton';

type SearchParams = {
    page?: string;
    query?: string;
};

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient();

    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || "1");
    const query = resolvedSearchParams.query || "";
    const pageSize = 10;

    const { data: allProducts } = await supabase
        .from("products")
        .select("id, product_quantity");

    const totalProducts = allProducts?.length || 0;
    const lowStockCount = allProducts?.filter(p => p.product_quantity > 0 && p.product_quantity <= 5).length || 0;
    const outOfStockCount = allProducts?.filter(p => p.product_quantity === 0).length || 0;

    const { data: products, count } = await supabase
        .from("products")
        .select("id, product_name, product_sku, product_quantity, product_status, categories( id, category_name ), variants( id, variant_name )", { count: 'exact' })
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('product_name', { ascending: true });

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const { data: categories } = await supabase
        .from("categories")
        .select("id, category_name")
        .order("category_name");

    const { data: variants } = await supabase
        .from("variants")
        .select("id, variant_name")
        .order("variant_name");
    return (
        <>
            <div className="pageHeader">
                <h2 className="heading-title">Inventory</h2>
                <AddButton categories={categories || []} variants={variants} />
            </div>

            <div className="content">
                <div className="filter-bar">
                    {/* Search goes here */}

                    <select name="stock-status">
                        <option value="">Stock status</option>
                        <option value="in-stock">In stock</option>
                        <option value="low-stock">Low stock</option>
                        <option value="out-of-stock">Out of stock</option>
                    </select>

                    <select name="category">
                        <option value="">Category</option>
                        {categories?.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.category_name}
                            </option>
                        ))}
                    </select>

                    <select name="variant">
                        <option value="">Variant</option>
                        {variants?.map(variant => (
                            <option key={variant.id} value={variant.id}>
                                {variant.variant_name}
                            </option>
                        ))}
                    </select>
                </div>

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
                        {products && products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <span className="item-name">{product.product_name}</span>
                                    <span className="item-sku">{product.product_sku}</span>
                                </td>

                                <td>
                                    <div className={`quantity-badge ${product.product_quantity === 0 ? "out-of-stock" : product.product_quantity <= 5 ? "low-stock" : ""}`}>
                                        {product.product_quantity}
                                    </div>
                                </td>

                                <td>{product.categories.category_name}</td>
                                <td>{product.variants.variant_name}</td>
                                <td>
                                    <div className="table-actions">
                                        <DeleteProductButton productId={product.id} productName={product.product_name} />
                                        <IconButton icon={<i className="fa-solid fa-layer-group"></i>} title="Batches" />

                                        <EditProductButton
  id={product.id}
  product_name={product.product_name}
  product_sku={product.product_sku}
  product_quantity={product.product_quantity}
  product_category={product.categories?.id ?? ''}
  product_variant={product.variants?.id ?? ''}
  product_status={product.product_status}
  categories={categories}
  variants={variants}
/>



                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination inventory-page">
                <div className={styles["iventory-summary"]}>
                    <div className={styles.total}><strong>{totalProducts}</strong> products</div>

                    <div className={styles["stock-info"]}>
                        <span className={`${styles["low-stock"]} ${styles["stock-status"]}`}><span></span> Low stock: {lowStockCount}</span>
                        <span className={`${styles["out-of-stock"]} ${styles["stock-status"]}`}><span></span> Out of stock: {outOfStockCount}</span>
                    </div>
                </div>

                <Pagination totalPages={totalPages} currentPage={page} />
            </div>
        </>
    );
}
