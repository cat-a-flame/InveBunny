import { supabase } from '../../../lib/supabaseClient';

export async function GET(request) {
    try {
        const { data: products, error } = await supabase
            .from('products, categories, variants')
            .select(`
                id, 
                product_name, 
                product_sku, 
                product_quantity, 
                categories (category_name), 
                variants (variant_name)
            `);
            
        if (error) {
            console.error('Error fetching products:', error);
            return new Response(JSON.stringify({ message: 'Error fetching inventory', error }), { status: 500 });
        }

        console.log('Fetched products:', products);
        return new Response(JSON.stringify({ products }), { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(JSON.stringify({ message: 'Unexpected error fetching inventory', error }), { status: 500 });
    }
}