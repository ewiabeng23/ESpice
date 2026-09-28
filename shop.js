/* =====================================================================
   SHOP SETTINGS + MENU
   ---------------------------------------------------------------------
   This is the only file you need to edit for everyday changes:
   business details, opening hours, delivery areas, menu and prices.
   Prices are in PENCE (950 = £9.50).
   The website AND the payment function both read this file, so the
   price a customer sees is always the price they are charged.
   ===================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Shop = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SHOP = {
    name: "ESpice",
    area: "Peckham",
    whatsapp: "447700900123",            // international format, no + or spaces
    phone: "07700 900123",
    email: "hello@espice.co.uk",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    address: "Chatham, ME4 6UH",
    hygieneRating: null,                 // set to 5 (etc.) once you have your rating
    checkoutEndpoint: "/api/create-checkout",

    // Opening hours, London time. 0 = Sunday ... 6 = Saturday. null = closed.
    hours: {
      0: ["12:00", "21:00"],
      1: null,
      2: null,
      3: ["17:00", "22:00"],
      4: ["17:00", "22:00"],
      5: ["16:00", "23:00"],
      6: ["12:00", "23:00"]
    },
    leadMinutes: 45,     // earliest an order can be ready after it's placed
    slotMinutes: 30,     // gap between pickup/delivery times
    daysAhead: 6,        // how far ahead customers can pre-order
    maxQtyPerItem: 20,

    // Delivery areas: postcode districts (the first half of a postcode).
    zones: [
      { name: "South East London", areas: ["SE"], fee: 599, minOrder: 1500 },
      { name: "East London", areas: ["E"], fee: 699, minOrder: 2500 },
      { name: "South West, West & North London", areas: ["SW", "W", "N"], fee: 799, minOrder: 3000 }
    ],

    defaultSpice: "medium",
    spiceLevels: [
      { id: "mild", label: "Mild", hint: "A gentle warmth" },
      { id: "medium", label: "Medium", hint: "Proper suya heat" },
      { id: "hot", label: "Hot", hint: "For pepper lovers" },
      { id: "naija", label: "Cameroon pepper 🌶️", hint: "You have been warned" }
    ]
  };

  // image: optional, e.g. "images/beef-suya.jpg" (put photos in site/images/)
  var MENU = [
    {
      id: "suya", name: "Suya & grills",
      note: "Served with sliced onions, tomatoes and cabbage, plus extra spice on the side.",
      items: [
        { id: "beef-suya", images: ["images/hero-3.jpg", "images/hero-1.jpg", "images/hero-4.jpg"], name: "Tozo", price: 1099, spicy: true, allergens: ["peanuts"],
          desc: "Thin-sliced beef rubbed in our house spices and grilled over charcoal until the edges catch." },
        { id: "grilled-pork", images: ["images/hero-1.jpg", "images/hero-3.jpg"], name: "Grilled pork", price: 1299, spicy: true,
          desc: "Pork marinated in our house spices and grilled over charcoal until tender and smoky." },
        { id: "chicken-suya", images: ["images/hero-1.jpg", "images/hero-3.jpg"], name: "Chicken suya", price: 850, spicy: true, allergens: ["peanuts"],
          desc: "Boneless thigh, marinated overnight so it stays juicy on the grill." },
        { id: "ram-suya", images: ["images/hero-3.jpg", "images/hero-1.jpg"], name: "Ram suya", price: 1150, spicy: true, allergens: ["peanuts"],
          desc: "Lamb, richer and fattier than beef. The regulars' favourite." },
        { id: "gizzard-suya", images: ["images/hero-3.jpg"], name: "Gizzard suya", price: 750, spicy: true, allergens: ["peanuts"],
          desc: "Chewy, peppery and made for sharing with a cold drink." }
      ]
    },
    {
      id: "fish", name: "Grilled fish",
      note: "Whole fish, scored, peppered and grilled to order, then served with our special Cameroonian sauce. Allow about 25 minutes.",
      items: [
        { id: "croaker", images: ["images/hero-4.jpg", "images/hero-2.jpg"], name: "Grilled croaker", price: 2399, spicy: true, allergens: ["fish"],
          desc: "Whole croaker with pepper sauce, onions and a wedge of lemon." },
        { id: "mackerel", images: ["images/hero-2.jpg", "images/hero-4.jpg"], name: "Peppered mackerel", price: 1599, spicy: true, allergens: ["fish"],
          desc: "Titus mackerel with crisp, smoky skin and soft flesh underneath." },
        { id: "tilapia", images: ["images/hero-4.jpg", "images/hero-2.jpg", "images/hero-3.jpg"], name: "Grilled tilapia", price: 2099, spicy: true, allergens: ["fish"],
          desc: "Whole tilapia, sweet and flaky, finished with our pepper sauce." },
        { id: "catfish", images: ["images/hero-4.jpg", "images/hero-2.jpg"], name: "Pepper-grilled catfish", price: 2099, spicy: true, allergens: ["fish"],
          desc: "Point-and-kill style catfish in a thick pepper glaze. Feeds two." }
      ]
    },
    {
      id: "platters", name: "Platters",
      note: "Everything on one tray, made for sharing, with our special Cameroonian sauce.",
      items: [
        { id: "suya-for-two", images: ["images/hero-3.jpg", "images/hero-1.jpg", "images/hero-4.jpg"], name: "Suya for two", price: 2699, spicy: true, allergens: ["peanuts"],
          desc: "Beef, chicken and ram suya with a side of dodo." },
        { id: "family-platter", images: ["images/hero-3.jpg", "images/hero-4.jpg", "images/hero-1.jpg", "images/hero-2.jpg"], name: "Family grill platter", price: 6599, spicy: true, allergens: ["peanuts", "fish"],
          desc: "Beef and chicken suya, a whole tilapia, grilled pork, dodo, fried yam and miyondo. Feeds four. Want it your way? Tell us in the order notes and we'll customise it." }
      ]
    },
    {
      id: "sides", name: "Sides",
      items: [
        { id: "dodo", name: "Fried plantain (dodo)", price: 399, desc: "Ripe plantain, fried until sweet and golden." },
        { id: "yam", name: "Fried yam", price: 450, desc: "Yam, fried until golden and crisp outside, soft inside." }
      ]
    },
    {
      id: "drinks", name: "Drinks",
      items: [
        { id: "zobo", name: "Zobo", price: 300, desc: "Chilled hibiscus with ginger and pineapple, made in-house." },
        { id: "malta", name: "Malta", price: 220, desc: "Chilled malt drink, 330ml can." },
        { id: "water", name: "Still water", price: 120, desc: "500ml bottle." }
      ]
    }
  ];

  /* ------------------------------------------------------------------
     Logic below this line: you shouldn't need to edit it.
     ------------------------------------------------------------------ */

  var INDEX = {};
  MENU.forEach(function (c) { c.items.forEach(function (i) { INDEX[i.id] = i; }); });

  function findItem(id) {
    return Object.prototype.hasOwnProperty.call(INDEX, id) ? INDEX[id] : null;
  }
  function spiceLabel(id) {
    for (var i = 0; i < SHOP.spiceLevels.length; i++) if (SHOP.spiceLevels[i].id === id) return SHOP.spiceLevels[i].label;
    return null;
  }
  function formatPrice(p) { return "£" + (p / 100).toFixed(2); }

  function normalisePostcode(pc) {
    var s = String(pc || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/.test(s)) return null;
    return { full: s.slice(0, -3) + " " + s.slice(-3), outcode: s.slice(0, -3) };
  }
  function zoneFor(pc) {
    var n = normalisePostcode(pc);
    if (!n) return { valid: false };
    var zone = null;
    var area = n.outcode.replace(/[0-9].*$/, "");
    for (var i = 0; i < SHOP.zones.length; i++) { var z = SHOP.zones[i]; if ((z.outcodes || []).indexOf(n.outcode) !== -1 || (z.areas || []).indexOf(area) !== -1) zone = z; }
    return { valid: true, postcode: n.full, zone: zone };
  }

  // ---- time helpers (always London time, whatever the device's clock zone) ----
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toMin(t) { var p = t.split(":"); return Number(p[0]) * 60 + Number(p[1]); }
  function fromMin(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function londonNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    function g(t) { for (var i = 0; i < parts.length; i++) if (parts[i].type === t) return parts[i].value; }
    return { date: g("year") + "-" + g("month") + "-" + g("day"), minutes: Number(g("hour")) * 60 + Number(g("minute")) };
  }
  function utcDate(date) { var p = date.split("-").map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])); }
  function addDays(date, n) { var d = utcDate(date); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function hoursFor(date) {
    var h = SHOP.hours[utcDate(date).getUTCDay()];
    return h ? { open: toMin(h[0]), close: toMin(h[1]) } : null;
  }

  function listSlots(now) {
    now = now || londonNow();
    var out = [];
    for (var i = 0; i <= SHOP.daysAhead; i++) {
      var date = addDays(now.date, i), h = hoursFor(date);
      if (!h) continue;
      for (var m = h.open + SHOP.slotMinutes; m <= h.close; m += SHOP.slotMinutes) {
        if (i === 0 && m < now.minutes + SHOP.leadMinutes) continue;
        out.push({ value: date + "T" + fromMin(m), date: date, minutes: m, dayOffset: i });
      }
    }
    return out;
  }
  function isValidSlot(v) {
    if (typeof v !== "string") return false;
    return listSlots().some(function (s) { return s.value === v; });
  }
  function openStatus(now) {
    now = now || londonNow();
    var h = hoursFor(now.date);
    if (h && now.minutes >= h.open && now.minutes < h.close) return { open: true, closesAt: h.close };
    for (var i = 0; i <= 7; i++) {
      var date = addDays(now.date, i), hh = hoursFor(date);
      if (!hh || (i === 0 && now.minutes >= hh.open)) continue;
      return { open: false, date: date, dayOffset: i, opensAt: hh.open };
    }
    return { open: false };
  }
  function prettyTime(m) {
    var h = Math.floor(m / 60), mm = m % 60, suf = h >= 12 && h < 24 ? "pm" : "am";
    h = h % 12 || 12;
    return h + (mm ? ":" + pad(mm) : "") + suf;
  }
  function prettyDay(date, dayOffset) {
    if (dayOffset === 0) return "Today";
    if (dayOffset === 1) return "Tomorrow";
    return utcDate(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" });
  }
  function describeSlot(v) {
    var p = String(v).split("T");
    var day = utcDate(p[0]).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
    return day + ", " + prettyTime(toMin(p[1]));
  }

  // ---- pricing: the payment function runs this too, so totals can't be tampered with ----
  function priceOrder(order) {
    order = order || {};
    var errors = [], lines = [];
    var items = Array.isArray(order.items) ? order.items : [];
    if (!items.length) errors.push("Your basket is empty.");
    if (items.length > 40) errors.push("For very large orders, message us on WhatsApp.");
    items.slice(0, 40).forEach(function (it) {
      var item = findItem(it && it.id);
      if (!item) { errors.push("Something in your basket is no longer on the menu. Remove it and try again."); return; }
      var qty = Number(it.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > SHOP.maxQtyPerItem) {
        errors.push("Choose between 1 and " + SHOP.maxQtyPerItem + " of " + item.name + "."); return;
      }
      var spice = null;
      if (item.spicy) {
        spice = spiceLabel(it.spice) ? it.spice : null;
        if (!spice) { errors.push("Choose a heat level for " + item.name + "."); return; }
      }
      lines.push({ id: item.id, name: item.name, unit: item.price, qty: qty, spice: spice,
        spiceLabel: spice ? spiceLabel(spice) : null, total: item.price * qty });
    });
    var subtotal = lines.reduce(function (s, l) { return s + l.total; }, 0);
    var deliveryFee = 0, zone = null;
    if (order.fulfilment === "delivery") {
      var z = zoneFor(order.postcode);
      if (!z.valid) errors.push("Enter a full UK postcode, like SE15 4ST.");
      else if (!z.zone) errors.push("We don't deliver to " + z.postcode + " yet. Choose collection, or message us on WhatsApp.");
      else {
        zone = z.zone; deliveryFee = zone.fee;
        if (subtotal < zone.minOrder) errors.push("Delivery to " + zone.name + " needs a minimum order of " + formatPrice(zone.minOrder) + ".");
      }
    } else if (order.fulfilment !== "collection") {
      errors.push("Choose collection or delivery.");
    }
    return { lines: lines, subtotal: subtotal, deliveryFee: deliveryFee, total: subtotal + deliveryFee, zone: zone, errors: errors };
  }

  return {
    SHOP: SHOP, MENU: MENU, findItem: findItem, spiceLabel: spiceLabel, formatPrice: formatPrice,
    zoneFor: zoneFor, listSlots: listSlots, isValidSlot: isValidSlot, openStatus: openStatus,
    prettyTime: prettyTime, prettyDay: prettyDay, describeSlot: describeSlot, priceOrder: priceOrder,
    londonNow: londonNow
  };
});
