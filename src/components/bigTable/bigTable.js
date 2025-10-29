        // // During the build process, your bundler merges these imports into strings
        // // - BIG_TABLE_STYLES → contents of bigTable.scss
        // // - BIG_TABLE_TEMPLATE → contents of bigTable.tpl.html
        // import BIG_TABLE_STYLES from "./bigTable.scss";
        // import BIG_TABLE_TEMPLATE from "./bigTable.tpl.html";

        // // Define a custom web component <big-table>
        // export default class BIG_TABLE extends HTMLElement {
        // // Specify which attributes to observe for live updates
        // static get observedAttributes() {
        //     // 'data' holds inline JSON
        //     // 'source' can refer to a global array, function, or registry key
        //     return ["data", "source"];
        // }

        // constructor() {
        //     super();

        //     // Attach a shadow DOM to encapsulate this component’s markup + styles
        //     this.attachShadow({ mode: "open" });

        //     // Initialize internal state (component memory)
        //     this.state = {
        //     data: [], // stores an array of table rows
        //     };
        // }

        // // Getter: wraps imported SCSS string in <style> tags
        // get style() {
        //     return `<style>${BIG_TABLE_STYLES}</style>`;
        // }

        // // Getter: returns imported HTML template
        // get template() {
        //     return `${BIG_TABLE_TEMPLATE}`;
        // }

        // // Fired when the component is first added to the DOM
        // connectedCallback() {
        //     // Render template + styles inside shadow DOM
        //     this.shadowRoot.innerHTML = `${this.style}${this.template}`;

        //     // Cache the <tbody> reference so we can easily update rows later
        //     this._tableBody = this.shadowRoot.querySelector("#table-body");

        //     // Read initial attribute values (data or source)
        //     this._syncFromAttributes();

        //     // Draw the table based on current state
        //     this._renderTable();
        // }

        // // Fired automatically when one of the observed attributes changes
        // attributeChangedCallback() {
        //     this._syncFromAttributes();
        //     this._renderTable();
        // }

        // /**
        //  * Reads 'data' or 'source' attributes and updates this.state.data accordingly
        //  */
        // _syncFromAttributes() {
        //     const dataAttr = this.getAttribute("data");
        //     const srcAttr = this.getAttribute("source");

        //     // --- OPTION 1: Inline JSON passed in 'data' attribute ---
        //     // Example:
        //     // <big-table data='[{"title":"Project A","on":"✓","started":"2025-01","ended":"2025-02"}]'></big-table>
        //     if (dataAttr) {
        //     try {
        //         // Try to parse the JSON string
        //         this.state.data = JSON.parse(dataAttr);
        //         return; // stop here if successful
        //     } catch (e) {
        //         console.warn("[big-table] Invalid JSON in data attribute");
        //     }
        //     }

        //     // --- OPTION 2: External Source specified by 'source' attribute ---
        //     // Example:
        //     // <big-table source="myDataArray"></big-table>
        //     // OR
        //     // <big-table source="getDataFunction"></big-table>
        //     if (srcAttr) {
        //     // Try to resolve the source from global scope
        //     const fn =
        //         // Case A: If window.BigTableSources is used as a registry
        //         (window.BigTableSources && window.BigTableSources[srcAttr]) ||
        //         // Case B: Else resolve dotted path like "MyNamespace.Data"
        //         srcAttr.split(".").reduce((o, k) => (o ? o[k] : undefined), window);

        //     // If source is already an array → assign directly
        //     if (Array.isArray(fn)) {
        //         this.state.data = fn;
        //     }

        //     // If source is an async function → call it and wait for data
        //     else if (typeof fn === "function") {
        //         fn().then((res) => {
        //         if (Array.isArray(res)) {
        //             this.state.data = res;
        //             this._renderTable(); // redraw once data arrives
        //         }
        //         });
        //     }
        //     }
        // }

        // /**
        //  * Draws (or redraws) the table rows based on this.state.data
        //  */
        // _renderTable() {
        //     // Safety check — if the <tbody> doesn’t exist yet, stop
        //     if (!this._tableBody) return;

        //     // Clear any existing rows
        //     this._tableBody.innerHTML = "";

        //     // If there’s no data to display, show a placeholder message
        //     if (!this.state.data.length) {
        //     this._tableBody.innerHTML = `<tr><td colspan="4">No data available</td></tr>`;
        //     return;
        //     }

        //     // Loop through each data object and create a <tr> for it
        //     this.state.data.forEach((row) => {
        //     const tr = document.createElement("tr");

        //     // Build cells using template literals (undefined-safe)
        //     tr.innerHTML = `
        //         <td>${row.title ?? ""}</td>
        //         <td>${row.on ?? ""}</td>
        //         <td>${row.started ?? ""}</td>
        //         <td>${row.ended ?? ""}</td>
        //     `;

        //     // Append the row to the table body
        //     this._tableBody.appendChild(tr);
        //     });
        // }
        // }

        // // Register <big-table> as a valid custom element
        // customElements.define("big-table", BIG_TABLE);

