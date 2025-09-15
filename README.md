This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Inventory stockout notifications

The inventory update API (`src/app/api/inventory/updateStockBySku/route.ts`) now detects when a product quantity reaches zero and triggers email notifications through the helper in `src/utils/email.ts`.

### Required environment variables

Add the following variables to your `.env.local` (or deployment environment):

| Variable | Description |
| --- | --- |
| `ALERT_EMAIL` | Recipient for stockout alerts. Falls back to the authenticated user's email if unset. |
| `EMAIL_FROM` | Default sender address (used if provider-specific from addresses are not supplied). |
| `SENDGRID_API_KEY` | Optional. Enables the SendGrid REST transport. |
| `SENDGRID_FROM_EMAIL` | Sender address used when SendGrid is active. |
| `SUPABASE_EMAIL_FUNCTION_URL` | Optional. URL of a Supabase Edge Function that handles outbound email. |
| `SUPABASE_EMAIL_FUNCTION_KEY` | Bearer token for the edge function (service-role or function-specific key). |
| `SMTP_HOST` | Optional. Hostname of an SMTP server for direct delivery. |
| `SMTP_PORT` | Port for the SMTP server (defaults to 465 when `SMTP_SECURE=true`, otherwise 587). |
| `SMTP_SECURE` | Set to `true` to use TLS from the start of the connection. |
| `SMTP_USER` / `SMTP_PASSWORD` | Credentials for authenticated SMTP connections. |
| `SMTP_FROM_EMAIL` | Overrides the sender address when the SMTP transport is used. |
| `SMTP_HELO_DOMAIN` | Optional HELO/EHLO domain (defaults to `localhost`). |
| `SMTP_TIMEOUT_MS` | Optional timeout for SMTP operations (defaults to 15000). |
| `SMTP_REJECT_UNAUTHORIZED` | Set to `false` to skip TLS certificate validation (not recommended for production). |
| `ALERT_FROM_EMAIL` | Optional override for the from address used in stockout alerts. |

The helper automatically chooses the first available transport in this order: SendGrid, Supabase Edge Function, or direct SMTP.

### Supabase policies

Ensure the following Row Level Security (RLS) policies exist in Supabase:

- `product_variant_inventories`: authenticated users can `select` and `update` rows where `owner_id = auth.uid()`. The select policy must allow joining through `product_variants` → `products` so the API can read `product_name` values.
- If a Supabase Edge Function is used for email delivery, grant it permission to send mail (typically via a service role key) and enable `invoke` access for authenticated users.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
