import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Check, Play, Download, Send,
  Shield, Sparkles, Link2, Video, DollarSign, TrendingUp, Clipboard,
} from "lucide-react";
import ModuleBanner from "@/components/ModuleBanner";
import ModuleDisabledState from "@/components/ModuleDisabledState";
import PostagemAutomaticaPopup from "@/components/PostagemAutomaticaPopup";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import shopeeImg from "@/assets/shopee-icon.png";
import tiktokImg from "@/assets/tiktok-icon.png";
import instagramImg from "@/assets/instagram-icon.webp";
import vid01 from "@/assets/pack-vid-01.jfif";
import vid02 from "@/assets/pack-vid-02.jfif";
import vid03 from "@/assets/pack-vid-03.jfif";
import vid04 from "@/assets/pack-vid-04.jfif";
import vid07 from "@/assets/pack-vid-07.jfif";

// ─── Tipos e Constantes ───────────────────────────────────────────────────────
type View = "dashboard" | "step1" | "step2" | "step3" | "loading" | "result";

const PRODUCT_IMG = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/produto-shopee-DGIGMCCB.png";

const RESULT_VIDEOS = [
  {
    label: "Viral",
    desc: "Rápido, chamativo, feito pra prender atenção.",
    url: "https://nilqymbvbcvkxelfqzrz.supabase.co/storage/v1/object/public/chosen/Untitled%20folder/TikSave.io_7340460954473303302.mp4",
    thumb: vid01,
  },
  {
    label: "Unboxing",
    desc: "Simula a experiência de abrir o produto.",
    url: "https://nilqymbvbcvkxelfqzrz.supabase.co/storage/v1/object/public/chosen/Untitled%20folder/TikSave.io_7562391338197470472.mp4",
    thumb: vid02,
  },
  {
    label: "Demonstrativo",
    desc: "Mostra o produto em uso e seus benefícios.",
    url: "https://nilqymbvbcvkxelfqzrz.supabase.co/storage/v1/object/public/chosen/Untitled%20folder/TikSave.io_7635436311746235669.mp4",
    thumb: vid03,
  },
  {
    label: "Apresentação IA",
    desc: "Modelo de IA apresentando o produto.",
    url: "https://nilqymbvbcvkxelfqzrz.supabase.co/storage/v1/object/public/chosen/Untitled%20folder/TikSave.io_7626772664010460424.mp4",
    thumb: vid04,
  },
];

const ESTILOS = RESULT_VIDEOS.map(v => ({ value: v.label, label: v.label, desc: v.desc }));

const REDES_DASH = [
  { label: "Shopee Vídeo", img: shopeeImg },
  { label: "TikTok",       img: tiktokImg },
  { label: "Instagram",    img: instagramImg },
];

const RECENT_VIDEOS = [
  { thumb: vid01, code: "VRL-8X2",  plat: "Shopee Vídeo", platImg: shopeeImg,    value: "R$ 96,40" },
  { thumb: vid02, code: "UNB-9A1",  plat: "TikTok",       platImg: tiktokImg,    value: "R$ 72,85" },
  { thumb: vid03, code: "DMO-3K7",  plat: "Instagram",     platImg: instagramImg, value: "R$ 45,20" },
  { thumb: vid04, code: "AIA-5M2",  plat: "Shopee Vídeo", platImg: shopeeImg,    value: "R$ 38,90" },
  { thumb: vid07, code: "VRL-2P9",  plat: "TikTok",       platImg: tiktokImg,    value: "R$ 10,15" },
];

const DEMO_LINK_SHOPEE = "https://shopee.com.br/product/431103460.12193367121";

const IA_LOADING_STEPS = [
  "Analisando o produto",
  "Criando roteiro dos vídeos",
  "Gerando estilos selecionados",
  "Preparando vídeos para postagem",
];

