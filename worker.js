// The actual server for slowdial.app. This is a real Worker (not a Pages
// Function) -- see README.md for why that distinction matters and what
// broke before this file existed. wrangler.jsonc points "main" at this file
// and declares the D1 binding ("DB") and the static-asset binding
// ("ASSETS", serving everything in this folder) that this code relies on.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/join" && request.method === "POST") {
      return handleJoin(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleJoin(request, env) {
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
