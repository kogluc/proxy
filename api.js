if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: './' }).then(() => {
    console.log("Service Worker kayıt edildi");
  }).catch(err => {
    console.error("Service Worker kayıt hatası:", err);
  });
}

async function fetchWithRetry(url, retries = 1) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    if (text.trim().startsWith('<')) {
      location.reload();
      return;
    }
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    if (retries > 0) {
      console.warn("Retrying fetch due to error:", error.message);
      return fetchWithRetry(url, retries - 1);
    } else {
      throw error;
    }
  }
}

window.addEventListener("load", async () => {
  const params = new URLSearchParams(location.search);
  const site = params.get("site");
  const pathname = location.pathname.split('/').filter(Boolean);
  const repo = pathname.length > 0 ? `/${pathname[0]}/` : '/';
  if (!site) { return; }

  try {
    const url = `${pathname}${repo}?site=${encodeURIComponent(site)}`;
    const json = await fetchWithRetry(url, 1);
    document.body.textContent = JSON.stringify(json, null, 2);
  } catch (e) {
    document.body.textContent = "Hata: " + e.message;
    console.error("Fetch hatası:", e);
  }
});
