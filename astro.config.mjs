// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Signup endpoints use server-only credentials at request time.
const confirmationPages = /\/(zapisano|potwierdzono|zgloszono-testy)\/$/;

export default defineConfig({
  site: 'https://peronka.pl',
  trailingSlash: 'always',
  adapter: vercel(),
  integrations: [sitemap({ filter: (page) => !confirmationPages.test(page) })],
  env: {
    schema: {
      // Optional so local builds work without Brevo; the endpoint answers 503 until they are set.
      BREVO_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      BREVO_LIST_ID: envField.number({ context: 'server', access: 'secret', optional: true }),
      BREVO_DOI_TEMPLATE_ID: envField.number({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
