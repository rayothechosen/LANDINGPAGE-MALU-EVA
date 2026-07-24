import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, Check, Sparkles, Video,
  Unlock, Film, TrendingUp, GraduationCap,
  Heart, Users, Zap, ChevronRight, Play,
  Smartphone, ChefHat, Baby, Dumbbell, LayoutGrid,
  Shirt, Flame, Star, BookOpen,
  Loader2, Download, Clock, User, X, Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ─── Paleta ──────────────────────────────────────────────────────────────────
const P        = "#FE2C55";   // TikTok pink
const P2       = "#25F4EE";   // TikTok cyan
const CARD_DARK = "#080808";
const GRAD_BTN  = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;
const GLOW_BTN  = `0 4px 28px rgba(254,44,85,0.55)`;
const BTN_PROD  = "#1C1C1E";
const LOGO_URL  = "https://pub-0b252875d435478a830daa595535d16c.r2.dev/logo.png";
// Cores dos badges por tipo
const BADGE_COLOR: Record<string, string> = {
  "DESTAQUE": "#E11D48",   // vermelho
  "EM ALTA":  "#EA580C",   // laranja
  "POPULAR":  "#0284C7",   // azul
  "TOP":      "#D97706",   // dourado
};

// ─── Produtos R2 ─────────────────────────────────────────────────────────────
const R2 = (name: string) =>
  `https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/${encodeURIComponent(name)}`;

interface Produto {
  id: string; nome: string; preco: string; precoOrig: string;
  desconto: string; comissao: string; badge: string; stars: number;
  destaque: boolean; fluxo: boolean; img: string;
}

