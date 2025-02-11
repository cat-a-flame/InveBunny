import { createClient } from '@/src/utils/supabase/server';
import { AddButton } from './addButton';

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
            <div className="pageHeader">
                <h2 className="heading-title">Inventory</h2>

                <AddButton />
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
                            <td>Delete | Batch | Edit</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}