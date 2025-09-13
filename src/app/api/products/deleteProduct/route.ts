import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    const inventoryId = searchParams.get('inventory_id');

    if (!productId) {
        return NextResponse.json(
            { error: 'Product ID is required' },
            { status: 400 }
        );
    }

    try {
        if (inventoryId) {
            const { data: variants, error: variantsError } = await supabase
                .from('product_variants')
                .select('id')
                .eq('product_id', productId);

            if (variantsError) throw variantsError;
            const variantIds = variants?.map(v => v.id) || [];

            if (variantIds.length === 0) {
                return NextResponse.json(
                    { error: 'Product has no variants' },
                    { status: 404 }
                );
            }

            const { count: existingCount, error: existingError } = await supabase
                .from('product_variant_inventories')
                .select('id', { count: 'exact', head: true })
                .in('product_variant_id', variantIds)
                .eq('inventory_id', inventoryId);

            if (existingError) throw existingError;
            if ((existingCount ?? 0) === 0) {
                return NextResponse.json(
                    { error: 'Product not found in specified inventory' },
                    { status: 404 }
                );
            }

            const { error: removeError } = await supabase
                .from('product_variant_inventories')
                .delete()
                .in('product_variant_id', variantIds)
                .eq('inventory_id', inventoryId);

            if (removeError) throw removeError;

            const { count, error: countError } = await supabase
                .from('product_variant_inventories')
                .select('id', { count: 'exact', head: true })
                .in('product_variant_id', variantIds);

            if (countError) throw countError;

            const message =
                (count ?? 0) === 0
                    ? `Removed product ${productId} from inventory ${inventoryId}. Product has no inventory assignments now.`
                    : `Removed product ${productId} from inventory ${inventoryId} (product remains in ${count} other inventories)`;

            return NextResponse.json({ success: true, message });
        }

        const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', productId)
            .eq('owner_id', user.id);

        if (variantsError) throw variantsError;
        const variantIds = variants?.map(v => v.id) || [];

        if (variantIds.length > 0) {
            const { error: pviError } = await supabase
                .from('product_variant_inventories')
                .delete()
                .in('product_variant_id', variantIds)
                .eq('owner_id', user.id);
            if (pviError) throw pviError;

            const { error: pvError } = await supabase
                .from('product_variants')
                .delete()
                .in('id', variantIds);
            if (pvError) throw pvError;
        }

        const { data: batches } = await supabase
            .from('product_batch')
            .select('id')
            .eq('product_id', productId)
            .eq('owner_id', user.id);
        const batchIds = batches?.map(b => b.id) || [];
        if (batchIds.length > 0) {
            await supabase
                .from('product_batch_to_supply_batch')
                .delete()
                .eq('owner_id', user.id)
                .in('product_batch_id', batchIds);
        }
        await supabase
            .from('product_batch')
            .delete()
            .eq('product_id', productId)
            .eq('owner_id', user.id);

        const { error: productError } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (productError) throw productError;

        return NextResponse.json({
            success: true,
            message: `Completely deleted product ${productId} and all its inventory associations`
        });
    } catch (error: unknown) {
        console.error('Delete API error:', error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            { error: 'Operation failed', details: errorMessage },
            { status: 500 }
        );
    }
}