import type { CSSProperties, ReactNode } from "react";

const INK = "#16130E";
const GREEN = "var(--lp-buy, #008526)";
const GRAD_CTA = "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)";
const CTA_SHADOW = "0 8px 24px color-mix(in srgb, var(--brand-primary) 42%, transparent), 0 2px 6px rgba(22,19,14,0.18)";

const EDGE_WAVE_TOP = "M0,0 L400,0 L400,10 C 356,26 322,4 276,14 C 232,23 204,6 160,15 C 118,24 84,6 44,15 C 22,20 8,12 0,16 Z";
const EDGE_WAVE_BOTTOM = "M0,28 L400,28 L400,16 C 356,0 322,22 276,12 C 232,3 204,20 160,11 C 118,2 84,20 44,11 C 22,6 8,14 0,10 Z";

export function Edge({ color, position }: { color: string; position: "top" | "bottom" }) {
  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none ${position === "top" ? "top-0" : "bottom-0"}`}
      style={{ zIndex: 2 }}
    >
      <svg className="block w-full" style={{ height: 28 }} viewBox="0 0 400 28" preserveAspectRatio="none" aria-hidden="true">
        <path d={position === "top" ? EDGE_WAVE_TOP : EDGE_WAVE_BOTTOM} fill={color} />
      </svg>
      <span
        className="absolute left-0 right-0 block"
        style={{
          height: 12,
          background: color,
          top: position === "top" ? -6 : undefined,
          bottom: position === "bottom" ? -6 : undefined,
        }}
      />
    </div>
  );
}

export function CtaBtn({ checkoutLink, variant = "scroll", look = "grad", children }: {
  checkoutLink: string;
  variant?: "scroll" | "direct";
  look?: "grad" | "white" | "green" | "yellow" | "intro" | "support";
  children: ReactNode;
}) {
  const base = "relative overflow-hidden flex items-center justify-center gap-2 w-full text-center text-base font-extrabold py-4 px-6 rounded-full active:scale-[0.98] transition-transform";
  const styles: Record<string, CSSProperties> = {
    grad: { background: GRAD_CTA, color: "#fff", boxShadow: CTA_SHADOW },
    white: { background: "#fff", color: INK, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
    green: { background: GREEN, color: "#fff", boxShadow: `0 8px 24px color-mix(in srgb, ${GREEN} 40%, transparent)` },
    yellow: { background: "var(--lp-banner, #FFBF29)", color: "var(--lp-banner-text, #16130E)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
    intro: { background: "var(--lp-intro-cta-bg, var(--lp-banner, #FFBF29))", color: "var(--lp-intro-cta-text, var(--lp-banner-text, #16130E))", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
    support: { background: "var(--lp-support-cta-bg, linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%))", color: "var(--lp-support-cta-text, #fff)", boxShadow: `var(--lp-support-cta-shadow, ${CTA_SHADOW})` },
  };
  const shine = look === "grad" && (
    <span className="absolute pointer-events-none" style={{
      top: "-50%", left: "-20%", width: "60%", height: "200%", transform: "skewX(-15deg)",
      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.12) 55%, transparent 60%)",
    }} />
  );

  if (variant === "direct") {
    return <a href={checkoutLink} className={base} style={styles[look]}>{shine}{children}</a>;
  }

  return (
    <button
      type="button"
      className={base}
      style={styles[look]}
      onClick={() => document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth", block: "center" })}
    >
      {shine}{children}
    </button>
  );
}
