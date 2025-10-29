    // merge the scss and tpl.html file with this js file during the build process
    import TEST_MODULE_STYLES from "./testModule.scss";
    import TEST_MODULE_TEMPLATE from "./testModule.tpl.html";

    export default class TEST_MODULE extends HTMLElement {
    // The component watches these attributes for live updates
    static get observedAttributes() {
        return ["title", "info"];
    }

    constructor() {
        super();

        // Create a shadow DOM to encapsulate styles and markup
        this.attachShadow({ mode: "open" });

        // Internal component state
        this.state = {
        title: "",
        info: "",
        };
    }

    // Return wrapped CSS style string
    get style() {
        return `<style>${TEST_MODULE_STYLES}</style>`;
    }

    // Return HTML template
    get template() {
        return `${TEST_MODULE_TEMPLATE}`;
    }

    // Called when the element is inserted into the page
    connectedCallback() {
        // Render the combined style and template
        this.shadowRoot.innerHTML = `${this.style}${this.template}`;

        // Cache DOM references
        this._cacheRefs();

        // Initialize from attributes
        this._syncStateFromAttrs();

        // Apply the initial values
        this._applyStateToDOM();
    }

    // Called when observed attributes change
    attributeChangedCallback() {
        this._syncStateFromAttrs();
        this._applyStateToDOM();
    }

    // Cache references to elements inside the shadow DOM
    _cacheRefs() {
        const s = this.shadowRoot;
        this.sdTitle = s.querySelector("#test-title");
        this.sdInfo = s.querySelector("#test-info");
    }

    // Sync component state from attributes
    _syncStateFromAttrs() {
        const g = (n) => this.getAttribute(n);

        const title = g("title");
        const info = g("info");

        if (title !== null) this.state.title = title;
        if (info !== null) this.state.info = info;
    }

    // Apply state values to the DOM
    _applyStateToDOM() {
        if (!this.sdTitle || !this.sdInfo) return;

        this.sdTitle.textContent = this.state.title || "Default Title";
        this.sdInfo.textContent =
        this.state.info || "This is some default info text.";
    }
    }

    // Register the component as <test-module>
    customElements.define("test-module", TEST_MODULE);
