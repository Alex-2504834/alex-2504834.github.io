const ALLOWED = new Set([
  "data/site.json",
  "data/links.json",
  "data/about.json",
  "data/projects.json",
  "data/skills.json",
]);

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get("key") || "";
  if (!ALLOWED.has(key)) return new Response("Not allowed", { status: 403 });

  const value = await context.env.CONTENT_KV.get(key);
  if (!value) return new Response("Not found", { status: 404 });

  return new Response(value, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
