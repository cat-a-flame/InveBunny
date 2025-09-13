import { createClient } from '@/src/utils/supabase/server';

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { product_variant_id, inventory_id, sku, quantity } = body;

  if (!product_variant_id || !inventory_id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing identifiers' }), { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('product_variant_inventories')
      .upsert({
        product_variant_id,
        inventory_id,
        sku: sku || null,
        quantity: quantity ?? 0,
        owner_id: user.id,
      }, { onConflict: 'product_variant_id, inventory_id' });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating inventory item:', error);
    const message = error instanceof Error ? error.message : 'Failed to update';
    return new Response(JSON.stringify({ success: false, error: message }), { status: 500 });
  }
}
