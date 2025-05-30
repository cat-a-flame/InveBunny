import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
    const supabase = await createClient();
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
            const { data: inventories, error: inventoryError } = await supabase
                .from('product_inventories')
                .select('inventory_id')
                .eq('product_id', productId);

            if (inventoryError) throw inventoryError;

            const inTargetInventory = inventories?.some(
                inv => inv.inventory_id === inventoryId
            );

            if (!inTargetInventory) {
                return NextResponse.json(
                    { error: 'Product not found in specified inventory' },
                    { status: 404 }
                );
            }

            const { error: removeError } = await supabase
                .from('product_inventories')
                .delete()
                .match({
                    product_id: productId,
                    inventory_id: inventoryId
                });

            if (removeError) throw removeError;

            const { count, error: countError } = await supabase
                .from('product_inventories')
                .select('*', { count: 'exact' })
                .eq('product_id', productId);

            if (countError) throw countError;

            if (count === 0) {
                // Safe to delete the product
                const { error: productError } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', productId);

                if (productError) throw productError;

                return NextResponse.json({
                    success: true,
                    message: `Product ${productId} was removed from inventory ${inventoryId} and deleted completely as it had no other inventory associations`
                });
            }

            return NextResponse.json({
                success: true,
                message: `Removed product ${productId} from inventory ${inventoryId} only (product remains in ${count} other inventories)`
            });
        }

        const { error: piError } = await supabase
            .from('product_inventories')
            .delete()
            .eq('product_id', productId);

        if (piError) throw piError;

        const { error: productError } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (productError) throw productError;

        return NextResponse.json({
            success: true,
            message: `Completely deleted product ${productId} and all its inventory associations`
        });

    } catch (error: any) {
        console.error('Delete API error:', error);
        return NextResponse.json(
            { error: 'Operation failed', details: error.message || error },
            { status: 500 }
        );
    }

}