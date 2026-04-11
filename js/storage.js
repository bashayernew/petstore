/**
 * PetHub — single localStorage source of truth (ROOT_KEY).
 * Keys include services, marketplaceListings, bookings, petProfiles, contactMessages, emergencyRequests,
 * shopProducts, supportMessages, marketplaceInquiries, shopOrders, shopCart.
 * Legacy pethub_demo_v1 holds user + saved listings (see pethub.js); cart/orders sync to ROOT shopCart/shopOrders.
 */
(function (global) {
  "use strict";

  var ROOT_KEY = "pethub_app_v1";
  var LEGACY_KEY = "pethub_demo_v1";

  var KEYS = [
    "services",
    "marketplaceListings",
    "bookings",
    "petProfiles",
    "contactMessages",
    "emergencyRequests",
    "shopProducts",
    "supportMessages",
    "marketplaceInquiries",
    "shopOrders",
    "shopCart",
  ];

  /**
   * Bundled marketplace listing photos (paths relative to site root; same files as services/shop demos).
   * Used when a new listing is saved without a usable image URL.
   */
  var MARKETPLACE_PET_IMAGES = {
    dog: [
      "images/dogwalk.jpg",
      "images/shop-orbit-chew.jpg",
      "images/shop-cloudnest.jpg",
      "images/shop-traintime.jpg",
      "images/shop-traillite.jpg",
    ],
    cat: [
      "images/shop-whiskerbay.jpg",
      "images/shop-nimbuswand.jpg",
      "images/shop-furlogic.jpg",
      "images/shop-silkpaw.jpg",
    ],
    bird: [
      "images/shop-nimbuswand.jpg",
      "images/transport.jpg",
      "images/pet-grooming.png",
    ],
  };

  var MARKETPLACE_IMAGE_FALLBACK_LIST = [
    "images/dogwalk.jpg",
    "images/vet.jpg",
    "images/pet-grooming.png",
    "images/shop-wild-coast.jpg",
  ];

  var MARKETPLACE_IMAGE_DEFAULT = "images/dogwalk.jpg";

  function pickRandomFrom(arr) {
    var a = arr && arr.length ? arr : [MARKETPLACE_IMAGE_DEFAULT];
    return a[Math.floor(Math.random() * a.length)];
  }

  function normalizeMarketplacePetTypeKey(t) {
    var s = String(t || "")
      .trim()
      .toLowerCase();
    if (s === "dog" || s === "dogs") return "dog";
    if (s === "cat" || s === "cats") return "cat";
    if (s === "bird" || s === "birds" || s === "avian") return "bird";
    return "";
  }

  function getPoolArrayForType(petType) {
    var key = normalizeMarketplacePetTypeKey(petType);
    if (key && MARKETPLACE_PET_IMAGES[key] && MARKETPLACE_PET_IMAGES[key].length) {
      return MARKETPLACE_PET_IMAGES[key];
    }
    return MARKETPLACE_IMAGE_FALLBACK_LIST;
  }

  function getRandomMarketplaceImage(petType) {
    return pickRandomFrom(getPoolArrayForType(petType));
  }

  function hashStringStable(s) {
    var h = 2166136261 >>> 0;
    s = String(s || "");
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /**
   * URL for UI: stored image if valid; otherwise a stable fallback from bundled assets (does not mutate storage).
   */
  function resolveMarketplaceListingImage(row) {
    if (row && isValidListingImageSource(row.image)) {
      return String(row.image).trim();
    }
    var pool = getPoolArrayForType(row && row.type);
    var list = pool && pool.length ? pool : [MARKETPLACE_IMAGE_DEFAULT];
    var id = row && row.id != null ? String(row.id) : "unknown";
    var idx = hashStringStable(id) % list.length;
    return list[idx];
  }

  function isValidListingImageSource(s) {
    s = String(s || "").trim();
    if (!s) return false;
    if (/^javascript:/i.test(s) || /^data:/i.test(s) || /\s/.test(s)) return false;
    if (/^https?:\/\//i.test(s)) {
      try {
        var u = new URL(s);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch (e) {
        return false;
      }
    }
    if (/^\/\//.test(s)) {
      try {
        new URL("https:" + s);
        return true;
      } catch (e2) {
        return false;
      }
    }
    if (/^(?:\.\.\/|\.\/|\/|images\/|assets\/|imges\/)/i.test(s)) return true;
    return false;
  }

  /** Only for new rows (addItem). Existing listings are never modified here. */
  function ensureMarketplaceImageOnCreate(row) {
    if (!row || typeof row !== "object") return row;
    var img = row.image;
    if (!isValidListingImageSource(img)) {
      row.image = getRandomMarketplaceImage(row.type);
    } else {
      row.image = String(img).trim();
    }
    return row;
  }

  function log() {
    if (typeof console !== "undefined" && console.log) {
      console.log.apply(console, ["[PetHubStorage]"].concat([].slice.call(arguments)));
    }
  }

  function uid() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }
    return "ph_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 11);
  }

  function defaultDemoData() {
    return {
      services: [
        {
          id: "svc-vet",
          title: "Veterinary Care",
          description:
            "Book clinics and home visits, share records, and get follow-ups without the phone tag.",
          image: "images/vet.jpg",
          status: "active",
          searchable: "veterinary vet clinic health",
        },
        {
          id: "svc-groom",
          title: "Pet Grooming",
          description:
            "Spa days, trims, and nail care from salons that treat your pet like family.",
          image: "images/pet-grooming.png",
          status: "active",
          searchable: "grooming spa bath",
        },
        {
          id: "svc-walk",
          title: "Dog Walking",
          description:
            "Reliable walkers with live GPS routes so you always know they’re safe.",
          image: "images/dogwalk.jpg",
          status: "active",
          searchable: "dog walking walker exercise",
        },
        {
          id: "svc-transport",
          title: "Pet Transportation",
          description:
            "Climate-controlled rides for vet trips, relocations, and airport runs.",
          image: "images/transport.jpg",
          status: "active",
          searchable: "transport taxi pet taxi ride",
        },
        {
          id: "svc-emergency",
          title: "Emergency Vet",
          description:
            "One tap to surface urgent help and share your pet’s location with responders.",
          image: "images/emergency.jpg",
          status: "active",
          searchable: "emergency vet urgent",
        },
        {
          id: "svc-vax",
          title: "Vaccination Reminder",
          description:
            "Smart notifications so boosters and annual shots never slip through the cracks.",
          image: "images/vexination.jpg",
          status: "active",
          searchable: "vaccination reminder vaccine",
        },
      ],
      marketplaceListings: [
        {
          id: "lst-golden",
          name: "Golden Retriever",
          type: "dog",
          age: "10 weeks",
          gender: "Male",
          price: "380 KD",
          location: "Jabriya",
          image:
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&h=600&q=80",
          seller: "Ahmad Pet Home",
          description:
            "Champion bloodline puppy, first vaccines done, microchipped. Parents on-site visit welcome in Jabriya.",
          searchable: "golden retriever puppy dog",
        },
        {
          id: "lst-persian",
          name: "Persian",
          type: "cat",
          age: "4 months",
          gender: "Female",
          price: "220 KD",
          location: "Salwa",
          image:
            "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&h=600&q=80",
          seller: "Feline Friends KW",
          description:
            "Fluffy female Persian, litter trained, calm temperament — ideal for apartments.",
          searchable: "persian cat kitten",
        },
        {
          id: "lst-husky",
          name: "Siberian Husky",
          type: "dog",
          age: "6 months",
          gender: "Male",
          price: "450 KD",
          location: "Mangaf",
          image:
            "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=800&h=600&q=80",
          seller: "Northern Paws",
          description:
            "Energetic husky with blue eyes, leash & crate trained. Needs active owner.",
          searchable: "husky dog",
        },
        {
          id: "lst-bird",
          name: "Cockatiel",
          type: "bird",
          age: "1 year",
          gender: "Pair",
          price: "85 KD",
          location: "Fahaheel",
          image:
            "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&h=600&q=80",
          seller: "Aviary Bay",
          description: "Friendly pair with cage & starter supplies included.",
          searchable: "cockatiel bird",
        },
        {
          id: "lst-french",
          name: "French Bulldog",
          type: "dog",
          age: "12 weeks",
          gender: "Female",
          price: "295 KD",
          location: "Salmiya",
          image:
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&h=600&q=80",
          seller: "Coastal Pups KW",
          description:
            "Playful fawn female, vet-checked, first shots done. Parents’ photos available; meet-up in Salmiya.",
          searchable: "french bulldog puppy dog",
        },
        {
          id: "lst-ragdoll",
          name: "Ragdoll",
          type: "cat",
          age: "5 months",
          gender: "Male",
          price: "340 KD",
          location: "Dasman",
          image:
            "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&h=600&q=80",
          seller: "Royal Whiskers",
          description:
            "Blue-point Ragdoll, relaxed personality, neuter scheduled. Litter trained; delivery across Kuwait City negotiable.",
          searchable: "ragdoll cat kitten",
        },
      ],
      bookings: [
        {
          id: "ph_demo_book_1",
          service: "Pet Grooming",
          date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
          time: "2:00 PM",
          petName: "Luna",
          petType: "Dog",
          ownerName: "Demo User",
          phone: "+965 5000 0000",
          notes: "Sensitive skin — hypoallergenic shampoo only.",
          status: "Confirmed",
          createdAt: Date.now() - 86400000,
        },
        {
          id: "ph_demo_book_2",
          service: "Veterinary Care",
          date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
          time: "11:30 AM",
          petName: "Milo",
          petType: "Cat",
          ownerName: "Demo User",
          phone: "+965 5000 0000",
          notes: "",
          status: "Pending",
          createdAt: Date.now() - 86400000 * 4,
        },
      ],
      petProfiles: [
        {
          id: "ph_demo_pet_1",
          name: "Luna",
          type: "Dog",
          breed: "Golden mix",
          age: "3 years",
          vaccinationDate: new Date(Date.now() + 86400000 * 20).toISOString().slice(0, 10),
          notes: "Allergic to chicken-based kibble.",
        },
      ],
      contactMessages: [
        {
          id: "msg_demo_1",
          name: "Sara",
          email: "sara@example.com",
          topic: "General question",
          message: "Do you offer home visits in Ahmadi?",
          createdAt: Date.now() - 86400000 * 2,
        },
      ],
      emergencyRequests: [
        {
          id: "em_demo_1",
          issue: "Dog ate chocolate — need urgent advice",
          location: "Salmiya",
          phone: "+965 5000 1111",
          status: "urgent",
          createdAt: Date.now() - 3600000,
        },
      ],
      shopProducts: [
        {
          id: "p-food-1",
          name: "Wild Coast · Adult formula",
          brand: "Wild Coast",
          category: "food",
          description: "Grain-friendly nutrition for active dogs — 12kg.",
          price: 24.5,
          image: "images/shop-wild-coast.jpg",
          badge: "Bestseller",
          stock: 48,
          status: "active",
          searchable: "food nutrition kibble dry dog",
        },
        {
          id: "p-toy-1",
          name: "OrbitChew · Dental ring",
          brand: "OrbitChew",
          category: "toys",
          description: "Durable rubber with treat pockets — medium.",
          price: 6.9,
          image: "images/shop-orbit-chew.jpg",
          badge: "",
          stock: 120,
          status: "active",
          searchable: "toy chew rubber ring dental",
        },
        {
          id: "p-groom-1",
          name: "SilkPaw · Sensitive shampoo",
          brand: "SilkPaw",
          category: "grooming",
          description: "Hypoallergenic coat care — cats & dogs.",
          price: 8.25,
          image: "images/shop-silkpaw.jpg",
          badge: "Sensitive",
          stock: 35,
          status: "active",
          searchable: "shampoo grooming bath bottle",
        },
        {
          id: "p-bed-1",
          name: "CloudNest · Ortho bed",
          brand: "CloudNest",
          category: "beds",
          description: "Cooling gel memory foam — large breed.",
          price: 42,
          image: "images/shop-cloudnest.jpg",
          badge: "",
          stock: 12,
          status: "active",
          searchable: "bed sleep cushion dog",
        },
        {
          id: "p-carrier-1",
          name: "AeroPet · Cabin carrier",
          brand: "AeroPet",
          category: "carriers",
          description: "IATA-friendly shell with airflow windows.",
          price: 55,
          image: "images/shop-aeropet.jpg",
          badge: "Travel",
          stock: 8,
          status: "active",
          searchable: "carrier travel crate airline",
        },
        {
          id: "p-acc-1",
          name: "TrailLite · LED harness set",
          brand: "TrailLite",
          category: "accessories",
          description: "Reflective, rechargeable — evening walks.",
          price: 18,
          image: "images/shop-traillite.jpg",
          badge: "",
          stock: 64,
          status: "active",
          searchable: "leash harness walk reflective accessories",
        },
        {
          id: "p-food-2",
          name: "WhiskerBay · Salmon pâté",
          brand: "WhiskerBay",
          category: "food",
          description: "Grain-free trays for adult cats — 12 × 85g.",
          price: 11.5,
          image: "images/shop-whiskerbay.jpg",
          badge: "Cats",
          stock: 0,
          status: "active",
          searchable: "cat wet food salmon pâté",
        },
        {
          id: "p-food-3",
          name: "TrainTime · Soft training treats",
          brand: "TrainTime",
          category: "food",
          description: "Low-calorie bites — resealable 300g pouch.",
          price: 4.75,
          image: "images/shop-traintime.jpg",
          badge: "",
          stock: 200,
          status: "active",
          searchable: "treats training reward snack dog",
        },
        {
          id: "p-toy-2",
          name: "NimbusWand · Feather teaser",
          brand: "NimbusWand",
          category: "toys",
          description: "Extendable wand with replaceable feathers.",
          price: 5.5,
          image: "images/shop-nimbuswand.jpg",
          badge: "New",
          stock: 75,
          status: "active",
          searchable: "cat toy wand feather chase",
        },
        {
          id: "p-groom-2",
          name: "FurLogic · Slicker brush",
          brand: "FurLogic",
          category: "grooming",
          description: "Fine pins with comfort tips — medium coat.",
          price: 7.9,
          image: "images/shop-furlogic.jpg",
          badge: "",
          stock: 42,
          status: "active",
          searchable: "brush slicker coat deshedding",
        },
        {
          id: "p-acc-2",
          name: "TidyStrap · Bag dispenser",
          brand: "TidyStrap",
          category: "accessories",
          description: "Clip-on dispenser + 120 compostable rolls.",
          price: 3.25,
          image: "images/shop-tidystrap.jpg",
          badge: "",
          stock: 150,
          status: "active",
          searchable: "poop bags waste dispenser walk",
        },
        {
          id: "p-acc-3",
          name: "PureFlow · Ceramic fountain",
          brand: "PureFlow",
          category: "accessories",
          description: "2L quiet pump, charcoal filter — dishwasher safe top.",
          price: 32,
          image: "images/shop-pureflow.jpg",
          badge: "Hydration",
          stock: 22,
          status: "inactive",
          searchable: "fountain water bowl cat dog drink",
        },
      ],
    };
  }

  function emptyShell() {
    var o = {};
    KEYS.forEach(function (k) {
      o[k] = [];
    });
    return o;
  }

  function deepCopy(a) {
    return JSON.parse(JSON.stringify(a));
  }

  function loadRoot() {
    try {
      var raw = localStorage.getItem(ROOT_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch (e) {
      log("loadRoot parse error", e);
      return null;
    }
  }

  function saveRoot(data) {
    try {
      localStorage.setItem(ROOT_KEY, JSON.stringify(data));
      log("saveRoot OK, bytes ~", JSON.stringify(data).length);
    } catch (e) {
      log("saveRoot error", e);
    }
  }

  /** Copy bookings/pets from legacy file into root before demo seed (first install only). */
  function migrateLegacyIntoShell(root) {
    try {
      var raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return root;
      var o = JSON.parse(raw);
      if (!o || typeof o !== "object") return root;

      if (Array.isArray(o.bookings) && o.bookings.length && (!root.bookings || !root.bookings.length)) {
        root.bookings = deepCopy(o.bookings);
        log("migrateLegacy: bookings copied", root.bookings.length);
      }
      if (Array.isArray(o.pets) && o.pets.length && (!root.petProfiles || !root.petProfiles.length)) {
        root.petProfiles = o.pets.map(function (p) {
          return {
            id: p.id || uid(),
            name: p.name || "",
            type: p.type || "",
            breed: p.breed || "",
            age: p.age || "",
            vaccinationDate: p.vaccDate || p.vaccinationDate || "",
            notes: p.notes || "",
          };
        });
        log("migrateLegacy: petProfiles copied", root.petProfiles.length);
      }
    } catch (e) {
      log("migrateLegacy error", e);
    }
    return root;
  }

  /**
   * First install only: create ROOT, migrate legacy, fill empty keys from demo once.
   * Never runs full reset if ROOT already exists.
   */
  function ensureSeedData() {
    var root = loadRoot();
    if (root !== null) {
      var changed = false;
      var hadShopProductsKey = Object.prototype.hasOwnProperty.call(root, "shopProducts");
      KEYS.forEach(function (k) {
        if (!Array.isArray(root[k])) {
          root[k] = [];
          changed = true;
        }
      });
      if (!hadShopProductsKey) {
        var demoShop = defaultDemoData().shopProducts;
        if (demoShop && demoShop.length) {
          root.shopProducts = deepCopy(demoShop);
          changed = true;
          log("ensureSeedData: shopProducts seeded for legacy store (key was missing)");
        }
      }
      if (changed) {
        saveRoot(root);
        log("ensureSeedData: normalized missing keys");
      }
      return;
    }

    log("ensureSeedData: first install — creating store");
    root = emptyShell();
    root = migrateLegacyIntoShell(root);
    var demo = defaultDemoData();
    KEYS.forEach(function (k) {
      if (!root[k].length && demo[k] && demo[k].length) {
        root[k] = deepCopy(demo[k]);
        log("ensureSeedData: seeded key", k, demo[k].length);
      }
    });
    saveRoot(root);
  }

  function getData(key) {
    ensureSeedData();
    if (KEYS.indexOf(key) === -1) {
      log("getData: unknown key", key);
      return [];
    }
    var root = loadRoot();
    if (!root) return [];
    var arr = root[key];
    var out = Array.isArray(arr) ? arr.slice() : [];
    if (key === "shopProducts") log("[PetHubShop] getData shopProducts", out.length, "items");
    return out;
  }

  function normalizeShopProductRow(row) {
    if (!row || typeof row !== "object") return;
    if (row.price != null && row.price !== "") row.price = parseFloat(row.price);
    if (isNaN(row.price)) row.price = 0;
    if (row.stock != null && row.stock !== "") row.stock = parseInt(row.stock, 10);
    if (isNaN(row.stock)) row.stock = 0;
    if (row.category) row.category = String(row.category).trim().toLowerCase();
    if (row.status) row.status = String(row.status).trim().toLowerCase();
  }

  function normalizeShopOrderRow(row) {
    if (!row || typeof row !== "object") return;
    if (row.total != null && row.total !== "") row.total = parseFloat(row.total);
    if (isNaN(row.total)) row.total = 0;
    if (!row.status) row.status = "new";
    if (row.status) row.status = String(row.status).trim().toLowerCase();
    if (!Array.isArray(row.items)) row.items = [];
  }

  function saveData(key, data) {
    ensureSeedData();
    if (KEYS.indexOf(key) === -1) {
      log("saveData: unknown key", key);
      return;
    }
    var root = loadRoot();
    if (!root) {
      root = emptyShell();
    }
    root[key] = Array.isArray(data) ? data.slice() : [];
    saveRoot(root);
    log("saveData", key, root[key].length, "items");
    if (key === "shopProducts") log("[PetHubShop] saveData shopProducts persisted", root[key].length, "items");
  }

  function addItem(key, item) {
    var list = getData(key);
    var row = Object.assign({}, item);
    if (!row.id) row.id = uid();
    if (key === "contactMessages" || key === "emergencyRequests") {
      if (!row.createdAt) row.createdAt = Date.now();
    }
    if (key === "bookings" && !row.createdAt) row.createdAt = Date.now();
    if (key === "shopProducts") normalizeShopProductRow(row);
    if (key === "marketplaceListings") ensureMarketplaceImageOnCreate(row);
    if (key === "shopOrders") normalizeShopOrderRow(row);
    if (
      (key === "supportMessages" || key === "marketplaceInquiries" || key === "shopOrders") &&
      !row.createdAt
    ) {
      row.createdAt = Date.now();
    }
    if (key === "supportMessages" && !row.status) row.status = "new";
    if (key === "marketplaceInquiries" && !row.status) row.status = "new";
    if (key === "shopOrders" && !row.status) row.status = "new";
    list.push(row);
    saveData(key, list);
    log("addItem", key, row.id);
    if (key === "shopProducts") log("[PetHubShop] addItem", row.id);
    return row;
  }

  function updateItem(key, id, updates) {
    var list = getData(key);
    var idx = list.findIndex(function (x) {
      return String(x.id) === String(id);
    });
    if (idx === -1) {
      log("updateItem: id not found", key, id);
      return null;
    }
    var merged = Object.assign({}, list[idx], updates);
    merged.id = list[idx].id;
    if (key === "shopProducts") normalizeShopProductRow(merged);
    if (key === "shopOrders") normalizeShopOrderRow(merged);
    list[idx] = merged;
    saveData(key, list);
    log("updateItem", key, id);
    if (key === "shopProducts") log("[PetHubShop] updateItem", id);
    return merged;
  }

  function deleteItem(key, id) {
    var list = getData(key).filter(function (x) {
      return String(x.id) !== String(id);
    });
    saveData(key, list);
    log("deleteItem", key, id);
    if (key === "shopProducts") log("[PetHubShop] deleteItem", id);
  }

  /** Optional: keep legacy file pets/bookings in sync for older bookmarks (no longer source of truth). */
  function syncLegacyMirror() {
    try {
      var raw = localStorage.getItem(LEGACY_KEY);
      var o = raw ? JSON.parse(raw) : {};
      if (!o || typeof o !== "object") o = {};
      o.bookings = getData("bookings");
      o.pets = getData("petProfiles").map(function (p) {
        return {
          id: p.id,
          name: p.name,
          type: p.type,
          breed: p.breed,
          age: p.age,
          vaccDate: p.vaccinationDate || "",
          notes: p.notes || "",
        };
      });
      localStorage.setItem(LEGACY_KEY, JSON.stringify(o));
    } catch (e) {}
  }

  ensureSeedData();

  var api = {
    ROOT_KEY: ROOT_KEY,
    KEYS: KEYS,
    uid: uid,
    getRandomMarketplaceImage: getRandomMarketplaceImage,
    resolveMarketplaceListingImage: resolveMarketplaceListingImage,
    getData: getData,
    saveData: saveData,
    addItem: addItem,
    updateItem: updateItem,
    deleteItem: deleteItem,
    ensureSeedData: ensureSeedData,
    /** @deprecated use ensureSeedData */
    ensureInitialized: ensureSeedData,
    syncLegacyMirror: syncLegacyMirror,
  };

  global.PetHubApp = api;

  global.PetHubStorageDebug = {
    getData: getData,
    saveData: saveData,
    loadRoot: loadRoot,
    ROOT_KEY: ROOT_KEY,
  };

  log("PetHub storage ready; use PetHubStorageDebug / PetHubApp in console");
})(typeof window !== "undefined" ? window : this);
