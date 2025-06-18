import { createClient } from '@/src/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { p_batch_name, date_made, is_active, supplies } = body;

  const { error } = await supabase
    .from('product_batch')
    .update({ p_batch_name, date_made, is_active })
    .eq('id', params.id)
    .eq('owner_id', user.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (Array.isArray(supplies)) {
    const { data: existing, error: fetchError } = await supabase
      .from('product_batch_to_supply_batch')
      .select('supply_batch_id')
      .eq('product_batch_id', params.id)
      .eq('owner_id', user.id);

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    const existingIds = (existing || []).map((r: any) => r.supply_batch_id);
    const toInsert = supplies.filter((id: string) => !existingIds.includes(id));
    const toDelete = existingIds.filter((id: string) => !supplies.includes(id));

    if (toInsert.length > 0) {
      const rows = toInsert.map((id: string) => ({
        product_batch_id: params.id,
        supply_batch_id: id,
        owner_id: user.id,
      }));
      const { error: insertError } = await supabase
        .from('product_batch_to_supply_batch')
        .insert(rows);
      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
    }

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('product_batch_to_supply_batch')
        .delete()
        .eq('product_batch_id', params.id)
        .eq('owner_id', user.id)
        .in('supply_batch_id', toDelete);
      if (deleteError) {
        return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
      }
    }
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
    .eq('product_batch_id', params.id)
    .eq('owner_id', user.id);

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
