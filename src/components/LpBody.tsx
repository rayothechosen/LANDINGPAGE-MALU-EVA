import { useState, useRef, type ReactNode, type CSSProperties } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { Starburst } from "@/components/LpIcons";
import garantiaSelo from "@/assets/selo-garantia-gold.webp";

// ─── Tema (mesmas constantes do painel demo) ─────────────────────────────────
const P           = "var(--brand-primary)";
const ACCENT      = "var(--brand-accent)";
const INK         = "#16130E";
const CARD_DARK   = "var(--brand-card-dark)";
const CARD_EDGE   = "1.5px solid rgba(22,19,14,0.10)";
const CARD_SHADOW = "0 2px 0 rgba(22,19,14,0.05), 0 14px 36px rgba(22,19,14,0.08)";
const GRAD_CTA    = "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)";
const CTA_SHADOW  = "0 8px 24px color-mix(in srgb, var(--brand-primary) 42%, transparent), 0 2px 6px rgba(22,19,14,0.18)";
// Cores específicas da LP, com fallback para o visual padrão.
const GREEN       = "var(--lp-buy, #008526)";
const STAR        = "var(--lp-star, var(--brand-primary))";
const STAR_ONDARK = "var(--lp-star-ondark, #FFBF29)";

export type LpDecor = "star" | "flower";

// Flor retrô (variação Candy Pop) — mesmo papel decorativo do Starburst.
function Flower({ size = 44, color = "#F0509E" }: { size?: number; color?: string }) {
  const petals = Array.from({ length: 6 }).map((_, i) => {
    const a = (i * 60 * Math.PI) / 180;
    return { cx: 32 + 15.5 * Math.cos(a), cy: 32 + 15.5 * Math.sin(a) };
  });
  return (
    <motion.svg viewBox="0 0 64 64" width={size} height={size}
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
      {petals.map((p, i) => <circle key={i} cx={p.cx} cy={p.cy} r="11.5" fill={color} />)}
      <circle cx="32" cy="32" r="8.5" fill="var(--lp-flower-center, #fff)" />
    </motion.svg>
  );
}

function Ornament({ size, color, decor = "star" }: { size: number; color: string; decor?: LpDecor }) {
  return decor === "flower" ? <Flower size={size} color={color} /> : <Starburst size={size} color={color} />;
}

// ─── Borda de troca de seção (onda) ──────────────────────────────────────────
// A borda carrega a cor da seção vizinha SÓLIDA e é sobreposta à seção
// colorida/gradiente, criando a transição orgânica entre elas.
const EDGE_WAVE_TOP = "M0,0 L400,0 L400,10 C 356,26 322,4 276,14 C 232,23 204,6 160,15 C 118,24 84,6 44,15 C 22,20 8,12 0,16 Z";
const EDGE_WAVE_BOTTOM = "M0,28 L400,28 L400,16 C 356,0 322,22 276,12 C 232,3 204,20 160,11 C 118,2 84,20 44,11 C 22,6 8,14 0,10 Z";

