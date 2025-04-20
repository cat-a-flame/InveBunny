import { createClient } from '@/src/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { product_name, product_sku, product_quantity, category_id, variant_id } = body;

    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single();

    if (categoryError || !categoryData) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid category' }), { status: 400 });
    }

    const { data: variantData, error: variantError } = await supabase
      .from('variants')
      .select('id')
      .eq('id', variant_id)
      .single();

    if (variantError || !variantData) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid variant' }), { status: 400 });
    }

    // Insert the new product into the "products" table
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          product_name,
          product_sku,
          product_quantity,
          product_category: categoryData.id,
          product_variant: variantData.id,
          owner_id: user.id,
        },
      ]);

    if (error) {
      console.error('Error inserting product:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, product: data }), { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Unexpected error occurred' }), { status: 500 });
  }
}
