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
            .insert([
                {
                    product_name,
                    product_category,
                    product_status,
                    product_details,
                    owner_id: user.id,
                },
            ])
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

        const variantRows = variants.map((v: any) => ({
            product_id,
            variant_id: v.variant_id,
            owner_id: user.id,
        }));

        const { data: insertedVariants, error: variantError } = await supabase
            .from('product_variants')
            .insert(variantRows)
            .select();

        if (variantError) {
            console.error('Variant insert error:', variantError);
            return new Response(JSON.stringify({
                success: false,
                error: 'Product created but failed to add variants.',
            }), { status: 500 });
        }

        const variantInventoryRows: any[] = [];
        (insertedVariants || []).forEach((pv) => {
            const match = variants.find((v: any) => v.variant_id === pv.variant_id);
            match?.inventories?.forEach((inv: any) => {
                variantInventoryRows.push({
                    product_variant_id: pv.id,
                    inventory_id: inv.inventory_id,
                    product_sku: inv.product_sku,
                    product_quantity: inv.product_quantity,
                    owner_id: user.id,
                });
            });
        });

        if (variantInventoryRows.length > 0) {
            const { error: inventoryError } = await supabase
                .from('product_variant_inventories')
                .insert(variantInventoryRows);

            if (inventoryError) {
                console.error('Inventory insert error:', inventoryError);
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Product created but failed to add inventory details.',
                }), { status: 500 });
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