const PRODUTOS_ALL: Produto[] = [
  // ── Destaques da semana
  { id:"01", nome:"Produto 01", preco:"R$ 89,90",  precoOrig:"R$179,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:5.0, destaque:true,  fluxo:true,  img:R2("produto01 (destaque) (fluxo).PNG") },
  { id:"02", nome:"Produto 02", preco:"R$ 49,90",  precoOrig:"R$99,00",  desconto:"-50%", comissao:"10%", badge:"DESTAQUE", stars:4.9, destaque:true,  fluxo:true,  img:R2("produto02 (destaque) (fluxo).PNG") },
  { id:"04", nome:"Produto 04", preco:"R$ 69,90",  precoOrig:"R$139,00", desconto:"-50%", comissao:"11%", badge:"DESTAQUE", stars:5.0, destaque:true,  fluxo:true,  img:R2("produto04 (destaque) (fluxo).PNG") },
  { id:"05", nome:"Produto 05", preco:"R$ 39,90",  precoOrig:"R$79,00",  desconto:"-50%", comissao:"9%",  badge:"DESTAQUE", stars:4.8, destaque:true,  fluxo:true,  img:R2("produto05 (destaque) (fluxo).PNG") },
  { id:"11", nome:"Produto 11", preco:"R$ 79,90",  precoOrig:"R$159,00", desconto:"-50%", comissao:"13%", badge:"DESTAQUE", stars:5.0, destaque:true,  fluxo:true,  img:R2("produto11 (destaque) (fluxo).PNG") },
  { id:"14", nome:"Produto 14", preco:"R$ 59,90",  precoOrig:"R$119,00", desconto:"-50%", comissao:"12%", badge:"DESTAQUE", stars:4.9, destaque:true,  fluxo:true,  img:R2("produto14 (destaque) (fluxo).PNG") },
  // ── Complementos (módulo Produtos em Alta)
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
// Destaques da semana: 01 05 04 02 11 14 (02 e 05 trocados)
const PRODUTOS_DESTAQUE = ["01","05","04","02","11","14"].map(id => BY_ID[id]);
// Mais produtos: 12 e 13 sobem pra primeira linha
const PRODUTOS_OUTROS   = ["03","12","13","08","09","10","06","07","15"].map(id => BY_ID[id]);

const NICHOS_ICONS: Record<string, typeof Shirt> = {
  "01 - Moda, Beleza e Estilo":                     Shirt,
  "02 - Casa, Cozinha e Decoração":                 ChefHat,
  "03 - Organização, Limpeza e Utilidades":         LayoutGrid,
  "04 - Maternidade e Infantil":                    Baby,
  "05 - Pets":                                      Heart,
  "06 - Eletrônicos e Tecnologia":                  Smartphone,
  "07 - Automóveis, Ferramentas e Segurança":       Zap,
  "08 - Papelaria, Artesanato e Personalizados":    Star,
  "09 - Alimentação e Comidas":                     ChefHat,
  "10 - Datas Comemorativas":                       Sparkles,
  "11 - Esporte, Fitness e Praia":                  Dumbbell,
  "12 - Virais, Dublados e Conteúdos de Apoio":     Film,
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
  { num:"04", titulo:"Destrava TikTok Shop — perfil do zero",             desc:"Como liberar o TikTok Shop em contas novas.",         duracao:"22min", nivel:"Iniciante",     aulas:3 },
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

const TEMPO_OPTIONS: { id: TempoId; label: string; copy: string; volume: number; horas: number; recomendado?: boolean }[] = [
  { id:"24h", label:"24 horas", copy:"Ativação relâmpago. Ritmo mais intenso de postagens.",          volume:210, horas:24 },
  { id:"36h", label:"36 horas", copy:"Melhor equilíbrio entre velocidade e naturalidade.",             volume:160, horas:36, recomendado:true },
  { id:"48h", label:"48 horas", copy:"Ritmo mais espaçado, no seu tempo.",                             volume:120, horas:48 },
];

const NICHO_OPTIONS = [
  { id:"moda",        label:"Moda",         icon:Shirt },
  { id:"eletro",      label:"Eletrônicos",  icon:Smartphone },
  { id:"casa",        label:"Casa",         icon:ChefHat },
  { id:"fitness",     label:"Fitness",      icon:Dumbbell },
  { id:"pets",        label:"Pets",         icon:Heart },
  { id:"maternidade", label:"Maternidade",  icon:Baby },
] as const;

const NICHO_SHORT_LABEL: Record<string,string> = {
  moda:"Moda", eletro:"Eletrônicos", casa:"Casa", fitness:"Fitness", pets:"Pets", maternidade:"Maternidade",
};

function formatDataHora(d: Date) {
  const data = d.toLocaleDateString("pt-BR", { day:"numeric", month:"short" });
  const hora = d.toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
  return `${data}, ${hora}`;
}

function loadDestravaData(code: string): DestravaData | null {
  try { return JSON.parse(localStorage.getItem(`liveia_dts_${code}`) ?? "null"); } catch { return null; }
}
function saveDestravaData(code: string, d: DestravaData) {
  localStorage.setItem(`liveia_dts_${code}`, JSON.stringify(d));
}

// ─── Utility components ───────────────────────────────────────────────────────

function TikTokIcon({ size=18, color="white" }: { size?:number; color?:string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 106.34 6.34V8.69a8.17 8.17 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  );
}

function Divider() {
  return <div className="w-12 h-[3px] rounded-full mt-4" style={{ background: P }} />;
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

function ProgressSegs({ total, current }: { total:number; current:number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-[3px] rounded-full transition-all"
          style={{ width: i <= current ? 22 : 14, background: i <= current ? P : "#DDD9EE" }} />
      ))}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled }: {
  children:ReactNode; onClick?:()=>void; disabled?:boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-center justify-center gap-2 font-bold py-[14px] rounded-2xl text-sm text-white transition-all active:scale-[0.98] disabled:opacity-40"
      style={{ background: "#1C1C1E", boxShadow: disabled ? undefined : "0 4px 16px rgba(0,0,0,0.25)" }}>
      {children}
    </button>
  );
}

function SelectCard({ icon, title, desc, selected, onClick, badge }: {
  icon:ReactNode; title:string; desc?:string; selected:boolean; onClick:()=>void; badge?:string;
}) {
  return (
    <div onClick={onClick}
      className="relative flex items-center gap-4 bg-white rounded-2xl px-4 py-4 cursor-pointer active:scale-[0.99] transition-transform"
      style={{ boxShadow: selected ? `0 0 0 2px ${P}` : "0 1px 4px rgba(0,0,0,0.07)" }}>
      {badge && (
        <span className="absolute -top-2.5 right-4 text-[9px] font-extrabold text-white px-2.5 py-[3px] rounded-full uppercase tracking-wide"
          style={{ background: "#16A34A", boxShadow: "0 2px 10px rgba(22,163,74,0.45)" }}>
          {badge}
        </span>
      )}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
        style={{ background: selected ? P : "rgba(0,0,0,0.04)" }}>
        <div style={{ color: selected ? "white" : P }}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[13px] text-foreground">{title}</p>
        {desc && <p className="text-[11px] text-foreground/50 mt-0.5 leading-snug">{desc}</p>}
      </div>
      <div className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
        style={{ borderColor: selected ? P : "#D5D1E8", background: selected ? P : "white" }}>
        {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>
    </div>
  );
}

function NichoTile({ icon: Icon, label, selected, onClick }: {
  icon: typeof Shirt; label:string; selected:boolean; onClick:()=>void;
}) {
  return (
    <div onClick={onClick}
      className="flex flex-col items-center gap-2 bg-white rounded-2xl py-5 cursor-pointer active:scale-95 transition-transform"
      style={{ boxShadow: selected ? `0 0 0 2px ${P}` : "0 1px 4px rgba(0,0,0,0.07)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
        style={{ background: selected ? P : "rgba(0,0,0,0.04)" }}>
        <Icon className="w-5 h-5" style={{ color: selected ? "white" : P }} />
      </div>
      <span className="text-[12px] font-bold text-foreground">{label}</span>
    </div>
  );
}

function StepHeader({ step, total, stepName, onBack }: {
  step:number; total:number; stepName:string; onBack:()=>void;
}) {
  return (
    <div className="px-5 pt-7 pb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 text-foreground/50" />
          <span className="text-[11px] font-bold text-foreground/50">Etapa {step}</span>
        </div>
        <span className="text-[11px] font-bold" style={{ color: P }}>{stepName}</span>
      </div>
      <ProgressSegs total={total} current={step - 1} />
    </div>
  );
}

function TopLogo() {
  return (
    <div className="flex justify-center pt-9 pb-0">
      <img src={LOGO_URL} alt="Destrava TikTok Shop" className="h-36 w-auto" />
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────

function Home({ onNavigate }: { onNavigate:(s:Screen)=>void }) {
  const secondary = [
    { id:"painel"      as Screen, title:"Painel de Contas",    desc:"Acompanhe o progresso de todas as contas em destrava.", Icon:Users,         clr:P },
    { id:"pack"        as Screen, title:"Pack +7.000 Vídeos",  desc:"Vídeos prontos por nicho para alimentar seu perfil e acelerar a ativação.", Icon:Film,          clr:P },
    { id:"produtos"    as Screen, title:"Produtos em Alta",     desc:"Os mais vendidos nas últimas 24h para divulgar no seu perfil.", Icon:TrendingUp,    clr:P },
    { id:"treinamento" as Screen, title:"Treinamento Rápido",   desc:"Configure sua primeira ativação em poucos minutos.", Icon:GraduationCap, clr:P },
  ];

  return (
    <div className="min-h-screen bg-background">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
        className="flex justify-center pt-10">
        <img src={LOGO_URL} alt="Destrava TikTok Shop" className="h-36 w-auto" />
      </motion.div>

      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="max-w-md mx-auto px-5 pt-8 pb-2">
        <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-4">Painel Destrava TikTok</p>
        <Divider />
      </motion.div>

      <div className="max-w-md mx-auto px-5 pt-7 pb-16 space-y-2.5">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
          className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Módulos</span>
          <span className="text-[10px] font-bold" style={{ color:P }}>5 ativos</span>
        </motion.div>

        {/* Card principal dark */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
          onClick={() => onNavigate("destrava")}
          className="rounded-[1.25rem] px-5 pt-5 pb-5 cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden"
          style={{ background: CARD_DARK }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:"radial-gradient(ellipse 60% 50% at 80% 0%, rgba(37,244,238,0.14) 0%, transparent 70%)" }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: P }}>
                  <Unlock className="w-5 h-5 text-white" />
                </div>
                <span className="text-[9px] font-bold tracking-wider text-black px-2.5 py-[3px] rounded-full uppercase"
                  style={{ background: P2 }}>Principal</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/25" />
            </div>
            <h3 className="text-[17px] font-extrabold text-white">Destrava TikTok Shop</h3>
            <p className="text-white/45 text-[12px] mt-1 leading-snug max-w-[240px]">
              A IA move seu perfil com vídeos prontos até liberar o TikTok Shop.
            </p>
            <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <p className="text-white/40 text-[11px]">Libere seu perfil agora</p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/70 bg-white/[0.08] px-3 py-1.5 rounded-full">
                Acessar <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cards secundários */}
        {secondary.map(({ id, title, desc, Icon, clr }, i) => (
          <motion.div key={id}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.16 + i * 0.04 }}
            onClick={() => onNavigate(id)}
            className="bg-white rounded-[1.25rem] px-5 py-4 flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-transform"
            style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background:"rgba(254,44,85,0.08)" }}>
              <Icon className="w-5 h-5" style={{ color:P }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[14px] text-foreground">{title}</p>
              <p className="text-[11px] text-foreground/50 mt-0.5 leading-snug line-clamp-2">{desc}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-foreground/25 shrink-0" />
          </motion.div>
        ))}

        <p className="text-center text-[10px] text-foreground/20 pt-4 font-semibold tracking-wide">
          DESTRAVA TIKTOK SHOP · V1.0
        </p>
      </div>
    </div>
  );
}

// ─── DESTRAVA TIKTOK SHOP ─────────────────────────────────────────────────────

function DestravaSuccess({ onBack }: { onBack:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
      className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full px-5 flex flex-col items-center justify-center flex-1 py-16">
        <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ type:"spring", stiffness:280, delay:0.1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: GRAD_BTN, boxShadow: GLOW_BTN }}>
          <Check className="w-9 h-9 text-white" strokeWidth={2.5} />
        </motion.div>
        <h2 className="text-[1.9rem] font-extrabold text-center leading-[1.1]">
          Plano ativado<br /><span style={{ color:P }}>com sucesso!</span>
        </h2>
        <Divider />
        <p className="text-foreground/50 text-[13px] mt-4 text-center leading-snug max-w-[240px]">
          A IA vai trabalhar sua conta nos próximos dias. Você receberá notificações do progresso.
        </p>
        <div className="w-full mt-7">
          <PrimaryBtn onClick={onBack}>Voltar ao início</PrimaryBtn>
        </div>
      </div>
    </motion.div>
  );
}

