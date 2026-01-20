export async function onRequest(context) {
  const jwt = context.request.headers.get("Cf-Access-Jwt-Assertion");
  const url = new URL(context.request.url);
  const path = url.pathname;

  const allowedPublic = new Set([
    "/denied.html",
    "/style.css",
    "/admin.js",
    "/favicon.ico",
  ]);

  if (!jwt && !allowedPublic.has(path) && !path.startsWith("/api/")) {
    return Response.redirect(new URL("/denied.html", url).toString(), 302);
  }

  return context.next();
}
