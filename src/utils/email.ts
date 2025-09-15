import net from 'node:net';
import tls from 'node:tls';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

interface NormalizedSendEmailOptions {
  to: string;
  subject: string;
  text: string;
  from: string;
  html?: string;
}

export interface OutOfStockEmailItem {
  sku: string;
  productName: string;
}

export interface SendOutOfStockEmailOptions {
  items: OutOfStockEmailItem[];
  userEmail?: string | null;
  recipientEmail?: string | null;
}

export async function sendOutOfStockEmail({
  items,
  userEmail,
  recipientEmail,
}: SendOutOfStockEmailOptions): Promise<boolean> {
  if (!items || items.length === 0) {
    return false;
  }

  const to = recipientEmail ?? process.env.ALERT_EMAIL ?? userEmail ?? undefined;
  if (!to) {
    throw new Error('No alert recipient configured. Set ALERT_EMAIL or provide a recipientEmail.');
  }

  const from =
    process.env.ALERT_FROM_EMAIL ??
    process.env.EMAIL_FROM ??
    process.env.SENDGRID_FROM_EMAIL ??
    process.env.SMTP_FROM_EMAIL ??
    userEmail ??
    to;

  const subject =
    items.length === 1
      ? `Out of stock: ${items[0].productName} (${items[0].sku})`
      : `Out of stock items (${items.length})`;

  const itemLines = items
    .map(item => `• ${item.productName} (SKU: ${item.sku})`)
    .join('\n');

  const textParts = ['The following items have just reached zero stock:', '', itemLines];

  if (userEmail) {
    textParts.push('', `Updated by: ${userEmail}`);
  }

  const text = textParts.join('\n');
  const html = buildHtmlBody(items, userEmail);

  await sendEmail({
    to,
    from,
    subject,
    text,
    html,
  });

  return true;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const normalized = normalizeOptions(options);

  if (process.env.SENDGRID_API_KEY) {
    await sendViaSendGrid(normalized);
    return;
  }

  if (process.env.SUPABASE_EMAIL_FUNCTION_URL) {
    await sendViaSupabaseEdgeFunction(normalized);
    return;
  }

  if (process.env.SMTP_HOST) {
    await sendViaSmtp(normalized);
    return;
  }

  throw new Error(
    'No email transport configured. Provide SENDGRID_API_KEY, SUPABASE_EMAIL_FUNCTION_URL, or SMTP_HOST to enable email delivery.',
  );
}

function normalizeOptions(options: SendEmailOptions): NormalizedSendEmailOptions {
  if (!options.to) {
    throw new Error('Missing email recipient');
  }

  if (!options.subject) {
    throw new Error('Missing email subject');
  }

  const from =
    options.from ??
    process.env.EMAIL_FROM ??
    process.env.SENDGRID_FROM_EMAIL ??
    process.env.SMTP_FROM_EMAIL ??
    process.env.SMTP_USER;

  if (!from) {
    throw new Error('Missing from email. Set EMAIL_FROM, SENDGRID_FROM_EMAIL, or SMTP_FROM_EMAIL.');
  }

  const html = options.html;
  const text = options.text ?? (html ? stripHtml(html) : undefined);

  if (!text) {
    throw new Error('Email body is empty. Provide text or html content.');
  }

  return {
    to: options.to,
    subject: options.subject,
    text,
    from,
    html,
  };
}

async function sendViaSendGrid(options: NormalizedSendEmailOptions): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY is not configured.');
  }

  const content: Array<{ type: string; value: string }> = [
    { type: 'text/plain', value: options.text },
  ];

  if (options.html) {
    content.push({ type: 'text/html', value: options.html });
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.to }] }],
      from: { email: options.from },
      subject: options.subject,
      content,
    }),
  });

  if (!response.ok) {
    const errorBody = await safeReadResponse(response);
    throw new Error(`SendGrid request failed: ${response.status} ${errorBody}`);
  }
}

