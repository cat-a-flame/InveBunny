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
        .from('product_variant_inventories')
        .select('id, product_sku, product_quantity, product_variants (product_id, products (product_name))')
        .eq('product_sku', sku)
        .eq('owner_id', user.id)
        .single();

    if (error || !data) {
        return new Response(
            JSON.stringify({ success: false, error: 'Product not found' }),
            { status: 404 }
        );
    }

    const productName = data.product_variants?.products?.product_name ?? '';
    const product = {
        id: data.product_variants?.product_id,
        product_id: data.product_variants?.product_id,
        product_sku: data.product_sku,
        product_name: productName,
        product_quantity: data.product_quantity ?? 0,
    };

    return new Response(
        JSON.stringify({ success: true, product }),
        { status: 200 }
    );
}
