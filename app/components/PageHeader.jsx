import { Icon } from "@shopify/polaris";

// Branded header shown at the top of each feature page.
export default function PageHeader({ icon, eyebrow, title, subtitle }) {
  return (
    <div className="pl-page-head">
      <span className="pl-page-head-icon">
        <Icon source={icon} />
      </span>
      <div className="pl-page-head-text">
        {eyebrow && <p className="pl-page-head-eyebrow">{eyebrow}</p>}
        <p className="pl-page-head-title">{title}</p>
        {subtitle && <p className="pl-page-head-sub">{subtitle}</p>}
      </div>
    </div>
  );
}
