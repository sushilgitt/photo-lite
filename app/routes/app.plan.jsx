import PageHeader from "../components/PageHeader";
import { CreditCardIcon } from "@shopify/polaris-icons";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getBillingState,
  managedPricingUrl,
  appBridgeRedirect,
  cancelSubscription,
} from "../billing.server";
import { getUsage } from "../usage.server";
import { PLAN_TIERS } from "../planCatalog";
import { Page, Layout, BlockStack, Banner, Badge } from "@shopify/polaris";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { RingGauge, CheckGlyph } from "../components/Brand";

// Human labels for the entitlement flags, shown as the current plan's inclusions.
const FEATURE_LABELS = {
  optimize: "Image Optimizer (WebP)",
  altText: "Alt Text AI",
  autoOptimize: "Auto-Optimize new products",
  pageSpeed: "Speed Report (Lighthouse)",
};

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let state = { hasActivePlan: false, plan: null, appHandle: undefined };
  try {
    state = await getBillingState(admin, session.shop);
  } catch (e) {
    if (e instanceof Response) throw e;
  }

  let usage = { imagesUsed: 0 };
  try { usage = await getUsage(session.shop); } catch { /* table not ready */ }

  const plan = state.plan || { name: "Free", tier: "free", monthlyImages: 100, features: {} };
  const included = Object.keys(FEATURE_LABELS).filter((k) => plan.features?.[k]);

  return {
    hasActivePlan: state.hasActivePlan,
    planName: plan.name,
    tier: plan.tier,
    monthlyImages: plan.monthlyImages,
    included,
    imagesUsed: usage.imagesUsed || 0,
    // Direct top-frame link target for the Change/Choose-plan CTA.
    pricingUrl: managedPricingUrl(session.shop, state.appHandle),
  };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  const state = await getBillingState(admin);
  const pricingUrl = managedPricingUrl(session.shop, state.appHandle);

  // Cancel: try the in-app cancel mutation first; if managed pricing blocks it,
  // fall back to the hosted page to cancel manually.
  if (actionType === "cancel") {
    const sub = state.activeSubscription;
    if (!sub) return { cancelled: true };
    try {
      await cancelSubscription(admin, sub.id);
      return { cancelled: true };
    } catch (e) {
      console.error("[BILLING] in-app cancel failed, redirecting:", e?.message);
      throw appBridgeRedirect(pricingUrl);
    }
  }

  return null;
};

export default function BillingPage() {
  const { hasActivePlan, planName, monthlyImages, included, imagesUsed, pricingUrl } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isBusy = navigation.state !== "idle";

  const post = (actionType) => {
    const fd = new FormData();
    fd.append("actionType", actionType);
    submit(fd, { method: "post" });
  };

  const quota = monthlyImages || 0;
  const used = imagesUsed || 0;
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const fmt = (n) => Number(n).toLocaleString();
  const currentIdx = PLAN_TIERS.findIndex((t) => t.name === planName);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <PageHeader icon={CreditCardIcon} eyebrow="Billing" title="Plans & usage" subtitle="Your current plan, this month's image usage and the features included" />
        </Layout.Section>

        {actionData?.cancelled && !hasActivePlan && (
          <Layout.Section>
            <Banner title="Subscription cancelled" tone="info">
              You're now on the Free plan. You can choose a paid plan again at any time.
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <BlockStack gap="400">
            <div className="pl-plan-top">
              <div className="pl-card pl-plan-current">
                <div>
                  <Badge tone={hasActivePlan ? "success" : undefined}>{hasActivePlan ? "Active subscription" : "Current plan"}</Badge>
                </div>
                <div>
                  <p className="pl-plan-name">{planName}</p>
                  <p className="pl-plan-sub" style={{ marginTop: 8 }}>{`${fmt(quota)} images optimized per month`}</p>
                </div>
                <div className="pl-actions">
                  <a className="pl-btn pl-btn-primary" href={pricingUrl} target="_top">
                    {hasActivePlan ? "Change plan" : "Upgrade plan"}
                  </a>
                  {hasActivePlan && (
                    <button type="button" className="pl-btn pl-btn-outline" disabled={isBusy} onClick={() => post("cancel")}>
                      {isBusy ? "Cancelling…" : "Cancel subscription"}
                    </button>
                  )}
                </div>
              </div>

              <div className="pl-soft pl-plan-usage">
                <RingGauge pct={pct} size={112} stroke={10} label={`${pct}% of monthly images used`}>
                  <span className="pl-ring-num" style={{ fontSize: 22 }}>{`${pct}%`}</span>
                  <span className="pl-ring-unit">used</span>
                </RingGauge>
                <div>
                  <p className="pl-quota-label">Usage this month</p>
                  <p className="pl-plan-usage-big" style={{ marginTop: 8 }}>{`${fmt(used)} / ${fmt(quota)}`}</p>
                  <p className="pl-plan-usage-note">{`${fmt(Math.max(0, quota - used))} images left. Your limit resets on the 1st of each month.`}</p>
                </div>
              </div>
            </div>

            <div className="pl-card">
              <p className="pl-card-title">Included in {planName}</p>
              <ul className="pl-checklist">
                {Object.entries(FEATURE_LABELS).map(([k, label]) => {
                  const on = included.includes(k);
                  return (
                    <li key={k} className={on ? undefined : "is-locked"}>
                      <span className="pl-check"><CheckGlyph /></span>
                      <span>{label}</span>
                      {!on && <span className="pl-lock-tag">Upgrade</span>}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="pl-card">
              <p className="pl-card-title">All plans</p>
              <p className="pl-card-sub">Monthly prices. Annual billing saves about 17%.</p>
              <div className="pl-tier-strip">
                {PLAN_TIERS.map((t, i) => (
                  <div key={t.name} className={`pl-tier${i === currentIdx ? " is-current" : ""}`}>
                    {i === currentIdx && <span className="pl-tier-you">Your plan</span>}
                    <p className="pl-tier-name">{t.name}</p>
                    <p className="pl-tier-price">{`$${t.price}`}<span>/mo</span></p>
                    <p className="pl-tier-meta">{`${t.images} images / month`}</p>
                  </div>
                ))}
              </div>
              <p className="pl-footnote">
                Charges appear on your Shopify invoice. Plan changes are reflected here automatically.
              </p>
            </div>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