const LEGENDAS_RESULT: Record<string, { legenda: string; hashtags: string }> = {
  "Viral": {
    legenda:  "Olha esse produto incrível que encontrei na Shopee! Qualidade top e entrega super rápida. Vale muito!",
    hashtags: "#shopee #viral #achadinhos #promoção #comprasonline",
  },
  "Unboxing": {
    legenda:  "Chegou meu pedido da Shopee! A embalagem veio perfeita e o produto superou minhas expectativas. Recomendo!",
    hashtags: "#unboxing #shopee #pedidochegou #achadodaShopee #qualidade",
  },
  "Demonstrativo": {
    legenda:  "Mostrando como esse produto facilita minha rotina. Comprei na Shopee e não me arrependo! Link na bio.",
    hashtags: "#demonstracao #shopee #dica #produtobom #achadinhos",
  },
  "Apresentação IA": {
    legenda:  "Esse produto da Shopee está fazendo muito sucesso! Aproveite antes que acabe. Confira o link na bio.",
    hashtags: "#ia #shopee #tendencia #achadinhos #ofertadodia",
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardView({ onCriar }: { onCriar: () => void }) {
  return (
    <div className="px-5 pb-10 space-y-4">
      {/* Header info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-[1.25rem] font-extrabold text-foreground">Sua Central de Vídeos.</h2>
        <p className="text-xs text-muted-foreground mt-1">Acompanhe sua operação antes de criar mais.</p>
      </motion.div>

      {/* KPIs 4 cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { icon: <Video className="w-4 h-4 text-primary" />,      label: "Criados hoje",       value: "12",     highlight: false },
          { icon: <Send className="w-4 h-4 text-primary" />,        label: "Postados hoje",      value: "8",      highlight: false },
          { icon: <TrendingUp className="w-4 h-4 text-primary" />,  label: "Vídeos viralizados", value: "3",      highlight: false },
          { icon: <DollarSign className="w-4 h-4 text-primary" />,  label: "Comissões hoje",     value: "R$ 247", highlight: true  },
        ].map(m => (
          <div key={m.label} className="bg-card border border-border rounded-2xl p-3.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              {m.icon}
            </div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{m.label}</p>
            <p className={`text-[1.1rem] font-extrabold mt-0.5 ${m.highlight ? "text-primary" : "text-foreground"}`}>{m.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Redes conectadas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-card border border-border rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
            Redes conectadas
          </p>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            ONLINE
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {REDES_DASH.map(r => (
            <div key={r.label} className="flex flex-col items-center gap-1.5 p-2.5 bg-muted/30 rounded-xl border border-border">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <img src={r.img} alt={r.label} className="w-6 h-6 object-contain" />
              </div>
              <p className="text-[9px] font-semibold text-foreground text-center">{r.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Últimos vídeos postados */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="px-4 pt-4 pb-3 border-b border-border/60">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
            Comissões por vídeo
          </p>
          <p className="text-sm font-bold text-foreground mt-0.5">Últimos vídeos postados</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border/30">
          {RECENT_VIDEOS.map((v, i) => (
            <div key={v.code} className={`flex items-center gap-2 p-3 ${i === RECENT_VIDEOS.length - 1 && RECENT_VIDEOS.length % 2 !== 0 ? "col-span-2" : ""}`}>
              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                <img src={v.thumb} alt={v.code} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-foreground">{v.code}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <img src={v.platImg} alt={v.plat} className="w-3 h-3 object-contain" />
                  <p className="text-[9px] text-muted-foreground truncate">{v.plat}</p>
                </div>
              </div>
              <p className="text-[11px] font-bold text-primary shrink-0">{v.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Botão criar */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        onClick={onCriar}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-opacity"
        style={{ boxShadow: "0 4px 16px rgba(255,90,31,0.30)" }}
      >
        Criar mais vídeos +
      </motion.button>
    </div>
  );
}

// ─── Step 1 — Link do Produto ─────────────────────────────────────────────────
function Step1({ onContinue }: { onContinue: () => void }) {
  const [link, setLink] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pb-10"
    >
      <div className="glass-card p-6 space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-[1.2rem] font-extrabold text-foreground mb-1">Link do Produto</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Transforme Links em Vídeos.
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Nossa IA analisa o produto e cria vídeos otimizados para Shopee, TikTok e Reels.
        </p>

        <div>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Colar Link Shopee"
              value={link}
              onChange={e => setLink(e.target.value)}
              className="flex-1 bg-muted/50 border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={() => setLink(DEMO_LINK_SHOPEE)}
              title="Usar link de demonstração"
              className="w-[52px] flex items-center justify-center rounded-2xl bg-muted/50 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all shrink-0"
            >
              <Clipboard className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <Shield className="w-3 h-3 text-muted-foreground/50" />
            <p className="text-[10px] text-muted-foreground/50">Processamento seguro de dados</p>
          </div>
        </div>

        <button
          onClick={onContinue}
          disabled={!link.trim()}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Continuar
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 2 — Confirmação ─────────────────────────────────────────────────────
function Step2({
  onConfirm, onTrocar,
}: { onConfirm: () => void; onTrocar: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pb-10"
    >
      <div className="glass-card p-6 space-y-5">
        <div className="text-center">
          <h2 className="text-[1.2rem] font-extrabold text-foreground mb-1">Confirmação</h2>
          <p className="text-sm text-muted-foreground">É esse o produto?</p>
        </div>

        <div className="rounded-2xl overflow-hidden bg-muted/20 border border-border">
          <img
            src={PRODUCT_IMG}
            alt="Produto Shopee"
            className="w-full h-56 object-contain"
          />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Confirme antes de gerar os vídeos.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onTrocar}
            className="flex-1 py-3 rounded-2xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Trocar produto
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-primary text-white font-bold py-3 rounded-2xl text-sm hover:opacity-90 transition-opacity"
          >
            Sim, continuar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 3 — Estilos ─────────────────────────────────────────────────────────
function Step3({
  onGerar,
}: { onGerar: (estilos: string[]) => void }) {
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const toggle = (v: string) =>
    setSelecionados(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 4 ? [...prev, v] : prev
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pb-10"
    >
      <div className="glass-card p-5 space-y-4">
        <div className="text-center">
          <h2 className="text-[1.2rem] font-extrabold text-foreground mb-1">Escolha os Estilos</h2>
          <p className="text-sm text-muted-foreground">Cada estilo gera um vídeo diferente.</p>
        </div>

        <div className="space-y-2">
          {ESTILOS.map(e => {
            const sel = selecionados.includes(e.value);
            return (
              <button
                key={e.value}
                onClick={() => toggle(e.value)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                  sel
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/30 border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  sel ? "bg-primary border-primary" : "border-border"
                }`}>
                  {sel && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${sel ? "text-primary" : "text-foreground"}`}>
                    {e.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{e.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          {selecionados.length}/4 estilos selecionados
        </p>

        <button
          onClick={() => onGerar(selecionados.length > 0 ? selecionados : ESTILOS.map(e => e.value))}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity"
        >
          Gerar vídeos
        </button>
      </div>
    </motion.div>
  );
}

// ─── Loading IA ───────────────────────────────────────────────────────────────
function LoadingIA({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = IA_LOADING_STEPS.map((_, i) =>
      setTimeout(() => setStep(i), i * 1000)
    );
    const done = setTimeout(onDone, IA_LOADING_STEPS.length * 1000 + 500);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-5 pb-10"
    >
      <div className="glass-card p-6 text-center">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">IA Trabalhando.</h2>
        <p className="text-xs text-muted-foreground mb-6">Não feche essa tela</p>

        <div className="space-y-3 text-left">
          {IA_LOADING_STEPS.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                i < step  ? "bg-primary"
                : i === step ? "bg-primary/20 border-2 border-primary"
                :              "bg-muted"
              }`}>
                {i < step  ? <Check className="w-3 h-3 text-white" />
                : i === step ? <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
                : null}
              </div>
              <span className={`text-sm ${i <= step ? "text-foreground font-medium" : "text-muted-foreground/50"}`}>
                {s}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Result View ──────────────────────────────────────────────────────────────
function ResultView({
  estilos, onNovo,
}: { estilos: string[]; onNovo: () => void }) {
  const [showPopup, setShowPopup]     = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [downloaded, setDownloaded]   = useState<Set<number>>(new Set());
  const [published, setPublished]     = useState<Set<number>>(new Set());

  const videos = RESULT_VIDEOS.filter(v => estilos.includes(v.label));
  const finalVideos = videos.length > 0 ? videos : RESULT_VIDEOS;

  return (
    <>
      <AnimatePresence>
        {showPopup && <PostagemAutomaticaPopup onClose={() => setShowPopup(false)} />}
      </AnimatePresence>

      {/* Modal de vídeo */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              onClick={e => e.stopPropagation()}
            >
              <video
                src={activeVideo}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[70vh] bg-black"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 pb-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-[1.2rem] font-extrabold text-foreground">Vídeos Prontos.</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {finalVideos.length} vídeo{finalVideos.length > 1 ? "s" : ""} gerado{finalVideos.length > 1 ? "s" : ""} pelo seu produto.
          </p>
        </motion.div>

        {finalVideos.map((v, i) => (
          <motion.div
            key={v.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            {/* Preview */}
            <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
              <video
                src={v.url}
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 cursor-pointer"
                onClick={() => setActiveVideo(v.url)}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
                <span className="text-xs font-bold text-white/80 bg-black/30 px-3 py-1 rounded-full">
                  {v.label}
                </span>
              </div>
            </div>

            {/* Legenda + Hashtags */}
            {(() => {
              const info = LEGENDAS_RESULT[v.label];
              return info ? (
                <div className="px-3 pt-2 pb-0 space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Legenda</p>
                  <p className="text-xs text-foreground leading-snug">{info.legenda}</p>
                  <p className="text-[11px] text-primary font-medium">{info.hashtags}</p>
                </div>
              ) : null;
            })()}

            {/* Ações */}
            <div className="p-3 flex gap-2">
              <button
                onClick={() => {
                  setDownloaded(prev => new Set([...prev, i]));
                  window.open(v.url, "_blank");
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  downloaded.has(i)
                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {downloaded.has(i) ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                {downloaded.has(i) ? "Baixado" : "Baixar"}
              </button>
              <button
                onClick={() => setPublished(prev => new Set([...prev, i]))}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  published.has(i)
                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                    : "bg-primary/10 text-primary hover:bg-primary/15"
                }`}
              >
                {published.has(i) ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                {published.has(i) ? "Publicado" : "Publicar"}
              </button>
            </div>
          </motion.div>
        ))}

        {/* Botões finais */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <button
            onClick={() => setShowPopup(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-opacity"
            style={{ boxShadow: "0 4px 16px rgba(255,90,31,0.30)" }}
          >
            <Sparkles className="w-4 h-4" />
            Publicar todos
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-muted/50 border border-border text-[10px] font-bold text-foreground hover:bg-muted transition-colors">
              <Download className="w-4 h-4 text-muted-foreground" />
              Baixar
            </button>
            <button
              onClick={onNovo}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-muted/50 border border-border text-[10px] font-bold text-foreground hover:bg-muted transition-colors"
            >
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              Gerar novos
            </button>
            <button className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-muted/50 border border-border text-[10px] font-bold text-foreground hover:bg-muted transition-colors">
              <Video className="w-4 h-4 text-muted-foreground" />
              Programar
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function CriadorVideosIA() {
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSystemSettings();

  const [view, setView]           = useState<View>("dashboard");
  const [estilosSel, setEstilos]  = useState<string[]>([]);

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings.modules.product_video.enabled) {
    return (
      <ModuleDisabledState
        title="Produto em Vídeo indisponível"
        message={settings.modules.product_video.disabled_message}
      />
    );
  }

  const headerSubtitles: Record<View, string> = {
    dashboard: "Produto em Vídeo",
    step1:     "Produto em Vídeo",
    step2:     "Produto em Vídeo",
    step3:     "Produto em Vídeo",
    loading:   "Produto em Vídeo",
    result:    "Produto em Vídeo",
  };

  const headerTitles: Record<View, JSX.Element> = {
    dashboard: <><span className="text-primary">Central</span> de Vídeos.</>,
    step1:     <>Link do <span className="text-primary">Produto.</span></>,
    step2:     <>É esse o <span className="text-primary">produto?</span></>,
    step3:     <>Escolha os <span className="text-primary">estilos.</span></>,
    loading:   <>IA <span className="text-primary">trabalhando.</span></>,
    result:    <>Vídeos <span className="text-primary">prontos.</span></>,
  };

  const handleBack = () => {
    if (view === "dashboard") navigate("/");
    else if (view === "step1") setView("dashboard");
    else if (view === "step2") setView("step1");
    else if (view === "step3") setView("step2");
    else if (view === "result") setView("dashboard");
    else setView("dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-foreground/40 text-xs font-semibold hover:text-foreground/70 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {view === "dashboard" ? "Voltar" : "Anterior"}
            </button>
          </div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            {headerSubtitles[view]}
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            {headerTitles[view]}
          </h1>
        </div>
      </div>

      <ModuleBanner
        src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/banner-produtosemvideo.png"
        alt="Produto em Vídeo"
      />

      <div className="max-w-md mx-auto mt-2">
        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DashboardView onCriar={() => setView("step1")} />
            </motion.div>
          )}
          {view === "step1" && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Step1 onContinue={() => setView("step2")} />
            </motion.div>
          )}
          {view === "step2" && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Step2 onConfirm={() => setView("step3")} onTrocar={() => setView("step1")} />
            </motion.div>
          )}
          {view === "step3" && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Step3 onGerar={est => { setEstilos(est); setView("loading"); }} />
            </motion.div>
          )}
          {view === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingIA onDone={() => setView("result")} />
            </motion.div>
          )}
          {view === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultView estilos={estilosSel} onNovo={() => setView("step1")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-muted-foreground/30 text-[10px] pb-8">
        Produto em Vídeo • v2.0
      </p>
    </div>
  );
}
