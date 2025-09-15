import { createClient } from '@/src/utils/supabase/server';
import { sendOutOfStockEmail, type OutOfStockEmailItem } from '@/src/utils/email';

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  const body = await request.json();
  const { items } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: 'No items provided' }),
      { status: 400 }
    );
  }

  const stockouts: OutOfStockEmailItem[] = [];
  let notificationsSent = false;
  let notificationError: string | undefined;

  try {
    for (const item of items) {
      const { sku, quantity } = item;
      if (!sku || typeof quantity !== 'number') continue;

      const { data, error } = await supabase
        .from('product_variant_inventories')
        .select('product_quantity, product_variants(products(product_name))')
        .eq('product_sku', sku)
        .eq('owner_id', user.id)
        .single();

      if (error || !data) continue;

      const currentQuantity = data.product_quantity ?? 0;
      const newQuantity = Math.max(currentQuantity - quantity, 0);

      if (currentQuantity > 0 && newQuantity === 0) {
        const variantData = Array.isArray(data.product_variants)
          ? data.product_variants[0]
          : data.product_variants;
        const productData = variantData?.products;
        const productRecord = Array.isArray(productData) ? productData[0] : productData;
        const productName =
          (productRecord && typeof productRecord.product_name === 'string'
            ? productRecord.product_name
            : undefined) || 'Unknown product';

        stockouts.push({ sku, productName });
      }

      const { error: updateError } = await supabase
        .from('product_variant_inventories')
        .update({ product_quantity: newQuantity })
        .eq('product_sku', sku)
        .eq('owner_id', user.id);

      if (updateError) throw updateError;
    }

    if (stockouts.length > 0) {
      try {
        notificationsSent = await sendOutOfStockEmail({
          items: stockouts,
          userEmail: user.email ?? undefined,
          recipientEmail: process.env.ALERT_EMAIL ?? null,
        });
      } catch (emailError) {
        notificationError =
          emailError instanceof Error
            ? emailError.message
            : 'Failed to send stockout notification email.';
        console.error('Error sending out-of-stock notification:', emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent,
        ...(notificationError ? { notificationError } : {}),
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating stock by SKU:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to update stock';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500 }
    );
  }
}
