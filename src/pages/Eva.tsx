import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, Check, Sparkles, Video,
  Unlock, Film, GraduationCap,
  Heart, Users, Zap, ChevronRight, Play,
  Smartphone, ChefHat, Baby, Dumbbell, LayoutGrid,
  Shirt, Flame, Star, BookOpen,
  Loader2, Download, Clock, User, X, Share2, Info, ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import EvaFlow from "@/components/EvaFlow";
import {
  IconContas, IconVideos, IconAlta, IconTreino, Starburst,
  NichoIcon, IconRelogio, EvaLoader, type NichoTipo,
} from "@/components/EvaIcons";
import { getBrandTheme, type BrandId, type BrandTheme } from "@/lib/brandTheme";

// ─── Paleta (Craft × Wise: neutros quentes + roxo vívido/lima do crachá) ─────
const P        = "var(--brand-primary)";
const P2       = "var(--brand-secondary)";
const LIME     = "var(--brand-accent)";
const R2_EVA    = "https://pub-0b252875d435478a830daa595535d16c.r2.dev";
const CARD_DARK = "var(--brand-card-dark)";
const GRAD_BTN  = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;
const GLOW_BTN  = `0 4px 28px rgba(122,43,245,0.40)`;
const BTN_PROD  = "#1C1C1E";
// Card bem definido (estilo Wise) com suavidade Craft
const CARD_EDGE   = "1.5px solid rgba(22,19,14,0.10)";
const CARD_SHADOW = "0 2px 0 rgba(22,19,14,0.05), 0 14px 36px rgba(22,19,14,0.08)";
// Fundo padrão das telas: bege/creme chapado
const PAGE_BG = { background: "var(--brand-background)" };

function brandVars(theme: BrandTheme): CSSProperties {
  return {
    "--brand-primary": theme.primary,
    "--brand-secondary": theme.secondary,
    "--brand-accent": theme.accent,
    "--brand-background": theme.background,
    "--brand-card-dark": theme.cardDark,
  } as CSSProperties;
}
// Cores dos badges por tipo
const BADGE_COLOR: Record<string, string> = {
  "DESTAQUE": "#E11D48",   // vermelho
  "EM ALTA":  "#EA580C",   // laranja
  "POPULAR":  "#0284C7",   // azul
  "TOP":      "#D97706",   // dourado
};

// ─── Produtos R2 ─────────────────────────────────────────────────────────────
interface Produto {
  id: string; nome: string; preco: string; precoOrig: string;
  desconto: string; comissao: string; badge: string; stars: number;
  destaque: boolean; fluxo: boolean; img: string;
}

const R2 = (name: string) =>
  `https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/${encodeURIComponent(name)}`;

