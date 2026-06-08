import { useState, useEffect } from "react";
import {
  ArrowLeft, Play, Sparkles, Loader2, Check,
  Send, Eye, TrendingUp, DollarSign, Video, X, ShoppingBag,
  Home, ChefHat, Gem, ShoppingCart, Dumbbell, Baby, Smartphone, PawPrint, LayoutGrid, Leaf, Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
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
import vid05 from "@/assets/pack-vid-05.jfif";
import vid06 from "@/assets/pack-vid-06.jfif";
import vid07 from "@/assets/pack-vid-07.jfif";
import vid08 from "@/assets/pack-vid-08.jfif";
import vid09 from "@/assets/pack-vid-09.jfif";
import vid10 from "@/assets/pack-vid-10.jfif";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Nicho { nicho: string; total: number; }

interface PlanoItem {
  id: string;
  plano_id: string;
  ordem: number;
  horario: string | null;
  horario_sugerido: string | null;
  nicho: string;
  message_id: string;
  legenda: string | null;
  hashtags: string | null;
  link_video: string | null;
  link_shopee: string | null;
}

type View = "dashboard" | "form" | "loading" | "result";

const QUANTIDADES = [3, 5, 7, 10] as const;

// ─── Static data ──────────────────────────────────────────────────────────────
const REDES_DASH = [
  { label: "Shopee Vídeo", img: shopeeImg },
  { label: "TikTok",       img: tiktokImg },
  { label: "Instagram",    img: instagramImg },
];

const TOP_VIDEOS = [
  { thumb: vid01, title: "Utensílios de Cozinha",    plataforma: "Shopee Vídeo", plataformaColor: "bg-orange-500", views: "38.980", comissao: "R$63,65" },
  { thumb: vid02, title: "Potes da Shopee",           plataforma: "Shopee Vídeo", plataformaColor: "bg-orange-500", views: "25.531", comissao: "R$41,70" },
  { thumb: vid03, title: "Jogo de Cama Rosa",         plataforma: "Instagram",    plataformaColor: "bg-pink-500",   views: "17.151", comissao: "R$28,01" },
  { thumb: vid04, title: "Rodo Mágico Dobrável",      plataforma: "Instagram",    plataformaColor: "bg-pink-500",   views: "10.914", comissao: "R$17,82" },
  { thumb: vid05, title: "Baratinhos para Casa",      plataforma: "TikTok",       plataformaColor: "bg-zinc-800",   views: "4.873",   comissao: "R$7,93" },
];

const RESULT_THUMBS = [vid06, vid07, vid08, vid09, vid10, vid01, vid02, vid03];

const PLATFORMS = [
  { label: "Shopee Vídeo", img: shopeeImg },
  { label: "TikTok",       img: tiktokImg },
  { label: "Instagram",    img: instagramImg },
];

const DEMO_LEGENDAS = [
  "Achei esse produto incrível na Shopee! Link na bio para comprar com desconto.",
  "Esse produto mudou minha rotina! Vale muito a pena conferir.",
  "Olha que achado na Shopee! Qualidade top e preço ótimo.",
  "Produto favorito do momento! Não perca essa oferta incrível.",
  "Vocês precisam ver esse produto! Melhor compra que fiz esse mês.",
  "Super recomendo! Chegou rapidinho e a qualidade é impecável.",
  "Um dos melhores achados da Shopee até agora. Aproveitem!",
];

const DEMO_HASHTAGS = [
  "#shopee #achadinhos #promoção #compras",
  "#shopee #viral #achadodaShopee #ofertas",
  "#achadinhos #shopee #dica #recomendo",
  "#shopee #tendencia #viral #comprafacil",
  "#achado #shopee #melhorespreços #achadinhos",
];

/** Gera legenda + hashtags relevantes para cada nicho */
const NICHO_CONTEUDO: Record<string, { legenda: string; hashtags: string }> = {
  "Casa e Decoração":    { legenda: "Transformei minha casa com esse achado incrível da Shopee! Qualidade surpreendente e chegou rapidinho. Corre que vale muito!",                hashtags: "#casaedecoracao #decoracao #shopee #achadinhos #casanova #decoracaodecasa #viral" },
  "Cozinha":             { legenda: "Esse produto revolucionou minha cozinha! Facilita demais o dia a dia e o preço é ótimo. Não consigo imaginar sem ele agora.",                  hashtags: "#cozinha #utilidadesdomesticas #shopee #achadinhos #cozinheira #organizacao #dica" },
  "Beleza":              { legenda: "Minha skincare favorita agora! Resultado incrível em poucos dias de uso. Encontrei na Shopee e recomendo de olhos fechados.",                  hashtags: "#beleza #skincare #shopee #achadinhos #cuidadosdapele #maquiagem #belezaafro #viral" },
  "Moda":                { legenda: "Olha que look incrível que montei com esse achado da Shopee! Chegou perfeito, a qualidade surpreendeu e o preço é imperdível.",               hashtags: "#moda #ootd #shopee #achadinhos #look #estilo #fashion #modafeminina #viral" },
  "Fitness":             { legenda: "Meus treinos nunca mais foram os mesmos! Esse produto da Shopee é essencial pra quem quer evoluir. Entrega rápida e qualidade top.",          hashtags: "#fitness #treino #shopee #achadinhos #academia #musculacao #gym #saudavel #viral" },
  "Bebê e Criança":      { legenda: "Para os papais e mamães: esse produto mudou nossa rotina! Seguro, resistente e com um custo-benefício incrível na Shopee.",                  hashtags: "#bebe #crianca #shopee #achadinhos #maternidade #paternidade #mamae #papai #viral" },
  "Eletrônicos":         { legenda: "Esse gadget me surpreendeu muito! Qualidade top, funciona perfeitamente e o preço na Shopee é muito abaixo do mercado.",                      hashtags: "#eletronicos #gadget #shopee #achadinhos #tech #tecnologia #viral #inovacao" },
  "Pet":                 { legenda: "Meu pet AMOU! Qualidade excelente, seguro e ele simplesmente não larga. Encontrei na Shopee e o preço é ótimo. Corre!",                       hashtags: "#pet #cachorro #gato #shopee #achadinhos #petshop #petlovers #animaisdecoracao" },
  "Organização":         { legenda: "Minha casa virou outra depois desse produto! Organização em outro nível, prático e bonito. Achei na Shopee por um precinho incrível.",        hashtags: "#organizacao #organizacaodecasa #shopee #achadinhos #declutter #arrumacao #viral" },
  "Jardim":              { legenda: "Meu jardim nunca esteve tão bonito! Esse produto da Shopee fez toda a diferença. Fácil de usar e chegou super rápido.",                       hashtags: "#jardim #plantas #shopee #achadinhos #jardinagem #natureza #plantinhas #viral" },
};

function gerarLegenda(nicho: string, topico: string | null): { legenda: string; hashtags: string } {
  // Tenta match exato primeiro
  if (NICHO_CONTEUDO[nicho]) return NICHO_CONTEUDO[nicho];
  // Tenta match parcial
  const chave = Object.keys(NICHO_CONTEUDO).find(k =>
    nicho.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(nicho.toLowerCase())
  );
  if (chave) return NICHO_CONTEUDO[chave];
  // Fallback genérico — usa topico_original como âncora
  const base = topico ? `${topico} — e` : "E";
  return {
    legenda:  `${base}sse produto da Shopee é um achado e tanto! Qualidade incrível, chegou rápido e o preço vale muito. Corre lá!`,
    hashtags: "#shopee #achadinhos #achadodaShopee #viral #oferta #compras #promoção #dica",
  };
}

const DEMO_VIDEO = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/antesvideosproprios.mp4";

const NICHO_ICONS: Record<string, LucideIcon> = {
  "Casa e Decoração": Home,
  "Cozinha":          ChefHat,
  "Beleza":           Gem,
  "Moda":             ShoppingCart,
  "Fitness":          Dumbbell,
  "Bebê e Criança":   Baby,
  "Eletrônicos":      Smartphone,
  "Pet":              PawPrint,
  "Organização":      LayoutGrid,
  "Jardim":           Leaf,
};

// ─── Supabase helpers ─────────────────────────────────────────────────────────
async function fetchItensEnriquecidos(planoId: string): Promise<PlanoItem[]> {
  const { data, error } = await supabase
    .from("ia_plano_itens")
    .select("id, plano_id, ordem, message_id, nicho, horario, legenda, hashtags, link_video, link_shopee")
    .eq("plano_id", planoId)
    .order("ordem");

  if (error || !data) return [];

  // Normalize horario → horario_sugerido
  const normalized = (data as any[]).map((item) => ({
    ...item,
    horario_sugerido: item.horario ?? item.horario_sugerido ?? null,
  })) as PlanoItem[];

  // Batch lookup for items missing link_video
  const semVideo = normalized.filter(it => !it.link_video && it.message_id);
  if (semVideo.length > 0) {
    const ids = semVideo.map(it => it.message_id);
    const { data: vids } = await supabase
      .from("videos_achadinhos")
      .select("message_id, link_video")
      .in("message_id", ids);

    if (vids) {
      const map: Record<string, string> = Object.fromEntries(
        (vids as any[]).map((v) => [v.message_id, v.link_video])
      );
      return normalized.map(it =>
        !it.link_video && map[it.message_id]
          ? { ...it, link_video: map[it.message_id] }
          : it
      );
    }
  }

  return normalized;
}

// ─── LoadingIAScreen ──────────────────────────────────────────────────────────
function LoadingIAScreen({ onDone }: { onDone: () => void }) {
  const STEPS = [
    "Analisando nichos selecionados",
    "Buscando melhores vídeos",
    "Montando sua lista personalizada",
    "Preparando vídeos para postagem",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStep(i), i * 900)
    );
    const done = setTimeout(onDone, STEPS.length * 900 + 400);
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
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">IA Trabalhando.</h2>
        <p className="text-xs text-muted-foreground mb-6">Não feche essa tela</p>

        <div className="space-y-3 text-left">
          {STEPS.map((s, i) => (
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
                {i < step
                  ? <Check className="w-3 h-3 text-white" />
                  : i === step
                  ? <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
                  : null}
              </div>
              <span className={`text-sm font-medium ${
                i <= step ? "text-foreground" : "text-muted-foreground/50"
              }`}>{s}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── ResultView ───────────────────────────────────────────────────────────────
function ResultView({
  planoItens, nichos, quantidade, onNovo,
}: {
  planoItens: PlanoItem[];
  nichos: string[];
  quantidade: number;
  onBack: () => void;
  onNovo: () => void;
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [posted, setPosted] = useState<Set<string>>(new Set());
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Use real items if available, otherwise fallback to fake
  const items: PlanoItem[] = planoItens.length > 0
    ? planoItens
    : Array.from({ length: quantidade }, (_, i) => ({
        id: String(i),
        plano_id: "",
        ordem: i,
        horario: null,
        horario_sugerido: null,
        nicho: nichos[i % nichos.length] ?? "Variados",
        message_id: "",
        legenda: DEMO_LEGENDAS[i % DEMO_LEGENDAS.length],
        hashtags: null,
        link_video: null,
        link_shopee: null,
      }));

  return (
    <>
      <AnimatePresence>
        {showPopup && <PostagemAutomaticaPopup onClose={() => setShowPopup(false)} quantidade={quantidade} />}
      </AnimatePresence>

      {/* Video modal */}
      <AnimatePresence>
        {activeVideoUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideoUrl(null)}
          >
            <motion.div
              className="w-full max-w-xs rounded-2xl overflow-hidden relative"
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <video
                src={activeVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[75vh] bg-black"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 pb-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-muted-foreground">Vídeos prontos</p>
            <p className="text-2xl font-extrabold text-foreground">{items.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{nichos.join(", ")}</p>
          </div>
          <button
            onClick={onNovo}
            className="text-xs font-semibold text-primary flex items-center gap-1 hover:opacity-75 transition-opacity"
          >
            Gerar novos
          </button>
        </motion.div>

        <div className="space-y-4">
          {items.map((item, i) => {
            const plat     = PLATFORMS[i % PLATFORMS.length];
            const conteudo = gerarLegenda(item.nicho, item.legenda);
            const legenda  = item.legenda   ?? conteudo.legenda;
            const hashtags = item.hashtags  ?? conteudo.hashtags;
            const videoUrl = item.link_video ?? DEMO_VIDEO;
            const isPosted = posted.has(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                {/* ── Prévia do vídeo ── */}
                <div
                  className="relative bg-black cursor-pointer"
                  style={{ aspectRatio: "16/9" }}
                  onClick={() => setActiveVideoUrl(videoUrl)}
                >
                  {/* Thumbnail real: primeiro frame do vídeo */}
                  <video
                    src={videoUrl}
                    preload="metadata"
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ pointerEvents: "none" }}
                    onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.1; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                    <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/60">
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Nicho badge */}
                  <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <span className="text-[9px] font-bold text-white">{item.nicho}</span>
                  </div>
                  {/* Plataforma badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                    <img src={plat.img} alt={plat.label} className="w-3 h-3 object-contain" />
                    <span className="text-[9px] font-bold text-white">{plat.label}</span>
                  </div>
                  {/* Horário sugerido */}
                  {item.horario_sugerido && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                      <span className="text-[9px] text-white/80 font-medium">{item.horario_sugerido}</span>
                    </div>
                  )}
                </div>

                {/* ── Conteúdo ── */}
                <div className="p-3 space-y-2">
                  {/* Legenda */}
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
                      Legenda
                    </p>
                    <p className="text-xs text-foreground leading-snug">{legenda}</p>
                  </div>

                  {/* Hashtags */}
                  <p className="text-[11px] text-primary font-medium leading-snug">{hashtags}</p>

                  {/* Link do produto */}
                  {item.link_shopee && (
                    <div className="flex items-center gap-1.5 bg-muted/40 rounded-xl px-2.5 py-1.5">
                      <ShoppingBag className="w-3 h-3 text-primary shrink-0" />
                      <p className="text-[10px] text-muted-foreground truncate flex-1">
                        {item.link_shopee}
                      </p>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-0.5">
                    <button
                      onClick={() => setActiveVideoUrl(videoUrl)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/15 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Ver vídeo
                    </button>
                    <button
                      onClick={() => setPosted(prev => new Set([...prev, item.id]))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-colors ${
                        isPosted
                          ? "bg-green-500/10 text-green-600"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {isPosted ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                      {isPosted ? "Postado" : "Postar vídeo"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Botão Postagem Automática */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => setShowPopup(true)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-opacity shadow-lg"
          style={{ boxShadow: "0 4px 16px rgba(255,90,31,0.35)" }}
        >
          <Sparkles className="w-4 h-4" />
          Postagem Automática
        </motion.button>
      </div>
    </>
  );
}

// ─── Fallbacks ────────────────────────────────────────────────────────────────

/** Busca vídeos reais direto da tabela quando a RPC falha */
async function fetchVideosDiretos(nichos: string[], quantidade: number): Promise<PlanoItem[]> {
  const { data, error } = await supabase
    .from("videos_achadinhos")
    .select("message_id, nicho, link_video, link_shopee, topico_original")
    .in("nicho", nichos)
    .not("link_video", "is", null)
    .limit(quantidade);

  if (error || !data || data.length === 0) {
    // Sem acesso ao banco — usar itens 100% demo
    return buildDemoItens(nichos, quantidade);
  }

  return (data as any[]).map((v, i) => {
    const nicho   = v.nicho ?? nichos[i % nichos.length];
    const conteudo = gerarLegenda(nicho, v.topico_original ?? null);
    return {
      id:               v.message_id ?? `real-${i}`,
      plano_id:         "direto",
      ordem:            i,
      horario:          null,
      horario_sugerido: `${String((8 + i * 2) % 22).padStart(2, "0")}:00`,
      nicho,
      message_id:       v.message_id ?? "",
      legenda:          conteudo.legenda,
      hashtags:         conteudo.hashtags,
      link_video:       v.link_video ?? null,
      link_shopee:      v.link_shopee ?? null,
    };
  });
}

/** Último recurso — sem banco de dados disponível */
function buildDemoItens(nichos: string[], quantidade: number): PlanoItem[] {
  return Array.from({ length: quantidade }, (_, i) => ({
    id:               `demo-${i}`,
    plano_id:         "demo",
    ordem:            i,
    horario:          null,
    horario_sugerido: `${String((8 + i * 2) % 22).padStart(2, "0")}:00`,
    nicho:            nichos[i % nichos.length],
    message_id:       "",
    legenda:          DEMO_LEGENDAS[i % DEMO_LEGENDAS.length],
    hashtags:         DEMO_HASHTAGS[i % DEMO_HASHTAGS.length],
    link_video:       DEMO_VIDEO,
    link_shopee:      "https://shopee.com.br/product/431103460.12193367121",
  }));
}

// ─── FormView ─────────────────────────────────────────────────────────────────
function FormView({
  onCancel, onGerado,
}: {
  onCancel: () => void;
  onGerado: (itens: PlanoItem[], nichos: string[], quantidade: number) => void;
}) {
  const [quantidade, setQuantidade] = useState<number>(5);
  const [nichosSelecionados, setNichosSelecionados] = useState<string[]>([]);
  const [nichos, setNichos] = useState<Nicho[]>([]);
  const [loadingNichos, setLoadingNichos] = useState(true);
  const [loadingGerar, setLoadingGerar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc("get_nichos_videos").then(({ data }) => {
      if (data) setNichos(data as Nicho[]);
      setLoadingNichos(false);
    });
  }, []);

  const toggleNicho = (nicho: string) =>
    setNichosSelecionados(prev => {
      if (prev.includes(nicho)) return prev.filter(n => n !== nicho);
      if (prev.length >= 3) return prev;
      return [...prev, nicho];
    });

  const handleGerar = async () => {
    if (nichosSelecionados.length === 0) {
      setError("Selecione pelo menos um nicho.");
      return;
    }
    setLoadingGerar(true);
    setError(null);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("gerar_plano_postagens", {
        _redes: ["TikTok", "Instagram", "Shopee Vídeo"],
        _quantidade: quantidade,
        _nichos: nichosSelecionados,
      });
      if (rpcError) throw rpcError;
      const planoId: string =
        typeof rpcData === "string"
          ? rpcData
          : (rpcData as any)?.id ?? String(rpcData);
      const itens = await fetchItensEnriquecidos(planoId);
      onGerado(itens, nichosSelecionados, quantidade);
    } catch (e) {
      // RPC indisponível — buscar vídeos reais direto da tabela
      console.warn("RPC gerar_plano_postagens indisponível, buscando vídeos diretos:", e);
      const itens = await fetchVideosDiretos(nichosSelecionados, quantidade);
      onGerado(itens, nichosSelecionados, quantidade);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-5 pb-10 space-y-4"
    >
      {/* Quantidade */}
      <div className="glass-card p-4">
        <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wide">
          Quantidade de vídeos
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUANTIDADES.map(q => (
            <button
              key={q}
              onClick={() => setQuantidade(q)}
              className={`py-2.5 rounded-2xl text-sm font-extrabold border transition-all ${
                quantidade === q
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Nichos */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-foreground uppercase tracking-wide">Nichos</p>
          <span className="text-[10px] text-muted-foreground">
            {nichosSelecionados.length}/3 selecionados
          </span>
        </div>

        {loadingNichos ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {nichos.map(n => {
              const ativo = nichosSelecionados.includes(n.nicho);
              const desabilitado = !ativo && nichosSelecionados.length >= 3;
              return (
                <button
                  key={n.nicho}
                  onClick={() => toggleNicho(n.nicho)}
                  disabled={desabilitado}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${
                    ativo          ? "bg-primary/10 border-primary"
                    : desabilitado ? "bg-card border-border opacity-40"
                    :                "bg-card border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      ativo ? "bg-primary border-primary" : "border-border"
                    }`}>
                      {ativo && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {(() => { const Icon = NICHO_ICONS[n.nicho] ?? Tag; return <Icon className="w-3.5 h-3.5 text-primary shrink-0" />; })()}
                    <span className={`text-xs font-semibold ${ativo ? "text-primary" : "text-foreground"}`}>
                      {n.nicho}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {Number(n.total).toLocaleString("pt-BR")} vídeos
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loadingGerar}
          className="flex-1 py-3 rounded-2xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          onClick={handleGerar}
          disabled={loadingGerar || loadingNichos}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loadingGerar ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loadingGerar ? "Gerando..." : "Gerar vídeos"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── DashboardView ────────────────────────────────────────────────────────────
function DashboardView({ onCriar }: { onCriar: () => void }) {
  return (
    <div className="px-5 pb-10 space-y-4">
      {/* Métricas */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { icon: <Video className="w-4 h-4 text-primary" />, label: "Vídeos postados", value: "31" },
          { icon: <Eye className="w-4 h-4 text-primary" />,   label: "Views hoje",      value: "97.449" },
        ].map(m => (
          <div key={m.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              {m.icon}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{m.label}</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{m.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Redes conectadas */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
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
            <div
              key={r.label}
              className="flex flex-col items-center gap-2 p-2.5 bg-muted/30 rounded-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <img src={r.img} alt={r.label} className="w-6 h-6 object-contain" />
              </div>
              <p className="text-[9px] font-semibold text-foreground text-center leading-tight">{r.label}</p>
              <span className="text-[8px] font-bold text-green-500 flex items-center gap-0.5">
                <Check className="w-2 h-2" /> Conectado
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Melhores vídeos hoje */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="px-4 pt-4 pb-3 border-b border-border/60">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
            Melhores vídeos hoje
          </p>
        </div>
        <div className="divide-y divide-border/40">
          {TOP_VIDEOS.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.06 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0">
                <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{v.title}</p>
                <span className={`inline-block text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md mt-0.5 ${v.plataformaColor}`}>
                  {v.plataforma}
                </span>
                <p className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" /> {v.views}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-primary">{v.comissao}</p>
                <p className="text-[9px] text-muted-foreground">comissão</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* KPIs adicionais */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Vídeos viralizados</p>
          <p className="text-xl font-extrabold text-foreground mt-0.5">3</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Comissões hoje</p>
          <p className="text-xl font-extrabold text-primary mt-0.5">R$159,11</p>
        </div>
      </motion.div>

      {/* Botão criar */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        onClick={onCriar}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-opacity"
        style={{ boxShadow: "0 4px 16px rgba(255,90,31,0.30)" }}
      >
        + Criar mais vídeos
      </motion.button>

      <p className="text-center text-muted-foreground/30 text-[10px]">
        Postagem Automática • v2.0
      </p>
    </div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────
const IAVideos = () => {
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSystemSettings();

  const [view, setView] = useState<View>("dashboard");
  const [resultItens, setResultItens] = useState<PlanoItem[]>([]);
  const [resultNichos, setResultNichos] = useState<string[]>([]);
  const [resultQtd, setResultQtd] = useState(5);

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings.modules.ai_videos.enabled) {
    return (
      <ModuleDisabledState
        title="IA de Vídeos indisponível"
        message={settings.modules.ai_videos.disabled_message}
      />
    );
  }

  const headerTitle =
    view === "form"      ? "Criar vídeos"
    : view === "loading" ? "Gerando..."
    : view === "result"  ? "Vídeos prontos"
    :                      "Postagem Automática";

  const handleBack = () => {
    if (view === "dashboard") navigate(-1);
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
              {view === "dashboard" ? "Voltar" : "Início"}
            </button>
          </div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            IA de Vídeos
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            {view === "dashboard" ? (
              <>Postagem <span className="text-primary">automática.</span></>
            ) : view === "result" ? (
              <>Vídeos <span className="text-primary">prontos.</span></>
            ) : (
              <>{headerTitle}</>
            )}
          </h1>
        </div>
      </div>

      <ModuleBanner
        src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/banner-iadevideos.png"
        alt="IA de Vídeos"
      />

      <div className="max-w-md mx-auto mt-2">
        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DashboardView onCriar={() => setView("form")} />
            </motion.div>
          )}

          {view === "form" && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FormView
                onCancel={() => setView("dashboard")}
                onGerado={(itens, nichos, qtd) => {
                  setResultItens(itens);
                  setResultNichos(nichos);
                  setResultQtd(qtd);
                  setView("loading");
                }}
              />
            </motion.div>
          )}

          {view === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingIAScreen onDone={() => setView("result")} />
            </motion.div>
          )}

          {view === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultView
                planoItens={resultItens}
                nichos={resultNichos}
                quantidade={resultQtd}
                onBack={() => setView("dashboard")}
                onNovo={() => setView("form")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IAVideos;
