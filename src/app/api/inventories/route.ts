import { createClient } from '@/src/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }
  const { data, error } = await supabase
    .from('inventories')
    .select('id, inventory_name')
    .eq('owner_id', user.id)
    .order('inventory_name');

  if (error) {
    console.error('Error fetching inventories:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ inventories: data }), { status: 200 });
}
