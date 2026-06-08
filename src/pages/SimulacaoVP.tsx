import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles, Bot, X, Play } from "lucide-react";
import shopeeImg from "@/assets/shopee-icon.png";
import tiktokImg from "@/assets/tiktok-icon.png";
import instaImg  from "@/assets/instagram-icon.webp";

const LOGO_URL =
  "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/Sem%20t%C3%ADtulo%20-%2027%20de%20maio%20de%202026%20%C3%A0s%2000.47.41.png";

const R2 = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev";
const AI_MODEL = `${R2}/modeloai.png`;

const PAIRS = [
  { id: 1, ref: `${R2}/referencia01.mp4`, gen: `${R2}/gerado01.mp4`, author: "@luaramatoos.ofc",  plat: "tiktok"    },
  { id: 2, ref: `${R2}/referencia02.mp4`, gen: `${R2}/gerado02.mp4`, author: "@mashopeedicas",   plat: "instagram" },
  { id: 3, ref: `${R2}/referencia03.mp4`, gen: `${R2}/gerado03.mp4`, author: "@luizacampoos002", plat: "tiktok"    },
];

const PLATS = [
  { label: "Shopee Vídeo", img: shopeeImg },
  { label: "TikTok",       img: tiktokImg },
  { label: "Instagram",    img: instaImg  },
];

const STEPS = [
  "Analisando vídeo de referência...",
  "Extraindo estilo e roteiro...",
  "Aplicando seu modelo de IA...",
  "Publicando nas redes...",
];

// ─── Select Screen ─────────────────────────────────────────────────────────────

