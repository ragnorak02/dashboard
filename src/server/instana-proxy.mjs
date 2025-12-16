// src/server/instana-proxy.mjs
import http from "node:http";
import https from "node:https";
import fs from "node:fs";

const PORT = 5090;
 
const INSTANA_HOST = "tax-nys.nystaxinstana.svc.ny.gov";
const INSTANA_PATH = "/api/application-monitoring/analyze/call-groups";
const TOKEN = process.env.INSTANA_API_TOKEN;
 
// Nimbus endpoint (new)
const NIMBUS_HOST = "nimbus-support-request-dev.apps.dtf-np.caas.ny.gov";
const NIMBUS_PATH = "/displayIssuesOnTV";
 
// I keep my internal CA chain in one bundle file
const CA_BUNDLE = "C:/certs/nys-instana-ca-bundle.pem";
const AGENT = new https.Agent({ ca: fs.readFileSync(CA_BUNDLE) });
 
function sendProxyError(res, err) {
  res.writeHead(502, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify({ error: String(err?.message || err) }));
}
 
/**
* Proxy a GET request to an upstream HTTPS endpoint, and:
*  - log status/content-type/location + first 500 chars of body to terminal
*  - pass the upstream response back to the browser
*
* NOTE: This does not "fix" SSO redirects; it just makes the response visible.
*/
function proxyGetAndLog({ hostname, path, headers, agent }, res) {
  const opts = {
    hostname,
    port: 443,
    path,
    method: "GET",
    headers,
    timeout: 90000,
    agent,
  };
 
  const now = new Date().toISOString();
  console.log(`[proxy] ${now} → Nimbus GET ${opts.path}`);
 
  console.log("[proxy] NIMBUS_COOKIE length =", (process.env.NIMBUS_COOKIE || "").length);
  
const upstream = https.request(opts, (upstreamRes) => {
  const status = upstreamRes.statusCode || 0;
  const location = upstreamRes.headers.location || "";
 
  // If Nimbus is redirecting to SSO, DO NOT forward that redirect to the browser
  if ([301, 302, 303, 307, 308].includes(status) && location) {
    upstreamRes.resume(); // drain
 
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
 
    res.end(JSON.stringify({
      ok: false,
      proxied: true,
      upstreamStatus: status,
      message: "Nimbus requires SSO; upstream redirected to login.",
      location
    }));
 
    console.log(`[proxy] Nimbus redirect swallowed → ${location}`);
    return;
  }
 
  // Normal non-redirect response: pass through
  res.writeHead(status || 502, {
    "Content-Type": upstreamRes.headers["content-type"] || "application/json",
    "Access-Control-Allow-Origin": "*",
  });
 
  upstreamRes.pipe(res);
});
 
  upstream.on("timeout", () => upstream.destroy(new Error("Upstream timeout")));
  upstream.on("error", err => {
    console.error("Nimbus proxy error:", err.message);
    sendProxyError(res, err);
  });
 
  upstream.end();
}
 
http
  .createServer((req, res) => {
    // ---- CORS preflight ----
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      return res.end();
    }
 
    res.setHeader("Access-Control-Allow-Origin", "*");
 
    const u = new URL(req.url, "http://localhost");
 
    // ---------------------------
    // Nimbus route (NEW)
    // ---------------------------
    if (req.method === "GET" && u.pathname === "/api/nimbus/displayIssuesOnTV") {
      const cookie = process.env.NIMBUS_COOKIE || "";
    
      proxyGetAndLog(
        {
          hostname: NIMBUS_HOST,
          path: NIMBUS_PATH,
          headers: {
            Accept: "application/json, text/html;q=0.9, */*;q=0.8",
            ...(cookie ? { Cookie: cookie } : {}),
            "User-Agent": "Mozilla/5.0",
          },
          agent: AGENT,
        },
        res
      );
      return;
    }
 
    // ---------------------------
    // Instana route (original behavior)
    // ---------------------------
    if (req.method !== "POST" || u.pathname !== "/api/instana/call-groups") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
 
    // ---- collect body ----
    let body = "";
    req.on("data", c => (body += c));
    req.on("end", () => {
      const now = new Date().toISOString();
 
      const opts = {
        hostname: INSTANA_HOST,
        port: 443,
        path: INSTANA_PATH,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          authorization: `apiToken ${TOKEN}`,
        },
        timeout: 90000,
        agent: AGENT,
      };
 
      console.log(`[proxy] ${now} → Instana POST ${opts.path} len=${body.length}`);
 
      const upstream = https.request(opts, upstreamRes => {
        res.writeHead(upstreamRes.statusCode || 502, {
          "Content-Type": upstreamRes.headers["content-type"] || "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        upstreamRes.pipe(res);
      });
 
      upstream.on("timeout", () => upstream.destroy(new Error("Upstream timeout")));
      upstream.on("error", err => {
        console.error("Proxy error:", err.message);
        sendProxyError(res, err);
      });
 
      upstream.write(body);
      upstream.end();
    });
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`✅ Proxy running at http://localhost:${PORT}`);
    console.log(`   - POST /api/instana/call-groups`);
    console.log(`   - GET  /api/nimbus/displayIssuesOnTV`);
  });