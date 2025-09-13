import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from('product_variant_inventories')
    .select('id', { count: 'exact', head: true })
    .eq('inventory_id', id);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'Inventory not empty' }, { status: 400 });
  }

  const { error } = await supabase.from('inventories').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
