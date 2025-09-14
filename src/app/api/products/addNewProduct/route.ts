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
            variants,
            inventories
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
                error: 'At least one variant entry is required'
            }), { status: 400 });
        }

        if (!Array.isArray(inventories) || inventories.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'At least one inventory entry is required'
            }), { status: 400 });
        }

        const { data: productData, error: productError } = await supabase
            .from('products')
            .insert({
                product_name,
                product_category,
                product_status,
                owner_id: user.id,
                created_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (productError || !productData) {
            console.error('Product insert error:', productError);
            return new Response(JSON.stringify({
                success: false,
                error: productError?.message || 'Failed to create product',
            }), { status: 500 });
        }

        const product_id = productData.id;

        const variantRows = variants.map((variantId: string) => ({
            product_id,
            variant_id: variantId,
            owner_id: user.id,
            created_at: new Date().toISOString(),
        }));
        const { data: insertedVariants, error: variantError } = await supabase
            .from('product_variants')
            .insert(variantRows)
            .select('id');

        if (variantError || !insertedVariants) {
            console.error('Variant insert error:', variantError);
            return new Response(JSON.stringify({
                success: false,
                error: variantError?.message || 'Product created but failed to add variants.',
            }), { status: 500 });
        }

        const inventoryRows: any[] = [];
        insertedVariants.forEach((pv: any) => {
            inventories
                .filter((inv: { inventoryId: string }) => inv.inventoryId)
                .forEach((inv: { inventoryId: string; sku: string; quantity: number; details?: string }) => {
                    inventoryRows.push({
                        product_variant_id: pv.id,
                        inventory_id: inv.inventoryId,
                        product_sku: inv.sku,
                        product_quantity: inv.quantity,
                        product_details: inv.details ?? null,
                        owner_id: user.id,
                        created_at: new Date().toISOString(),
                    });
                });
        });

        if (inventoryRows.length > 0) {
            const { error: inventoryError } = await supabase
                .from('product_variant_inventories')
                .insert(inventoryRows);

            if (inventoryError) {
                console.error('Inventory insert error:', inventoryError);
                return new Response(JSON.stringify({
                    success: false,
                    error: inventoryError.message || 'Product created but failed to add inventory details.',
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
