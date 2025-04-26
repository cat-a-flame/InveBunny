import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const supabase = await createClient();

  const body = await request.json();
  const { id, category_name } = body;

  if (!id || !category_name) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  console.log('Updating category:', { id, category_name });

  const { data, error } = await supabase
    .from('categories')
    .update({ category_name })
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
