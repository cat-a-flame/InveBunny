import { createClient } from '@/src/utils/supabase/server';

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { id, product_name, product_category, product_status, variants, inventories } = body;

  if (!product_name?.trim()) {
    return new Response(JSON.stringify({ success: false, error: 'Product name is required' }), { status: 400 });
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'At least one variant entry is required' }), { status: 400 });
  }

  const validInventories = Array.isArray(inventories)
    ? inventories.filter((inv: any) => inv.inventory_id)
    : [];

  if (validInventories.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: 'At least one inventory entry is required' }),
      { status: 400 }
    );
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

    const { data: existingVariants, error: existingVariantsError } = await supabase
      .from('product_variants')
      .select('id, variant_id')
      .eq('product_id', id)
      .eq('owner_id', user.id);

    if (existingVariantsError) throw existingVariantsError;

    const existingVariantIds = (existingVariants || []).map((r: any) => r.variant_id);
    const existingVariantMap = new Map((existingVariants || []).map((r: any) => [r.variant_id, r.id]));
    const incomingVariantIds = (variants || []) as string[];

    const variantsToDelete = existingVariantIds.filter((vid: string) => !incomingVariantIds.includes(vid));

    if (variantsToDelete.length > 0) {
      const idsToDelete = variantsToDelete
        .map((vid: string) => existingVariantMap.get(vid))
        .filter(Boolean);

      if (idsToDelete.length > 0) {
        const { error: deleteVariantInvError } = await supabase
          .from('product_variant_inventories')
          .delete()
          .in('product_variant_id', idsToDelete as string[]);
        if (deleteVariantInvError) throw deleteVariantInvError;
      }

      const { error: deleteVariantError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', id)
        .eq('owner_id', user.id)
        .in('variant_id', variantsToDelete);
      if (deleteVariantError) throw deleteVariantError;
    }

    const variantUpsertRows = incomingVariantIds.map(variantId => ({
      product_id: id,
      variant_id: variantId,
      owner_id: user.id,
      created_at: new Date().toISOString(),
    }));

    const { data: upsertedVariants, error: variantUpsertError } = await supabase
      .from('product_variants')
      .upsert(variantUpsertRows, { onConflict: 'product_id, variant_id' })
      .select();

    if (variantUpsertError) throw variantUpsertError;

    const allVariantIds = (upsertedVariants || []).map((v: any) => v.id);

    if (allVariantIds.length > 0) {
      const { error: deleteInvError } = await supabase
        .from('product_variant_inventories')
        .delete()
        .in('product_variant_id', allVariantIds);
      if (deleteInvError) throw deleteInvError;

      const inventoryRows: any[] = [];
      allVariantIds.forEach((pvId: string) => {
        validInventories.forEach((inv: any) => {
          inventoryRows.push({
            product_variant_id: pvId,
            inventory_id: inv.inventory_id,
            product_sku: inv.product_sku || null,
            product_quantity: inv.product_quantity || 0,
            product_details: inv.product_details || null,
            owner_id: user.id,
            created_at: new Date().toISOString(),
          });
        });
      });

      if (inventoryRows.length > 0) {
        const { error: inventoryUpsertError } = await supabase
          .from('product_variant_inventories')
          .insert(inventoryRows);
        if (inventoryUpsertError) throw inventoryUpsertError;
      }
    }

    return new Response(JSON.stringify({ success: true, product: updatedProduct }), { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating product inventories:', error);
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return new Response(JSON.stringify({ success: false, error: message }), { status: 500 });
  }
}
