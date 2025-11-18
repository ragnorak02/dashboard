// src/server/instana-proxy.mjs
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
 
const PORT = 5090;
const INSTANA_HOST = "tax-nys.nystaxinstana.svc.ny.gov";
const INSTANA_PATH = "/api/application-monitoring/analyze/call-groups";
const TOKEN = process.env.INSTANA_API_TOKEN;
 
// I keep my internal CA chain in one bundle file
const CA_BUNDLE = "C:/certs/nys-instana-ca-bundle.pem";
const AGENT = new https.Agent({ ca: fs.readFileSync(CA_BUNDLE) });
 
http.createServer((req, res) => {
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
 
  // ---- route guard ----
  const u = new URL(req.url, "http://localhost");
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
      res.writeHead(502, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ error: String(err) }));
    });
 
    upstream.write(body);
    upstream.end();
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`✅ Instana proxy running at http://localhost:${PORT}`);
});