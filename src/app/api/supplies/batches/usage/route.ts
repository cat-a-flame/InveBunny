import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get('batchId');

  if (!batchId) {
    return new Response(JSON.stringify({ error: 'Missing batchId' }), { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('product_batch_to_supply_batch')
    .select('product_batch(id, p_batch_name)')
    .eq('supply_batch_id', batchId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const batches = (data || []).map((row: any) => row.product_batch);

  return new Response(JSON.stringify({ batches }), { status: 200 });
}
