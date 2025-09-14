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
    const inventoryItemId = searchParams.get('inventory_item_id');
    const productId = searchParams.get('id');
    const inventoryId = searchParams.get('inventory_id');

    if (inventoryItemId) {
        try {
            const { data: item, error: itemError } = await supabase
                .from('product_variant_inventories')
                .select('product_variant_id')
                .eq('id', inventoryItemId)
                .eq('owner_id', user.id)
                .single();

            if (itemError || !item) {
                return NextResponse.json(
                    { error: 'Inventory item not found' },
                    { status: 404 }
                );
            }

            const { error: removeError } = await supabase
                .from('product_variant_inventories')
                .delete()
                .eq('id', inventoryItemId)
                .eq('owner_id', user.id);

            if (removeError) throw removeError;

            const { count, error: countError } = await supabase
                .from('product_variant_inventories')
                .select('id', { count: 'exact' })
                .eq('product_variant_id', item.product_variant_id)
                .eq('owner_id', user.id);

            if (countError) throw countError;

            if (!count) {
                await supabase
                    .from('product_variants')
                    .delete()
                    .eq('id', item.product_variant_id)
                    .eq('owner_id', user.id);
            }

            return NextResponse.json({ success: true, message: `Removed inventory item ${inventoryItemId}` });
        } catch (error: unknown) {
            console.error('Delete API error:', error);
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            return NextResponse.json(
                { error: 'Operation failed', details: errorMessage },
                { status: 500 }
            );
        }
    }

    if (!productId) {
        return NextResponse.json(
            { error: 'Product ID is required' },
            { status: 400 }
        );
    }

    try {
        const { data: variantRows, error: variantFetchError } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', productId)
            .eq('owner_id', user.id);

        if (variantFetchError) throw variantFetchError;

        const variantIds = variantRows?.map(v => v.id) || [];

        if (inventoryId) {
            if (variantIds.length === 0) {
                return NextResponse.json(
                    { error: 'Product not found in specified inventory' },
                    { status: 404 }
                );
            }

            const { data: existing, error: inventoryError } = await supabase
                .from('product_variant_inventories')
                .select('id')
                .in('product_variant_id', variantIds)
                .eq('inventory_id', inventoryId)
                .eq('owner_id', user.id);

            if (inventoryError) throw inventoryError;

            if (!existing || existing.length === 0) {
                return NextResponse.json(
                    { error: 'Product not found in specified inventory' },
                    { status: 404 }
                );
            }

            const { error: removeError } = await supabase
                .from('product_variant_inventories')
                .delete()
                .in('product_variant_id', variantIds)
                .eq('inventory_id', inventoryId)
                .eq('owner_id', user.id);

            if (removeError) throw removeError;

            const { count, error: countError } = await supabase
                .from('product_variant_inventories')
                .select('id', { count: 'exact' })
                .in('product_variant_id', variantIds)
                .eq('owner_id', user.id);

            if (countError) throw countError;

            const message =
                count === 0
                    ? `Removed product ${productId} from inventory ${inventoryId}. Product has no inventory assignments now.`
                    : `Removed product ${productId} from inventory ${inventoryId} (product remains in ${count} other inventories)`;

            return NextResponse.json({ success: true, message });
        }

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
                .eq('owner_id', user.id)
                .eq('product_id', productId);

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

        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

        return NextResponse.json(
            { error: 'Operation failed', details: errorMessage },
            { status: 500 }
        );
    }
}
