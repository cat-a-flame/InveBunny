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
        product_status: product_status || false,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateProductError) throw updateProductError;

    const { data: existingVariant, error: variantFetchError } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', id)
      .eq('owner_id', user.id)
      .single();

    if (variantFetchError && variantFetchError.code !== 'PGRST116') {
      throw variantFetchError;
    }

    let productVariantId: string | null = null;

    if (product_variant) {
      if (existingVariant) {
        const { data: pvData, error: pvError } = await supabase
          .from('product_variants')
          .update({ variant_id: product_variant })
          .eq('id', existingVariant.id)
          .select('id')
          .single();

        if (pvError) throw pvError;
        productVariantId = pvData.id;
      } else {
        const { data: pvData, error: pvError } = await supabase
          .from('product_variants')
          .insert({ product_id: id, variant_id: product_variant, owner_id: user.id })
          .select('id')
          .single();

        if (pvError) throw pvError;
        productVariantId = pvData.id;
      }
    } else if (existingVariant) {
      const { error: deleteVariantError } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', existingVariant.id);
      if (deleteVariantError) throw deleteVariantError;
    }

    if (productVariantId) {
      const { data: existingInvs, error: existingInvError } = await supabase
        .from('product_variant_inventories')
        .select('inventory_id')
        .eq('product_variant_id', productVariantId)
        .eq('owner_id', user.id);

      if (existingInvError) throw existingInvError;

      const existingIds = (existingInvs || []).map((r: any) => r.inventory_id);
      const incomingIds = inventories.map((inv: any) => inv.inventory_id);
      const toDelete = existingIds.filter((invId: string) => !incomingIds.includes(invId));

      if (toDelete.length > 0) {
        const { error: deleteInvError } = await supabase
          .from('product_variant_inventories')
          .delete()
          .eq('product_variant_id', productVariantId)
          .eq('owner_id', user.id)
          .in('inventory_id', toDelete);
        if (deleteInvError) throw deleteInvError;
      }

      const upsertRows = inventories.map((inv: any) => ({
        product_variant_id: productVariantId,
        inventory_id: inv.inventory_id,
        product_sku: inv.product_sku || null,
        product_quantity: inv.quantity ?? 0,
        owner_id: user.id,
      }));

      const { error: upsertError } = await supabase
        .from('product_variant_inventories')
        .upsert(upsertRows, { onConflict: 'product_variant_id, inventory_id' });

      if (upsertError) throw upsertError;
    }

    return new Response(JSON.stringify({ success: true, product: updatedProduct }), { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating product inventories:', error);
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return new Response(JSON.stringify({ success: false, error: message }), { status: 500 });
  }
}

