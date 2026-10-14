# Company X

Customer landing page. An invitation or magic-login email opens this app, creates a session, and sends the customer through consent before their products.

Each company lives under its own path, such as `http://localhost:3001/ej` or `http://localhost:3001/break`. The name, logo, favicon, and colors come from that company's `GET /t/<company>/api/look/` on the API, and the session cookies are scoped to that path. The questionnaire and report layout stay as they are; the company color replaces the accent.

## One config

Empty `title`, `description`, and `appUrl` are filled from the company name and port. Leave `logo` empty to show the name. Set it to a public path such as `/brand/logo.png` after placing a file in `public/brand`, or pass `--logo` to the script below.

```json
{
  "productName": "Acme",
  "packageName": "acme-portal",
  "logo": "",
  "devPort": 3011,
  "apiBaseUrl": "http://127.0.0.1:8000"
}
```

`apiBaseUrl` is the generic backend. Invite and magic-login emails use the backend setting `CLIENT_PORTAL_FRONTEND_URL`, which should be this app's origin.

## Create a copy

From this repo:

```bash
node scripts/create-instance.mjs \
  --dest ../Acme-Portal \
  --name "Acme" \
  --port 3011 \
  --api http://127.0.0.1:8000 \
  --logo ./logo.png
```

That copies the app, writes `instance.config.json`, generates a letter favicon when no favicon file is passed, installs dependencies, and prints the URL. Then:

```bash
cd ../Acme-Portal
npm run dev
```

`npm run apply-instance` does the same config step in the current checkout without copying. `npm run apply-instance -- --check` only validates the file.

GitHub Actions can do the same via **Create customer portal instance**. The workflow takes the name, port, and API origin and uploads a zip. Run `npm install` in the unzipped folder before starting it.

## Vercel

The production build is `npm run build` (`next build`). Node 22 is required. In the Vercel project, set:

- `API_BASE_URL` to the public generic API
- `APP_URL` to this deployment's origin (the backend must list it in `CSRF_TRUSTED_ORIGINS`)
- `CLIENT_API_BASE` to the scoring API, or the same origin as `API_BASE_URL`

`instance.config.json` still supplies the fallback name, logo, and local API address. A page outside a company path uses that name and logo.

## This checkout

```bash
npm install
npm run dev
```

Open [http://localhost:3001/ej](http://localhost:3001/ej) or [http://localhost:3001/break](http://localhost:3001/break) for a company. A path without a company is a 404. The port comes from `instance.config.json`.

The local API seeds those two companies, plus the consent wording, with `python manage.py seed_local_children`. The text is the BVI consent screen, with the company name filled in, stored as an active `ConsentTemplate` in each child.

The app is pointed at the generic API. Questionnaire, scoring, video, and report calls stay in place even where the generic API does not implement them yet. Those screens show an error until the endpoints exist.

| Path | What it does |
|---|---|
| `/login` | Asks for an email and requests a magic-login link |
| `/invite?token=` | Redeems an invitation. First sign-in opens `/consent`, then `/products` |
| `/magic-login?token=` | Redeems a sign-in link. Missing consent opens `/consent` |
| `/consent` | Shows the active consent wording from `GET /api/portal/assessment/consent/template/` and records a grant |
| `/products` | Product list from the flow-tool API |
| `/preview/[slug]` | Questionnaire walk, results, and report |

Sign-in calls `POST /api/clients/auth/magic-login/request/`, `POST /api/clients/auth/invites/redeem/`, and `POST /api/clients/auth/magic-login/redeem/`. The `client_session` and `csrftoken` cookies are stored on this origin and replayed on later API calls. The browser never talks to the API directly.
