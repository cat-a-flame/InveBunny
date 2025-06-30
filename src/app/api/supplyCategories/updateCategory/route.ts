import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { uuid, category_name } = body;

  if (!uuid || !category_name) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('supply_categories')
    .update({ category_name })
    .eq('uuid', uuid)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
