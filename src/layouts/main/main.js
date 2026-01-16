import MAIN_TEMPLATE from "./main.tpl.html";

export default class TAX_VISION_MAIN_LAYOUT extends LAYOUT {
    constructor(oProps) {
        super(oProps);

        this.sTitle = "TAX VISION Base";
        this.sMessageListSelector = '#screen-messages';
        this.sFooter = "false";

        this.sLayoutTemplate = MAIN_TEMPLATE;
        this.sChildViewContainerSelector = "#app-screen-container";
        
    }

      // ---------------------------------------------------------
//   // IMPORTANT: This runs AFTER the HTML is rendered
//   // ---------------------------------------------------------
//   _postRender() {
//     super._postRender();
//     this.initMonitorToolbar();
//   }

      // ---------------------------------------------------------
  // Initialize all toolbar controls
  // ---------------------------------------------------------
  initMonitorToolbar() {
    const html = document.documentElement;
    
    // Set defaults
    html.dataset.theme = "light";
    html.dataset.color = "on";
 
    // Get all elements (with safety checks)
    const themeSwitch = document.getElementById("themeSwitch");
    const colorSwitch = document.getElementById("colorSwitch");
    const scaleDown = document.getElementById("scaleDown");
    const scaleUp = document.getElementById("scaleUp");
    const scaleValue = document.getElementById("scaleValue");
    const homeBtn = document.getElementById("homeBtn");
    const searchInput = document.getElementById("searchInput");
 
    // If elements don't exist, stop here
    if (!themeSwitch || !colorSwitch || !scaleDown || !scaleUp || !scaleValue || !homeBtn) {
      console.warn("Monitor toolbar elements not found");
      return;
    }
 
    // ---------------------------------------------------------
    // Helper: Update switch appearance
    // ---------------------------------------------------------
    const setSwitch = (el, on) => {
      el.dataset.on = String(on);
      el.setAttribute("aria-checked", String(on));
    };
 
    // ---------------------------------------------------------
    // Helper: Apply scale to page
    // ---------------------------------------------------------
    const applyScale = () => {
      this.uiScale = Math.max(0.85, Math.min(1.25, this.uiScale));
      html.style.setProperty("--ui-scale", this.uiScale.toFixed(2));
      scaleValue.textContent = Math.round(this.uiScale * 100) + "%";
    };
 
    // ---------------------------------------------------------
    // Theme toggle
    // ---------------------------------------------------------
    themeSwitch.addEventListener("click", () => {
      const next = html.dataset.theme === "dark" ? "light" : "dark";
      html.dataset.theme = next;
      setSwitch(themeSwitch, next === "dark");
    });
 
    // ---------------------------------------------------------
    // Color toggle
    // ---------------------------------------------------------
    colorSwitch.addEventListener("click", () => {
      const next = html.dataset.color === "on" ? "off" : "on";
      html.dataset.color = next;
      setSwitch(colorSwitch, next === "on");
    });
 
    // ---------------------------------------------------------
    // Keyboard support for switches
    // ---------------------------------------------------------
    [themeSwitch, colorSwitch].forEach(sw => {
      sw.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          sw.click();
        }
      });
    });
 
    // ---------------------------------------------------------
    // Scale buttons
    // ---------------------------------------------------------
    scaleDown.addEventListener("click", () => {
      this.uiScale -= 0.05;
      applyScale();
    });
 
    scaleUp.addEventListener("click", () => {
      this.uiScale += 0.05;
      applyScale();
    });
 
    // ---------------------------------------------------------
    // Home button
    // ---------------------------------------------------------
    homeBtn.addEventListener("click", () => {
      console.log("Home clicked");
      // TODO: Wire to page router
      // this.oSpa.navTo('home');
    });
 
    // ---------------------------------------------------------
    // Search filter
    // ---------------------------------------------------------
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim().toLowerCase();
        document.querySelectorAll(".Monitor-card").forEach(card => {
          const title = card.querySelector(".Monitor-card-title strong")?.textContent?.toLowerCase() || "";
          card.style.display = (!q || title.includes(q)) ? "" : "none";
        });
      });
    }
 
    // ---------------------------------------------------------
    // Initialize visuals
    // ---------------------------------------------------------
    setSwitch(themeSwitch, html.dataset.theme === "dark");
    setSwitch(colorSwitch, html.dataset.color === "on");
    applyScale();
 
    // ---------------------------------------------------------
    // Card interactions (if cards exist)
    // ---------------------------------------------------------
    this.initCardInteractions();
 
    console.log("Monitor toolbar initialized");
  }

}
