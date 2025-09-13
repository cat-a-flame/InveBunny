import { createClient } from '@/src/utils/supabase/server';
import { slugify } from '@/src/utils/slugify';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: invRows, error: invError } = await supabase
    .from('inventories')
    .select('id, inventory_name')
    .eq('owner_id', user.id);
  if (invError) {
    return new Response(JSON.stringify({ error: invError.message }), { status: 500 });
  }

  const inventory = (invRows || []).find((inv: any) => slugify(inv.inventory_name) === slug);
  if (!inventory) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  const { data, error } = await supabase
    .from('product_variant_inventories')
    .select('id, sku, quantity, product_variants!inner(products(product_name), variants(variant_name))')
    .eq('inventory_id', inventory.id)
    .eq('owner_id', user.id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const items = (data || []).map((row: any) => ({
    id: row.id,
    sku: row.sku,
    quantity: row.quantity,
    product_name: row.product_variants?.products?.product_name ?? '',
    variant_name: row.product_variants?.variants?.variant_name ?? '',
  }));

  return new Response(
    JSON.stringify({ inventory: { id: inventory.id, inventory_name: inventory.inventory_name }, items }),
    { status: 200 }
  );
}
