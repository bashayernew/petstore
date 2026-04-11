/**
 * PetHub — multi-page interactive demo + localStorage
 */
(function () {
  "use strict";

  var STORAGE_KEY = "pethub_demo_v1";
  /** Keeps focus-based refresh from looping; updated when this tab writes ROOT. */
  var lastKnownRootJson = "";

  function updateRootSnapRef() {
    try {
      if (window.PetHubApp && PetHubApp.ROOT_KEY) {
        lastKnownRootJson = localStorage.getItem(PetHubApp.ROOT_KEY) || "";
      }
    } catch (e) {}
  }

  function uid() {
    return "ph_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  var state = {
    user: null,
    cart: [],
    bookings: [],
    orders: [],
    pets: [],
    savedListings: new Set(),
    savedListingDetails: {},
    selectedTime: null,
    bookingModalTime: null,
    demoSelectedTime: null,
    reschedulePickTime: null,
    currentListing: null,
    editingPetId: null,
    rescheduleBookingId: null,
    inquiryPetType: "",
  };

  function persistState() {
    try {
      /* User + saved listings in legacy key; cart lives in PetHubApp shopCart; orders in shopOrders. */
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: state.user,
          savedListings: Array.from(state.savedListings),
          savedListingDetails: state.savedListingDetails,
        })
      );
    } catch (e) {}
    if (window.PetHubApp) {
      try {
        PetHubApp.saveData("shopCart", state.cart.slice());
      } catch (e2) {}
    }
    pushToPetHubApp();
  }

  function profileToStatePet(p) {
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      breed: p.breed || "",
      age: p.age || "",
      vaccDate: p.vaccinationDate || "",
      notes: p.notes || "",
    };
  }

  function syncFromPetHubApp() {
    if (!window.PetHubApp) return;
    try {
      PetHubApp.ensureSeedData();
      /* Always mirror app store (including empty arrays) so admin/public stay in sync. */
      state.bookings = PetHubApp.getData("bookings").slice();
      state.pets = PetHubApp.getData("petProfiles").map(profileToStatePet);
    } catch (e) {}
  }

  function pushToPetHubApp() {
    if (!window.PetHubApp) return;
    try {
      PetHubApp.saveData("bookings", state.bookings);
      PetHubApp.saveData(
        "petProfiles",
        state.pets.map(function (p) {
          return {
            id: p.id,
            name: p.name,
            type: p.type,
            breed: p.breed,
            age: p.age,
            vaccinationDate: p.vaccDate || "",
            notes: p.notes || "",
          };
        })
      );
      if (PetHubApp.syncLegacyMirror) PetHubApp.syncLegacyMirror();
    } catch (e) {}
    updateRootSnapRef();
  }

  function hydrateState() {
    var o = {};
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        o = JSON.parse(raw);
        if (o.user !== undefined) state.user = o.user;
        state.savedListings = new Set(o.savedListings || []);
        state.savedListingDetails =
          o.savedListingDetails && typeof o.savedListingDetails === "object" ? o.savedListingDetails : {};
      }
    } catch (e) {}

    if (window.PetHubApp) {
      PetHubApp.ensureSeedData();
      var sc = PetHubApp.getData("shopCart");
      if (sc.length) {
        state.cart = sc;
      } else if (Array.isArray(o.cart) && o.cart.length) {
        state.cart = o.cart;
        PetHubApp.saveData("shopCart", state.cart.slice());
        console.log("[PetHubShop] shop cart updated (migrated legacy cart to shopCart)", state.cart.length);
      } else {
        state.cart = [];
      }
      var so = PetHubApp.getData("shopOrders");
      if (so.length) {
        state.orders = so;
      } else if (Array.isArray(o.orders) && o.orders.length) {
        var migrated = o.orders.map(function (old) {
          var lines = old.lines || old.items || [];
          var items = lines.map(function (x) {
            return {
              productId: x.productId || "",
              name: x.name || "",
              qty: x.qty || 1,
              price: typeof x.price === "number" ? x.price : parseFloat(String(x.price || "0")) || 0,
            };
          });
          var tot = old.total != null ? parseFloat(old.total) : 0;
          if (isNaN(tot)) tot = 0;
          return {
            id: old.id || uid(),
            customerName: old.customerName || "—",
            phone: old.phone || "—",
            address: old.address || "",
            items: items,
            total: tot,
            createdAt: old.createdAt || old.placedAt || Date.now(),
            status: old.status || "completed",
          };
        });
        PetHubApp.saveData("shopOrders", migrated);
        state.orders = migrated;
        console.log("[PetHubShop] migrated legacy orders to shopOrders", migrated.length);
      } else {
        state.orders = [];
      }
    } else {
      if (Array.isArray(o.cart)) state.cart = o.cart;
      if (Array.isArray(o.orders)) state.orders = o.orders;
    }
    /* Bookings + pets: only from PetHubApp / pethub_app_v1 */
    syncFromPetHubApp();
  }

  var els = {};

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return [].slice.call((root || document).querySelectorAll(sel));
  }

  function showToast(message, type) {
    type = type || "info";
    var host = els.toastHost || $("#toast-host");
    if (!host) return;
    var t = document.createElement("div");
    t.className = "toast-item toast-item--" + type;
    t.setAttribute("role", "status");
    t.textContent = message;
    host.appendChild(t);
    requestAnimationFrame(function () {
      t.classList.add("is-in");
    });
    setTimeout(function () {
      t.classList.remove("is-in");
      t.classList.add("is-out");
      setTimeout(function () {
        t.remove();
      }, 320);
    }, 3200);
  }

  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.hidden = false;
    m.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var closeBtn = m.querySelector("[data-modal-close]");
    if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
  }

  function closeModal(el) {
    var m = el && el.closest ? el.closest(".modal") : el;
    if (!m) return;
    m.hidden = true;
    m.setAttribute("aria-hidden", "true");
    if (!$all(".modal:not([hidden])").length) {
      document.body.classList.remove("modal-open");
    }
  }

  function closeAllModals() {
    $all(".modal").forEach(function (m) {
      m.hidden = true;
      m.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("modal-open");
  }

  function parsePrice(str) {
    var n = parseFloat(String(str).replace(/[^\d.]/g, ""));
    return isNaN(n) ? 0 : n;
  }

  function cartCount() {
    return state.cart.reduce(function (s, l) {
      return s + l.qty;
    }, 0);
  }

  function cartTotal() {
    return state.cart.reduce(function (s, l) {
      return s + l.price * l.qty;
    }, 0);
  }

  function updateCartBadge() {
    var c = cartCount();
    $all("[data-cart-count]").forEach(function (el) {
      el.textContent = String(c);
      el.hidden = c === 0;
    });
  }

  function renderCartDrawer() {
    var list = els.cartLines;
    if (!list) return;
    list.innerHTML = "";
    if (!state.cart.length) {
      list.innerHTML = '<p class="drawer__empty">Your cart is empty. Browse the shop to add items.</p>';
      if (els.cartTotal) els.cartTotal.textContent = "0.00 KD";
      return;
    }
    state.cart.forEach(function (line) {
      var row = document.createElement("div");
      row.className = "cart-line";
      row.innerHTML =
        '<div class="cart-line__info"><strong></strong><span class="cart-line__price"></span></div>' +
        '<div class="cart-line__actions">' +
        '<button type="button" class="qty-btn" data-cart-dec aria-label="Decrease">−</button>' +
        '<span class="qty-val"></span>' +
        '<button type="button" class="qty-btn" data-cart-inc aria-label="Increase">+</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-cart-remove>Remove</button>' +
        "</div>";
      row.querySelector("strong").textContent = line.name;
      row.querySelector(".cart-line__price").textContent =
        line.price.toFixed(2) + " KD · line " + (line.price * line.qty).toFixed(2) + " KD";
      row.querySelector(".qty-val").textContent = String(line.qty);
      row.querySelector("[data-cart-dec]").addEventListener("click", function () {
        line.qty -= 1;
        if (line.qty <= 0) {
          state.cart = state.cart.filter(function (x) { return x.id !== line.id; });
          showToast("Removed from cart", "info");
        }
        persistState();
        console.log("[PetHubShop] shop cart updated", state.cart.length, "lines");
        renderCartDrawer();
        updateCartBadge();
      });
      row.querySelector("[data-cart-inc]").addEventListener("click", function () {
        line.qty += 1;
        persistState();
        console.log("[PetHubShop] shop cart updated", state.cart.length, "lines");
        renderCartDrawer();
        updateCartBadge();
        showToast("Quantity updated", "success");
      });
      row.querySelector("[data-cart-remove]").addEventListener("click", function () {
        state.cart = state.cart.filter(function (x) { return x.id !== line.id; });
        persistState();
        console.log("[PetHubShop] shop cart updated", state.cart.length, "lines");
        renderCartDrawer();
        updateCartBadge();
        showToast("Removed from cart", "info");
      });
      list.appendChild(row);
    });
    if (els.cartTotal) els.cartTotal.textContent = cartTotal().toFixed(2) + " KD";
  }

  function openCartDrawer() {
    renderCartDrawer();
    if (els.cartDrawer) {
      els.cartDrawer.hidden = false;
      els.cartDrawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("drawer-open");
    }
  }

  function closeCartDrawer() {
    if (els.cartDrawer) {
      els.cartDrawer.hidden = true;
      els.cartDrawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("drawer-open");
    }
  }

  function addLineToCart(productId, name, price, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var existing = state.cart.find(function (l) { return l.productId === productId; });
    if (existing) {
      existing.qty += qty;
    } else {
      state.cart.push({
        id: uid(),
        productId: productId,
        name: name,
        price: price,
        qty: qty,
      });
    }
    persistState();
    console.log("[PetHubShop] shop cart updated", state.cart.length, "lines");
  }

  function buildBookingCard(b, fullControls) {
    var card = document.createElement("article");
    card.className = "dash-card dash-card--booking";
    var statusClass =
      b.status === "Cancelled"
        ? "status--cancelled"
        : b.status === "Pending"
        ? "status--pending"
        : "status--confirmed";
    card.innerHTML =
      '<div class="dash-card__head">' +
      '<h4></h4>' +
      '<span class="status-badge ' +
      statusClass +
      '"></span></div>' +
      '<ul class="dash-card__meta"></ul>' +
      '<div class="dash-card__actions"></div>';
    card.querySelector("h4").textContent = b.service;
    card.querySelector(".status-badge").textContent = b.status;
    var ul = card.querySelector(".dash-card__meta");
    [
      ["Date", b.date],
      ["Time", b.time],
      ["Pet", b.petName + " (" + b.petType + ")"],
      ["Owner", b.ownerName],
      ["Phone", b.phone],
    ].forEach(function (pair) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + pair[0] + "</span> " + pair[1];
      ul.appendChild(li);
    });
    if (b.notes) {
      var n = document.createElement("li");
      n.innerHTML = "<span>Notes</span> " + b.notes;
      ul.appendChild(n);
    }
    var actions = card.querySelector(".dash-card__actions");
    if (b.status !== "Cancelled") {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--ghost btn--sm";
      btn.textContent = "Cancel booking";
      btn.addEventListener("click", function () {
        b.status = "Cancelled";
        showToast("Booking cancelled", "info");
        persistState();
        renderBookings();
      });
      actions.appendChild(btn);
      if (fullControls) {
        var rs = document.createElement("button");
        rs.type = "button";
        rs.className = "btn btn--soft btn--sm";
        rs.textContent = "Reschedule";
        rs.addEventListener("click", function () {
          state.rescheduleBookingId = b.id;
          var svc = $("#reschedule-service-label");
          if (svc) svc.textContent = b.service;
          var di = $("#reschedule-date-input");
          if (di) di.value = b.date;
          state.reschedulePickTime = b.time;
          $all("#form-reschedule .time-slot").forEach(function (slot) {
            slot.classList.toggle("is-selected", slot.getAttribute("data-time") === b.time);
          });
          openModal("modal-reschedule");
        });
        actions.appendChild(rs);
      }
    }
    return card;
  }

  function renderBookings() {
    var up = $("#bookings-upcoming");
    var pa = $("#bookings-past");
    if (up && pa) {
      up.innerHTML = "";
      pa.innerHTML = "";
      if (!state.bookings.length) {
        up.innerHTML = '<p class="dash-empty">No upcoming bookings. <a href="services.html">Book a service</a></p>';
        pa.innerHTML = '<p class="dash-empty">No past visits yet.</p>';
        return;
      }
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var hasUp = false;
      var hasPa = false;
      state.bookings.forEach(function (b) {
        var d = new Date(b.date + "T12:00:00");
        var isPast = b.status === "Cancelled" || d < today;
        var card = buildBookingCard(b, true);
        if (isPast) {
          pa.appendChild(card);
          hasPa = true;
        } else {
          up.appendChild(card);
          hasUp = true;
        }
      });
      if (!hasUp) {
        up.innerHTML = '<p class="dash-empty">No upcoming bookings. <a href="services.html">Book a service</a></p>';
      }
      if (!hasPa) {
        pa.innerHTML = '<p class="dash-empty">No past or cancelled bookings.</p>';
      }
      return;
    }

    var target = els.dashBookings;
    if (!target) return;
    target.innerHTML = "";
    if (!state.bookings.length) {
      target.innerHTML =
        '<p class="dash-empty">No bookings yet. <a href="services.html">Book a service</a> to see it here.</p>';
      return;
    }
    state.bookings.forEach(function (b) {
      target.appendChild(buildBookingCard(b, false));
    });
  }

  function renderOrders() {
    var target = els.dashOrders;
    if (!target) return;
    target.innerHTML = "";
    if (!state.orders.length) {
      target.innerHTML = '<p class="dash-empty">No orders yet. Checkout from your cart to see history.</p>';
      return;
    }
    state.orders.forEach(function (o) {
      var lines = o.items || o.lines || [];
      var ts = o.createdAt != null ? o.createdAt : o.placedAt;
      var card = document.createElement("article");
      card.className = "dash-card";
      var st = String(o.status || "new").toLowerCase();
      var stLabel =
        st === "completed" ? "Completed" : st === "cancelled" ? "Cancelled" : st === "processing" ? "Processing" : "New";
      var stClass =
        st === "completed" ? "status--confirmed" : st === "cancelled" ? "status--cancelled" : "status--pending";
      card.innerHTML =
        '<div class="dash-card__head"><h4></h4><span class="status-badge ' +
        stClass +
        '"></span></div>' +
        "<p class=\"dash-card__muted\"></p>" +
        '<ul class="dash-card__list"></ul>' +
        '<p class="dash-card__total"><strong>Total:</strong> <span></span></p>';
      card.querySelector("h4").textContent = "Order " + String(o.id || "").slice(-8).toUpperCase();
      card.querySelector(".status-badge").textContent = stLabel;
      card.querySelector(".dash-card__muted").textContent =
        (o.customerName ? o.customerName + " · " : "") +
        "Placed " +
        new Date(ts || Date.now()).toLocaleString();
      var ul = card.querySelector(".dash-card__list");
      lines.forEach(function (l) {
        var li = document.createElement("li");
        var q = l.qty || 1;
        var pr = typeof l.price === "number" ? l.price : parseFloat(l.price) || 0;
        li.textContent = l.name + " × " + q + " — " + (pr * q).toFixed(2) + " KD";
        ul.appendChild(li);
      });
      var tot = o.total != null ? parseFloat(o.total) : 0;
      if (isNaN(tot)) tot = 0;
      card.querySelector(".dash-card__total span").textContent = tot.toFixed(2) + " KD";
      target.appendChild(card);
    });
  }

  function renderSavedPets() {
    var target = els.dashSaved;
    if (!target) return;
    target.innerHTML = "";
    if (!state.savedListings.size) {
      target.innerHTML =
        '<p class="dash-empty">No saved listings. Save pets on the <a href="marketplace.html">marketplace</a>.</p>';
      return;
    }
    state.savedListings.forEach(function (id) {
      var det = state.savedListingDetails[id];
      var title = (det && det.title) || id;
      var el = document.createElement("article");
      el.className = "dash-card dash-card--saved";
      var layout = document.createElement("div");
      layout.className = "dash-saved-card__layout";
      var media = document.createElement("a");
      media.className = "dash-saved-card__media";
      media.href = "marketplace.html";
      if (det && det.imageSrc) {
        var img = document.createElement("img");
        img.src = det.imageSrc;
        img.alt = title;
        img.loading = "lazy";
        img.decoding = "async";
        media.appendChild(img);
      } else {
        media.classList.add("dash-saved-card__media--placeholder");
        var ph = document.createElement("span");
        ph.className = "dash-saved-card__ph-icon";
        ph.setAttribute("aria-hidden", "true");
        ph.textContent = "🐾";
        media.appendChild(ph);
      }
      var body = document.createElement("div");
      body.className = "dash-saved-card__body";
      var h4 = document.createElement("h4");
      h4.textContent = title;
      var meta = document.createElement("p");
      meta.className = "dash-card__muted";
      meta.textContent = det ? (det.loc || "") + " · " + (det.price || "") : "";
      body.appendChild(h4);
      body.appendChild(meta);
      layout.appendChild(media);
      layout.appendChild(body);
      el.appendChild(layout);
      target.appendChild(el);
    });
  }

  function vaccinationBadge(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    var days = Math.ceil((d - Date.now()) / 86400000);
    if (days < 0) return '<span class="v-badge v-badge--overdue">Vaccination overdue</span>';
    if (days <= 30) return '<span class="v-badge v-badge--soon">Vaccination due in ' + days + " days</span>";
    return '<span class="v-badge v-badge--ok">Next shot: ' + d.toLocaleDateString() + "</span>";
  }

  function renderPetCards() {
    var targets = [els.petCardsList, els.dashPets].filter(Boolean);
    if (!targets.length) return;
    function buildHTML() {
      if (!state.pets.length) {
        return '<p class="dash-empty">Add a pet profile using the form above.</p>';
      }
      return state.pets
        .map(function (p) {
          return (
            '<article class="pet-profile-card" data-pet-card-id="' +
            p.id +
            '">' +
            '<div class="pet-profile-card__head"><h4>' +
            escapeHtml(p.name) +
            "</h4>" +
            vaccinationBadge(p.vaccDate) +
            "</div>" +
            "<ul class=\"pet-profile-card__meta\">" +
            "<li><span>Type</span> " +
            escapeHtml(p.type) +
            "</li>" +
            "<li><span>Breed</span> " +
            escapeHtml(p.breed) +
            "</li>" +
            "<li><span>Age</span> " +
            escapeHtml(p.age) +
            "</li>" +
            "<li><span>Last vaccination</span> " +
            escapeHtml(p.vaccDate || "—") +
            "</li>" +
            "</ul>" +
            (p.notes
              ? '<p class="pet-profile-card__notes">' + escapeHtml(p.notes) + "</p>"
              : "") +
            '<div class="pet-profile-card__actions">' +
            '<button type="button" class="btn btn--soft btn--sm" data-edit-pet="' +
            p.id +
            '">Edit</button>' +
            '<button type="button" class="btn btn--ghost btn--sm" data-delete-pet="' +
            p.id +
            '">Delete</button>' +
            "</div></article>"
          );
        })
        .join("");
    }
    var html = buildHTML();
    targets.forEach(function (t) {
      t.innerHTML = html;
    });
    $all("[data-edit-pet]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-edit-pet");
        var p = state.pets.find(function (x) { return x.id === id; });
        if (!p) return;
        state.editingPetId = id;
        els.petFormName.value = p.name;
        els.petFormType.value = p.type;
        els.petFormBreed.value = p.breed;
        els.petFormAge.value = p.age;
        els.petFormVacc.value = p.vaccDate;
        els.petFormNotes.value = p.notes;
        if (els.petFormSubmit) els.petFormSubmit.textContent = "Update pet profile";
        showToast("Editing " + p.name + " — update fields and save", "info");
        $("#pet-profiles") && $("#pet-profiles").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    $all("[data-delete-pet]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-delete-pet");
        state.pets = state.pets.filter(function (x) { return x.id !== id; });
        persistState();
        showToast("Pet profile removed", "info");
        renderPetCards();
      });
    });
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function populateBookingServiceSelects() {
    if (!window.PetHubApp) return;
    try {
      var svcs = PetHubApp.getData("services").filter(function (x) {
        return x.status !== "inactive";
      });
      var opts = svcs
        .map(function (s) {
          return "<option>" + escapeHtml(s.title) + "</option>";
        })
        .join("");
      $all('select[name="service"]').forEach(function (sel) {
        var keep = sel.querySelector('option[value=""]');
        var head = keep ? keep.outerHTML : '<option value="">Select service</option>';
        sel.innerHTML = head + opts;
      });
    } catch (e) {}
  }

  function renderServicesGridFromStorage() {
    var grid = $("#service-grid");
    if (!grid || !window.PetHubApp) return;
    try {
      var list = PetHubApp.getData("services").filter(function (x) {
        return x.status !== "inactive";
      });
      if (!list.length) {
        grid.innerHTML = "";
        return;
      }
      var svgIcon =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
      grid.innerHTML = list
        .map(function (s) {
          var isEm = (s.title || "").indexOf("Emergency") !== -1;
          var btnLabel = isEm ? "Get help" : "Book now";
          return (
            '<article class="service-card reveal" data-searchable="' +
            escapeHtml(s.searchable || s.title) +
            '" data-service="' +
            escapeHtml(s.title) +
            '"><div class="service-card__media' +
            (isEm ? " service-card__media--emergency" : "") +
            '"><img src="' +
            escapeHtml(s.image) +
            '" alt="" width="800" height="520" loading="lazy" decoding="async" /></div><div class="service-card__body"><div class="service-card__icon' +
            (isEm ? " service-card__icon--alert" : "") +
            '" aria-hidden="true">' +
            svgIcon +
            '</div><h3 class="service-card__title">' +
            escapeHtml(s.title) +
            '</h3><p class="service-card__text">' +
            escapeHtml(s.description) +
            '</p><button type="button" class="btn btn--soft service-card__btn" data-open-booking>' +
            btnLabel +
            "</button></div></article>"
          );
        })
        .join("");
    } catch (e) {}
  }

  function renderMarketplaceGridFromStorage() {
    var grid = $("#market-grid");
    if (!grid || !window.PetHubApp) return;
    try {
      var list = PetHubApp.getData("marketplaceListings");
      if (!list.length) {
        grid.innerHTML = "";
        return;
      }
      grid.innerHTML = list
        .map(function (L) {
          var cat = (L.type || "dog").toLowerCase();
          return (
            '<article class="pet-card reveal" data-listing-id="' +
            escapeHtml(L.id) +
            '" data-category="' +
            escapeHtml(cat) +
            '" data-searchable="' +
            escapeHtml(L.searchable || L.name) +
            '" data-listing-title="' +
            escapeHtml(L.name) +
            '" data-listing-age="' +
            escapeHtml(L.age) +
            '" data-listing-gender="' +
            escapeHtml(L.gender) +
            '" data-listing-price="' +
            escapeHtml(L.price) +
            '" data-listing-loc="' +
            escapeHtml(L.location) +
            '" data-listing-seller="' +
            escapeHtml(L.seller || "") +
            '" data-listing-desc="' +
            escapeHtml(L.description || "") +
            '"><div class="pet-card__media"><img class="pet-card__img" src="' +
            escapeHtml(
              PetHubApp.resolveMarketplaceListingImage
                ? PetHubApp.resolveMarketplaceListingImage(L)
                : L.image
            ) +
            '" alt="" width="800" height="600" loading="lazy" decoding="async" /><div class="pet-card__gradient" aria-hidden="true"></div></div><div class="pet-card__body"><h3 class="pet-card__title">' +
            escapeHtml(L.name) +
            '</h3><ul class="pet-card__meta"><li><span>Age</span> ' +
            escapeHtml(L.age) +
            '</li><li><span>Gender</span> ' +
            escapeHtml(L.gender) +
            '</li><li><span>Price</span> ' +
            escapeHtml(L.price) +
            '</li><li><span>Location</span> ' +
            escapeHtml(L.location) +
            '</li></ul><div class="pet-card__actions"><button type="button" class="btn btn--outline btn--sm btn--block" data-view-listing>View details</button><button type="button" class="btn btn--primary btn--sm btn--block" data-contact-seller>Contact seller</button><button type="button" class="btn btn--ghost btn--sm btn--block pet-card__save" data-save-listing aria-pressed="false"><span class="save-label">Save</span><span class="save-heart" aria-hidden="true"> ♥</span></button></div></div></article>'
          );
        })
        .join("");
    } catch (e) {}
  }

  function formatShopPriceDisplay(n) {
    var x = typeof n === "number" ? n : parseFloat(String(n || "").replace(/[^\d.]/g, ""));
    if (isNaN(x)) x = 0;
    return (Math.abs(x % 1) < 0.001 ? String(Math.round(x)) : x.toFixed(2)) + " KD";
  }

  function renderShopProductGridFromStorage() {
    var grid = $("#product-grid");
    if (!grid || !window.PetHubApp) return;
    if (document.body.getAttribute("data-page") !== "shop") return;
    try {
      var all = PetHubApp.getData("shopProducts");
      console.log("[PetHubShop] loading shopProducts for grid", all.length, "items");
      var list = all.filter(function (p) {
        return String(p.status || "").toLowerCase() === "active";
      });
      var empty = $("#empty-shop");
      if (!list.length) {
        grid.innerHTML = "";
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;
      grid.innerHTML = list
        .map(function (p) {
          var cat = String(p.category || "").trim().toLowerCase();
          var priceNum =
            typeof p.price === "number" ? p.price : parseFloat(String(p.price || "0").replace(/[^\d.]/g, "")) || 0;
          var stock = parseInt(p.stock, 10);
          if (isNaN(stock)) stock = 0;
          var oos = stock <= 0;
          var maxQty = oos ? 0 : Math.min(99, stock);
          var searchBits = [p.name, p.brand, cat, p.description, p.searchable || ""].join(" ");
          var badgeHtml =
            p.badge && String(p.badge).trim()
              ? '<span class="product-card__tag">' + escapeHtml(String(p.badge).trim()) + "</span>"
              : "";
          var stockLine = oos
            ? '<p class="product-card__stock product-card__stock--out">Out of stock</p>'
            : '<p class="product-card__stock">In stock: ' + stock + "</p>";
          var btn = oos
            ? '<button type="button" class="btn btn--primary btn--sm" disabled>Out of stock</button>'
            : '<button type="button" class="btn btn--primary btn--sm" data-add-cart>Add to cart</button>';
          return (
            '<article class="product-card reveal' +
            (oos ? " product-card--out-stock" : "") +
            '" data-product-id="' +
            escapeHtml(p.id) +
            '" data-product-name="' +
            escapeHtml(p.name) +
            '" data-product-price="' +
            priceNum +
            '" data-product-stock="' +
            stock +
            '" data-shop-cat="' +
            escapeHtml(cat) +
            '" data-searchable="' +
            escapeHtml(searchBits) +
            '"><div class="product-card__media">' +
            (oos ? '<span class="product-card__oos-ribbon" aria-hidden="true">Out of stock</span>' : "") +
            '<img class="product-card__img" src="' +
            escapeHtml(p.image || "") +
            '" alt="" width="700" height="700" loading="lazy" decoding="async" /></div><div class="product-card__body">' +
            '<p class="product-card__brand">' +
            escapeHtml(p.brand || "") +
            "</p>" +
            badgeHtml +
            '<h3 class="product-card__title">' +
            escapeHtml(p.name) +
            '</h3><p class="product-card__desc">' +
            escapeHtml(p.description || "") +
            '</p><span class="product-card__price">' +
            formatShopPriceDisplay(priceNum) +
            "</span>" +
            stockLine +
            '<div class="product-card__cart-row"><label class="qty-field"><span class="visually-hidden">Quantity</span><input type="number" class="input input--qty" data-product-qty min="' +
            (oos ? "0" : "1") +
            '" max="' +
            maxQty +
            '" value="1"' +
            (oos ? " disabled" : "") +
            " /></label>" +
            btn +
            "</div></div></article>"
          );
        })
        .join("");
    } catch (e) {
      console.warn("[PetHubShop] render grid error", e);
    }
  }

  function renderDynamicPagesFromStorage() {
    renderServicesGridFromStorage();
    renderMarketplaceGridFromStorage();
    renderShopProductGridFromStorage();
    populateBookingServiceSelects();
  }

  function clearFieldError(input) {
    input.classList.remove("input--error");
    var msg = input.parentElement && input.parentElement.querySelector(".field-error");
    if (msg) msg.remove();
  }

  function setFieldError(input, message) {
    input.classList.add("input--error");
    var next = input.parentElement.querySelector(".field-error");
    if (!next) {
      next = document.createElement("p");
      next.className = "field-error";
      input.parentElement.appendChild(next);
    }
    next.textContent = message;
  }

  function validateRequired(form, names) {
    var ok = true;
    names.forEach(function (name) {
      var input = form.querySelector("[name=\"" + name + "\"]");
      if (!input) return;
      clearFieldError(input);
      if (!String(input.value || "").trim()) {
        setFieldError(input, "This field is required");
        ok = false;
      }
    });
    return ok;
  }

  function setupTimeSlots(container, stateKey) {
    if (!container) return;
    $all(".time-slot", container).forEach(function (btn) {
      btn.addEventListener("click", function () {
        $all(".time-slot", container).forEach(function (b) {
          b.classList.remove("is-selected");
        });
        btn.classList.add("is-selected");
        if (stateKey === "demo") state.demoSelectedTime = btn.getAttribute("data-time");
        if (stateKey === "modal") state.bookingModalTime = btn.getAttribute("data-time");
        if (stateKey === "reschedule") state.reschedulePickTime = btn.getAttribute("data-time");
      });
    });
  }

  function resetBookingForm(form) {
    form.reset();
    state.bookingModalTime = null;
    $all(".time-slot", form).forEach(function (b) {
      b.classList.remove("is-selected");
    });
  }

  function submitBookingFromForm(form, opts) {
    opts = opts || {};
    var serviceEl = form.querySelector("[name=\"service\"]");
    var fixedEl = form.querySelector("[name=\"service-fixed\"]");
    var service = "";
    if (serviceEl) service = String(serviceEl.value || "").trim();
    if (!service && fixedEl) service = String(fixedEl.value || "").trim();
    if (!service && opts.serviceFixed) service = opts.serviceFixed;
    var date = (form.querySelector("[name=\"date\"]") || {}).value;
    var time = opts.time || state.bookingModalTime || state.demoSelectedTime;
    var petType = (form.querySelector("[name=\"petType\"]") || {}).value;
    var petName = (form.querySelector("[name=\"petName\"]") || {}).value;
    var ownerName = (form.querySelector("[name=\"ownerName\"]") || {}).value;
    var phone = (form.querySelector("[name=\"phone\"]") || {}).value;
    var notes = (form.querySelector("[name=\"notes\"]") || {}).value || "";

    var ok = true;
    ["date", "petType", "petName", "ownerName", "phone"].forEach(function (n) {
      var inp = form.querySelector("[name=\"" + n + "\"]");
      if (inp) {
        clearFieldError(inp);
        if (!String(inp.value || "").trim()) {
          setFieldError(inp, "Required");
          ok = false;
        }
      }
    });
    if (serviceEl) clearFieldError(serviceEl);
    if (!service) {
      if (serviceEl) setFieldError(serviceEl, "Choose a service");
      ok = false;
    }
    if (!date) {
      var di = form.querySelector("[name=\"date\"]");
      if (di) setFieldError(di, "Pick a date");
      ok = false;
    }
    if (!time) {
      showToast("Please select a time slot", "error");
      ok = false;
    }
    if (!ok) return false;

    var status = Math.random() > 0.35 ? "Confirmed" : "Pending";
    var booking = {
      id: uid(),
      service: String(service).trim(),
      date: date,
      time: time,
      petType: petType,
      petName: String(petName).trim(),
      ownerName: String(ownerName).trim(),
      phone: String(phone).trim(),
      notes: String(notes).trim(),
      status: status,
      createdAt: Date.now(),
    };
    state.bookings.unshift(booking);
    persistState();
    renderBookings();

    var msg =
      service.indexOf("Grooming") !== -1
        ? "Your grooming appointment has been scheduled"
        : "Booking confirmed successfully";
    showToast(msg, "success");

    if (opts.closeModalId) closeModal(document.getElementById(opts.closeModalId));

    var summary = $("#booking-success-summary");
    if (summary && opts.showSummaryModal) {
      summary.innerHTML =
        "<li><strong>Service</strong> " +
        escapeHtml(booking.service) +
        "</li>" +
        "<li><strong>When</strong> " +
        escapeHtml(booking.date + " · " + booking.time) +
        "</li>" +
        "<li><strong>Pet</strong> " +
        escapeHtml(booking.petName + " (" + booking.petType + ")") +
        "</li>" +
        "<li><strong>Status</strong> " +
        booking.status +
        "</li>";
      openModal("modal-booking-success");
    }

    resetBookingForm(form);
    state.demoSelectedTime = null;
    $all("#form-demo-booking .time-slot").forEach(function (b) {
      b.classList.remove("is-selected");
    });
    return true;
  }

  function updateListingSaveButtons() {
    $all(".pet-card[data-listing-id]").forEach(function (card) {
      var id = card.getAttribute("data-listing-id");
      var btn = card.querySelector("[data-save-listing]");
      if (!btn) return;
      var saved = state.savedListings.has(id);
      btn.classList.toggle("is-saved", saved);
      btn.setAttribute("aria-pressed", saved ? "true" : "false");
      var label = btn.querySelector(".save-label");
      if (label) label.textContent = saved ? "Saved" : "Save";
    });
  }

  function switchDashboardTab(name) {
    $all("[data-dash-tab]").forEach(function (btn) {
      var on = btn.getAttribute("data-dash-tab") === name;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    $all("[data-dash-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-dash-panel") !== name;
    });
  }

  function initChat() {
    var panel = els.chatPanel;
    if (!panel) return;
    var chatPanel = $("#chat-panel");
    var launcher = $("#chat-launcher");
    var messages = $("#chat-messages");
    var input = $("#chat-input");
    var send = $("#chat-send");

    function openChat() {
      if (!chatPanel) return;
      chatPanel.removeAttribute("hidden");
      chatPanel.setAttribute("aria-hidden", "false");
      panel.classList.add("is-open");
      if (launcher) launcher.setAttribute("aria-expanded", "true");
      var t = $("#chat-toggle");
      if (t) t.setAttribute("aria-expanded", "true");
      input && input.focus();
    }

    function closeChat() {
      if (!chatPanel) return;
      chatPanel.setAttribute("hidden", "");
      chatPanel.setAttribute("aria-hidden", "true");
      panel.classList.remove("is-open");
      if (launcher) {
        launcher.setAttribute("aria-expanded", "false");
        launcher.focus();
      }
      var t = $("#chat-toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    }

    function addBubble(text, who) {
      var div = document.createElement("div");
      div.className = "chat-bubble chat-bubble--" + who;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    addBubble(
      "Hi — I’m PetHub support. Ask about bookings, orders, or services in Kuwait.",
      "bot"
    );

    send &&
      send.addEventListener("click", function () {
        var t = (input.value || "").trim();
        if (!t) {
          showToast("Type a message to send", "error");
          return;
        }
        addBubble(t, "user");
        input.value = "";
        if (window.PetHubApp) {
          var guestName = "Guest";
          if (state.user && (state.user.name || state.user.email)) {
            guestName = String(state.user.name || state.user.email).trim() || "Guest";
          }
          var row = PetHubApp.addItem("supportMessages", {
            source: "support-chat",
            name: guestName,
            message: t,
            pageUrl: location.pathname + location.search,
            pageTitle: document.title || "",
            status: "new",
          });
          console.log("[PetHubSupport] support message saved", row && row.id);
        }
        setTimeout(function () {
          addBubble(
            "Thanks — our support team received your message. We’ll get back to you shortly.",
            "bot"
          );
        }, 500);
      });

    input &&
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send.click();
        }
      });

    launcher &&
      launcher.addEventListener("click", function () {
        openChat();
      });

    $("#chat-toggle") &&
      $("#chat-toggle").addEventListener("click", function () {
        closeChat();
      });
  }

  function updateAuthUI() {
    var guest = $all("[data-guest-only]");
    var user = $all("[data-user-only]");
    if (state.user) {
      guest.forEach(function (el) {
        el.hidden = true;
      });
      user.forEach(function (el) {
        el.hidden = false;
      });
      $all("[data-user-display]").forEach(function (el) {
        el.textContent = state.user.name || state.user.email;
      });
    } else {
      guest.forEach(function (el) {
        el.hidden = false;
      });
      user.forEach(function (el) {
        el.hidden = true;
      });
    }
  }

  function bind() {
    hydrateState();

    (function highlightNav() {
      var p = document.body.getAttribute("data-page");
      if (!p) return;
      $all(".nav__link[data-nav]").forEach(function (a) {
        var match = a.getAttribute("data-nav") === p;
        a.classList.toggle("nav__link--active", match);
        if (match) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    })();

    els.toastHost = $("#toast-host");
    els.cartDrawer = $("#cart-drawer");
    els.cartLines = $("#cart-lines");
    els.cartTotal = $("#cart-total");
    els.dashBookings = $("#dash-bookings");
    els.dashOrders = $("#dash-orders");
    els.dashSaved = $("#dash-saved");
    els.dashPets = $("#dash-pets");
    els.petCardsList = $("#pet-profile-cards");
    els.petFormName = $("#pet-form-name");
    els.petFormType = $("#pet-form-type");
    els.petFormBreed = $("#pet-form-breed");
    els.petFormAge = $("#pet-form-age");
    els.petFormVacc = $("#pet-form-vacc");
    els.petFormNotes = $("#pet-form-notes");
    els.petFormSubmit = $("#pet-form-submit");
    els.chatPanel = $("#chat-widget");

    document.getElementById("year") &&
      (document.getElementById("year").textContent = String(new Date().getFullYear()));

    updateCartBadge();
    renderBookings();
    renderOrders();
    renderSavedPets();
    renderPetCards();
    updateAuthUI();

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest && t.closest("[data-modal-close]")) {
        e.preventDefault();
        closeModal(t.closest(".modal"));
      }
      if (t.classList && t.classList.contains("modal__backdrop")) {
        closeModal(t.parentElement);
      }
    });

    /* Nav mobile */
    var navToggle = $(".nav__toggle");
    var navPanel = $("#nav-panel");
    var navScrim = $("#nav-scrim");
    var navClose = $("#nav-close");
    function closeMobileNav() {
      if (!navToggle || !navPanel) return;
      navToggle.setAttribute("aria-expanded", "false");
      navPanel.classList.remove("is-open");
      document.body.style.overflow = "";
      if (navScrim) {
        navScrim.classList.remove("is-visible");
        navScrim.hidden = true;
      }
    }
    function openMobileNav() {
      if (!navToggle || !navPanel) return;
      navToggle.setAttribute("aria-expanded", "true");
      navPanel.classList.add("is-open");
      document.body.style.overflow = "hidden";
      if (navScrim) {
        navScrim.hidden = false;
        navScrim.classList.add("is-visible");
      }
    }
    var accTrigger = $("#header-account-trigger");
    var accDropdown = $("#header-account-dropdown");
    function closeAccountMenu() {
      if (!accTrigger || !accDropdown) return;
      accTrigger.setAttribute("aria-expanded", "false");
      accDropdown.hidden = true;
    }

    function closeHeaderSearch() {
      var st = $("#header-search-toggle");
      var sd = $("#header-search-dropdown");
      if (!st || !sd) return;
      st.setAttribute("aria-expanded", "false");
      st.setAttribute("aria-label", "Open search");
      sd.classList.remove("is-open");
      sd.setAttribute("aria-hidden", "true");
    }

    function openHeaderSearch() {
      var st = $("#header-search-toggle");
      var sd = $("#header-search-dropdown");
      if (!st || !sd) return;
      closeAccountMenu();
      st.setAttribute("aria-expanded", "true");
      st.setAttribute("aria-label", "Close search");
      sd.classList.add("is-open");
      sd.setAttribute("aria-hidden", "false");
      var inp = $("#global-search");
      if (inp) setTimeout(function () { inp.focus(); }, 10);
    }

    if (accTrigger && accDropdown) {
      accTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = accTrigger.getAttribute("aria-expanded") === "true";
        accTrigger.setAttribute("aria-expanded", String(!open));
        accDropdown.hidden = open;
        if (!open) closeHeaderSearch();
      });
    }

    var searchToggle = $("#header-search-toggle");
    var searchDropdown = $("#header-search-dropdown");
    var searchPopover = $("#header-search-popover");
    if (searchToggle && searchDropdown && searchPopover) {
      searchToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = searchDropdown.classList.contains("is-open");
        if (isOpen) closeHeaderSearch();
        else openHeaderSearch();
      });
      searchDropdown.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    document.addEventListener("click", function (e) {
      closeAccountMenu();
      if (searchPopover && !searchPopover.contains(e.target)) {
        closeHeaderSearch();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      closeAllModals();
      closeCartDrawer();
      var chatPanelEl = document.getElementById("chat-panel");
      var chatRoot = document.getElementById("chat-widget");
      if (
        chatPanelEl &&
        chatRoot &&
        !chatPanelEl.hasAttribute("hidden")
      ) {
        chatPanelEl.setAttribute("hidden", "");
        chatPanelEl.setAttribute("aria-hidden", "true");
        chatRoot.classList.remove("is-open");
        var chLaunch = document.getElementById("chat-launcher");
        if (chLaunch) chLaunch.setAttribute("aria-expanded", "false");
        var chToggle = document.getElementById("chat-toggle");
        if (chToggle) chToggle.setAttribute("aria-expanded", "false");
      }
      if (navToggle && navPanel && navPanel.classList.contains("is-open")) {
        closeMobileNav();
      }
      var accTr = $("#header-account-trigger");
      var accDr = $("#header-account-dropdown");
      if (accTr && accDr && !accDr.hidden) {
        accTr.setAttribute("aria-expanded", "false");
        accDr.hidden = true;
      }
      closeHeaderSearch();
    });

    if (navToggle && navPanel) {
      navToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        if (navPanel.classList.contains("is-open")) closeMobileNav();
        else {
          closeHeaderSearch();
          openMobileNav();
        }
      });
      if (navClose) {
        navClose.addEventListener("click", function (e) {
          e.stopPropagation();
          closeMobileNav();
        });
      }
      if (navScrim) {
        navScrim.addEventListener("click", function () {
          closeMobileNav();
        });
      }
      navPanel.querySelectorAll("a[href]").forEach(function (a) {
        a.addEventListener("click", function () {
          var raw = (a.getAttribute("href") || "").trim();
          if (raw.charAt(0) === "#" && raw.length > 1) {
            var target = document.querySelector(raw);
            if (target) return;
          }
          window.scrollTo(0, 0);
        });
      });
      navPanel.querySelectorAll("a, button").forEach(function (el) {
        if (el.closest && el.closest(".nav__toggle")) return;
        if (el.id === "nav-close") return;
        el.addEventListener("click", function () {
          closeMobileNav();
        });
      });
    }

    window.addEventListener("scroll", function () {
      $(".header") && $(".header").classList.toggle("is-scrolled", window.scrollY > 16);
    });

    /* Smooth scroll */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          document.querySelector(id).scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    renderDynamicPagesFromStorage();
    updateListingSaveButtons();
    applyFilters();

    /* Reveal on scroll */
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("is-visible");
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
      );
      $all(".reveal").forEach(function (el) {
        io.observe(el);
      });
    } else {
      $all(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }

    /* Cart */
    $all("[data-open-cart]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        closeAccountMenu();
        closeHeaderSearch();
        closeMobileNav();
        openCartDrawer();
      });
    });

    $all("[data-open-chat]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        closeAccountMenu();
        closeHeaderSearch();
        closeMobileNav();
        var launch = document.getElementById("chat-launcher");
        if (launch) launch.click();
      });
    });
    $all("[data-close-cart]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeCartDrawer();
      });
    });

    document.addEventListener("click", function (e) {
      var addBtn = e.target.closest && e.target.closest("[data-add-cart]");
      if (!addBtn) return;
      if (addBtn.hasAttribute("disabled")) return;
      var card = addBtn.closest(".product-card");
      if (!card) return;
      var id = card.getAttribute("data-product-id");
      var name = card.getAttribute("data-product-name");
      var price = parseFloat(card.getAttribute("data-product-price") || "0");
      var stockAttr = card.getAttribute("data-product-stock");
      var stock = stockAttr != null && stockAttr !== "" ? parseInt(stockAttr, 10) : 999;
      if (isNaN(stock)) stock = 999;
      var qtyInput = card.querySelector("[data-product-qty]");
      var q = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
      if (stock <= 0) {
        showToast("This item is out of stock", "error");
        return;
      }
      if (q > stock) {
        q = stock;
        if (qtyInput) qtyInput.value = String(stock);
        showToast("Only " + stock + " in stock — quantity adjusted", "info");
      }
      addLineToCart(id, name, price, q);
      if (qtyInput) qtyInput.value = "1";
      updateCartBadge();
      renderCartDrawer();
      showToast("Added to cart successfully", "success");
      openCartDrawer();
    });

    $("#checkout-open") &&
      $("#checkout-open").addEventListener("click", function () {
        if (!state.cart.length) {
          showToast("Your cart is empty", "error");
          return;
        }
        closeCartDrawer();
        openModal("modal-checkout");
      });

    $("#form-checkout") &&
      $("#form-checkout").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        if (!validateRequired(f, ["fullName", "phone", "address"])) return;
        var total = cartTotal();
        var items = state.cart.map(function (l) {
          return {
            productId: l.productId,
            name: l.name,
            qty: l.qty,
            price: l.price,
          };
        });
        if (window.PetHubApp) {
          var orderRow = PetHubApp.addItem("shopOrders", {
            customerName: f.fullName.value.trim(),
            phone: f.phone.value.trim(),
            address: f.address.value.trim(),
            items: items,
            total: total,
            status: "new",
          });
          state.orders = PetHubApp.getData("shopOrders");
          console.log("[PetHubShop] shop order created", orderRow && orderRow.id, "total", total);
        } else {
          state.orders.unshift({
            id: uid(),
            items: items,
            lines: items,
            total: total,
            createdAt: Date.now(),
            placedAt: Date.now(),
            customerName: f.fullName.value.trim(),
            phone: f.phone.value.trim(),
            status: "new",
          });
        }
        state.cart = [];
        persistState();
        updateCartBadge();
        renderCartDrawer();
        closeModal($("#modal-checkout"));
        showToast("Order placed successfully", "success");
        renderOrders();
        f.reset();
      });

    /* Booking modal from service cards */
    document.addEventListener("click", function (e) {
      var bookBtn = e.target.closest && e.target.closest("[data-open-booking]");
      if (!bookBtn) return;
      var card = bookBtn.closest(".service-card");
      var service = (card && card.getAttribute("data-service")) || "Pet Service";
      var sel = $("#modal-booking-service");
      if (sel) {
        var o = [].slice.call(sel.options).find(function (opt) { return opt.value === service; });
        if (o) sel.value = service;
        else sel.selectedIndex = 0;
      }
      state.bookingModalTime = null;
      $all("#form-modal-booking .time-slot").forEach(function (b) {
        b.classList.remove("is-selected");
      });
      openModal("modal-booking");
    });

    $("#form-modal-booking") &&
      $("#form-modal-booking").addEventListener("submit", function (e) {
        e.preventDefault();
        submitBookingFromForm(e.target, {
          closeModalId: "modal-booking",
          showSummaryModal: true,
        });
      });

    $("#modal-booking-success") &&
      $("#modal-booking-success").querySelector("[data-modal-close]") &&
      $("#modal-booking-success")
        .querySelector("[data-modal-close]")
        .addEventListener("click", function () {
          closeModal($("#modal-booking-success"));
        });

    setupTimeSlots($("#form-modal-booking"), "modal");
    setupTimeSlots($("#form-demo-booking"), "demo");

    $("#form-demo-booking") &&
      $("#form-demo-booking").addEventListener("submit", function (e) {
        e.preventDefault();
        submitBookingFromForm(e.target, { showSummaryModal: true });
      });

    setupTimeSlots($("#form-reschedule"), "reschedule");

    $("#form-reschedule") &&
      $("#form-reschedule").addEventListener("submit", function (e) {
        e.preventDefault();
        var b = state.bookings.find(function (x) {
          return x.id === state.rescheduleBookingId;
        });
        if (!b) {
          closeModal($("#modal-reschedule"));
          return;
        }
        var di = $("#reschedule-date-input");
        var date = di && di.value;
        var time = state.reschedulePickTime;
        if (!date) {
          showToast("Please choose a new date", "error");
          return;
        }
        if (!time) {
          showToast("Please select a time slot", "error");
          return;
        }
        b.date = date;
        b.time = time;
        b.status = "Pending";
        persistState();
        closeModal($("#modal-reschedule"));
        showToast("Booking rescheduled — new time saved", "success");
        renderBookings();
      });

    /* Marketplace */
    document.addEventListener("click", function (e) {
      var det = e.target.closest && e.target.closest("[data-view-listing]");
      if (det) {
        var card = det.closest(".pet-card");
        var title = card.getAttribute("data-listing-title");
        var body = $("#modal-listing-body");
        if (body) {
          var cardImg = card.querySelector(".pet-card__img");
          var imgBlock = "";
          if (cardImg) {
            var src = cardImg.getAttribute("src") || "";
            var alt = cardImg.getAttribute("alt") || title || "";
            imgBlock =
              '<div class="modal-listing-media"><img class="modal-listing-img" src="' +
              escapeHtml(src) +
              '" alt="' +
              escapeHtml(alt) +
              '" loading="lazy" decoding="async" /></div>';
          }
          body.innerHTML =
            imgBlock +
            "<h3>" +
            escapeHtml(title) +
            "</h3>" +
            "<p>" +
            escapeHtml(card.getAttribute("data-listing-desc") || "") +
            "</p>" +
            "<ul class=\"modal-listing-meta\">" +
            "<li><span>Age</span> " +
            escapeHtml(card.getAttribute("data-listing-age") || "") +
            "</li>" +
            "<li><span>Gender</span> " +
            escapeHtml(card.getAttribute("data-listing-gender") || "") +
            "</li>" +
            "<li><span>Price</span> " +
            escapeHtml(card.getAttribute("data-listing-price") || "") +
            "</li>" +
            "<li><span>Location</span> " +
            escapeHtml(card.getAttribute("data-listing-loc") || "") +
            "</li>" +
            "<li><span>Seller</span> " +
            escapeHtml(card.getAttribute("data-listing-seller") || "") +
            "</li>" +
            "</ul>";
        }
        openModal("modal-listing");
        return;
      }
      var contact = e.target.closest && e.target.closest("[data-contact-seller]");
      if (contact) {
        var c = contact.closest(".pet-card");
        state.currentListing = c.getAttribute("data-listing-id");
        state.inquiryPetType = (c.getAttribute("data-category") || "").trim();
        $("#inquiry-listing-label") &&
          ($("#inquiry-listing-label").textContent = c.getAttribute("data-listing-title") || "Listing");
        var f = $("#form-inquiry");
        if (f) f.reset();
        openModal("modal-inquiry");
        return;
      }
      var save = e.target.closest && e.target.closest("[data-save-listing]");
      if (save) {
        var pc = save.closest(".pet-card");
        var lid = pc.getAttribute("data-listing-id");
        if (state.savedListings.has(lid)) {
          state.savedListings.delete(lid);
          delete state.savedListingDetails[lid];
          showToast("Removed from saved pets", "info");
        } else {
          state.savedListings.add(lid);
          var imgEl = pc.querySelector(".pet-card__img");
          var imageSrc = imgEl ? imgEl.getAttribute("src") || imgEl.src || "" : "";
          state.savedListingDetails[lid] = {
            title: pc.getAttribute("data-listing-title") || "",
            loc: pc.getAttribute("data-listing-loc") || "",
            price: pc.getAttribute("data-listing-price") || "",
            imageSrc: imageSrc,
          };
          showToast("Saved to your list", "success");
        }
        persistState();
        updateListingSaveButtons();
        renderSavedPets();
        return;
      }
    });

    $("#form-inquiry") &&
      $("#form-inquiry").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        if (!validateRequired(f, ["name", "email", "message"])) return;
        if (window.PetHubApp) {
          var phoneEl = f.querySelector("[name=\"phone\"]");
          var row = PetHubApp.addItem("marketplaceInquiries", {
            listingId: state.currentListing || "",
            listingName: ($("#inquiry-listing-label") && $("#inquiry-listing-label").textContent) || "",
            petType: state.inquiryPetType || "",
            buyerName: f.name.value.trim(),
            buyerEmail: f.email.value.trim(),
            buyerPhone: phoneEl ? String(phoneEl.value || "").trim() : "",
            message: f.message.value.trim(),
            status: "new",
          });
          console.log("[PetHubMarket] marketplace inquiry saved", row && row.id);
        }
        closeModal($("#modal-inquiry"));
        showToast("Your inquiry has been sent successfully", "success");
        f.reset();
      });

    /* Pet profile form */
    $("#form-pet-profile") &&
      $("#form-pet-profile").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        if (!validateRequired(f, ["petName", "petType", "breed", "age"])) return;
        var vacc = (f.querySelector("[name=\"vaccDate\"]") || {}).value || "";
        if (state.editingPetId) {
          var pet = state.pets.find(function (p) { return p.id === state.editingPetId; });
          if (pet) {
            pet.name = f.petName.value.trim();
            pet.type = f.petType.value.trim();
            pet.breed = f.breed.value.trim();
            pet.age = f.age.value.trim();
            pet.vaccDate = vacc;
            pet.notes = (f.notes && f.notes.value) || "";
            showToast("Pet profile updated", "success");
          }
          state.editingPetId = null;
          if (els.petFormSubmit) els.petFormSubmit.textContent = "Save pet profile";
        } else {
          state.pets.push({
            id: uid(),
            name: f.petName.value.trim(),
            type: f.petType.value.trim(),
            breed: f.breed.value.trim(),
            age: f.age.value.trim(),
            vaccDate: vacc,
            notes: (f.notes && f.notes.value) || "",
          });
          showToast("Pet profile saved", "success");
        }
        f.reset();
        persistState();
        renderPetCards();
      });

    /* Auth */
    function openAuth(mode) {
      var title = $("#auth-mode-title");
      if (title) title.textContent = mode === "signup" ? "Create your account" : "Welcome back";
      openModal("modal-auth");
      var f = $("#form-auth");
      if (f) f.reset();
      var su = $("#form-auth-signup-fields");
      if (su) {
        su.hidden = mode !== "signup";
        var dn = f && f.querySelector("[name=\"displayName\"]");
        if (dn) dn.required = mode === "signup";
      }
    }

    $all("[data-open-auth]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openAuth(btn.getAttribute("data-open-auth") || "signin");
      });
    });

    $("#form-auth") &&
      $("#form-auth").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        if (!validateRequired(f, ["email", "password"])) return;
        var su = $("#form-auth-signup-fields");
        if (su && !su.hidden && !validateRequired(f, ["displayName"])) return;
        var role = (f.querySelector("[name=\"role\"]") || {}).value || "owner";
        var name = (f.querySelector("[name=\"displayName\"]") || {}).value;
        state.user = {
          email: f.email.value.trim(),
          name: (name && name.trim()) || f.email.value.split("@")[0],
          role: role,
        };
        closeModal($("#modal-auth"));
        persistState();
        showToast("Signed in successfully", "success");
        updateAuthUI();
      });

    $all("[data-sign-out]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        closeAccountMenu();
        closeHeaderSearch();
        state.user = null;
        persistState();
        updateAuthUI();
        showToast("Signed out", "info");
      });
    });

    /* Emergency (FAB, hero pills, in-content buttons) */
    $all("[data-open-emergency]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal("modal-emergency");
      });
    });

    $("#form-contact-page") &&
      $("#form-contact-page").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        if (!validateRequired(f, ["name", "email", "topic", "message"])) return;
        if (window.PetHubApp) {
          PetHubApp.addItem("contactMessages", {
            name: f.name.value.trim(),
            email: f.email.value.trim(),
            topic: f.topic.value,
            message: f.message.value.trim(),
          });
        }
        showToast("Message sent — we’ll get back to you soon.", "success");
        f.reset();
      });

    $("#form-emergency") &&
      $("#form-emergency").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        if (!validateRequired(f, ["issue", "location", "contact"])) return;
        if (window.PetHubApp) {
          PetHubApp.addItem("emergencyRequests", {
            issue: f.issue.value.trim(),
            location: f.location.value.trim(),
            phone: f.contact.value.trim(),
            status: "urgent",
          });
        }
        closeModal($("#modal-emergency"));
        showToast(
          "Emergency request sent. A veterinary provider will contact you shortly.",
          "success"
        );
        f.reset();
      });

    /* Dashboard tabs */
    $all("[data-dash-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchDashboardTab(btn.getAttribute("data-dash-tab"));
        if (btn.getAttribute("data-dash-tab") === "bookings") renderBookings();
        if (btn.getAttribute("data-dash-tab") === "orders") renderOrders();
        if (btn.getAttribute("data-dash-tab") === "saved") renderSavedPets();
        if (btn.getAttribute("data-dash-tab") === "pets") renderPetCards();
      });
    });

    if (document.body.getAttribute("data-page") === "bookings") {
      function bookingsHashToTab() {
        var h = (window.location.hash || "").toLowerCase();
        if (h !== "#dash-saved" && h !== "#saved") return;
        switchDashboardTab("saved");
        renderSavedPets();
      }
      bookingsHashToTab();
      window.addEventListener("hashchange", bookingsHashToTab);
    }

    /* Search & filters */
    var marketFilter = "all";
    var shopFilter = "all";

    function normalizeQuery(q) {
      return (q || "").trim().toLowerCase();
    }

    function matchesSearch(el, q) {
      if (!q) return true;
      var hay = (el.getAttribute("data-searchable") || "").toLowerCase();
      return hay.indexOf(q) !== -1;
    }

    function applyFilters() {
      var gsEl = $("#global-search");
      var raw = (gsEl && gsEl.value) || "";
      var q = normalizeQuery(raw);
      var emptySvc = $("#empty-services");
      var emptyMarket = $("#empty-marketplace");
      var emptyShop = $("#empty-shop");

      var visS = 0;
      var hasSvc = $all(".service-card").length > 0;
      if (hasSvc) {
        $all(".service-card").forEach(function (el) {
          var show = matchesSearch(el, q);
          el.classList.toggle("is-hidden", !show);
          if (show) visS++;
        });
      }
      if (emptySvc) emptySvc.hidden = !hasSvc || visS !== 0;

      var visM = 0;
      var hasPet = $all(".pet-card").length > 0;
      if (hasPet) {
        $all(".pet-card").forEach(function (el) {
          var cat = el.getAttribute("data-category") || "";
          var ok = (marketFilter === "all" || cat === marketFilter) && matchesSearch(el, q);
          el.classList.toggle("is-hidden", !ok);
          if (ok) visM++;
        });
      }
      if (emptyMarket) emptyMarket.hidden = !hasPet || visM !== 0;

      var visP = 0;
      var hasProd = $all(".product-card").length > 0;
      if (hasProd) {
        $all(".product-card").forEach(function (el) {
          var cat = el.getAttribute("data-shop-cat") || "";
          var ok = (shopFilter === "all" || cat === shopFilter) && matchesSearch(el, q);
          el.classList.toggle("is-hidden", !ok);
          if (ok) visP++;
        });
      }
      if (emptyShop) emptyShop.hidden = hasProd && visP > 0;
    }

    var gs = $("#global-search");
    var paramsInit = new URLSearchParams(window.location.search);
    var qParam = paramsInit.get("q");
    if (qParam && gs) gs.value = qParam;
    var searchDeb;
    function onGlobalSearchInput() {
      clearTimeout(searchDeb);
      searchDeb = setTimeout(applyFilters, 160);
    }
    if (gs) gs.addEventListener("input", onGlobalSearchInput);

    $("[data-hero-search-btn]") &&
      $("[data-hero-search-btn]").addEventListener("click", function () {
        var hi = $("[data-hero-search]");
        var q = hi && hi.value ? hi.value.trim() : "";
        window.location.href = "services.html" + (q ? "?q=" + encodeURIComponent(q) : "");
      });

    $("[data-open-forgot]") &&
      $("[data-open-forgot]").addEventListener("click", function (e) {
        e.preventDefault();
        openModal("modal-forgot");
      });

    $all("[data-filter-market]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        marketFilter = btn.getAttribute("data-filter-market") || "all";
        $all("[data-filter-market]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        applyFilters();
      });
    });

    $all("[data-filter-shop]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        shopFilter = btn.getAttribute("data-filter-shop") || "all";
        $all("[data-filter-shop]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        applyFilters();
      });
    });

    applyFilters();

    function refreshPublicUiFromStorage() {
      hydrateState();
      renderBookings();
      renderOrders();
      renderSavedPets();
      renderPetCards();
      updateCartBadge();
      renderDynamicPagesFromStorage();
      updateListingSaveButtons();
      applyFilters();
    }

    updateRootSnapRef();

    window.addEventListener("storage", function (e) {
      if (!window.PetHubApp || !PetHubApp.ROOT_KEY) return;
      if (e.key !== PetHubApp.ROOT_KEY && e.key !== STORAGE_KEY) return;
      updateRootSnapRef();
      refreshPublicUiFromStorage();
    });

    window.addEventListener("focus", function () {
      if (!window.PetHubApp || !PetHubApp.ROOT_KEY) return;
      try {
        var now = localStorage.getItem(PetHubApp.ROOT_KEY) || "";
        if (now === lastKnownRootJson) return;
        lastKnownRootJson = now;
        refreshPublicUiFromStorage();
      } catch (err) {}
    });

    initChat();

    $("#form-signin-page") &&
      $("#form-signin-page").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        if (!validateRequired(f, ["email", "password"])) return;
        var su = $("#signin-signup-fields");
        if (su && !su.hidden && !validateRequired(f, ["displayName"])) return;
        var role = (f.querySelector("[name=\"role\"]") || {}).value || "owner";
        var name = (f.querySelector("[name=\"displayName\"]") || {}).value;
        state.user = {
          email: f.email.value.trim(),
          name: (name && name.trim()) || f.email.value.split("@")[0],
          role: role,
        };
        persistState();
        showToast("Signed in successfully", "success");
        setTimeout(function () {
          window.location.href = "index.html";
        }, 600);
      });

    $all("[data-signin-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.getAttribute("data-signin-tab");
        var signup = mode === "signup";
        $all("[data-signin-tab]").forEach(function (b) {
          b.classList.toggle("is-active", b.getAttribute("data-signin-tab") === mode);
        });
        var sf = $("#signin-signup-fields");
        if (sf) sf.hidden = !signup;
        var dn = $("#signin-display-name");
        if (dn) dn.required = signup;
      });
    });

    $("#form-contact-page") &&
      $("#form-contact-page").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target;
        if (!validateRequired(f, ["name", "email", "topic", "message"])) return;
        showToast("Message sent — we’ll reply within one business day", "success");
        f.reset();
      });

    $all("[data-faq-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    $("#form-forgot-demo") &&
      $("#form-forgot-demo").addEventListener("submit", function (e) {
        e.preventDefault();
        var em = $("#forgot-email-input");
        if (!em || !String(em.value || "").trim()) {
          showToast("Enter your email address", "error");
          return;
        }
        showToast("Reset link sent (demo) — check your inbox", "success");
        e.target.reset();
        closeModal($("#modal-forgot"));
      });

    if (document.body.getAttribute("data-page") === "signin") {
      var sm = new URLSearchParams(window.location.search).get("mode");
      if (sm === "signup") {
        var suBtn = document.querySelector("[data-signin-tab=\"signup\"]");
        if (suBtn) suBtn.click();
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
