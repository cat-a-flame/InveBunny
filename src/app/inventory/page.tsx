import { createClient } from '@/src/utils/supabase/server';
import { IconButton } from '@/src/components/IconButton/iconButton';
import { DialogForm } from './DialogForm';
import styles from './inventory.module.css';

export default async function Home() {
    const supabase = await createClient();
    const { data: products } = await supabase
        .from("products")
        .select(`
            id,
            product_name,
            product_sku,
            product_quantity,
            categories( category_name ),
            variants( variant_name )
        `).order('product_name', { ascending: true });

    return (
        <>
            <DialogForm />

            <div className="content">
                <div className="filter-bar">
                    <div className="input-with-icon">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input type="text" className="search-input" placeholder="Search for name or SKU" />
                    </div>

                    <select name="stock-status">
                        <option value="">Stock status</option>
                        <option value="in-stock">In stock</option>
                        <option value="low-stock">Low stock</option>
                        <option value="out-of-stock">Out of stock</option>
                    </select>

                    <select name="category">
                        <option value="">Category</option>
                        <option value="1">Category 1</option>
                        <option value="2">Category 2</option>
                        <option value="3">Category 3</option>
                    </select>

                    <select name="variant">
                        <option>Variant</option>
                        <option value="1">Variant 1</option>
                        <option value="2">Variant 2</option>
                        <option value="3">Variant 3</option>
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
                                        <IconButton icon={<i className="fa-regular fa-trash-can"></i>} title="Delete" />
                                        <IconButton icon={<i className="fa-solid fa-layer-group"></i>} title="Batches" />
                                        <IconButton icon={<i className="fa-regular fa-pen-to-square"></i>} title="Edit" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <div className={styles["iventory-summary"]}>
                    <div className={styles.total}><strong>{products?.length || 0}</strong> products</div>

                    <div className={styles["stock-info"]}>
                        <span className={`${styles["low-stock"]} ${styles["stock-status"]}`}><span></span> Low stock: {products?.filter(p => p.product_quantity > 0 && p.product_quantity <= 5).length || 0}</span>
                        <span className={`${styles["out-of-stock"]} ${styles["stock-status"]}`}><span></span> Out of stock: {products?.filter(p => p.product_quantity === 0).length || 0}</span>
                    </div>
                </div>
            </div>
        </>
    );
}