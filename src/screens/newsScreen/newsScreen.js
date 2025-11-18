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
 
    // Let CUI inject the template, then start waiting for Instana + DOM
    requestAnimationFrame(() => {
      this._waitForInstanaAndDom();
    });
  }
 
  /**
   * Wait until BOTH:
   *  - window.AppData.instanaPromise exists, and
   *  - my <instana-chart> elements are present in the DOM.
   */
  async _waitForInstanaAndDom(attempt = 0) {
    const MAX_ATTEMPTS = 50;   // 50 * 200ms = 10 seconds
    const RETRY_DELAY = 200;   // ms
 
    const appData = window.AppData || {};
 
    // 1) Make sure the preload promise is present
    if (!appData.instanaPromise) {
      console.warn(
        '[newsScreen] no AppData.instanaPromise yet (attempt',
        attempt,
        ')'
      );
      if (attempt < MAX_ATTEMPTS) {
        setTimeout(() => this._waitForInstanaAndDom(attempt + 1), RETRY_DELAY);
      }
      return;
    }

    const chartIds = [
      'chart-beepSubscriber_7d',
      'chart-uprwas11_endpoints_1h'
    ];
 
    const missing = chartIds.filter(id => !document.getElementById(id));
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
        console.warn(
          '[newsScreen] Instana error for',
          queryKey,
          entry.error
        );
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
 
      console.log(
        '[newsScreen] wired chart',
        chartId,
        '←',
        queryKey,
        chartData
      );
    };
 
    attachChart('chart-beepSubscriber_7d', 'beepSubscriber_7d');
    attachChart('chart-uprwas11_endpoints_1h', 'uprwas11_endpoints_1h');
  }
}