// Catálogo original do módulo "Produtos em Alta".
const PRODUTOS_ALL: Produto[] = [
  { id:"01", nome:"Produto 01", preco:"R$ 89,90",  precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true,  fluxo:true,  img:R2("produto01 (destaque) (fluxo).PNG") },
  { id:"02", nome:"Produto 02", preco:"R$ 49,90",  precoOrig:"R$99,00",  desconto:"-50%", comissao:"10%", badge:"DESTAQUE", stars:4.9, destaque:true,  fluxo:true,  img:R2("produto02 (destaque) (fluxo).PNG") },
  { id:"04", nome:"Produto 04", preco:"R$ 69,90",  precoOrig:"R$139,00", desconto:"-50%", comissao:"11%", badge:"DESTAQUE", stars:5.0, destaque:true,  fluxo:true,  img:R2("produto04 (destaque) (fluxo).PNG") },
  { id:"05", nome:"Produto 05", preco:"R$ 39,90",  precoOrig:"R$79,00",  desconto:"-50%", comissao:"9%",  badge:"DESTAQUE", stars:4.8, destaque:true,  fluxo:true,  img:R2("produto05 (destaque) (fluxo).PNG") },
  { id:"11", nome:"Produto 11", preco:"R$ 79,90",  precoOrig:"R$159,00", desconto:"-50%", comissao:"13%", badge:"DESTAQUE", stars:5.0, destaque:true,  fluxo:true,  img:R2("produto11 (destaque) (fluxo).PNG") },
  { id:"14", nome:"Produto 14", preco:"R$ 59,90",  precoOrig:"R$119,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:4.9, destaque:true,  fluxo:true,  img:R2("produto14 (destaque) (fluxo).PNG") },
  { id:"03", nome:"Produto 03", preco:"R$ 29,90",  precoOrig:"R$59,00",  desconto:"-49%", comissao:"8%",  badge:"EM ALTA",  stars:4.7, destaque:false, fluxo:false, img:R2("produto03.PNG") },
  { id:"06", nome:"Produto 06", preco:"R$ 24,90",  precoOrig:"R$49,00",  desconto:"-49%", comissao:"7%",  badge:"POPULAR",  stars:4.6, destaque:false, fluxo:false, img:R2("produto06.PNG") },
  { id:"07", nome:"Produto 07", preco:"R$ 19,90",  precoOrig:"R$39,00",  desconto:"-49%", comissao:"8%",  badge:"POPULAR",  stars:4.5, destaque:false, fluxo:false, img:R2("produto07.PNG") },
  { id:"08", nome:"Produto 08", preco:"R$ 34,90",  precoOrig:"R$69,00",  desconto:"-49%", comissao:"9%",  badge:"EM ALTA",  stars:4.7, destaque:false, fluxo:false, img:R2("produto08.PNG") },
  { id:"09", nome:"Produto 09", preco:"R$ 44,90",  precoOrig:"R$89,00",  desconto:"-50%", comissao:"10%", badge:"EM ALTA",  stars:4.8, destaque:false, fluxo:false, img:R2("produto09.PNG") },
  { id:"10", nome:"Produto 10", preco:"R$ 54,90",  precoOrig:"R$109,00", desconto:"-50%", comissao:"11%", badge:"TOP",      stars:4.7, destaque:false, fluxo:false, img:R2("produto10.PNG") },
  { id:"12", nome:"Produto 12", preco:"R$ 32,90",  precoOrig:"R$65,00",  desconto:"-49%", comissao:"8%",  badge:"POPULAR",  stars:4.6, destaque:false, fluxo:false, img:R2("produto12.PNG") },
  { id:"13", nome:"Produto 13", preco:"R$ 22,90",  precoOrig:"R$45,00",  desconto:"-49%", comissao:"7%",  badge:"POPULAR",  stars:4.5, destaque:false, fluxo:false, img:R2("produto13.PNG") },
  { id:"15", nome:"Produto 15", preco:"R$ 27,90",  precoOrig:"R$55,00",  desconto:"-49%", comissao:"8%",  badge:"TOP",      stars:4.7, destaque:false, fluxo:false, img:R2("produto15.PNG") },
];

const BY_ID = Object.fromEntries(PRODUTOS_ALL.map(p => [p.id, p]));
const PRODUTOS_DESTAQUE = ["01","05","04","02","11","14"].map(id => BY_ID[id]);
const PRODUTOS_OUTROS = ["03","12","13","08","09","10","06","07","15"].map(id => BY_ID[id]);
const MALU_ALTA_IMAGENS = [
  "https://demofoda-eight.vercel.app/assets/produto-1-WBtpXkKy.png",
  "https://demofoda-eight.vercel.app/assets/produto-2-D778n6N2.png",
  "https://demofoda-eight.vercel.app/assets/produto-3-nx2xsVXy.png",
  "https://demofoda-eight.vercel.app/assets/produto-4-BRAv4cf1.png",
  "https://demofoda-eight.vercel.app/assets/produto-5-DECcAAXT.png",
];
const PRODUTOS_MALU_ALTA = MALU_ALTA_IMAGENS.map((img, i) => ({
  ...PRODUTOS_ALL[i],
  id: `malu-alta-${i + 1}`,
  img,
}));

// Catálogo exclusivo do fluxo de postagem da Eva.
const PRODUTOS_FLUXO: Produto[] = [
  { id:"ppet01", nome:"Escova a vapor para pets 01", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet01.jpg` },
  { id:"ppet02", nome:"Escova a vapor para pets 02", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet02.jpg` },
  { id:"ppet03", nome:"Escova a vapor para pets 03", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet03.jpg` },
  { id:"ppet04", nome:"Escova a vapor para pets 04", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet04.jpg` },
  { id:"ppet05", nome:"Escova a vapor para pets 05", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet05.jpg` },
  { id:"ppet06", nome:"Escova a vapor para pets 06", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/ppet06.jpg` },
];

const PRODUTOS_MALU_FLUXO: Produto[] = [
  { id:"malu01", nome:"Produto pet Shopee 01", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee01.jpg` },
  { id:"malu02", nome:"Produto pet Shopee 02", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee02.jpg` },
  { id:"malu03", nome:"Produto pet Shopee 03", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee03.jpg` },
  { id:"malu04", nome:"Produto pet Shopee 04", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee04.jpg` },
  { id:"malu05", nome:"Produto pet Shopee 05", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee05.jpg` },
  { id:"malu06", nome:"Produto pet Shopee 06", preco:"R$ 89,90", precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true, fluxo:true, img:`${R2_EVA}/malu/ppet%20shopee06.jpg` },
];

const NICHOS_TIPO: Record<string, NichoTipo> = {
  "01 - Moda, Beleza e Estilo":                     "camiseta",
  "02 - Casa, Cozinha e Decoração":                 "panela",
  "03 - Organização, Limpeza e Utilidades":         "caixa",
  "04 - Maternidade e Infantil":                    "mamadeira",
  "05 - Pets":                                      "pata",
  "06 - Eletrônicos e Tecnologia":                  "celular",
  "07 - Automóveis, Ferramentas e Segurança":       "carro",
  "08 - Papelaria, Artesanato e Personalizados":    "lapis",
  "09 - Alimentação e Comidas":                     "talher",
  "10 - Datas Comemorativas":                       "balao",
  "11 - Esporte, Fitness e Praia":                  "halter",
  "12 - Virais, Dublados e Conteúdos de Apoio":     "play",
};
const NICHOS_LABEL: Record<string, string> = {
  "01 - Moda, Beleza e Estilo":                     "Moda e Beleza",
  "02 - Casa, Cozinha e Decoração":                 "Casa e Cozinha",
  "03 - Organização, Limpeza e Utilidades":         "Organização",
  "04 - Maternidade e Infantil":                    "Infantil",
  "05 - Pets":                                      "Pets",
  "06 - Eletrônicos e Tecnologia":                  "Eletrônicos",
  "07 - Automóveis, Ferramentas e Segurança":       "Automóveis",
  "08 - Papelaria, Artesanato e Personalizados":    "Papelaria",
  "09 - Alimentação e Comidas":                     "Alimentação",
  "10 - Datas Comemorativas":                       "Datas Comemorativas",
  "11 - Esporte, Fitness e Praia":                  "Fitness",
  "12 - Virais, Dublados e Conteúdos de Apoio":     "Virais",
};

const AULAS = [
  { num:"01", titulo:"Como ativar seu primeiro TikTok Shop",  desc:"Configure tudo em menos de 10 minutos e comece a vender.", duracao:"28min", nivel:"Iniciante",     aulas:4 },
  { num:"02", titulo:"Produtos que mais vendem no TikTok Shop", desc:"Os nichos e estratégias com maior taxa de conversão.",   duracao:"41min", nivel:"Iniciante",     aulas:5 },
  { num:"03", titulo:"IA de apresentador: guia completo",           desc:"Personalize seu apresentador virtual passo a passo.",    duracao:"35min", nivel:"Intermediário", aulas:6 },
  { num:"04", titulo:"Eva no automático: perfil do zero",             desc:"Como liberar o TikTok Shop em contas novas.",         duracao:"22min", nivel:"Iniciante",     aulas:3 },
];

type Screen = "home" | "destrava" | "painel" | "pack" | "produtos" | "treinamento";
interface VideoItem  { message_id:string; nicho:string; link_video:string|null; topico_original:string|null; r2_key:string|null; }
interface NichoRow   { nicho:string; total:number; }

type TempoId = "24h" | "36h" | "48h";

interface DestravaData {
  active: boolean;
  username: string;
  nicho: string;
  tempo: TempoId;
  volume: number;
  activatedAt: number;
}


function loadDestravaData(code: string): DestravaData | null {
  try { return JSON.parse(localStorage.getItem(`liveia_eva_${code}`) ?? "null"); } catch { return null; }
}

function TikTokIcon({ size=18, color="white" }: { size?:number; color?:string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 106.34 6.34V8.69a8.17 8.17 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  );
}

function VideoModal({ url, onClose }: { url:string; onClose:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{ background:"rgba(0,0,0,0.97)" }}
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-6 right-5 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background:"rgba(255,255,255,0.12)" }}>
        <X className="w-5 h-5 text-white" />
      </button>
      <div className="w-full max-w-sm px-4" onClick={e => e.stopPropagation()}>
        <video
          src={url}
          controls
          autoPlay
          playsInline
          className="w-full rounded-2xl"
          style={{ maxHeight:"78vh", background:"#000" }}
        />
      </div>
    </motion.div>
  );
}

function PrimaryBtn({ children, onClick, disabled }: {
  children:ReactNode; onClick?:()=>void; disabled?:boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-center justify-center gap-2 font-bold py-[14px] rounded-2xl text-sm transition-all active:scale-[0.98] disabled:opacity-40"
      style={{ background: LIME, color: "#16130E", boxShadow: disabled ? undefined : "0 6px 20px rgba(140,190,20,0.35)" }}>
      {children}
    </button>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────

function Home({ onNavigate, theme }: { onNavigate:(s:Screen)=>void; theme: BrandTheme }) {
  const modsRef = useRef<HTMLDivElement>(null);

  const modules = [
    { id:"painel"      as Screen, title:"Painel de Vídeos",   desc:"Acompanhe seus vídeos em tempo real.",        Comp:IconContas, look:"vivid" as const, rot:-2.2 },
    { id:"pack"        as Screen, title:"Pack de Vídeos",     desc:`Vídeos prontos para ${theme.name} postar.`, Comp:IconVideos, look:"lime"  as const, rot: 1.8 },
    { id:"produtos"    as Screen, title:"Produtos em Alta",   desc:"Produtos selecionados para divulgar.",          Comp:IconAlta,   look:"dark"  as const, rot: 1.6 },
    { id:"treinamento" as Screen, title:`Academia da ${theme.name}`,    desc:`Configure a ${theme.name} em poucos minutos.`,          Comp:IconTreino, look:"light" as const, rot:-1.8 },
  ];

  // Variações de card (crachá: roxo vívido, lima, preto, branco)
  const looks = {
    vivid: { card: { background: P, boxShadow: "0 14px 32px rgba(122,43,245,0.34)" },       title: "text-white",      desc: "text-white/70",      box: "#fff",    stroke: "#16130E", accent: P },
    lime:  { card: { background: LIME, boxShadow: "0 12px 28px rgba(140,190,20,0.35)" },    title: "text-foreground", desc: "text-foreground/60", box: "#fff",    stroke: "#16130E", accent: P },
    dark:  { card: { background: CARD_DARK, boxShadow: "0 14px 32px rgba(22,19,14,0.32)" }, title: "text-white",      desc: "text-white/60",      box: "#2C2822", stroke: "#fff",    accent: LIME },
    light: { card: { background: "#fff", border: CARD_EDGE, boxShadow: CARD_SHADOW },       title: "text-foreground", desc: "text-foreground/55", box: theme.id === "malu" ? "#FFF1E5" : "#F2EBFE", stroke: "#16130E", accent: P },
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={PAGE_BG}>
      {/* Nav estilo Craft: wordmark + links + botão preto */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        className="max-w-md mx-auto px-4 pt-5">
        <div className="bg-white/85 backdrop-blur rounded-full pl-3 pr-1.5 py-1.5 flex items-center justify-between"
          style={{ border: CARD_EDGE, boxShadow: "0 6px 20px rgba(22,19,14,0.08)" }}>
          <img src={theme.logoUrl} alt={theme.name} className="h-11 w-auto -my-1" draggable={false} />
          <button onClick={() => onNavigate("destrava")}
            className="flex items-center gap-1.5 text-white text-[11.5px] font-bold pl-3.5 pr-4 py-2 rounded-full active:scale-95 transition-transform"
            style={{ background: "#16130E" }}>
            {theme.id === "malu" ? theme.channels.map(channel => (
              <span key={channel.name} className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white">
                <img src={channel.logoUrl} alt={channel.name} className="w-2.5 h-2.5" draggable={false} />
              </span>
            )) : <TikTokIcon size={11} />} Começar
          </button>
        </div>
      </motion.div>

      {/* Headline serif com rabiscos (estilo Craft) */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
        className="max-w-md mx-auto px-6 pt-12 pb-2 text-center relative">
        <p className="text-[10px] font-bold tracking-[0.2em] text-foreground/40 uppercase mb-4">
          Sua assistente virtual
        </p>
        <h1 className="font-extrabold text-[29px] leading-[1.15] text-foreground tracking-tight">
          {theme.id === "malu" ? <>Use a Malu para postar<br /> em varios canais</> : <>Use a Eva para postar<br /> no{" "}</>}{" "}
          <span className="relative inline-block">
            <em className="font-display italic" style={{ color: P }}>{theme.id === "malu" ? "e vender mais." : "TikTok Shop."}</em>
            <svg className="absolute left-0 -bottom-1.5 w-full" height="8" viewBox="0 0 60 8" preserveAspectRatio="none">
              <path d="M2 6 Q 12 2 22 5 T 42 5 T 58 4" stroke={LIME} strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
      </motion.div>

      <div className="max-w-md mx-auto px-5 pt-9 pb-16">
        {/* Banner principal roxo (estilo Craft "Let's get started") com a Eva em cima */}
        <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
          onClick={() => onNavigate("destrava")}
          className="relative rounded-[1.75rem] cursor-pointer active:scale-[0.995] transition-transform"
          style={{ background: P, boxShadow: "0 20px 46px rgba(122,43,245,0.38)" }}>

          {/* Textura de pincelada orgânica + rabisco lima */}
          <div className="absolute inset-0 rounded-[1.75rem] overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 260" preserveAspectRatio="none">
              <path d="M-30 200 C 60 130, 100 235, 185 165 S 320 60, 440 130"
                stroke={P} strokeWidth="42" fill="none" strokeLinecap="round" opacity="0.55" />
              <path d="M-20 70 C 90 20, 170 105, 260 50 S 380 90, 430 40"
                stroke={P2} strokeWidth="26" fill="none" strokeLinecap="round" opacity="0.5" />
              <motion.path d="M-10 240 Q 40 216 92 236 T 200 232 T 305 240 T 425 228"
                stroke={LIME} strokeWidth="5" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 1.5, duration: 1.1, ease: "easeInOut" }} />
            </svg>
          </div>

          {/* Explosão lima atrás da Eva (estilo crachá) */}
          <div className="absolute pointer-events-none" style={{ right: 118, top: -22, zIndex: 4 }}>
            <Starburst size={76} color={LIME} />
          </div>

          {/* Eva em pé sobre o card, atrás dos botões */}
          <motion.div className="absolute pointer-events-none" style={{ right: -4, bottom: 0, zIndex: 5 }}
            initial={{ y: 42, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 120, damping: 15 }}>
            <motion.div animate={{ y: [0, -4, 0], rotate: [-1, 1, -1] }}
              transition={{ delay: 2.2, duration: 3.6, repeat: Infinity, ease: "easeInOut" }}>
              <img src={theme.homeImageUrl} alt={theme.name} draggable={false} style={{ width: 140, height: "auto" }} />
            </motion.div>
          </motion.div>

          <div className="relative px-6 pt-7 pb-7">
            <span className="relative z-10 inline-block text-[9px] font-bold tracking-[0.14em] px-3 py-[5px] rounded-full uppercase text-white"
              style={{ background: "rgba(255,255,255,0.18)" }}>No automático</span>
            <h3 className="relative z-10 font-display italic font-semibold text-[30px] leading-[1.08] tracking-tight mt-3 max-w-[210px] text-white">
              Poste com a&nbsp;{theme.name}
            </h3>
            <p className="relative z-10 text-[12.5px] mt-2 leading-relaxed max-w-[200px]" style={{ color: "rgba(255,255,255,0.75)" }}>
              {theme.id === "malu" ? "Ela encontra produtos da Shopee e prepara conteudo para Shopee Video, TikTok e Instagram." : "Ela publica por você até liberar o TikTok Shop. Sem aparecer."}
            </p>
            {theme.id === "malu" && (
              <div className="relative z-10 flex items-center gap-1.5 mt-3">
                {theme.channels.map(channel => (
                  <span key={channel.name} className="w-6 h-6 rounded-full bg-white flex items-center justify-center" title={channel.name}>
                    <img src={channel.logoUrl} alt={channel.name} className="w-3.5 h-3.5" draggable={false} />
                  </span>
                ))}
              </div>
            )}
            <div className="relative z-20 mt-5 flex flex-wrap items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); onNavigate("destrava"); }}
                className="flex items-center gap-1.5 text-[13px] font-bold px-5 py-3 rounded-full active:scale-95 transition-transform"
                style={{ background: LIME, color: "#16130E", boxShadow: "0 6px 18px rgba(0,0,0,0.28)" }}>
                Começar agora <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Título de seção serif com estrela atrás */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="relative text-center pt-12 pb-6">
          <div className="absolute pointer-events-none opacity-90" style={{ left: "50%", marginLeft: -128, top: 26 }}>
            <Starburst size={56} color={LIME} />
          </div>
          <h2 className="relative font-display font-medium text-[26px] text-foreground tracking-tight">Tudo para você vender</h2>
          <p className="relative text-[12px] text-foreground/50 mt-1.5">Explore o que a {theme.name} já deixou pronto pra você.</p>
        </motion.div>

        {/* Grid de módulos: cards tortos */}
        <div className="relative">
          <div ref={modsRef} className="relative grid grid-cols-2 gap-3">
            {modules.map(({ id, title, desc, Comp, look, rot }, i) => {
              const lk = looks[look];
              return (
                <motion.div key={id}
                  initial={{ opacity:0, y:18, rotate: rot }}
                  animate={{ opacity:1, y:0, rotate: rot }}
                  whileHover={{ rotate: 0, y: -5, transition: { delay: 0, duration: 0.25 } }}
                  whileTap={{ scale: 0.95, rotate: 0, transition: { delay: 0, duration: 0.12 } }}
                  transition={{ delay: 0.38 + i * 0.06 }}
                  onClick={() => onNavigate(id)}
                  className="rounded-[1.5rem] px-4 pt-6 pb-5 flex flex-col items-center text-center cursor-pointer"
                  style={lk.card}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5"
                    style={{ background: lk.box, boxShadow: "0 4px 12px rgba(22,19,14,0.16)" }}>
                    <Comp size={34} stroke={lk.stroke} accent={lk.accent} bg={lk.box} />
                  </div>
                  <p className={`text-[11px] font-extrabold tracking-[0.1em] uppercase leading-tight ${lk.title}`}>{title}</p>
                  <p className={`text-[10.5px] mt-1.5 leading-snug ${lk.desc}`}>{desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[10px] text-foreground/25 pt-7 font-semibold tracking-[0.15em] uppercase">
          {theme.name} · Sua assistente virtual
        </p>
      </div>
    </div>
  );
}

const NICHO_MAP: Record<string,string> = {
  "moda":        "01 - Moda, Beleza e Estilo",
  "casa":        "02 - Casa, Cozinha e Decoração",
  "fitness":     "11 - Esporte, Fitness e Praia",
  "eletro":      "06 - Eletrônicos e Tecnologia",
  "pets":        "05 - Pets",
  "maternidade": "04 - Maternidade e Infantil",
};

// ─── PACK +10.000 VÍDEOS ─────────────────────────────────────────────────────

function PackScreen({ onBack, theme }: { onBack:()=>void; theme: BrandTheme }) {
  const [nichos, setNichos]       = useState<NichoRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [nichoCurr, setNichoCurr] = useState<NichoRow|null>(null);
  const [videos, setVideos]       = useState<VideoItem[]>([]);
  const [vLoading, setVLoading]   = useState(false);
  const [modalUrl, setModalUrl]   = useState<string|null>(null);
  const total = nichos.reduce((a, n) => a + Number(n.total), 0);

  useEffect(() => {
    supabase.rpc("get_nichos_videos")
      .then(({ data }) => { setNichos((data as NichoRow[]) ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function openNicho(n: NichoRow) {
    setNichoCurr(n);
    setVLoading(true);
    const { data } = await supabase
      .from("videos_achadinhos")
      .select("message_id, nicho, link_video, topico_original, r2_key")
      .eq("nicho", n.nicho)
      .limit(30);
    setVideos((data as VideoItem[]) ?? []);
    setVLoading(false);
  }

  /* ── Video list view ── */
  if (nichoCurr) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto">
          <div className="px-5 pt-7 pb-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
              style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}
              onClick={() => setNichoCurr(null)}>
              <ArrowLeft className="w-4 h-4 text-foreground/60" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Pack de Vídeos {theme.id === "malu" ? "Shopee" : ""}</p>
              <p className="font-extrabold text-[15px] text-foreground leading-tight">
                {NICHOS_LABEL[nichoCurr.nicho] ?? nichoCurr.nicho}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: LIME, color: "#16130E" }}>
              {nichoCurr.total} vídeos
            </span>
          </div>

          <div className="px-5 pb-14">
            {vLoading ? (
              <EvaLoader className="py-16" label={`A ${theme.name} está buscando os vídeos...`} />
            ) : videos.length === 0 ? (
              <p className="text-center text-foreground/40 text-[13px] py-16">Nenhum vídeo encontrado.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {videos.map(v => (
                  <div key={v.message_id} className="rounded-2xl overflow-hidden"
                    style={{ background: CARD_DARK, boxShadow:"0 2px 10px rgba(0,0,0,0.2)" }}>
                    <div className="relative cursor-pointer active:opacity-80 transition-opacity"
                      onClick={() => v.link_video && setModalUrl(v.link_video)}>
                      <video
                        src={v.link_video ?? ""}
                        preload="metadata"
                        muted
                        playsInline
                        onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1; }}
                        style={{ width:"100%", height:140, objectFit:"cover", display:"block" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ background:"rgba(0,0,0,0.18)" }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)" }}>
                          <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    </div>
                    <div className="px-2.5 pt-2 pb-2.5 space-y-1.5">
                      <p className="text-[9px] font-semibold line-clamp-1 leading-snug" style={{ color:P }}>
                        {NICHOS_LABEL[v.nicho] ?? v.nicho}
                      </p>
                      <div className="flex gap-1.5 pt-0.5">
                        <a href={v.link_video ?? "#"} download
                          onClick={e => e.stopPropagation()}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[9px] font-bold"
                          style={{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.65)" }}>
                          <Download className="w-3 h-3" /> Baixar
                        </a>
                        <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[9px] font-bold text-white"
                          style={{ background: P }}>
                          <Share2 className="w-3 h-3" /> Publicar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <AnimatePresence>
          {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
        </AnimatePresence>
      </div>
    );
  }

  /* ── Nicho list view ── */
  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-7 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}
            onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-4">Atualizado hoje</p>
          <h2 className="font-extrabold text-[1.85rem] leading-[1.15] tracking-tight">
            Pack de<br /><em className="italic" style={{ color:P }}>Vídeos</em>
          </h2>
          <p className="text-foreground/50 text-[13px] mt-3">Vídeos prontos por nicho para {theme.name} postar.</p>
        </div>

        <div className="px-5 mt-5 mb-7">
          <motion.div initial={{ opacity:0, y:12, rotate:-1.2 }} animate={{ opacity:1, y:0, rotate:-1.2 }}
            className="relative rounded-[1.5rem] px-5 py-5"
            style={{ background: CARD_DARK, boxShadow: "0 14px 32px rgba(22,19,14,0.30)" }}>
            <div className="absolute -top-3.5 -right-2 pointer-events-none">
              <Starburst size={46} color={LIME} />
            </div>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/45 mb-2">Vídeos disponíveis</p>
            {loading ? (
              <EvaLoader size={30} className="py-1 items-start" />
            ) : (
              <>
                <p className="text-[2.2rem] font-extrabold leading-none" style={{ color: LIME }}>
                  +{total.toLocaleString("pt-BR")}
                </p>
                <p className="text-[12px] text-white/50 mt-1.5">vídeos prontos para a {theme.name} postar por você</p>
              </>
            )}
          </motion.div>
        </div>

        <div className="px-5 pb-14">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/60 uppercase">Nichos</span>
            <span className="text-[10px] font-bold" style={{ color:P }}>Selecione um</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {nichos.map((n, i) => {
              const tipo = NICHOS_TIPO[n.nicho] ?? "play";
              const label = NICHOS_LABEL[n.nicho] ?? n.nicho;
              const look = ([
                { card: { background: "#fff", border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.06)" }, chip: "#F4EFFE", stroke: "#16130E", accent: P,    title: "text-foreground", count: { background: "rgba(122,43,245,0.08)", color: P } },
                { card: { background: LIME, boxShadow: "0 10px 24px rgba(140,190,20,0.30)" },                   chip: "#fff",    stroke: "#16130E", accent: P,    title: "text-foreground", count: { background: "rgba(22,19,14,0.10)", color: "#16130E" } },
                { card: { background: CARD_DARK, boxShadow: "0 12px 26px rgba(22,19,14,0.30)" },                chip: "#2C2822", stroke: "#fff",    accent: LIME, title: "text-white",      count: { background: "rgba(255,255,255,0.10)", color: LIME } },
                { card: { background: "#fff", border: CARD_EDGE, boxShadow: "0 4px 14px rgba(22,19,14,0.06)" }, chip: "#F4EFFE", stroke: "#16130E", accent: P2,   title: "text-foreground", count: { background: "rgba(236,72,153,0.08)", color: P2 } },
              ] as const)[i % 4];
              const rot = [-1.6, 1.4, 1.6, -1.4][i % 4];
              return (
                <motion.div key={n.nicho} onClick={() => openNicho(n)}
                  initial={{ opacity: 0, y: 14, rotate: rot }} animate={{ opacity: 1, y: 0, rotate: rot }}
                  whileTap={{ scale: 0.94, rotate: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  className="rounded-[1.4rem] px-3 py-5 flex flex-col items-center text-center gap-2.5 cursor-pointer"
                  style={look.card as React.CSSProperties}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: look.chip, boxShadow: "0 3px 10px rgba(22,19,14,0.13)" }}>
                    <NichoIcon tipo={tipo} size={27} stroke={look.stroke} accent={look.accent} bg={look.chip} />
                  </div>
                  <p className={`text-[12.5px] font-extrabold leading-tight ${look.title}`}>{label}</p>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={look.count as React.CSSProperties}>
                    {Number(n.total).toLocaleString("pt-BR")} vídeos
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUTOS EM ALTA ────────────────────────────────────────────────────────

// O ranking é recalculado de 3 em 3 horas. Mostra há quanto tempo foi a última
// leitura e quanto falta para a próxima, com contagem regressiva ao vivo.
function RankingStatus() {
  const CICLO_MIN = 180;
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const minutosNoCiclo = Math.floor(agora / 60000) % CICLO_MIN;
  const faltamMin = CICLO_MIN - minutosNoCiclo;
  const segundos = 59 - (Math.floor(agora / 1000) % 60);
  const h = Math.floor(faltamMin / 60);
  const m = faltamMin % 60;

  return (
    <div className="mt-4 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 bg-white"
      style={{ border: CARD_EDGE, boxShadow: "0 3px 10px rgba(22,19,14,0.05)" }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(185,242,39,0.30)" }}>
          <TrendingUp className="w-4 h-4" style={{ color: "#4d7c0f" }} />
        </div>
        <div>
          <p className="text-[11.5px] font-extrabold text-foreground leading-none">
            Atualizado há {minutosNoCiclo === 0 ? "1 min" : `${minutosNoCiclo} min`}
          </p>
          <p className="text-[9.5px] text-foreground/45 mt-1">dados direto do TikTok Shop</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[12.5px] font-extrabold tabular-nums leading-none" style={{ color: P }}>
          {h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m ${String(segundos).padStart(2, "0")}s`}
        </p>
        <p className="text-[9.5px] text-foreground/45 mt-1">até o novo ranking</p>
      </div>
    </div>
  );
}


