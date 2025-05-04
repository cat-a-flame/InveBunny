import { createClient } from '@/src/utils/supabase/server';

export async function PUT(request: Request) {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
            status: 401
        });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.product_name?.trim()) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Product name is required'
        }), { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .update({
                product_name: body.product_name,
                product_sku: body.product_sku,
                product_quantity: body.product_quantity,
                product_category: body.product_category,
                product_variant: body.product_variant,
                product_status: body.status,
            })
            .eq('id', body.id)
            .eq('owner_id', user.id)
            .select();

        if (error) throw error;

        return new Response(JSON.stringify({
            success: true,
            product: data[0]
        }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to update product'
        }), { status: 500 });
    }
}