import { createClient } from '@/src/utils/supabase/server';

export async function PUT(request: Request) {
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

  const body = await request.json();
  const { items } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: 'No items provided' }),
      { status: 400 }
    );
  }

  try {
    for (const item of items) {
      const { sku, quantity } = item;
      if (!sku || typeof quantity !== 'number') continue;

      const { data, error } = await supabase
        .from('product_variant_inventories')
        .select('quantity')
        .eq('sku', sku)
        .eq('owner_id', user.id)
        .single();

      if (error || !data) continue;

      const newQuantity = Math.max((data.quantity ?? 0) - quantity, 0);

      const { error: updateError } = await supabase
        .from('product_variant_inventories')
        .update({ quantity: newQuantity })
        .eq('sku', sku)
        .eq('owner_id', user.id);

      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating stock by SKU:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to update stock';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500 }
    );
  }
}
