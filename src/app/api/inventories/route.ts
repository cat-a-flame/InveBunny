import { createClient } from '@/src/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inventories')
    .select('id, inventory_name')
    .order('inventory_name');

  if (error) {
    console.error('Error fetching inventories:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ inventories: data }), { status: 200 });
}
