// Run with: npm test
// Checks the menu and the pricing rules before anything goes live.
const test = require("node:test");
const assert = require("node:assert/strict");
const Shop = require("../shop.js");

test("menu items are set up correctly", () => {
  const ids = new Set();
  for (const cat of Shop.MENU) {
    assert.ok(cat.id && cat.name, "every section needs an id and a name");
    for (const item of cat.items) {
      assert.ok(!ids.has(item.id), `duplicate menu id: ${item.id}`);
      ids.add(item.id);
      assert.ok(item.name && item.desc, `${item.id} needs a name and a description`);
      assert.ok(Number.isInteger(item.price) && item.price > 0, `${item.id}: price must be in pence, e.g. 950`);
      assert.ok(item.price < 20000, `${item.id}: £${item.price / 100} looks too high. Is the price in pence?`);
      if (item.allergens) assert.ok(Array.isArray(item.allergens), `${item.id}: allergens must be a list`);
    }
  }
});

test("shop settings are valid", () => {
  const S = Shop.SHOP;
  assert.match(S.whatsapp, /^44\d{10}$/, "WhatsApp number should look like 447700900123");
  assert.ok(Shop.spiceLabel(S.defaultSpice), "defaultSpice must be one of the spice levels");
  for (const [day, h] of Object.entries(S.hours)) {
    if (h === null) continue;
    assert.ok(/^\d\d:\d\d$/.test(h[0]) && /^\d\d:\d\d$/.test(h[1]), `hours for day ${day} must be like ["17:00","22:00"]`);
    assert.ok(h[0] < h[1], `day ${day}: closing time must be after opening time`);
  }
  for (const z of S.zones) {
    assert.ok(Number.isInteger(z.fee) && Number.isInteger(z.minOrder), `${z.name}: fee and minOrder are in pence`);
  }
});

test("prices add up correctly", () => {
  const p = Shop.priceOrder({
    items: [{ id: "beef-suya", qty: 2, spice: "hot" }, { id: "zobo", qty: 1 }],
    fulfilment: "collection",
  });
  assert.deepEqual(p.errors, []);
  assert.equal(p.subtotal, Shop.findItem("beef-suya").price * 2 + Shop.findItem("zobo").price);
  assert.equal(p.total, p.subtotal);
});

test("delivery fee and minimum order are applied", () => {
  const ok = Shop.priceOrder({ items: [{ id: "beef-suya", qty: 2, spice: "mild" }], fulfilment: "delivery", postcode: "se15 4st" });
  assert.deepEqual(ok.errors, []);
  assert.equal(ok.deliveryFee, 250);
  assert.equal(ok.total, Shop.findItem("beef-suya").price * 2 + 250);

  const tooSmall = Shop.priceOrder({ items: [{ id: "zobo", qty: 1 }], fulfilment: "delivery", postcode: "SE15 4ST" });
  assert.match(tooSmall.errors[0], /minimum order/);

  const outside = Shop.priceOrder({ items: [{ id: "zobo", qty: 10 }], fulfilment: "delivery", postcode: "N1 1AA" });
  assert.match(outside.errors[0], /don't deliver/);
});

test("bad or tampered orders are rejected", () => {
  assert.ok(Shop.priceOrder({ items: [{ id: "made-up", qty: 1 }], fulfilment: "collection" }).errors.length);
  assert.ok(Shop.priceOrder({ items: [{ id: "zobo", qty: 0 }], fulfilment: "collection" }).errors.length);
  assert.ok(Shop.priceOrder({ items: [{ id: "zobo", qty: 1.5 }], fulfilment: "collection" }).errors.length);
  assert.ok(Shop.priceOrder({ items: [{ id: "beef-suya", qty: 1 }], fulfilment: "collection" }).errors.length, "spicy items need a heat level");
  assert.ok(Shop.priceOrder({ items: [], fulfilment: "collection" }).errors.length);
  const sneaky = Shop.priceOrder({ items: [{ id: "zobo", qty: 1, price: 1 }], fulfilment: "collection" });
  assert.equal(sneaky.total, 300, "the browser can't set its own price");
});

test("time slots respect opening hours", () => {
  // A Wednesday (17:00-22:00) at 16:00: first slot is 17:30, last is 22:00
  const slots = Shop.listSlots({ date: "2026-09-30", minutes: 16 * 60 });
  const wed = slots.filter((s) => s.date === "2026-09-30");
  assert.equal(wed[0].value, "2026-09-30T17:30");
  assert.equal(wed[wed.length - 1].value, "2026-09-30T22:00");
  // Monday is closed
  assert.equal(Shop.listSlots({ date: "2026-09-28", minutes: 600 }).filter((s) => s.date === "2026-09-28").length, 0);
  // Lead time: at 18:00 on Wednesday, nothing before 18:45
  const later = Shop.listSlots({ date: "2026-09-30", minutes: 18 * 60 }).filter((s) => s.date === "2026-09-30");
  assert.equal(later[0].value, "2026-09-30T19:00");
  assert.equal(Shop.isValidSlot("2020-01-01T18:00"), false);
});

test("payment function rejects bad requests before calling Stripe", async () => {
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
  const handler = require("../api/create-checkout.js");
  const call = (method, body) => new Promise((resolve) => {
    const res = { status(c) { this.code = c; return this; }, json(b) { resolve({ code: this.code, body: b }); return this; } };
    handler({ method, headers: { host: "localhost:3000" }, body }, res);
  });
  assert.equal((await call("GET")).code, 405);
  assert.equal((await call("POST", "not json")).code, 400);
  const r = await call("POST", { items: [{ id: "beef-suya", qty: 1 }], fulfilment: "collection" });
  assert.equal(r.code, 400);
  assert.match(r.body.error, /heat level/);
});
