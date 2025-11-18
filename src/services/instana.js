/*
  This module is my thin integration layer between the SPA and Instana.
 
  I keep all Instana-specific details here so that:
    - screens and components only deal with "queries" and "chart data"
    - if Instana or the proxy path changes, I only have to fix this file
 
  Responsibilities of this module:
    1. Decide which base URL to use for the local Instana proxy.
    2. Normalize "JSON tree" blobs that I copy out of the Instana UI.
    3. Build request bodies for some common queries.
    4. Post those bodies to my instana-proxy.mjs server.
    5. Adapt the Instana response into a format that my charts can use.
    6. Optionally, preload a collection of queries on app startup.
*/
 
/* ------------------------------------------------------------------ */
/*  Proxy base URL                                                     */
/* ------------------------------------------------------------------ */
 
/*
  In dev, I run a small Node proxy (instana-proxy.mjs) on http://localhost:5080.
 
  That proxy:
    - terminates TLS to Instana with my internal CA bundle
    - injects the INSTANA_API_TOKEN from the environment
    - exposes a simple HTTP endpoint that the browser can call (no CORS issues)
 
  In production, this should eventually point to a gateway path such as /api.
 
  I keep that switching logic here so every caller just hits PROXY_BASE
  and doesn't care whether it is dev or prod.
*/
const PROXY_BASE =
  (typeof location !== "undefined" &&
    (location.hostname === "localhost" || location.hostname === "127.0.0.1"))
    ? "http://localhost:5090/api"
    : "/api";
 
 
/* ------------------------------------------------------------------ */
/*  Quick sanity helper                                                */
/* ------------------------------------------------------------------ */
 
/*
  Simple utility so I can verify that my bundler is wiring this module in.
  I can call ping() from anywhere and also see a console message once.
*/
export function ping() {
  console.log("[instana] module loaded");
  return "ok";
}
 
 
/* ------------------------------------------------------------------ */
/*  JSON-tree helpers                                                  */
/* ------------------------------------------------------------------ */
 
/*
  Instana's "API query / JSON tree" UI sometimes returns:
    - a full EXPRESSION with logicalOperator + elements[]
    - or a single TAG_FILTER when there is only one condition
 
  My proxy endpoint always expects an EXPRESSION, so I normalize here.
 
  If the expression is already an EXPRESSION, I return it unchanged.
  If it's a TAG_FILTER, I wrap it in an AND expression.
 
  This keeps the rest of the code simple because it no longer needs to
  worry about the two shapes.
*/
export function normalizeTagFilter(tagFilterExpression) {
  if (!tagFilterExpression) return null;
  if (tagFilterExpression.type === "EXPRESSION") return tagFilterExpression;
 
  if (tagFilterExpression.type === "TAG_FILTER") {
    return {
      type: "EXPRESSION",
      logicalOperator: "AND",
      elements: [tagFilterExpression],
    };
  }
 
  // If Instana ever adds more types, I just pass them through for now.
  return tagFilterExpression;
}
 
/*
  fromJsonTree is my "paste from Instana" helper.
 
  I copy the JSON tree from the Instana UI, paste it into my code as an
  object literal, and pass it through here. The only thing I touch is the
  tagFilterExpression shape; everything else stays as it came from Instana.
 
  This keeps the calling code clean and keeps the normalization behavior
  in one place.
*/
export function fromJsonTree(jsonTree) {
  const body = { ...jsonTree };
 
  if (body.tagFilterExpression) {
    body.tagFilterExpression = normalizeTagFilter(body.tagFilterExpression);
  }
 
  return body;
}
 
 
/* ------------------------------------------------------------------ */
/*  Optional body builders (hand-written queries)                      */
/* ------------------------------------------------------------------ */
 
