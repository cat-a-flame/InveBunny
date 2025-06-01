import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const supabase = await createClient();
    const body = await req.json();

    const { supply_id, supplier_name, order_date, vendor_name, order_id, batch_name, status } = body;

    // Get the current user
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase.from('supply_batch').insert({
        supply_id,
        supplier_name,
        order_date,
        vendor_name,
        order_id,
        batch_name,
        status,
        owner_id: user.id,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
}
