import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LOGO_URL =
  "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/Sem%20t%C3%ADtulo%20-%2027%20de%20maio%20de%202026%20%C3%A0s%2000.47.41.png";
const R2 = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev";

interface Tool {
  title: string;
  description: string;
  iconUrl: string;
  path: string;
  dark: boolean;
  cardColor: string;
  principal?: boolean;
}

const MAIN_TOOLS: Tool[] = [
  {
    title: "Inteligência Artificial Vídeos",
    description: "IA cria rotinas de postagem e posta por você.",
    iconUrl: `${R2}/icon-iadevideos.png`,
    path: "/ia-videos",
    dark: true,
    cardColor: "#161616",
    principal: true,
  },
  {
    title: "Grupos Lucrativos",
    description: "Planejamento semanal para grupos de WhatsApp.",
    iconUrl: `${R2}/icon-gruposlucrativos.png`,
    path: "/grupos-lucrativos",
    dark: true,
    cardColor: "#075E54",
  },
  {
    title: "Produtos em Alta",
    description: "Os mais vendidos da semana na Shopee.",
    iconUrl: `${R2}/icon-produtosemalta.png`,
    path: "/produtos-em-alta",
    dark: true,
    cardColor: "#161616",
  },
  {
    title: "Pack +10.000 Vídeos",
    description: "Vídeos prontos organizados por nicho.",
    iconUrl: `${R2}/icon-packvideos.png`,
    path: "/pack-videos",
    dark: false,
    cardColor: "white",
  },
];

const BOTTOM_TOOLS: Tool[] = [
  {
    title: "Carrosséis Prontos",
    description: "Sequências com imagens e link do produto.",
    iconUrl: `${R2}/icon-carrosseisprontos.png`,
    path: "/carrosseis-prontos",
    dark: false,
    cardColor: "white",
  },
  {
    title: "Stories Prontos",
    description: "Imagens prontas para postar nos stories.",
    iconUrl: `${R2}/icon-storiesprontos.png`,
    path: "/stories-prontos",
    dark: false,
    cardColor: "white",
  },
  {
    title: "Treinamento",
    description: "Treinamento passo a passo rápido e sem enrolação.",
    iconUrl: `${R2}/icon-treinamento.png`,
    path: "/treinamento",
    dark: false,
    cardColor: "white",
  },
];

function ToolCard({ tool, index, featured }: { tool: Tool; index: number; featured?: boolean }) {
  const navigate = useNavigate();
  const titleColor = tool.dark ? "text-white" : "text-foreground";
  const descColor  = tool.dark ? "text-white/50" : "text-foreground/45";
  const arrowColor = tool.dark ? "text-white/25" : "text-foreground/20";
  const border     = tool.dark ? "border-transparent" : "border-black/[0.06]";

  if (featured) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        onClick={() => navigate(tool.path)}
        className="w-full text-left rounded-[1.4rem] px-5 pt-4 pb-5 relative overflow-hidden active:scale-[0.98] transition-transform"
        style={{
          background: tool.cardColor,
          boxShadow: "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block text-[9px] font-bold tracking-wider bg-primary text-white px-2.5 py-[3px] rounded-full uppercase">
            Principal
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0">
            <img src={tool.iconUrl} alt={tool.title} className="w-full h-full" style={{ objectFit: "contain" }}
              onError={e => { e.currentTarget.style.display = "none"; }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-[15px] leading-snug">{tool.title}</h3>
            <p className="text-white/50 text-[11px] mt-0.5 leading-snug">{tool.description}</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-white/30 shrink-0 self-start mt-0.5" />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 + index * 0.05 }}
      onClick={() => navigate(tool.path)}
      className={`w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3.5 border ${border} active:scale-[0.98] transition-transform`}
      style={{
        background: tool.cardColor,
        boxShadow: tool.dark
          ? "0 2px 12px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.12)"
          : "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.04)",
      }}
    >
      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
        <img src={tool.iconUrl} alt={tool.title} className="w-full h-full" style={{ objectFit: "contain" }}
          onError={e => { e.currentTarget.style.display = "none"; }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-bold text-sm leading-snug ${titleColor}`}>{tool.title}</h3>
        <p className={`text-[11px] mt-0.5 leading-snug ${descColor}`}>{tool.description}</p>
      </div>
      <ArrowUpRight className={`w-4 h-4 shrink-0 ${arrowColor}`} />
    </motion.button>
  );
}

export default function DemoIA() {
  const allTools = [...MAIN_TOOLS, ...BOTTOM_TOOLS];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto px-5 pt-8 pb-0 flex items-center justify-between"
      >
        <img src={LOGO_URL} alt="Logo" className="h-14 w-auto" style={{ objectFit: "contain" }} />
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
          Inteligência Artificial<br />
          que postar você como{" "}
          <span className="text-primary">Afiliada Shopee</span>
        </h1>
      </motion.div>

      {/* Ferramentas */}
      <div className="max-w-md mx-auto px-5 pb-14 space-y-2.5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between mb-1"
        >
          <span className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">Ferramentas</span>
          <span className="text-[10px] font-semibold text-primary">{allTools.length} ativas</span>
        </motion.div>

        {/* Principal */}
        <ToolCard tool={MAIN_TOOLS[0]} index={0} featured />

        {/* Demais do grupo principal */}
        {MAIN_TOOLS.slice(1).map((t, i) => (
          <ToolCard key={t.path} tool={t} index={i} />
        ))}

        {/* Separador */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 pt-1"
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-2">Mais ferramentas</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Bottom tools */}
        {BOTTOM_TOOLS.map((t, i) => (
          <ToolCard key={t.path} tool={t} index={i + MAIN_TOOLS.length} />
        ))}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-foreground/20 text-[10px] pt-5 tracking-widest uppercase"
        >
          Kit Afiliada Shopee · Demo IA
        </motion.p>
      </div>
    </div>
  );
}
