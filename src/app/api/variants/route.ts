// app/api/variants/route.ts
import { createClient } from '@/src/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('variants')
    .select('id, variant_name')
    .order('variant_name', { ascending: true });

  if (error) {
    console.error('Error fetching variants:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({ success: true, variants: data }), {
    status: 200,
  });
}
