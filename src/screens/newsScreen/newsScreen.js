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
      renderModes: { default: { layouts: [] } }
    };
 
    this.sScreenTemplate = SCREEN_TEMPLATE;
    this.sScreenStyles = SCREEN_STYLES;
 
    requestAnimationFrame(() => {
      this._waitForInstanaAndDom();
      this._waitForNimbusDomAndFetch();
    });
  }
 
  _getApiBase() {
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
 
  // ---------- Nimbus rendering helpers ----------
 
  _escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
 
  _asNumber(v) {
    return typeof v === 'number' && Number.isFinite(v) ? v : 0;
  }
 
  _rowsFromMap(obj, { includeZeros = false } = {}) {
    return Object.entries(obj || {})
      .filter(([, v]) => typeof v === 'number' && Number.isFinite(v) && (includeZeros ? true : v > 0))
      .sort((a, b) => this._asNumber(b[1]) - this._asNumber(a[1]));
  }
 
  _barRow(label, value, max) {
    const v = this._asNumber(value);
    const pct = max > 0 ? (v / max) * 100 : 0;
 
    // If CSS gets weird, inline styles keep it visible.
    const displayPct = v > 0 ? Math.max(3, pct) : 0;
 
    return `
      <div class="nimbus-row">
        <div class="nimbus-row__label">${this._escapeHtml(label)}</div>
        <div class="nimbus-row__barwrap" style="height:12px;">
          <div class="nimbus-row__bar" style="width:${displayPct}%; height:12px;"></div>
        </div>
        <div class="nimbus-row__value">${v}</div>
      </div>
    `;
  }
 
  _card(title, bodyHtml, subtitle = '') {
    return `
      <div class="nimbus-card">
        <div class="nimbus-card__title">${this._escapeHtml(title)}</div>
        ${subtitle ? `<div class="nimbus-card__subtitle">${this._escapeHtml(subtitle)}</div>` : ''}
        <div class="nimbus-card__body">${bodyHtml}</div>
      </div>
    `;
  }
 
  _renderNimbusCards(nimbusJson, mountEl) {
    const adds = nimbusJson?.data?.adds;
    const totals = nimbusJson?.data?.totals || adds?.Totals;
 
    if (!adds || !totals) {
      mountEl.textContent = 'Nimbus: unexpected response shape';
      return;
    }
 
    // 
    const envOrder = ['DVM', 'UTM/QA', 'PROD', 'MOCK/STG', 'LOCAL', 'Triage', 'DEVELOPER TRAINING', 'N/A'];
 
    const totalsBars = envOrder
      .filter((k) => k in totals)
      .map((k) => [k, this._asNumber(totals[k])]);
 
    const allIssues = this._asNumber(totals['All Issues']);
    const maxTotal = Math.max(0, ...totalsBars.map(([, v]) => v));
 
    const totalsBody = totalsBars.map(([k, v]) => this._barRow(k, v, maxTotal)).join('');
 
    const totalsCard = this._card('Totals', totalsBody, `All Issues: ${allIssues}`);
 
    // One card per environment (even if all zeros)
    const envCards = envOrder.map((env) => {
      const breakdown = adds[env] || {};
      const totalForEnv = this._asNumber(totals[env]);
 
      const rowsNonZero = this._rowsFromMap(breakdown, { includeZeros: false });
      if (rowsNonZero.length === 0) {
        // Show an "empty" body but still render the card (what you asked for)
        return this._card(
          env,
          `<div class="nimbus-empty">No issues</div>`,
          `Total: ${totalForEnv}`
        );
      }
 
      const max = Math.max(1, ...rowsNonZero.map(([, v]) => this._asNumber(v)));
      const body = rowsNonZero.map(([k, v]) => this._barRow(k, v, max)).join('');
 
      return this._card(env, body, `Total: ${totalForEnv}`);
    });
 
    mountEl.innerHTML = `
      <div class="nimbus-grid">
        ${totalsCard}
        ${envCards.join('')}
      </div>
    `;
  }
 
  /*
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
 
      console.log('[newsScreen] Nimbus response status:', res.status);
 
      const text = await res.text();
      console.log('[newsScreen] Nimbus raw body (first 500):', (text || '').slice(0, 500));
 
      let parsed = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch (_) {
        parsed = null;
      }
 
      // Success payload -> render cards
      if (parsed && parsed.status === 'success' && parsed.data) {
        this._renderNimbusCards(parsed, el);
        return;
      }
 
      // Proxy “SSO redirect swallowed” payload -> show message
      if (parsed && parsed.proxied && parsed.upstreamStatus === 302) {
        el.textContent =
          'Nimbus is redirecting to SSO (not returning data yet).\n\n' +
          `Status: ${parsed.upstreamStatus}\n` +
          `Location: ${parsed.location || '(no location returned)'}\n`;
        return;
      }
 
      // Fallback
      if (parsed !== null) el.textContent = JSON.stringify(parsed, null, 2);
      else el.textContent = text || `(empty body) status=${res.status}`;
    } catch (e) {
      console.error('[newsScreen] Nimbus fetch ERROR:', e);
      el.textContent = `Nimbus fetch error: ${String(e?.message || e)}`;
    }
  }
 */
  // ---------- Instana (unchanged) ----------
 
  async _waitForInstanaAndDom(attempt = 0) {
    const MAX_ATTEMPTS = 50;
    const RETRY_DELAY = 200;
 
    const appData = window.AppData || {};
 
    if (!appData.instanaPromise) {
      //console.warn('[newsScreen] no AppData.instanaPromise yet (attempt', attempt, ')');
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
 
    try {
      console.log('[newsScreen] waiting for Instana preload promise');
      const instanaMap = await appData.instanaPromise;
      this._wireInstanaCharts(instanaMap || {});
    } catch (err) {
      console.error('[newsScreen] failed to resolve instanaPromise:', err);
    }
  }
 
  _wireInstanaCharts(instanaMap) {
    console.log('[newsScreen] wiring charts with Instana map:', instanaMap);
 
    const attachChart = (chartId, queryKey) => {
      const entry = instanaMap[queryKey];
      if (!entry) return console.warn('[newsScreen] no Instana entry for', queryKey);
      if (entry.error) return console.warn('[newsScreen] Instana error for', queryKey, entry.error);
      if (!entry.data) return console.warn('[newsScreen] Instana entry has no data for', queryKey);
 
      const chartElem = document.getElementById(chartId);
      if (!chartElem) return console.warn('[newsScreen] chart element not found:', chartId);
 
      chartElem.data = toChartData(entry.data);
      console.log('[newsScreen] wired chart', chartId, '←', queryKey);
    };
 
    attachChart('chart-beepSubscriber_7d', 'beepSubscriber_7d');
    attachChart('chart-uprwas11_endpoints_1h', 'uprwas11_endpoints_1h');
  }
}