    // During the build process, your bundler merges these imports into strings
    // - BIG_TABLE_STYLES → contents of bigTable.scss
    // - BIG_TABLE_TEMPLATE → contents of bigTable.tpl.html
    import BIG_TABLE_STYLES from "./bigTable.scss";
    import BIG_TABLE_TEMPLATE from "./bigTable.tpl.html";

    // Define a custom web component <big-table>
    export default class BIG_TABLE extends HTMLElement {
    // Specify which attributes to observe for live updates
    static get observedAttributes() {
        // 'data' holds inline JSON
        // 'source' can refer to a global array, function, or registry key
        return ["data", "source"];
    }

    constructor() {
        super();

        // Attach a shadow DOM to encapsulate this component’s markup + styles
        this.attachShadow({ mode: "open" });

        // Initialize internal state (component memory)
        this.state = {
        data: [], // stores an array of table rows
        };
    }

    // Getter: wraps imported SCSS string in <style> tags
    get style() {
        return `<style>${BIG_TABLE_STYLES}</style>`;
    }

    // Getter: returns imported HTML template
    get template() {
        return `${BIG_TABLE_TEMPLATE}`;
    }

    // Fired when the component is first added to the DOM
    connectedCallback() {
        // Render template + styles inside shadow DOM
        this.shadowRoot.innerHTML = `${this.style}${this.template}`;

        // Cache the <tbody> reference so we can easily update rows later
        this._tableBody = this.shadowRoot.querySelector("#table-body");

        // Read initial attribute values (data or source)
        this._syncFromAttributes();

        // Draw the table based on current state
        this._renderTable();
    }

    // Fired automatically when one of the observed attributes changes
    attributeChangedCallback() {
        this._syncFromAttributes();
        this._renderTable();
    }

    /**
     * Reads 'data' or 'source' attributes and updates this.state.data accordingly
     */
    _syncFromAttributes() {
        const dataAttr = this.getAttribute("data");
        const srcAttr = this.getAttribute("source");

        // --- OPTION 1: Inline JSON passed in 'data' attribute ---
        // Example:
        // <big-table data='[{"title":"Project A","on":"✓","started":"2025-01","ended":"2025-02"}]'></big-table>
        if (dataAttr) {
        try {
            // Try to parse the JSON string
            this.state.data = JSON.parse(dataAttr);
            return; // stop here if successful
        } catch (e) {
            console.warn("[big-table] Invalid JSON in data attribute");
        }
        }

        // --- OPTION 2: External Source specified by 'source' attribute ---
        // Example:
        // <big-table source="myDataArray"></big-table>
        // OR
        // <big-table source="getDataFunction"></big-table>
        if (srcAttr) {
        // Try to resolve the source from global scope
        const fn =
            // Case A: If window.BigTableSources is used as a registry
            (window.BigTableSources && window.BigTableSources[srcAttr]) ||
            // Case B: Else resolve dotted path like "MyNamespace.Data"
            srcAttr.split(".").reduce((o, k) => (o ? o[k] : undefined), window);

        // If source is already an array → assign directly
        if (Array.isArray(fn)) {
            this.state.data = fn;
        }

        // If source is an async function → call it and wait for data
        else if (typeof fn === "function") {
            fn().then((res) => {
            if (Array.isArray(res)) {
                this.state.data = res;
                this._renderTable(); // redraw once data arrives
            }
            });
        }
        }
    }

    /**
     * Draws (or redraws) the table rows based on this.state.data
     */
    _renderTable() {
        // Safety check — if the <tbody> doesn’t exist yet, stop
        if (!this._tableBody) return;

        // Clear any existing rows
        this._tableBody.innerHTML = "";

        // If there’s no data to display, show a placeholder message
        if (!this.state.data.length) {
        this._tableBody.innerHTML = `<tr><td colspan="4">No data available</td></tr>`;
        return;
        }

        // Loop through each data object and create a <tr> for it
        this.state.data.forEach((row) => {
        const tr = document.createElement("tr");

        // Build cells using template literals (undefined-safe)
        tr.innerHTML = `
            <td>${row.title ?? ""}</td>
            <td>${row.on ?? ""}</td>
            <td>${row.started ?? ""}</td>
            <td>${row.ended ?? ""}</td>
        `;

        // Append the row to the table body
        this._tableBody.appendChild(tr);
        });
    }
    }

    // Register <big-table> as a valid custom element
    customElements.define("big-table", BIG_TABLE);
