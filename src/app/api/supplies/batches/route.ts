import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supplyId = searchParams.get('supplyId');

  if (!supplyId) {
    return new Response(JSON.stringify({ error: 'Missing supplyId' }), { status: 400 });
  }

  const supabase = await createClient();

  const [
    { data: supplyData, error: supplyError },
    { data: batches, error: batchError },
  ] = await Promise.all([
    supabase
      .from('supplies')
      .select('supply_name')
      .eq('id', supplyId)
      .single(),
    supabase
      .from('supply_batch')
      .select('id, supplier_name, order_date, vendor_name, order_id, batch_name, status')
      .eq('supply_id', supplyId)
      .order('order_date', { ascending: false }),
  ]);

  if (supplyError) {
    return new Response(JSON.stringify({ error: supplyError.message }), { status: 500 });
  }

  if (batchError) {
    return new Response(JSON.stringify({ error: batchError.message }), { status: 500 });
  }

  // Return supply name and batches
  return new Response(
    JSON.stringify({ supplyName: supplyData?.supply_name, batches }),
    { status: 200 }
  );
}
