import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Check, ChevronRight, Play, Pause, Zap, Loader2, X, Clock,
  RefreshCw, Shuffle, Captions, Mic, Scissors, Search, Wand2,
} from "lucide-react";
import { NichoIcon, EvaLoader, Starburst, type NichoTipo } from "@/components/EvaIcons";
import type { BrandTheme } from "@/lib/brandTheme";

// ─── Tema ────────────────────────────────────────────────────────────────────
const P         = "var(--brand-primary)";
const LIME      = "var(--brand-accent)";
const INK       = "#16130E";
const CARD_DARK = "var(--brand-card-dark)";
const CARD_EDGE   = "1.5px solid rgba(22,19,14,0.10)";
const CARD_SHADOW = "0 2px 0 rgba(22,19,14,0.05), 0 14px 36px rgba(22,19,14,0.08)";
const PAGE_BG   = { background: "var(--brand-background)" };
const TIKTOK_RED = "#FE2C55";

const R2_EVA       = "https://pub-0b252875d435478a830daa595535d16c.r2.dev";

export interface ProdutoLite {
  id: string; nome: string; preco: string; comissao: string; img: string; badge: string;
  ranking?: {
    soldTotal: string;
    soldToday: string;
    commissionToday: string;
    reason: string;
  };
}

export interface ProdutoFunil extends ProdutoLite {
  videos?: string[];
  captions?: string[];
  hashtags?: string;
}

export interface EvaFlowOptions {
  niches?: { id: string; label: string; tipo: NichoTipo }[];
  catalog?: Record<string, ProdutoFunil[]>;
  quantities?: number[];
  skipProductVerification?: boolean;
  simpleReview?: boolean;
  onApprove?: () => void;
}

interface VideoRow { message_id: string; nicho: string; link_video: string | null; }

function ChannelDots({ channels, selected, size = 18 }: {
  channels: BrandTheme["channels"]; selected?: string[]; size?: number;
}) {
  const visible = channels.filter(channel => !selected || selected.includes(channel.name));
  return (
    <span className="inline-flex items-center gap-1">
      {visible.map(channel => (
        <span key={channel.name} className="inline-flex items-center justify-center rounded-full bg-white" style={{ width: size + 8, height: size + 8 }}>
          <img src={channel.logoUrl} alt={channel.name} style={{ width: size, height: size }} draggable={false} />
        </span>
      ))}
    </span>
  );
}

function BtnLime({ children, onClick, disabled }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-center justify-center gap-2 font-bold py-[14px] rounded-2xl text-sm transition-all active:scale-[0.98] disabled:opacity-40"
      style={{ background: LIME, color: INK, boxShadow: disabled ? undefined : "0 6px 20px rgba(140,190,20,0.35)" }}>
      {children}
    </button>
  );
}

