import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fields = searchParams.get('fields') || 'id, supply_name';
  const withBatches = searchParams.get('withBatches') === 'true';
  const supabase = await createClient();

  let query = supabase.from('supplies');
  if (withBatches) {
    query = query.select(`${fields}, supply_batch!inner(id)`);
  } else {
    query = query.select(fields);
  }

  const { data, error } = await query.order('supply_name');

  const supplies = (data || []).map((row: any) => {
    if ('supply_batch' in row) {
      const { supply_batch, ...rest } = row;
      return rest;
    }
    return row;
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ supplies }), { status: 200 });
}
