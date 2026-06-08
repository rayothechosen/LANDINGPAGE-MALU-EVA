import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Check, ChefHat, Home, Gem, ShoppingCart, Dumbbell,
  Baby, Smartphone, PawPrint, LayoutGrid, Leaf, Tag, Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import shopeeImg  from "@/assets/shopee-icon.png";
import tiktokImg  from "@/assets/tiktok-icon.png";
import instaImg   from "@/assets/instagram-icon.webp";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOGO_URL =
  "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/Sem%20t%C3%ADtulo%20-%2027%20de%20maio%20de%202026%20%C3%A0s%2000.47.41.png";


const PLATS = [
  { label: "Shopee Vídeo", img: shopeeImg },
  { label: "TikTok",       img: tiktokImg },
  { label: "Instagram",    img: instaImg  },
];

const QUANTIDADES = [10, 20, 30, 50];

// Nichos com dbValue = valor EXATO do banco de dados
const NICHOS: { label: string; dbValue: string | null; Icon: LucideIcon }[] = [
  { label: "Casa e Decoração",  dbValue: "02 - Casa, Cozinha e Decoração",           Icon: Home         },
  { label: "Moda e Beleza",     dbValue: "01 - Moda, Beleza e Estilo",               Icon: Gem          },
  { label: "Bebê e Infantil",   dbValue: "04 - Maternidade e Infantil",              Icon: Baby         },
  { label: "Organização",       dbValue: "03 - Organização, Limpeza e Utilidades",   Icon: LayoutGrid   },
  { label: "Pets",              dbValue: "05 - Pets",                                Icon: PawPrint     },
  { label: "Eletrônicos",       dbValue: "06 - Eletrônicos e Tecnologia",            Icon: Smartphone   },
  { label: "Esporte e Fitness", dbValue: "11 - Esporte, Fitness e Praia",            Icon: Dumbbell     },
  { label: "Alimentação",       dbValue: "09 - Alimentação e Comidas",               Icon: ChefHat      },
  { label: "Virais",            dbValue: "12 - Virais, Dublados e Conteúdos de Apoio", Icon: Tag        },
  { label: "Variados",          dbValue: null,                                        Icon: Leaf         },
];

const NICHO_CONTEUDO: Record<string, { legenda: string; hashtags: string }> = {
  "02 - Casa, Cozinha e Decoração":           { legenda: "Transformei minha casa com esse achado incrível da Shopee! Qualidade surpreendente e chegou rapidinho.",    hashtags: "#casaedecoracao #decoracao #shopee #achadinhos #casanova #cozinha #viral" },
  "01 - Moda, Beleza e Estilo":               { legenda: "Olha que achado incrível de moda e beleza na Shopee! Qualidade top, preço ótimo e chegou rapidíssimo.",     hashtags: "#moda #beleza #shopee #achadinhos #look #skincare #estilo #viral" },
  "04 - Maternidade e Infantil":              { legenda: "Para os papais e mamães: esse produto mudou nossa rotina! Seguro, resistente e custo-benefício incrível.",   hashtags: "#bebe #maternidade #shopee #achadinhos #crianca #mamae #papai #viral" },
  "03 - Organização, Limpeza e Utilidades":   { legenda: "Minha casa virou outra depois desse produto! Organização em outro nível, prático e bonito na Shopee.",       hashtags: "#organizacao #limpeza #shopee #achadinhos #utilidades #casaorganizada #viral" },
  "05 - Pets":                                { legenda: "Meu pet AMOU! Qualidade excelente, seguro e ele simplesmente não larga. Encontrei na Shopee por um ótimo preço!", hashtags: "#pet #cachorro #gato #shopee #achadinhos #petshop #petlovers #viral" },
  "06 - Eletrônicos e Tecnologia":            { legenda: "Esse gadget me surpreendeu muito! Qualidade top e o preço na Shopee é muito abaixo do mercado. Vale demais!", hashtags: "#eletronicos #tech #shopee #achadinhos #gadget #tecnologia #viral" },
  "11 - Esporte, Fitness e Praia":            { legenda: "Meus treinos nunca mais foram os mesmos! Esse produto da Shopee é essencial pra quem quer evoluir.",         hashtags: "#fitness #treino #shopee #achadinhos #academia #esporte #saudavel #viral" },
  "09 - Alimentação e Comidas":               { legenda: "Esse produto transformou minha alimentação! Prático, saudável e achei na Shopee por um preço incrível.",     hashtags: "#alimentacao #comida #shopee #achadinhos #saudavel #receita #viral" },
  "12 - Virais, Dublados e Conteúdos de Apoio": { legenda: "Esse vídeo está bombando! Confere o produto incrível que todo mundo está comentando na Shopee.",          hashtags: "#viral #shopee #achadinhos #tendencia #fyp #foryou #bombar" },
};

function gerarConteudo(dbValue: string | null): { legenda: string; hashtags: string } {
  if (dbValue && NICHO_CONTEUDO[dbValue]) return NICHO_CONTEUDO[dbValue];
  return { legenda: "Achado incrível na Shopee! Qualidade top e preço ótimo. Vale muito conferir!", hashtags: "#shopee #achadinhos #achadodaShopee #viral #oferta" };
}