function Dots({ current }: { current: number }) {
  const total = 4;
  return (
    <div className="flex items-center">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current, curr = i === current;
        return (
          <div key={i} className="flex items-center">
            <motion.div
              animate={curr ? { scale: [1, 1.14, 1] } : { scale: 1 }}
              transition={curr ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
              style={{
                background: done ? LIME : curr ? P : "#fff",
                color: done ? INK : curr ? "#fff" : "rgba(22,19,14,0.35)",
                border: done || curr ? "none" : CARD_EDGE,
                boxShadow: curr ? "0 4px 12px rgba(122,43,245,0.35)" : undefined,
              }}>
              {done ? <Check className="w-3 h-3" strokeWidth={3.5} /> : i + 1}
            </motion.div>
            {i < total - 1 && (
              <div className="w-4 h-[2.5px] rounded-full" style={{ background: i < current ? LIME : "rgba(22,19,14,0.12)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TopBar({ step, label, onBack }: { step: number; label: string; onBack: () => void }) {
  return (
    <div className="px-5 pt-7 pb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 text-foreground/50" />
          <span className="text-[11px] font-bold text-foreground/50">Voltar</span>
        </div>
        <span className="text-[11px] font-bold" style={{ color: P }}>{label}</span>
      </div>
      <Dots current={step} />
    </div>
  );
}

function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.97)" }} onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-6 right-5 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.12)" }}>
        <X className="w-5 h-5 text-white" />
      </button>
      <div className="w-full max-w-sm px-4" onClick={e => e.stopPropagation()}>
        <video src={url} controls autoPlay playsInline className="w-full rounded-2xl"
          style={{ maxHeight: "78vh", background: "#000" }} />
      </div>
    </motion.div>
  );
}

// ─── Dados do fluxo ──────────────────────────────────────────────────────────

const NICHOS: { id: string; label: string; tipo: NichoTipo }[] = [
  { id: "moda",        label: "Moda e beleza",     tipo: "camiseta" },
  { id: "casa",        label: "Casa e decoração",  tipo: "panela" },
  { id: "eletro",      label: "Eletrônicos",       tipo: "celular" },
  { id: "maternidade", label: "Maternidade",       tipo: "mamadeira" },
  { id: "pet",         label: "Pet",               tipo: "pata" },
  { id: "saude",       label: "Saúde e bem-estar", tipo: "halter" },
  { id: "auto",        label: "A assistente escolhe", tipo: "play" },
];

const PESQUISA_STEPS = () => [
  "Preparando o demonstrativo...",
  "Carregando os seis produtos da escova a vapor...",
  "Separando as imagens prontas para você escolher...",
  "Preparando os três vídeos do produto pet...",
  "Verificando os materiais do fluxo demonstrativo...",
  "Organizando a experiência de edição...",
  "Tudo pronto para escolher o produto!",
];

const FORMATOS = [
  { id: "auto",     label: "Deixar a assistente escolher", rec: true },
  { id: "achadinho", label: "Achadinho viral" },
  { id: "demo",     label: "Demonstração" },
  { id: "oferta",   label: "Oferta rápida" },
  { id: "review",   label: "Review narrado" },
];

const STUDIO_STEPS: { label: string; fx: string; Icon: typeof Search }[] = [
  { label: "Buscando materiais autorizados",   fx: "scan",    Icon: Search },
  { label: "Selecionando as melhores cenas",   fx: "scan",    Icon: Wand2 },
  { label: "Criando novos cortes",             fx: "cut",     Icon: Scissors },
  { label: "Preparando o gancho",              fx: "hook",    Icon: Zap },
  { label: "Criando a narração",               fx: "voice",   Icon: Mic },
  { label: "Adicionando legendas",             fx: "caption", Icon: Captions },
  { label: "Aplicando elementos visuais",      fx: "fx",      Icon: Wand2 },
  { label: "Verificando o áudio",              fx: "voice",   Icon: Mic },
  { label: "Finalizando o vídeo",              fx: "final",   Icon: Check },
];

const LEGENDAS = [
  "Essa escova a vapor deixa o pelo do seu pet limpo e macio em poucos minutos",
  "O cuidado que cães e gatos merecem para um pelo bonito e sem nós",
  "Banho e escovação em casa com muito mais praticidade para você e seu pet",
];
const HASHTAGS = "#pet #pets #cachorro #gato #cuidadopet #tiktokshop";
const HASHTAGS_MALU = "#pet #pets #cachorro #gato #cuidadopet #shopee #afiliadoshopee";

const DEMO_VIDEOS: VideoRow[] = [
  { message_id: "ppet01", nicho: "05 - Pets", link_video: `${R2_EVA}/ppet01.mp4` },
  { message_id: "ppet02", nicho: "05 - Pets", link_video: `${R2_EVA}/ppet02.mp4` },
  { message_id: "ppet03", nicho: "05 - Pets", link_video: `${R2_EVA}/ppet03.mp4` },
];

// ─── Fase 1: Nicho ───────────────────────────────────────────────────────────

function FaseNicho({ nicho, setNicho, onNext, onBack, brandName, items, description }: {
  nicho: string; setNicho: (v: string) => void; onNext: () => void; onBack: () => void; brandName: string;
  items?: { id: string; label: string; tipo: NichoTipo }[]; description?: string;
}) {
  const nichos = (items ?? NICHOS).map(n => n.id === "auto" ? { ...n, label: `A ${brandName} escolhe` } : n);
  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <TopBar step={0} label="Nicho" onBack={onBack} />
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pb-10">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Escolha do nicho</p>
          <h2 className="font-extrabold text-[1.7rem] leading-[1.15] tracking-tight">
            Qual nicho você<br /><em className="italic" style={{ color: P }}>quer trabalhar?</em>
          </h2>
          <p className="text-foreground/50 text-[12px] mt-3 mb-5">{description ?? "Neste demonstrativo, os mesmos produtos pet aparecem independentemente do nicho escolhido."}</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {nichos.map((n, i) => {
              const sel = nicho === n.id;
              return (
                <motion.div key={n.id} onClick={() => setNicho(n.id)}
                  animate={{ rotate: sel ? 0 : [-1.4, 1.4, 1.1, -1.1, 1.3, -1.3, 0.9][i], scale: sel ? 1.04 : 1 }}
                  whileTap={{ scale: 0.93 }}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl py-5 cursor-pointer ${n.id === "auto" ? "col-span-2" : ""}`}
                  style={{
                    background: sel ? P : "#fff",
                    border: sel ? `1.5px solid ${P}` : CARD_EDGE,
                    boxShadow: sel ? "0 12px 26px rgba(122,43,245,0.38)" : "0 2px 8px rgba(22,19,14,0.05)",
                  }}>
                  {sel && (
                    <motion.div className="absolute -top-2.5 -right-2 pointer-events-none"
                      initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 14 }}>
                      <Starburst size={28} color={LIME} spin={false} />
                    </motion.div>
                  )}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: sel ? "rgba(255,255,255,0.16)" : "rgba(122,43,245,0.07)" }}>
                    <NichoIcon tipo={n.tipo} size={27} stroke={sel ? "#fff" : INK} accent={sel ? LIME : P}
                      bg={sel ? "#9350F7" : "#F4EFFE"} />
                  </div>
                  <span className={`text-[12px] font-bold ${sel ? "text-white" : "text-foreground"}`}>{n.label}</span>
                </motion.div>
              );
            })}
          </div>
          <BtnLime onClick={onNext}>Encontrar produtos <ChevronRight className="w-4 h-4" /></BtnLime>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Fase 2: Pesquisa de produtos ────────────────────────────────────────────

function FasePesquisa({ onDone, searchImageUrl, brandName, customSteps }: { onDone: () => void; searchImageUrl: string; brandName: string; customSteps?: string[] }) {
  const steps = useMemo(() => customSteps ?? PESQUISA_STEPS(), [customSteps]);
  const [idx, setIdx] = useState(0);
  const last = steps.length - 1;

  useEffect(() => {
    if (idx > last) { onDone(); return; }
    const stepDuration = customSteps ? (idx === last ? 420 : 340) : (idx === last ? 620 : 740);
    const t = setTimeout(() => setIdx(i => i + 1), stepDuration);
    return () => clearTimeout(t);
  }, [customSteps, idx, last, onDone]);

  const visible = Math.min(idx + 1, steps.length);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="min-h-screen flex flex-col items-center justify-center px-8" style={PAGE_BG}>
      <div className="relative w-full max-w-xs">
        {/* Eva procurando os produtos */}
        <div className="relative flex justify-center pb-2">
          <motion.div className="absolute pointer-events-none" style={{ top: 4 }}
            animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
            <Starburst size={132} color="rgba(185,242,39,0.28)" spin={false} />
          </motion.div>
          <motion.img src={searchImageUrl} alt={`${brandName} pesquisando`} draggable={false}
            className="relative" style={{ width: 148, height: "auto" }}
            loading="eager" decoding="async" fetchPriority="high"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            transition={{ opacity: { duration: 0.5 }, y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" } }} />
        </div>
        <p className="text-foreground/40 text-[10px] font-bold tracking-[0.18em] uppercase text-center mb-5">Pesquisa da {brandName}</p>
        <div className="bg-white rounded-[1.5rem] px-5 py-6 space-y-4" style={{ border: CARD_EDGE, boxShadow: CARD_SHADOW }}>
          {Array.from({ length: visible }).map((_, i) => {
            const isDone = i < idx;
            const isCurrent = i === idx && idx <= last;
            const isFinal = i === last;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: isCurrent ? 1 : 0.45, scale: isCurrent ? 1 : 0.95 }}
                transition={{ duration: 0.4 }} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: isDone || (isFinal && isCurrent) ? LIME : isCurrent ? P : "rgba(22,19,14,0.08)" }}>
                  {(isDone || (isFinal && isCurrent))
                    ? <Check className="w-3 h-3" strokeWidth={3.5} style={{ color: INK }} />
                    : isCurrent ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : null}
                </div>
                <p className={`text-[13px] font-semibold leading-snug ${isCurrent ? "text-foreground" : "text-foreground/45"}`}>{steps[i]}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Fase 3: Escolha do produto ──────────────────────────────────────────────

function FaseProdutos({ produtos, sel, setSel, onNext, onBack, topThree = false }: {
  produtos: ProdutoLite[]; sel: string | null; setSel: (id: string) => void; onNext: () => void; onBack: () => void;
  topThree?: boolean;
}) {
  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <TopBar step={1} label="Produto" onBack={onBack} />
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pb-28">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">
            {topThree ? "Ranking atualizado hoje" : "Oportunidades encontradas"}
          </p>
          <h2 className="font-extrabold text-[1.7rem] leading-[1.15] tracking-tight">
            {topThree ? (
              <>Top 3 produtos<br /><em className="italic" style={{ color: P }}>mais vendidos hoje</em></>
            ) : (
              <>Melhores produtos<br /><em className="italic" style={{ color: P }}>para você vender</em></>
            )}
          </h2>
          <p className="text-foreground/50 text-[12px] mt-3 mb-5">
            {topThree ? "Escolha um dos três produtos mais vendidos de hoje." : "Escolha uma das seis imagens da escova a vapor para pets."}
          </p>
          {topThree ? (
            <div className="space-y-3.5">
              {produtos.map((p, i) => {
                const isSel = sel === p.id;
                const ranking = p.ranking;
                return (
                  <motion.div key={p.id} onClick={() => setSel(p.id)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0, scale: isSel ? 1.015 : 1 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ delay: 0.05 * i }}
                    className="relative flex items-stretch bg-white rounded-[1.4rem] overflow-hidden cursor-pointer"
                    style={{
                      border: isSel ? `1.5px solid ${P}` : CARD_EDGE,
                      boxShadow: isSel ? "0 12px 28px rgba(249,115,22,0.24)" : "0 4px 12px rgba(22,19,14,0.06)",
                    }}>
                    <div className="relative w-[43%] shrink-0 self-start">
                      <img src={p.img} alt={p.nome} className="block h-auto w-full" loading="eager" decoding="async" />
                      <motion.div
                        initial={{ scale: 0, rotate: -12 }}
                        animate={{ scale: 1, rotate: i === 0 ? -4 : i === 1 ? 3 : -2 }}
                        transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.08 + i * 0.04 }}
                        className="absolute top-2 left-2 z-10 h-9 min-w-9 px-2 rounded-full flex items-center justify-center text-[11px] font-extrabold"
                        style={{
                          background: i === 0 ? P : i === 1 ? CARD_DARK : LIME,
                          color: i === 2 ? INK : "#fff",
                          boxShadow: "0 5px 14px rgba(22,19,14,0.24)",
                          border: "2px solid rgba(255,255,255,0.9)",
                        }}>
                        #{i + 1}
                      </motion.div>
                    </div>

                    <div className="min-w-0 flex-1 px-3 py-3.5 flex flex-col justify-center">
                      {isSel && (
                        <motion.div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 320, damping: 16 }}
                          style={{ background: LIME, boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}>
                          <Check className="w-4 h-4" strokeWidth={3.5} style={{ color: INK }} />
                        </motion.div>
                      )}
                      <p className="text-[8px] font-extrabold tracking-[0.12em] uppercase mb-1" style={{ color: P }}>
                        Top {i + 1} do dia
                      </p>
                      <p className="text-[13px] font-extrabold leading-tight pr-4">Por que está no Top {i + 1}?</p>

                      <div className="space-y-2 mt-3">
                        <div className="rounded-xl px-2.5 py-2" style={{ background: "rgba(249,115,22,0.09)" }}>
                          <p className="text-[7px] font-bold uppercase tracking-wide text-foreground/40">Vendas hoje</p>
                          <p className="text-[13px] font-extrabold leading-tight mt-0.5" style={{ color: P }}>{ranking?.soldToday}</p>
                        </div>
                        <div className="rounded-xl px-2.5 py-2" style={{ background: "rgba(77,124,15,0.08)" }}>
                          <p className="text-[7px] font-bold uppercase tracking-wide" style={{ color: "#4d7c0f" }}>Comissões hoje</p>
                          <p className="text-[13px] font-extrabold leading-tight mt-0.5" style={{ color: "#4d7c0f" }}>{ranking?.commissionToday}</p>
                        </div>
                      </div>

                      <p className="text-[9px] font-semibold leading-snug text-foreground/50 mt-3">{ranking?.reason}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {produtos.map((p, i) => {
                const isSel = sel === p.id;
                return (
                  <motion.div key={p.id} onClick={() => setSel(p.id)}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, scale: isSel ? 1.02 : 1 }}
                    whileTap={{ scale: 0.96 }} transition={{ delay: 0.04 * i }}
                    className="relative bg-white rounded-[1.4rem] overflow-hidden cursor-pointer"
                    style={{ border: isSel ? `1.5px solid ${P}` : CARD_EDGE, boxShadow: isSel ? "0 12px 28px rgba(122,43,245,0.28)" : "0 4px 12px rgba(22,19,14,0.06)" }}>
                    {isSel && (
                      <motion.div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 320, damping: 16 }}
                        style={{ background: LIME, boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
                        <Check className="w-4 h-4" strokeWidth={3.5} style={{ color: INK }} />
                      </motion.div>
                    )}
                    <img src={p.img} alt="" className="block w-full" loading="eager" decoding="async" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-5 pt-8 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, #F4EFE6 55%)" }}>
          <div className="max-w-md mx-auto pointer-events-auto">
            <BtnLime onClick={onNext} disabled={!sel}>
              Trabalhar com este produto <ChevronRight className="w-4 h-4" />
            </BtnLime>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fase 4: Verificação da vitrine ──────────────────────────────────────────

function FaseVitrine({ produto, onDone, brandName }: { produto: ProdutoLite; onDone: () => void; brandName: string }) {
  const [etapa, setEtapa] = useState<"verificando" | "capturando" | "ok">("verificando");

  useEffect(() => {
    const t1 = setTimeout(() => setEtapa("capturando"), 1700);
    const t2 = setTimeout(() => setEtapa("ok"), 4100);
    const t3 = setTimeout(onDone, 5700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-8" style={PAGE_BG}>
      <div className="w-full max-w-xs">
        <div className="relative bg-white rounded-[1.5rem] px-5 py-6 text-center" style={{ border: CARD_EDGE, boxShadow: CARD_SHADOW }}>
          {etapa === "ok" && (
            <motion.div className="absolute -top-4 -right-3 pointer-events-none"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260 }}>
              <Starburst size={52} color={LIME} />
            </motion.div>
          )}
          <div className="relative w-[132px] mx-auto mb-4">
            <div className="rounded-xl overflow-hidden" style={{ border: CARD_EDGE }}>
              <img src={produto.img} alt="" className="w-full block" />
            </div>
            <AnimatePresence>
              {etapa === "ok" && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -bottom-2.5 -right-2.5 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: LIME, boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
                  <Check className="w-4.5 h-4.5" strokeWidth={3.5} style={{ color: INK }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {etapa === "verificando" && (
            <div className="space-y-3">
              <EvaLoader size={34} className="py-0" />
              <p className="text-[13px] font-semibold text-foreground/60">{brandName === "Malu" ? "Verificando o produto na Shopee..." : "Verificando sua vitrine no TikTok Shop..."}</p>
            </div>
          )}
          {etapa === "capturando" && (
            <div className="space-y-3">
              <p className="text-[13px] font-semibold text-foreground">{brandName === "Malu" ? "Capturando seu link de afiliada..." : "Adicionando produto à sua vitrine…"}</p>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(22,19,14,0.08)" }}>
                <motion.div className="h-full rounded-full" style={{ background: P }}
                  initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.2, ease: "easeInOut" }} />
              </div>
            </div>
          )}
          {etapa === "ok" && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="text-[14px] font-extrabold" style={{ color: brandName === "Malu" ? P : "#4d7c0f" }}>
              {brandName === "Malu" ? "Link de afiliada capturado" : "Produto adicionado com sucesso"}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Fase 5: Configuração dos vídeos ─────────────────────────────────────────

function FaseConfig({ qtd, setQtd, formato, setFormato, onNext, onBack, brandName, quantities }: {
  qtd: number; setQtd: (n: number) => void; formato: string; setFormato: (f: string) => void;
  onNext: () => void; onBack: () => void; brandName: string; quantities?: number[];
}) {
  const formatos = FORMATOS.map(f => f.id === "auto" ? { ...f, label: `Deixar a ${brandName} escolher` } : f);
  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <TopBar step={2} label="Vídeos" onBack={onBack} />
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pb-10">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Configuração</p>
          <h2 className="font-extrabold text-[1.7rem] leading-[1.15] tracking-tight">
            Quantos vídeos<br /><em className="italic" style={{ color: P }}>vamos criar?</em>
          </h2>
          <p className="text-foreground/50 text-[12px] mt-3">
            {quantities ? "Escolha quantos vídeos a Malu deve criar com o produto selecionado." : "Nesta demonstração, os três vídeos pet são sempre utilizados, independentemente da quantidade selecionada."}
          </p>
          <div className="grid grid-cols-3 gap-3 mt-5 mb-7">
            {(quantities ?? [3, 5, 10]).map((n, i) => {
              const sel = qtd === n;
              return (
                <motion.div key={n} onClick={() => setQtd(n)}
                  animate={{ rotate: sel ? 0 : [-1, 1.2, -0.8][i], scale: sel ? 1.04 : 1 }}
                  whileTap={{ scale: 0.94 }}
                  className="relative flex flex-col items-center rounded-2xl py-4 cursor-pointer"
                  style={{
                    background: sel ? CARD_DARK : "#fff",
                    border: sel ? "1.5px solid #16130E" : CARD_EDGE,
                    boxShadow: sel ? "0 12px 26px rgba(22,19,14,0.30)" : "0 2px 8px rgba(22,19,14,0.05)",
                  }}>
                  {sel && (
                    <motion.div className="absolute -top-2.5 -right-2 pointer-events-none"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Starburst size={24} color={LIME} spin={false} />
                    </motion.div>
                  )}
                  <p className="text-[1.6rem] font-extrabold leading-none" style={{ color: sel ? LIME : INK }}>{n}</p>
                  <p className={`text-[10px] font-bold mt-1 ${sel ? "text-white/60" : "text-foreground/45"}`}>vídeos</p>
                </motion.div>
              );
            })}
          </div>

          <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase mb-3">Formato dos vídeos</p>
          <div className="grid grid-cols-2 gap-2.5 mb-7">
            {formatos.map((f) => {
              const sel = formato === f.id;
              return (
                <motion.div key={f.id} onClick={() => setFormato(f.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 cursor-pointer text-center ${f.rec ? "col-span-2" : ""}`}
                  style={{
                    background: sel ? P : "#fff",
                    border: sel ? `1.5px solid ${P}` : CARD_EDGE,
                    boxShadow: sel ? "0 8px 20px rgba(122,43,245,0.32)" : "0 2px 8px rgba(22,19,14,0.05)",
                  }}>
                  {f.rec && (
                    <span className="absolute -top-2.5 right-3 text-[8.5px] font-extrabold px-2 py-[2.5px] rounded-full uppercase tracking-wide"
                      style={{ background: LIME, color: INK }}>
                      Recomendado
                    </span>
                  )}
                  <span className={`text-[12px] font-bold ${sel ? "text-white" : "text-foreground"}`}>{f.label}</span>
                </motion.div>
              );
            })}
          </div>

          <BtnLime onClick={onNext}><Zap className="w-4 h-4" /> Criar meus vídeos</BtnLime>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Fase 6: EVA Studio ──────────────────────────────────────────────────────

function Waveform() {
  const bars = [7, 13, 9, 18, 11, 21, 14, 19, 10, 16, 8, 20, 12, 17];
  return (
    <div className="flex items-end gap-[3px] h-6">
      {bars.map((height, i) => (
        <motion.div key={i} className="w-[3px] rounded-full" style={{ background: LIME }}
          animate={{ height: [5 + (i % 4), height, 5 + (i % 4)] }}
          transition={{ duration: 0.55 + (i % 5) * 0.07, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

function FaseStudio({ produto, pool, onDone, editingImageUrl, brandName, captions, fastMode = false }: {
  produto: ProdutoLite; pool: VideoRow[]; editingImageUrl: string; brandName: string;
  onDone: (videos: VideoRow[]) => void; captions?: string[]; fastMode?: boolean;
}) {
  const videos = useMemo(() => pool, [pool]);
  const [vidIdx, setVidIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const doneRef = useRef(false);

  const totalSteps = STUDIO_STEPS.length;
  const current = videos[Math.min(vidIdx, videos.length - 1)];
  const fx = STUDIO_STEPS[Math.min(stepIdx, totalSteps - 1)]?.fx;
  const studioCaptions = captions ?? LEGENDAS;
  const legenda = studioCaptions[vidIdx % studioCaptions.length];

  useEffect(() => {
    if (doneRef.current) return;
    const fast = vidIdx > 0;
    if (stepIdx >= totalSteps) {
      if (vidIdx + 1 >= videos.length) {
        doneRef.current = true;
        const t = setTimeout(() => onDone(videos), fastMode ? 400 : 900);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => { setVidIdx(v => v + 1); setStepIdx(0); }, fastMode ? 180 : 420);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIdx(s => s + 1), fastMode ? 110 : fast ? 250 : 480);
    return () => clearTimeout(t);
  }, [stepIdx, vidIdx, totalSteps, videos, onDone, fastMode]);

  const pct = Math.min(100, Math.round((stepIdx / totalSteps) * 100));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto px-5 pt-7 pb-12">
        {/* Header com a Eva editando */}
        <div className="flex items-end justify-between gap-3 mb-4">
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <Starburst size={22} color={LIME} />
              <span className="font-extrabold text-[17px] tracking-tight text-foreground">{brandName} Studio</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white rounded-full pl-1 pr-3 py-1 mt-2.5 w-fit"
              style={{ border: CARD_EDGE }}>
              <img src={produto.img} alt="" className="w-5 h-5 rounded-full object-cover" style={{ objectPosition: "top" }} />
              <span className="text-[9.5px] font-bold text-foreground/60">Produto vinculado</span>
            </div>
          </div>
          <motion.img src={editingImageUrl} alt={`${brandName} editando`} draggable={false}
            className="shrink-0 -mb-1" style={{ width: 96, height: "auto" }}
            loading="eager" decoding="async"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0, y: [0, -4, 0] }}
            transition={{ opacity: { duration: 0.4 }, x: { duration: 0.4 }, y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } }} />
        </div>

        <div className="flex gap-3.5">
          {/* Prévia do vídeo: monitor de edição */}
          <div className="relative shrink-0 rounded-[1.4rem] overflow-hidden"
            style={{ width: 172, height: 300, background: "#0A0A0A", boxShadow: "0 16px 36px rgba(22,19,14,0.30)" }}>
            {current?.link_video && (
              <video key={current.message_id} src={current.link_video} autoPlay muted loop playsInline preload="auto" poster={produto.img}
                onCanPlay={(e) => { void (e.currentTarget as HTMLVideoElement).play().catch(() => {}); }}
                className="w-full h-full object-cover" />
            )}

            {/* HUD: status de edição + timecode */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1 rounded-md px-1.5 py-[3px]"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
                <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: LIME }}
                  animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1.1, repeat: Infinity }} />
                <span className="text-[7.5px] font-extrabold tracking-[0.1em] text-white uppercase">Editando</span>
              </div>
              <span className="text-[7.5px] font-bold text-white/70 tabular-nums rounded-md px-1.5 py-[3px]"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                00:{String(4 + stepIdx * 3).padStart(2, "0")}
              </span>
            </div>

            {/* Cantoneiras de enquadramento */}
            <div className="absolute inset-3 pointer-events-none opacity-45">
              {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2",
                "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map(c => (
                <div key={c} className={`absolute w-3.5 h-3.5 border-white ${c}`} style={{ borderRadius: 1 }} />
              ))}
            </div>

            {/* Análise de cena */}
            {fx === "scan" && (
              <>
                <motion.div className="absolute left-0 right-0 h-[2px] pointer-events-none"
                  style={{ background: LIME, boxShadow: `0 0 16px ${LIME}` }}
                  animate={{ top: ["6%", "92%", "6%"] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute pointer-events-none rounded-sm"
                  style={{ border: `1.5px solid ${LIME}`, left: "18%", top: "26%", width: "58%", height: "34%" }}
                  animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </>
            )}

            {/* Cortes na timeline */}
            {fx === "cut" && (
              <div className="absolute bottom-9 left-2.5 right-2.5 pointer-events-none">
                <div className="flex gap-[3px] mb-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <motion.div key={i} className="flex-1 h-3 rounded-[2px]"
                      style={{ background: "rgba(255,255,255,0.28)" }}
                      animate={{ background: ["rgba(255,255,255,0.28)", LIME, "rgba(255,255,255,0.28)"] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.14 }} />
                  ))}
                </div>
                <motion.div className="w-[2px] h-4 -mt-4" style={{ background: "#fff" }}
                  animate={{ marginLeft: ["2%", "94%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />
              </div>
            )}

            {/* Gancho de abertura */}
            {fx === "hook" && (
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="absolute top-11 left-3 right-3 text-center pointer-events-none">
                <span className="inline-block text-[11px] font-extrabold leading-tight px-2 py-1 rounded-md"
                  style={{ background: LIME, color: INK, transform: "rotate(-2deg)" }}>
                  NÃO PULA ESSA PARTE
                </span>
              </motion.div>
            )}

            {/* Narração e áudio */}
            {fx === "voice" && (
              <div className="absolute bottom-9 left-0 right-0 flex flex-col items-center gap-1.5 pointer-events-none">
                <Waveform />
                <span className="text-[7.5px] font-bold text-white/60 tracking-[0.1em] uppercase">Voz da {brandName}</span>
              </div>
            )}

            {/* Legendas palavra a palavra */}
            {fx === "caption" && (
              <div className="absolute bottom-10 left-3 right-3 text-center pointer-events-none">
                <div className="inline-flex flex-wrap justify-center gap-x-1 gap-y-0.5">
                  {legenda.split(" ").slice(0, 7).map((w, i) => (
                    <motion.span key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.13 }}
                      className="text-[10px] font-extrabold text-white leading-tight px-1 rounded"
                      style={{ background: "rgba(0,0,0,0.6)", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                      {w}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Elementos visuais */}
            {fx === "fx" && (
              <>
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-16 right-3 pointer-events-none">
                  <Starburst size={26} color={LIME} />
                </motion.div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }}
                  transition={{ delay: 0.15 }}
                  className="absolute top-28 left-3 rounded-full pointer-events-none"
                  style={{ width: 22, height: 22, border: `2.5px solid ${LIME}` }} />
                <motion.div initial={{ width: 0 }} animate={{ width: 46 }} transition={{ delay: 0.25 }}
                  className="absolute h-[3px] rounded-full pointer-events-none"
                  style={{ background: "#fff", top: 148, right: 14 }} />
              </>
            )}

            {/* Renderização final */}
            {fx === "final" && (
              <div className="absolute inset-x-3 bottom-9 pointer-events-none">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[7.5px] font-extrabold tracking-[0.1em] text-white uppercase">Renderizando</span>
                  <span className="text-[7.5px] font-bold text-white/60">1080p</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.22)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: LIME }}
                    initial={{ width: "8%" }} animate={{ width: "100%" }} transition={{ duration: 0.65 }} />
                </div>
              </div>
            )}

            {/* Timeline da edição (sempre visível) */}
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-5 pointer-events-none"
              style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.75))" }}>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.25)" }}>
                <motion.div className="h-full rounded-full" style={{ background: LIME }}
                  animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>
          </div>

          {/* Etapas do vídeo atual */}
          <div className="flex-1 bg-white rounded-2xl px-3.5 py-4 self-start" style={{ border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9.5px] font-extrabold tracking-[0.1em] uppercase text-foreground/45">Vídeo {Math.min(vidIdx + 1, videos.length)}</p>
              <span className="text-[9.5px] font-extrabold" style={{ color: P }}>{pct}%</span>
            </div>
            <div className="space-y-2">
              {STUDIO_STEPS.map((s, i) => {
                const done = i < stepIdx;
                const curr = i === stepIdx;
                return (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: done ? LIME : curr ? P : "rgba(22,19,14,0.07)" }}>
                      {done ? <Check className="w-2.5 h-2.5" strokeWidth={4} style={{ color: INK }} />
                        : curr ? <Loader2 className="w-2.5 h-2.5 text-white animate-spin" /> : null}
                    </div>
                    <p className={`text-[9.5px] leading-tight font-semibold ${done ? "text-foreground/40" : curr ? "text-foreground" : "text-foreground/30"}`}>
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fila de criação */}
        <div className="mt-4 bg-white rounded-2xl px-4 py-4" style={{ border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.06)" }}>
          <p className="text-[9.5px] font-extrabold tracking-[0.1em] uppercase text-foreground/45 mb-3">Fila de criação</p>
          <div className="space-y-2.5">
            {videos.map((v, i) => {
              const pronto = i < vidIdx || (i === vidIdx && stepIdx >= totalSteps);
              const criando = i === vidIdx && stepIdx < totalSteps;
              return (
                <div key={v.message_id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: pronto ? "rgba(185,242,39,0.30)" : criando ? "rgba(122,43,245,0.10)" : "rgba(22,19,14,0.05)" }}>
                    {pronto ? <Check className="w-4 h-4" strokeWidth={3} style={{ color: "#4d7c0f" }} />
                      : criando ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: P }} />
                      : <Play className="w-3.5 h-3.5 text-foreground/25" />}
                  </div>
                  <p className={`text-[12px] font-bold flex-1 ${pronto || criando ? "text-foreground" : "text-foreground/35"}`}>
                    Vídeo {i + 1}
                  </p>
                  <span className="text-[10px] font-bold"
                    style={{ color: pronto ? "#4d7c0f" : criando ? P : "rgba(22,19,14,0.30)" }}>
                    {pronto ? "pronto" : criando ? `criando ${pct}%` : "aguardando"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Fase 7: Revisão e postagem ──────────────────────────────────────────────

function InlineFlowPreview({ video, duration, index, poster }: { video: VideoRow; duration: number; index: number; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  async function toggle() {
    const element = videoRef.current;
    if (!element) return;
    if (element.paused) {
      await element.play().catch(() => undefined);
      setPlaying(!element.paused);
    } else {
      element.pause();
      setPlaying(false);
    }
  }

  return (
    <button type="button" onClick={toggle}
      className="relative w-[86px] h-[150px] rounded-xl overflow-hidden shrink-0"
      style={{ background: "#0A0A0A" }}
      aria-label={`${playing ? "Pausar" : "Reproduzir"} vídeo ${index + 1}`}>
      {video.link_video && (
        <video ref={videoRef} src={video.link_video} playsInline preload="metadata" poster={poster} disablePictureInPicture
          onLoadedMetadata={(event) => {
            const element = event.currentTarget;
            if (element.duration > 0) element.currentTime = Math.min(0.1, element.duration / 2);
          }}
          onEnded={() => setPlaying(false)} className="w-full h-full object-cover" />
      )}
      <span className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.18)" }}>
        <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
          {playing ? <Pause className="w-3.5 h-3.5 text-white" fill="white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />}
        </span>
      </span>
      <span className="absolute top-1.5 right-1.5 text-[8.5px] font-extrabold text-white bg-black/55 px-1.5 py-0.5 rounded-full">
        {duration}s
      </span>
    </button>
  );
}

function FaseRevisao({ produto, videos, extras, onBack, onTrocar, brandName, channels, captions, hashtags, simpleReview = false, onApprove }: {
  produto: ProdutoLite; videos: VideoRow[]; extras: VideoRow[];
  onBack: () => void; onTrocar: () => void; brandName: string; channels: BrandTheme["channels"];
  captions?: string[]; hashtags?: string; simpleReview?: boolean; onApprove?: () => void;
}) {
  const [lista, setLista] = useState(videos);
  const [regen, setRegen] = useState<{ i: number; label: string } | null>(null);
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [postando, setPostando] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState(() => channels.map(channel => channel.name));
  const extraRef = useRef(0);

  const dur = useMemo(() => lista.map((_, i) => [17, 21, 33][i] ?? 20), [lista]);
  const reviewCaptions = captions ?? LEGENDAS;
  const reviewHashtags = hashtags ?? (brandName === "Malu" ? HASHTAGS_MALU : HASHTAGS);

  function refazer(i: number, label: string) {
    if (regen !== null) return;
    setRegen({ i, label });
    setTimeout(() => {
      const next = extras[extraRef.current % Math.max(1, extras.length)];
      extraRef.current++;
      if (next) setLista(l => l.map((v, j) => (j === i ? next : v)));
      setRegen(null);
    }, 1300);
  }

  function toggleChannel(name: string) {
    setSelectedChannels(current => current.includes(name)
      ? current.filter(channel => channel !== name)
      : [...current, name]);
  }

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <TopBar step={3} label="Revisão" onBack={onBack} />
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-5 pb-4">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Vídeos prontos</p>
          <h2 className="font-extrabold text-[1.7rem] leading-[1.15] tracking-tight">
            Revise os vídeos<br /><em className="italic" style={{ color: P }}>criados pela {brandName}</em>
          </h2>
          <p className="text-foreground/50 text-[12px] mt-3 mb-5">
            Tudo pronto. Aprove para a {brandName} publicar nos seus canais com o produto vinculado.
          </p>

          <div className="space-y-3.5">
            {lista.map((v, i) => (
              <motion.div key={`${v.message_id}-${i}`}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                className="bg-white rounded-2xl p-3.5" style={{ border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.07)" }}>
                <div className="flex gap-3">
                  {/* Prévia */}
                  {simpleReview ? (
                    <InlineFlowPreview video={v} duration={dur[i]} index={i} poster={produto.img} />
                  ) : (
                    <div className="relative w-[86px] h-[150px] rounded-xl overflow-hidden shrink-0 cursor-pointer"
                      style={{ background: "#0A0A0A" }}
                      onClick={() => v.link_video && setModalUrl(v.link_video)}>
                      {regen?.i === i ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                          <Loader2 className="w-5 h-5 animate-spin" style={{ color: LIME }} />
                          <span className="text-[8px] font-bold text-white/60 text-center px-1">{regen.label}</span>
                        </div>
                      ) : (
                        <>
                          {v.link_video && (
                            <video key={v.message_id} src={v.link_video} muted playsInline preload="metadata"
                              onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1; }}
                              className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.18)" }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
                              <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                            </div>
                          </div>
                          <span className="absolute top-1.5 right-1.5 text-[8.5px] font-extrabold text-white bg-black/55 px-1.5 py-0.5 rounded-full">
                            {dur[i]}s
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-bold text-foreground leading-snug line-clamp-2">
                      {reviewCaptions[i % reviewCaptions.length]}
                    </p>
                    <p className="text-[10px] font-semibold mt-1 line-clamp-1" style={{ color: P }}>{reviewHashtags}</p>
                    <div className="flex items-start gap-1.5 mt-2.5 rounded-lg px-2 py-1.5"
                      style={{ background: "rgba(77,124,15,0.08)" }}>
                      <Check className="w-3 h-3 shrink-0 mt-[1px]" strokeWidth={3.5} style={{ color: "#4d7c0f" }} />
                      <p className="text-[9px] font-semibold leading-snug" style={{ color: "#4d7c0f" }}>
                        Materiais verificados: sem direitos autorais e liberados para publicação.
                      </p>
                    </div>
                    {!simpleReview && <div className="flex gap-1.5 mt-2.5">
                      <button onClick={() => refazer(i, "gerando...")}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[9.5px] font-bold active:scale-95 transition-transform"
                        style={{ background: "rgba(22,19,14,0.06)", color: INK }}>
                        <RefreshCw className="w-3 h-3" /> Nova versão
                      </button>
                      <button onClick={() => refazer(i, "novo estilo...")}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[9.5px] font-bold active:scale-95 transition-transform"
                        style={{ background: "rgba(122,43,245,0.08)", color: P }}>
                        <Shuffle className="w-3 h-3" /> Trocar estilo
                      </button>
                    </div>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mx-5 mt-5 mb-32 rounded-2xl bg-white px-4 py-4" style={{ border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.07)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-foreground/45">Onde publicar?</p>
            <span className="text-[10px] font-semibold text-foreground/40">Selecione os canais</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {channels.map(channel => {
              const active = selectedChannels.includes(channel.name);
              return (
                <button key={channel.name} onClick={() => toggleChannel(channel.name)}
                  className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 transition-all active:scale-95"
                  style={{ background: active ? "rgba(249,115,22,0.10)" : "rgba(22,19,14,0.035)", border: active ? `1.5px solid ${P}` : CARD_EDGE }}>
                  <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white">
                    <img src={channel.logoUrl} alt={channel.name} className="w-5 h-5" draggable={false} />
                    {active && <span className="absolute -right-1 -top-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: P }}><Check className="w-2.5 h-2.5 text-white" strokeWidth={4} /></span>}
                  </span>
                  <span className={`text-[10px] font-bold ${active ? "text-foreground" : "text-foreground/45"}`}>{channel.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-5 pb-5 pt-8 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, #F4EFE6 55%)" }}>
          <div className="max-w-md mx-auto pointer-events-auto">
            <BtnLime onClick={onApprove ?? (() => setPostando(true))} disabled={selectedChannels.length === 0}>
              <ChannelDots channels={channels} selected={selectedChannels} size={13} /> Aprovar e postar
            </BtnLime>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!simpleReview && modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
        {!onApprove && postando && <PopupTikTok videos={lista} onDone={onTrocar} brandName={brandName}
          channels={channels} selectedChannels={selectedChannels} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Popup do TikTok (postagem) ──────────────────────────────────────────────

const HORARIOS_PICO = [
  { hora: "19:30", dia: "hoje",    motivo: "pico de audiência do seu nicho" },
  { hora: "12:15", dia: "amanhã",  motivo: "horário de almoço, alta rolagem" },
  { hora: "20:45", dia: "amanhã",  motivo: "maior taxa de conversão da semana" },
  { hora: "18:00", dia: "quinta",  motivo: "público mais ativo da sua base" },
  { hora: "21:10", dia: "quinta",  motivo: "janela com menos concorrência" },
  { hora: "13:00", dia: "sexta",   motivo: "pico de compras por impulso" },
  { hora: "19:00", dia: "sexta",   motivo: "maior alcance orgânico previsto" },
  { hora: "11:30", dia: "sábado",  motivo: "audiência de fim de semana" },
];

const ANALISE_HORARIOS = [
  "Lendo o histórico de audiência do perfil",
  "Cruzando com os picos do seu nicho",
  "Evitando concorrência com criadores grandes",
  "Distribuindo os vídeos nos melhores horários",
];

function PopupTikTok({ videos, onDone, brandName, channels, selectedChannels }: {
  videos: VideoRow[]; onDone: () => void; brandName: string;
  channels: BrandTheme["channels"]; selectedChannels: string[];
}) {
  const total = videos.length;
  const publicarAgora = Math.min(2, total);
  const isMalu = brandName === "Malu";
  const postAccent = isMalu ? "#F97316" : LIME;
  const postAccentSoft = isMalu ? "rgba(249,115,22,0.18)" : "rgba(185,242,39,0.18)";
  const postAccentWash = isMalu ? "rgba(249,115,22,0.12)" : "rgba(185,242,39,0.10)";
  const postAction = isMalu ? "#EE4D2D" : TIKTOK_RED;
  const scheduledAccent = isMalu ? "#FFB067" : "#B388FF";
  // fase 0: analisando horários | fase 1: publicando | fase 2: concluído
  const [fase, setFase] = useState(0);
  const [analiseIdx, setAnaliseIdx] = useState(0);
  const [postados, setPostados] = useState(0);

  const agendados = useMemo(
    () => videos.slice(publicarAgora).map((_, i) => HORARIOS_PICO[i % HORARIOS_PICO.length]),
    [videos, publicarAgora]);

  useEffect(() => {
    if (fase !== 0) return;
    if (analiseIdx >= ANALISE_HORARIOS.length) {
      const t = setTimeout(() => setFase(1), 420);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setAnaliseIdx(i => i + 1), 620);
    return () => clearTimeout(t);
  }, [fase, analiseIdx]);

  useEffect(() => {
    if (fase !== 1) return;
    if (postados >= publicarAgora) {
      const t = setTimeout(() => setFase(2), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPostados(p => p + 1), 1200);
    return () => clearTimeout(t);
  }, [fase, postados, publicarAgora]);

  const completo = fase === 2;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.78)" }}>
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="w-full max-w-md rounded-t-[1.75rem] sm:rounded-[1.75rem] px-6 pt-7 pb-8 max-h-[92vh] overflow-y-auto"
        style={{ background: isMalu ? "#111114" : "#0B0B0F" }}>
        {/* Cabeçalho estilo TikTok */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-auto min-w-11 h-11 px-1.5 rounded-2xl flex items-center justify-center"
            style={{ background: "#000", border: "1px solid rgba(255,255,255,0.12)" }}>
            <ChannelDots channels={channels} selected={selectedChannels} size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-[15px] leading-tight">
              {fase === 0 ? "Escolhendo os melhores horários"
                : fase === 1 ? (brandName === "Malu" ? "Publicando nos seus canais" : "Publicando no TikTok")
                : (brandName === "Malu" ? "Tudo pronto nos seus canais" : "Tudo pronto no seu TikTok")}
            </p>
            <p className="text-white/45 text-[11px]">{brandName === "Malu" ? "Shopee · TikTok · Instagram" : "@lumacedo.ofc · vitrine conectada"}</p>
          </div>
          {!completo && <Loader2 className="w-5 h-5 animate-spin shrink-0" style={{ color: postAction }} />}
        </div>

        {/* Fase 0: análise de horários */}
        {fase === 0 && (
          <div className="space-y-3 mb-2">
            {ANALISE_HORARIOS.map((t, i) => {
              const done = i < analiseIdx;
              const curr = i === analiseIdx;
              if (i > analiseIdx) return null;
              return (
                <motion.div key={t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: curr ? 1 : 0.5, y: 0 }}
                  className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: done ? postAccentSoft : "rgba(255,255,255,0.08)" }}>
                    {done ? <Check className="w-3 h-3" strokeWidth={3.5} style={{ color: postAccent }} />
                      : <Loader2 className="w-3 h-3 text-white/70 animate-spin" />}
                  </div>
                  <p className={`text-[12.5px] font-semibold ${curr ? "text-white" : "text-white/45"}`}>{t}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Fases 1 e 2: publicação e agendamento */}
        {fase > 0 && (
          <>
            <p className="text-[9.5px] font-extrabold tracking-[0.14em] uppercase text-white/35 mb-2.5">
              Publicando agora
            </p>
            <div className="space-y-2.5 mb-5">
              {videos.slice(0, publicarAgora).map((v, i) => {
                const feito = i < postados;
                const agora = i === postados && fase === 1;
                return (
                  <div key={`now-${v.message_id}-${i}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: feito ? postAccentSoft : "rgba(255,255,255,0.07)" }}>
                      {feito ? <Check className="w-3.5 h-3.5" strokeWidth={3.5} style={{ color: postAccent }} />
                        : agora ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: postAction }} />
                        : <Play className="w-3 h-3 text-white/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold text-white">Vídeo {i + 1}</p>
                      <p className="text-[10px] text-white/40">
                        {feito ? "publicado nos canais selecionados" : agora ? `enviando para ${brandName === "Malu" ? "seus canais" : "o TikTok"}` : "aguardando"}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold shrink-0"
                      style={{ color: feito ? postAccent : agora ? postAction : "rgba(255,255,255,0.3)" }}>
                      {feito ? "no ar" : agora ? "enviando" : "na fila"}
                    </span>
                  </div>
                );
              })}
            </div>

            {agendados.length > 0 && (
              <>
                <p className="text-[9.5px] font-extrabold tracking-[0.14em] uppercase text-white/35 mb-2.5">
                  Programados pela {brandName}
                </p>
                <div className="space-y-2.5 mb-5">
                  {agendados.map((h, i) => {
                    const idx = publicarAgora + i;
                    const liberado = fase === 2;
                    return (
                      <motion.div key={`sch-${idx}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: liberado ? 1 : 0.45, y: 0 }}
                        transition={{ delay: liberado ? 0.1 * i : 0 }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: liberado ? (isMalu ? "rgba(249,115,22,0.18)" : "rgba(122,43,245,0.25)") : "rgba(255,255,255,0.07)" }}>
                          <Clock className="w-3.5 h-3.5" style={{ color: liberado ? scheduledAccent : "rgba(255,255,255,0.3)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-bold text-white">Vídeo {idx + 1}</p>
                          <p className="text-[10px] text-white/40 truncate">{h.motivo}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11.5px] font-extrabold" style={{ color: scheduledAccent }}>{h.hora}</p>
                          <p className="text-[9px] text-white/35">{h.dia}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {completo ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-xl px-3.5 py-3 mb-4" style={{ background: postAccentWash }}>
              <p className="text-[11.5px] font-semibold leading-snug" style={{ color: postAccent }}>
                {publicarAgora === 1 ? "1 vídeo já está no ar" : `${publicarAgora} vídeos já estão no ar`}
                {agendados.length > 0 && (agendados.length === 1
                  ? " e 1 vai ao ar sozinho no melhor horário."
                  : ` e os outros ${agendados.length} vão ao ar sozinhos nos horários de maior alcance.`)}
              </p>
            </div>
            <button onClick={onDone}
              className="w-full flex items-center justify-center gap-2 font-bold py-[14px] rounded-2xl text-sm active:scale-[0.98] transition-transform"
              style={{ background: postAccent, color: INK }}>
              <Check className="w-4 h-4" strokeWidth={3} /> Concluir
            </button>
          </motion.div>
        ) : (
          <p className="text-center text-white/35 text-[11px] pt-1">
            {fase === 0
              ? `A ${brandName} está calculando quando cada vídeo rende mais`
              : (isMalu ? "Publicando com o link de afiliada selecionado" : "Publicando com o produto vinculado à sua vitrine")}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Raiz do fluxo ───────────────────────────────────────────────────────────

type Fase = "nicho" | "pesquisa" | "produtos" | "vitrine" | "config" | "studio" | "revisao";

function shuffledVideos(videos: VideoRow[]) {
  const result = [...videos];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

export default function EvaFlow({ produtos, onExit, theme, options }: {
  produtos: ProdutoFunil[]; onExit: () => void; theme: BrandTheme; options?: EvaFlowOptions;
}) {
  const [fase, setFase] = useState<Fase>("nicho");
  const [nicho, setNicho] = useState(options?.niches?.[0]?.id ?? "moda");
  const [resolvedNiche, setResolvedNiche] = useState(options?.niches?.[0]?.id ?? "moda");
  const [prodSel, setProdSel] = useState<string | null>(null);
  const [qtd, setQtd] = useState(3);
  const [formato, setFormato] = useState("auto");
  const [criados, setCriados] = useState<VideoRow[]>([]);
  const [studioPool, setStudioPool] = useState<VideoRow[]>([]);
  const imageWarmups = useRef(new Map<string, HTMLImageElement>());
  const videoWarmups = useRef(new Map<string, HTMLVideoElement>());

  const catalogProducts = options?.catalog?.[resolvedNiche] ?? produtos;
  const seis = useMemo(() => catalogProducts.slice(0, options?.catalog ? 3 : 6), [catalogProducts, options?.catalog]);
  const produto = seis.find(p => p.id === prodSel) ?? seis[0];
  const pool = useMemo<VideoRow[]>(() => produto?.videos?.map((link, index) => ({
    message_id: `${produto.id}-video-${index + 1}`,
    nicho: resolvedNiche,
    link_video: link,
  })) ?? DEMO_VIDEOS, [produto, resolvedNiche]);

  const warmImage = useCallback((url: string) => {
    if (!url || imageWarmups.current.has(url)) return;
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    imageWarmups.current.set(url, image);
  }, []);

  const warmVideo = useCallback((url: string) => {
    if (!url || videoWarmups.current.has(url)) return;
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    video.load();
    videoWarmups.current.set(url, video);
  }, []);

  useEffect(() => {
    warmImage(theme.searchImageUrl);
    warmImage(theme.editingImageUrl);
    seis.forEach(item => warmImage(item.img));
  }, [seis, theme.editingImageUrl, theme.searchImageUrl, warmImage]);

  useEffect(() => {
    if (fase !== "produtos" && fase !== "config") return;
    pool.forEach(item => {
      if (item.link_video) warmVideo(item.link_video);
    });
  }, [fase, pool, warmVideo]);

  useEffect(() => () => {
    videoWarmups.current.forEach(video => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    });
    videoWarmups.current.clear();
    imageWarmups.current.clear();
  }, []);

  const searchSteps = useMemo(() => {
    if (!options?.catalog) return undefined;
    const nicheLabel = options.niches?.find(item => item.id === resolvedNiche)?.label ?? "selecionado";
    return [
      "Preparando o demonstrativo...",
      `Analisando os produtos de ${nicheLabel.toLowerCase()}...`,
      "Comparando as vendas das últimas 24 horas...",
      "Separando os três produtos mais vendidos...",
      "Verificando os vídeos disponíveis...",
      "Organizando a experiência de edição...",
      "Tudo pronto para escolher o produto!",
    ];
  }, [options?.catalog, options?.niches, resolvedNiche]);

  const goHome = useCallback(() => onExit(), [onExit]);

  const selectProduct = useCallback((id: string) => {
    setProdSel(id);
    const selectedProduct = seis.find(item => item.id === id);
    selectedProduct?.videos?.forEach(warmVideo);
  }, [seis, warmVideo]);

  function startSearch() {
    let chosen = nicho;
    if (nicho === "auto" && options?.niches) {
      const available = options.niches.filter(item => item.id !== "auto" && options.catalog?.[item.id]);
      chosen = available[Math.floor(Math.random() * available.length)]?.id ?? options.niches[0].id;
    }
    setResolvedNiche(chosen);
    setProdSel(null);
    setFase("pesquisa");
  }

  function startStudio() {
    const selected = options?.catalog ? shuffledVideos(pool).slice(0, qtd) : pool;
    selected.forEach(item => {
      if (item.link_video) warmVideo(item.link_video);
    });
    setStudioPool(selected);
    setFase("studio");
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {fase === "nicho" && (
        <motion.div key="nicho" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <FaseNicho nicho={nicho} setNicho={setNicho} brandName={theme.name}
            items={options?.niches}
            description={options?.catalog ? "Escolha uma opção e a Malu encontra os produtos mais vendidos do dia." : undefined}
            onNext={startSearch} onBack={goHome} />
        </motion.div>
      )}
      {fase === "pesquisa" && (
        <FasePesquisa key="pesquisa" searchImageUrl={theme.searchImageUrl} brandName={theme.name} customSteps={searchSteps}
          onDone={() => setFase("produtos")} />
      )}
      {fase === "produtos" && (
        <motion.div key="produtos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <FaseProdutos produtos={seis} sel={prodSel} setSel={selectProduct} topThree={Boolean(options?.catalog)}
            onNext={() => setFase(options?.skipProductVerification ? "config" : "vitrine")} onBack={() => setFase("nicho")} />
        </motion.div>
      )}
      {fase === "vitrine" && produto && (
        <FaseVitrine key="vitrine" produto={produto} brandName={theme.name} onDone={() => setFase("config")} />
      )}
      {fase === "config" && (
        <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <FaseConfig qtd={qtd} setQtd={setQtd} formato={formato} setFormato={setFormato} brandName={theme.name}
            quantities={options?.quantities} onNext={startStudio} onBack={() => setFase("produtos")} />
        </motion.div>
      )}
      {fase === "studio" && produto && (
        pool.length > 0 ? (
          <FaseStudio key="studio" produto={produto} pool={studioPool.length > 0 ? studioPool : pool}
            editingImageUrl={theme.editingImageUrl} brandName={theme.name}
            captions={produto.captions} fastMode={Boolean(options?.catalog)}
            onDone={(v) => { setCriados(v); setFase("revisao"); }} />
        ) : (
          <motion.div key="studio-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center" style={PAGE_BG}>
            <EvaLoader label={`Preparando o estúdio da ${theme.name}...`} />
          </motion.div>
        )
      )}
      {fase === "revisao" && produto && (
        <motion.div key="revisao" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <FaseRevisao produto={produto} videos={criados} brandName={theme.name} channels={theme.channels}
            extras={pool.slice(qtd)} captions={produto.captions} hashtags={produto.hashtags}
            simpleReview={options?.simpleReview} onApprove={options?.onApprove}
            onBack={() => setFase("config")} onTrocar={goHome} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