/*
  Generic builder for one Instana "analyze / call-groups" query.
 
  This is convenient when I want something parametric instead of copying
  a JSON tree out of the UI.
 
  I use sensible defaults:
    - WebSphere Production
    - a 14 minute window
    - a service and endpoint that I can override
 
  The structure mirrors what Instana expects: timeFrame, tagFilterExpression,
  metrics, order, group, and includeSynthetic.
*/
export function buildInstanaBody({
  to = Date.now(),
  windowMs = 14 * 60 * 1000, // 14 minutes
  app = "WebSphere Production",
  service = "uprwas01_E_1",
  endpoint = "POST /EMPIRE",
} = {}) {
  return {
    timeFrame: {
      to,
      focusedMoment: to,
      autoRefresh: false,
      windowSize: windowMs,
    },
    tagFilterExpression: {
      type: "EXPRESSION",
      logicalOperator: "AND",
      elements: [
        {
          type: "TAG_FILTER",
          name: "application.name",
          operator: "EQUALS",
          entity: "DESTINATION",
          value: app,
        },
        {
          type: "TAG_FILTER",
          name: "service.name",
          operator: "EQUALS",
          entity: "DESTINATION",
          value: service,
        },
        {
          type: "TAG_FILTER",
          name: "endpoint.name",
          operator: "EQUALS",
          entity: "DESTINATION",
          value: endpoint,
        },
      ],
    },
    metrics: [
      { metric: "calls",   aggregation: "SUM"  },
      { metric: "errors",  aggregation: "MEAN" },
      { metric: "latency", aggregation: "MEAN" },
    ],
    order: {
      by: "calls",
      direction: "DESC",
    },
    group: {
      groupbyTag: "call.name",
    },
    includeSynthetic: false,
  };
}
 
/*
  Example of a specific query builder for a known transaction (IV0005 submit).
 
  This is basically a strongly-typed alias of buildInstanaBody with a known
  endpoint and service. I keep it here so I can re-use this query across
  screens without duplicating the endpoint string.
*/
export function buildIv0005SubmitBody({
  to = Date.now(),
  windowMs = 60 * 60 * 1000, // 1 hour
} = {}) {
  return buildInstanaBody({
    to,
    windowMs,
    app: "WebSphere Production",
    service: "uprwas05_E_1",
    endpoint: "POST /{tabsetId}.tabset/IV0005S/IV0005S_SUBMIT_ACTION",
  });
}
 
 
/* ------------------------------------------------------------------ */
/*  Generic JSON-tree runner                                           */
/* ------------------------------------------------------------------ */
 
/*
  This function is designed around the way I actually work with Instana:
  I build queries in the Instana UI, then copy the "JSON tree" out of the
  panel and paste that into my code.
 
  buildBodyFromJsonTree takes that raw object and makes sure it is safe
  to send to my proxy:
 
    - I normalize tagFilterExpression (TAG_FILTER vs EXPRESSION).
    - I optionally "re-base" the timeFrame so that the query always runs
      for "now" with the same window size instead of some hard-coded time.
 
  This is important because the JSON trees that I copy out of Instana
  usually contain specific timestamps. Those hard-coded timestamps become
  useless after some time passes and would otherwise return empty results.
*/
 
/**
* Take a raw Instana JSON tree and normalize it into a request body that
* works with the proxy.
*
* @param {object} jsonTree  Raw object from Instana "JSON tree" panel.
* @param {object} [options]
* @param {boolean} [options.shiftToNow=true]
*   When true, keep the same windowSize but move "to" and "focusedMoment"
*   to Date.now(). This prevents hard-coded future timestamps from
*   returning empty results later.
* @returns {object} normalized body ready for fetchInstanaViaProxy.
*/
export function buildBodyFromJsonTree(jsonTree, { shiftToNow = true } = {}) {
  if (!jsonTree || typeof jsonTree !== "object") {
    throw new Error("buildBodyFromJsonTree: jsonTree must be an object");
  }
 
  // First normalize tagFilterExpression and clone the object.
  const body = fromJsonTree(jsonTree);
 
  // If the JSON tree does not have a timeFrame, I just return what I have.
  if (!body.timeFrame || typeof body.timeFrame !== "object") {
    return body;
  }
 
  if (!shiftToNow) {
    // In some situations I really do want the original timestamps and window,
    // so I allow that by turning shiftToNow off.
    return body;
  }
 
  const originalTf = body.timeFrame;
  let windowSize = originalTf.windowSize;
 
  // If windowSize is missing or nonsense, I try to derive it from
  // the difference between "to" and "focusedMoment".
  if (
    (windowSize == null || Number.isNaN(windowSize)) &&
    typeof originalTf.to === "number" &&
    typeof originalTf.focusedMoment === "number"
  ) {
    windowSize = originalTf.to - originalTf.focusedMoment;
  }
 
  // Final fallback: default to 1 hour.
  if (!windowSize || windowSize <= 0) {
    windowSize = 60 * 60 * 1000;
  }
 
  const now = Date.now();
 
  return {
    ...body,
    timeFrame: {
      ...originalTf,
      to: now,
      focusedMoment: now,
      windowSize,
    },
  };
}
 
