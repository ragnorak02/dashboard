import SCREEN_TEMPLATE from './monitorScreen.tpl.html';
import SCREEN_STYLES from './monitorScreen.scss';
import 'src/components/instanaChart/instanaChart.js';
import { toChartData } from 'src/services/instana.js';
import { dataRetrieval } from '../../services/instanaAPI.js';

export default class MONITORSCREEN extends SCREEN {
  constructor(oProps) {
    super(oProps);
    this.sTitle = "Monitor Screen";
    this.sMessageListSelector = '#screen-messages';
    this.oScreenCriteria = {
      "resourceId": "index",
      "renderModes": {
        "default": {
          "layouts": []
        }
      }
    };
    this.sScreenTemplate = SCREEN_TEMPLATE;
    this.sScreenStyles = SCREEN_STYLES;
    this.uiScale = 1.0;
    this.isDragging = false;

    // Layout state management
    this.currentLayout = null; // Will be initialized from DOM
    this.pendingLayout = null;
  }



  // Get current layout from DOM
  getCurrentLayoutFromDOM() {
    const rows = Array.from(document.querySelectorAll('.Monitor-row'));
    return rows.map((row, idx) => {
      const cards = row.querySelectorAll('.Monitor-card');
      return {
        rowId: idx + 1,
        cardCount: cards.length,
        cards: Array.from(cards).map(card => ({
          id: card.dataset.cardId,
          html: card.outerHTML
        }))
      };
    });
  }

  // Clone layout for pending changes
  cloneLayout(layout) {
    return JSON.parse(JSON.stringify(layout));
  }

  _postRender() {
    super._postRender();
    this.initMonitorToolbar();
  }

