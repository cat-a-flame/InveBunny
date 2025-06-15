import { createClient } from '@/src/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { p_batch_name, date_made, is_active } = body;

  const { error } = await supabase
    .from('product_batch')
    .update({ p_batch_name, date_made, is_active })
    .eq('id', params.id)
    .eq('owner_id', user.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await supabase
    .from('product_batch_to_supply_batch')
    .delete()
    .eq('product_batch_id', params.id);

  const { error } = await supabase
    .from('product_batch')
    .delete()
    .eq('id', params.id)
    .eq('owner_id', user.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
