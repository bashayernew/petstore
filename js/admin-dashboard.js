/**
 * PetHub admin dashboard — CRUD over PetHubApp (localStorage).
 */
(function () {
  "use strict";

  var LS_LOGIN = "isAdminLoggedIn";
  var App = window.PetHubApp;
  if (!App) {
    console.error("PetHubApp missing — load storage.js first.");
    return;
  }

  /** Pretty route /admin on Vercel; admin-login.html for file:// or same-folder relative. */
  function adminLoginUrl() {
    return location.protocol === "file:" ? "admin-login.html" : "/admin";
  }

  if (localStorage.getItem(LS_LOGIN) !== "true") {
    window.location.replace(adminLoginUrl());
    return;
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return [].slice.call((root || document).querySelectorAll(sel));
  }

  function escapeHtml(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  }

  function badgeClass(status) {
    var t = String(status || "").toLowerCase();
    if (t === "confirmed" || t === "resolved" || t === "active") return "badge--green";
    if (t === "pending" || t === "urgent") return "badge--yellow";
    if (t === "cancelled" || t === "inactive") return "badge--red";
    return "badge--blue";
  }

  var modal = $("#admin-modal");
  var modalForm = $("#admin-modal-form");
  var modalTitle = $("#admin-modal-title");
  var modalContext = { kind: null, id: null };

  function openModal(title, htmlFields, onSubmit) {
    modalTitle.textContent = title;
    modalForm.innerHTML = htmlFields;
    modal.hidden = false;
    modalContext.onSubmit = onSubmit;
    var first = modalForm.querySelector("input, select, textarea");
    if (first) setTimeout(function () { first.focus(); }, 50);
  }

  function closeModal() {
    modal.hidden = true;
    modalContext.kind = null;
    modalContext.id = null;
    modalContext.onSubmit = null;
    modalForm.innerHTML = "";
  }

  $("#admin-modal-cancel").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  modalForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (typeof modalContext.onSubmit === "function") {
      modalContext.onSubmit(new FormData(modalForm));
    }
  });

  function renderKpis() {
    var el = $("#admin-kpi");
    if (!el) return;
    var s = App.getData("services").length;
    var m = App.getData("marketplaceListings").length;
    var b = App.getData("bookings").length;
    var e = App.getData("emergencyRequests").length;
    el.innerHTML =
      '<div class="admin-kpi"><p class="admin-kpi__label">Services</p><p class="admin-kpi__value">' +
      s +
      '</p></div><div class="admin-kpi"><p class="admin-kpi__label">Listings</p><p class="admin-kpi__value">' +
      m +
      '</p></div><div class="admin-kpi"><p class="admin-kpi__label">Bookings</p><p class="admin-kpi__value">' +
      b +
      '</p></div><div class="admin-kpi"><p class="admin-kpi__label">Emergency</p><p class="admin-kpi__value">' +
      e +
      "</p></div>";
  }

  function renderServices() {
    var tb = $("#table-services tbody");
    if (!tb) return;
    var rows = App.getData("services");
    tb.innerHTML = rows
      .map(function (r) {
        return (
          "<tr>" +
          '<td><img class="admin-thumb" src="' +
          escapeHtml(r.image) +
          '" alt="" onerror="this.style.display=\'none\'" /></td>' +
          "<td>" +
          escapeHtml(r.title) +
          "</td>" +
          '<td style="max-width:220px">' +
          escapeHtml(r.description) +
          "</td>" +
          "<td><span class=\"badge " +
          badgeClass(r.status) +
          '">' +
          escapeHtml(r.status) +
          "</span></td>" +
          '<td class="admin-actions"><button type="button" class="btn-admin btn-admin--ghost btn-admin--sm" data-edit-service="' +
          escapeHtml(r.id) +
          '">Edit</button> ' +
          '<button type="button" class="btn-admin btn-admin--danger btn-admin--sm" data-del-service="' +
          escapeHtml(r.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
  }

  function renderMarketplace() {
    var tb = $("#table-marketplace tbody");
    if (!tb) return;
    var rows = App.getData("marketplaceListings");
    tb.innerHTML = rows
      .map(function (r) {
        return (
          "<tr>" +
          '<td><img class="admin-thumb" src="' +
          escapeHtml(App.resolveMarketplaceListingImage ? App.resolveMarketplaceListingImage(r) : r.image) +
          '" alt="" /></td>' +
          "<td>" +
          escapeHtml(r.name) +
          "</td>" +
          "<td>" +
          escapeHtml(r.type) +
          "</td>" +
          "<td>" +
          escapeHtml(r.age) +
          "</td>" +
          "<td>" +
          escapeHtml(r.price) +
          "</td>" +
          "<td>" +
          escapeHtml(r.location) +
          "</td>" +
          '<td class="admin-actions"><button type="button" class="btn-admin btn-admin--ghost btn-admin--sm" data-edit-listing="' +
          escapeHtml(r.id) +
          '">Edit</button> ' +
          '<button type="button" class="btn-admin btn-admin--danger btn-admin--sm" data-del-listing="' +
          escapeHtml(r.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
  }

  function renderBookings() {
    var tb = $("#table-bookings tbody");
    if (!tb) return;
    var rows = App.getData("bookings");
    tb.innerHTML = rows
      .map(function (r) {
        return (
          "<tr>" +
          "<td>" +
          escapeHtml(r.service) +
          "</td>" +
          "<td>" +
          escapeHtml(r.date + " · " + r.time) +
          "</td>" +
          "<td>" +
          escapeHtml(r.petName + " (" + (r.petType || "") + ")") +
          "</td>" +
          "<td>" +
          escapeHtml(r.ownerName) +
          "</td>" +
          "<td>" +
          escapeHtml(r.phone) +
          "</td>" +
          "<td><span class=\"badge " +
          badgeClass(r.status) +
          '">' +
          escapeHtml(r.status) +
          "</span></td>" +
          '<td class="admin-actions"><button type="button" class="btn-admin btn-admin--ghost btn-admin--sm" data-edit-booking="' +
          escapeHtml(r.id) +
          '">Edit</button> ' +
          '<button type="button" class="btn-admin btn-admin--danger btn-admin--sm" data-del-booking="' +
          escapeHtml(r.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
  }

  function renderPets() {
    var tb = $("#table-pets tbody");
    if (!tb) return;
    var rows = App.getData("petProfiles");
    tb.innerHTML = rows
      .map(function (r) {
        return (
          "<tr>" +
          "<td>" +
          escapeHtml(r.name) +
          "</td>" +
          "<td>" +
          escapeHtml(r.type) +
          "</td>" +
          "<td>" +
          escapeHtml(r.breed) +
          "</td>" +
          "<td>" +
          escapeHtml(r.age) +
          "</td>" +
          "<td>" +
          escapeHtml(r.vaccinationDate || "") +
          "</td>" +
          '<td class="admin-actions"><button type="button" class="btn-admin btn-admin--ghost btn-admin--sm" data-edit-pet="' +
          escapeHtml(r.id) +
          '">Edit</button> ' +
          '<button type="button" class="btn-admin btn-admin--danger btn-admin--sm" data-del-pet="' +
          escapeHtml(r.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
  }

  function renderMessages() {
    var tb = $("#table-messages tbody");
    if (!tb) return;
    var rows = App.getData("contactMessages").slice().sort(function (a, b) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    tb.innerHTML = rows
      .map(function (r) {
        var d = r.createdAt ? new Date(r.createdAt).toLocaleString() : "—";
        return (
          "<tr>" +
          "<td>" +
          escapeHtml(d) +
          "</td>" +
          "<td>" +
          escapeHtml(r.name) +
          "</td>" +
          "<td>" +
          escapeHtml(r.email) +
          "</td>" +
          "<td>" +
          escapeHtml(r.topic) +
          "</td>" +
          '<td style="max-width:240px">' +
          escapeHtml(r.message) +
          "</td>" +
          '<td><button type="button" class="btn-admin btn-admin--danger btn-admin--sm" data-del-msg="' +
          escapeHtml(r.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
  }

  function renderEmergency() {
    var tb = $("#table-emergency tbody");
    if (!tb) return;
    var rows = App.getData("emergencyRequests").slice().sort(function (a, b) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    tb.innerHTML = rows
      .map(function (r) {
        var d = r.createdAt ? new Date(r.createdAt).toLocaleString() : "—";
        return (
          "<tr>" +
          "<td>" +
          escapeHtml(d) +
          "</td>" +
          '<td style="max-width:200px">' +
          escapeHtml(r.issue) +
          "</td>" +
          "<td>" +
          escapeHtml(r.location) +
          "</td>" +
          "<td>" +
          escapeHtml(r.phone) +
          "</td>" +
          "<td><span class=\"badge " +
          badgeClass(r.status) +
          '">' +
          escapeHtml(r.status) +
          "</span></td>" +
          '<td class="admin-actions"><button type="button" class="btn-admin btn-admin--ghost btn-admin--sm" data-edit-em="' +
          escapeHtml(r.id) +
          '">Update</button> ' +
          '<button type="button" class="btn-admin btn-admin--danger btn-admin--sm" data-del-em="' +
          escapeHtml(r.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
  }

  var shopAdminCatFilter = "all";
  var SHOP_CATEGORIES = ["food", "toys", "grooming", "beds", "carriers", "accessories"];

  function renderShopKpis() {
    var wrap = $("#admin-shop-kpis");
    if (!wrap) return;
    var rows = App.getData("shopProducts");
    var active = rows.filter(function (r) {
      return String(r.status || "").toLowerCase() === "active";
    }).length;
    var oos = rows.filter(function (r) {
      return (parseInt(r.stock, 10) || 0) <= 0;
    }).length;
    var catKeys = {};
    rows.forEach(function (r) {
      var c = String(r.category || "other").toLowerCase();
      catKeys[c] = true;
    });
    var catCount = Object.keys(catKeys).length;
    wrap.innerHTML =
      '<div class="admin-kpi"><p class="admin-kpi__label">Total products</p><p class="admin-kpi__value">' +
      rows.length +
      '</p></div><div class="admin-kpi"><p class="admin-kpi__label">Active</p><p class="admin-kpi__value">' +
      active +
      '</p></div><div class="admin-kpi"><p class="admin-kpi__label">Out of stock</p><p class="admin-kpi__value">' +
      oos +
      '</p></div><div class="admin-kpi"><p class="admin-kpi__label">Categories used</p><p class="admin-kpi__value">' +
      catCount +
      "</p></div>";
  }

  function renderShopTable() {
    var tb = $("#table-shop tbody");
    if (!tb) return;
    var rows = App.getData("shopProducts").filter(function (r) {
      if (shopAdminCatFilter === "all") return true;
      return String(r.category || "").toLowerCase() === shopAdminCatFilter;
    });
    tb.innerHTML = rows
      .map(function (r) {
        var st = String(r.status || "").toLowerCase();
        var stockVal = parseInt(r.stock, 10);
        if (isNaN(stockVal)) stockVal = 0;
        return (
          "<tr>" +
          '<td><img class="admin-thumb" src="' +
          escapeHtml(r.image || "") +
          '" alt="" onerror="this.style.display=\'none\'" /></td>' +
          "<td>" +
          escapeHtml(r.name) +
          "</td>" +
          "<td>" +
          escapeHtml(r.brand || "") +
          "</td>" +
          "<td>" +
          escapeHtml(r.category || "") +
          "</td>" +
          "<td>" +
          escapeHtml(String(r.price != null ? r.price : "")) +
          "</td>" +
          '<td><input type="number" min="0" step="1" class="input admin-stock-input" data-shop-stock-id="' +
          escapeHtml(r.id) +
          '" value="' +
          stockVal +
          '" aria-label="Stock for ' +
          escapeHtml(r.name) +
          '" /></td>' +
          "<td>" +
          escapeHtml(r.badge || "—") +
          "</td>" +
          "<td><span class=\"badge " +
          badgeClass(r.status) +
          "\">" +
          escapeHtml(r.status || "") +
          '</span> <button type="button" class="btn-admin btn-admin--ghost btn-admin--sm" data-shop-toggle="' +
          escapeHtml(r.id) +
          '">Toggle</button></td>' +
          '<td class="admin-actions"><button type="button" class="btn-admin btn-admin--ghost btn-admin--sm" data-edit-shop="' +
          escapeHtml(r.id) +
          '">Edit</button> ' +
          '<button type="button" class="btn-admin btn-admin--danger btn-admin--sm" data-del-shop="' +
          escapeHtml(r.id) +
          '">Delete</button></td></tr>'
        );
      })
      .join("");
  }

  function productFields(r) {
    r = r || {};
    var catOpts = SHOP_CATEGORIES.map(function (c) {
      return (
        '<option value="' +
        c +
        '"' +
        (String(r.category || "").toLowerCase() === c ? " selected" : "") +
        ">" +
        c.charAt(0).toUpperCase() +
        c.slice(1) +
        "</option>"
      );
    }).join("");
    var st = String(r.status || "active").toLowerCase();
    return (
      '<div class="admin-form-grid">' +
      '<div class="admin-field"><span>Product name</span><input name="name" class="input" required value="' +
      escapeHtml(r.name || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Brand</span><input name="brand" class="input" value="' +
      escapeHtml(r.brand || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Category</span><select name="category" class="input">' +
      catOpts +
      "</select></div>" +
      '<div class="admin-field" style="grid-column:1/-1"><span>Description</span><textarea name="description" class="input">' +
      escapeHtml(r.description || "") +
      "</textarea></div>" +
      '<div class="admin-field"><span>Price (KD)</span><input name="price" type="number" step="0.01" min="0" class="input" required value="' +
      escapeHtml(r.price != null ? r.price : "") +
      '" /></div>' +
      '<div class="admin-field"><span>Image URL</span><input name="image" type="url" class="input" value="' +
      escapeHtml(r.image || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Badge / tag</span><input name="badge" class="input" placeholder="e.g. New, Sale" value="' +
      escapeHtml(r.badge || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Stock</span><input name="stock" type="number" min="0" step="1" class="input" required value="' +
      escapeHtml(r.stock != null ? r.stock : 0) +
      '" /></div>' +
      '<div class="admin-field"><span>Status</span><select name="status" class="input">' +
      '<option value="active"' +
      (st === "active" ? " selected" : "") +
      '>active</option><option value="inactive"' +
      (st === "inactive" ? " selected" : "") +
      ">inactive</option></select></div>" +
      '<div class="admin-field" style="grid-column:1/-1"><span>Search keywords (optional)</span><input name="searchable" class="input" value="' +
      escapeHtml(r.searchable || "") +
      '" placeholder="Extra words for site search" /></div></div>'
    );
  }

  function productFromForm(fd) {
    var name = fd.get("name");
    var brand = fd.get("brand") || "";
    var cat = fd.get("category") || "food";
    var desc = fd.get("description") || "";
    var extra = fd.get("searchable") || "";
    var autoSearch = [name, brand, cat, desc, extra].join(" ").trim();
    return {
      name: name,
      brand: brand,
      category: cat,
      description: desc,
      price: fd.get("price"),
      image: fd.get("image") || "images/shop-wild-coast.jpg",
      badge: fd.get("badge") || "",
      stock: fd.get("stock"),
      status: fd.get("status"),
      searchable: autoSearch,
    };
  }

  function refreshAll() {
    App.ensureSeedData();
    renderKpis();
    renderServices();
    renderMarketplace();
    renderShopKpis();
    renderShopTable();
    renderBookings();
    renderPets();
    renderMessages();
    renderEmergency();
    if (App.syncLegacyMirror) App.syncLegacyMirror();
  }

  function showView(id) {
    $all(".admin-view").forEach(function (v) {
      v.hidden = v.id !== "view-" + id;
    });
    $all(".admin-nav button").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-admin-view") === id);
    });
    var view = $("#view-" + id);
    var title = $("#admin-page-title");
    var desc = $("#admin-page-desc");
    if (view && title) title.textContent = view.getAttribute("data-title") || id;
    if (view && desc) desc.textContent = view.getAttribute("data-desc") || "";
    if (id === "shop") {
      renderShopKpis();
      renderShopTable();
    }
  }

  $all("[data-admin-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showView(btn.getAttribute("data-admin-view"));
    });
  });

  document.getElementById("admin-logout").addEventListener("click", function () {
    localStorage.removeItem(LS_LOGIN);
    window.location.href = adminLoginUrl();
  });

  /* ---- Service CRUD ---- */
  function serviceFields(r) {
    r = r || {};
    return (
      '<div class="admin-form-grid">' +
      '<div class="admin-field"><span>Title</span><input name="title" class="input" required value="' +
      escapeHtml(r.title || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Image URL</span><input name="image" type="url" class="input" value="' +
      escapeHtml(r.image || "") +
      '" /></div>' +
      '<div class="admin-field" style="grid-column:1/-1"><span>Description</span><textarea name="description" class="input">' +
      escapeHtml(r.description || "") +
      "</textarea></div>" +
      '<div class="admin-field"><span>Status</span><select name="status" class="input">' +
      '<option value="active"' +
      (r.status === "active" ? " selected" : "") +
      ">active</option>" +
      '<option value="inactive"' +
      (r.status === "inactive" ? " selected" : "") +
      ">inactive</option></select></div>" +
      '<div class="admin-field" style="grid-column:1/-1"><span>Search keywords</span><input name="searchable" class="input" value="' +
      escapeHtml(r.searchable || "") +
      '" placeholder="e.g. vet grooming" /></div></div>'
    );
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.getAttribute("data-action") === "add-service") {
      openModal("Add service", serviceFields(null), function (fd) {
        App.addItem("services", {
          title: fd.get("title"),
          description: fd.get("description"),
          image: fd.get("image") || "images/vet.jpg",
          status: fd.get("status"),
          searchable: fd.get("searchable") || "",
        });
        closeModal();
        refreshAll();
      });
    }
    var es = t.getAttribute("data-edit-service");
    if (es) {
      var s = App.getData("services").find(function (x) { return x.id === es; });
      if (!s) return;
      openModal("Edit service", serviceFields(s), function (fd) {
        App.updateItem("services", es, {
          title: fd.get("title"),
          description: fd.get("description"),
          image: fd.get("image"),
          status: fd.get("status"),
          searchable: fd.get("searchable"),
        });
        closeModal();
        refreshAll();
      });
    }
    var ds = t.getAttribute("data-del-service");
    if (ds && confirm("Delete this service?")) {
      App.deleteItem("services", ds);
      refreshAll();
    }

    /* Marketplace */
    if (t.getAttribute("data-action") === "add-listing") {
      openModal("Add listing", listingFields(null), function (fd) {
        App.addItem("marketplaceListings", listingFromForm(fd));
        closeModal();
        refreshAll();
      });
    }
    var eli = t.getAttribute("data-edit-listing");
    if (eli) {
      var L = App.getData("marketplaceListings").find(function (x) { return x.id === eli; });
      if (!L) return;
      openModal("Edit listing", listingFields(L), function (fd) {
        App.updateItem("marketplaceListings", eli, listingFromForm(fd));
        closeModal();
        refreshAll();
      });
    }
    var dli = t.getAttribute("data-del-listing");
    if (dli && confirm("Delete this listing?")) {
      App.deleteItem("marketplaceListings", dli);
      refreshAll();
    }

    /* Booking */
    var eb = t.getAttribute("data-edit-booking");
    if (eb) {
      var B = App.getData("bookings").find(function (x) { return x.id === eb; });
      if (!B) return;
      openModal("Edit booking", bookingFields(B), function (fd) {
        App.updateItem("bookings", eb, {
          service: fd.get("service"),
          date: fd.get("date"),
          time: fd.get("time"),
          petName: fd.get("petName"),
          petType: fd.get("petType"),
          ownerName: fd.get("ownerName"),
          phone: fd.get("phone"),
          notes: fd.get("notes"),
          status: fd.get("status"),
        });
        closeModal();
        refreshAll();
      });
    }
    var db = t.getAttribute("data-del-booking");
    if (db && confirm("Delete this booking?")) {
      App.deleteItem("bookings", db);
      refreshAll();
    }

    /* Pet */
    if (t.getAttribute("data-action") === "add-pet") {
      openModal("Add pet profile", petFields(null), function (fd) {
        App.addItem("petProfiles", petFromForm(fd));
        closeModal();
        refreshAll();
      });
    }
    var ep = t.getAttribute("data-edit-pet");
    if (ep) {
      var P = App.getData("petProfiles").find(function (x) { return x.id === ep; });
      if (!P) return;
      openModal("Edit pet profile", petFields(P), function (fd) {
        App.updateItem("petProfiles", ep, petFromForm(fd));
        closeModal();
        refreshAll();
      });
    }
    var dp = t.getAttribute("data-del-pet");
    if (dp && confirm("Delete this profile?")) {
      App.deleteItem("petProfiles", dp);
      refreshAll();
    }

    var dm = t.getAttribute("data-del-msg");
    if (dm && confirm("Delete this message?")) {
      App.deleteItem("contactMessages", dm);
      refreshAll();
    }

    var ee = t.getAttribute("data-edit-em");
    if (ee) {
      var E = App.getData("emergencyRequests").find(function (x) { return x.id === ee; });
      if (!E) return;
      openModal("Emergency request", emergencyFields(E), function (fd) {
        App.updateItem("emergencyRequests", ee, {
          issue: fd.get("issue"),
          location: fd.get("location"),
          phone: fd.get("phone"),
          status: fd.get("status"),
        });
        closeModal();
        refreshAll();
      });
    }
    var de = t.getAttribute("data-del-em");
    if (de && confirm("Delete this request?")) {
      App.deleteItem("emergencyRequests", de);
      refreshAll();
    }

    if (t.getAttribute("data-action") === "add-shop-product") {
      openModal("Add product", productFields(null), function (fd) {
        App.addItem("shopProducts", productFromForm(fd));
        console.log("[PetHubShop] admin add product");
        closeModal();
        refreshAll();
      });
    }
    var esh = t.getAttribute("data-edit-shop");
    if (esh) {
      var S = App.getData("shopProducts").find(function (x) {
        return String(x.id) === String(esh);
      });
      if (!S) return;
      openModal("Edit product", productFields(S), function (fd) {
        App.updateItem("shopProducts", esh, productFromForm(fd));
        console.log("[PetHubShop] admin edit product", esh);
        closeModal();
        refreshAll();
      });
    }
    var dsh = t.getAttribute("data-del-shop");
    if (dsh && confirm("Delete this product?")) {
      App.deleteItem("shopProducts", dsh);
      console.log("[PetHubShop] admin delete product", dsh);
      refreshAll();
    }
    var tog = t.getAttribute("data-shop-toggle");
    if (tog) {
      var row = App.getData("shopProducts").find(function (x) {
        return String(x.id) === String(tog);
      });
      if (!row) return;
      var next = String(row.status || "").toLowerCase() === "active" ? "inactive" : "active";
      App.updateItem("shopProducts", tog, { status: next });
      console.log("[PetHubShop] admin toggle status", tog, next);
      refreshAll();
    }
  });

  var shopCatFilterEl = $("#shop-admin-cat-filter");
  if (shopCatFilterEl) {
    shopCatFilterEl.addEventListener("change", function () {
      shopAdminCatFilter = shopCatFilterEl.value || "all";
      console.log("[PetHubShop] admin category filter", shopAdminCatFilter);
      renderShopTable();
    });
  }

  var adminMainEl = $("#admin-main");
  if (adminMainEl) {
    adminMainEl.addEventListener("change", function (e) {
      var sid = e.target.getAttribute && e.target.getAttribute("data-shop-stock-id");
      if (!sid) return;
      var n = parseInt(e.target.value, 10);
      if (isNaN(n) || n < 0) n = 0;
      App.updateItem("shopProducts", sid, { stock: n });
      console.log("[PetHubShop] admin stock field saved", sid, n);
      renderShopKpis();
    });
  }

  function listingFields(r) {
    r = r || {};
    return (
      '<div class="admin-form-grid">' +
      '<div class="admin-field"><span>Name</span><input name="name" required class="input" value="' +
      escapeHtml(r.name || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Type (dog/cat/bird)</span><input name="type" class="input" value="' +
      escapeHtml(r.type || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Age</span><input name="age" class="input" value="' +
      escapeHtml(r.age || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Gender</span><input name="gender" class="input" value="' +
      escapeHtml(r.gender || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Price</span><input name="price" class="input" value="' +
      escapeHtml(r.price || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Location</span><input name="location" class="input" value="' +
      escapeHtml(r.location || "") +
      '" /></div>' +
      '<div class="admin-field" style="grid-column:1/-1"><span>Image URL <span style="font-weight:400;color:var(--admin-muted)">(optional)</span></span><input name="image" type="text" class="input" inputmode="url" autocomplete="off" placeholder="https://… or images/…" value="' +
      escapeHtml(r.image || "") +
      '" /><p class="admin-field__hint" style="margin:0.35rem 0 0;font-size:0.8125rem;color:var(--admin-muted)">Leave empty to auto-assign an image based on pet type.</p></div>' +
      '<div class="admin-field"><span>Seller</span><input name="seller" class="input" value="' +
      escapeHtml(r.seller || "") +
      '" /></div>' +
      '<div class="admin-field" style="grid-column:1/-1"><span>Description</span><textarea name="description" class="input">' +
      escapeHtml(r.description || "") +
      "</textarea></div>" +
      '<div class="admin-field" style="grid-column:1/-1"><span>Search keywords</span><input name="searchable" class="input" value="' +
      escapeHtml(r.searchable || "") +
      '" /></div></div>'
    );
  }

  function listingFromForm(fd) {
    return {
      name: fd.get("name"),
      type: fd.get("type"),
      age: fd.get("age"),
      gender: fd.get("gender"),
      price: fd.get("price"),
      location: fd.get("location"),
      image: fd.get("image"),
      seller: fd.get("seller"),
      description: fd.get("description"),
      searchable: fd.get("searchable") || "",
    };
  }

  function bookingFields(r) {
    r = r || {};
    return (
      '<div class="admin-form-grid">' +
      '<div class="admin-field"><span>Service</span><input name="service" class="input" required value="' +
      escapeHtml(r.service || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Date</span><input name="date" type="date" class="input" required value="' +
      escapeHtml(r.date || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Time</span><input name="time" class="input" required value="' +
      escapeHtml(r.time || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Pet name</span><input name="petName" class="input" required value="' +
      escapeHtml(r.petName || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Pet type</span><input name="petType" class="input" value="' +
      escapeHtml(r.petType || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Owner</span><input name="ownerName" class="input" required value="' +
      escapeHtml(r.ownerName || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Phone</span><input name="phone" class="input" required value="' +
      escapeHtml(r.phone || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Status</span><select name="status" class="input">' +
      ["Pending", "Confirmed", "Cancelled"]
        .map(function (st) {
          return (
            '<option value="' +
            st +
            '"' +
            (r.status === st ? " selected" : "") +
            ">" +
            st +
            "</option>"
          );
        })
        .join("") +
      "</select></div>" +
      '<div class="admin-field" style="grid-column:1/-1"><span>Notes</span><textarea name="notes" class="input">' +
      escapeHtml(r.notes || "") +
      "</textarea></div></div>"
    );
  }

  function petFields(r) {
    r = r || {};
    return (
      '<div class="admin-form-grid">' +
      '<div class="admin-field"><span>Name</span><input name="name" class="input" required value="' +
      escapeHtml(r.name || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Type</span><input name="type" class="input" value="' +
      escapeHtml(r.type || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Breed</span><input name="breed" class="input" value="' +
      escapeHtml(r.breed || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Age</span><input name="age" class="input" value="' +
      escapeHtml(r.age || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Vaccination date</span><input name="vaccinationDate" type="date" class="input" value="' +
      escapeHtml(r.vaccinationDate || "") +
      '" /></div>' +
      '<div class="admin-field" style="grid-column:1/-1"><span>Notes</span><textarea name="notes" class="input">' +
      escapeHtml(r.notes || "") +
      "</textarea></div></div>"
    );
  }

  function petFromForm(fd) {
    return {
      name: fd.get("name"),
      type: fd.get("type"),
      breed: fd.get("breed"),
      age: fd.get("age"),
      vaccinationDate: fd.get("vaccinationDate"),
      notes: fd.get("notes"),
    };
  }

  function emergencyFields(r) {
    r = r || {};
    var selU = r.status === "urgent" ? " selected" : "";
    var selR = r.status === "resolved" ? " selected" : "";
    return (
      '<div class="admin-form-grid">' +
      '<div class="admin-field" style="grid-column:1/-1"><span>Issue</span><textarea name="issue" class="input" required>' +
      escapeHtml(r.issue || "") +
      "</textarea></div>" +
      '<div class="admin-field"><span>Location</span><input name="location" class="input" required value="' +
      escapeHtml(r.location || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Phone</span><input name="phone" class="input" required value="' +
      escapeHtml(r.phone || "") +
      '" /></div>' +
      '<div class="admin-field"><span>Status</span><select name="status" class="input">' +
      "<option value=\"urgent\"" +
      selU +
      ">urgent</option><option value=\"resolved\"" +
      selR +
      ">resolved</option></select></div></div>"
    );
  }

  refreshAll();
  showView("dashboard");
})();