export function Edge({ color, position }: { color: string; position: "top" | "bottom" }) {
  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none ${position === "top" ? "top-0" : "bottom-0"}`}
      style={{ zIndex: 2 }}
    >
      <svg className="block w-full" style={{ height: 28 }} viewBox="0 0 400 28" preserveAspectRatio="none">
        <path d={position === "top" ? EDGE_WAVE_TOP : EDGE_WAVE_BOTTOM} fill={color} />
      </svg>
      {/*
        O limite de um SVG pode sofrer antialiasing quando a página está em
        zoom fracionário. Esta faixa HTML cobre a junção com a seção vizinha
        sem depender do último pixel do SVG, eliminando a linha em qualquer
        escala ou densidade de tela.
      */}
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

export interface CardItem {
  image: string;
  title: string;
  alt: string;
  description: string;
}

export interface TestimonialAuthor {
  name: string;
  image: string;
}

export interface LpBodyProps {
  checkoutLink: string;
  ctaLabel: string;
  featuresKicker: string;
  featuresTitle: ReactNode;
  features: CardItem[];
  bonusCards: CardItem[];
  depoimentosTitle: string;
  depoimentosSub: string;
  depoimentosCtaLabel: string;
  videoDepoimentos: string[];
  imageDepoimentos: string[];
  audioDepoimentos: { src: string; label: string }[];
  testimonialAuthors?: TestimonialAuthor[];
  criadoraKicker?: string;
  criadoraTitle?: ReactNode;
  criadoraParagraphs?: ReactNode[];
  criadoraImage?: string;
  showSuporte?: boolean;
  suporteTitle: string;
  suporteDescription: string;
  ofertaHeading: string;
  ofertaSubtitle: string;
  ofertaBannerLabel: string;
  ofertaImage: string;
  ofertaTitle: string;
  ofertaItems: string[];
  ofertaDePrice: string;
  paidPrice: string;
  ofertaCtaLabel: string;
  garantiaTitle: string;
  garantiaBody: string;
  faqItems: { question: string; answer: string }[];
  footerBrand: string;
  decor?: LpDecor;
  checkerColors?: [string, string];
}

// ─── CTA (scroll até a oferta ou link direto, com brilho varrido) ────────────
export function CtaBtn({ checkoutLink, variant = "scroll", look = "grad", children }: {
  checkoutLink: string; variant?: "scroll" | "direct"; look?: "grad" | "white" | "green" | "yellow" | "intro" | "support";
  children: ReactNode;
}) {
  const base = "relative overflow-hidden flex items-center justify-center gap-2 w-full text-center text-base font-extrabold py-4 px-6 rounded-full active:scale-[0.98] transition-transform";
  const styles: Record<string, CSSProperties> = {
    grad:   { background: GRAD_CTA, color: "#fff", boxShadow: CTA_SHADOW },
    white:  { background: "#fff", color: INK, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
    green:  { background: GREEN, color: "#fff", boxShadow: `0 8px 24px color-mix(in srgb, ${GREEN} 40%, transparent)` },
    yellow: { background: "var(--lp-banner, #FFBF29)", color: "var(--lp-banner-text, #16130E)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
    intro:  { background: "var(--lp-intro-cta-bg, var(--lp-banner, #FFBF29))", color: "var(--lp-intro-cta-text, var(--lp-banner-text, #16130E))", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
    support:{ background: "var(--lp-support-cta-bg, linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%))", color: "var(--lp-support-cta-text, #fff)", boxShadow: `var(--lp-support-cta-shadow, ${CTA_SHADOW})` },
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
    <button type="button" className={base} style={styles[look]}
      onClick={() => document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
      {shine}{children}
    </button>
  );
}

// ─── Kicker pill (label uppercase no accent, padrão do painel) ───────────────
function Kicker({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase font-extrabold mb-3"
      style={{ background: onDark ? ACCENT : "color-mix(in srgb, var(--brand-primary) 9%, transparent)", color: onDark ? INK : P }}>
      {children}
    </span>
  );
}

// ─── Player de vídeo (depoimentos) ───────────────────────────────────────────
function VideoPlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const ref = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const resetHide = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 2500);
  };

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ref.current) return;
    if (!playing) {
      setMuted(false);
      ref.current.muted = false;
      void ref.current.play();
    } else {
      ref.current.pause();
    }
    setPlaying(!playing);
    resetHide();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    ref.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
    resetHide();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden select-none" style={{ background: "#0A0A0A", boxShadow: "0 16px 36px rgba(0,0,0,0.35)" }}
      onClick={toggle} onMouseMove={resetHide}>
      <video ref={ref} src={`${src}#t=0.001`} playsInline preload="metadata" muted={muted}
        className="w-full h-auto block"
        onTimeUpdate={() => { if (!ref.current) return; setCurrent(ref.current.currentTime); setProgress(ref.current.currentTime / duration * 100); }}
        onLoadedMetadata={() => { if (!ref.current) return; setDuration(ref.current.duration); ref.current.currentTime = 0.001; }}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrent(0); setShowControls(true); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)} />

      {!playing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: GRAD_CTA, boxShadow: "0 10px 30px rgba(0,0,0,0.45)" }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-9 h-9 ml-1"><polygon points="6,3 21,12 6,21" /></svg>
          </div>
          <p className="text-white font-semibold text-sm tracking-wide" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>Toque para ver o depoimento</p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8 transition-opacity duration-300"
        style={{ opacity: playing && showControls ? 1 : 0, pointerEvents: playing ? "auto" : "none", background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
        onClick={e => e.stopPropagation()}>
        <div className="relative h-1 rounded-full bg-white/30 cursor-pointer mb-2.5" onClick={seek}>
          <div className="h-full rounded-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow" style={{ left: `calc(${progress}% - 6px)` }} />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="text-white">
            {playing
              ? <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><rect x="6" y="4" width="4" height="16" rx="1.5" /><rect x="14" y="4" width="4" height="16" rx="1.5" /></svg>
              : <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><polygon points="6,3 21,12 6,21" /></svg>}
          </button>
          <span className="text-white text-[11px] font-medium tabular-nums">{fmt(current)} / {duration ? fmt(duration) : "0:00"}</span>
          <div className="flex-1" />
          <button onClick={e => { e.stopPropagation(); setMuted(!muted); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
            style={{ background: muted ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)" }}>
            {muted ? "Ativar som" : "Som ativo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Player de áudio (depoimentos) ───────────────────────────────────────────
function AudioPlayer({ src, label }: { src: string; label: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (!ref.current) return;
    if (playing) ref.current.pause(); else void ref.current.play();
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    ref.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="relative rounded-2xl overflow-hidden px-5 py-5 flex items-center gap-4 bg-white"
      style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.22)" }}>
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: "color-mix(in srgb, var(--brand-primary) 7%, transparent)" }} />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: "color-mix(in srgb, var(--brand-primary) 7%, transparent)" }} />
      <audio ref={ref} src={src} preload="none"
        onTimeUpdate={() => { if (!ref.current) return; setCurrent(ref.current.currentTime); setProgress(ref.current.currentTime / duration * 100); }}
        onLoadedMetadata={() => { if (ref.current) setDuration(ref.current.duration); }}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrent(0); }} />
      <button onClick={toggle} className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: GRAD_CTA }}>
        {playing
          ? <svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="6" y="4" width="4" height="16" rx="1.5" fill="#fff" /><rect x="14" y="4" width="4" height="16" rx="1.5" fill="#fff" /></svg>
          : <svg viewBox="0 0 24 24" fill="#fff" className="w-5 h-5"><polygon points="7,3 21,12 7,21" /></svg>}
      </button>
      <div className="relative z-10 flex-1 min-w-0">
        <p className="font-extrabold text-sm mb-1 leading-tight" style={{ color: INK }}>{label}</p>
        <p className="text-[11px] mb-3" style={{ color: "rgba(22,19,14,0.45)" }}>Depoimento em áudio</p>
        <div className="relative h-1.5 rounded-full cursor-pointer" style={{ background: "rgba(22,19,14,0.12)" }} onClick={seek}>
          <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress}%`, background: P }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px]" style={{ color: "rgba(22,19,14,0.45)" }}>{fmt(current)}</span>
          <span className="text-[10px]" style={{ color: "rgba(22,19,14,0.45)" }}>{duration ? fmt(duration) : "0:00"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Card de feature/bônus (estilo painel: torto, borda definida) ────────────
function FeatureCard({ item, index, badge, decor }: { item: CardItem; index: number; badge: ReactNode; decor?: LpDecor }) {
  const rot = [-1.3, 1.2, -1.1, 1.3][index % 4];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: rot }}
      whileInView={{ opacity: 1, y: 0, rotate: rot }}
      whileHover={{ rotate: 0, y: -4 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative bg-white rounded-[1.5rem] p-5 overflow-visible"
      style={{ border: CARD_EDGE, boxShadow: CARD_SHADOW }}>
      {index === 0 && (
        <div className="absolute -top-3.5 -right-2 pointer-events-none z-10">
          <Ornament size={44} color={STAR} decor={decor} />
        </div>
      )}
      <div className="flex items-start gap-3 mb-4">
        {badge}
        <div className="flex-1">
          <h3 className="font-extrabold text-base leading-tight text-foreground">{item.title}</h3>
          <p className="text-sm mt-1.5 leading-relaxed text-foreground/55 whitespace-pre-line">{item.description}</p>
        </div>
      </div>
      <div className="w-full rounded-xl overflow-hidden" style={{ border: CARD_EDGE }}>
        <img src={item.image} alt={item.alt} className="w-full h-auto object-cover" loading="lazy" decoding="async" fetchPriority="low" />
      </div>
    </motion.div>
  );
}

// ─── FAQ (accordion próprio, cards do painel) ────────────────────────────────
function Faq({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="bg-white rounded-[1.4rem] px-5 cursor-pointer"
            style={{ border: CARD_EDGE, boxShadow: isOpen ? "0 12px 30px rgba(22,19,14,0.12)" : "0 3px 10px rgba(22,19,14,0.05)" }}
            onClick={() => setOpen(isOpen ? null : i)}>
            <div className="flex items-center justify-between gap-3 py-5">
              <p className="text-foreground text-sm font-bold leading-snug">{item.question}</p>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: P }} />
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }} className="overflow-hidden">
                  <p className="text-foreground/55 text-sm leading-relaxed pb-5">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Corpo da LP ─────────────────────────────────────────────────────────────
const LpBody = (props: LpBodyProps) => {
  const {
    checkoutLink, ctaLabel,
    featuresKicker, featuresTitle, features, bonusCards,
    depoimentosTitle, depoimentosSub, depoimentosCtaLabel,
    videoDepoimentos, imageDepoimentos, audioDepoimentos, testimonialAuthors,
    criadoraKicker, criadoraTitle, criadoraParagraphs, criadoraImage,
    showSuporte = true, suporteTitle, suporteDescription,
    ofertaHeading, ofertaSubtitle, ofertaBannerLabel, ofertaImage, ofertaTitle,
    ofertaItems, ofertaDePrice, paidPrice, ofertaCtaLabel,
    garantiaTitle, garantiaBody, faqItems, footerBrand,
    decor = "star", checkerColors,
  } = props;

  // Carrossel intercalado: vídeo, imagem, vídeo, imagem
  const carrossel = Array.from({ length: Math.max(videoDepoimentos.length, imageDepoimentos.length) }).flatMap((_, i) => {
    const items: { tipo: "video" | "img"; src: string; imageIndex?: number }[] = [];
    if (videoDepoimentos[i]) items.push({ tipo: "video", src: videoDepoimentos[i] });
    if (imageDepoimentos[i]) items.push({ tipo: "img", src: imageDepoimentos[i], imageIndex: i });
    return items;
  });

  return (
    <>
      {/* ===== O QUE VOCÊ RECEBE ===== */}
      <section id="conteudo" className="lp-deferred-section py-16 px-4" style={{ background: "var(--brand-background)" }}>
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10 relative">
            <Kicker>{featuresKicker}</Kicker>
            <h2 className="relative font-extrabold text-[1.6rem] leading-[1.2] tracking-tight text-foreground">{featuresTitle}</h2>
          </motion.div>

          <div className="grid gap-5">
            {features.map((f, i) => (
              <FeatureCard key={i} item={f} index={i} decor={decor}
                badge={
                  <span className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm"
                    style={{ background: GRAD_CTA, boxShadow: "0 4px 12px color-mix(in srgb, var(--brand-primary) 35%, transparent)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                } />
            ))}

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex items-center gap-3 my-1">
              <span className="flex-1 h-px" style={{ background: "rgba(22,19,14,0.12)" }} />
              <span className="inline-block px-3 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase font-extrabold whitespace-nowrap"
                style={{ background: `var(--lp-pill, ${ACCENT})`, color: "var(--lp-pill-text, #16130E)" }}>
                Bônus Exclusivos
              </span>
              <span className="flex-1 h-px" style={{ background: "rgba(22,19,14,0.12)" }} />
            </motion.div>

            {bonusCards.map((b, i) => (
              <FeatureCard key={`bonus-${i}`} item={b} index={i + 1} decor={decor}
                badge={
                  <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-[0.14em] uppercase"
                    style={{ background: `var(--lp-pill, ${ACCENT})`, color: "var(--lp-pill-text, #16130E)" }}>
                    Bônus
                  </span>
                } />
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-9">
            <CtaBtn checkoutLink={checkoutLink}>{ctaLabel}</CtaBtn>
          </motion.div>
        </div>
      </section>

      {/* ===== DEPOIMENTOS ===== */}
      <section className="lp-deferred-section pt-20 pb-20 px-4 relative"
        style={{ background: `var(--lp-depo-bg, ${GRAD_CTA})` }}>
        {/* Troca de seção: o creme entra e sai em onda */}
        <Edge color="var(--brand-background)" position="top" />
        <Edge color="var(--brand-background)" position="bottom" />
        {/* Pinceladas orgânicas (mesma textura da garantia) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
            <path d="M-30 380 C 60 300, 100 430, 185 340 S 320 160, 440 260"
              stroke="rgba(255,255,255,0.07)" strokeWidth="46" fill="none" strokeLinecap="round" />
            <path d="M-20 120 C 90 60, 170 190, 260 90 S 380 160, 430 70"
              stroke="rgba(22,19,14,0.08)" strokeWidth="30" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="max-w-md mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10 relative">
            <Kicker onDark>Resultados reais</Kicker>
            <h2 className="text-[1.6rem] font-extrabold leading-tight mb-2 text-white tracking-tight">{depoimentosTitle}</h2>
            <p className="text-sm text-white/55">{depoimentosSub}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-7">
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}>
              {carrossel.map((item, i) => (
                <div key={`${item.tipo}-${item.src}`} className={`snap-center shrink-0 ${testimonialAuthors?.length ? "w-[82%]" : "w-[78%]"}`}>
                  {item.tipo === "video"
                    ? <VideoPlayer src={item.src} />
                    : (() => {
                        const author = testimonialAuthors?.[item.imageIndex ?? i];
                        return (
                          <div className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 16px 36px rgba(0,0,0,0.35)" }}>
                            {author && (
                              <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: "var(--brand-background)" }}>
                                <img
                                  src={author.image}
                                  alt={author.name}
                                  className="w-12 h-12 rounded-full object-cover shrink-0"
                                  style={{ border: "3px solid var(--brand-primary)", boxShadow: "0 4px 12px rgba(22,19,14,0.18)" }}
                                  loading="lazy"
                                  decoding="async"
                                  fetchPriority="low"
                                />
                                <div className="min-w-0">
                                  <p className="font-extrabold text-sm leading-tight truncate" style={{ color: INK }}>{author.name}</p>
                                  <p className="text-[11px] font-semibold mt-1" style={{ color: "var(--brand-primary)" }}>Afiliada Shopee</p>
                                </div>
                              </div>
                            )}
                            <img src={item.src} alt={`Depoimento de ${author?.name ?? `cliente ${i + 1}`}`} className="w-full h-auto block" loading="lazy" decoding="async" fetchPriority="low" />
                          </div>
                        );
                      })()}
                </div>
              ))}
            </div>
          </motion.div>

          {audioDepoimentos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="space-y-3 mb-9">
              <p className="text-white/70 text-sm font-semibold mb-1">Ouça também quem já usou</p>
              <p className="text-white/40 text-xs mb-4">Depoimentos em áudio, aperte play para ouvir</p>
              {audioDepoimentos.map((item, i) => <AudioPlayer key={i} src={item.src} label={item.label} />)}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <CtaBtn checkoutLink={checkoutLink} look="white">{depoimentosCtaLabel}</CtaBtn>
          </motion.div>
        </div>
      </section>

      {/* ===== A CRIADORA ===== */}
      {criadoraImage && (
        <section className="lp-deferred-section py-16 px-4" style={{ background: "var(--brand-background)" }}>
          <div className="max-w-md mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex flex-col items-center text-center">
              <motion.div
                initial={{ rotate: -1.4 }} whileInView={{ rotate: -1.4 }} whileHover={{ rotate: 0 }}
                className="w-full max-w-sm rounded-[1.5rem] overflow-hidden mb-6 bg-white p-2.5"
                style={{ border: CARD_EDGE, boxShadow: CARD_SHADOW }}>
                <img src={criadoraImage} alt="Criadora" className="w-full h-auto rounded-[1.1rem]" loading="lazy" decoding="async" fetchPriority="low" />
              </motion.div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40 mb-3">{criadoraKicker}</p>
              <h2 className="text-[1.6rem] font-extrabold text-foreground tracking-tight leading-[1.2] mb-5">{criadoraTitle}</h2>
              <div className="text-sm text-foreground/55 leading-relaxed space-y-3 text-left max-w-sm">
                {criadoraParagraphs?.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
              </div>
              <div className="mt-8 w-full max-w-sm">
                <CtaBtn checkoutLink={checkoutLink}>{ctaLabel}</CtaBtn>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== SUPORTE WHATSAPP ===== */}
      {showSuporte && (
        <section className="lp-deferred-section relative pt-20 pb-16 px-4" style={{ background: "var(--lp-support-bg, linear-gradient(180deg, #064E45 0%, #0A7566 100%))" }}>
          <Edge color="var(--brand-background)" position="top" />
          <div className="max-w-md mx-auto flex flex-col items-center text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex flex-col items-center w-full">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(255,255,255,0.12)" }}>
                <svg viewBox="0 0 24 24" fill="white" style={{ width: 52, height: 52 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <p className="text-white/60 text-[10px] font-bold tracking-[0.22em] uppercase mb-3">Suporte incluído</p>
              <h2 className="text-white font-extrabold text-3xl leading-tight mb-3 tracking-tight">{suporteTitle}</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs">
                {suporteDescription}
              </p>
              <CtaBtn checkoutLink={checkoutLink} look="support">{ctaLabel}</CtaBtn>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== OFERTA ===== */}
      <section id="oferta" className="lp-deferred-section py-16 px-4" style={{ background: "var(--brand-background)" }}>
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-8">
            <h2 className="text-xl font-extrabold text-foreground leading-tight tracking-tight">{ofertaHeading}</h2>
            <p className="text-foreground/50 text-sm mt-3">{ofertaSubtitle}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-[1.75rem] p-6 text-left overflow-hidden"
            style={{ border: CARD_EDGE, boxShadow: CARD_SHADOW }}>
            <div className="mb-5 -mx-6 -mt-6 overflow-hidden">
              <div className="py-2.5 px-4 text-center" style={{ background: "var(--lp-banner, #FFBF29)" }}>
                <span className="text-sm font-extrabold tracking-wide" style={{ color: "var(--lp-banner-text, #16130E)" }}>{ofertaBannerLabel}</span>
              </div>
              <img src={ofertaImage} alt={ofertaTitle} className="w-full h-auto" loading="lazy" decoding="async" fetchPriority="low" />
            </div>

            <h3 className="font-extrabold text-lg text-foreground text-center mb-5">{ofertaTitle}</h3>

            <ul className="space-y-3 mb-6">
              {ofertaItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: GREEN, boxShadow: `0 2px 6px color-mix(in srgb, ${GREEN} 30%, transparent)` }}>
                    <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
                  </span>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <div className="text-center mb-6 py-4 border-y" style={{ borderColor: "rgba(22,19,14,0.10)" }}>
              <p className="text-red-500 line-through text-sm">De R${ofertaDePrice}</p>
              <p className="text-5xl font-extrabold mt-1 tabular-nums" style={{ color: GREEN }}>R${paidPrice}</p>
            </div>

            <CtaBtn checkoutLink={checkoutLink} variant="direct" look="green">{ofertaCtaLabel}</CtaBtn>
          </motion.div>
        </div>
      </section>

      {/* ===== GARANTIA ===== */}
      <section className="lp-deferred-section pt-24 pb-24 px-4 relative"
        style={{ background: `var(--lp-garantia-bg, ${GRAD_CTA})` }}>
        <Edge color="var(--brand-background)" position="top" />
        <Edge color="var(--brand-background)" position="bottom" />
        {/* Pinceladas orgânicas (textura do hero do painel) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
            <path d="M-30 380 C 60 300, 100 430, 185 340 S 320 160, 440 260"
              stroke="rgba(255,255,255,0.07)" strokeWidth="46" fill="none" strokeLinecap="round" />
            <path d="M-20 120 C 90 60, 170 190, 260 90 S 380 160, 430 70"
              stroke="rgba(22,19,14,0.08)" strokeWidth="30" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div className="max-w-md mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute pointer-events-none" style={{ left: -30, top: -6 }}>
                <Ornament size={50} color={STAR_ONDARK} decor={decor} />
              </div>
              <img src={garantiaSelo} alt="Selo de garantia" className="w-44 h-auto mb-6 drop-shadow-2xl" loading="lazy" decoding="async" fetchPriority="low" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
              {garantiaTitle}
            </h2>
            <p className="text-white/85 text-sm leading-relaxed max-w-sm text-left">{garantiaBody}</p>
            <div className="mt-8 w-full max-w-sm">
              <CtaBtn checkoutLink={checkoutLink} look="white">{ctaLabel}</CtaBtn>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="lp-deferred-section py-16 px-4" style={{ background: "var(--brand-background)" }}>
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-9">
            <Kicker>Tire suas dúvidas</Kicker>
            <h2 className="text-[1.6rem] font-extrabold text-foreground tracking-tight">Perguntas Frequentes</h2>
          </motion.div>

          <Faq items={faqItems} />

          <div className="mt-9">
            <CtaBtn checkoutLink={checkoutLink}>{ctaLabel}</CtaBtn>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      {checkerColors && (
        <div style={{ height: 14, background: `repeating-conic-gradient(${checkerColors[0]} 0% 25%, ${checkerColors[1]} 0% 50%) 0 0 / 28px 28px` }} />
      )}
      <div className="py-8 px-4 text-center" style={{ background: CARD_DARK }}>
        <p className="text-white/40 text-[10px] font-semibold tracking-[0.15em] uppercase">
          {footerBrand}
        </p>
        <div className="flex justify-center gap-5 mt-3">
          <a href="/termos" className="text-white/30 text-[10px] underline underline-offset-2">Termos de Uso</a>
          <a href="/privacidade" className="text-white/30 text-[10px] underline underline-offset-2">Privacidade</a>
          <a href="mailto:suporte@afiliadasbrasil.com" className="text-white/30 text-[10px] underline underline-offset-2">Entrar em contato</a>
        </div>
      </div>
    </>
  );
};

export default LpBody;
