import { createClient } from '@/src/utils/supabase/server';
import { slugify } from '@/src/utils/slugify';

export default async function InventorySlugPage({ params }: { params: { inventory: string } }) {
    const supabase = await createClient();

    const { data: inventories } = await supabase
        .from('inventories')
        .select('id, inventory_name');

    const inventory = inventories?.find(inv => slugify(inv.inventory_name) === params.inventory);

    if (!inventory) {
        return (
            <main>
                <p>Inventory not found.</p>
            </main>
        );
    }

    const { data: items } = await supabase
        .from('product_variant_inventories')
        .select(`
            id,
            sku,
            quantity,
            product_variants (
                products ( product_name ),
                variants ( variant_name )
            )
        `)
        .eq('inventory_id', inventory.id);

    return (
        <main>
            <div className="pageHeader">
                <h2 className="heading-title">Inventory</h2>
                <h3 className="heading-subtitle">{inventory.inventory_name}</h3>
            </div>

            <div className="content">
                <table>
                    <thead>
                        <tr>
                            <th>Product name</th>
                            <th>Variant</th>
                            <th>SKU</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items?.map(item => (
                            <tr key={item.id}>
                                <td>{item.product_variants?.[0]?.products?.[0]?.product_name || '-'}</td>
                                <td>{item.product_variants?.[0]?.variants?.[0]?.variant_name || '-'}</td>
                                <td>{item.sku}</td>
                                <td>{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
