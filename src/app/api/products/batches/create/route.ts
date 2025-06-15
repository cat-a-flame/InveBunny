import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { product_id, p_batch_name, date_made, is_active, supplies } = body;

    if (!product_id || !p_batch_name || !date_made) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const { data: batchData, error } = await supabase
      .from('product_batch')
      .insert({
        product_id,
        p_batch_name,
        date_made,
        is_active,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (Array.isArray(supplies) && supplies.length > 0) {
      const rows = supplies.map((s: { supply_batch_id: string }) => ({
        product_batch_id: batchData.id,
        supply_batch_id: s.supply_batch_id,
      }));
      const { error: linkError } = await supabase
        .from('product_batch_to_supply_batch')
        .insert(rows);
      if (linkError) {
        return NextResponse.json({ success: false, error: linkError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, batch: batchData }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Unexpected error occurred' }, { status: 500 });
  }
}