// ─── Supabase — mesmo padrão exato do fetchVideosDiretos no IAVideos ──────────

interface VideoRow {
  message_id: string;
  nicho: string;
  link_video: string;
  topico_original: string | null;
}

async function fetchVideos(dbValue: string | null, quantidade: number): Promise<VideoRow[]> {
  const query = supabase
    .from("videos_achadinhos")
    .select("message_id, nicho, link_video, topico_original")
    .not("link_video", "is", null)
    .limit(quantidade);

  // dbValue null = "Variados" = sem filtro de nicho
  const finalQuery = dbValue ? query.eq("nicho", dbValue) : query;

  const { data, error } = await finalQuery;
  if (error || !data || data.length === 0) return [];
  return data as VideoRow[];
}

// ─── Card item ────────────────────────────────────────────────────────────────

interface CardItem {
  videoUrl: string;
  legenda: string;
  hashtags: string;
  platImg: string;
  platLabel: string;
}

// ─── Config Screen ────────────────────────────────────────────────────────────

function ConfigScreen({ onStart }: { onStart: (qtd: number, nicho: typeof NICHOS[0]) => void }) {
  const [qtd,   setQtd]   = useState<number | null>(null);
  const [nicho, setNicho] = useState<typeof NICHOS[0] | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 pt-8">
        <img src={LOGO_URL} alt="Logo" className="h-12 w-auto object-contain" />
      </div>

      <div className="max-w-md mx-auto px-5 pt-5 pb-6">
        <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-2">Simulação IA</p>
        <h1 className="text-[1.9rem] font-extrabold leading-[1.12] text-foreground">
          Configure sua<br /><span className="text-primary">postagem automática.</span>
        </h1>
      </div>

      <div className="max-w-md mx-auto px-5 pb-14 space-y-4">
        {/* Quantidade */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-3xl p-4">
          <p className="text-[10px] font-extrabold text-foreground uppercase tracking-widest mb-3">Quantos vídeos postar?</p>
          <div className="grid grid-cols-4 gap-2">
            {QUANTIDADES.map(q => (
              <button key={q} onClick={() => setQtd(q)}
                className={`py-3 rounded-2xl text-sm font-extrabold border-2 transition-all ${
                  qtd === q ? "bg-primary text-white border-primary" : "bg-muted/30 text-foreground border-border hover:border-primary/40"}`}>
                {q}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Nicho */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-3xl p-4">
          <p className="text-[10px] font-extrabold text-foreground uppercase tracking-widest mb-3">Selecione o nicho</p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {NICHOS.map(n => {
              const sel = nicho?.label === n.label;
              return (
                <button key={n.label} onClick={() => setNicho(n)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border-2 transition-all text-left ${
                    sel ? "bg-primary/10 border-primary" : "bg-muted/20 border-border hover:border-primary/30"}`}>
                  <n.Icon className={`w-4 h-4 shrink-0 ${sel ? "text-primary" : "text-foreground/40"}`} />
                  <span className={`text-sm font-semibold flex-1 ${sel ? "text-primary" : "text-foreground"}`}>{n.label}</span>
                  {sel && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          onClick={() => qtd && nicho && onStart(qtd, nicho)}

          disabled={!qtd || !nicho}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-35"
          style={{ boxShadow: qtd && nicho ? "0 4px 20px rgba(255,90,31,0.35)" : undefined }}>
          <Sparkles className="w-4 h-4" />
          Iniciar postagem automática
        </motion.button>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ card, isNew }: { card: CardItem; isNew: boolean }) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#111]">
      {/* Vídeo real */}
      <video
        src={card.videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ── Animações de publicação ── */}

      {/* 1. Glow laranja nas bordas — aparece e some */}
      {isNew && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 2px #FF5A1F, 0 0 16px 4px rgba(255,90,31,0.6)" }}
        />
      )}

      {/* 2. Flash branco rápido — sensação de foto sendo tirada */}
      {isNew && (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-white rounded-xl pointer-events-none"
        />
      )}

      {/* 3. Badge "✓ Publicado" flutua de baixo pra cima e some */}
      {isNew && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -28, scale: 0.9 }}
          transition={{ duration: 1.0, delay: 0.15, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-10 flex justify-center pointer-events-none z-20"
        >
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full shadow-lg"
            style={{ background: "#FF5A1F" }}
          >
            <Check className="w-2.5 h-2.5 text-white" />
            <span className="text-[7px] font-extrabold text-white tracking-wide">Publicado!</span>
          </div>
        </motion.div>
      )}

      {/* Botão play laranja centralizado */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "#FF5A1F", boxShadow: "0 2px 14px rgba(255,90,31,0.6)" }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Gradiente + legenda + hashtags */}
      <div className="absolute inset-x-0 bottom-0 px-1.5 pb-1.5 pt-10"
        style={{ background: "linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.55) 65%,transparent 100%)" }}>
        <p className="text-white text-[6.5px] leading-[1.35] font-medium line-clamp-2 mb-[3px]">
          {card.legenda}
        </p>
        <p className="text-[5.5px] font-bold leading-[1.4] truncate" style={{ color: "#FF7A3D" }}>
          {card.hashtags}
        </p>
      </div>

      {/* Plataforma — top right */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-full px-1 py-[2px]"
        style={{ background: "rgba(0,0,0,0.65)" }}>
        <img src={card.platImg} alt={card.platLabel} className="w-3 h-3 object-contain" />
        <span className="text-[4.5px] font-bold text-white leading-none">{card.platLabel}</span>
      </div>

      {/* Checkmark publicado — top left */}
      <motion.div
        initial={isNew ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 20, delay: 0.1 }}
        className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: "#FF5A1F" }}
      >
        <Check className="w-2.5 h-2.5 text-white" />
      </motion.div>
    </div>
  );
}

// ─── Running Screen ────────────────────────────────────────────────────────────

function RunningScreen({ qtd, nicho, cards }: { qtd: number; nicho: string; cards: CardItem[] }) {
  const [posted, setPosted] = useState(0);
  const [done,   setDone]   = useState(false);

  const cols       = 4;
  const totalCells = Math.ceil(qtd / cols) * cols;
  const intervalMs = 500; // 0.5s fixo entre cada vídeo
  const timer      = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let n = 0;
    timer.current = setInterval(() => {
      n++;
      setPosted(n);
      if (n >= qtd) { clearInterval(timer.current!); setDone(true); }
    }, intervalMs);
    return () => { if (timer.current) clearInterval(timer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="max-w-md mx-auto w-full px-5 pt-8 pb-0 flex items-center justify-between">
        <img src={LOGO_URL} alt="Logo" className="h-10 w-auto object-contain" />
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-500/25 bg-green-500/10">
          {done
            ? <Check className="w-3 h-3 text-green-500" />
            : <motion.span animate={{ opacity: [1, 0.25, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-2 rounded-full bg-green-500 block" />}
          <span className="text-[10px] font-extrabold text-green-500 uppercase tracking-wider">
            {done ? "Concluído" : "Ao vivo"}
          </span>
        </div>
      </div>

      {/* Counter */}
      <div className="max-w-md mx-auto w-full px-5 pt-5 pb-3 text-center">
        <p className="text-[9px] font-bold tracking-[0.2em] text-foreground/30 uppercase mb-1">{nicho}</p>
        <motion.p key={posted} initial={{ scale: 1.2, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="text-[5rem] font-extrabold leading-none tabular-nums text-primary">
          {posted}
        </motion.p>
        <p className="text-[11px] font-bold text-foreground/35 mt-1 uppercase tracking-widest">
          {done ? "vídeos publicados" : "postando agora..."}
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          {PLATS.map(p => (
            <div key={p.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-muted/30">
              <img src={p.img} alt={p.label} className="w-3.5 h-3.5 object-contain" />
              {done
                ? <Check className="w-2.5 h-2.5 text-green-500" />
                : <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.1 }}
                    className="w-1.5 h-1.5 rounded-full bg-green-500" />}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-md mx-auto w-full px-5 pb-10 flex-1">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: totalCells }).map((_, idx) => {
            if (idx >= posted) {
              return <div key={idx} className="rounded-xl bg-muted/25 border border-border" style={{ aspectRatio: "9/16" }} />;
            }
            const card  = cards[idx % cards.length];
            const isNew = idx === posted - 1; // último a aparecer
            return (
              <motion.div key={idx}
                initial={{ opacity: 0, scale: 0.72 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 24 }}
                style={{ aspectRatio: "9/16" }}>
                <PostCard card={card} isNew={isNew} />
              </motion.div>
            );
          })}
        </div>
        {done && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-center text-foreground/30 text-[10px] mt-5 uppercase tracking-widest">
            IA Postagem Automática · Concluído
          </motion.p>
        )}
      </div>
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm font-semibold text-foreground/40">Buscando vídeos...</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Stage =
  | { type: "config" }
  | { type: "loading" }
  | { type: "running"; qtd: number; nichoLabel: string; cards: CardItem[] };

export default function SimulacaoIA() {
  const [stage, setStage] = useState<Stage>({ type: "config" });

  const handleStart = async (qtd: number, nichoObj: typeof NICHOS[0]) => {
    setStage({ type: "loading" });

    const rows     = await fetchVideos(nichoObj.dbValue, qtd);
    const conteudo = gerarConteudo(nichoObj.dbValue);

    const cards: CardItem[] = Array.from({ length: qtd }, (_, i) => {
      const row  = rows[i % Math.max(rows.length, 1)];
      const plat = PLATS[i % PLATS.length];
      return {
        videoUrl:  row?.link_video ?? "",
        legenda:   conteudo.legenda,
        hashtags:  conteudo.hashtags,
        platImg:   plat.img,
        platLabel: plat.label,
      };
    });

    setStage({ type: "running", qtd, nichoLabel: nichoObj.label, cards });
  };

  if (stage.type === "config")  return <ConfigScreen onStart={handleStart} />;
  if (stage.type === "loading") return <LoadingScreen />;
  return <RunningScreen qtd={stage.qtd} nicho={stage.nichoLabel} cards={stage.cards} />;
}