///no errors just no data



    //     // During the build process, your bundler merges these imports into strings
    // // - BIG_TABLE_STYLES → contents of bigTable.scss
    // // - BIG_TABLE_TEMPLATE → contents of bigTable.tpl.html
    // import BIG_TABLE_STYLES from "./bigTable.scss";
    // import BIG_TABLE_TEMPLATE from "./bigTable.tpl.html";

    // // Define the custom web component <big-table>
    // export default class BIG_TABLE extends HTMLElement {
    // // Observe 'data' (inline JSON) and 'source' (external source)
    // static get observedAttributes() {
    //     return ["data", "source"];
    // }

    // constructor() {
    //     super();

    //     // Create Shadow DOM for encapsulated HTML + CSS
    //     this.attachShadow({ mode: "open" });

    //     // Component state
    //     this.state = {
    //     headers: [], // array of column names
    //     rows: []     // array of objects (each = table row)
    //     };
    // }

    // // Return wrapped <style> + SCSS contents
    // get style() {
    //     return `<style>${BIG_TABLE_STYLES}</style>`;
    // }

    // // Return HTML template string
    // get template() {
    //     return `${BIG_TABLE_TEMPLATE}`;
    // }

    // // Runs when element is inserted into the DOM
    // connectedCallback() {
    //     // Inject template and styles into Shadow DOM
    //     this.shadowRoot.innerHTML = `${this.style}${this.template}`;

    //     // Cache references for efficiency
    //     this._thead = this.shadowRoot.querySelector("#table-head");
    //     this._tbody = this.shadowRoot.querySelector("#table-body");

    //     // Load data from attributes or external source
    //     this._syncFromAttributes();

    //     // Draw table
    //     this._renderTable();
    // }

    // // Runs when an observed attribute changes
    // attributeChangedCallback() {
    //     this._syncFromAttributes();
    //     this._renderTable();
    // }

    // /**
    //  * Read 'data' or 'source' attributes and populate this.state
    //  */
    // _syncFromAttributes() {
    //     const dataAttr = this.getAttribute("data");
    //     const srcAttr = this.getAttribute("source");

    //     // --- OPTION 1: Inline JSON ---
    //     // Example:
    //     // <big-table data='{"headers":["Title","On","Started","Ended"],"rows":[{"Title":"A","On":"✓","Started":"2025-01","Ended":"2025-02"}]}'></big-table>
    //     if (dataAttr) {
    //     try {
    //         const parsed = JSON.parse(dataAttr);
    //         this.state.headers = parsed.headers || [];
    //         this.state.rows = parsed.rows || [];
    //         return;
    //     } catch (err) {
    //         console.warn("[big-table] Invalid JSON in data attribute");
    //     }
    //     }

    //     // --- OPTION 2: External Source ---
    //     // Example:
    //     // <big-table source="myTableData"></big-table>
    //     // or <big-table source="getDataFunction"></big-table>
    //     if (srcAttr) {
    //     const fn =
    //         (window.BigTableSources && window.BigTableSources[srcAttr]) ||
    //         srcAttr.split(".").reduce((o, k) => (o ? o[k] : undefined), window);

    //     // Case A: source is an object with headers + rows
    //     if (fn && typeof fn === "object" && !Array.isArray(fn)) {
    //         this.state.headers = fn.headers || [];
    //         this.state.rows = fn.rows || [];
    //     }

    //     // Case B: source is a function or async function
    //     else if (typeof fn === "function") {
    //         fn().then((res) => {
    //         if (res && typeof res === "object") {
    //             this.state.headers = res.headers || [];
    //             this.state.rows = res.rows || [];
    //             this._renderTable();
    //         }
    //         });
    //     }
    //     }
    // }

    // /**
    //  * Render table headers + rows dynamically from this.state
    //  */
    // _renderTable() {
    //     if (!this._thead || !this._tbody) return;

    //     // Clear previous content
    //     this._thead.innerHTML = "";
    //     this._tbody.innerHTML = "";

    //     // If no data, show placeholder row
    //     if (!this.state.rows.length) {
    //     this._tbody.innerHTML = `<tr><td colspan="99">No data available</td></tr>`;
    //     return;
    //     }

    //     // ---- Render Headers ----
    //     if (this.state.headers.length) {
    //     const headerRow = document.createElement("tr");
    //     this.state.headers.forEach((h) => {
    //         const th = document.createElement("th");
    //         th.textContent = h;
    //         headerRow.appendChild(th);
    //     });
    //     this._thead.appendChild(headerRow);
    //     } else {
    //     // Auto-generate headers from keys of first row
    //     const autoHeaders = Object.keys(this.state.rows[0]);
    //     this.state.headers = autoHeaders;
    //     const headerRow = document.createElement("tr");
    //     autoHeaders.forEach((key) => {
    //         const th = document.createElement("th");
    //         th.textContent = key;
    //         headerRow.appendChild(th);
    //     });
    //     this._thead.appendChild(headerRow);
    //     }

    //     // ---- Render Rows ----
    //     this.state.rows.forEach((rowObj) => {
    //     const tr = document.createElement("tr");
    //     this.state.headers.forEach((headerKey) => {
    //         const td = document.createElement("td");
    //         td.textContent = rowObj[headerKey] ?? "";
    //         tr.appendChild(td);
    //     });
    //     this._tbody.appendChild(tr);
    //     });
    // }
    // }

    // // Register as a web component
    // customElements.define("big-table", BIG_TABLE);


        // Import template and styles (your bundler will merge these into strings)
    import BIG_TABLE_STYLES from "./bigTable.scss";
    import BIG_TABLE_TEMPLATE from "./bigTable.tpl.html";

    // Define a custom web component <big-table>
    export default class BIG_TABLE extends HTMLElement {
    static get observedAttributes() {
        // 'data' holds inline JSON
        // 'source' can be a global function or JSON file path
        return ["data", "source"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.state = { data: { headers: [], rows: [] } };
    }

    // Wrap SCSS string in <style> tags
    get style() {
        return `<style>${BIG_TABLE_STYLES}</style>`;
    }

    // Return imported HTML template
    get template() {
        return `${BIG_TABLE_TEMPLATE}`;
    }

    // When added to DOM
    connectedCallback() {
        this.shadowRoot.innerHTML = `${this.style}${this.template}`;
        this._tableHead = this.shadowRoot.querySelector("#table-head");
        this._tableBody = this.shadowRoot.querySelector("#table-body");

        this._syncFromAttributes();
    }

    // React to attribute changes
    attributeChangedCallback() {
        this._syncFromAttributes();
    }

    async _syncFromAttributes() {
        const dataAttr = this.getAttribute("data");
        const srcAttr = this.getAttribute("source");

        // --- Inline JSON (data attr) ---
        if (dataAttr) {
        try {
            this.state.data = JSON.parse(dataAttr);
            this._renderTable();
            return;
        } catch (e) {
            console.warn("[big-table] Invalid JSON in data attribute:", e);
        }
        }

        // --- External JSON file or function (source attr) ---
        if (srcAttr) {
        // 1️⃣ Try fetching JSON file
        if (srcAttr.endsWith(".json")) {
            try {
            const response = await fetch(srcAttr);
            const json = await response.json();
            this.state.data = json;
            this._renderTable();
            return;
            } catch (err) {
            console.error("[big-table] Failed to load JSON file:", err);
            }
        }

        // 2️⃣ Try calling global source function
        const fn =
            (window.BigTableSources && window.BigTableSources[srcAttr]) ||
            srcAttr.split(".").reduce((o, k) => (o ? o[k] : undefined), window);

        if (Array.isArray(fn)) {
            this.state.data = { headers: Object.keys(fn[0] || {}), rows: fn };
            this._renderTable();
        } else if (typeof fn === "function") {
            const res = await fn();
            if (res) {
            this.state.data = res;
            this._renderTable();
            }
        }
        }

        // Default: show empty table if nothing loaded
        this._renderTable();
    }

    _renderTable() {
        if (!this._tableBody || !this._tableHead) return;

        const { headers, rows } = this.state.data;

        // Clear old content
        this._tableHead.innerHTML = "";
        this._tableBody.innerHTML = "";

        // --- Render headers ---
        if (headers && headers.length) {
        const headRow = document.createElement("tr");
        headRow.innerHTML = headers.map(h => `<th>${h}</th>`).join("");
        this._tableHead.appendChild(headRow);
        }

        // --- Render rows ---
        if (rows && rows.length) {
        rows.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = headers.map(h => `<td>${row[h] ?? ""}</td>`).join("");
            this._tableBody.appendChild(tr);
        });
        } else {
        // If no data, show a placeholder row
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = headers.length || 1;
        td.textContent = "No data available";
        tr.appendChild(td);
        this._tableBody.appendChild(tr);
        }
    }
    }

    // Register the component
    customElements.define("big-table", BIG_TABLE);
