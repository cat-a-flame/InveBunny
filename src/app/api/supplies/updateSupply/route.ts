import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const supabase = await createClient();

  const body = await request.json();
  const { id, supply_name, supply_category_id, supply_quantity } = body;

  if (!id || !supply_name) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const parsedQuantity = Number(supply_quantity);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
    return NextResponse.json({ error: 'Quantity must be a non-negative number' }, { status: 400 });
  }

  console.log('Updating supply:', { id, supply_name });

  const { data, error } = await supabase
    .from('supplies')
    .update({ supply_name, supply_category_id, supply_quantity: parsedQuantity })
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
