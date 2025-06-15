import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fields = searchParams.get('fields') || 'id, supply_name';
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('supplies')
    .select(fields)
    .order('supply_name');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ supplies: data }), { status: 200 });
}
