# Company X

Customer landing page. An invitation or magic-login email opens this app, creates a session, and sends the customer through consent before their products.

On a company host such as `http://ej.localhost:3001` or `http://break.localhost:3001`, the name, logo, favicon, and colors come from that company's `GET /api/look/`. `localhost` is the public control store and has no company look, so it falls back to `instance.config.json`. The questionnaire and report layout stay as they are; the company color replaces the accent.

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

## This checkout

```bash
npm install
npm run dev
```

Open [http://ej.localhost:3001](http://ej.localhost:3001) or [http://break.localhost:3001](http://break.localhost:3001) for a company. [http://localhost:3001](http://localhost:3001) is the fallback look. The port comes from `instance.config.json`.

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
