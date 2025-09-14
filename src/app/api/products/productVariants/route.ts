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
    .from('product_variants')
    .select('variant_id, variants(id, variant_name)')
    .eq('product_id', productId)
    .eq('owner_id', user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const variants = (data || []).map((row: any) => ({
    variant_id: row.variant_id,
    variant_name: row.variants?.variant_name,
  }));

  return new Response(JSON.stringify({ success: true, variants }), { status: 200 });
}