  initMonitorToolbar() {
    const html = document.documentElement;
    html.dataset.theme = "light";
    html.dataset.color = "on";

    const themeSwitch = document.getElementById("themeSwitch");
    const scaleDown = document.getElementById("scaleDown");
    const scaleUp = document.getElementById("scaleUp");
    const scaleValue = document.getElementById("scaleValue");
    const homeBtn = document.getElementById("homeBtn");
    const searchInput = document.getElementById("searchInput");

    const toolbarToggleBtn = document.getElementById("Monitor-toolbar-toggle-btn");
    const toolbar = document.querySelector(".Monitor-toolbar");

    const favoritesBtn = document.getElementById("Monitor-favorites-btn");
    const favoritesModal = document.getElementById("Monitor-favorites-modal-overlay");
    const favoritesModalClose = document.getElementById("Monitor-favorites-modal-close");
    const favoritesModalCancel = document.getElementById("Monitor-favorites-modal-cancel");
    const favoritesModalApply = document.getElementById("Monitor-favorites-modal-apply");

    if (!themeSwitch || !scaleDown || !scaleUp || !scaleValue || !homeBtn) {
      console.warn("Monitor toolbar elements not found");
      return;
    }

    const setSwitch = (el, on) => {
      el.dataset.on = String(on);
      el.setAttribute("aria-checked", String(on));
    };

    const applyScale = () => {
      this.uiScale = Math.max(0.85, Math.min(1.25, this.uiScale));
      html.style.setProperty("--ui-scale", this.uiScale.toFixed(2));
      scaleValue.textContent = Math.round(this.uiScale * 100) + "%";
    };

    themeSwitch.addEventListener("click", () => {
      const next = html.dataset.theme === "dark" ? "light" : "dark";
      html.dataset.theme = next;
      setSwitch(themeSwitch, next === "dark");
    });

    themeSwitch.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        themeSwitch.click();
      }
    });

    scaleDown.addEventListener("click", () => {
      this.uiScale -= 0.05;
      applyScale();
    });

    scaleUp.addEventListener("click", () => {
      this.uiScale += 0.05;
      applyScale();
    });

    homeBtn.addEventListener("click", () => {
      console.log("Home clicked");
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim().toLowerCase();
        document.querySelectorAll(".Monitor-card").forEach(card => {
          const title = card.querySelector(".Monitor-card-title strong")?.textContent?.toLowerCase() || "";
          card.style.display = (!q || title.includes(q)) ? "" : "none";
        });
      });
    }

    // Toolbar toggle functionality
    if (toolbarToggleBtn && toolbar) {
      const isToolbarHidden = localStorage.getItem('Monitor-toolbar-hidden') === 'true';
      if (isToolbarHidden) {
        toolbar.classList.add('toolbar-collapsed');
        toolbarToggleBtn.classList.add('toolbar-hidden');
      }

      toolbarToggleBtn.addEventListener('click', () => {
        const isHidden = toolbar.classList.toggle('toolbar-collapsed');
        toolbarToggleBtn.classList.toggle('toolbar-hidden');
        localStorage.setItem('Monitor-toolbar-hidden', isHidden);
        toolbarToggleBtn.setAttribute(
          'aria-label',
          isHidden ? 'Show toolbar' : 'Hide toolbar'
        );
      });
    }

    // Favorites MODAL functionality
    if (favoritesBtn && favoritesModal) {
      // Open modal on button click
      favoritesBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        // Star animation
        favoritesBtn.classList.add('star-animate');
        setTimeout(() => {
          favoritesBtn.classList.remove('star-animate');
        }, 500);

        // Initialize current layout from DOM if not set
        if (!this.currentLayout) {
          this.currentLayout = this.getCurrentLayoutFromDOM();
        }

        // Initialize pending layout from current
        this.pendingLayout = this.cloneLayout(this.currentLayout);

        // Open modal
        favoritesModal.classList.add('show');

        // Update preview
        this.updateLayoutPreview();

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      });

      // Close modal function
      const closeModal = (apply = false) => {
        favoritesModal.classList.remove('show');
        document.body.style.overflow = '';

        // If applying, commit pending to current and re-render
        if (apply && this.pendingLayout) {
          this.currentLayout = this.cloneLayout(this.pendingLayout);
          this.applyLayoutChanges();
        }

        // Clear pending
        this.pendingLayout = null;

        // Clear all selections
        document.querySelectorAll('.Monitor-favorites-item.selected').forEach(item => {
          item.classList.remove('selected');
        });
      };

      // Close button
      if (favoritesModalClose) {
        favoritesModalClose.addEventListener('click', () => closeModal(false));
      }

      // Cancel button
      if (favoritesModalCancel) {
        favoritesModalCancel.addEventListener('click', () => closeModal(false));
      }

      // Apply button now actually applies changes
      if (favoritesModalApply) {
        favoritesModalApply.addEventListener('click', () => closeModal(true));
      }

      // Close on overlay click
      favoritesModal.addEventListener('click', (e) => {
        if (e.target === favoritesModal) {
          closeModal(false);
        }
      });

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && favoritesModal.classList.contains('show')) {
          closeModal(false);
        }
      });

      // Favorite Layouts
      const layoutButtons = document.querySelectorAll('[data-layout]');
      layoutButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const layout = btn.dataset.layout;

          // Toggle selection
          const wasSelected = btn.classList.contains('selected');
          layoutButtons.forEach(b => b.classList.remove('selected'));
          if (!wasSelected) {
            btn.classList.add('selected');
            this.selectLayout(layout);
          }
        });
      });

      // Add Favorite Rows
      const addRowButtons = document.querySelectorAll('[data-add-row]');
      addRowButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const rowType = btn.dataset.addRow;

          // Toggle selection
          btn.classList.toggle('selected');
          this.addFavoriteRow(rowType, btn.classList.contains('selected'));
        });
      });
    }

    setSwitch(themeSwitch, html.dataset.theme === "dark");
    applyScale();

    this.initCardInteractions();

    //Instana data retrieval button
    const dateToInput = document.getElementById('date-to');
    const dateFromInput = document.getElementById('date-from');
    const dataPoints = document.getElementById('data-points');

    let today = new Date(Date.now());
    let todayString = today.toISOString().slice(0, 10);
    dateToInput.value = todayString;
    dateToInput.max = todayString;

    today.setDate(today.getDate() - 7);
    let fromDayString = today.toISOString().slice(0, 10);
    dateFromInput.value = fromDayString;
    today.setDate(today.getDate() + 6);
    todayString = today.toISOString().slice(0, 10);
    dateFromInput.max = todayString;

    dateToInput.addEventListener('change', () => {
      const pattern = /\d{4}-\d{2}-\d{2}/;
      if (pattern.test(dateToInput.value)) {
        let maxDateTime = new Date(dateToInput.value);
        maxDateTime.setDate(maxDateTime.getDate() - 1);

        const formattedMaxDateTime = maxDateTime.toISOString().slice(0, 10);

        if (dateFromInput.value > dateToInput.value) {
          dateFromInput.value = formattedMaxDateTime;
        }
        dateFromInput.max = formattedMaxDateTime;
      }
    });

    //This will be used to display the Instana metrics on the cards
    async function displayMetrics(contents) {
      const cardRow = document.getElementsByClassName("Monitor-row Monitor-row--medium");
      const cards = cardRow[0].getElementsByClassName("Monitor-row-cards");
      const cardArray = cards[0].getElementsByClassName("Monitor-card");
      const firstCardBody = cardArray[0].children[1].children[0];
      const secondCardBody = cardArray[1].children[1].children[0];
      const thirdCardBody = cardArray[2].children[1].children[0];

      if (firstCardBody && secondCardBody && thirdCardBody) {
        if (contents) {
          contents.forEach((metrics) => {
            if (metrics) {
              firstCardBody.innerHTML += `<p>Total number of calls: ${metrics[0]}</p>`;
              secondCardBody.innerHTML += `<p>Average number of errors: ${metrics[1].toFixed(4)}</p>`;
              thirdCardBody.innerHTML += `<p>Average amount of latency: ${Math.trunc(metrics[2])} ms</p>`;
              console.log('Metric added');
            }
          });
        }
      }
    }

    const getDataBtn = document.getElementById("runSearch");
    getDataBtn.addEventListener('click', async () => {
      console.log("get pressed");
      let promise = dataRetrieval(dateToInput, dateFromInput, dataPoints);
      const results = await promise;
      displayMetrics(results);
    });

    console.log("Monitor toolbar initialized");
  }

  // Handle layout selection
  selectLayout(layoutName) {
    // Update pending layout based on selection
    if (layoutName === 'default') {
      this.pendingLayout = [
        { rowId: 1, cardCount: 3 },
        { rowId: 2, cardCount: 3 },
        { rowId: 3, cardCount: 3 }
      ];
    } else if (layoutName === 'compact') {
      this.pendingLayout = [
        { rowId: 1, cardCount: 2 },
        { rowId: 2, cardCount: 2 }
      ];
    } else if (layoutName === 'extended') {
      this.pendingLayout = [
        { rowId: 1, cardCount: 4 },
        { rowId: 2, cardCount: 4 },
        { rowId: 3, cardCount: 3 },
        { rowId: 4, cardCount: 2 }
      ];
    }

    // Update preview immediately
    this.updateLayoutPreview();
  }

  // Handle adding favorite rows
  addFavoriteRow(rowType, isAdding) {
    if (!this.pendingLayout) return;

    if (isAdding) {
      // Add a new row to pending layout
      const newRow = {
        rowId: this.pendingLayout.length + 1,
        cardCount: 3,
        type: rowType
      };
      this.pendingLayout.push(newRow);
    } else {
      // Remove the row of this type
      this.pendingLayout = this.pendingLayout.filter(row => row.type !== rowType);
    }

    // Update preview immediately
    this.updateLayoutPreview();
  }

  // Update the preview panel
  updateLayoutPreview() {
    const previewContent = document.getElementById('Monitor-favorites-preview-content');
    const previewInfo = document.getElementById('Monitor-favorites-preview-info');



    if (!previewContent || !previewInfo) return;

    const layout = this.pendingLayout || this.currentLayout;

    if (!layout) return;

    // Clear preview
    previewContent.innerHTML = '';

    // Build tiny grid diagram
    layout.forEach((row, idx) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'Monitor-preview-row';

      for (let i = 0; i < row.cardCount; i++) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'Monitor-preview-card';
        rowDiv.appendChild(cardDiv);
      }

      previewContent.appendChild(rowDiv);
    });

    // Update info text
    const totalRows = layout.length;
    const totalCards = layout.reduce((sum, row) => sum + row.cardCount, 0);
    const rowDetails = layout.map((row, idx) =>
      `Row ${idx + 1}: ${row.cardCount} card${row.cardCount !== 1 ? 's' : ''}`
    ).join('<br>');

    previewInfo.innerHTML = `
      <p><strong>Total Rows:</strong> ${totalRows}</p>
      <p><strong>Total Cards:</strong> ${totalCards}</p>
      <p>${rowDetails}</p>
    `;
  }

  // Apply layout changes to actual screen
  applyLayoutChanges() {
    console.log('Applying layout changes:', this.currentLayout);

    // Show a browser notification instead of alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      z-index: 3000;
      font-size: 14px;
      font-weight: 500;
      animation: slideDown 0.3s ease;
    `;

    const totalRows = this.currentLayout.length;
    const totalCards = this.currentLayout.reduce((sum, row) => sum + row.cardCount, 0);

    notification.textContent = `Layout applied: ${totalRows} rows, ${totalCards} total cards`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);

    // In a real implementation, you would re-render the dashboard here
    // For now, we just store the layout and show notification
  }

  initCardInteractions() {
    let expandedCardId = null;
    let overlay = null;
    const cards = document.querySelectorAll(".Monitor-card");

    if (cards.length === 0) {
      return;
    }

    const createOverlay = () => {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'Monitor-card-overlay';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            collapseCard();
          }
        });
      }
      return overlay;
    };

    const collapseCard = () => {
      if (expandedCardId) {
        const prevCard = document.querySelector(`[data-card-id="${expandedCardId}"]`);
        if (prevCard) {
          prevCard.classList.remove("expanded");
        }
        expandedCardId = null;
      }
      if (overlay) {
        overlay.classList.remove('active');
      }
    };

    const expandCard = (card) => {
      const cardId = card.dataset.cardId;

      if (expandedCardId && expandedCardId !== cardId) {
        collapseCard();
      }

      if (expandedCardId === cardId) {
        collapseCard();
      } else {
        createOverlay();
        card.classList.add("expanded");
        overlay.classList.add('active');
        expandedCardId = cardId;
      }
    };

    document.querySelectorAll("[data-expand]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = e.currentTarget.closest(".Monitor-card");
        if (!card) return;

        expandCard(card);
      });
    });

    cards.forEach(card => {
      card.addEventListener("click", (e) => {
        if (this.isDragging) return;

        if (e.target.closest("[data-expand]")) return;
        if (e.target.closest(".Monitor-grab-hint")) return;
        if (e.target.closest(".Monitor-card-footer")) return;

        expandCard(card);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && expandedCardId) {
        collapseCard();
      }
    });

    // Initialize drag and drop
    this.initCardDragDrop(cards);
  }

  // Complete rewrite of drag & drop to actually work
  initCardDragDrop(cards) {
    const HOLD_MS = 250; // Hold threshold
    let holdTimer = null;
    let dragCard = null;
    let dragOriginRow = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let hasMoved = false;

    const onPointerDown = (e) => {
      const card = e.currentTarget;

      // Only left mouse button
      if (e.button !== undefined && e.button !== 0) return;

      // Only on drag handle
      const isDragHandle = e.target.closest(".Monitor-grab-hint");
      if (!isDragHandle) return;

      e.preventDefault();
      e.stopPropagation();

      dragStartX = e.clientX;
      dragStartY = e.clientY;
      hasMoved = false;

      // Start hold timer
      holdTimer = setTimeout(() => {
        if (!hasMoved) {
          // Begin drag
          this.isDragging = true;
          dragCard = card;
          dragOriginRow = card.closest("[data-row-cards]");

          // Visual feedback
          card.classList.add("dragging");
          document.body.classList.add("dragging-active");

          // Capture pointer
          if (card.setPointerCapture) {
            try {
              card.setPointerCapture(e.pointerId);
            } catch (err) {
              console.warn("setPointerCapture failed:", err);
            }
          }
        }
      }, HOLD_MS);

      // Store pointer ID
      card.__pointerId = e.pointerId;
    };

    const onPointerMove = (e) => {
      const card = e.currentTarget;

      // Check if moved before hold completes
      if (holdTimer && !this.isDragging) {
        const dx = Math.abs(e.clientX - dragStartX);
        const dy = Math.abs(e.clientY - dragStartY);
        if (dx + dy > 5) {
          hasMoved = true;
          clearTimeout(holdTimer);
          holdTimer = null;
        }
        return;
      }

      // If not dragging this card, ignore
      if (!this.isDragging || dragCard !== card) return;

      e.preventDefault();

      const container = dragOriginRow;
      if (!container) return;

      // Find card under pointer
      const allCards = Array.from(container.querySelectorAll('.Monitor-card'));
      let targetCard = null;
      let insertBefore = false;

      for (const otherCard of allCards) {
        if (otherCard === dragCard) continue;

        const rect = otherCard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        if (e.clientX >= rect.left && e.clientX <= rect.right) {
          targetCard = otherCard;
          insertBefore = e.clientX < centerX;
          break;
        }
      }

      // Clear previous placeholders
      allCards.forEach(c => c.classList.remove('drag-placeholder'));

      // Show placeholder
      if (targetCard) {
        targetCard.classList.add('drag-placeholder');

        // Reorder in DOM
        if (insertBefore) {
          container.insertBefore(dragCard, targetCard);
        } else {
          if (targetCard.nextSibling) {
            container.insertBefore(dragCard, targetCard.nextSibling);
          } else {
            container.appendChild(dragCard);
          }
        }
      }
    };

    const onPointerUp = (e) => {
      const card = e.currentTarget;

      // Clear hold timer
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }

      // If we were dragging, complete the drag
      if (this.isDragging && dragCard === card) {
        // Clear visual states
        card.classList.remove("dragging");
        document.body.classList.remove("dragging-active");

        // Clear placeholders
        if (dragOriginRow) {
          dragOriginRow.querySelectorAll('.Monitor-card').forEach(c => {
            c.classList.remove('drag-placeholder');
            c.classList.remove('ghost');
          });
        }

        // Release pointer capture
        if (card.releasePointerCapture && card.__pointerId !== undefined) {
          try {
            card.releasePointerCapture(card.__pointerId);
          } catch (err) {
            console.warn("releasePointerCapture failed:", err);
          }
        }

        // Small delay before allowing clicks again
        setTimeout(() => {
          this.isDragging = false;
        }, 50);

        dragCard = null;
        dragOriginRow = null;
      }

      // Reset state
      hasMoved = false;
      card.__pointerId = undefined;
    };

    // Cancel drag on escape
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && this.isDragging && dragCard) {
        // Cancel drag - would need to store original position to restore
        dragCard.classList.remove("dragging");
        document.body.classList.remove("dragging-active");

        if (dragOriginRow) {
          dragOriginRow.querySelectorAll('.Monitor-card').forEach(c => {
            c.classList.remove('drag-placeholder');
            c.classList.remove('ghost');
          });
        }

        this.isDragging = false;
        dragCard = null;
        dragOriginRow = null;
      }
    };

    // Attach listeners to all cards
    cards.forEach(card => {
      card.addEventListener("pointerdown", onPointerDown);
      card.addEventListener("pointermove", onPointerMove);
      card.addEventListener("pointerup", onPointerUp);
      card.addEventListener("pointercancel", onPointerUp);
      card.addEventListener("lostpointercapture", onPointerUp);
    });

    // Escape key handler
    document.addEventListener('keydown', onKeyDown);
  }
}
