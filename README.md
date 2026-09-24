# slowdial.app

The live waitlist page's source. This is the canonical copy — edit index.html
here, commit, push to GitHub, and Cloudflare auto-deploys it to slowdial.app
within a minute or two. Nothing else to do for front-end-only changes.

## History

Started as a Claude Artifact (a private claude.ai link) while the design was
being worked out. Once the domain and real hosting were set up, that link was
retired — it's no longer updated and shouldn't be treated as current. This
repo + Cloudflare is the only live version from 2026-09-24 onward.

## Setup (already done, recorded for reference)

- GitHub: https://github.com/kungupta1648/slowdial-site (account: kungupta1648)
- Hosting: **Cloudflare Workers** (git-connected "Workers Builds", not the
  older "Pages" product — see the gotcha below for why that distinction
  matters), project "slowdial-site", connected to this repo's `main` branch,
  custom domain slowdial.app attached under Production.
- DNS: slowdial.app's nameservers point to Cloudflare (bought via Spaceship,
  DNS now managed at Cloudflare).
- Database: D1 database "slowdial-waitlist" holds the `signups` table
  (schema.sql). `worker.js` is the actual server — it serves the static
  files and handles `POST /api/join`, writing each email into that table.
  `wrangler.jsonc` wires it together: `main` points at worker.js, `assets`
  serves this folder's static files, `d1_databases` binds the database as
  `env.DB`. Every git push re-runs `npx wrangler deploy`, which reads this
  config and redeploys automatically.

## Gotcha already hit once

The file must be a COMPLETE HTML document (doctype, html, head with
`<meta charset="utf-8">`, body) — it was originally written as an Artifact
fragment (title + style only, no wrapper), which Claude's artifact viewer
wraps automatically. Served directly by a real host with no such wrapper,
the browser had no charset to go on and garbled special characters
(●●●●/▂▄▆█ became Â·/â– ). Keep the full document structure intact.

## Gotcha #2: this project deploys via `wrangler deploy`, not Pages Functions

The project was created as a git-connected **Worker** (build command
`npx wrangler deploy`), not a classic Pages project. That product auto-detects
a `functions/` folder as Pages Functions and bundles it in; a plain Worker
deploy does not — it silently ignored `functions/api/join.js` and shipped a
static-assets-only Worker with no server code and no way to add a D1 binding
from the dashboard (bindings for a Worker are declared in config, not
clicked in the UI). Found 2026-09-24 by reading the actual build log, which
has wrangler asking "we found a functions directory, is this a Pages
deployment?" and auto-answering "no" in non-interactive mode.

Fixed by deleting `functions/` and moving that logic into `worker.js` at the
repo root, with `wrangler.jsonc` declaring `main: "worker.js"`, the D1
binding, and the assets directory explicitly. If a future change needs new
server-side logic, add it to `worker.js` (or route to a new file it
imports) — don't recreate a `functions/` folder, it won't be picked up.
