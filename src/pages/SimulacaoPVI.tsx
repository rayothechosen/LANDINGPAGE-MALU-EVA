import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Bot, ChevronRight, Star } from "lucide-react";
import shopeeImg from "@/assets/shopee-icon.png";
import tiktokImg from "@/assets/tiktok-icon.png";
import instaImg  from "@/assets/instagram-icon.webp";

const LOGO_URL =
  "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/Sem%20t%C3%ADtulo%20-%2027%20de%20maio%20de%202026%20%C3%A0s%2000.47.41.png";

const R2 = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev";

const PRODUCTS = [
  { id: 1, img: `${R2}/product01.PNG`, video: `${R2}/product01.mp4` },
  { id: 2, img: `${R2}/product02.PNG`, video: `${R2}/product02.mp4` },
  { id: 3, img: `${R2}/product03.PNG`, video: `${R2}/product03.mp4` },
  { id: 4, img: `${R2}/product04.PNG`, video: `${R2}/product04.mp4` },
  { id: 5, img: `${R2}/product05.png`, video: `${R2}/product05.mp4` },
];


const PLATS = [
  { label: "Shopee Vídeo", img: shopeeImg },
  { label: "TikTok",       img: tiktokImg },
  { label: "Instagram",    img: instaImg  },
];

const STEPS = [
  "Analisando produto com IA...",
  "Criando roteiro e script...",
  "Gerando vídeo...",
  "Publicando nas redes...",
];

// ─── Select Screen ────────────────────────────────────────────────────────────

