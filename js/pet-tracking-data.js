/**
 * PetHub — hard-coded demo data for pet transport tracking (no GPS / no backend).
 * Edit trips here; public page and admin monitor both read from PetTrackingDemo.
 */
(function (global) {
  "use strict";

  /** Canonical status keys used for filters and progress index */
  var STATUS = {
    BOOKING_CONFIRMED: "booking_confirmed",
    DRIVER_ASSIGNED: "driver_assigned",
    WAY_TO_PICKUP: "way_to_pickup",
    PET_PICKED_UP: "pet_picked_up",
    IN_TRANSIT: "in_transit",
    ARRIVING_SOON: "arriving_soon",
    DELIVERED: "delivered_safely",
    RETURNED_HOME: "returned_home",
  };

  var STATUS_ORDER = [
    STATUS.BOOKING_CONFIRMED,
    STATUS.DRIVER_ASSIGNED,
    STATUS.WAY_TO_PICKUP,
    STATUS.PET_PICKED_UP,
    STATUS.IN_TRANSIT,
    STATUS.ARRIVING_SOON,
    STATUS.DELIVERED,
    STATUS.RETURNED_HOME,
  ];

  var STATUS_LABELS = {};
  STATUS_LABELS[STATUS.BOOKING_CONFIRMED] = "Booking confirmed";
  STATUS_LABELS[STATUS.DRIVER_ASSIGNED] = "Driver assigned";
  STATUS_LABELS[STATUS.WAY_TO_PICKUP] = "On the way to pickup";
  STATUS_LABELS[STATUS.PET_PICKED_UP] = "Pet picked up";
  STATUS_LABELS[STATUS.IN_TRANSIT] = "In transit";
  STATUS_LABELS[STATUS.ARRIVING_SOON] = "Arriving soon";
  STATUS_LABELS[STATUS.DELIVERED] = "Delivered safely";
  STATUS_LABELS[STATUS.RETURNED_HOME] = "Returned home";

  function stepIndex(statusKey) {
    var i = STATUS_ORDER.indexOf(statusKey);
    return i === -1 ? 0 : i;
  }

  /** 3 showcase trips (also referenced in admin) */
  var publicTrips = [
    {
      trackingId: "PT-DEMO-001",
      bookingId: "bk-transport-2401",
      petName: "Luna",
      petType: "Dog",
      breed: "Golden Retriever",
      petImage:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&h=400&q=80",
      ownerName: "Sara Al-Mutairi",
      ownerPhone: "+965 5000 2201",
      serviceType: "Grooming pickup & return",
      assignedStaff: "Ahmed Al-Khaled",
      vehicle: "PetHub Van · KW-9042",
      pickupLocation: "Salmiya, Block 12 — Street 5",
      destination: "SilkPaw Grooming Center, Hawally",
      currentLocation: "Gulf Road — northbound near Marina",
      mapPosition: { x: 0.55, y: 0.42 },
      routeSvgPath: "M 40 180 Q 180 60 320 100 T 520 80",
      etaMinutes: 12,
      etaLabel: "12 min",
      status: STATUS.IN_TRANSIT,
      priority: "normal",
      lastUpdated: Date.now() - 120000,
      emergencyFlag: false,
      reassuringMessage: "Luna is safely on the way to the grooming center.",
      timeline: [
        { t: "09:00", label: "Booking confirmed", detail: "SilkPaw slot reserved" },
        { t: "09:18", label: "Driver assigned", detail: "Ahmed · Van KW-9042" },
        { t: "09:35", label: "On the way to pickup", detail: "En route to Salmiya" },
        { t: "09:52", label: "Pet picked up", detail: "Luna secured in climate crate" },
        { t: "10:05", label: "In transit", detail: "Rest stop completed — water break" },
      ],
      notes: ["Climate control locked at 22°C", "Rest stop completed at Arrayan"],
    },
    {
      trackingId: "PT-DEMO-002",
      bookingId: "bk-vet-8891",
      petName: "Milo",
      petType: "Cat",
      breed: "Persian",
      petImage:
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&h=400&q=80",
      ownerName: "Omar Fahad",
      ownerPhone: "+965 5000 8891",
      serviceType: "Vet transport — clinic appointment",
      assignedStaff: "Layla Hassan",
      vehicle: "PetHub Compact · KW-7711",
      pickupLocation: "Jabriya — home address on file",
      destination: "Kuwait Veterinary Hospital, Shuwaikh",
      currentLocation: "Ring road — approaching Shuwaikh industrial",
      mapPosition: { x: 0.72, y: 0.35 },
      routeSvgPath: "M 60 200 L 200 120 L 380 90 L 500 140",
      etaMinutes: 18,
      etaLabel: "18 min",
      status: STATUS.PET_PICKED_UP,
      priority: "normal",
      lastUpdated: Date.now() - 300000,
      emergencyFlag: false,
      reassuringMessage: "Milo was picked up successfully and is comfortable in the carrier.",
      timeline: [
        { t: "08:15", label: "Booking confirmed", detail: "Vet slot 10:30" },
        { t: "08:40", label: "Driver assigned", detail: "Layla · KW-7711" },
        { t: "09:10", label: "On the way to pickup", detail: "ETA 15 min" },
        { t: "09:28", label: "Pet picked up", detail: "Checked in at home — carrier secured" },
      ],
      notes: ["Carrier lined with familiar blanket", "Checked in at clinic reception (pending)"],
    },
    {
      trackingId: "PT-DEMO-003",
      bookingId: "bk-daycare-5510",
      petName: "Coco",
      petType: "Dog",
      breed: "Toy Poodle",
      petImage:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&h=400&q=80",
      ownerName: "Noura Salem",
      ownerPhone: "+965 5000 5510",
      serviceType: "Daycare return — home drop-off",
      assignedStaff: "Khalid Rahman",
      vehicle: "PetHub Van · KW-9042",
      pickupLocation: "Paws & Play Daycare, Mangaf",
      destination: "Fahaheel — owner residence",
      currentLocation: "Coastal road — southbound",
      mapPosition: { x: 0.38, y: 0.58 },
      routeSvgPath: "M 480 100 Q 300 160 120 200",
      etaMinutes: 9,
      etaLabel: "9 min",
      status: STATUS.ARRIVING_SOON,
      priority: "high",
      lastUpdated: Date.now() - 60000,
      emergencyFlag: false,
      reassuringMessage: "Coco is almost home — estimated arrival in 9 minutes.",
      timeline: [
        { t: "16:00", label: "Pet picked up from daycare", detail: "Play report: great mood" },
        { t: "16:12", label: "In transit", detail: "Southbound coastal route" },
        { t: "16:24", label: "Arriving soon", detail: "2 km from drop-off" },
      ],
      notes: ["Afternoon snack served at daycare", "Return route optimized for traffic"],
    },
  ];

  /** 8 admin rows — includes the 3 demos above plus 5 operational examples */
  var adminTrips = [
    publicTrips[0],
    publicTrips[1],
    publicTrips[2],
    {
      trackingId: "PT-ADM-004",
      bookingId: "bk-taxi-3320",
      petName: "Buddy",
      petType: "Dog",
      breed: "Siberian Husky",
      petImage:
        "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=400&h=400&q=80",
      ownerName: "Faisal Al-Awadhi",
      ownerPhone: "+965 5000 3320",
      serviceType: "Pet taxi — airport run",
      assignedStaff: "Yousef Nasser",
      vehicle: "PetHub XL · KW-2200",
      pickupLocation: "Mangaf — residential",
      destination: "Kuwait International Airport — Departures",
      currentLocation: "6th Ring Road — delay: roadworks",
      mapPosition: { x: 0.48, y: 0.5 },
      routeSvgPath: "M 80 160 L 240 100 L 420 130 L 520 90",
      etaMinutes: 34,
      etaLabel: "34 min",
      status: STATUS.IN_TRANSIT,
      priority: "normal",
      lastUpdated: Date.now() - 900000,
      emergencyFlag: false,
      reassuringMessage: "",
      delayed: true,
      timeline: [{ t: "11:02", label: "Delayed", detail: "Traffic on 6th Ring — +12 min" }],
      notes: ["Owner notified via SMS", "Large crate secured for husky"],
    },
    {
      trackingId: "PT-ADM-005",
      bookingId: "bk-emer-9001",
      petName: "Charlie",
      petType: "Dog",
      breed: "French Bulldog",
      petImage:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&h=400&q=80",
      ownerName: "Hessa Al-Sabah",
      ownerPhone: "+965 5000 9001",
      serviceType: "Emergency vet transport",
      assignedStaff: "Rapid Response · Unit 2",
      vehicle: "PetHub Emergency · KW-0007",
      pickupLocation: "Salmiya — caller location",
      destination: "Emergency Veterinary Center, Jabriya",
      currentLocation: "Gulf Street — priority corridor",
      mapPosition: { x: 0.65, y: 0.28 },
      routeSvgPath: "M 100 220 L 280 80 L 460 100",
      etaMinutes: 6,
      etaLabel: "6 min",
      status: STATUS.IN_TRANSIT,
      priority: "emergency",
      lastUpdated: Date.now() - 45000,
      emergencyFlag: true,
      reassuringMessage: "",
      timeline: [{ t: "14:18", label: "Emergency flagged", detail: "Dispatcher notified clinic" }],
      notes: ["Oxygen kit on board", "Owner in loop via app"],
    },
    {
      trackingId: "PT-ADM-006",
      bookingId: "bk-board-4412",
      petName: "Nala",
      petType: "Cat",
      breed: "Ragdoll",
      petImage:
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&h=400&q=80",
      ownerName: "Mariam Dashti",
      ownerPhone: "+965 5000 4412",
      serviceType: "Boarding pickup",
      assignedStaff: "Sara Al-Otaibi",
      vehicle: "PetHub Van · KW-8811",
      pickupLocation: "Owner home — Dasman",
      destination: "Royal Paws Boarding, Abdali",
      currentLocation: "Driver en route to pickup",
      mapPosition: { x: 0.25, y: 0.45 },
      routeSvgPath: "M 120 200 Q 260 100 400 120",
      etaMinutes: 22,
      etaLabel: "22 min",
      status: STATUS.DRIVER_ASSIGNED,
      priority: "normal",
      lastUpdated: Date.now() - 600000,
      emergencyFlag: false,
      reassuringMessage: "",
      timeline: [{ t: "07:00", label: "Driver assigned", detail: "Pickup window 07:30–08:00" }],
      notes: [],
    },
    {
      trackingId: "PT-ADM-007",
      bookingId: "bk-groom-7788",
      petName: "Oliver",
      petType: "Dog",
      breed: "Cocker Spaniel",
      petImage:
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&h=400&q=80",
      ownerName: "Khaled Yousef",
      ownerPhone: "+965 5000 7788",
      serviceType: "Grooming — return leg only",
      assignedStaff: "Ahmed Al-Khaled",
      vehicle: "PetHub Van · KW-9042",
      pickupLocation: "SilkPaw Grooming Center, Hawally",
      destination: "Bayan — owner home",
      currentLocation: "Trip completed",
      mapPosition: { x: 0.9, y: 0.85 },
      routeSvgPath: "M 500 60 L 400 180 L 200 200",
      etaMinutes: 0,
      etaLabel: "Delivered",
      status: STATUS.DELIVERED,
      priority: "low",
      lastUpdated: Date.now() - 7200000,
      emergencyFlag: false,
      reassuringMessage: "",
      timeline: [{ t: "13:45", label: "Delivered safely", detail: "Signature on tablet" }],
      notes: ["Grooming notes: ears cleaned, nails trimmed"],
    },
    {
      trackingId: "PT-ADM-008",
      bookingId: "bk-day-1022",
      petName: "Ruby",
      petType: "Dog",
      breed: "Dachshund",
      petImage:
        "https://images.unsplash.com/photo-1612536846252-2728d3e80329?auto=format&fit=crop&w=400&h=400&q=80",
      ownerName: "Abdullah Meshal",
      ownerPhone: "+965 5000 1022",
      serviceType: "Daycare morning pickup",
      assignedStaff: "Layla Hassan",
      vehicle: "PetHub Compact · KW-7711",
      pickupLocation: "Abdullah’s home — Abu Halifa",
      destination: "Paws & Play Daycare, Mangaf",
      currentLocation: "Approaching Abu Halifa block 3",
      mapPosition: { x: 0.32, y: 0.62 },
      routeSvgPath: "M 100 240 Q 220 140 360 100",
      etaMinutes: 8,
      etaLabel: "8 min",
      status: STATUS.WAY_TO_PICKUP,
      priority: "normal",
      lastUpdated: Date.now() - 180000,
      emergencyFlag: false,
      reassuringMessage: "",
      timeline: [{ t: "07:45", label: "On the way to pickup", detail: "First stop of route" }],
      notes: [],
    },
  ];

  function getPublicTrips() {
    return publicTrips.map(function (t) {
      return Object.assign({}, t, { progressStep: stepIndex(t.status) });
    });
  }

  function getAdminTrips() {
    return adminTrips.map(function (t) {
      return Object.assign({}, t, {
        progressStep: stepIndex(t.status),
        statusLabel: STATUS_LABELS[t.status] || t.status,
      });
    });
  }

  function getTripByTrackingId(id) {
    var all = adminTrips.concat();
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].trackingId) === String(id)) {
        var t = all[i];
        return Object.assign({}, t, {
          progressStep: stepIndex(t.status),
          statusLabel: STATUS_LABELS[t.status] || t.status,
        });
      }
    }
    return null;
  }

  global.PetTrackingDemo = {
    STATUS: STATUS,
    STATUS_ORDER: STATUS_ORDER,
    STATUS_LABELS: STATUS_LABELS,
    stepIndex: stepIndex,
    getPublicTrips: getPublicTrips,
    getAdminTrips: getAdminTrips,
    getTripByTrackingId: getTripByTrackingId,
    /** raw arrays for editors */
    _publicTrips: publicTrips,
    _adminTrips: adminTrips,
  };
})(typeof window !== "undefined" ? window : this);
