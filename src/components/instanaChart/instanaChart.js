// <instana-chart> — draws 3 tiny charts (Calls bars, Latency line, Errors line)
// Usage: const el = document.createElement('instana-chart'); el.data = chartData; container.append(el);
 
const TPL = `
  <style>
    :host { display:block; }
    .box { display:grid; gap:12px; }
    canvas { width:100%; height:140px; border-radius:12px; background:#fff; box-shadow:0 1px 6px rgba(0,0,0,0.07); }
    .row { display:flex; align-items:center; gap:10px; }
    .title { font:600 12px/1.2 system-ui, -apple-system, Segoe UI, Roboto; color:#111; min-width:80px; }
  </style>
  <div class="box">
    <div class="row"><div class="title">Calls</div><canvas id="cCalls"></canvas></div>
    <div class="row"><div class="title">Latency (ms)</div><canvas id="cLatency"></canvas></div>
    <div class="row"><div class="title">Errors (mean)</div><canvas id="cErrors"></canvas></div>
  </div>
`;
 
export default class InstanaChart extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = TPL;
    this.$cCalls   = root.getElementById('cCalls');
    this.$cLat     = root.getElementById('cLatency');
    this.$cErr     = root.getElementById('cErrors');
    // handle resizing
    this._resizeObs = new ResizeObserver(() => this._drawAll());
    this._resizeObs.observe(this);
    this._data = null;
  }
  disconnectedCallback() { this._resizeObs?.disconnect(); }
 
  set data(d) { this._data = d; this._drawAll(); }
  get data()  { return this._data; }
 
  _drawAll() {
    if (!this._data) return;
    this._drawBars(this.$cCalls, this._data.labels, this._data.calls);
    this._drawLine(this.$cLat,  this._data.labels, this._data.latency);
    this._drawLine(this.$cErr,  this._data.labels, this._data.errors);
  }
 
  _setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.max(1, Math.floor(rect.width  * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels for simplicity
    return { ctx, w: rect.width, h: rect.height };
  }
 
  _drawAxes(ctx, w, h, pad) {
    ctx.strokeStyle = '#e6e6e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, h - pad.bottom);
    ctx.lineTo(w - pad.right, h - pad.bottom);
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, h - pad.bottom);
    ctx.stroke();
  }
 
  _xTicks(ctx, w, h, pad, labels) {
    const n = Math.min(6, labels.length);
    for (let i=0;i<n;i++){
      const idx = Math.floor((i*(labels.length-1))/(n-1 || 1));
      const x = pad.left + (idx/(labels.length-1 || 1)) * (w - pad.left - pad.right);
      ctx.fillStyle = '#666';
      ctx.font = '10px system-ui, -apple-system, Segoe UI, Roboto';
      const d = labels[idx];
      const s = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      ctx.fillText(s, x-12, h - pad.bottom + 12);
    }
  }
 
  _drawBars(canvas, labels, values) {
    const { ctx, w, h } = this._setupCanvas(canvas);
    const pad = { top: 10, right: 10, bottom: 20, left: 30 };
    this._drawAxes(ctx, w, h, pad);
    this._xTicks(ctx, w, h, pad, labels);
    const max = Math.max(1, ...values);
    const innerW = w - pad.left - pad.right;
    const innerH = h - pad.top - pad.bottom;
    const bw = Math.max(2, innerW / Math.max(1, values.length) * 0.7);
    values.forEach((v, i) => {
      const x = pad.left + (i/(values.length)) * innerW + (innerW/values.length - bw)/2;
      const y = pad.top + innerH * (1 - (v / max));
      ctx.fillStyle = '#4c8df6';
      ctx.fillRect(x, y, bw, pad.top + innerH - y);
    });
    // y label
    ctx.fillStyle = '#444'; ctx.font = '10px system-ui'; ctx.fillText(String(max), 4, pad.top + 8);
  }
 
  _drawLine(canvas, labels, values) {
    const { ctx, w, h } = this._setupCanvas(canvas);
    const pad = { top: 10, right: 10, bottom: 20, left: 30 };
    this._drawAxes(ctx, w, h, pad);
    this._xTicks(ctx, w, h, pad, labels);
    const max = Math.max(1e-9, ...values);
    const innerW = w - pad.left - pad.right;
    const innerH = h - pad.top - pad.bottom;
 
    ctx.strokeStyle = '#16a085';
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = pad.left + (i/(values.length-1 || 1)) * innerW;
      const y = pad.top + innerH * (1 - (v / max));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
 
    // y label
    ctx.fillStyle = '#444'; ctx.font = '10px system-ui'; ctx.fillText(String(Math.round(max)), 4, pad.top + 8);
  }
}
 
customElements.define('instana-chart', InstanaChart);