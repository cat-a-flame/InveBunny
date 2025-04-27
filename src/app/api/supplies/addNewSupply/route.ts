import { createClient } from '@/src/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { supply_name, supply_category } = body;

    if (!supply_name || supply_name.trim() === '') {
      return new Response(JSON.stringify({ success: false, error: 'Supply name is required' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('supplies')
      .insert([
        {
          supply_name,
          supply_category,
          owner_id: user.id,
        },
      ]);

    if (error) {
      console.error('Error inserting supply:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, supply: data }), { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Unexpected error occurred' }), { status: 500 });
  }
}
