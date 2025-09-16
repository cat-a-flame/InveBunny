import { createClient } from '@/src/utils/supabase/server';

const slackWebhookUrl =
  process.env.Slack ?? process.env.SLACK ?? process.env.SLACK_WEBHOOK_URL;

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

  try {
    const outOfStockItems: {
      sku: string;
      previousQuantity: number;
      newQuantity: number;
    }[] = [];

    for (const item of items) {
      const { sku, quantity } = item;
      if (!sku || typeof quantity !== 'number') continue;

      const { data, error } = await supabase
        .from('product_variant_inventories')
        .select('product_quantity')
        .eq('product_sku', sku)
        .eq('owner_id', user.id)
        .single();

      if (error || !data) continue;

      const previousQuantity = data.product_quantity ?? 0;
      const newQuantity = Math.max(previousQuantity - quantity, 0);

      const { error: updateError } = await supabase
        .from('product_variant_inventories')
        .update({ product_quantity: newQuantity })
        .eq('product_sku', sku)
        .eq('owner_id', user.id);

      if (updateError) throw updateError;

      if (previousQuantity > 0 && newQuantity === 0) {
        outOfStockItems.push({ sku, previousQuantity, newQuantity });
      }
    }

    if (outOfStockItems.length > 0) {
      if (!slackWebhookUrl) {
        console.warn(
          'Slack webhook URL is not configured; skipping notification for SKUs:',
          outOfStockItems.map((item) => item.sku).join(', ')
        );
      } else {
        const messageLines = outOfStockItems
          .map(
            (item) =>
              `• SKU ${item.sku} (was ${item.previousQuantity}, now ${item.newQuantity})`
          )
          .join('\n');

        const payload = {
          text: `:rotating_light: The following items just went out of stock:\n${messageLines}`,
        };

        try {
          await fetch(slackWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (slackError) {
          console.error('Failed to send Slack notification', slackError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, outOfStockItems }), {
      status: 200,
    });
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
