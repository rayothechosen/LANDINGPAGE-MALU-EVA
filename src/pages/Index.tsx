import { ArrowUpRight, UserCircle2, ShieldOff } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSystemSettings, SystemSettings } from "@/hooks/useSystemSettings";

const LOGO_URL =
  "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/Sem%20t%C3%ADtulo%20-%2027%20de%20maio%20de%202026%20%C3%A0s%2000.47.41.png";

// ── Base R2 ───────────────────────────────────────────────────────────────────
const R2 = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev";

// ── Configuração centralizada das ferramentas ─────────────────────────────────
export interface ToolConfig {
  id:          string;
  path:        string;
  title:       string;
  description: string;
  iconUrl:     string;
  bannerUrl?:  string;
  cardColor:   string;   // "#161616" | "#075E54" | "white"
  order:       number;
}

export const TOOLS: ToolConfig[] = [
  {
    id:          "ia-videos",
    path:        "/ia-videos",
    title:       "Inteligência Artificial Vídeos",
    description: "IA cria rotinas de postagem e posta por você.",
    iconUrl:     `${R2}/icon-iadevideos.png`,
    bannerUrl:   `${R2}/banner-iadevideos.png`,
    cardColor:   "#161616",
    order:       1,
  },
  {
    id:          "criador-videos",
    path:        "/criador-videos-ia",
    title:       "Produto em Vídeo",
    description: "Transforme qualquer produto em vídeo de divulgação com IA.",
    iconUrl:     `${R2}/icon-produtosemvideo.png`,
    bannerUrl:   `${R2}/banner-produtosemvideo.png`,
    cardColor:   "#161616",
    order:       2,
  },
  {
    id:          "produtos",
    path:        "/produtos-em-alta",
    title:       "Produtos em Alta",
    description: "Os mais vendidos da semana na Shopee.",
    iconUrl:     `${R2}/icon-produtosemalta.png`,
    bannerUrl:   `${R2}/banner-produtosemalta.png`,
    cardColor:   "#161616",
    order:       3,
  },
  {
    id:          "gerador-videos-proprios",
    path:        "/gerador-videos-proprios",
    title:       "Gerador Vídeos Próprios",
    description: "Transforme qualquer vídeo em conteúdo seu, pronto para postar em segundos.",
    iconUrl:     `${R2}/icon-videosproprios.png`,
    bannerUrl:   `${R2}/banner-videosproprios.png`,
    cardColor:   "#161616",
    order:       4,
  },
  {
    id:          "grupos",
    path:        "/grupos-lucrativos",
    title:       "Grupos Lucrativos",
    description: "Planejamento semanal para grupos de WhatsApp.",
    iconUrl:     `${R2}/icon-gruposlucrativos.png`,
    bannerUrl:   `${R2}/banner-gruposlucrativos.png`,
    cardColor:   "#075E54",
    order:       5,
  },
  {
    id:          "pack",
    path:        "/pack-videos",
    title:       "Pack +10.000 Vídeos",
    description: "Vídeos prontos organizados por nicho.",
    iconUrl:     `${R2}/icon-packvideos.png`,
    bannerUrl:   `${R2}/banner-packvideos.png`,
    cardColor:   "white",
    order:       6,
  },
  {
    id:          "carrosseis",
    path:        "/carrosseis-prontos",
    title:       "Carrosséis Prontos",
    description: "Sequências com imagens e link do produto.",
    iconUrl:     `${R2}/icon-carrosseisprontos.png`,
    bannerUrl:   `${R2}/banner-carrosseisprontos.png`,
    cardColor:   "white",
    order:       7,
  },
  {
    id:          "stories",
    path:        "/stories-prontos",
    title:       "Stories Prontos",
    description: "Imagens prontas para postar nos stories.",
    iconUrl:     `${R2}/icon-storiesprontos.png`,
    bannerUrl:   `${R2}/banner-storiesprontos.png`,
    cardColor:   "white",
    order:       8,
  },
  {
    id:          "treinamento",
    path:        "/treinamento",
    title:       "Treinamento",
    description: "Treinamento passo a passo rápido e sem enrolação.",
    iconUrl:     `${R2}/icon-treinamento.png`,
    cardColor:   "white",
    order:       9,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const isDark = (color: string) =>
  color !== "white" && color !== "#fff" && color !== "#ffffff";

// Mapeamento id → chave de modulo em system_settings
const TOOL_MODULE_KEY: Record<string, keyof SystemSettings["modules"]> = {
  "ia-videos":               "ai_videos",
  "criador-videos":          "product_video",
  "produtos":                "hot_products",
  "gerador-videos-proprios": "video_maker",
  "grupos":                  "groups",
  "pack":                    "pack_videos",
  "carrosseis":              "carousels",
  "stories":                 "stories",
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function Index() {
  const navigate  = useNavigate();
  const { settings } = useSystemSettings();
  const sorted    = [...TOOLS].sort((a, b) => a.order - b.order);
  const featured  = sorted[0];
  const secondary = sorted.slice(1);

  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md mx-auto px-5 pt-8 pb-0 flex items-center justify-between"
      >
        {/* Logo */}
        <img
          src={LOGO_URL}
          alt="Afiliada Prime"
          className="h-14 w-auto"
          style={{ objectFit: "contain" }}
        />

        {/* Ícone de conta */}
        <button
          onClick={() => navigate("/conta")}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center transition-colors hover:bg-primary/5 active:scale-95"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
          aria-label="Minha conta"
        >
          <UserCircle2 className="w-5 h-5 text-foreground/50" />
        </button>
      </motion.div>

      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="max-w-md mx-auto px-5 pt-6 pb-7"
      >
        <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">
          Painel de Afiliada
        </p>
        <h1 className="text-[2rem] font-extrabold leading-[1.12] text-foreground">
          Tudo que você precisa<br />
          para vender{" "}
          <span className="text-primary">na Shopee.</span>
        </h1>
      </motion.div>

      {/* Lista de ferramentas */}
      <div className="max-w-md mx-auto px-5 pb-14 space-y-2.5">

        {/* Rótulo de seção */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between mb-1"
        >
          <span className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">
            Ferramentas
          </span>
          <span className="text-[10px] font-semibold text-primary">
            {TOOLS.length} ativas
          </span>
        </motion.div>

        {/* Card principal (featured) */}
        {(() => {
          const modKey = TOOL_MODULE_KEY[featured.id];
          const modEnabled = modKey ? settings.modules[modKey]?.enabled !== false : true;
          return (
            <motion.button
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              onClick={() => navigate(featured.path)}
              className="w-full text-left rounded-[1.4rem] px-5 pt-4 pb-5 relative overflow-hidden active:scale-[0.98] transition-transform"
              style={{
                background: featured.cardColor,
                boxShadow:  "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)",
                opacity:    modEnabled ? 1 : 0.6,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block text-[9px] font-bold tracking-wider bg-primary text-white px-2.5 py-[3px] rounded-full uppercase">
                  Principal
                </span>
                {!modEnabled && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider bg-white/20 text-white/80 px-2.5 py-[3px] rounded-full uppercase">
                    <ShieldOff className="w-2.5 h-2.5" />
                    Indisponivel
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={featured.iconUrl}
                    alt={featured.title}
                    className="w-full h-full"
                    style={{ objectFit: "contain" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-[15px] leading-snug">
                    {featured.title}
                  </h3>
                  <p className="text-white/50 text-[11px] mt-0.5 leading-snug">
                    {featured.description}
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/30 shrink-0 self-start mt-0.5" />
              </div>
            </motion.button>
          );
        })()}

        {/* Cards secundários */}
        {secondary.map((tool, i) => {
          const dark       = isDark(tool.cardColor);
          const titleColor = dark ? "text-white"      : "text-foreground";
          const descColor  = dark ? "text-white/50"   : "text-foreground/45";
          const arrowColor = dark ? "text-white/25"   : "text-foreground/20";
          const border     = dark ? "border-transparent" : "border-black/[0.06]";
          const modKey     = TOOL_MODULE_KEY[tool.id];
          const modEnabled = modKey ? settings.modules[modKey]?.enabled !== false : true;

          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + i * 0.05 }}
              onClick={() => navigate(tool.path)}
              className={`w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3.5 border ${border} active:scale-[0.98] transition-transform`}
              style={{
                background: tool.cardColor,
                boxShadow:  dark
                  ? "0 2px 12px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.12)"
                  : "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.04)",
                opacity:    modEnabled ? 1 : 0.55,
              }}
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={tool.iconUrl}
                  alt={tool.title}
                  className="w-full h-full"
                  style={{ objectFit: "contain" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector("svg")) {
                      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                      svg.setAttribute("width", "20");
                      svg.setAttribute("height", "20");
                      parent.appendChild(svg);
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className={`font-bold text-sm leading-snug ${titleColor}`}>
                    {tool.title}
                  </h3>
                  {!modEnabled && (
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-[2px] rounded-full uppercase shrink-0 ${dark ? "bg-white/15 text-white/60" : "bg-foreground/10 text-foreground/40"}`}>
                      <ShieldOff className="w-2 h-2" />
                      Off
                    </span>
                  )}
                </div>
                <p className={`text-[11px] mt-0.5 leading-snug ${descColor}`}>
                  {tool.description}
                </p>
              </div>
              <ArrowUpRight className={`w-4 h-4 shrink-0 ${arrowColor}`} />
            </motion.button>
          );
        })}

        {/* Rodapé */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-foreground/20 text-[10px] pt-5 tracking-widest uppercase"
        >
          Kit Afiliada Shopee · v2.1
        </motion.p>
      </div>
    </div>
  );
}
