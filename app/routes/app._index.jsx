import { useNavigate, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getBillingStateCached } from "../billing.server";
import { getUsage } from "../usage.server";
import { entitled } from "../plans.server";
import db from "../db.server";
import { Page, Button, Badge, Icon } from "@shopify/polaris";
import {
  ImageMagicIcon,
  MagicIcon,
  AutomationIcon,
  GaugeIcon,
  PlanIcon,
  ImagesIcon,
  CheckCircleIcon,
} from "@shopify/polaris-icons";
import { LogoMark, RingGauge } from "../components/Brand";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let plan = null;
  try {
    plan = (await getBillingStateCached(admin, session.shop)).plan;
  } catch (e) {
    if (e instanceof Response) throw e; // let re-auth propagate
  }

  let usage = { imagesUsed: 0 };
  let autoOptimize = false;
  try {
    usage = await getUsage(session.shop);
    const settings = await db.shopSettings.findUnique({ where: { shop: session.shop } });
    autoOptimize = settings?.autoOptimize ?? false;
  } catch { /* usage/settings tables not ready — defaults */ }

  return {
    plan: {
      name: plan?.name || "Free",
      tier: plan?.tier || "free",
      monthlyImages: plan?.monthlyImages ?? 100,
      altText: entitled(plan, "altText"),
      pageSpeed: entitled(plan, "pageSpeed"),
      autoOptimizeAllowed: entitled(plan, "autoOptimize"),
    },
    usage,
    autoOptimize,
  };
};

export default function Index() {
  const navigate = useNavigate();
  const { plan, usage, autoOptimize } = useLoaderData();

  const quota = plan.monthlyImages || 0;
  const used = usage?.imagesUsed || 0;
  const remaining = Math.max(0, quota - used);
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const fmt = (n) => Number(n).toLocaleString();

  const autoStatus = !plan.autoOptimizeAllowed
    ? { label: "Growth plan", tone: "attention" }
    : autoOptimize
      ? { label: "On", tone: "success" }
      : { label: "Off", tone: undefined };

  const tools = [
    {
      icon: ImageMagicIcon,
      title: "Image Optimizer",
      desc: "Convert heavy JPEG and PNG product photos to WebP and replace them on the product, keeping image order, variant images and the featured photo.",
      cta: "Optimize images",
      onClick: () => navigate("/app/optimize"),
      available: true,
      wide: true,
    },
    {
      icon: MagicIcon,
      title: "Alt Text AI",
      desc: "Describes each product photo for shoppers and search engines. Review the text, then apply it in one click.",
      cta: plan.altText ? "Write alt text" : "Available on Starter",
      onClick: () => navigate(plan.altText ? "/app/alt-text" : "/app/plan"),
      available: plan.altText,
      badge: plan.altText ? undefined : { label: "Starter+", tone: "attention" },
    },
    {
      icon: AutomationIcon,
      title: "Auto-Optimize",
      desc: "Every new product is optimized in the background as soon as it is created.",
      cta: plan.autoOptimizeAllowed ? "Manage" : "Available on Growth",
      onClick: () => navigate(plan.autoOptimizeAllowed ? "/app/optimize" : "/app/plan"),
      available: plan.autoOptimizeAllowed,
      badge: autoStatus,
    },
    {
      icon: GaugeIcon,
      title: "Speed Report",
      desc: "Run Google Lighthouse on any product page and see the page weight you removed, page by page.",
      cta: plan.pageSpeed ? "Open Speed Report" : "Available on Growth",
      onClick: () => navigate(plan.pageSpeed ? "/app/speed" : "/app/plan"),
      available: plan.pageSpeed,
      badge: plan.pageSpeed ? undefined : { label: "Growth+", tone: "attention" },
      wide: true,
    },
  ];

  const stats = [
    { icon: PlanIcon, label: "Current plan", value: plan.name },
    { icon: ImagesIcon, label: "Optimized this month", value: fmt(used) },
    { icon: CheckCircleIcon, label: "Images remaining", value: fmt(remaining) },
    { icon: AutomationIcon, label: "Auto-Optimize", value: autoStatus.label },
  ];

  return (
    <Page>
      <section className="pl-dark pl-hero">
        <div className="pl-hero-top">
          <div>
            <span className="pl-chip pl-chip--dark"><LogoMark size={18} />Photo Lite</span>
            <h1>
              Lighter photos. <span className="pl-accent">Faster store.</span>
            </h1>
            <p className="pl-hero-sub">
              Optimize product images, add AI alt text and check page speed, all inside your
              Shopify admin.
            </p>
            <div className="pl-actions">
              <button type="button" className="pl-btn pl-btn-bright" onClick={() => navigate("/app/optimize")}>
                Optimize images
              </button>
              <button type="button" className="pl-btn pl-btn-ghost" onClick={() => navigate("/app/plan")}>
                Plans &amp; usage
              </button>
            </div>
          </div>

          <div className="pl-hero-gauge">
            <RingGauge pct={pct} size={150} stroke={13} label={`${pct}% of this month's images used`}>
              <span className="pl-ring-num">{`${pct}%`}</span>
              <span className="pl-ring-unit">used</span>
            </RingGauge>
            <p className="pl-hero-gauge-caption">{`${fmt(used)} of ${fmt(quota)} images · resets monthly`}</p>
          </div>
        </div>

        <div className="pl-hero-stats">
          {stats.map((s) => (
            <div key={s.label} className="pl-hero-stat">
              <p className="pl-hero-stat-label"><Icon source={s.icon} />{s.label}</p>
              <p className="pl-hero-stat-value">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pl-section-head">
        <p className="pl-section-title">Your tools</p>
        <p className="pl-section-note">{`${tools.filter((t) => t.available).length} of ${tools.length} included in ${plan.name}`}</p>
      </div>
      <div className="pl-bento">
        {tools.map((t) => (
          <div key={t.title} className={`pl-tool${t.wide ? " pl-tool--wide" : ""}${t.available ? "" : " pl-tool-locked"}`}>
            <div className="pl-tool-top">
              <span className="pl-tool-icon"><Icon source={t.icon} /></span>
              {t.badge && <Badge tone={t.badge.tone}>{t.badge.label}</Badge>}
            </div>
            <p className="pl-tool-title">{t.title}</p>
            <p className="pl-tool-desc">{t.desc}</p>
            <div className="pl-tool-cta">
              <Button variant={t.available ? "primary" : "secondary"} onClick={t.onClick}>
                {t.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
