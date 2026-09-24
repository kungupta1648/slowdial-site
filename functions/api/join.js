// Cloudflare Pages Function. Runs on Cloudflare's own servers, not in the
// visitor's browser -- this is what lets the waitlist form save to a real
// database with one tap, no mail app, no redirect.
//
// Needs a D1 database bound to this Pages project as the variable "DB"
// (dashboard: Workers & Pages -> slowdial-site -> Settings -> Functions ->
// D1 database bindings). Without that binding, env.DB is undefined and this
// fails gracefully with a 500 rather than crashing -- see the checkist.
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return json({ ok: false, error: "not_configured" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!looksValid) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  try {
    // ON CONFLICT DO NOTHING: someone submitting twice (a double tap, or
    // coming back later) doesn't create a duplicate row or error out.
    await env.DB.prepare(
      "INSERT INTO signups (email, created_at) VALUES (?1, ?2) ON CONFLICT(email) DO NOTHING"
    ).bind(email, new Date().toISOString()).run();
  } catch {
    return json({ ok: false, error: "server_error" }, 500);
  }

  return json({ ok: true }, 200);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
