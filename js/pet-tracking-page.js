/**
 * PetHub — user-facing live pet tracking demo page (pet-tracking.html).
 */
(function () {
  "use strict";

  var Demo = window.PetTrackingDemo;
  if (!Demo) {
    console.warn("[PetTracking] PetTrackingDemo not loaded");
    return;
  }

  var STATUS_ORDER = Demo.STATUS_ORDER;
  var STATUS_LABELS = Demo.STATUS_LABELS;
  var selectedId = null;
  var tickTimer = null;

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  }

  function renderShowcase() {
    var trips = Demo.getPublicTrips();
    var host = $("ptr-showcase");
    if (!host) return;
    host.innerHTML = trips
      .map(function (t) {
        return (
          '<button type="button" class="ptr-card-pick" data-tracking-id="' +
          esc(t.trackingId) +
          '" aria-pressed="false">' +
          '<div class="ptr-card-pick__pet">' +
          '<img class="ptr-card-pick__img" src="' +
          esc(t.petImage) +
          '" width="64" height="64" alt="" loading="lazy" />' +
          "<div><p class=\"ptr-card-pick__name\">" +
          esc(t.petName) +
          "</p>" +
          '<p class="ptr-card-pick__meta">' +
          esc(t.breed) +
          " · " +
          esc(t.petType) +
          "</p></div></div>" +
          '<p class="ptr-card-pick__svc">' +
          esc(t.serviceType) +
          "</p>" +
          '<span class="ptr-status-badge ptr-status-badge--transit" style="margin-top:0.5rem;display:inline-block">' +
          esc(STATUS_LABELS[t.status] || t.status) +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    host.querySelectorAll("[data-tracking-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-tracking-id");
        selectTrip(id);
        host.querySelectorAll(".ptr-card-pick").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
      });
    });
  }

  function progressPercent(trip) {
    var idx = STATUS_ORDER.indexOf(trip.status);
    if (idx < 0) idx = 0;
    return Math.round(((idx + 0.5) / STATUS_ORDER.length) * 100);
  }

  function renderDetail(trip) {
    var root = $("ptr-detail");
    var empty = $("ptr-detail-empty");
    if (!root) return;
    if (!trip) {
      root.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    root.hidden = false;
    if (empty) empty.hidden = true;

    var pct = progressPercent(trip);
    var stepsHtml = STATUS_ORDER.map(function (key) {
      var done = STATUS_ORDER.indexOf(key) <= STATUS_ORDER.indexOf(trip.status);
      var cur = key === trip.status;
      var cls = "ptr-step" + (done ? " is-done" : "") + (cur ? " is-current" : "");
      return '<span class="' + cls + '">' + esc(STATUS_LABELS[key] || key) + "</span>";
    }).join("");

    var tl = trip.timeline || [];
    var tlHtml = tl
      .map(function (x) {
        return (
          '<div class="ptr-tl-item"><time>' +
          esc(x.t) +
          "</time><strong>" +
          esc(x.label) +
          "</strong><div>" +
          esc(x.detail || "") +
          "</div></div>"
        );
      })
      .join("");

    var mx = trip.mapPosition ? trip.mapPosition.x * 100 : 50;
    var my = trip.mapPosition ? trip.mapPosition.y * 100 : 50;
    var path = trip.routeSvgPath || "M 40 180 Q 200 40 480 100";

    root.innerHTML =
      '<div class="ptr-detail__grid">' +
      '<div class="ptr-map ptr-glow-card" aria-hidden="true" style="position:relative">' +
      '<div class="ptr-map__grid"></div>' +
      '<svg class="ptr-map__svg" viewBox="0 0 560 280" preserveAspectRatio="xMidYMid meet">' +
      "<defs>" +
      '<linearGradient id="ptr-route-grad" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="#06b6d4"/>' +
      '<stop offset="100%" stop-color="#3b82f6"/>' +
      "</linearGradient></defs>" +
      '<path class="ptr-map__route" d="' +
      esc(path) +
      '" />' +
      '<circle class="ptr-map__pin" cx="40" cy="180" r="10" fill="#10b981"/>' +
      '<circle class="ptr-map__pin" cx="520" cy="80" r="10" fill="#3b82f6"/>' +
      "</svg>" +
      '<div class="ptr-map__vehicle" style="left:' +
      mx +
      "%;top:" +
      my +
      '%;position:absolute;transform:translate(-50%,-50%);width:22px;height:22px;border-radius:50%;background:radial-gradient(circle,#22d3ee 0%,#0891b2 100%);pointer-events:none"></div>' +
      '<div class="ptr-map__label"><span>Pickup · ' +
      esc(trip.pickupLocation) +
      "</span><span>Live · " +
      esc(trip.currentLocation) +
      "</span><span>Drop-off · " +
      esc(trip.destination) +
      "</span></div></div>" +
      '<div><div class="ptr-glow-card">' +
      '<p class="ptr-reassure">' +
      esc(trip.reassuringMessage || STATUS_LABELS[trip.status] || "") +
      "</p>" +
      '<p><span class="ptr-live-dot"></span><span id="ptr-live-label">Live demo · updated just now</span></p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin:0.75rem 0">' +
      '<span class="ptr-status-badge">' +
      esc(STATUS_LABELS[trip.status] || trip.status) +
      "</span>" +
      "<span style=\"color:var(--muted);font-size:0.875rem\">ETA · <strong id=\"ptr-eta\">" +
      esc(trip.etaLabel || "—") +
      "</strong></span></div>" +
      '<div class="ptr-meta-grid">' +
      '<div class="ptr-meta-item"><span>Pet</span>' +
      esc(trip.petName) +
      "</div>" +
      '<div class="ptr-meta-item"><span>Handler</span>' +
      esc(trip.assignedStaff) +
      "</div>" +
      '<div class="ptr-meta-item"><span>Vehicle</span>' +
      esc(trip.vehicle) +
      "</div>" +
      '<div class="ptr-meta-item"><span>Booking</span>' +
      esc(trip.bookingId) +
      "</div></div>" +
      '<div class="ptr-progress"><div class="ptr-progress__track"><div class="ptr-progress__fill" style="width:' +
      pct +
      '%"></div></div><div class="ptr-steps">' +
      stepsHtml +
      "</div></div>" +
      '<div class="ptr-timeline">' +
      tlHtml +
      "</div>" +
      (trip.notes && trip.notes.length
        ? '<p style="font-size:0.8125rem;color:var(--muted);margin-top:0.75rem"><strong>Notes:</strong> ' +
          esc(trip.notes.join(" · ")) +
          "</p>"
        : "") +
      '<div class="ptr-actions">' +
      '<a href="tel:+96500000000" class="btn btn--primary btn--sm">Emergency hotline</a>' +
      '<button type="button" class="btn btn--outline btn--sm" data-open-chat>PetHub Support</button>' +
      "</div></div></div></div>";

    var launch = document.getElementById("chat-launcher");
    var openChatBtn = root.querySelector("[data-open-chat]");
    if (openChatBtn && launch) {
      openChatBtn.addEventListener("click", function () {
        launch.click();
      });
    }
  }

  function selectTrip(id) {
    selectedId = id;
    var trip = Demo.getTripByTrackingId(id);
    renderDetail(trip);
    if (typeof history !== "undefined" && history.replaceState) {
      history.replaceState(null, "", "pet-tracking.html?trip=" + encodeURIComponent(id));
    }
  }

  function startLiveDemoClock() {
    if (tickTimer) clearInterval(tickTimer);
    var n = 0;
    tickTimer = setInterval(function () {
      n += 1;
      var el = $("ptr-live-label");
      var eta = $("ptr-eta");
      if (el) {
        el.textContent =
          "Live demo · refresh simulated (" + (n % 12) + "s cycle) · not real GPS";
      }
      if (eta && selectedId) {
        var t = Demo.getTripByTrackingId(selectedId);
        if (t && t.etaMinutes != null) {
          var jitter = (n % 3) - 1;
          var m = Math.max(0, t.etaMinutes + jitter);
          eta.textContent = m + " min (demo)";
        }
      }
    }, 4000);
  }

  function initFromQuery() {
    var q = new URLSearchParams(window.location.search).get("trip");
    if (q) {
      selectTrip(q);
      var btn = document.querySelector('[data-tracking-id="' + q + '"]');
      if (btn) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderShowcase();
    initFromQuery();
    startLiveDemoClock();
    console.log("[PetTracking] demo page ready", Demo.getPublicTrips().length, "showcase trips");
  });
})();
