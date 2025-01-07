import { supabase } from '../lib/supabaseClient';

export default async function Home() {
    const { data: products } = await supabase
    .from("products")
    .select(`
            id,
            product_name,
            product_sku,
            product_quantity,
            product_category,
            product_variant
        `);

    return (
        <main>
            <h2 className="heading-title">Inventory</h2>
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Category</th>
                    <th>Variant</th>
                    </tr>
                </thead>
                <tbody>
                    {products && products.map(product => (
                        <tr key={product.id}>
                            <td>{product.product_name}</td>
                            <td>{product.product_sku}</td>
                            <td>{product.product_quantity}</td>
                            <td>{product.product_category}</td>
                            <td>{product.product_variant}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}