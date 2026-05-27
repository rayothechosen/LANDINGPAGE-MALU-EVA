import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, ExternalLink } from "lucide-react";
import shopeeImg from "@/assets/shopee-icon.png";
import tiktokImg from "@/assets/tiktok-icon.png";
import instagramImg from "@/assets/instagram-icon.webp";

interface Props {
  onClose: () => void;
  /** Quantidade total de vídeos a publicar. Quando informado, distribui por plataforma. */
  quantidade?: number;
}

const REDES = [
  {
    id:      "instagram",
    label:   "Instagram",
    img:     instagramImg,
    perfil:  "instagram.com/kitafiliada",
  },
  {
    id:      "tiktok",
    label:   "TikTok Shop",
    img:     tiktokImg,
    perfil:  "tiktok.com/@kitafiliada",
  },
  {
    id:      "shopee",
    label:   "Shopee Vídeo",
    img:     shopeeImg,
    perfil:  "shopee.com.br/v/kitafiliada",
  },
];

const LOADING_STEPS = [
  "Conectando contas",
  "Preparando mídia para upload",
  "Enviando vídeos para as redes",
  "Publicando legendas e hashtags",
  "Finalizando publicação",
];

type PostState = "select" | "loading" | "success";

/** Distribui `total` vídeos entre 3 redes de forma equilibrada. */
function distribuir(total: number): [number, number, number] {
  const base  = Math.floor(total / 3);
  const extra = total % 3;
  // distribui o resto para as primeiras redes
  return [base + (extra > 0 ? 1 : 0), base + (extra > 1 ? 1 : 0), base];
}

export default function PostagemAutomaticaPopup({ onClose, quantidade }: Props) {
  const [selected, setSelected] = useState<string[]>(["instagram", "tiktok", "shopee"]);
  const [state, setState]       = useState<PostState>("select");
  const [loadStep, setLoadStep] = useState(0);

  const toggle = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const handlePost = () => {
    setState("loading");
    setLoadStep(0);
  };

  useEffect(() => {
    if (state !== "loading") return;
    const timers = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setLoadStep(i), i * 900)
    );
    const done = setTimeout(() => setState("success"), LOADING_STEPS.length * 900 + 600);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [state]);

  const selectedRedes = REDES.filter(r => selected.includes(r.id));

  // Distribuição de vídeos por rede (só quando quantidade é fornecido)
  const total = quantidade ?? selectedRedes.length; // sem quantidade: 1 por rede
  const [c0, c1, c2] = distribuir(total);
  const contagens = [c0, c1, c2]; // índice = posição em REDES

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">

          {/* ── SELECT ── */}
          {state === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[1.1rem] font-extrabold text-foreground">Postagem Automática</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X className="w-4 h-4 text-foreground/60" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Selecione as redes onde deseja publicar:
              </p>

              <div className="space-y-2 mb-6">
                {REDES.map((r, i) => {
                  const qt = quantidade ? contagens[i] : 1;
                  return (
                    <button
                      key={r.id}
                      onClick={() => toggle(r.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                        selected.includes(r.id)
                          ? "bg-primary/10 border-primary"
                          : "bg-muted/30 border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white shrink-0">
                        <img src={r.img} alt={r.label} className="w-7 h-7 object-contain" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-foreground">{r.label}</p>
                        {quantidade && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {qt} vídeo{qt !== 1 ? "s" : ""} a publicar
                          </p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selected.includes(r.id) ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {selected.includes(r.id) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {quantidade && (
                <p className="text-center text-xs text-muted-foreground mb-4">
                  Total: <span className="font-bold text-foreground">{total} vídeos</span> serão publicados
                </p>
              )}

              <button
                onClick={handlePost}
                disabled={selected.length === 0}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Postar agora
              </button>
            </motion.div>
          )}

          {/* ── LOADING ── */}
          {state === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="text-center mb-6">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"
                    style={{ animationDuration: "1.5s" }}
                  />
                </div>
                <h3 className="text-[1.05rem] font-extrabold text-foreground mb-1">
                  Publicando automaticamente.
                </h3>
                <p className="text-xs text-muted-foreground">Não feche essa tela</p>
              </div>

              <div className="space-y-3">
                {LOADING_STEPS.map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: i <= loadStep ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      i < loadStep
                        ? "bg-primary"
                        : i === loadStep
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-muted"
                    }`}>
                      {i < loadStep
                        ? <Check className="w-3 h-3 text-white" />
                        : i === loadStep
                        ? <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
                        : null}
                    </div>
                    <span className={`text-sm ${
                      i <= loadStep ? "text-foreground font-medium" : "text-muted-foreground/50"
                    }`}>
                      {s}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {state === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="text-center mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/30"
                >
                  <Check className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-[1.1rem] font-extrabold text-foreground">
                  Publicado com sucesso!
                </h3>
                {quantidade ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {total} vídeos publicados automaticamente.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Seus vídeos foram publicados automaticamente.
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-5">
                {selectedRedes.map((r, i) => {
                  const redeIdx = REDES.findIndex(x => x.id === r.id);
                  const qt      = quantidade ? contagens[redeIdx] : 1;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-2xl p-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white shrink-0 flex items-center justify-center shadow-sm">
                        <img src={r.img} alt={r.label} className="w-7 h-7 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">{r.label}</p>
                        <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                          {qt} vídeo{qt !== 1 ? "s" : ""} publicado{qt !== 1 ? "s" : ""}
                        </p>
                        <p className="text-[9px] text-muted-foreground truncate mt-0.5">{r.perfil}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    </motion.div>
                  );
                })}
              </div>

              <button
                onClick={onClose}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity"
              >
                Fechar
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
