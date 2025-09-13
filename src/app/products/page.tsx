import { AddButton } from '@/src/features/products/add/AddButton';
import { createClient } from '@/src/utils/supabase/server';

export default async function ProductsPage() {
    const supabase = await createClient();

    const { data: categories } = await supabase
        .from('categories')
        .select('id, category_name')
        .order('category_name');

    const { data: variants } = await supabase
        .from('variants')
        .select('id, variant_name')
        .order('variant_name');

    const { data: inventories } = await supabase
        .from('inventories')
        .select('id, inventory_name')
        .order('inventory_name');

    const { data } = await supabase
        .from('products')
        .select(`
            id,
            product_name,
            product_category,
            product_status,
            product_variants (
                variant_id,
                variants (variant_name),
                product_variant_inventories (
                    inventory_id,
                    product_sku,
                    product_quantity,
                    product_details,
                    inventories (inventory_name)
                )
            )
        `)
        .order('product_name');

    const products = (data || []).map((p: any) => ({
        id: p.id,
        product_name: p.product_name,
        product_category: p.product_category,
        product_status: p.product_status,
        variants: (p.product_variants || []).map((pv: any) => ({
            variant_id: pv.variant_id,
            variant_name: pv.variants?.variant_name,
            inventories: (pv.product_variant_inventories || []).map((inv: any) => ({
                inventory_id: inv.inventory_id,
                inventory_name: inv.inventories?.inventory_name,
                sku: inv.product_sku,
                quantity: inv.product_quantity,
                product_details: inv.product_details,
            })),
        })),
    }));

    return (
        <div className="inventory-page">
            <div className="pageHeader">
                <h2 className="heading-title">Products</h2>
                <AddButton categories={categories || []} variants={variants || []} inventories={inventories || []} />
            </div>
            {products.map(product => (
                <div key={product.id} className="product-block">
                    <h3 className="item-name">{product.product_name}</h3>
                    <p>Category: {product.product_category || '-'}</p>
                    <p>Status: {product.product_status ? 'Active' : 'Inactive'}</p>
                    <table className="table product-table">
                        <thead>
                            <tr>
                                <th>Variant</th>
                                <th>Inventory</th>
                                <th>SKU</th>
                                <th>Quantity</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {product.variants.flatMap(variant =>
                                variant.inventories.map(inv => (
                                    <tr key={`${variant.variant_id}-${inv.inventory_id}`}>
                                        <td>{variant.variant_name}</td>
                                        <td>{inv.inventory_name}</td>
                                        <td>{inv.sku}</td>
                                        <td>{inv.quantity}</td>
                                        <td>{inv.product_details}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}
