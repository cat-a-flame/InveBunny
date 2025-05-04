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
            product_sku,
            product_quantity,
            product_category,
            product_variant,
            product_status
        } = body;

        if (!product_name?.trim()) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Product name is required'
            }), { status: 400 });
        }

        if (!product_sku?.trim()) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Product SKU is required'
            }), { status: 400 });
        }

        // Insert product
        const { data, error } = await supabase
            .from('products')
            .insert([{
                product_name,
                product_sku,
                product_quantity: product_quantity || 0,
                product_category,
                product_variant,
                product_status,
                owner_id: user.id
            }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: error.message
            }), { status: 500 });
        }

        return new Response(JSON.stringify({
            success: true,
            product: data[0]
        }), { status: 200 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error'
        }), { status: 500 });
    }
}