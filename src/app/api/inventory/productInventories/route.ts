import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return new Response(JSON.stringify({ error: 'Missing productId' }), { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data, error } = await supabase
    .from('product_inventories')
    .select('inventory_id, product_sku, product_quantity, inventories(id, inventory_name)')
    .eq('product_id', productId)
    .eq('owner_id', user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const inventories = (data || []).map((row: any) => ({
    inventory_id: row.inventory_id,
    product_sku: row.product_sku,
    product_quantity: row.product_quantity,
    inventory_name: row.inventories?.inventory_name,
  }));

  return new Response(JSON.stringify({ success: true, inventories }), { status: 200 });
}
