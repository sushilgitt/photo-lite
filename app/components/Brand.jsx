// Photo Lite brand primitives: the lens logo mark, a circular usage gauge and a
// slim linear meter. Pure SVG/CSS so server and client render identically.

export function LogoMark({ size = 22 }) {
  return (
    <svg className="pl-logo" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect className="pl-logo-tile" width="24" height="24" rx="7" />
      <circle cx="11.5" cy="13" r="5.25" fill="none" stroke="#fff" strokeWidth="2.2" />
      <circle className="pl-logo-spark" cx="18" cy="6" r="2.1" />
    </svg>
  );
}

// Stroke check mark used in feature lists (colour comes from CSS `stroke`).
export function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

const clamp =(n) => Math.min(100, Math.max(0, Number(n) || 0));

// Circular progress ring. `light` switches the track/stroke colours for use on
// white surfaces; children render in the centre.
export function RingGauge({ pct = 0, size = 132, stroke = 12, light = false, label, children }) {
  const p = clamp(pct);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mid = size / 2;
  const cls = `pl-ring${light ? " pl-ring--light" : ""}${p >= 100 ? " is-full" : p >= 80 ? " is-high" : ""}`;
  return (
    <div className={cls} style={{ width: size, height: size }} role="img" aria-label={label || `${Math.round(p)}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="pl-ring-track" cx={mid} cy={mid} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="pl-ring-value"
          cx={mid}
          cy={mid}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p / 100)}
          transform={`rotate(-90 ${mid} ${mid})`}
        />
      </svg>
      <div className="pl-ring-center">{children}</div>
    </div>
  );
}

// Slim linear meter. `dark` is for use on the ink surfaces.
export function Meter({ pct = 0, dark = false, label }) {
  const p = clamp(pct);
  const cls = `pl-meter${dark ? " pl-meter--dark" : ""}${p >= 100 ? " is-full" : p >= 80 ? " is-high" : ""}`;
  return (
    <div className={cls} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p)} aria-label={label}>
      <span style={{ width: `${p}%` }} />
    </div>
  );
}