function DStep1Content({ onNext }: { onNext:()=>void }) {
  const [fase, setFase] = useState<"input"|"buscando"|"found">("input");
  const [username, setUsername] = useState("");

  function buscar() {
    if (username.length < 3) return;
    setFase("buscando");
    setTimeout(() => setFase("found"), 1800);
  }

  return (
    <motion.div key="d1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Conectar Perfil</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Conecte sua<br /><span style={{ color:P }}>Conta</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">A IA vai movimentar sua conta com vídeos naturais para liberar o TikTok Shop.</p>

      {fase === "input" && (
        <>
          <div className="bg-white rounded-2xl px-4 py-4 mb-5" style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-foreground/40 mb-2">Usuário TikTok</p>
            <div className="flex items-center gap-2 bg-background rounded-xl px-3 py-2.5">
              <span className="text-foreground/30 text-[15px] font-bold">@</span>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="seuperfil"
                className="flex-1 bg-transparent text-[14px] font-bold text-foreground placeholder:text-foreground/25 outline-none" />
            </div>
          </div>
          <PrimaryBtn onClick={buscar} disabled={username.length < 3}>
            Buscar perfil <ChevronRight className="w-4 h-4" />
          </PrimaryBtn>
        </>
      )}

      {fase === "buscando" && (
        <div className="flex flex-col items-center py-10 gap-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color:P2 }} />
          <p className="text-[13px] text-foreground/50 font-semibold">Buscando @{username} no TikTok...</p>
        </div>
      )}

      {fase === "found" && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
          <div className="bg-white rounded-2xl px-4 py-4 mb-5 flex items-center gap-4"
            style={{ boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
            <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/iconperfil.jpeg"
              alt="perfil" className="w-14 h-14 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[15px] text-foreground leading-none mb-0.5">@lumacedo.ofc</p>
              <div className="flex items-center gap-1.5 mb-2">
                <TikTokIcon size={11} color="#000" />
                <p className="text-[11px] text-foreground/45">TikTok</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[13px] font-extrabold text-foreground">234</p>
                  <p className="text-[9px] text-foreground/40">seguidores</p>
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-foreground">9</p>
                  <p className="text-[9px] text-foreground/40">publicações</p>
                </div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background:"#22C55E" }}>
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
          </div>
          <PrimaryBtn onClick={onNext}>
            Continuar <ChevronRight className="w-4 h-4" />
          </PrimaryBtn>
        </motion.div>
      )}
    </motion.div>
  );
}

function DStepNichoContent({ nicho, setNicho, onNext }: {
  nicho:string; setNicho:(v:string)=>void; onNext:()=>void;
}) {
  return (
    <motion.div key="d2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Nicho</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Qual o nicho<br /><span style={{ color:P }}>do seu perfil?</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">
        A IA vai postar vídeos do nicho <span className="font-bold" style={{ color:P }}>"{NICHO_SHORT_LABEL[nicho]}"</span> para construir autoridade antes da ativação.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {NICHO_OPTIONS.map(n => (
          <NichoTile key={n.id} icon={n.icon} label={n.label} selected={nicho===n.id} onClick={() => setNicho(n.id)} />
        ))}
      </div>
      <PrimaryBtn onClick={onNext}>Continuar <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </motion.div>
  );
}

