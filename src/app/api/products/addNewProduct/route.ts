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
            variants = [],
            inventories = []
        } = body;

        const validVariants = Array.isArray(variants)
            ? variants.filter((v: { variantId?: string }) => v.variantId)
            : [];
        const validInventories = Array.isArray(inventories)
            ? inventories.filter((i: { inventoryId?: string }) => i.inventoryId)
            : [];

        if (!product_name?.trim()) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Product name is required'
            }), { status: 400 });
        }

        if (validVariants.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'At least one variant entry is required',
            }), { status: 400 });
        }

        if (validInventories.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'At least one inventory entry is required'
            }), { status: 400 });
        }

        const { data: productData, error: productError } = await supabase
            .from('products')
            .insert([{
                product_name,
                product_category,
                product_status,
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

        const { data: productVariantsData, error: productVariantError } = await supabase
            .from('product_variants')
            .insert(
                validVariants.map((v: { variantId: string }) => ({
                    product_id,
                    variant_id: v.variantId,
                    owner_id: user.id,
                }))
            )
            .select();

        if (productVariantError) {
            console.error('Product variant insert error:', productVariantError);
            await supabase.from('products').delete().eq('id', product_id);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to add variants.',
            }), { status: 500 });
        }

        const inventoryRows = [] as any[];
        productVariantsData?.forEach((pv: any) => {
            validInventories.forEach((inv: { inventoryId: string; sku: string; quantity: number }) => {
                inventoryRows.push({
                    product_variant_id: pv.id,
                    inventory_id: inv.inventoryId,
                    product_sku: inv.sku,
                    product_quantity: inv.quantity,
                    owner_id: user.id,
                });
            });
        });

        const { error: inventoryError } = await supabase
            .from('product_variant_inventories')
            .insert(inventoryRows);

        if (inventoryError) {
            console.error('Inventory insert error:', inventoryError);
            await supabase.from('product_variants').delete().eq('product_id', product_id);
            await supabase.from('products').delete().eq('id', product_id);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to add inventory details.'
            }), { status: 500 });
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
