import { createClient } from '@/src/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { variant_name } = body;

    if (!variant_name || variant_name.trim() === '') {
      return new Response(JSON.stringify({ success: false, error: 'Variant name is required' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('variants')
      .insert([
        {
          variant_name,
          owner_id: user.id,
        },
      ]);

    if (error) {
      console.error('Error inserting variant:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, variant: data }), { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Unexpected error occurred' }), { status: 500 });
  }
}
