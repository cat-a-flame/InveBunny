import { createClient } from '@/src/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const supabase = await createClient();

    try {
        // First delete all related rows in product_inventories
        const { error: piError } = await supabase
            .from('product_inventories')
            .delete()
            .eq('product_id', id);

        if (piError) {
            return NextResponse.json({ error: piError.message }, { status: 500 });
        }

        // Then delete the product itself
        const { error: productError } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (productError) {
            return NextResponse.json({ error: productError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
