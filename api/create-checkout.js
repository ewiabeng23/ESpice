// Vercel serverless function: creates a Stripe Checkout session for an order.
// Prices are re-calculated here from shop.js, never taken from the browser.
const Stripe = require("stripe");
const Shop = require("../shop.js");

const clip = (v, n) => String(v || "").trim().slice(0, n);

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  const host = req.headers.host || "localhost:3000";
  const local = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  return `${local ? "http" : "https"}://${host}`;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: "Online payment isn't set up yet. Please order on WhatsApp for now." });

  let o = req.body;
  if (typeof o === "string") { try { o = JSON.parse(o); } catch { o = null; } }
  if (!o || typeof o !== "object") return res.status(400).json({ error: "We couldn't read that order. Please try again." });

  const name = clip(o.name, 80), phone = clip(o.phone, 20), email = clip(o.email, 120);
  const address = clip(o.address, 200), notes = clip(o.notes, 400);

  const priced = Shop.priceOrder({ items: o.items, fulfilment: o.fulfilment, postcode: o.postcode });
  if (priced.errors.length) return res.status(400).json({ error: priced.errors[0] });
  if (!Shop.isValidSlot(o.slot)) return res.status(400).json({ error: "That time has just gone. Please choose another time.", refreshSlots: true });
  if (name.length < 2) return res.status(400).json({ error: "Enter your name." });
  if (!/^[0-9+()\s-]{10,20}$/.test(phone)) return res.status(400).json({ error: "Enter a valid mobile number." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (o.fulfilment === "delivery" && address.length < 5) return res.status(400).json({ error: "Enter your delivery address." });

  const site = siteUrl(req);
  const when = Shop.describeSlot(o.slot);
  const postcode = o.fulfilment === "delivery" ? Shop.zoneFor(o.postcode).postcode : "";

  const line_items = priced.lines.map((l) => ({
    quantity: l.qty,
    price_data: {
      currency: "gbp",
      unit_amount: l.unit,
      product_data: { name: l.name + (l.spiceLabel ? ` (${l.spiceLabel})` : "") },
    },
  }));
  if (priced.deliveryFee) {
    line_items.push({ quantity: 1, price_data: { currency: "gbp", unit_amount: priced.deliveryFee, product_data: { name: `Delivery (${priced.zone.name})` } } });
  }

  // Shows in your Stripe dashboard and phone app against each payment.
  const metadata = {
    type: o.fulfilment === "delivery" ? "DELIVERY" : "COLLECTION",
    time: when,
    name, phone,
    address: o.fulfilment === "delivery" ? clip(`${address}, ${postcode}`, 490) : "",
    notes,
    order: clip(priced.lines.map((l) => `${l.qty}x ${l.name}${l.spiceLabel ? ` (${l.spiceLabel})` : ""}`).join("; "), 490),
  };

  try {
    const stripe = Stripe(key);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: email,
      success_url: `${site}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/#menu`,
      metadata,
      payment_intent_data: { description: `${metadata.type} ${when}: ${name}`, metadata },
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(502).json({ error: "Payment couldn't be started. Please try again in a moment, or order on WhatsApp." });
  }
};
