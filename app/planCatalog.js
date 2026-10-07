// Client-safe pricing display catalog (marketing copy + prices) for the pricing
// page and pricing wall. The source of truth for runtime gating/quotas is
// plans.server.js — keep the prices/quotas here in sync with that file and with
// the plans created in the Partner Dashboard.
//
// Note: because this is a Managed Pricing app, every "Choose plan" button sends
// the merchant to Shopify's hosted pricing page where they pick the real plan —
// the per-tier buttons here are purely informational about what they'll get.
export const PLAN_TIERS = [
  {
    name: "Free",
    price: 0,
    priceAnnual: 0,
    images: "100",
    tagline: "Try it on a few products",
    features: [
      "100 images optimized each month",
      "WebP conversion, replaced on the product",
    ],
  },
  {
    name: "Starter",
    price: 30,
    priceAnnual: 300,
    images: "2,000",
    tagline: "Small and growing stores",
    features: [
      "2,000 images each month",
      "Everything in Free",
      "Alt Text AI for every product",
    ],
  },
  {
    name: "Growth",
    price: 99,
    priceAnnual: 990,
    images: "15,000",
    tagline: "Stores adding products weekly",
    popular: true,
    features: [
      "15,000 images each month",
      "Everything in Starter",
      "Auto-Optimize new products",
      "Speed Report with Lighthouse",
    ],
  },
  {
    name: "Pro",
    price: 350,
    priceAnnual: 3500,
    images: "50,000",
    tagline: "High-volume catalogs",
    features: [
      "50,000 images each month",
      "Everything in Growth",
      "Highest monthly image limit",
    ],
  },
];
