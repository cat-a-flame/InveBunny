import { createClient } from '@/src/utils/supabase/server';

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { id, product_sku, product_quantity, product_details } = body;

  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing identifier' }), { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('product_variant_inventories')
      .update({
        product_sku: product_sku || null,
        product_quantity: product_quantity ?? 0,
        product_details: product_details || null,
      })
      .eq('id', id)
      .eq('owner_id', user.id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating inventory item:', error);
    const message = error instanceof Error ? error.message : 'Failed to update';
    return new Response(JSON.stringify({ success: false, error: message }), { status: 500 });
  }
}
