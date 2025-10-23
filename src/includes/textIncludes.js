// register a global object for all helper functions 
window.TextIncludes = Object.assign(window.TextIncludes || {}, {
  getTestMessage() {
    return "from textIncludes.js, can also put service files in /src/includes but they cannot be inside another folder";
  },

  formatCurrency(n) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);
  },
});
