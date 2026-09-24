# slowdial.app

The live waitlist page's source. This is the canonical copy — edit index.html
here, commit, push to GitHub, and Cloudflare Pages auto-deploys it to
slowdial.app within a minute or two. Nothing else to do.

## History

Started as a Claude Artifact (a private claude.ai link) while the design was
being worked out. Once the domain and real hosting were set up, that link was
retired — it's no longer updated and shouldn't be treated as current. This
repo + Cloudflare Pages is the only live version from 2026-09-24 onward.

## Setup (already done, recorded for reference)

- GitHub: https://github.com/kungupta1648/slowdial-site (account: kungupta1648)
- Hosting: Cloudflare Pages, project "slowdial-site", connected to this repo's
  `main` branch, custom domain slowdial.app attached under Production.
- DNS: slowdial.app's nameservers point to Cloudflare (bought via Spaceship,
  DNS now managed at Cloudflare).

## Gotcha already hit once

The file must be a COMPLETE HTML document (doctype, html, head with
`<meta charset="utf-8">`, body) — it was originally written as an Artifact
fragment (title + style only, no wrapper), which Claude's artifact viewer
wraps automatically. Served directly by a real host with no such wrapper,
the browser had no charset to go on and garbled special characters
(●●●●/▂▄▆█ became Â·/â– ). Keep the full document structure intact.