function SelectScreen({ onStart }: { onStart: (ids: number[]) => void }) {
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const allSelected = selected.length === PAIRS.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 pt-8">
        <img src={LOGO_URL} alt="Logo" className="h-12 w-auto object-contain" />
      </div>

      <div className="max-w-md mx-auto px-5 pt-5 pb-4">
        <h1 className="text-[1.75rem] font-extrabold leading-[1.12] text-foreground">
          Selecione os vídeos<br />
          <span className="text-primary">de referência para recriar.</span>
        </h1>
        {/* Modelo de IA — card destaque */}
        <div className="mt-4 rounded-3xl overflow-hidden border border-primary/25 flex relative"
          style={{ background: "rgba(255,90,31,0.06)", height: 120 }}>
          {/* Foto da modelo em portrait */}
          <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 90 }}>
            <img
              src={AI_MODEL}
              alt="Modelo IA"
              className="w-full h-full object-cover object-top"
            />
            {/* Gradiente direita pra integrar */}
            <div className="absolute inset-y-0 right-0 w-8"
              style={{ background: "linear-gradient(to right, transparent, rgba(255,90,31,0.06))" }} />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center px-3 flex-1 gap-1">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold text-green-500 uppercase tracking-wider">Modelo ativo</span>
            </div>
            <p className="text-[14px] font-extrabold text-foreground leading-tight">Seu modelo<br />de IA</p>
            <p className="text-[10px] text-foreground/45 leading-snug">
              Recriará os vídeos<br />com sua identidade
            </p>
          </div>

          {/* Glow laranja na borda esquerda */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-l-3xl" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pb-8">
        {/* Select all */}
        <button
          onClick={() => setSelected(allSelected ? [] : PAIRS.map(p => p.id))}
          className="flex items-center gap-2 text-[11px] font-semibold text-foreground/50 mb-4 hover:text-primary transition-colors"
        >
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
            allSelected ? "bg-primary border-primary" : "border-border"
          }`}>
            {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
          Selecionar todos
        </button>

        {/* Reference video cards — 3 colunas, portrait */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {PAIRS.map((p, i) => {
            const sel = selected.includes(p.id);
            const platIcon = p.plat === "tiktok" ? tiktokImg : instaImg;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => toggle(p.id)}
                className={`relative rounded-2xl overflow-hidden text-left bg-black flex-shrink-0 transition-all ${
                  sel ? "ring-2 ring-primary" : "ring-0"
                }`}
                style={{ aspectRatio: "9/16" }}
              >
                {/* Vídeo portrait */}
                <video
                  src={p.ref}
                  autoPlay muted loop playsInline
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                    sel ? "opacity-95" : "opacity-50"
                  }`}
                />

                {/* Checkmark */}
                <motion.div
                  initial={false}
                  animate={{ scale: sel ? 1 : 0.8, opacity: sel ? 1 : 0.5 }}
                  className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center border-2 z-10 ${
                    sel ? "bg-primary border-primary" : "bg-black/50 border-white/30"
                  }`}
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>

                {/* Gradient bottom */}
                <div className="absolute bottom-0 inset-x-0 h-20 z-10"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }} />

                {/* Autoria */}
                <div className="absolute bottom-2 left-1.5 right-1.5 z-10">
                  <div className="flex items-center gap-1 mb-0.5">
                    <img src={platIcon} alt="" className="w-2.5 h-2.5 object-contain flex-shrink-0" />
                    <span className="text-[7.5px] font-bold text-white truncate leading-none">{p.author}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}

        </div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          onClick={() => selected.length > 0 && onStart(selected)}
          disabled={selected.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-30 transition-all"
          style={{ boxShadow: selected.length > 0 ? "0 4px 24px rgba(255,90,31,0.35)" : undefined }}
        >
          <Sparkles className="w-4 h-4" />
          {selected.length > 0
            ? `Recriar ${selected.length} vídeo${selected.length > 1 ? "s" : ""} com meu modelo`
            : "Selecione referências"}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Generation Screen ──────────────────────────────────────────────────────────

type Phase = "processing" | "published";

interface PublishedItem {
  pair: typeof PAIRS[0];
  plat: typeof PLATS[0];
}

function GenerationScreen({ pairIds }: { pairIds: number[] }) {
  const pairs     = PAIRS.filter(p => pairIds.includes(p.id));
  const total     = pairs.length;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [stepIdx,    setStepIdx]    = useState(0);
  const [progress,   setProgress]   = useState(0);
  const [phase,      setPhase]      = useState<Phase>("processing");
  const [published,  setPublished]  = useState<PublishedItem[]>([]);
  const [allDone,    setAllDone]    = useState(false);
  const [modalVideo, setModalVideo] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listEndRef  = useRef<HTMLDivElement>(null);

  const startPair = (idx: number) => {
    setCurrentIdx(idx);
    setStepIdx(0);
    setProgress(0);
    setPhase("processing");
  };

  useEffect(() => { startPair(0); }, []);

  useEffect(() => {
    if (published.length > 0)
      setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
  }, [published.length]);

  useEffect(() => {
    if (allDone || phase !== "processing") return;

    const stepDuration = 210;
    let p = 0;
    intervalRef.current = setInterval(() => {
      p = Math.min(p + 2, 100);
      setProgress(p);
    }, stepDuration / 50);

    const t = setTimeout(() => {
      clearInterval(intervalRef.current!);
      setProgress(100);

      if (stepIdx < STEPS.length - 1) {
        setTimeout(() => { setStepIdx(s => s + 1); setProgress(0); }, 120);
      } else {
        setPhase("published");
        setPublished(prev => [...prev, {
          pair: pairs[currentIdx],
          plat: PLATS[currentIdx % PLATS.length],
        }]);

        setTimeout(() => {
          if (currentIdx + 1 < total) startPair(currentIdx + 1);
          else setAllDone(true);
        }, 1350);
      }
    }, stepDuration);

    return () => { clearTimeout(t); clearInterval(intervalRef.current!); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, stepIdx, phase]);

  const current = pairs[currentIdx];
  const plat    = PLATS[currentIdx % PLATS.length];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="max-w-md mx-auto w-full px-5 pt-8 flex items-center justify-between">
        <img src={LOGO_URL} alt="Logo" className="h-10 w-auto object-contain" />
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
          allDone ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
        }`}>
          {allDone
            ? <><Check className="w-3 h-3" /> Concluído</>
            : <><motion.span className="w-2 h-2 rounded-full bg-primary block"
                animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} /> Gerando</>
          }
        </div>
      </div>

      {/* Progresso geral */}
      <div className="max-w-md mx-auto w-full px-5 pt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-bold text-foreground/50">
            {allDone ? "Todos publicados" : `Vídeo ${Math.min(currentIdx + 1, total)} de ${total}`}
          </span>
          <span className="text-[12px] font-bold text-primary">{published.length}/{total}</span>
        </div>
        <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(published.length / total) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main transformation card */}
      <div className="max-w-md mx-auto w-full px-5 pt-4">
        <AnimatePresence mode="wait">
          {!allDone && (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl overflow-hidden bg-card border border-border/50"
            >
              {/* Dois vídeos portrait lado a lado, sem divisor */}
              <div className="flex gap-1 p-1" style={{ height: 360 }}>

                {/* ── Referência (esquerda) ── */}
                <div className="relative bg-black rounded-2xl overflow-hidden" style={{ width: "44%" }}>
                  <video
                    src={current.ref}
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-55"
                  />
                  {/* Label topo */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full"
                    style={{ backdropFilter: "blur(4px)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="text-[7px] font-bold text-white uppercase tracking-wide">Ref.</span>
                  </div>
                  {/* Autor */}
                  <div className="absolute bottom-0 inset-x-0 px-2 pb-2 pt-8"
                    style={{ background: "linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 100%)" }}>
                    {(() => {
                      const platIcon = current.plat === "tiktok" ? tiktokImg : instaImg;
                      return (
                        <div className="flex items-center gap-1">
                          <img src={platIcon} alt="" className="w-2.5 h-2.5 object-contain flex-shrink-0" />
                          <span className="text-[7px] font-bold text-white/80 truncate">{current.author}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* ── Vídeo gerado (direita, maior) ── */}
                <div className="relative bg-[#0d0d0d] rounded-2xl overflow-hidden flex-1">
                  {/* Placeholder durante processing */}
                  {phase === "processing" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 overflow-hidden">
                      <motion.div
                        className="absolute inset-x-0 h-28"
                        style={{ background: "linear-gradient(to bottom,transparent,rgba(255,90,31,0.1),transparent)" }}
                        animate={{ top: ["-25%", "125%"] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 0.9, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/60"
                      >
                        <img src={AI_MODEL} alt="" className="w-full h-full object-cover" />
                      </motion.div>
                      <span className="text-[8.5px] text-white/30 font-medium text-center px-3 leading-snug">
                        Criando com<br />seu modelo...
                      </span>
                    </div>
                  )}

                  {/* Vídeo gerado */}
                  <AnimatePresence>
                    {phase === "published" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                        <video src={current.gen} autoPlay muted loop playsInline
                          className="w-full h-full object-cover" />
                        {/* Flash */}
                        <motion.div className="absolute inset-0 bg-white"
                          initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }} />
                        {/* Badge Publicado */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.3 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"
                              style={{ boxShadow: "0 0 24px rgba(255,90,31,0.6)" }}>
                              <Check className="w-6 h-6 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-white text-[12px] font-extrabold px-3 py-0.5 rounded-full"
                              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
                              Publicado!
                            </span>
                          </div>
                        </motion.div>
                        {/* Plataforma */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                          className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
                          <img src={plat.img} alt="" className="w-3 h-3 object-contain" />
                          <span className="text-[8px] font-bold text-white">{plat.label}</span>
                        </motion.div>
                        {/* Seu vídeo */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded-full"
                          style={{ backdropFilter: "blur(4px)" }}>
                          <img src={AI_MODEL} alt="" className="w-3 h-3 rounded-full object-cover" />
                          <span className="text-[8px] font-bold text-white">Seu vídeo</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Rodapé */}
              <div className="px-4 py-3 border-t border-border/50">
                {phase === "processing" ? (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-foreground">{STEPS[stepIdx]}</span>
                      <span className="text-[10px] font-bold text-primary">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {STEPS.map((_, i) => (
                        <div key={i} className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
                          i < stepIdx ? "bg-primary" : i === stepIdx ? "bg-primary/50" : "bg-muted/30"
                        }`} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-[12px] font-bold text-foreground">Publicado com sucesso!</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {PLATS.map(p => (
                        <img key={p.label} src={p.img} alt="" className="w-4 h-4 object-contain opacity-60" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Vídeos publicados acumulando ─────────────────────────── */}
      {published.length > 0 && (
        <div className="max-w-md mx-auto w-full px-5 pt-4">
          <p className="text-[10px] font-extrabold text-foreground/35 uppercase tracking-widest mb-3">
            Publicados
          </p>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {published.map((item, i) => (
                <motion.div
                  key={item.pair.id}
                  initial={{ opacity: 0, x: -14, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 340, damping: 26 }}
                  className="flex items-center gap-3 bg-card rounded-2xl px-3 py-2.5 border border-border/40"
                >
                  {/* Antes (ref) */}
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-black">
                    <video src={item.pair.ref} muted loop playsInline autoPlay className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[7px] font-bold text-white/70">REF</span>
                    </div>
                  </div>

                  {/* Seta + modelo */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <svg viewBox="0 0 16 16" className="w-3 h-3 fill-foreground/20">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    </svg>
                    <img src={AI_MODEL} alt="" className="w-5 h-5 rounded-full object-cover border border-primary/40" />
                    <svg viewBox="0 0 16 16" className="w-3 h-3 fill-foreground/20">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {/* Depois (gerado) — clicável */}
                  <button
                    onClick={() => setModalVideo(item.pair.gen)}
                    className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-green-500/40 group"
                  >
                    <video src={item.pair.gen} muted loop playsInline autoPlay className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                      <span className="text-[11px] font-bold text-foreground">Publicado com sucesso</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {PLATS.map(p => (
                        <img key={p.label} src={p.img} alt="" className="w-3 h-3 object-contain opacity-50" />
                      ))}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-foreground/25 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={listEndRef} />
          </div>
        </div>
      )}

      {/* ── Banner final ──────────────────────────────────────────── */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto w-full px-5 pt-4 pb-10"
          >
            <div className="rounded-3xl px-5 py-5 text-center border border-primary/20"
              style={{ background: "linear-gradient(135deg, rgba(255,90,31,0.1) 0%, rgba(255,90,31,0.04) 100%)" }}>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.4 }}
                className="w-14 h-14 rounded-full bg-primary mx-auto flex items-center justify-center mb-3"
                style={{ boxShadow: "0 0 28px rgba(255,90,31,0.45)" }}
              >
                <Check className="w-7 h-7 text-white" strokeWidth={3} />
              </motion.div>
              <p className="text-[17px] font-extrabold text-foreground mb-1">
                Tudo publicado!
              </p>
              <p className="text-[12px] text-foreground/50 leading-snug">
                {total} vídeo{total > 1 ? "s" : ""} recriado{total > 1 ? "s" : ""} com seu modelo de IA<br />
                e publicado{total > 1 ? "s" : ""} no Shopee Vídeo, TikTok e Instagram.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!allDone && <div className="pb-10" />}

      {/* ── Modal vídeo fullscreen ──────────────────────────────── */}
      <AnimatePresence>
        {modalVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.92)" }}
            onClick={() => setModalVideo(null)}
          >
            {/* Card do vídeo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative rounded-3xl overflow-hidden"
              style={{ width: "82vw", maxWidth: 340, aspectRatio: "9/16" }}
              onClick={e => e.stopPropagation()}
            >
              <video
                src={modalVideo}
                autoPlay
                loop
                playsInline
                controls
                className="w-full h-full object-cover"
              />

              {/* Badge "Seu vídeo" */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full"
                style={{ backdropFilter: "blur(6px)" }}>
                <img src={AI_MODEL} alt="" className="w-4 h-4 rounded-full object-cover" />
                <span className="text-[10px] font-bold text-white">Seu vídeo</span>
              </div>

              {/* Fechar */}
              <button
                onClick={() => setModalVideo(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
                style={{ backdropFilter: "blur(6px)" }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>

            {/* Dica */}
            <p className="absolute bottom-8 text-white/30 text-[11px]">Toque fora para fechar</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Stage = { type: "select" } | { type: "generating"; ids: number[] };

export default function SimulacaoVP() {
  const [stage, setStage] = useState<Stage>({ type: "select" });

  if (stage.type === "select")
    return <SelectScreen onStart={ids => setStage({ type: "generating", ids })} />;

  return <GenerationScreen pairIds={stage.ids} />;
}
