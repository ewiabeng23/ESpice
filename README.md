# ESpice website

Menu, heat levels, basket, collection or delivery, time slots, and secure
card / Apple Pay / Google Pay checkout through Stripe. Hosted on Vercel.

## Everyday workflow

    npm install              (first time only; also switches on the pre-push test check)
    npm run dev              start the site at http://localhost:3000
    npm test                 check the menu, prices, delivery rules and time slots
    git push                 tests run automatically first; if they fail, nothing is pushed

Edit files while `npm run dev` is running and just refresh the browser. Changes to
shop.js and the api folder are picked up without restarting.

### First-time local setup

1. Install Node.js 18 or newer (nodejs.org, pick the LTS version).
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env.local` and paste in your Stripe TEST secret key (sk_test_...).
   .env.local stays on your computer and is never pushed to GitHub.
4. Run `npm run dev` and open http://localhost:3000.
5. Place a test order and pay with card 4242 4242 4242 4242, any future expiry, any CVC.
   You'll land on the success page, and the order appears in Stripe under Test mode > Payments.

The terminal shows every request, and any error from the payment function appears there too.

`npm run dev:vercel` runs Vercel's own local server instead (needs `npm i -g vercel`
and `vercel link` once). Use it only if you want an exact copy of Vercel's environment;
`npm run dev` is enough for day-to-day work.

## What's in the folder

index.html               the website (menu, basket, checkout)
success.html             the "order received" page after payment
shop.js                  YOUR SETTINGS: phone, hours, delivery areas, menu, prices
images/                  put your food photos here
api/create-checkout.js   talks to Stripe (you don't need to edit this)
dev-server.js            local server for `npm run dev` (not uploaded to Vercel)
tests/                   automatic checks for `npm test`
.githooks/pre-push       runs the tests before every push
.env.example             template for your local Stripe key
package.json, vercel.json  hosting and script settings

## 1. Make it yours (edit shop.js)

- WhatsApp number (format 447700900123), phone, email, address, social links
- Opening hours (London time), how far ahead people can pre-order, prep time
- Delivery areas: postcode districts (e.g. "SE15"), fee and minimum order in pence
- Menu: names, descriptions, prices in pence (950 = £9.50); spicy: true asks for a heat level
- Photos: save e.g. images/beef-suya.jpg, then add  image: "images/beef-suya.jpg"  to that item.
  Landscape, around 1200x750 px, compressed (squoosh.app is free).
- hygieneRating: fill in once you have your rating.

The payment function reads the same file, so the price shown is always the price charged.

## 2. Set up Stripe

1. Create an account at stripe.com and complete business verification (needed for payouts).
2. Developers > API keys: copy the SECRET key. Start with the TEST key (sk_test_...).
3. Settings > Email notifications: turn on "Successful payments" so every order emails you.
4. Install the Stripe app on your phone for a notification on every order, showing
   items, heat levels, time, name, phone and address.

## 3. Deploy on Vercel

1. Put this folder in a GitHub repository.
2. vercel.com > Add New > Project > import the repository.
   Framework preset: Other. Leave Build Command and Output Directory empty.
3. Settings > Environment Variables:
   STRIPE_SECRET_KEY = sk_test_...
   SITE_URL = https://your-domain.co.uk   (optional; without it the Vercel address is used)
4. Redeploy, then test with card 4242 4242 4242 4242, any future expiry, any CVC.
5. When happy, change STRIPE_SECRET_KEY to your live key (sk_live_...) and redeploy.
6. Settings > Domains: add your domain (e.g. espice.co.uk). HTTPS is automatic.

Every change you push to GitHub (new prices, new photos) goes live automatically.

Note: Vercel's free Hobby plan is for non-commercial use only. A business taking
orders needs the Pro plan (from $20/month). Netlify and Cloudflare Pages both allow
commercial use on their free plans if you'd rather avoid that cost.

## Before you launch (UK)

- Register as a food business with your local council at least 28 days before trading.
- Allergens: customers must see allergen information before they buy. Keep the
  "allergens" list on each menu item accurate.
- Add a short privacy notice (you collect names, phone numbers and addresses).

## Ideas for later

- Promo codes: add allow_promotion_codes: true in api/create-checkout.js, then create codes in Stripe.
- Pause ordering on a busy night: set that day's hours to null and push the change.
- Kitchen tablet or WhatsApp group alerts via a Stripe webhook.