function ProdutosScreen({ onBack, onCriarLive, theme }: { onBack:()=>void; onCriarLive:(p:Produto)=>void; theme: BrandTheme }) {
  const produtosDestaque = theme.id === "malu" ? PRODUTOS_MALU_ALTA : PRODUTOS_DESTAQUE;
  const produtosOutros = theme.id === "malu" ? [] : PRODUTOS_OUTROS;
  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-7 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }} onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <motion.span animate={{ opacity:[1,0.2,1] }} transition={{ repeat:Infinity, duration:1.2 }}
              className="w-2 h-2 rounded-full shrink-0" style={{ background:"#E11D48" }} />
            <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">Ranking ao vivo</p>
          </div>
          <h2 className="font-extrabold text-[1.85rem] leading-[1.15] tracking-tight">
            <span>Produtos </span><em className="italic" style={{ color:P }}>em Alta</em>
          </h2>
          <p className="text-foreground/50 text-[13px] mt-3">{theme.id === "malu" ? "Produtos para divulgar nos seus canais de afiliada Shopee." : "Produtos para explorar e divulgar no TikTok Shop."}</p>
        </div>

        <div className="px-5 pb-14 mt-4">

          {/* ── Seção 1: Destaques da semana ── */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/60 uppercase">Destaques da semana</span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background:"rgba(122,43,245,0.08)", color:P }}>
              {produtosDestaque.length} produtos
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {produtosDestaque.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 14, rotate: i % 2 === 0 ? -1.3 : 1.3 }}
                animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1.3 : 1.3 }}
                whileTap={{ scale: 0.96, rotate: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{ border: CARD_EDGE, boxShadow:"0 6px 18px rgba(22,19,14,0.10)" }}>

                <div className="relative w-full rounded-t-2xl overflow-hidden">
                  <img src={p.img} alt="" className="w-full block" />
                  <span className="absolute top-2 left-2 text-[8px] font-extrabold tracking-wider text-white px-2 py-[3px] rounded-full uppercase"
                    style={{ background: BADGE_COLOR[p.badge] ?? P }}>{p.badge}</span>
                  <span className="absolute top-2 right-2 text-[10px] font-extrabold text-white px-1.5 py-0.5 rounded-full"
                    style={{ background: P, boxShadow:"0 1px 6px rgba(122,43,245,0.4)" }}>
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="px-3 pt-2.5 pb-3 flex-1 flex flex-col justify-end">
                  <button onClick={() => onCriarLive(p)}
                    className="w-full text-[11px] font-extrabold rounded-xl py-2.5 active:scale-95 transition-transform"
                    style={{ background: LIME, color: "#16130E", boxShadow: "0 3px 10px rgba(140,190,20,0.35)" }}>
                    Usar produto
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Seção 2: Mais produtos ── */}
          {produtosOutros.length > 0 && <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Mais produtos</span>
            <span className="text-[10px] font-bold text-foreground/40">{produtosOutros.length} itens</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {produtosOutros.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 12, rotate: [-1.4, 1.2, -1][i % 3] }}
                animate={{ opacity: 1, y: 0, rotate: [-1.4, 1.2, -1][i % 3] }}
                whileTap={{ scale: 0.95, rotate: 0 }}
                transition={{ delay: 0.05 + i * 0.03 }}
                className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{ border: CARD_EDGE, boxShadow:"0 4px 12px rgba(22,19,14,0.08)" }}>
                <img src={p.img} alt="" className="w-full block rounded-t-2xl" />
                <div className="px-2 py-2 flex flex-col gap-1.5">
                  <span className="text-[8px] font-extrabold text-white px-1.5 py-[2px] rounded-full uppercase w-fit"
                    style={{ background: BADGE_COLOR[p.badge] ?? P }}>{p.badge}</span>
                  <button onClick={() => onCriarLive(p)}
                    className="w-full text-[9px] font-extrabold rounded-lg py-2 active:scale-95 transition-transform"
                    style={{ background: LIME, color: "#16130E" }}>
                    Usar produto
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          </>}

        </div>
      </div>
    </div>
  );
}

