import { createClient } from '@/src/utils/supabase/server';

export async function PUT(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return new Response(
            JSON.stringify({ success: false, error: 'Unauthorized' }), 
            { status: 401 }
        );
    }

    const body = await request.json();

    // Validation
    if (!body.product_name?.trim()) {
        return new Response(
            JSON.stringify({ success: false, error: 'Product name is required' }), 
            { status: 400 }
        );
    }
    if (!body.inventory_id) {
        return new Response(
            JSON.stringify({ success: false, error: 'Inventory ID is required' }), 
            { status: 400 }
        );
    }

    try {
        // 1. Verify ownership
        const { data: ownedProduct, error: ownershipError } = await supabase
            .from('products')
            .select('id')
            .eq('id', body.id)
            .eq('owner_id', user.id)
            .single();

        if (ownershipError || !ownedProduct) {
            throw new Error('Product not found or access denied');
        }

        // 2. Check if inventory is changing
        const { data: currentInventory, error: inventoryError } = await supabase
            .from('product_inventories')
            .select('inventory_id')
            .eq('product_id', body.id)
            .maybeSingle();

        if (inventoryError) throw inventoryError;

        const isChangingInventory = currentInventory?.inventory_id !== body.inventory_id;

        // 3. Update product details
        const { data: product, error: productError } = await supabase
            .from('products')
            .update({
                product_name: body.product_name,
                product_category: body.product_category || null,
                product_variant: body.product_variant || null
            })
            .eq('id', body.id)
            .select()
            .single();

        if (productError) throw productError;

        // 4. Handle inventory relationship
        if (isChangingInventory) {
            // Delete all existing inventory relationships for this product
            const { error: deleteError } = await supabase
                .from('product_inventories')
                .delete()
                .eq('product_id', body.id);

            if (deleteError) throw deleteError;
        }

        // 5. Create or update the new inventory relationship
        const { error: upsertError } = await supabase
            .from('product_inventories')
            .upsert({
                product_id: body.id,
                inventory_id: body.inventory_id,
                product_sku: body.product_sku || null,
                product_quantity: body.product_quantity || 0,
                product_status: body.product_status || false,
                owner_id: user.id
            });

        if (upsertError) throw upsertError;

        return new Response(
            JSON.stringify({ 
                success: true, 
                product: product 
            }), 
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