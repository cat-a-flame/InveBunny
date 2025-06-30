import { createClient } from '@/src/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('supply_categories')
    .select('id, category_name')
    .order('category_name');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ categories: data }), { status: 200 });
}
