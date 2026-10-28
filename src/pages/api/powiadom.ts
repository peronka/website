import type { APIRoute } from 'astro';
import { BREVO_API_KEY, BREVO_DOI_TEMPLATE_ID, BREVO_LIST_ID } from 'astro:env/server';

// Rendered on demand so the Brevo key never reaches the browser.
export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR = 'Nie udało się zapisać. Spróbuj ponownie za chwilę.';

// Signs the address up through Brevo's double opt-in: Brevo mails a
// confirmation link and adds the contact to the list only after it is clicked.
export const POST: APIRoute = async ({ request, site, redirect }) => {
  // Without JS the form posts natively, so answer with a page instead of JSON.
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  const done = () => (wantsJson ? Response.json({ ok: true }) : redirect('/zapisano/', 303));
  const fail = (status: number, error: string) =>
    wantsJson
      ? Response.json({ error }, { status })
      : new Response(error, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, 'Nieprawidłowe dane formularza.');
  }

  // Honeypot: hidden from people, filled in by bots. Pretend it worked.
  if (form.get('website')) return done();

  const email = String(form.get('email') ?? '').trim();
  if (email.length > 254 || !EMAIL.test(email)) return fail(400, 'Podaj poprawny adres e-mail.');

  if (!BREVO_API_KEY || !BREVO_LIST_ID || !BREVO_DOI_TEMPLATE_ID) {
    console.error('Brevo is not configured: set BREVO_API_KEY, BREVO_LIST_ID and BREVO_DOI_TEMPLATE_ID');
    return fail(503, 'Zapisy są chwilowo niedostępne. Spróbuj później.');
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        email,
        includeListIds: [BREVO_LIST_ID],
        templateId: BREVO_DOI_TEMPLATE_ID,
        redirectionUrl: new URL('/potwierdzono/', site ?? request.url).href,
      }),
    });
    if (!res.ok) {
      console.error('Brevo double opt-in failed', res.status, await res.text());
      return fail(502, GENERIC_ERROR);
    }
  } catch (error) {
    console.error('Brevo unreachable', error);
    return fail(502, GENERIC_ERROR);
  }

  return done();
};
