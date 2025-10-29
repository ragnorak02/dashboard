//merge the scss and tpl.html file with this js file during the build process by importing
//

import BIG_NUMBER_STYLES from './bigNumber.scss';
import BIG_NUMBER_TEMPLATE from './bigNumber.tpl.html';

export default class BIG_NUMBER extends HTMLElement {
  // watch these attributes for live updates
  static get observedAttributes() {
    return [
      "name",
      "value",
      "change-percent",
      "change-value",
      "source",
      "unit",
      "api-label",
      "compare-to",
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // component state
    this.state = {
      name: "",
      value: "",
      changePercent: null,
      changeValue: "",
      source: null,
      unit: "",
      apiLabel: "",
      compareTo: "",
    };

    // Shadow DOM element refs (sd = shadow dom)
    this.sdCard = null;
    this.sdName = null;
    this.sdApi = null;
    this.sdValue = null;
    this.sdUnit = null;
    this.sdChangeValue = null;
    this.sdPercentText = null;
  }

  // wrap imported SCSS and template
  get style() {
    return `<style>${BIG_NUMBER_STYLES}</style>`;
  }
  get template() {
    return `${BIG_NUMBER_TEMPLATE}`;
  }

  connectedCallback() {
    // prime state from attributes
    this._syncStateFromAttrs();

    // render template + styles
    this.shadowRoot.innerHTML = `${this.style}${this.template}`;

    // cache refs
    this._cacheRefs();

    // dynamic source (attribute has priority; fallback to inner text)
    const src = this.getAttribute("source") || (this.textContent || "").trim();
    if (src) {
      this.state.source = src;
      this._loadFromSource(src);
    }

    // initial paint
    this._applyStateToDOM();
  }

  attributeChangedCallback() {
    this._syncStateFromAttrs();
    this._applyStateToDOM();
  }

  // ----- private helpers -----

  //setting this variable values
  _cacheRefs() {
    const s = this.shadowRoot;
    this.sdCard = s.querySelector("#bn-card");
    this.sdName = s.querySelector("#bn-name");
    this.sdApi = s.querySelector("#bn-api");
    this.sdValue = s.querySelector("#bn-value");
    this.sdUnit = s.querySelector("#bn-unit");
    this.sdChangeValue = s.querySelector("#bn-change-value");
    this.sdPercentText = s.querySelector("#bn-percent-text");
    this.sdCompare = s.querySelector("#bn-compare");
  }

  _syncStateFromAttrs() {
    const g = (n) => this.getAttribute(n);

    const name = g("name");
    const value = g("value");
    const changePercent = g("change-percent");
    const changeValue = g("change-value");
    const src = g("source");
    const unit = g("unit");
    const api = g("api-label");
    const compare = g("compare-to");

    if (name !== null) this.state.name = name;
    if (value !== null) this.state.value = value;
    if (changePercent !== null) this.state.changePercent = changePercent;
    if (changeValue !== null) this.state.changeValue = changeValue;
    if (src !== null) this.state.source = src;
    if (unit !== null) this.state.unit = unit;
    if (api !== null) this.state.apiLabel = api;
    if (compare !== null) this.state.compareTo = compare;
  }

  //apply the parameter values to the fields
  _applyStateToDOM() {
    if (!this.sdCard) return;

    // settings values for title, api line, big value + unit
    this.sdName.textContent = this.state.name || "";
    this.sdApi.textContent = this.state.apiLabel || "";
    this.sdValue.textContent = this._format(this.state.value);
    this.sdUnit.textContent = this.state.unit || "";

    // setting the compare-to.. values
    if (this.state.compareTo && this.state.compareTo.trim()) {
      this.sdCompare.textContent = `compared to ${this.state.compareTo}`;
      this.sdCompare.hidden = false;
    } else {
      this.sdCompare.hidden = true;
    }

    // ---- change value (raw delta) with auto sign ----
    this.sdChangeValue.textContent = this._formatSigned(
      this.state.changeValue,
      {
        suffix: "",
        fractionDigits: 2,
      }
    );

    // ---- change percent with auto sign and % ----
    const pct = Number(this.state.changePercent);
    this.sdCard.classList.remove("bn--up", "bn--down");
    if (Number.isFinite(pct)) {
      if (pct !== 0) this.sdCard.classList.add(pct > 0 ? "bn--up" : "bn--down");
      this.sdPercentText.textContent = this._formatSigned(pct, {
        suffix: "%",
        fractionDigits: 2,
      });
    } else {
      this.sdPercentText.textContent = this.state.changePercent ?? "";
    }
  }

  async _loadFromSource(path) {
    try {
      // prefer a registry key, else resolve dotted global path
      const fn =
        (window.BigNumberSources && window.BigNumberSources[path]) ||
        path.split(".").reduce((o, k) => (o ? o[k] : undefined), window);

      if (typeof fn !== "function") {
        console.warn("[BigNumber] No function for source:", path);
        return;
      }

      const res = await fn();

      // if the responsese is comprised of primitive values then assign
      // if the response is an object, then extract values and hydrate the component fields
      if (typeof res === "number" || typeof res === "string") {
        this.state.value = String(res);
      } else if (res && typeof res === "object") {
        if (res.name != null) this.state.name = String(res.name);
        if (res.value != null) this.state.value = String(res.value);
        if (res.changePercent != null)
          this.state.changePercent = String(res.changePercent);
        if (res.changeValue != null)
          this.state.changeValue = String(res.changeValue);
        if (res.unit != null) this.state.unit = String(res.unit);
        if (res.apiLabel != null) this.state.apiLabel = String(res.apiLabel);
      }

      //apply the values to the component on screen
      this._applyStateToDOM();
    } catch (err) {
      console.error("[BigNumber] Source error:", err);
    }
  }

  //add formatting to the delta values,to add a + or - sign
  _format(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString("en-US") : v ?? "";
  }

  _formatSigned(v, { suffix = "", fractionDigits = 2 } = {}) {
    const n = Number(v);
    if (Number.isFinite(n)) {
      const f = new Intl.NumberFormat("en-US", {
        signDisplay: "always",
        maximumFractionDigits: fractionDigits,
      });
      return `${f.format(n)}${suffix}`;
    }
    // if it's not a clean number, just show it as-is
    return String(v ?? "");
  }
}
