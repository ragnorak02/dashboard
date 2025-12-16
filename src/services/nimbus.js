const PROXY_BASE =
  (typeof location !== "undefined" &&
   (location.hostname === "localhost" || location.hostname === "127.0.0.1"))
    ? "http://localhost:5090/api"
    : "/api";
 
export async function fetchDisplayIssuesOnTV({ signal, timeoutMs = 20000 } = {}) {
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout = ctrl && !signal ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
 
  try {
    const res = await fetch(`${PROXY_BASE}/nimbus/displayIssuesOnTV`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: signal || ctrl?.signal,
    });
 
    if (!res.ok) throw new Error(`Nimbus ${res.status} ${res.statusText}: ${await res.text()}`);
    return await res.json();
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}