/*
  fetchFromJsonTree is the convenience function I use in screens.
 
  I can do:
 
      const data = await fetchFromJsonTree(myJsonTree);
 
  where myJsonTree is pasted directly from Instana. I do not have to
  remember proxy URLs or normalization rules in the screen code.
*/
 
/**
* Execute an Instana JSON tree through the local proxy.
*
* @param {object} jsonTree Raw Instana JSON tree object.
* @param {object} [options]
* @param {boolean} [options.shiftToNow=true] Passed to buildBodyFromJsonTree.
* @param {AbortSignal} [options.signal] Optional abort signal for fetch.
* @param {number} [options.timeoutMs=20000] Optional timeout override.
* @returns {Promise<object>} Parsed Instana response JSON.
*/
export async function fetchFromJsonTree(jsonTree, options = {}) {
  const { shiftToNow = true, signal, timeoutMs } = options;
 
  // 1) Normalize the JSON tree and adjust the timeframe (if desired).
  const body = buildBodyFromJsonTree(jsonTree, { shiftToNow });
 
  // 2) Delegate to my lower-level proxy fetcher.
  return fetchInstanaViaProxy(body, { signal, timeoutMs });
}
 
 
/* ------------------------------------------------------------------ */
/*  Proxy fetcher                                                      */
/* ------------------------------------------------------------------ */
 
