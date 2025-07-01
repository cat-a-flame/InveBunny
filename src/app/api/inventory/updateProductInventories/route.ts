import { createClient } from '@/src/utils/supabase/server';

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { id, product_name, product_category, product_variant, product_status, inventories } = body;

  if (!product_name?.trim()) {
    return new Response(JSON.stringify({ success: false, error: 'Product name is required' }), { status: 400 });
  }

  if (!Array.isArray(inventories) || inventories.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'At least one inventory entry is required' }), { status: 400 });
  }

  try {
    const { data: ownedProduct, error: ownershipError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single();

    if (ownershipError || !ownedProduct) {
      throw new Error('Product not found or access denied');
    }

    const { data: updatedProduct, error: updateProductError } = await supabase
      .from('products')
      .update({
        product_name,
        product_category: product_category || null,
        product_variant: product_variant || null,
        product_status: product_status || false,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateProductError) throw updateProductError;

    const { data: existing, error: existingError } = await supabase
      .from('product_inventories')
      .select('inventory_id')
      .eq('product_id', id)
      .eq('owner_id', user.id);

    if (existingError) throw existingError;

    const existingIds = (existing || []).map((r: any) => r.inventory_id);
    const incomingIds = inventories.map((inv: any) => inv.inventory_id);

    const toDelete = existingIds.filter((id: string) => !incomingIds.includes(id));

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('product_inventories')
        .delete()
        .eq('product_id', id)
        .eq('owner_id', user.id)
        .in('inventory_id', toDelete);
      if (deleteError) throw deleteError;
    }

    const upsertRows = inventories.map((inv: any) => ({
      product_id: id,
      inventory_id: inv.inventory_id,
      product_sku: inv.product_sku || null,
      product_quantity: inv.product_quantity || 0,
      owner_id: user.id,
    }));

    const { error: upsertError } = await supabase
      .from('product_inventories')
      .upsert(upsertRows, { onConflict: 'product_id, inventory_id' });

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ success: true, product: updatedProduct }), { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating product inventories:', error);
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return new Response(JSON.stringify({ success: false, error: message }), { status: 500 });
  }
}
