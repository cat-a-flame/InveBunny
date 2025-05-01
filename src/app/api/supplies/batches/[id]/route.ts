import { createClient } from '@/src/utils/supabase/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();

    const { error } = await supabase
      .from('supply_batch')
      .update(body)
      .eq('id', params.id)
      .eq('owner_id', user.id); // secure to only edit own records

    if (error) {
      console.error('Error updating batch:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Unexpected error in PUT:', error);
    return new Response(JSON.stringify({ success: false, error: 'Unexpected error occurred' }), { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const { error } = await supabase
      .from('supply_batch')
      .delete()
      .eq('id', params.id)
      .eq('owner_id', user.id); // secure to only delete own records

    if (error) {
      console.error('Error deleting batch:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE:', error);
    return new Response(JSON.stringify({ success: false, error: 'Unexpected error occurred' }), { status: 500 });
  }
}
