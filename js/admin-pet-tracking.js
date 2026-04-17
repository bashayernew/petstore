/**
 * PetHub admin — Live animal transport monitor (hard-coded demo from PetTrackingDemo).
 */
(function () {
  "use strict";

  var Demo = window.PetTrackingDemo;
  var ST = (window.PetTrackingDemo && window.PetTrackingDemo.STATUS) || {};
  var filterActive = "all";
  var searchQ = "";
  var selectedTrip = null;

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  }

  function tripMatchesFilter(t) {
    if (filterActive === "all") return true;
    if (filterActive === "emergency") return t.emergencyFlag;
    if (filterActive === "delayed") return t.delayed;
    if (filterActive === "assigned") return t.status === ST.DRIVER_ASSIGNED;
    if (filterActive === "picked_up") return t.status === ST.PET_PICKED_UP;
    if (filterActive === "in_transit") return t.status === ST.IN_TRANSIT;
    if (filterActive === "delivered")
      return t.status === ST.DELIVERED || t.status === ST.RETURNED_HOME;
    return true;
  }

  function tripMatchesSearch(t) {
    if (!searchQ) return true;
    var q = searchQ.toLowerCase();
    return (
      String(t.trackingId || "")
        .toLowerCase()
        .indexOf(q) !== -1 ||
      String(t.petName || "")
        .toLowerCase()
        .indexOf(q) !== -1 ||
      String(t.ownerName || "")
        .toLowerCase()
        .indexOf(q) !== -1 ||
      String(t.serviceType || "")
        .toLowerCase()
        .indexOf(q) !== -1
    );
  }

  function computeKpis(trips) {
    var inTransit = 0;
    var delivered = 0;
    var delayed = 0;
    var emerg = 0;
    var active = 0;
    trips.forEach(function (t) {
      if (t.emergencyFlag) emerg++;
      if (t.delayed) delayed++;
      if (t.status === ST.IN_TRANSIT) inTransit++;
      if (t.status === ST.DELIVERED || t.status === ST.RETURNED_HOME) delivered++;
      if (t.status !== ST.DELIVERED && t.status !== ST.RETURNED_HOME) active++;
    });
    return { active: active, inTransit: inTransit, delivered: delivered, delayed: delayed, emerg: emerg };
  }

  function renderKpis(trips) {
    var k = computeKpis(trips);
    var el = $("apt-ptrack-kpis");
    if (!el) return;
    el.innerHTML =
      '<div class="apt-kpi"><p class="apt-kpi__label">Active trips</p><p class="apt-kpi__value">' +
      k.active +
      '</p></div><div class="apt-kpi"><p class="apt-kpi__label">In transit</p><p class="apt-kpi__value">' +
      k.inTransit +
      '</p></div><div class="apt-kpi"><p class="apt-kpi__label">Delivered</p><p class="apt-kpi__value">' +
      k.delivered +
      '</p></div><div class="apt-kpi"><p class="apt-kpi__label">Delayed</p><p class="apt-kpi__value">' +
      k.delayed +
      '</p></div><div class="apt-kpi"><p class="apt-kpi__label">Emergency</p><p class="apt-kpi__value">' +
      k.emerg +
      "</p></div>";
  }

  function renderEmergencyBanner(trips) {
    var bar = $("apt-ptrack-emergency");
    if (!bar) return;
    var list = trips.filter(function (t) {
      return t.emergencyFlag;
    });
    if (!list.length) {
      bar.innerHTML = "";
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    bar.innerHTML =
      '<strong>Emergency</strong> — ' +
      list.length +
      " active flagged trip(s): " +
      list
        .map(function (t) {
          return esc(t.trackingId) + " (" + esc(t.petName) + ")";
        })
        .join(" · ");
  }

  function renderTable() {
    var tb = $("table-pet-tracking");
    if (!tb || !window.PetTrackingDemo) return;
    var trips = window.PetTrackingDemo.getAdminTrips().filter(tripMatchesFilter).filter(tripMatchesSearch);
    var body = tb.querySelector("tbody");
    if (!body) return;
    body.innerHTML = trips
      .map(function (t) {
        var sl = Demo.STATUS_LABELS[t.status] || t.status;
        var rowCls = t.emergencyFlag ? " apt-row-emergency" : t.delayed ? " apt-row-delayed" : "";
        var pri = t.priority || "normal";
        return (
          "<tr class=\"" +
          rowCls.trim() +
          "\" data-ptrack-open=\"" +
          esc(t.trackingId) +
          "\" style=\"cursor:pointer\">" +
          "<td><strong>" +
          esc(t.trackingId) +
          "</strong></td>" +
          "<td>" +
          esc(t.petName) +
          "</td>" +
          "<td>" +
          esc(t.ownerName) +
          "</td>" +
          "<td>" +
          esc(t.serviceType) +
          "</td>" +
          "<td>" +
          esc(t.assignedStaff) +
          "</td>" +
          "<td style=\"max-width:140px;font-size:0.8125rem\">" +
          esc(t.currentLocation) +
          "</td>" +
          "<td style=\"max-width:120px;font-size:0.8125rem\">" +
          esc(t.destination) +
          "</td>" +
          "<td>" +
          esc(sl) +
          "</td>" +
          "<td>" +
          esc(t.etaLabel || "—") +
          "</td>" +
          "<td>" +
          esc(pri) +
          "</td>" +
          "<td style=\"font-size:0.8125rem\">" +
          esc(new Date(t.lastUpdated || Date.now()).toLocaleTimeString()) +
          "</td></tr>"
        );
      })
      .join("");
  }

  function openDetail(id) {
    selectedTrip = window.PetTrackingDemo.getTripByTrackingId(id);
    var modal = $("admin-ptrack-modal");
    var body = $("admin-ptrack-modal-body");
    if (!modal || !body || !selectedTrip) return;
    var t = selectedTrip;
    var sl =
      (window.PetTrackingDemo && window.PetTrackingDemo.STATUS_LABELS[t.status]) || t.status;
    var mx = t.mapPosition ? t.mapPosition.x * 100 : 50;
    var my = t.mapPosition ? t.mapPosition.y * 100 : 50;
    var tl = (t.timeline || [])
      .map(function (x) {
        return "<li><strong>" + esc(x.t) + "</strong> — " + esc(x.label) + " — " + esc(x.detail || "") + "</li>";
      })
      .join("");
    body.innerHTML =
      '<div class="admin-form-grid" style="max-width:720px">' +
      '<div class="admin-field"><span>Tracking ID</span><p style="margin:0.25rem 0 0">' +
      esc(t.trackingId) +
      "</p></div>" +
      '<div class="admin-field"><span>Status</span><p style="margin:0.25rem 0 0">' +
      esc(sl) +
      "</p></div>" +
      '<div class="admin-field"><span>Pet</span><p style="margin:0.25rem 0 0">' +
      esc(t.petName) +
      " · " +
      esc(t.breed) +
      "</p></div>" +
      '<div class="admin-field"><span>Owner</span><p style="margin:0.25rem 0 0">' +
      esc(t.ownerName) +
      " · " +
      esc(t.ownerPhone) +
      "</p></div>" +
      '<div class="admin-field" style="grid-column:1/-1"><span>Service</span><p style="margin:0.25rem 0 0">' +
      esc(t.serviceType) +
      " · Booking " +
      esc(t.bookingId) +
      "</p></div>" +
      '<div class="admin-field" style="grid-column:1/-1"><span>Route</span><p style="margin:0.25rem 0 0">' +
      esc(t.pickupLocation) +
      " → " +
      esc(t.destination) +
      "</p></div>" +
      '<div class="apt-modal-map"><div class="apt-modal-map__dot" style="left:' +
      mx +
      "%;top:" +
      my +
      '%"></div></div>' +
      '<div class="admin-field" style="grid-column:1/-1"><span>Timeline</span><ul style="margin:0.35rem 0 0;padding-left:1.1rem;font-size:0.875rem">' +
      tl +
      "</ul></div>" +
      '<div class="admin-field" style="grid-column:1/-1"><span>Notes</span><p style="margin:0.25rem 0 0;font-size:0.875rem">' +
      esc((t.notes || []).join(" · ") || "—") +
      "</p></div>" +
      '<div class="apt-actions-row">' +
      '<button type="button" class="btn-admin btn-admin--primary btn-admin--sm" data-ptrack-action="picked">Mark picked up</button>' +
      '<button type="button" class="btn-admin btn-admin--primary btn-admin--sm" data-ptrack-action="transit">Mark in transit</button>' +
      '<button type="button" class="btn-admin btn-admin--primary btn-admin--sm" data-ptrack-action="delivered">Mark delivered</button>' +
      '<button type="button" class="btn-admin btn-admin--danger btn-admin--sm" data-ptrack-action="emergency">Flag emergency</button>' +
      '<a class="btn-admin btn-admin--ghost btn-admin--sm" href="tel:' +
      esc(String(t.ownerPhone || "").replace(/\s/g, "")) +
      '">Contact owner</a>' +
      "</div></div>";
    modal.hidden = false;
    console.log("[PetHubAdmin] pet tracking detail", id);
  }

  function closeDetail() {
    var modal = $("admin-ptrack-modal");
    if (modal) modal.hidden = true;
    selectedTrip = null;
  }

  function renderAll() {
    Demo = window.PetTrackingDemo;
    if (!Demo) {
      console.warn("[PetHubAdmin] PetTrackingDemo missing — load pet-tracking-data.js first.");
      return;
    }
    ST = Demo.STATUS || {};
    var trips = Demo.getAdminTrips();
    renderKpis(trips);
    renderEmergencyBanner(trips);
    renderTable();
    console.log("[PetHubAdmin] pet tracking monitor loaded", trips.length, "trips");
  }

  function tick() {
    var el = $("apt-ptrack-live-clock");
    if (el) {
      el.textContent = "Demo clock · " + new Date().toLocaleTimeString();
    }
  }

  document.addEventListener("click", function (e) {
    var openEl = e.target.closest && e.target.closest("[data-ptrack-open]");
    var open = openEl && openEl.getAttribute("data-ptrack-open");
    if (open) {
      e.preventDefault();
      openDetail(open);
      return;
    }
    if (e.target.getAttribute && e.target.getAttribute("data-ptrack-close") !== null) {
      closeDetail();
      return;
    }
    var act = e.target.getAttribute && e.target.getAttribute("data-ptrack-action");
    if (act && selectedTrip) {
      alert("Demo only — status actions are simulated. In production this would update " + selectedTrip.trackingId + ".");
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    var modal = $("admin-ptrack-modal");
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeDetail();
      });
    }
    var filters = document.getElementById("apt-ptrack-filters");
    if (filters) {
      filters.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-ptrack-filter]");
        if (!btn) return;
        filterActive = btn.getAttribute("data-ptrack-filter") || "all";
        filters.querySelectorAll("[data-ptrack-filter]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        renderTable();
      });
    }
    var search = $("apt-ptrack-search");
    if (search) {
      search.addEventListener("input", function () {
        searchQ = search.value.trim();
        renderTable();
      });
    }
    setInterval(tick, 3000);
    tick();
  });

  window.renderAdminPetTracking = renderAll;
})();
