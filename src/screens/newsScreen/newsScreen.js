import SCREEN_TEMPLATE from './newsScreen.tpl.html';
import SCREEN_STYLES from './newsScreen.scss';
 
// Register the <instana-chart> custom element
import 'src/components/instanaChart/instanaChart.js';
 
// Adapter that turns Instana JSON into chart series
import { toChartData } from 'src/services/instana.js';
 
export default class NEWSSCREEN extends SCREEN {
  constructor(oProps) {
    super(oProps);
 
    this.sTitle = 'News Screen';
    this.sMessageListSelector = '#screen-messages';
 
    this.oScreenCriteria = {
      resourceId: 'index',
      renderModes: {
        default: { layouts: [] }
      }
    };
 
    this.sScreenTemplate = SCREEN_TEMPLATE;
    this.sScreenStyles = SCREEN_STYLES;
 
    // Let CUI inject the template, then start waiting for DOM-dependent bits
    requestAnimationFrame(() => {
      this._waitForInstanaAndDom();
      this._waitForNimbusDomAndFetch();
    });
  }
 
  _getApiBase() {
    // SPA runs on one origin; proxy is on 5090 in local dev
    const isLocal =
      typeof location !== 'undefined' &&
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
 
    return isLocal ? 'http://localhost:5090/api' : '/api';
  }
 
  _waitForNimbusDomAndFetch(attempt = 0) {
    const MAX_ATTEMPTS = 50; // 10s @ 200ms
    const RETRY_DELAY = 200;
 
    const el = document.getElementById('nimbus-json');
    if (!el) {
      if (attempt < MAX_ATTEMPTS) {
        setTimeout(() => this._waitForNimbusDomAndFetch(attempt + 1), RETRY_DELAY);
      }
      return;
    }
 
    this._loadNimbusIntoElement(el);
  }
 
  _nimbusRowsFromMap(obj) {
    return Object.entries(obj || {})
      .filter(([, v]) => typeof v === 'number' && v > 0)
      .sort((a, b) => b[1] - a[1]);
  }
 
  _renderNimbusCards(nimbusJson, rootEl) {
    const adds = nimbusJson?.data?.adds;
    const totals = nimbusJson?.data?.totals || adds?.Totals;
 
    if (!adds || !totals) {
      rootEl.textContent = 'Nimbus: unexpected response shape';
      return;
    }
 
    // Order for top totals card (tweak as needed)
    const totalsOrder = ['DVM', 'UTM/QA', 'PROD', 'MOCK/STG', 'LOCAL', 'Triage', 'DEVELOPER TRAINING', 'N/A'];
    const totalsBars = totalsOrder
      .filter((k) => k in totals)
      .map((k) => [k, totals[k] ?? 0]);
 
    const maxTotal = Math.max(0, ...totalsBars.map(([, v]) => v));
 
    const escapeHtml = (s) =>
      String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
 
    const barRow = (label, value, max) => {
      const pct = max > 0 ? (value / max) * 100 : 0;
 
// If value > 0, force at least a tiny visible fill (otherwise looks "empty")
const displayPct = value > 0 ? Math.max(3, pct) : 0;
 
return `
  <div class="nimbus-row">
    <div class="nimbus-row__label">${escapeHtml(label)}</div>
    <div class="nimbus-row__barwrap">
      <div class="nimbus-row__bar" style="width:${displayPct}%"></div>
    </div>
    <div class="nimbus-row__value">${value}</div>
  </div>
`;
    };
 
    const card = (title, bodyHtml) => `
      <div class="nimbus-card">
        <div class="nimbus-card__title">${escapeHtml(title)}</div>
        <div class="nimbus-card__body">${bodyHtml}</div>
      </div>
    `;
 
    const totalsCardHtml = card(
      'Totals',
      `
        ${totalsBars.map(([k, v]) => barRow(k, v, maxTotal)).join('')}
        <div class="nimbus-subtitle">All Issues: ${totals['All Issues'] ?? 0}</div>
      `
    );
 
    // Build section cards for any group with non-zero items
    const sectionCards = Object.entries(adds)
      .filter(([section]) => section !== 'Totals')
      .map(([section, map]) => {
        const rows = this._nimbusRowsFromMap(map);
        if (rows.length === 0) return null;
 
        const max = Math.max(...rows.map(([, v]) => v));
        const body = rows.map(([k, v]) => barRow(k, v, max)).join('');
        return card(section, body);
      })
      .filter(Boolean);
 
    rootEl.innerHTML = `
      <div class="nimbus-grid">
        ${totalsCardHtml}
        ${sectionCards.join('')}
      </div>
    `;
  }
 