/*
  This function actually makes the HTTP POST to my instana-proxy.mjs server.
 
  A few safety behaviors:
    - I normalize tagFilterExpression once more in case a caller forgot.
    - I support an optional AbortController so I can cancel long requests.
    - I expose a timeoutMs option to auto-abort if Instana is slow.
    - I throw a detailed error when the proxy returns a non-2xx response.
 
  The proxy itself takes care of:
    - talking TLS to Instana
    - adding the Authorization header with apiToken <token>
    - passing through the JSON response as-is
*/
export async function fetchInstanaViaProxy(
  body,
  { signal, timeoutMs = 90000 } = {}
) {
// Make sure any pasted TAG_FILTER gets wrapped correctly.
  if (body?.tagFilterExpression) {
    body.tagFilterExpression = normalizeTagFilter(body.tagFilterExpression);
  }
 
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  let timeout;
 
  try {
    // If the caller did not pass a signal, I manage my own AbortController.
    if (ctrl && !signal && timeoutMs) {
      timeout = setTimeout(() => ctrl.abort(), timeoutMs);
    }
 
    const res = await fetch(`${PROXY_BASE}/instana/call-groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: signal || ctrl?.signal,
    });
 
    if (!res.ok) {
      // Try to capture the body text for easier debugging.
      const text = await res.text().catch(() => "");
      throw new Error(`Proxy ${res.status} ${res.statusText}: ${text}`);
    }
 
    return await res.json();
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
 
 
/* ------------------------------------------------------------------ */
/*  Chart adapter                                                      */
/* ------------------------------------------------------------------ */
 
/*
  The Instana "analyze / call-groups" response is quite verbose. For
  visualization I only care about three series over time:
 
    - calls.sum
    - latency.mean
    - errors.mean
 
  toChartData walks the response and aggregates everything into parallel
  arrays of the same length:
 
    {
      labels:  [Date, Date, ...],
      calls:   [Number, Number, ...],
      latency: [Number, Number, ...],
      errors:  [Number, Number, ...]
    }
 
  This is a convenient format for my own chart components or for any
  simple charting library.
*/
 
/**
* Normalize Instana analyze/call-groups response into time-series arrays.
*
* Output:
*  {
*    labels:  Date[],
*    calls:   number[],
*    latency: number[],
*    errors:  number[]
*  }
*/
export function toChartData(json) {
  const items = json.items || [];
 
  if (!items.length) {
    console.warn('[instana][toChartData] no items in response', json);
    return { labels: [], calls: [], latency: [], errors: [] };
  }
 
  // Helper to pick whatever metric key Instana actually gave us
  const pickSeries = (metrics, base) => {
    return (
      metrics[`${base}.sum`] ||
      metrics[`${base}.mean`] ||
      metrics[`${base}.count`] ||
      metrics[base] ||
      []
    );
  };
 
  const tsSet = new Set();
 
  // 1) Collect all timestamps
  items.forEach(it => {
    const m = it.metrics || {};
 
    const callsSeries = pickSeries(m, 'calls');
    const latSeries   = pickSeries(m, 'latency');
    const errSeries   = pickSeries(m, 'errors');
 
    callsSeries.forEach(([t]) => tsSet.add(t));
    latSeries.forEach(([t]) => tsSet.add(t));
    errSeries.forEach(([t]) => tsSet.add(t));
  });
 
  const labels = Array.from(tsSet).sort((a, b) => a - b);
 
  const byTime = new Map(
    labels.map(t => [
      t,
      { calls: 0, latencyNum: 0, latencyDen: 0, errorsNum: 0, errorsDen: 0 },
    ])
  );
 
  // 2) Aggregate into totals / weighted averages
  items.forEach(it => {
    const m = it.metrics || {};
 
    const callsSeries = pickSeries(m, 'calls');
    const latSeries   = pickSeries(m, 'latency');
    const errSeries   = pickSeries(m, 'errors');
 
    const callsMap = new Map(callsSeries.map(([t, v]) => [t, v || 0]));
    const latMap   = new Map(latSeries.map(([t, v]) => [t, v || 0]));
    const errMap   = new Map(errSeries.map(([t, v]) => [t, v || 0]));
 
    labels.forEach(t => {
      const row = byTime.get(t);
 
      const c = callsMap.get(t) ?? 0;
      row.calls += c;
 
      const l = latMap.get(t);
      if (typeof l === 'number') {
        row.latencyNum += l * (c || 1);
        row.latencyDen += (c || 1);
      }
 
      const e = errMap.get(t);
      if (typeof e === 'number') {
        row.errorsNum += e * (c || 1);
        row.errorsDen += (c || 1);
      }
    });
  });
 
  const calls = labels.map(t => byTime.get(t).calls);
  const latency = labels.map(t => {
    const r = byTime.get(t);
    return r.latencyDen ? r.latencyNum / r.latencyDen : 0;
  });
  const errors = labels.map(t => {
    const r = byTime.get(t);
    return r.errorsDen ? r.errorsNum / r.errorsDen : 0;
  });
 
  const data = {
    labels: labels.map(t => new Date(t)),
    calls,
    latency,
    errors,
  };
 
  console.log('[instana][toChartData] normalized data:', data);
  return data;
}
 
 
/* ------------------------------------------------------------------ */
/*  Preload helper                                                     */
/* ------------------------------------------------------------------ */
 
/*
  preloadInstanaQueries is a generic helper that I call at application
  startup when I want to "warm" a bunch of Instana queries in parallel.
 
  I designed it so that it does NOT know about any particular query set.
  Instead, I pass in an object that looks like:
 
      {
        someKey: {
          label: "Human readable name",
          tree:  { /* JSON tree from Instana *\/ }
        },
        ...
      }
 
  It returns another object with the same keys but resolved data:
 
      {
        someKey: {
          label,
          tree,
          data,   // Instana response JSON
          // error: string (only present when the call failed)
        },
        ...
      }
 
  I can then stash this in window.AppData.instana or any other app-level
  cache so that screens and components can read the preloaded data
  without waiting on additional network calls.
*/
 
/**
* Preload a collection of Instana JSON-tree queries in parallel.
*
* @param {Record<string, {label:string, tree:object}>} queries
* @param {object} [options]
* @param {boolean} [options.shiftToNow=true]
* @returns {Promise<Record<string, { label:string, tree:object, data?:object, error?:string }>>}
*/
export async function preloadInstanaQueries(
  queries,
  { shiftToNow = true } = {}
) {
  const entries = Object.entries(queries || {});
 
  // Debug: log what queries are preloading
  console.log("[instana][preload] query keys:", entries.map(([key]) => key));

  const result = {};
 
  await Promise.all(
    entries.map(async ([key, def]) => {
      try {
        console.log(`[instana][preload] preparing ${key}`, def);
 
        if (!def || typeof def !== "object") {
          console.error(`[instana][preload] BAD ENTRY for key="${key}":`, def);
          result[key] = { label: def?.label ?? "(missing)", error: "Invalid entry object" };
          return;
        }
        
        if (!def.tree || typeof def.tree !== "object") {
          console.error(`[instana][preload] BAD TREE for key="${key}":`, def.tree);
          result[key] = { label: def.label, error: "Invalid tree: must be object" };
          return;
        }
        
        const data = await fetchFromJsonTree(def.tree, { shiftToNow, timeoutMs: 100000 });

        result[key] = {
          label: def.label,
          tree: def.tree,
          data,
        };
        console.log(
          `[instana][preload] ${key} (${def.label}) → items=${data.items?.length ?? 0}`
        );
      } catch (err) {
        console.error(`[instana][preload] ${key} failed:`, err);
        result[key] = {
          label: def.label,
          tree: def.tree,
          error: String(err),
        };
      }
    })
  );
 
  return result;
}