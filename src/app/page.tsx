import { createClient } from '@/src/utils/supabase/server';

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
                            <td>{product.categories.category_name}</td>
                            <td>{product.variants.variant_name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}