// app/api/categories/route.ts
import { createClient } from '@/src/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('id, category_name')
    .order('category_name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({ success: true, categories: data }), {
    status: 200,
  });
}
