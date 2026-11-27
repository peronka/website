import type { APIRoute } from 'astro';
import { RESEND_API_KEY, RESEND_FROM } from 'astro:env/server';
import { createHash } from 'node:crypto';
import { site } from '../../config';

export const prerender = false;

const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;
const unavailable = `Formularz jest chwilowo niedostępny. Możesz wysłać adres swojego konta Google Play na ${site.emails.main} z tematem „Testy Androida”.`;

export const POST: APIRoute = async ({ request, redirect }) => {
  const json = request.headers.get('accept')?.includes('application/json');
  const fail = (status: number, error: string) => json
    ? Response.json({ error }, { status })
    : new Response(error, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  const done = () => json ? Response.json({ ok: true }) : redirect('/zgloszono-testy/', 303);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, 'Nieprawidłowe dane formularza.');
  }
  if (form.get('website')) return done();
  const field = form.get('email');
  const email = typeof field === 'string' ? field.trim() : '';
  if (email.length > 254 || !emailPattern.test(email)) return fail(400, 'Podaj poprawny adres e-mail.');
  if (!RESEND_API_KEY) return fail(503, unavailable);

  try {
    // Resend deduplicates retries of the same application for 24 hours.
    const digest = createHash('sha256').update(email).digest('hex');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `android-tests/${digest}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM || 'Peronka <testy@peronka.pl>',
        to: [site.emails.main],
        subject: 'Zgłoszenie do zamkniętych testów Peronki na Androidzie',
        text: `Adres konta Google Play osoby zgłaszającej się do testów: ${email}`,
        reply_to: email,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) return done();
    console.error('Android test signup rejected by Resend', response.status);
  } catch {
    console.error('Android test signup could not reach Resend');
  }
  return fail(502, unavailable);
};
