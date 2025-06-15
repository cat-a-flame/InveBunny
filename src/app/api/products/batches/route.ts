import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return new Response(JSON.stringify({ error: 'Missing productId' }), { status: 400 });
  }

  const supabase = await createClient();

  const { data: productData, error: productError } = await supabase
    .from('products')
    .select('product_name')
    .eq('id', productId)
    .single();

  if (productError) {
    return new Response(JSON.stringify({ error: productError.message }), { status: 500 });
  }

  const { data: batchesRaw, error: batchError } = await supabase
    .from('product_batch')
    .select(`
      id,
      p_batch_name,
      date_made,
      is_active,
      product_batch_to_supply_batch(
        supply_batch_id,
        supply_batch(
          batch_name,
          supplies(supply_name)
        )
      )
    `)
    .eq('product_id', productId)
    .order('date_made', { ascending: false });

  if (batchError) {
    return new Response(JSON.stringify({ error: batchError.message }), { status: 500 });
  }

  const batches = (batchesRaw || []).map((b: any) => ({
    id: b.id,
    p_batch_name: b.p_batch_name,
    date_made: b.date_made,
    is_active: b.is_active,
    supplies: (b.product_batch_to_supply_batch || []).map((r: any) => ({
      supplyBatchId: r.supply_batch_id,
      batchName: r.supply_batch?.batch_name,
      supplyName: r.supply_batch?.supplies?.supply_name,
    })),
  }));

  return new Response(
    JSON.stringify({ productName: productData?.product_name, batches }),
    { status: 200 }
  );
}