async function sendViaSupabaseEdgeFunction(options: NormalizedSendEmailOptions): Promise<void> {
  const url = process.env.SUPABASE_EMAIL_FUNCTION_URL;
  if (!url) {
    throw new Error('SUPABASE_EMAIL_FUNCTION_URL is not configured.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (process.env.SUPABASE_EMAIL_FUNCTION_KEY) {
    headers.Authorization = `Bearer ${process.env.SUPABASE_EMAIL_FUNCTION_KEY}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      to: options.to,
      from: options.from,
      subject: options.subject,
      text: options.text,
      html: options.html,
    }),
  });

  if (!response.ok) {
    const errorBody = await safeReadResponse(response);
    throw new Error(`Supabase email function failed: ${response.status} ${errorBody}`);
  }
}

async function sendViaSmtp(options: NormalizedSendEmailOptions): Promise<void> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    throw new Error('SMTP_HOST is not configured.');
  }

  const port = Number(process.env.SMTP_PORT ?? (process.env.SMTP_SECURE === 'true' ? 465 : 587));
  const secure = (process.env.SMTP_SECURE ?? (port === 465 ? 'true' : 'false')) === 'true';
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const helo = process.env.SMTP_HELO_DOMAIN ?? 'localhost';
  const timeoutMs = Number(process.env.SMTP_TIMEOUT_MS ?? '15000');
  const allowInvalidCert = process.env.SMTP_REJECT_UNAUTHORIZED === 'false';

  const socket = secure
    ? tls.connect({
        host,
        port,
        rejectUnauthorized: !allowInvalidCert,
      })
    : net.createConnection({ host, port });

  socket.setEncoding('utf8');
  socket.setTimeout(timeoutMs, () => {
    socket.destroy(new Error('SMTP connection timed out'));
  });

  await new Promise<void>((resolve, reject) => {
    const event = secure ? 'secureConnect' : 'connect';
    const onError = (error: Error) => {
      socket.off(event, onConnect);
      reject(error);
    };
    const onConnect = () => {
      socket.off('error', onError);
      resolve();
    };
    socket.once(event, onConnect);
    socket.once('error', onError);
  });

  const waitForCode = (code: string) =>
    new Promise<string>((resolve, reject) => {
      let buffer = '';

      const onData = (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/).filter(line => line.length > 0);
        if (lines.length === 0) return;
        const lastLine = lines[lines.length - 1];
        if (lastLine.startsWith(`${code} `)) {
          cleanup();
          resolve(buffer);
        } else if (/^\d{3} /.test(lastLine) && !lastLine.startsWith(`${code} `)) {
          cleanup();
          reject(new Error(`SMTP error (expected ${code}): ${lastLine}`));
        }
      };

      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };

      const onClose = () => {
        cleanup();
        reject(new Error('SMTP connection closed before completing command'));
      };

      const cleanup = () => {
        socket.off('data', onData);
        socket.off('error', onError);
        socket.off('end', onClose);
        socket.off('close', onClose);
      };

      socket.on('data', onData);
      socket.once('error', onError);
      socket.once('end', onClose);
      socket.once('close', onClose);
    });

  const sendCommand = async (command: string, expectedCode: string) => {
    const responsePromise = waitForCode(expectedCode);
    socket.write(`${command}\r\n`);
    return responsePromise;
  };

  try {
    await waitForCode('220');
    await sendCommand(`EHLO ${helo}`, '250');

    if (user && password) {
      await sendCommand('AUTH LOGIN', '334');
      await sendCommand(Buffer.from(user).toString('base64'), '334');
      await sendCommand(Buffer.from(password).toString('base64'), '235');
    }

    await sendCommand(`MAIL FROM:<${options.from}>`, '250');
    await sendCommand(`RCPT TO:<${options.to}>`, '250');
    await sendCommand('DATA', '354');

    const body = `${options.text}`;
    const headers = [
      `From: ${options.from}`,
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
    ].join('\r\n');

    const dataResponse = waitForCode('250');
    socket.write(`${headers}\r\n\r\n${body}\r\n.\r\n`);
    await dataResponse;

    await sendCommand('QUIT', '221');
  } finally {
    if (!socket.destroyed) {
      socket.end();
    }
  }
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case '\'':
        return '&#39;';
      default:
        return char;
    }
  });
}

function buildHtmlBody(items: OutOfStockEmailItem[], userEmail?: string | null): string {
  const list = items
    .map(item => `<li><strong>${escapeHtml(item.productName)}</strong> (SKU: ${escapeHtml(item.sku)})</li>`)
    .join('');

  const intro = '<p>The following items have just reached zero stock:</p>';
  const outro = userEmail ? `<p>Updated by: ${escapeHtml(userEmail)}</p>` : '';

  return `${intro}<ul>${list}</ul>${outro}`;
}

async function safeReadResponse(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '<no body>';
  }
}
