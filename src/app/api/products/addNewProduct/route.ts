import { createClient } from '@/src/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Unauthorized'
            }), { status: 401 });
        }

        const body = await request.json();
        const {
            product_name,
            product_category,
            product_status,
            product_details,
            variants
        } = body;

        if (!product_name?.trim()) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Product name is required'
            }), { status: 400 });
        }

        if (!Array.isArray(variants) || variants.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'At least one variant is required'
            }), { status: 400 });
        }

        const { data: productData, error: productError } = await supabase
            .from('products')
            .insert([{
                product_name,
                product_category,
                product_status,
                product_details,
                owner_id: user.id
            }])
            .select()
            .single();

        if (productError) {
            console.error('Product insert error:', productError);
            return new Response(JSON.stringify({
                success: false,
                error: productError.message
            }), { status: 500 });
        }

        const product_id = productData.id;

        for (const variant of variants as Array<{ variant_id: string; inventories: Array<{ inventoryId: string; sku: string; quantity: number }> }>) {
            const { data: pvData, error: pvError } = await supabase
                .from('product_variants')
                .insert({
                    product_id,
                    variant_id: variant.variant_id,
                    owner_id: user.id,
                })
                .select()
                .single();

            if (pvError || !pvData) {
                console.error('Product variant insert error:', pvError);
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Failed to create product variant'
                }), { status: 500 });
            }

            const inventoryRows = (variant.inventories || []).map(inv => ({
                product_variant_id: pvData.id,
                inventory_id: inv.inventoryId,
                product_sku: inv.sku,
                quantity: inv.quantity,
                owner_id: user.id,
            }));

            if (inventoryRows.length > 0) {
                const { error: inventoryError } = await supabase
                    .from('product_variant_inventories')
                    .insert(inventoryRows);

                if (inventoryError) {
                    console.error('Inventory insert error:', inventoryError);
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Product created but failed to add inventory details.'
                    }), { status: 500 });
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            product: productData
        }), { status: 200 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error'
        }), { status: 500 });
    }
}
