// src/services/instanaQueries.js
//
// This file only holds *descriptions* of Instana queries.
// The transport logic (proxy URL, fetch, normalization, etc.) lives in
// src/services/instana.js.
//
// Shape:
//
//   export const INSTANA_QUERIES = {
//     someKey: {
//       label: 'Human readable description',
//       tree: { /* JSON tree copied from Instana UI */ }
//     },
//     ...
//   }
//
// The app then calls preloadInstanaQueries(INSTANA_QUERIES, ...) on startup.
// Results are attached to window.AppData.instana using the same keys
// (someKey, ...), so any screen can look them up by key.
//
 
export const INSTANA_QUERIES = {
  // ---------------------------------------------------------------------------
  // WebSphere Prod → nims-ias-beep-subscriber (7 days, endpoint.name)
  // ---------------------------------------------------------------------------
  beepSubscriber_7d: {
    label: "WebSphere Prod → nims-ias-beep-subscriber (7 days, endpoint.name)",
    tree: {
      "timeFrame": {
        "to": 1763473418150,
        "focusedMoment": 1763473418150,
        "autoRefresh": false,
        "windowSize": 604800000 // 7 days
      },
      "tagFilterExpression": {
        "type": "EXPRESSION",
        "logicalOperator": "AND",
        "elements": [
          {
            "type": "TAG_FILTER",
            "name": "application.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "WebSphere Production"
          },
          {
            "type": "TAG_FILTER",
            "name": "service.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "nims-ias-beep-subscriber"
          },
          {
            "type": "TAG_FILTER",
            "name": "call.type",
            "operator": "EQUALS",
            "entity": "NOT_APPLICABLE",
            "value": "HTTP"
          }
        ]
      },
      "metrics": [
        { "metric": "calls",   "aggregation": "SUM"  },
        { "metric": "errors",  "aggregation": "MEAN" },
        { "metric": "latency", "aggregation": "MEAN" }
      ],
      "order": {
        "by": "calls",
        "direction": "DESC"
      },
      "group": {
        "groupbyTag": "endpoint.name",
        "groupbyTagEntity": "DESTINATION"
      }
    }
  },
 
  // ---------------------------------------------------------------------------
  // WebSphere Prod → uprwas07_I_1 (7 days, endpoint.name)
  // ---------------------------------------------------------------------------
  uprwas07_7d: {
    label: "WebSphere Prod → uprwas07_I_1 (7 days, endpoint.name)",
    tree: {
      "timeFrame": {
        "to": 1763473453904,
        "focusedMoment": 1763473453904,
        "autoRefresh": false,
        "windowSize": 604800000 // 7 days
      },
      "tagFilterExpression": {
        "type": "EXPRESSION",
        "logicalOperator": "AND",
        "elements": [
          {
            "type": "TAG_FILTER",
            "name": "application.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "WebSphere Production"
          },
          {
            "type": "TAG_FILTER",
            "name": "service.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "uprwas07_I_1"
          },
          {
            "type": "TAG_FILTER",
            "name": "call.type",
            "operator": "EQUALS",
            "entity": "NOT_APPLICABLE",
            "value": "HTTP"
          }
        ]
      },
      "metrics": [
        { "metric": "calls",   "aggregation": "SUM"  },
        { "metric": "errors",  "aggregation": "MEAN" },
        { "metric": "latency", "aggregation": "MEAN" }
      ],
      "order": {
        "by": "calls",
        "direction": "DESC"
      },
      "group": {
        "groupbyTag": "endpoint.name",
        "groupbyTagEntity": "DESTINATION"
      }
    }
  },
 
  // ---------------------------------------------------------------------------
  // WebSphere Prod → uprwas11_E_1 (7 days, endpoint.name)
  // ---------------------------------------------------------------------------
  uprwas11_7d: {
    label: "WebSphere Prod → uprwas11_E_1 (7 days, endpoint.name)",
    tree: {
      "timeFrame": {
        "to": 1763473489192,
        "focusedMoment": 1763473489192,
        "autoRefresh": false,
        "windowSize": 604800000 // 7 days
      },
      "tagFilterExpression": {
        "type": "EXPRESSION",
        "logicalOperator": "AND",
        "elements": [
          {
            "type": "TAG_FILTER",
            "name": "application.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "WebSphere Production"
          },
          {
            "type": "TAG_FILTER",
            "name": "service.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "uprwas11_E_1"
          },
          {
            "type": "TAG_FILTER",
            "name": "call.type",
            "operator": "EQUALS",
            "entity": "NOT_APPLICABLE",
            "value": "HTTP"
          }
        ]
      },
      "metrics": [
        { "metric": "calls",   "aggregation": "SUM"  },
        { "metric": "errors",  "aggregation": "MEAN" },
        { "metric": "latency", "aggregation": "MEAN" }
      ],
      "order": {
        "by": "calls",
        "direction": "DESC"
      },
      "group": {
        "groupbyTag": "endpoint.name",
        "groupbyTagEntity": "DESTINATION"
      }
    }
  },
 
  // ---------------------------------------------------------------------------
  // uprwas11_E_1 → RS4039S (7 days, call.name)
  // ---------------------------------------------------------------------------
  /*
  uprwas11_RS4039_7d: {
    label: "uprwas11_E_1 → RS4039S (7 days, call.name)",
    tree: {
      "timeFrame": {
        "to": 1763473573515,
        "focusedMoment": 1763473573515,
        "autoRefresh": false,
        "windowSize": 604800000 // 7 days
      },
      "tagFilterExpression": {
        "type": "EXPRESSION",
        "logicalOperator": "AND",
        "elements": [
          {
            "type": "TAG_FILTER",
            "name": "application.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "WebSphere Production"
          },
          {
            "type": "TAG_FILTER",
            "name": "service.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "uprwas11_E_1"
          },
          {
            "type": "TAG_FILTER",
            "name": "endpoint.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "POST /{tabsetId}.tabset/RS4039S"
          }
        ]
      },
      "metrics": [
        { "metric": "calls",   "aggregation": "SUM"  },
        { "metric": "errors",  "aggregation": "MEAN" },
        { "metric": "latency", "aggregation": "MEAN" }
      ],
      "order": {
        "by": "calls",
        "direction": "DESC"
      },
      "group": {
        "groupbyTag": "call.name"
      },
      "includeSynthetic": false
    }
  },
 */
  // ---------------------------------------------------------------------------
  // WebSphere Prod → uprwas11_E_1 (1 hour, endpoint.name)
  // ---------------------------------------------------------------------------
  uprwas11_endpoints_1h: {
    label: "WebSphere Prod → uprwas11_E_1 (1h, endpoint.name)",
    tree: {
      "timeFrame": {
        "to": 1763482231285,
        "focusedMoment": 1763482231285,
        "autoRefresh": false,
        "windowSize": 3600000 // 1 hour
      },
      "tagFilterExpression": {
        "type": "EXPRESSION",
        "logicalOperator": "AND",
        "elements": [
          {
            "type": "TAG_FILTER",
            "name": "application.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "WebSphere Production"
          },
          {
            "type": "TAG_FILTER",
            "name": "service.name",
            "operator": "EQUALS",
            "entity": "DESTINATION",
            "value": "uprwas11_E_1"
          },
          {
            "type": "TAG_FILTER",
            "name": "call.type",
            "operator": "EQUALS",
            "entity": "NOT_APPLICABLE",
            "value": "HTTP"
          }
        ]
      },
      "metrics": [
        { "metric": "calls",   "aggregation": "SUM"  },
        { "metric": "errors",  "aggregation": "MEAN" },
        { "metric": "latency", "aggregation": "MEAN" }
      ],
      "order": {
        "by": "calls",
        "direction": "DESC"
      },
      "group": {
        "groupbyTag": "endpoint.name",
        "groupbyTagEntity": "DESTINATION"
      }
    }
  }
};