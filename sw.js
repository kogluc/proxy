self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const pathname = location.pathname.split('/').filter(Boolean);
  const repo = pathname.length > 0 ? `/${pathname[0]}/` : '/';

  if (url.pathname === repo) {
    const site = url.searchParams.get("site");
    if (!site) {
      event.respondWith(
        new Response(JSON.stringify({ error: "site parametresi eksik" }), { headers: { "Content-Type": "application/json; charset=utf-8" }, status: 400 })
      );
      return;
    }
    const proxyURL = `https://script.google.com/macros/s/AKfycbw_MYcInMCCYiQZNzeaZAp7Upl_UwNZS2O1rlx1bDBwBT7UFJJPEpvNSSmbkCgWXATk/exec?site=${encodeURIComponent(site)}`;
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(proxyURL);
          const html = await res.text();
          const escaped = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          const json = { html: escaped };
          return new Response(JSON.stringify(json), {headers: { "Content-Type": "application/json; charset=utf-8" }});
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { headers: { "Content-Type": "application/json; charset=utf-8" }, status: 500 });
        }
      })()
    );
  }
});