  async _loadNimbusIntoElement(el) {
    const base = this._getApiBase();
    const url = `${base}/nimbus/displayIssuesOnTV`;
 
    console.log('[newsScreen] Nimbus fetch starting:', url);
 
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
 
      const loc = res.headers.get('location');
      console.log('[newsScreen] Nimbus response status:', res.status);
      console.log('[newsScreen] Nimbus location:', loc);
 
      // Always read text first so we can display *something* even if it isn't JSON
      const text = await res.text();
      console.log('[newsScreen] Nimbus raw body (first 500):', (text || '').slice(0, 500));
 
      // Try parse JSON
      let parsed = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch (_) {
        parsed = null;
      }
 
      // If Nimbus returned the success payload, render cards
      if (parsed && parsed.status === 'success' && parsed.data) {
        this._renderNimbusCards(parsed, el);
        return;
      }
 
      // Helpful UX when it's redirecting to SSO
      if (parsed && parsed.proxied && parsed.upstreamStatus === 302) {
        el.textContent =
          'Nimbus is redirecting to SSO (not returning data yet).\n\n' +
          `Status: ${parsed.upstreamStatus}\n` +
          `Location: ${parsed.location || '(no location returned)'}\n`;
        return;
      }
 
      // Fallback: show pretty JSON if possible, else raw text
      if (parsed !== null) {
        el.textContent = JSON.stringify(parsed, null, 2);
      } else {
        el.textContent = text || `(empty body) status=${res.status}`;
      }
    } catch (e) {
      console.error('[newsScreen] Nimbus fetch ERROR:', e);
      el.textContent = `Nimbus fetch error: ${String(e?.message || e)}`;
    }
  }
 
  /**
   * Wait until BOTH:
   *  - window.AppData.instanaPromise exists, and
   *  - my <instana-chart> elements are present in the DOM.
   */
  async _waitForInstanaAndDom(attempt = 0) {
    const MAX_ATTEMPTS = 50; // 50 * 200ms = 10 seconds
    const RETRY_DELAY = 200; // ms
 
    const appData = window.AppData || {};
 
    // 1) Make sure the preload promise is present
    if (!appData.instanaPromise) {
      console.warn('[newsScreen] no AppData.instanaPromise yet (attempt', attempt, ')');
      if (attempt < MAX_ATTEMPTS) {
        setTimeout(() => this._waitForInstanaAndDom(attempt + 1), RETRY_DELAY);
      }
      return;
    }
 
    const chartIds = ['chart-beepSubscriber_7d', 'chart-uprwas11_endpoints_1h'];
    const missing = chartIds.filter((id) => !document.getElementById(id));
    if (missing.length) {
      if (attempt < MAX_ATTEMPTS) {
        setTimeout(() => this._waitForInstanaAndDom(attempt + 1), RETRY_DELAY);
      }
      return;
    }
 
    // 3) Now it's safe to await the promise and wire charts
    try {
      console.log('[newsScreen] waiting for Instana preload promise');
      const instanaMap = await appData.instanaPromise;
      this._wireInstanaCharts(instanaMap || {});
    } catch (err) {
      console.error('[newsScreen] failed to resolve instanaPromise:', err);
    }
  }
 
  /**
   * Take the preloaded Instana map and feed it into the charts on the page.
   */
  _wireInstanaCharts(instanaMap) {
    console.log('[newsScreen] wiring charts with Instana map:', instanaMap);
 
    const attachChart = (chartId, queryKey) => {
      const entry = instanaMap[queryKey];
      if (!entry) {
        console.warn('[newsScreen] no Instana entry for', queryKey);
        return;
      }
      if (entry.error) {
        console.warn('[newsScreen] Instana error for', queryKey, entry.error);
        return;
      }
      if (!entry.data) {
        console.warn('[newsScreen] Instana entry has no data for', queryKey);
        return;
      }
 
      const chartElem = document.getElementById(chartId);
      if (!chartElem) {
        console.warn('[newsScreen] chart element not found:', chartId);
        return;
      }
 
      const chartData = toChartData(entry.data);
      chartElem.data = chartData;
 
      console.log('[newsScreen] wired chart', chartId, '←', queryKey, chartData);
    };
 
    attachChart('chart-beepSubscriber_7d', 'beepSubscriber_7d');
    attachChart('chart-uprwas11_endpoints_1h', 'uprwas11_endpoints_1h');
  }
}