import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return new Response(JSON.stringify({ error: 'Missing productId' }), { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const [
    { data: productData, error: productError },
    { data: batchesRaw, error: batchError },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('product_name')
      .eq('id', productId)
      .single(),
    supabase
      .from('product_batch')
      .select(`
        id,
        p_batch_name,
        date_made,
        is_active,
        product_batch_to_supply_batch(
          supply_batch_id,
          supply_batch(
            id,
            batch_name,
            supply_id,
            supplies(id, supply_name)
          )
        )
      `)
      .eq('product_id', productId)
      .eq('owner_id', user.id)
      .order('date_made', { ascending: false }),
  ]);

  if (productError) {
    return new Response(JSON.stringify({ error: productError.message }), { status: 500 });
  }

  if (batchError) {
    return new Response(JSON.stringify({ error: batchError.message }), { status: 500 });
  }

  const batches = (batchesRaw || []).map((b: any) => ({
    id: b.id,
    p_batch_name: b.p_batch_name,
    date_made: b.date_made,
    is_active: b.is_active,
    supplies: (b.product_batch_to_supply_batch || []).map((r: any) => ({
      batchId: r.supply_batch_id,
      supplyId: r.supply_batch?.supply_id || r.supply_batch?.supplies?.id,
      batchName: r.supply_batch?.batch_name,
      supplyName: r.supply_batch?.supplies?.supply_name,
    })),
  }));

  return new Response(
    JSON.stringify({ productName: productData?.product_name, batches }),
    { status: 200 }
  );
}
