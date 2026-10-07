import { PLAN_TIERS } from "../planCatalog";
import { LogoMark, CheckGlyph } from "./Brand";

// Plan comparison used by both the standalone pricing page and the in-app
// pricing wall. Presentational only: every plan CTA is a real top-frame link
// (`target="_top"`) to Shopify's hosted managed-pricing page, where the actual
// price/cycle live and are picked. A direct anchor is used (rather than a form
// POST + reauthorize-header redirect) because a user click is a reliable user
// activation that can navigate the top frame out of the embedded iframe.
//
// Prices come from planCatalog.js and are display-only: the amount actually
// charged is set on the Partner Dashboard plans, so keep the two in sync.
export default function PricingTiers({ pricingUrl }) {
  return (
    <div className="pl-pricing">
      <header className="pl-soft pl-pricing-band">
        <span className="pl-chip"><LogoMark size={18} />Photo Lite plans</span>
        <h1>
          Faster product pages, <span className="pl-accent">at any size.</span>
        </h1>
        <p>
          Optimize photos, write alt text with AI and measure the speed you gain. Start free and
          upgrade only when your catalog needs it.
        </p>
      </header>

      <div className="pl-pricing-grid">
        {PLAN_TIERS.map((tier) => (
          <div key={tier.name} className={`pl-price-card${tier.popular ? " is-popular" : ""}`}>
            {tier.popular && <span className="pl-price-flag">MOST POPULAR</span>}
            <p className="pl-price-name">{tier.name}</p>
            <p className="pl-price-tag">{tier.tagline}</p>
            <p className="pl-price-amount">
              {`$${tier.price}`}<span>per month</span>
            </p>
            <p className="pl-price-annual">
              {tier.price === 0 ? "Free forever, no card required" : `Or $${tier.priceAnnual}/year and save ~17%`}
            </p>
            <a href={pricingUrl} target="_top" className={`pl-btn ${tier.popular ? "pl-btn-primary" : "pl-btn-outline"} pl-price-cta`}>
              {tier.price === 0 ? "Start free" : `Choose ${tier.name}`}
            </a>
            <ul className="pl-price-features">
              {tier.features.map((f) => (
                <li key={f}><CheckGlyph />{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="pl-pricing-foot">Billed securely through Shopify. Change or cancel your plan at any time.</p>
    </div>
  );
}
