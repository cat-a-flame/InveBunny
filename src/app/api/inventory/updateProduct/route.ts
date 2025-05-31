import { createClient } from '@/src/utils/supabase/server';

export async function PUT(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.product_name?.trim()) {
        return new Response(JSON.stringify({ success: false, error: 'Product name is required' }), { status: 400 });
    }
    if (!body.inventory_id) {
        return new Response(JSON.stringify({ success: false, error: 'Inventory ID is required' }), { status: 400 });
    }

    try {
        // 1. Verify product ownership
        const { data: ownedProduct, error: ownershipError } = await supabase
            .from('products')
            .select('id')
            .eq('id', body.id)
            .eq('owner_id', user.id)
            .single();

        if (ownershipError || !ownedProduct) {
            throw new Error('Product not found or access denied');
        }

        // 2. Get ALL current inventory associations for this product
        const { data: currentInventories, error: inventoryError } = await supabase
            .from('product_inventories')
            .select('inventory_id')
            .eq('product_id', body.id);

        if (inventoryError) throw inventoryError;

        // 3. Check if we're changing inventories (only if current_inventory_id was provided)
        const isChangingInventory = body.current_inventory_id && 
                                 (body.inventory_id !== body.current_inventory_id);

        if (isChangingInventory) {
            // 3a. Check if product already exists in new inventory
            const { count: existingCount, error: existingError } = await supabase
                .from('product_inventories')
                .select('*', { count: 'exact', head: true })
                .eq('product_id', body.id)
                .eq('inventory_id', body.inventory_id);

            if (existingError) throw existingError;
            if (existingCount && existingCount > 0) {
                throw new Error('Product already exists in the target inventory');
            }

            // 3b. Remove from specific old inventory
            const { error: deleteError } = await supabase
                .from('product_inventories')
                .delete()
                .eq('product_id', body.id)
                .eq('inventory_id', body.current_inventory_id);

            if (deleteError) throw deleteError;
        }

        // 4. Update product details
        const { data: updatedProduct, error: updateProductError } = await supabase
            .from('products')
            .update({
                product_name: body.product_name,
                product_category: body.product_category || null,
                product_variant: body.product_variant || null,
                product_status: body.product_status || false,
            })
            .eq('id', body.id)
            .select()
            .single();

        if (updateProductError) throw updateProductError;

        // 5. Upsert inventory association
        const { error: upsertInventoryError } = await supabase
            .from('product_inventories')
            .upsert({
                product_id: body.id,
                inventory_id: body.inventory_id,
                product_sku: body.product_sku || null,
                product_quantity: body.product_quantity || 0,
                owner_id: user.id,
            }, { onConflict: ['product_id', 'inventory_id'] });

        if (upsertInventoryError) throw upsertInventoryError;

        return new Response(
            JSON.stringify({ success: true, product: updatedProduct }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating product:', error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                error: error.message || 'Failed to update product',
                details: error.details || null 
            }),
            { status: 500 }
        );
    }
}