// ─── TREINAMENTO RÁPIDO ───────────────────────────────────────────────────────

function TreinamentoScreen({ onBack, theme }: { onBack:()=>void; theme: BrandTheme }) {
  const [aberta, setAberta] = useState<string>("01");
  const aulas = theme.id === "malu"
    ? AULAS.map(a => ({ ...a, titulo: a.titulo.replace("TikTok Shop", "Shopee").replace("Eva", "Malu"), desc: a.desc.replace("TikTok Shop", "Shopee") }))
    : AULAS;

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-7 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}
            onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
        </div>

        <div className="px-5 pt-4 pb-2 relative">
          <div className="absolute pointer-events-none" style={{ left: 6, top: 34 }}>
            <Starburst size={46} color={LIME} />
          </div>
          <p className="relative text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-4">Academia da {theme.name}</p>
          <h2 className="relative font-extrabold text-[1.85rem] leading-[1.15] tracking-tight">
            Domine o<br /><em className="italic" style={{ color:P }}>sistema</em>
          </h2>
          <p className="text-foreground/50 text-[13px] mt-3">Quatro módulos práticos para você vender em seus canais.</p>
        </div>

        <div className="px-5 mt-6 pb-14 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Em destaque</span>
            <span className="text-[10px] font-bold" style={{ color:P }}>Comece por aqui</span>
          </div>

          {aulas.map((a, ai) => {
            const isOpen = aberta === a.num;
            const isPrincipal = a.num === "01";
            const chip = ([
              { bg: P,         txt: "#fff" },
              { bg: LIME,      txt: "#16130E" },
              { bg: CARD_DARK, txt: "#fff" },
              { bg: "#fff",    txt: "rgba(22,19,14,0.55)", border: CARD_EDGE },
            ] as const)[ai % 4];
            return (
              <motion.div key={a.num}
                animate={{ rotate: isOpen ? 0 : [-1, 1.1, -0.9, 1][ai % 4] }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer"
                style={{ border: CARD_EDGE, boxShadow: isOpen ? "0 12px 30px rgba(22,19,14,0.14)" : "0 3px 10px rgba(22,19,14,0.06)" }}
                onClick={() => setAberta(isOpen ? "" : a.num)}>

                {/* Thumbnail — só aparece quando aberta */}
                {isOpen && (
                  <div className="relative w-full overflow-hidden">
                    {isPrincipal ? (
                      <>
                        <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/thumbnail.png"
                          alt="Aula 01" className="w-full block" />
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background:"rgba(0,0,0,0.22)" }}>
                          <div className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}>
                            <Play className="w-6 h-6 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-center"
                        style={{ height:110, background:"rgba(22,19,14,0.05)" }}>
                        <Play className="w-8 h-8" style={{ color:P }} fill={P} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[9px] font-extrabold tracking-wider text-white px-2.5 py-[4px] rounded-full uppercase"
                      style={{ background: P }}>
                      Aula {a.num}
                    </span>
                    <span className="absolute bottom-3 right-3 text-[10px] font-bold text-white bg-black/40 px-2.5 py-1 rounded-full">
                      {a.duracao}
                    </span>
                  </div>
                )}

                {/* Header sempre visível */}
                <div className="px-4 pt-3.5 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: isOpen ? P : chip.bg,
                        border: !isOpen && "border" in chip ? chip.border : undefined,
                        boxShadow: isOpen ? "0 4px 12px rgba(122,43,245,0.35)" : "0 2px 8px rgba(22,19,14,0.10)",
                      }}>
                      {isOpen
                        ? <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        : <span className="text-[11px] font-extrabold" style={{ color: chip.txt }}>{a.num}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-[13px] text-foreground leading-snug line-clamp-2">{a.titulo}</p>
                      {isOpen && <p className="text-[11px] text-foreground/50 leading-snug mt-1">{a.desc}</p>}
                    </div>
                    <ChevronRight className={`w-4 h-4 text-foreground/25 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                  {isOpen && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-black/[0.05]">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-foreground/35" />
                        <span className="text-[11px] text-foreground/45">{a.aulas} aulas · {a.duracao}</span>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-foreground/20" />
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold"
                        style={{ background: LIME, color: "#16130E" }}>
                        {a.nivel}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CODE LOGIN ──────────────────────────────────────────────────────────────

function CodeLoginScreen({ onCode, theme }: { onCode:(c:string)=>void; theme: BrandTheme }) {
  const [val, setVal] = useState("");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8" style={PAGE_BG}>
      <img src={theme.logoUrl} alt={theme.name} className="h-14 w-auto mb-14" draggable={false} />
      <div className="w-full max-w-xs">
        <h2 className="font-extrabold text-[1.8rem] leading-[1.15] mb-1.5 tracking-tight">
          Acesse com<br /><em className="italic" style={{ color:P }}>seu código</em>
        </h2>
        <p className="text-foreground/45 text-[13px] mb-8">Digite o código de acesso para entrar.</p>
        <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-foreground/40 mb-2 block">Código de acesso</label>
        <input
          className="w-full border border-black/10 rounded-2xl px-4 py-4 text-[20px] font-extrabold text-foreground outline-none mb-6 tracking-[0.4em] text-center bg-white"
          style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}
          placeholder="••••"
          value={val}
          onChange={e => setVal(e.target.value.toUpperCase())}
          maxLength={8}
          onKeyDown={e => e.key === "Enter" && val.trim().length > 0 && onCode(val.trim())}
        />
        <PrimaryBtn onClick={() => val.trim().length > 0 && onCode(val.trim())} disabled={val.trim().length === 0}>
          Entrar <ChevronRight className="w-4 h-4" />
        </PrimaryBtn>
      </div>
    </div>
  );
}

// ─── PAINEL DE VÍDEOS ─────────────────────────────────────────────────────────

// Desempenho de uma conta pequena e realista (~2 mil seguidores).
// GMV é o valor bruto vendido através dos vídeos; a comissão do afiliado é uma
// fatia desse total (aqui ~7,9%, dentro da faixa comum do TikTok Shop).
interface DiaResumo {
  gmv: number; comissao: number; pedidos: number;
  videos: number; views: number; seguidores: number; novosSeguidores: number;
  // métricas do painel oficial do TikTok Shop
  baseComissao: number; viewsProduto: number; cliquesProduto: number;
  varGmv: number; varItens: number; varComissao: number;
  varBase: number; varViewsProd: number; varCliques: number;
}

const DIA_PADRAO: DiaResumo = {
  gmv: 1174.6, comissao: 92.37, pedidos: 14,
  videos: 7, views: 24803, seguidores: 2043, novosSeguidores: 38,
  baseComissao: 1168.2, viewsProduto: 5284, cliquesProduto: 631,
  varGmv: 15.6, varItens: 27.27, varComissao: 15.6,
  varBase: 14.8, varViewsProd: 22.14, varCliques: -4.2,
};
const DIA_V1: DiaResumo = {
  gmv: 743.2, comissao: 58.91, pedidos: 9,
  videos: 6, views: 16274, seguidores: 1876, novosSeguidores: 21,
  baseComissao: 739.05, viewsProduto: 3417, cliquesProduto: 428,
  varGmv: -8.4, varItens: -10.0, varComissao: -8.4,
  varBase: -8.9, varViewsProd: 6.32, varCliques: -12.7,
};
const DIA_V2: DiaResumo = {
  gmv: 1592.35, comissao: 128.64, pedidos: 19,
  videos: 8, views: 31488, seguidores: 2317, novosSeguidores: 64,
  baseComissao: 1584.9, viewsProduto: 7126, cliquesProduto: 903,
  varGmv: 61.4, varItens: 46.15, varComissao: 63.2,
  varBase: 60.8, varViewsProd: 38.47, varCliques: 24.9,
};

const VIEWS_VIDEOS = [8412, 5207, 3884, 2941, 2106, 1523, 730];
const HORAS_VIDEOS = ["07:20", "09:45", "11:30", "13:15", "16:40", "19:05", "21:30"];

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")} mil` : String(v);

// Réplica do bloco "Dados principais" do painel de afiliado do TikTok Shop.
// Fundo preto, grid 3x2, variação em ciano quando positiva e vermelha quando cai.
const TT_CIANO = "#4DD8E8";
const TT_VERMELHO = "#FF4D67";

// Formata como o painel do TikTok: sem casas quando é inteiro, sem zeros à direita
function pct(v: number) {
  const s = v.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return s.replace(".", ",");
}

function TTMetrica({ label, valor, variacao }: { label: string; valor: string; variacao: number }) {
  const sobe = variacao >= 0;
  return (
    <div className="flex flex-col items-center text-center px-1">
      <p className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.62)" }}>{label}</p>
      <p className="text-white font-bold text-[19px] leading-none mt-2 tabular-nums">{valor}</p>
      <p className="text-[11px] font-medium mt-1.5 tabular-nums"
        style={{ color: sobe ? TT_CIANO : TT_VERMELHO }}>
        {sobe ? "+" : ""}{pct(variacao)}%
      </p>
    </div>
  );
}

function PainelTikTok({ d }: { d: DiaResumo }) {
  const kbrl = (v: number) =>
    v >= 1000 ? `R$ ${(v / 1000).toFixed(1).replace(".", ",")}K` : `R$ ${brl(v)}`;
  const knum = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")}K` : String(v);

  return (
    <div className="px-4 pt-5 pb-6" style={{ background: "#000" }}>
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-white font-bold text-[19px] tracking-tight">Dados principais</h3>
        <Info className="w-4 h-4" style={{ color: "rgba(255,255,255,0.55)" }} />
      </div>
      <div className="grid grid-cols-3 gap-y-7">
        <TTMetrica label="GMV"                     valor={kbrl(d.gmv)}                variacao={d.varGmv} />
        <TTMetrica label="Itens vendidos"          valor={String(d.pedidos)}          variacao={d.varItens} />
        <TTMetrica label="Comissão estimada"       valor={`R$ ${brl(d.comissao)}`}    variacao={d.varComissao} />
        <TTMetrica label="Base de comissão"        valor={kbrl(d.baseComissao)}       variacao={d.varBase} />
        <TTMetrica label="Visualizações do produto" valor={knum(d.viewsProduto)}      variacao={d.varViewsProd} />
        <TTMetrica label="Cliques no produto"      valor={knum(d.cliquesProduto)}     variacao={d.varCliques} />
      </div>
    </div>
  );
}

function VideosDoDia({ nicho, total }: { nicho: string; total: number }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [modalUrl, setModalUrl] = useState<string|null>(null);

  useEffect(() => {
    const nichoFull = NICHO_MAP[nicho] ?? nicho;
    supabase.from("videos_achadinhos")
      .select("message_id, nicho, link_video, topico_original, r2_key")
      .eq("nicho", nichoFull)
      .limit(30)
      .then(({ data }) => {
        const rows = ((data as VideoItem[]) ?? []).filter(v => v.link_video);
        setVideos([...rows].sort(() => Math.random() - 0.5).slice(0, total));
      });
  }, [nicho, total]);

  if (videos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {videos.map((v, i) => (
          <div key={v.message_id}
            className="relative rounded-xl overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
            style={{ background: CARD_DARK }}
            onClick={() => v.link_video && setModalUrl(v.link_video)}>
            <video src={v.link_video ?? ""} preload="metadata" muted playsInline
              onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1; }}
              style={{ width: "100%", height: 128, objectFit: "cover", display: "block" }} />
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.15)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
                <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1.5 pt-4"
              style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))" }}>
              <p className="text-[10px] font-extrabold text-white leading-none">
                {compact(VIEWS_VIDEOS[i % VIEWS_VIDEOS.length])}
              </p>
              <p className="text-[7.5px] text-white/55 mt-0.5">views · {HORAS_VIDEOS[i % HORAS_VIDEOS.length]}</p>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
      </AnimatePresence>
    </>
  );
}

interface ShopeePeriodData {
  dias: number;
  data: string;
  videosReceita: number;
  visualizacoes: number;
  cliques: number;
  pedidos: number;
  itens: number;
  vendas: number;
  comissao: number;
  compradores: number;
}

const SHOPEE_30: ShopeePeriodData = {
  dias: 30, data: "10/07/2026 - 08/08/2026", videosReceita: 18,
  visualizacoes: 92400, cliques: 31400, pedidos: 100, itens: 128,
  vendas: 22200, comissao: 3100, compradores: 96,
};

function shopeePeriod(days: number): ShopeePeriodData {
  const ratio = days / SHOPEE_30.dias;
  return {
    ...SHOPEE_30,
    dias: days,
    data: days === 1 ? "Hoje" : days === 7 ? "02/08/2026 - 08/08/2026" : SHOPEE_30.data,
    videosReceita: Math.max(1, Math.round(SHOPEE_30.videosReceita * ratio)),
    visualizacoes: Math.max(1, Math.round(SHOPEE_30.visualizacoes * ratio)),
    cliques: Math.max(1, Math.round(SHOPEE_30.cliques * ratio)),
    pedidos: Math.max(1, Math.round(SHOPEE_30.pedidos * ratio)),
    itens: Math.max(1, Math.round(SHOPEE_30.itens * ratio)),
    vendas: Math.max(1, Math.round(SHOPEE_30.vendas * ratio)),
    comissao: Math.max(1, Math.round(SHOPEE_30.comissao * ratio)),
    compradores: Math.max(1, Math.round(SHOPEE_30.compradores * ratio)),
  };
}

function shopeeCompact(value: number, currency = false) {
  const prefix = currency ? "R$ " : "";
  if (value >= 1000) return prefix + (value / 1000).toFixed(1).replace(".", ",") + "mil";
  return prefix + value.toLocaleString("pt-BR");
}

function ShopeeMetric({ label, value, change, selected }: { label: string; value: string; change: number; selected?: boolean }) {
  return (
    <div className="min-h-[84px] rounded-xl border px-3 py-3 flex flex-col justify-between"
      style={{ borderColor: selected ? P : "rgba(22,19,14,0.12)", borderWidth: selected ? 2 : 1 }}>
      <p className="text-[11px] leading-tight font-semibold text-foreground/60">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-2">
        <p className="text-[18px] leading-none font-extrabold text-foreground tabular-nums">{value}</p>
        <span className="text-[11px] font-bold tabular-nums" style={{ color: change >= 0 ? "#16A66A" : "#F04438" }}>
          {change >= 0 ? "+" : ""}{pct(change)}%
        </span>
      </div>
    </div>
  );
}

function PainelShopee({ onBack, destravaData, theme }: { onBack:()=>void; destravaData:DestravaData|null; theme: BrandTheme }) {
  const [period, setPeriod] = useState<1 | 7 | 30>(30);
  const d = shopeePeriod(period);
  const shopeeLogo = theme.channels.find(channel => channel.name === "Shopee")?.logoUrl;
  const periods = [
    { value: 1 as const, label: "Hoje" },
    { value: 7 as const, label: "Últimos 7 dias" },
    { value: 30 as const, label: "Últimos 30 dias" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F3F3F3" }}>
      <div className="max-w-md mx-auto">
        <div className="px-4 pt-6 pb-3 flex items-center gap-3 bg-white">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.08] cursor-pointer active:scale-95 transition-transform"
            onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Malu</p>
            <p className="font-extrabold text-[17px] leading-tight">Painel de Vídeos</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFF1E8" }}>
            {shopeeLogo && <img src={shopeeLogo} alt="Shopee" className="w-5 h-5" />}
          </div>
        </div>

        <div className="px-2 py-3 flex gap-2 bg-white border-t border-black/[0.05]">
          {periods.map(item => (
            <button key={item.value} onClick={() => setPeriod(item.value)}
              className="flex-1 min-w-0 rounded-xl px-2 py-2.5 text-[10px] font-bold whitespace-nowrap active:scale-[0.98] transition-transform"
              style={{ background: period === item.value ? "#FFF7F2" : "#F3F3F3", color: period === item.value ? P : "#292929", border: period === item.value ? `1.5px solid ${P}` : "1px solid transparent" }}>
              {item.label}
            </button>
          ))}
          <button className="w-10 rounded-xl flex items-center justify-center bg-[#F3F3F3] text-foreground/45" aria-label="Mais períodos">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-3 pb-14">
          <div className="rounded-[1.25rem] bg-white p-4" style={{ boxShadow: "0 4px 14px rgba(22,19,14,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-extrabold tracking-tight">Métricas Principais</h2>
                <Info className="w-4 h-4 text-foreground/40" />
              </div>
              <span className="text-[10px] font-semibold text-foreground/45">{d.data}</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <ShopeeMetric label="Vídeos com Receita" value={String(d.videosReceita)} change={0} />
              <ShopeeMetric label="Visualizações" value={shopeeCompact(d.visualizacoes)} change={-1} />
              <ShopeeMetric label="Tempo Médio de Visualização" value="00:01:30" change={13} />
              <ShopeeMetric label="Cliques" value={shopeeCompact(d.cliques)} change={398} />
              <ShopeeMetric label="Pedidos" value={String(d.pedidos)} change={197} />
              <ShopeeMetric label="Itens vendidos" value={String(d.itens)} change={132} />
              <ShopeeMetric label="Vendas (R$)" value={shopeeCompact(d.vendas)} change={214} selected />
              <ShopeeMetric label="Comissão Est. (R$)" value={shopeeCompact(d.comissao, true)} change={415} />
              <ShopeeMetric label="Compradores" value={String(d.compradores)} change={195} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 pb-2">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/45 uppercase">Vídeos publicados</span>
            <span className="text-[10px] font-bold" style={{ color: P }}>{d.videosReceita} vídeos</span>
          </div>
          <VideosDoDia nicho={destravaData?.nicho ?? "moda"} total={Math.min(d.videosReceita, 7)} />
        </div>
      </div>
    </div>
  );
}

function PainelScreen({ onBack, destravaData, versao, theme }: { onBack:()=>void; destravaData:DestravaData|null; versao?:"v1"|"v2"; theme: BrandTheme }) {
  if (theme.id === "malu") return <PainelShopee onBack={onBack} destravaData={destravaData} theme={theme} />;
  const d = versao === "v1" ? DIA_V1 : versao === "v2" ? DIA_V2 : DIA_PADRAO;
  const nicho = destravaData?.nicho ?? "moda";

  return (
    <div className="min-h-screen" style={PAGE_BG}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-7 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }} onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">{theme.name}</p>
            <p className="font-extrabold text-[17px] text-foreground leading-tight tracking-tight">Painel de Vídeos</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-full"
            style={{ background: "rgba(122,43,245,0.09)", color: P }}>
            Hoje
          </span>
        </div>

        <div className="px-5 pb-14 space-y-3.5">
          {/* Perfil */}
          <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ border: CARD_EDGE, boxShadow: "0 3px 10px rgba(22,19,14,0.05)" }}>
            <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/iconperfil.jpeg"
              alt="perfil" className="w-11 h-11 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[14px] text-foreground leading-tight">@lumacedo.ofc</p>
              <p className="text-[11px] text-foreground/45 mt-0.5">
                {d.seguidores.toLocaleString("pt-BR")} seguidores
                <span className="font-bold" style={{ color: "#4d7c0f" }}> +{d.novosSeguidores} hoje</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
              style={{ background: "rgba(34,197,94,0.10)" }}>
              <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ repeat:Infinity, duration:1.5 }}
                className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold text-green-700">Ativo</span>
            </div>
          </div>

          {/* Painel oficial do TikTok Shop */}
          <div className="rounded-[1.4rem] overflow-hidden"
            style={{ boxShadow: "0 14px 32px rgba(22,19,14,0.30)" }}>
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "#000" }}>
              <TikTokIcon size={13} />
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                Central do vendedor
              </span>
              <span className="ml-auto text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                Hoje
              </span>
            </div>
            <PainelTikTok d={d} />
          </div>

          {/* Métricas do dia */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { v: String(d.videos), l: "vídeos postados", c: "#fff" },
              { v: compact(d.views), l: "visualizações",  c: "#fff" },
              { v: String(d.pedidos), l: "vendas geradas", c: "#fff" },
            ].map((m, i) => (
              <motion.div key={m.l}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-2xl px-3 py-4"
                style={{ background: "#000", boxShadow: "0 8px 20px rgba(0,0,0,0.28)" }}>
                <p className="text-[1.35rem] font-extrabold leading-none" style={{ color: m.c }}>{m.v}</p>
                <p className="text-[10px] text-white/45 mt-1.5 leading-snug">{m.l}</p>
              </motion.div>
            ))}
          </div>

          {/* Vídeos publicados hoje */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Publicados hoje</span>
            <span className="text-[10px] font-bold" style={{ color: P }}>{d.videos} vídeos</span>
          </div>
          <VideosDoDia nicho={nicho} total={d.videos} />

          <p className="text-center text-[10px] text-foreground/30 pt-2 leading-relaxed">
            A Eva publica e acompanha os resultados. Os valores são atualizados pelo TikTok Shop a cada venda confirmada.
          </p>
        </div>
      </div>
    </div>
  );
}
// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function Eva({ versao, brand = "eva" }: { versao?:"v1"|"v2"; brand?: BrandId } = {}) {
  const theme = getBrandTheme(brand);
  const codeStorageKey = brand === "malu" ? "liveia_malu_code" : "liveia_eva_code";
  const fluxoProdutos = brand === "malu" ? PRODUTOS_MALU_FLUXO : PRODUTOS_FLUXO;
  const [code, setCode]                 = useState<string|null>(() => sessionStorage.getItem(codeStorageKey));
  const [screen, setScreen]             = useState<Screen>("home");
  const [destravaData, setDestravaState] = useState<DestravaData|null>(() => {
    const c = sessionStorage.getItem(codeStorageKey);
    return c ? loadDestravaData(c) : null;
  });
  function handleCode(c: string) {
    sessionStorage.setItem(codeStorageKey, c);
    setCode(c);
    setDestravaState(loadDestravaData(c));
  }

  function nav(s: Screen) { setScreen(s); }
  function goHome()        { setScreen("home"); }

  function criarLiveComProduto() {
    setScreen("destrava");
  }

  if (!code) return <div style={brandVars(theme)}><CodeLoginScreen onCode={handleCode} theme={theme} /></div>;

  return (
    <div style={brandVars(theme)}>
    <AnimatePresence mode="wait">
      {screen === "home" && (
        <motion.div key="home" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <Home onNavigate={nav} theme={theme} />
        </motion.div>
      )}
      {screen === "destrava" && (
        <motion.div key="destrava" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <EvaFlow produtos={fluxoProdutos} onExit={goHome} theme={theme} />
        </motion.div>
      )}
      {screen === "painel" && (
        <motion.div key="painel" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <PainelScreen onBack={goHome} destravaData={destravaData} versao={versao} theme={theme} />
        </motion.div>
      )}
      {screen === "pack" && (
        <motion.div key="pack" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <PackScreen onBack={goHome} theme={theme} />
        </motion.div>
      )}
      {screen === "produtos" && (
        <motion.div key="produtos" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <ProdutosScreen onBack={goHome} onCriarLive={criarLiveComProduto} theme={theme} />
        </motion.div>
      )}
      {screen === "treinamento" && (
        <motion.div key="treinamento" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <TreinamentoScreen onBack={goHome} theme={theme} />
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