function DStepTempoContent({ tempo, setTempo, onNext }: {
  tempo:TempoId; setTempo:(v:TempoId)=>void; onNext:()=>void;
}) {
  return (
    <motion.div key="d3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Tempo de ativação</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Quanto tempo<br /><span style={{ color:P }}>para ativar?</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-6">Escolha o ritmo que a IA vai usar para postar os vídeos.</p>
      <div className="space-y-4">
        {TEMPO_OPTIONS.map(t => (
          <SelectCard key={t.id} icon={<Clock className="w-5 h-5" />} title={t.label} desc={t.copy}
            badge={t.recomendado ? "Recomendado" : undefined}
            selected={tempo===t.id} onClick={() => setTempo(t.id)} />
        ))}
      </div>
      <div className="mt-1 mb-5" />
      <PrimaryBtn onClick={onNext}>Continuar <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </motion.div>
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

const NICHO_HASHTAGS: Record<string,string> = {
  "moda":        "#moda #modafeminina #ootd #lookdodia #tiktokshop",
  "casa":        "#casa #decoracao #organizacao #casaellar #tiktokshop",
  "fitness":     "#fitness #treino #gym #vidasaudavel #tiktokshop",
  "eletro":      "#tecnologia #eletronicos #gadgets #techtok #tiktokshop",
  "pets":        "#pets #cachorro #gato #petlovers #tiktokshop",
  "maternidade": "#maternidade #bebe #mamaedeprimeiraviagem #enxovaldebebe #tiktokshop",
};

const LEGENDA_TEMPLATES: Record<string, string[]> = {
  "moda": [
    "Esse achado da Shopee vai mudar seu look! Corre ver",
    "Comprei e me arrependi de não ter comprado antes",
    "O achado de moda que todo mundo tá comprando agora",
    "Esse produto tá esgotando rápido — pega o link na bio",
    "Testei e aprovei! Qualidade surreal pelo preço",
    "Não acredito que encontrei isso na Shopee",
    "Look completo por um preço impossível! Tá no link",
  ],
  "casa": [
    "Esse produto transformou minha casa inteira!",
    "Achado de organização que mudou minha rotina",
    "Minha casa ficou outra depois desse produto",
    "Ninguém acredita que comprei na Shopee por esse preço",
    "Se você não tem isso em casa, está perdendo tempo",
    "O item de decoração que mais recebi perguntas",
    "Cozinha organizada em minutos com esse achado!",
  ],
  "fitness": [
    "Meu treino mudou completamente com esse produto",
    "Equipamento fitness com o melhor custo-benefício",
    "Treinar em casa ficou muito mais fácil!",
    "Esse achado fitness tá bombando na Shopee",
    "Resultado em 30 dias usando esse produto",
    "Personal trainer me indicou e eu fui atrás",
    "Quem malha em casa precisa ter isso! Sério",
  ],
  "eletro": [
    "Esse gadget mudou minha produtividade",
    "O eletrônico do mês — melhor compra que fiz",
    "Tecnologia acessível que vale muito o preço",
    "Comprei achando que era furada e me surpreendi",
    "Esse produto tech tá esgotando na Shopee",
    "Review honesto: vale MUITO a pena!",
    "Gadget que todo mundo deveria ter em casa",
  ],
  "pets": [
    "Meu pet não vive mais sem esse produto!",
    "O achado pet que todo tutor precisa conhecer",
    "Meu bichinho amou e eu também!",
    "Melhor produto que comprei pro meu pet",
    "Testado e aprovado pelo meu cachorro",
    "Produto pet com qualidade premium e preço acessível",
    "Ninguém me contou desse achado, eu que descobri!",
  ],
  "maternidade": [
    "Meu bebê não vive mais sem esse produto!",
    "O achado de maternidade que toda mamãe precisa conhecer",
    "Facilitou demais minha rotina com o bebê",
    "Melhor produto que comprei pro enxoval",
    "Testado e aprovado aqui em casa",
    "Produto premium com preço muito acessível",
    "Ninguém me contou desse achado, eu que descobri!",
  ],
};

function DStepVideosContent({ nicho, volume, onSubmit }: { nicho:string; volume:number; onSubmit:()=>void }) {
  const [videos, setVideos] = useState<(VideoItem & { _legenda:string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalUrl, setModalUrl] = useState<string|null>(null);

  useEffect(() => {
    const nichoFull = NICHO_MAP[nicho] ?? nicho;
    const templates = LEGENDA_TEMPLATES[nicho] ?? LEGENDA_TEMPLATES["moda"];
    const amostra = Math.min(6, templates.length); // sempre um nº par pra fechar as fileiras da grid
    supabase.from("videos_achadinhos")
      .select("message_id, nicho, link_video, topico_original, r2_key")
      .eq("nicho", nichoFull)
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          // limita ao nº de legendas únicas disponíveis pra nunca repetir texto entre cards
          const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, amostra);
          setVideos(shuffled.map((v, i) => ({
            ...(v as VideoItem),
            _legenda: templates[i % templates.length],
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [nicho]);

  return (
    <motion.div key="d5" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-5 pb-8">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Vídeos do Plano</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">
        Vídeos que serão<br /><span style={{ color:P }}>postados</span>
      </h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">Estes são exemplos do estilo de vídeo que a IA vai usar no seu perfil.</p>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color:P2 }} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {videos.map((v) => (
              <div key={v.message_id} className="rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                style={{ background: CARD_DARK, boxShadow:"0 2px 10px rgba(0,0,0,0.2)" }}
                onClick={() => v.link_video && setModalUrl(v.link_video)}>
                <div className="relative">
                  <video
                    src={v.link_video ?? ""}
                    preload="metadata"
                    muted
                    playsInline
                    onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1; }}
                    style={{ width:"100%", height:150, objectFit:"cover", display:"block" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ background:"rgba(0,0,0,0.18)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)" }}>
                      <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                <div className="px-2.5 pt-2 pb-2.5 space-y-1">
                  <p className="text-[10px] font-bold text-white line-clamp-2 leading-snug">{v._legenda}</p>
                  <p className="text-[9px] font-semibold line-clamp-1 leading-snug" style={{ color:P }}>
                    {NICHO_HASHTAGS[nicho] ?? "#tiktokshop"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl px-4 py-5 mb-5 relative overflow-hidden" style={{ background: CARD_DARK }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background:"radial-gradient(ellipse 80% 60% at 100% 0%, rgba(254,44,85,0.35) 0%, transparent 65%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-4 h-4 shrink-0" style={{ color:P }} />
                <span className="text-[10px] font-extrabold tracking-[0.15em] uppercase" style={{ color:P }}>Plano completo</span>
              </div>
              <p className="text-white font-extrabold text-[22px] leading-none mb-1">
                Serão {volume} vídeos
              </p>
              <p className="text-white font-extrabold text-[22px] leading-none mb-3" style={{ color:P }}>
                postados no seu perfil
              </p>
              <p className="text-white/45 text-[11px] leading-snug">
                Os vídeos acima são só exemplos do estilo — a IA posta automaticamente com legenda e hashtags prontas em todos os {volume}.
              </p>
            </div>
          </div>
        </>
      )}

      <PrimaryBtn onClick={onSubmit}><Zap className="w-4 h-4" /> Ativar plano</PrimaryBtn>

      <AnimatePresence>
        {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

interface AnaliseCtx { nichoLabel:string; pool:number; volume:number; tempoLabel:string; }

const ANALISE_STEPS: { text:(ctx:AnaliseCtx)=>string; duration:number; counter?:boolean }[] = [
  { text: ctx => `Analisando mercado do nicho "${ctx.nichoLabel}"...`,                                duration:1600 },
  { text: ctx => `Encontrados ${ctx.pool} vídeos de alto desempenho`,                                 duration:2300, counter:true },
  { text: ()  => `Selecionando os vídeos com maior potencial de viralização...`,                      duration:1600 },
  { text: ()  => `Editando e adaptando vídeos para seu perfil...`,                                     duration:1600 },
  { text: ()  => `Gerando legendas e hashtags otimizadas...`,                                          duration:1600 },
  { text: ctx => `Calculando volume necessário: ${ctx.volume} vídeos para ativar em ${ctx.tempoLabel}`, duration:2300 },
  { text: ()  => `Calculando os melhores horários de postagem...`,                                     duration:2100 },
  { text: ()  => `Plano pronto!`,                                                                      duration:1300 },
];

function AnaliseIAScreen({ nichoLabel, volume, tempoLabel, onDone }: {
  nichoLabel:string; volume:number; tempoLabel:string; onDone:()=>void;
}) {
  const [pool] = useState(() => volume * 3 + Math.floor(Math.random() * 60));
  const [idx, setIdx] = useState(0);
  const [poolCount, setPoolCount] = useState(0);
  const ctx: AnaliseCtx = { nichoLabel, pool, volume, tempoLabel };
  const last = ANALISE_STEPS.length - 1;

  useEffect(() => {
    if (idx > last) { onDone(); return; }
    const step = ANALISE_STEPS[idx];
    let counterTimer: ReturnType<typeof setInterval> | undefined;
    if (step.counter) {
      const start = Date.now();
      const dur = step.duration - 400;
      counterTimer = setInterval(() => {
        const t = Math.min(1, (Date.now() - start) / dur);
        setPoolCount(Math.round(t * pool));
        if (t >= 1) clearInterval(counterTimer);
      }, 60);
    }
    const advance = setTimeout(() => setIdx(i => i + 1), step.duration);
    return () => { clearTimeout(advance); if (counterTimer) clearInterval(counterTimer); };
  }, [idx]);

  const visible = Math.min(idx + 1, ANALISE_STEPS.length);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: CARD_DARK }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:"radial-gradient(ellipse 70% 50% at 50% 40%, rgba(254,44,85,0.22) 0%, transparent 70%)" }} />
      <div className="relative w-full max-w-xs space-y-4">
        <p className="text-white/40 text-[10px] font-bold tracking-[0.18em] uppercase text-center mb-2">Análise da IA</p>
        {Array.from({ length: visible }).map((_, i) => {
          const isDone    = i < idx;
          const isCurrent = i === idx && idx <= last;
          const isFinal   = i === last;
          const label = ANALISE_STEPS[i].counter
            ? `Encontrados ${poolCount} vídeos de alto desempenho`
            : ANALISE_STEPS[i].text(ctx);
          return (
            <motion.div key={i} initial={{ opacity:0, y:8 }}
              animate={{ opacity: isCurrent ? 1 : 0.35, scale: isCurrent ? 1 : 0.92 }}
              transition={{ duration:0.4 }}
              className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: isDone || (isFinal && isCurrent) ? "#22C55E" : isCurrent ? P : "rgba(255,255,255,0.15)" }}>
                {(isDone || (isFinal && isCurrent))
                  ? <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  : isCurrent ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : null}
              </div>
              <p className={`text-[13px] font-semibold leading-snug ${isCurrent ? "text-white" : "text-white/40"}`}>{label}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function DestravaFlow({ onBack, onActivate }: { onBack:()=>void; onActivate:(nicho:string, tempo:TempoId, volume:number)=>void }) {
  const [step, setStep]   = useState<1|2|3|4|5>(1);
  const [nicho, setNicho] = useState("moda");
  const [tempo, setTempo] = useState<TempoId>("36h");
  const names = ["Conectar","Nicho","Tempo","Análise","Vídeos"];
  const tempoOpt = TEMPO_OPTIONS.find(t => t.id === tempo)!;
  const prev = () => {
    if (step === 1) return onBack();
    if (step === 5) return setStep(3); // pula a tela de processamento ao voltar
    setStep((step - 1) as 1|2|3|4|5);
  };

  if (step === 4) {
    return (
      <AnaliseIAScreen
        nichoLabel={NICHO_SHORT_LABEL[nicho]}
        volume={tempoOpt.volume}
        tempoLabel={tempoOpt.label}
        onDone={() => setStep(5)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <StepHeader step={step} total={5} stepName={names[step-1]} onBack={prev} />
        <AnimatePresence mode="wait">
          {step===1 && <DStep1Content key="d1" onNext={() => setStep(2)} />}
          {step===2 && <DStepNichoContent key="d2" nicho={nicho} setNicho={setNicho} onNext={() => setStep(3)} />}
          {step===3 && <DStepTempoContent key="d3" tempo={tempo} setTempo={setTempo} onNext={() => setStep(4)} />}
          {step===5 && <DStepVideosContent key="d5" nicho={nicho} volume={tempoOpt.volume} onSubmit={() => onActivate(nicho, tempo, tempoOpt.volume)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── PACK +10.000 VÍDEOS ─────────────────────────────────────────────────────

function PackScreen({ onBack }: { onBack:()=>void }) {
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
              <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Pack de Vídeos</p>
              <p className="font-extrabold text-[15px] text-foreground leading-tight">
                {NICHOS_LABEL[nichoCurr.nicho] ?? nichoCurr.nicho}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background:"rgba(0,0,0,0.05)", color:P }}>
              {nichoCurr.total} vídeos
            </span>
          </div>

          <div className="px-5 pb-14">
            {vLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin" style={{ color:P2 }} />
              </div>
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
                      <p className="text-[10px] font-bold text-white line-clamp-2 leading-snug">
                        {v.topico_original ?? "Vídeo"}
                      </p>
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
    <div className="min-h-screen bg-background">
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
          <h2 className="text-[2rem] font-extrabold leading-[1.1]">
            Pack de<br /><span style={{ color:P }}>Vídeos</span>
          </h2>
          <Divider />
          <p className="text-foreground/50 text-[13px] mt-3">Vídeos prontos por nicho para suas lives.</p>
        </div>

        <div className="px-5 mt-5 mb-6">
          <div className="bg-white rounded-2xl px-5 py-5" style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-foreground/40 mb-2">Vídeos disponíveis</p>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color:P2 }} />
                <span className="text-[14px] font-bold text-foreground/50">Carregando...</span>
              </div>
            ) : (
              <>
                <p className="text-[2rem] font-extrabold" style={{ color:P }}>
                  +{total.toLocaleString("pt-BR")}
                </p>
                <p className="text-[12px] text-foreground/50 mt-0.5">vídeos prontos para sua ativação</p>
              </>
            )}
          </div>
        </div>

        <div className="px-5 pb-14">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Nichos</span>
            <span className="text-[10px] font-bold" style={{ color:P }}>Selecione um</span>
          </div>
          <div className="space-y-2.5">
            {nichos.map(n => {
              const Icon = NICHOS_ICONS[n.nicho] ?? Film;
              const label = NICHOS_LABEL[n.nicho] ?? n.nicho;
              return (
                <div key={n.nicho} onClick={() => openNicho(n)}
                  className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 cursor-pointer active:scale-[0.99] transition-transform"
                  style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:"rgba(0,0,0,0.04)" }}>
                    <Icon className="w-5 h-5" style={{ color:P }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[14px] text-foreground">{label}</p>
                    <p className="text-[11px] text-foreground/45 mt-0.5">{Number(n.total).toLocaleString("pt-BR")} vídeos</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/25" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUTOS EM ALTA ────────────────────────────────────────────────────────

function ProdutosScreen({ onBack, onCriarLive }: { onBack:()=>void; onCriarLive:(p:Produto)=>void }) {
  return (
    <div className="min-h-screen bg-background">
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
            <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">Atualizado agora</p>
          </div>
          <h2 className="text-[2rem] font-extrabold leading-[1.1]">
            <span>Produtos </span><span style={{ color:P }}>em Alta</span>
          </h2>
          <Divider />
          <p className="text-foreground/50 text-[13px] mt-3">Selecionados com base nas <span className="font-bold text-foreground/70">vendas das últimas 24h</span> — esses são os que mais convertem agora.</p>
        </div>

        <div className="px-5 pb-14 mt-4">

          {/* ── Seção 1: Destaques da semana ── */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" style={{ color:P }} />
              <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/60 uppercase">Destaques da semana</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background:"rgba(0,0,0,0.05)", color:P }}>
              {PRODUTOS_DESTAQUE.length} produtos
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {PRODUTOS_DESTAQUE.map((p, i) => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{ boxShadow:"0 2px 10px rgba(0,0,0,0.09)" }}>

                <div className="relative w-full rounded-t-2xl overflow-hidden">
                  <img src={p.img} alt="" className="w-full block" />
                  <span className="absolute top-2 left-2 text-[8px] font-extrabold tracking-wider text-white px-2 py-[3px] rounded-full uppercase"
                    style={{ background: BADGE_COLOR[p.badge] ?? P }}>{p.badge}</span>
                  <span className="absolute top-2 right-2 text-[10px] font-extrabold text-foreground/55 bg-white/90 px-1.5 py-0.5 rounded-full"
                    style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.1)" }}>
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="px-3 pt-2.5 pb-3 flex-1 flex flex-col justify-end">
                  <button onClick={() => onCriarLive(p)}
                    className="w-full text-white text-[11px] font-extrabold rounded-xl py-2.5 active:scale-95 transition-transform"
                    style={{ background: BTN_PROD }}>
                    Usar produto
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Seção 2: Mais produtos ── */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Mais produtos</span>
            <span className="text-[10px] font-bold text-foreground/40">{PRODUTOS_OUTROS.length} itens</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {PRODUTOS_OUTROS.map(p => (
              <div key={p.id}
                className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{ boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
                <img src={p.img} alt="" className="w-full block rounded-t-2xl" />
                <div className="px-2 py-2 flex flex-col gap-1.5">
                  <span className="text-[8px] font-extrabold text-white px-1.5 py-[2px] rounded-full uppercase w-fit"
                    style={{ background: BADGE_COLOR[p.badge] ?? P }}>{p.badge}</span>
                  <button onClick={() => onCriarLive(p)}
                    className="w-full text-white text-[9px] font-extrabold rounded-lg py-2 active:scale-95 transition-transform"
                    style={{ background: BTN_PROD }}>
                    Usar produto
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── TREINAMENTO RÁPIDO ───────────────────────────────────────────────────────

function TreinamentoScreen({ onBack }: { onBack:()=>void }) {
  const [aberta, setAberta] = useState<string>("01");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-7 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}
            onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-4">Academia</p>
          <h2 className="text-[2rem] font-extrabold leading-[1.1]">
            Domine o<br /><span style={{ color:P }}>sistema</span>
          </h2>
          <Divider />
          <p className="text-foreground/50 text-[13px] mt-3">Quatro módulos práticos para você ativar o TikTok Shop.</p>
        </div>

        <div className="px-5 mt-6 pb-14 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Em destaque</span>
            <span className="text-[10px] font-bold" style={{ color:P }}>Comece por aqui</span>
          </div>

          {AULAS.map((a) => {
            const isOpen = aberta === a.num;
            const isPrincipal = a.num === "01";
            return (
              <div key={a.num} className="bg-white rounded-2xl overflow-hidden cursor-pointer"
                style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.07)" }}
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
                        style={{ height:110, background:`linear-gradient(135deg, rgba(254,44,85,0.12) 0%, rgba(254,44,85,0.04) 100%)` }}>
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
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: isOpen ? P : "rgba(0,0,0,0.05)" }}>
                      {isOpen
                        ? <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        : <span className="text-[11px] font-extrabold text-foreground/35">{a.num}</span>
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
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background:"rgba(254,44,85,0.1)", color:P }}>
                        {a.nivel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CODE LOGIN ──────────────────────────────────────────────────────────────

function CodeLoginScreen({ onCode }: { onCode:(c:string)=>void }) {
  const [val, setVal] = useState("");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background">
      <img src={LOGO_URL} alt="Destrava TikTok Shop" className="h-16 w-auto mb-14" />
      <div className="w-full max-w-xs">
        <h2 className="text-[1.8rem] font-extrabold leading-[1.1] mb-1.5">
          Acesse com<br /><span style={{ color:P }}>seu código</span>
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

// ─── DESTRAVA DASHBOARD ───────────────────────────────────────────────────────

const SUBATIVIDADES = [
  "Otimizando horários de postagem...",
  "Analisando engajamento dos últimos vídeos...",
  "Ajustando ritmo de publicação...",
];

function AtividadeDaIA({ videosPosted, volume, proximoVideoMin }: { videosPosted:number; volume:number; proximoVideoMin?:number }) {
  const [open, setOpen] = useState(true);
  const [subIdx, setSubIdx] = useState(0);

  useEffect(() => {
    if (proximoVideoMin != null) return; // narrativa fixa não precisa rotacionar
    const t = setInterval(() => setSubIdx(i => (i + 1) % SUBATIVIDADES.length), 4500);
    return () => clearInterval(t);
  }, [proximoVideoMin]);

  const faltam = volume - videosPosted;

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.08]">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full">
        <span className="text-white/50 text-[11px] font-bold uppercase tracking-[0.12em]">Atividade da IA</span>
        <ChevronRight className={`w-3.5 h-3.5 text-white/40 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="mt-2.5 space-y-1.5">
          <p className="text-white/60 text-[12px] flex items-center gap-1.5">
            <Check className="w-3 h-3 text-green-400 shrink-0" strokeWidth={3} /> Perfil analisado
          </p>
          <p className="text-white/60 text-[12px] flex items-center gap-1.5">
            <Check className="w-3 h-3 text-green-400 shrink-0" strokeWidth={3} /> Plano de conteúdo gerado
          </p>
          {faltam > 0 ? (
            <p className="text-white text-[12px] font-semibold">
              → Postando vídeo {Math.min(videosPosted + 1, volume)} de {volume}{proximoVideoMin != null ? ` em ${proximoVideoMin} min...` : "..."}
            </p>
          ) : (
            <p className="text-white text-[12px] font-semibold">→ Todos os {volume} vídeos já foram postados</p>
          )}
          <p className="text-white/40 text-[11px] pl-4">{proximoVideoMin != null ? "Otimizando horários de postagem..." : SUBATIVIDADES[subIdx]}</p>
        </div>
      )}
    </div>
  );
}

function UltimosPostadosSection({ nicho, max = 15, permitirVerMais = true }: { nicho:string; max?:number; permitirVerMais?:boolean }) {
  const [videos, setVideos] = useState<(VideoItem & { _legenda:string })[]>([]);
  const [visivel, setVisivel] = useState(max);
  const [modalUrl, setModalUrl] = useState<string|null>(null);

  useEffect(() => {
    const nichoFull = NICHO_MAP[nicho] ?? nicho;
    const templates = LEGENDA_TEMPLATES[nicho] ?? LEGENDA_TEMPLATES["moda"];
    setVisivel(max);
    supabase.from("videos_achadinhos")
      .select("message_id, nicho, link_video, topico_original, r2_key")
      .eq("nicho", nichoFull)
      .limit(30)
      .then(({ data:rows, error }) => {
        if (!error && rows && rows.length > 0) {
          const shuffled = [...rows].sort(() => Math.random() - 0.5);
          setVideos(shuffled.map((v, i) => ({
            ...(v as VideoItem),
            _legenda: templates[i % templates.length],
          })));
        }
      });
  }, [nicho]);

  if (videos.length === 0) return null;
  const mostrados = videos.slice(0, visivel);

  return (
    <>
      <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Últimos postados</p>
      <div className="grid grid-cols-3 gap-2">
        {mostrados.map(v => (
          <div key={v.message_id} className="rounded-xl overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
            style={{ background:CARD_DARK }}
            onClick={() => v.link_video && setModalUrl(v.link_video)}>
            <div className="relative">
              <video src={v.link_video ?? ""} preload="metadata" muted playsInline
                onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1; }}
                style={{ width:"100%", height:110, objectFit:"cover", display:"block" }} />
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background:"rgba(0,0,0,0.2)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background:"rgba(0,0,0,0.6)" }}>
                  <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                </div>
              </div>
            </div>
            <div className="px-2 pt-1.5 pb-2">
              <p className="text-[9px] text-white/55 line-clamp-2 leading-snug">{v._legenda}</p>
            </div>
          </div>
        ))}
      </div>
      {permitirVerMais && visivel < videos.length && (
        <button onClick={() => setVisivel(v => v + 15)}
          className="w-full flex items-center justify-center gap-1.5 bg-white border border-black/10 text-foreground text-[12.5px] font-bold py-2.5 rounded-2xl active:scale-[0.98] transition-transform">
          Ver mais <ChevronRight className="w-3.5 h-3.5 rotate-90" />
        </button>
      )}
      <AnimatePresence>
        {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl(null)} />}
      </AnimatePresence>
    </>
  );
}

// ─── PAINEL DE CONTAS ─────────────────────────────────────────────────────────

interface ContaConcluida {
  nome:string; handle:string; seguidores:number; publicacoes:number; curtidas:string;
  nicho:string; tempoAtivacao:string; volume:number; foto:string;
}

const CONTA_CONCLUIDA: ContaConcluida = {
  nome:"Achadinhos Baby",
  handle:"@achadinhosbaby.br",
  seguidores:3515,
  publicacoes:293,
  curtidas:"34,3 mil",
  nicho:"maternidade",
  tempoAtivacao:"34h 28min",
  volume:160,
  foto:"https://pub-0b252875d435478a830daa595535d16c.r2.dev/0f8b89decb5ed1e36a2e876d60d1af3c~tplv-tiktokx-cropcenter_1080_1080.jpeg",
};

function ContaConcluidaScreen({ conta, onBack }: { conta:ContaConcluida; onBack:()=>void }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-7 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }} onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Destrava TikTok Shop</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background:"rgba(34,197,94,0.1)" }}>
            <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
            <span className="text-[11px] font-bold text-green-600">Concluído</span>
          </div>
        </div>

        <div className="px-5 pb-14 space-y-4">
          {/* Profile */}
          <div className="bg-white rounded-2xl px-4 py-4 flex items-center gap-4"
            style={{ boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
            <img src={conta.foto} alt="perfil" className="w-14 h-14 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[15px] text-foreground leading-none mb-0.5">{conta.nome}</p>
              <div className="flex items-center gap-1.5 mb-2">
                <TikTokIcon size={11} color="#000" />
                <p className="text-[11px] text-foreground/45">{conta.handle}</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[13px] font-extrabold text-foreground">{conta.seguidores.toLocaleString("pt-BR")}</p>
                  <p className="text-[9px] text-foreground/40">seguidores</p>
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-foreground">{conta.publicacoes}</p>
                  <p className="text-[9px] text-foreground/40">publicações</p>
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-foreground">{conta.curtidas}</p>
                  <p className="text-[9px] text-foreground/40">curtidas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status card — concluído */}
          <div className="rounded-2xl px-4 py-5 relative overflow-hidden" style={{ background:CARD_DARK }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background:"radial-gradient(ellipse 70% 50% at 80% 0%, rgba(34,197,94,0.3) 0%, transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)" }}>
                  <Check className="w-4 h-4 text-green-400" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-white font-extrabold text-[16px] leading-none">TikTok Shop ativado!</p>
                  <p className="text-white/50 text-[11px] mt-0.5">Meta de seguidores alcançada</p>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden mt-3">
                <div className="h-full rounded-full" style={{ width:"100%", background:"#22C55E" }} />
              </div>
              <p className="text-white/40 text-[10px] mt-3">
                Ativada em {conta.tempoAtivacao} com {conta.volume} publicações feitas pela IA.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl px-3 py-4" style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
              <p className="text-[1.6rem] font-extrabold" style={{ color:P }}>{conta.volume}</p>
              <p className="text-[10.5px] text-foreground/50 leading-snug">vídeos postados</p>
            </div>
            <div className="bg-white rounded-2xl px-3 py-4" style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
              <p className="text-[1.6rem] font-extrabold text-foreground">0</p>
              <p className="text-[10.5px] text-foreground/50 leading-snug">faltam postar</p>
            </div>
            <div className="bg-white rounded-2xl px-3 py-4" style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
              <p className="text-[1.6rem] font-extrabold text-foreground">100%</p>
              <p className="text-[10.5px] text-foreground/50 leading-snug">plano concluído</p>
            </div>
          </div>

          <UltimosPostadosSection nicho={conta.nicho} />

          <button className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[13px] font-bold text-white active:scale-[0.98] transition-transform"
            style={{ background:"#1C1C1E" }}>
            <TikTokIcon size={14} color="white" /> Ver perfil no TikTok
          </button>
        </div>
      </div>
    </div>
  );
}

function ContaListItem({ foto, nome, handle, seguidores, status, statusColor, onClick }: {
  foto:string; nome:string; handle:string; seguidores:number; status:string; statusColor:"green"|"orange"; onClick:()=>void;
}) {
  const cor = statusColor === "green" ? { bg:"rgba(34,197,94,0.1)", text:"#16A34A" } : { bg:"rgba(254,44,85,0.1)", text:P };
  return (
    <div onClick={onClick}
      className="flex items-center gap-4 bg-white rounded-2xl px-4 py-4 cursor-pointer active:scale-[0.99] transition-transform"
      style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
      <img src={foto} alt={nome} className="w-12 h-12 rounded-full object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[14px] text-foreground leading-tight">{nome}</p>
        <p className="text-[11px] text-foreground/45 mt-0.5">{handle} · {seguidores.toLocaleString("pt-BR")} seguidores</p>
      </div>
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background:cor.bg, color:cor.text }}>{status}</span>
      <ChevronRight className="w-4 h-4 text-foreground/25 shrink-0" />
    </div>
  );
}

interface AtivacaoFixa {
  seguidoresAtuais:number; seguidoresGanhos:number; publicacoesAtuais:number;
  videosPostados:number; proximoVideoMin:number; metaAlcancada:boolean; tempoDecorrido?:string;
}

const ATIVACAO_V1: AtivacaoFixa = {
  seguidoresAtuais:239, seguidoresGanhos:5, publicacoesAtuais:12,
  videosPostados:3, proximoVideoMin:2, metaAlcancada:false,
};

const ATIVACAO_V2: AtivacaoFixa = {
  seguidoresAtuais:1101, seguidoresGanhos:867, publicacoesAtuais:166,
  videosPostados:157, proximoVideoMin:6, metaAlcancada:true, tempoDecorrido:"34h 12min",
};

function PainelScreen({ onBack, destravaData, versao }: { onBack:()=>void; destravaData:DestravaData|null; versao?:"v1"|"v2" }) {
  const [selecionada, setSelecionada] = useState<"concluida"|"ativacao"|null>(null);

  const fixedOverride = versao === "v1" ? ATIVACAO_V1 : versao === "v2" ? ATIVACAO_V2 : undefined;

  // nas versões congeladas (v1/v2) o nicho é sempre fixo — não usa dado real salvo do fluxo livre
  const emAtivacao: DestravaData = fixedOverride
    ? {
        active: true,
        username: "@lumacedo.ofc",
        nicho: "pets",
        tempo: "36h",
        volume: 160,
        activatedAt: Date.now() - 8 * 3600 * 1000,
      }
    : destravaData ?? {
        active: true,
        username: "@lumacedo.ofc",
        nicho: "moda",
        tempo: "36h",
        volume: 160,
        activatedAt: Date.now() - 8 * 3600 * 1000,
      };

  if (selecionada === "concluida") return <ContaConcluidaScreen conta={CONTA_CONCLUIDA} onBack={() => setSelecionada(null)} />;
  if (selecionada === "ativacao")  return <DestravaDashboard data={emAtivacao} onBack={() => setSelecionada(null)} fixedOverride={fixedOverride} />;

  const seguidoresEmAtivacao = fixedOverride?.seguidoresAtuais ?? 369;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-7 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }} onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Destrava TikTok Shop</p>
            <p className="font-extrabold text-[17px] text-foreground leading-tight">Painel de Contas</p>
          </div>
        </div>

        <div className="px-5 pb-14 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl px-4 py-4 relative overflow-hidden" style={{ background:CARD_DARK }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background:"radial-gradient(ellipse 80% 60% at 100% 0%, rgba(34,197,94,0.3) 0%, transparent 65%)" }} />
              <p className="relative text-white font-extrabold text-[1.7rem] leading-none">1</p>
              <p className="relative text-white/50 text-[11px] mt-1">conta concluída</p>
            </div>
            <div className="rounded-2xl px-4 py-4 relative overflow-hidden" style={{ background:CARD_DARK }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background:"radial-gradient(ellipse 80% 60% at 100% 0%, rgba(254,44,85,0.35) 0%, transparent 65%)" }} />
              <p className="relative font-extrabold text-[1.7rem] leading-none" style={{ color:P2 }}>1</p>
              <p className="relative text-white/50 text-[11px] mt-1">em ativação</p>
            </div>
          </div>

          <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase pt-1">Contas</p>
          <div className="space-y-2.5">
            <ContaListItem foto={CONTA_CONCLUIDA.foto} nome={CONTA_CONCLUIDA.nome} handle={CONTA_CONCLUIDA.handle}
              seguidores={CONTA_CONCLUIDA.seguidores} status="Concluído" statusColor="green"
              onClick={() => setSelecionada("concluida")} />
            <ContaListItem foto="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/iconperfil.jpeg" nome="lumacedo.ofc" handle={emAtivacao.username}
              seguidores={seguidoresEmAtivacao} status="Em ativação" statusColor="orange"
              onClick={() => setSelecionada("ativacao")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DestravaDashboard({ data, onBack, fixedOverride }: { data:DestravaData; onBack:()=>void; fixedOverride?:AtivacaoFixa }) {
  const horas     = TEMPO_OPTIONS.find(t => t.id === data.tempo)?.horas ?? 36;
  const elapsed   = Date.now() - data.activatedAt;
  const totalMs   = horas * 60 * 60 * 1000;
  const remaining = Math.max(0, totalMs - elapsed);
  const hoursLeft = Math.floor(remaining / (60 * 60 * 1000));
  const minsLeft  = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  const videosPosted   = fixedOverride ? fixedOverride.videosPostados : Math.min(data.volume, Math.floor((Math.min(1, elapsed / totalMs)) * data.volume));
  const faltamPostar   = data.volume - videosPosted;
  const seguidoresBase = 234;
  const seguidoresAtuais = fixedOverride ? fixedOverride.seguidoresAtuais : 369;
  const seguidoresGanhos = fixedOverride ? fixedOverride.seguidoresGanhos : 135;
  const publicacoesAtuais = fixedOverride ? fixedOverride.publicacoesAtuais : 6;
  const metaAlcancada  = fixedOverride?.metaAlcancada ?? false;
  const pct = metaAlcancada ? 100 : fixedOverride
    ? Math.min(99, Math.round((seguidoresAtuais / 1000) * 100))
    : Math.min(100, Math.round((elapsed / totalMs) * 100));
  const barraPct = metaAlcancada ? 100 : fixedOverride ? pct : Math.max(36.9, 36.9 + pct * 0.05);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-5 pt-7 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }} onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Destrava TikTok Shop</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background:"rgba(34,197,94,0.1)" }}>
            <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ repeat:Infinity, duration:1.5 }}
              className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-[11px] font-bold text-green-600">Ativo</span>
          </div>
        </div>

        <div className="px-5 pb-14 space-y-4">
          {/* Profile */}
          <div className="bg-white rounded-2xl px-4 py-4 flex items-center gap-4"
            style={{ boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
            <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/iconperfil.jpeg"
              alt="perfil" className="w-14 h-14 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[15px] text-foreground leading-none mb-0.5">{data.username}</p>
              <div className="flex items-center gap-1.5 mb-2">
                <TikTokIcon size={11} color="#000" />
                <p className="text-[11px] text-foreground/45">TikTok</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-extrabold">{seguidoresAtuais.toLocaleString("pt-BR")}</p>
                    <span className="text-[9px] font-bold text-green-500 flex items-center gap-0.5">
                      ↑+{seguidoresGanhos}
                    </span>
                  </div>
                  <p className="text-[9px] text-foreground/40">seguidores</p>
                </div>
                <div>
                  <p className="text-[13px] font-extrabold">{publicacoesAtuais}</p>
                  <p className="text-[9px] text-foreground/40">publicações</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status card */}
          <div className="rounded-2xl px-4 py-5 relative overflow-hidden" style={{ background:CARD_DARK }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: metaAlcancada
                ? "radial-gradient(ellipse 70% 50% at 80% 0%, rgba(34,197,94,0.3) 0%, transparent 70%)"
                : "radial-gradient(ellipse 70% 50% at 80% 0%, rgba(254,44,85,0.35) 0%, transparent 70%)" }} />
            <div className="relative">
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-[0.12em] mb-2">Progresso para o TikTok Shop</p>
              {metaAlcancada ? (
                <>
                  <p className="text-white font-extrabold text-[19px] leading-none mb-1">Meta de seguidores alcançada!</p>
                  <p className="text-white/50 text-[12px] mb-4">
                    Em <span className="text-white font-bold">{fixedOverride?.tempoDecorrido}</span>, faltam apenas <span className="text-white font-bold">{faltamPostar} vídeos</span> para concluir o plano
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white font-extrabold text-[19px] leading-none mb-1">{pct}% concluído</p>
                  <p className="text-white/50 text-[12px] mb-4">
                    Em até <span className="text-white font-bold">{hoursLeft}h {minsLeft}min</span> seu perfil estará pronto para o TikTok Shop
                  </p>
                </>
              )}
              {/* Barra começa em 234/1000 */}
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: metaAlcancada ? "#22C55E" : GRAD_BTN }}
                  initial={{ width:"36.9%" }}
                  animate={{ width:`${barraPct}%` }}
                  transition={{ duration:1.5, ease:"easeOut" }} />
              </div>
              <div className="flex justify-between mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-white/55 text-[9px] font-bold">{seguidoresAtuais.toLocaleString("pt-BR")}</span>
                  <span className="text-[9px] text-green-400 font-bold">↑</span>
                </div>
                <span className="text-white/35 text-[9px]">meta: 1.000</span>
              </div>
              <AtividadeDaIA videosPosted={videosPosted} volume={data.volume} proximoVideoMin={fixedOverride?.proximoVideoMin} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
              <p className="text-[2rem] font-extrabold" style={{ color:P }}>{videosPosted}</p>
              <p className="text-[11px] text-foreground/50">vídeos postados</p>
            </div>
            <div className="bg-white rounded-2xl px-4 py-4" style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.06)" }}>
              <p className="text-[2rem] font-extrabold text-foreground">{faltamPostar}</p>
              <p className="text-[11px] text-foreground/50">faltam postar</p>
            </div>
          </div>

          {/* Vídeos postados */}
          <UltimosPostadosSection nicho={data.nicho}
            max={fixedOverride ? Math.min(fixedOverride.videosPostados, 15) : 15}
            permitirVerMais={fixedOverride ? fixedOverride.videosPostados > 15 : true} />

          <button className="w-full py-3.5 rounded-2xl text-[13px] font-semibold text-foreground/40 border border-black/10 mt-2">
            Pausar plano
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DESTRAVA ACTIVATION SCREEN ──────────────────────────────────────────────

function PlanoAtivadoScreen({ volume, horas, onDone }: { volume:number; horas:number; onDone:()=>void }) {
  const [primeiraPostagemMin] = useState(() => 3 + Math.floor(Math.random() * 7));
  const [metaData] = useState(() => formatDataHora(new Date(Date.now() + horas * 3600 * 1000)));

  useEffect(() => {
    const t = setTimeout(onDone, 4500);
    return () => clearTimeout(t);
  }, [onDone]);

  const rows = [
    ["Vídeos programados", `${volume}`],
    ["Primeira postagem em", `${primeiraPostagemMin} min`],
    ["Meta: 1.000 seguidores até", metaData],
  ];

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: CARD_DARK }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:"radial-gradient(ellipse 70% 50% at 50% 45%, rgba(34,197,94,0.12) 0%, transparent 70%)" }} />

      <div className="relative flex flex-col items-center text-center gap-6 max-w-xs w-full">
        {/* Ícone de sucesso */}
        <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ type:"spring", stiffness:260, delay:0.1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background:"rgba(34,197,94,0.15)", border:"2px solid rgba(34,197,94,0.3)" }}>
          <Check className="w-9 h-9 text-green-400" strokeWidth={3} />
        </motion.div>

        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <p className="text-white font-extrabold text-[2rem] leading-[1.1] mb-2">
            Plano ativado!
          </p>
          <p className="text-white/50 text-[14px] leading-snug">
            Sua IA vai começar a trabalhar no seu perfil em instantes.
          </p>
        </motion.div>

        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          className="w-full bg-white/[0.06] rounded-2xl px-4 py-4 space-y-3">
          {rows.map(([k,v]) => (
            <div key={k} className="flex justify-between items-center gap-3">
              <span className="text-white/50 text-[12px] text-left">{k}</span>
              <span className="text-white text-[13px] font-bold text-right shrink-0">{v}</span>
            </div>
          ))}
        </motion.div>

        <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
          onClick={onDone}
          className="text-white/35 text-[12px] underline underline-offset-2 mt-1">
          Ir para o painel →
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function DestravaTikTokShop({ versao }: { versao?:"v1"|"v2" } = {}) {
  const [code, setCode]                 = useState<string|null>(() => sessionStorage.getItem("liveia_dts_code"));
  const [screen, setScreen]             = useState<Screen>("home");
  const [destravaData, setDestravaState] = useState<DestravaData|null>(() => {
    const c = sessionStorage.getItem("liveia_dts_code");
    return c ? loadDestravaData(c) : null;
  });
  const [showActivation, setShowActivation] = useState(false);

  function handleCode(c: string) {
    sessionStorage.setItem("liveia_dts_code", c);
    setCode(c);
    setDestravaState(loadDestravaData(c));
  }

  function nav(s: Screen) { setScreen(s); }
  function goHome()        { setScreen("home"); }

  function criarLiveComProduto() {
    setScreen("destrava");
  }

  function handleDestravaActivate(nicho: string, tempo: TempoId, volume: number) {
    const d: DestravaData = {
      active: true,
      username: "@lumacedo.ofc",
      nicho, tempo, volume,
      activatedAt: Date.now(),
    };
    if (code) saveDestravaData(code, d);
    setDestravaState(d);
    setShowActivation(true);
  }

  if (!code) return <CodeLoginScreen onCode={handleCode} />;
  if (showActivation && destravaData) {
    const horas = TEMPO_OPTIONS.find(t => t.id === destravaData.tempo)?.horas ?? 36;
    return (
      <AnimatePresence mode="wait">
        <PlanoAtivadoScreen key="activation" volume={destravaData.volume} horas={horas}
          onDone={() => { setShowActivation(false); goHome(); }} />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {screen === "home" && (
        <motion.div key="home" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <Home onNavigate={nav} />
        </motion.div>
      )}
      {screen === "destrava" && (
        <motion.div key="destrava" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          {destravaData?.active
            ? <DestravaDashboard data={destravaData} onBack={goHome} />
            : <DestravaFlow onBack={goHome} onActivate={handleDestravaActivate} />
          }
        </motion.div>
      )}
      {screen === "painel" && (
        <motion.div key="painel" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <PainelScreen onBack={goHome} destravaData={destravaData} versao={versao} />
        </motion.div>
      )}
      {screen === "pack" && (
        <motion.div key="pack" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <PackScreen onBack={goHome} />
        </motion.div>
      )}
      {screen === "produtos" && (
        <motion.div key="produtos" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <ProdutosScreen onBack={goHome} onCriarLive={criarLiveComProduto} />
        </motion.div>
      )}
      {screen === "treinamento" && (
        <motion.div key="treinamento" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <TreinamentoScreen onBack={goHome} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