function SelectScreen({ onStart }: { onStart: (ids: number[]) => void }) {
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const allSelected = selected.length === PRODUCTS.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 pt-8">
        <img src={LOGO_URL} alt="Logo" className="h-12 w-auto object-contain" />
      </div>

      <div className="max-w-md mx-auto px-5 pt-5 pb-4">
        <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-2">
          Simulação · Produto em Vídeo
        </p>
        <h1 className="text-[1.75rem] font-extrabold leading-[1.12] text-foreground">
          Selecione os produtos<br />
          <span className="text-primary">para transformar em vídeo.</span>
        </h1>
      </div>

      <div className="max-w-md mx-auto px-5 pb-8">
        {/* Select all */}
        <button
          onClick={() => setSelected(allSelected ? [] : PRODUCTS.map(p => p.id))}
          className="flex items-center gap-2 text-[11px] font-semibold text-foreground/50 mb-4 hover:text-primary transition-colors"
        >
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
            allSelected ? "bg-primary border-primary" : "border-border"
          }`}>
            {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
          Selecionar todos
        </button>

        {/* Label favoritos */}
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider">Seus favoritos</span>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {PRODUCTS.map((p, i) => {
            const sel = selected.includes(p.id);
            const isLastOdd = i === PRODUCTS.length - 1 && PRODUCTS.length % 2 !== 0;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => toggle(p.id)}
                className={`relative rounded-2xl overflow-hidden text-left bg-muted/20 ${isLastOdd ? "col-span-2" : ""}`}
                style={{ aspectRatio: isLastOdd ? "2/1" : "1/1" }}
              >
                <img
                  src={p.img}
                  alt={`Produto ${p.id}`}
                  className={`w-full h-full object-contain p-3 transition-all duration-200 ${
                    sel ? "opacity-100" : "opacity-40"
                  }`}
                />
                {sel && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-primary ring-inset pointer-events-none" />
                )}
                {/* Estrela favorito */}
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-yellow-400/90 flex items-center justify-center">
                  <Star className="w-2.5 h-2.5 fill-white text-white" />
                </div>
                {/* Checkmark seleção */}
                <motion.div
                  initial={false}
                  animate={{ scale: sel ? 1 : 0.8, opacity: sel ? 1 : 0.35 }}
                  className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${
                    sel ? "bg-primary" : "bg-black/30"
                  }`}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              </motion.button>
            );
          })}

          {/* Ver mais produtos — ocupa coluna inteira */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: PRODUCTS.length * 0.06 }}
            className="col-span-2 flex items-center justify-between px-4 py-3.5 rounded-2xl bg-muted/25 hover:bg-muted/40 transition-colors text-left"
          >
            <div>
              <p className="text-[12px] font-bold text-foreground/70">Ver mais produtos</p>
              <p className="text-[10px] text-foreground/35 mt-0.5">+510 produtos disponíveis no catálogo</p>
            </div>
            <ChevronRight className="w-4 h-4 text-foreground/30 flex-shrink-0" />
          </motion.button>
        </div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          onClick={() => selected.length > 0 && onStart(selected)}
          disabled={selected.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-30 transition-all"
          style={{ boxShadow: selected.length > 0 ? "0 4px 24px rgba(255,90,31,0.35)" : undefined }}
        >
          <Bot className="w-4 h-4" />
          {selected.length > 0
            ? `Gerar ${selected.length} vídeo${selected.length > 1 ? "s" : ""} com IA`
            : "Selecione produtos"}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Generation Screen ────────────────────────────────────────────────────────

type Phase = "processing" | "published";

interface PublishedItem {
  product: typeof PRODUCTS[0];
  plat: typeof PLATS[0];
}

function GenerationScreen({ productIds }: { productIds: number[] }) {
  const products  = PRODUCTS.filter(p => productIds.includes(p.id));
  const total     = products.length;

  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [stepIdx,     setStepIdx]     = useState(0);
  const [progress,    setProgress]    = useState(0);
  const [phase,       setPhase]       = useState<Phase>("processing");
  const [published,   setPublished]   = useState<PublishedItem[]>([]);
  const [allDone,     setAllDone]     = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listEndRef  = useRef<HTMLDivElement>(null);

  const startProduct = (idx: number) => {
    setCurrentIdx(idx);
    setStepIdx(0);
    setProgress(0);
    setPhase("processing");
  };

  useEffect(() => { startProduct(0); }, []);

  // Scroll para o final quando publicar
  useEffect(() => {
    if (published.length > 0) {
      setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
    }
  }, [published.length]);

  useEffect(() => {
    if (allDone || phase !== "processing") return;

    const stepDuration = 260;
    let p = 0;
    intervalRef.current = setInterval(() => {
      p = Math.min(p + 2, 100);
      setProgress(p);
    }, stepDuration / 50);

    const t = setTimeout(() => {
      clearInterval(intervalRef.current!);
      setProgress(100);

      if (stepIdx < STEPS.length - 1) {
        setTimeout(() => { setStepIdx(s => s + 1); setProgress(0); }, 150);
      } else {
        setPhase("published");
        setPublished(prev => [...prev, {
          product: products[currentIdx],
          plat: PLATS[currentIdx % PLATS.length],
        }]);

        setTimeout(() => {
          if (currentIdx + 1 < total) {
            startProduct(currentIdx + 1);
          } else {
            setAllDone(true);
          }
        }, 1150);
      }
    }, stepDuration);

    return () => { clearTimeout(t); clearInterval(intervalRef.current!); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, stepIdx, phase]);

  const current = products[currentIdx];
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
                animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} /> Gerando IA</>
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

      {/* Main card — produto atual */}
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
              {/* Área visual */}
              <div className="relative w-full" style={{ height: 260 }}>
                {/* Imagem do produto */}
                <img
                  src={current.img}
                  alt="Produto"
                  className="absolute inset-0 w-full h-full object-contain p-6"
                />

                {/* Vídeo quando publicado */}
                <AnimatePresence>
                  {phase === "published" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                      <video
                        src={current.video}
                        autoPlay muted loop playsInline
                        className="w-full h-full object-contain bg-black"
                      />
                      <motion.div
                        className="absolute inset-0 bg-white"
                        initial={{ opacity: 0.85 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.45 }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Scan de IA */}
                {phase === "processing" && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                      className="absolute inset-x-0 h-20"
                      style={{ background: "linear-gradient(to bottom, transparent, rgba(255,90,31,0.1), transparent)" }}
                      animate={{ top: ["-15%", "115%"] }}
                      transition={{ repeat: Infinity, duration: 1.7, ease: "linear" }}
                    />
                  </div>
                )}

                {/* Badge Publicado! */}
                <AnimatePresence>
                  {phase === "published" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center"
                          style={{ boxShadow: "0 0 30px rgba(255,90,31,0.55)" }}>
                          <Check className="w-7 h-7 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-white text-[13px] font-extrabold px-4 py-1 rounded-full"
                          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
                          Publicado!
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Plataforma */}
                {phase === "published" && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
                  >
                    <img src={plat.img} alt="" className="w-3.5 h-3.5 object-contain" />
                    <span className="text-[9px] font-bold text-white">{plat.label}</span>
                  </motion.div>
                )}
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
                      <span className="text-[12px] font-bold text-foreground">Vídeo publicado!</span>
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

      {/* ── Vídeos publicados acumulando ─────────────────────────────── */}
      {published.length > 0 && (
        <div className="max-w-md mx-auto w-full px-5 pt-4">
          <p className="text-[10px] font-extrabold text-foreground/35 uppercase tracking-widest mb-3">
            Publicados
          </p>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {published.map((item, i) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: -16, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 340, damping: 26 }}
                  className="flex items-center gap-3 bg-card rounded-2xl px-3 py-2.5 border border-border/40"
                >
                  {/* Thumb do vídeo */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0">
                    <video
                      src={item.product.video}
                      muted loop playsInline
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                    {/* Número */}
                    <div className="absolute bottom-0.5 left-0.5 bg-black/60 rounded-md px-1">
                      <span className="text-[8px] font-bold text-white">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-[12px] font-bold text-foreground">Publicado com sucesso</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {PLATS.map(p => (
                        <div key={p.label} className="flex items-center gap-0.5">
                          <img src={p.img} alt="" className="w-3 h-3 object-contain opacity-60" />
                          <span className="text-[9px] text-foreground/40">{p.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plataforma principal */}
                  <img src={item.plat.img} alt="" className="w-5 h-5 object-contain opacity-70 flex-shrink-0" />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={listEndRef} />
          </div>
        </div>
      )}

      {/* ── Banner de conclusão ────────────────────────────────────────── */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto w-full px-5 pt-4 pb-10"
          >
            <div className="rounded-3xl px-5 py-5 text-center"
              style={{ background: "linear-gradient(135deg, rgba(255,90,31,0.12) 0%, rgba(255,90,31,0.05) 100%)", border: "1px solid rgba(255,90,31,0.2)" }}>
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
                {total} vídeo{total > 1 ? "s" : ""} gerado{total > 1 ? "s" : ""} com IA e publicado{total > 1 ? "s" : ""}<br />
                no Shopee Vídeo, TikTok e Instagram.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!allDone && <div className="pb-10" />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Stage = { type: "select" } | { type: "generating"; ids: number[] };

export default function SimulacaoPVI() {
  const [stage, setStage] = useState<Stage>({ type: "select" });

  if (stage.type === "select")
    return <SelectScreen onStart={ids => setStage({ type: "generating", ids })} />;

  return <GenerationScreen productIds={stage.ids} />;
}
