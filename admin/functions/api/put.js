const ALLOWED = new Set([
  "data/site.json",
  "data/links.json",
  "data/about.json",
  "data/projects.json",
  "data/skills.json",
]);

export async function onRequestPut(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get("key") || "";
  if (!ALLOWED.has(key)) return new Response("Not allowed", { status: 403 });

  const body = await context.request.text();

  try { JSON.parse(body); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  await context.env.CONTENT_KV.put(key, body);

  return new Response(JSON.stringify({ ok: true, key }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
