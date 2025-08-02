import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');

    if (!sku) {
        return new Response(
            JSON.stringify({ success: false, error: 'Missing sku' }),
            { status: 400 }
        );
    }

    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            { status: 401 }
        );
    }

    const { data, error } = await supabase
        .from('product_inventories')
        .select('product_id, product_sku, products (product_name)')
        .eq('product_sku', sku)
        .eq('owner_id', user.id)
        .single();

    if (error || !data) {
        return new Response(
            JSON.stringify({ success: false, error: 'Product not found' }),
            { status: 404 }
        );
    }

    const product = {
        id: data.product_id,
        product_sku: data.product_sku,
        product_name: data.products?.product_name || '',
    };

    return new Response(
        JSON.stringify({ success: true, product }),
        { status: 200 }
    );
}
