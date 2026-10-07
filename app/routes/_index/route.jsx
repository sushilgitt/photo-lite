import { redirect } from "react-router";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // No shop-domain form: App Store apps must be installed and opened from
  // Shopify (App Store / admin), never by typing a myshopify.com URL here.
  return null;
};

const FEATURES = [
  {
    title: "Image Optimizer",
    text: "Converts product photos to WebP and replaces them on the product. Image order and variant images stay the same.",
  },
  {
    title: "Alt Text AI",
    text: "Writes accurate alt text from what is in each image, so you meet accessibility guidelines and help SEO.",
  },
  {
    title: "Speed Report",
    text: "Runs Google Lighthouse on any product page and shows the file size you saved.",
  },
];

export default function App() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.brand}>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <rect width="24" height="24" rx="7" fill="#0F766E" />
            <circle cx="11.5" cy="13" r="5.25" fill="none" stroke="#fff" strokeWidth="2.2" />
            <circle cx="18" cy="6" r="2.1" fill="#F59E0B" />
          </svg>
          Photo Lite
        </header>

        <section className={styles.hero}>
          <div>
            <h1 className={styles.heading}>
              Lighter photos. <span>Faster store.</span>
            </h1>
            <p className={styles.text}>
              Photo Lite optimizes your Shopify product images, writes alt text with AI and
              measures how much faster your product pages load.
            </p>
            <p className={styles.note}>
              Install Photo Lite from the Shopify App Store, then open it from <strong>Apps</strong> in
              your Shopify admin.
            </p>
          </div>

          <ol className={styles.list}>
            {FEATURES.map((f, i) => (
              <li key={f.title}>
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
