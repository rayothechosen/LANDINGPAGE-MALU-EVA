import { useEffect, useRef, useState } from "react";
import {
  Home, ChevronDown, ChevronRight, Bell, Video, Gift, Megaphone,
  ShoppingBag, LayoutGrid, BarChart3, GraduationCap, ShieldCheck,
  Maximize2, HelpCircle, Smile, Send, Plus, X, Clock,
  BadgePercent, Globe, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── Paleta TikTok Shop ──────────────────────────────────────────────────────
const RED   = "#FE2C55";
const CYAN  = "#00F6FF";
const DARK  = "#161823";

// ─── Navegação lateral ────────────────────────────────────────────────────────
interface NavItem { label: string; active?: boolean }
interface NavGroup { title: string; icon: typeof Video; items: NavItem[]; defaultOpen?: boolean }

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Ferramentas de LIVE", icon: Video, defaultOpen: true,
    items: [
      { label: "Eventos de LIVE" },
      { label: "Console de LIVE", active: true },
      { label: "Conjunto de produtos de LIVE" },
      { label: "Giveaway de LIVE" },
      { label: "Campanha de LIVE e vídeo curto" },
    ],
  },
  { title: "Vitrine", icon: LayoutGrid, items: [{ label: "Produtos da vitrine" }] },
  {
    title: "Análises", icon: BarChart3,
    items: [
      { label: "Visão geral de dados" },
      { label: "Análises de LIVE" },
      { label: "Análises de vídeo" },
      { label: "Análises de produtos" },
    ],
  },
  {
    title: "Academia Shop", icon: GraduationCap,
    items: [{ label: "Central de políticas" }, { label: "Cursos" }, { label: "Guia de recursos" }],
  },
  {
    title: "Saúde da conta", icon: ShieldCheck,
    items: [{ label: "Pontuação de seleção de produtos" }, { label: "Diagnóstico da conta" }],
  },
];

function SidebarGroup({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(!!group.defaultOpen);
  const Icon = group.icon;
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-black/[0.04] transition-colors text-left"
      >
        <Icon className="w-[18px] h-[18px] text-black/70 shrink-0" />
        <span className="flex-1 text-[13px] font-semibold text-black/80">{group.title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-black/40 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <div className="ml-[30px] border-l border-black/[0.06] pl-3 space-y-0.5 py-0.5">
          {group.items.map(item => (
            <div
              key={item.label}
              className="px-3 py-2 rounded-lg text-[12.5px] font-medium cursor-pointer transition-colors"
              style={item.active
                ? { background: "rgba(0,246,255,0.12)", color: "#00838f", fontWeight: 700 }
                : { color: "rgba(0,0,0,0.55)" }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="w-[260px] shrink-0 bg-white border-r border-black/[0.06] min-h-[calc(100vh-56px)] py-3 px-2">
      <div className="px-3 py-2.5 flex items-center gap-2.5 rounded-lg mb-1 cursor-pointer hover:bg-black/[0.04]">
        <Home className="w-[18px] h-[18px] text-black/70" />
        <span className="text-[13px] font-semibold text-black/80">Início</span>
      </div>
      {NAV_GROUPS.map(g => <SidebarGroup key={g.title} group={g} />)}
    </aside>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header className="h-14 shrink-0 bg-black flex items-center justify-between px-5 gap-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors mr-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <img
          src="https://pub-69ddd09562c34185a376f620c936f5db.r2.dev/tiktok%20logo%20esquerda%20supeior.png"
          alt="TikTok Shop"
          className="h-11 w-auto object-contain shrink-0"
        />
        <span className="text-white/25 text-[13px] mx-1">|</span>
        <span className="text-white/85 font-medium text-[14px]">Gerenciador de LIVE</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="font-bold text-[13px] text-white px-5 py-2 rounded-full transition-transform active:scale-95"
          style={{ background: RED, boxShadow: "0 2px 14px rgba(254,44,85,0.5)" }}
        >
          Transmitir ao vivo
        </button>
        <button className="relative text-white/70 hover:text-white transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: RED }} />
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          <img
            src="https://pub-69ddd09562c34185a376f620c936f5db.r2.dev/tikto%20logo%20direita%20ao%20lado%20do%20nome.png"
            alt=""
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
          <span className="text-white text-[13px] font-semibold">Marilia Shop</span>
        </div>
        <div className="flex items-center gap-1 text-white/70 text-[13px] cursor-pointer">
          <Globe className="w-3.5 h-3.5" />
          <span>Português</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>
    </header>
  );
}

// ─── Console de LIVE (coluna esquerda) ───────────────────────────────────────
const CONSOLE_TABS = [
  { id: "produto", label: "Produto", icon: ShoppingBag },
  { id: "cupom", label: "Cupom", icon: BadgePercent },
  { id: "giveaway", label: "Giveaway", icon: Gift },
  { id: "quadro", label: "Quadro de avisos", icon: Megaphone },
] as const;
type ConsoleTabId = typeof CONSOLE_TABS[number]["id"];

interface Coupon { id: string; origem: "vendedor" | "tiktok"; resgatados: string; valor: string; regra: string; validoDe: string; validoAte: string; }

const COUPONS: Coupon[] = [
  { id: "c1", origem: "vendedor", resgatados: "197.200", valor: "R$ 10 de desconto", regra: "em compras acima de R$ 100, máximo R$ 8 de desconto", validoDe: "15/07/2026", validoAte: "21/07/2026" },
  { id: "c2", origem: "vendedor", resgatados: "197.200", valor: "R$ 10 de desconto", regra: "em compras acima de R$ 100, máximo R$ 8 de desconto", validoDe: "15/07/2026", validoAte: "21/07/2026" },
  { id: "c3", origem: "tiktok", resgatados: "197.200", valor: "R$ 10 de desconto", regra: "em compras acima de R$ 100, máximo R$ 8 de desconto", validoDe: "15/07/2026", validoAte: "21/07/2026" },
];

const COUPON_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "vendedor", label: "Dos vendedores" },
  { id: "tiktok", label: "Do TikTok" },
] as const;
type CouponFilterId = typeof COUPON_FILTERS[number]["id"];

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [fixed, setFixed] = useState(true);
  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] px-4 py-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-semibold text-black/45">
          {coupon.origem === "vendedor" ? "Do vendedor" : "Do TikTok Shop"}
        </span>
        <span className="text-[11px] text-black/40">{coupon.resgatados} resgatados</span>
      </div>
      <p className="text-[16px] font-extrabold text-black leading-tight">{coupon.valor}</p>
      <p className="text-[12.5px] text-black/55 mt-1 leading-snug">{coupon.regra}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.05]">
        <p className="text-[11px] text-black/40">
          Válido de {coupon.validoDe} a {coupon.validoAte} &nbsp;|&nbsp; Resgatar de {coupon.validoDe} a {coupon.validoAte}
        </p>
        <button
          onClick={() => setFixed(v => !v)}
          className="shrink-0 ml-3 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-colors"
          style={fixed
            ? { background: "rgba(0,131,143,0.1)", color: "#00838f" }
            : { background: "#f0f0f0", color: "rgba(0,0,0,0.5)" }}
        >
          {fixed ? "Desafixar" : "Fixar"}
        </button>
      </div>
    </div>
  );
}

function ConsolePanel() {
  const [tab, setTab] = useState<ConsoleTabId>("cupom");
  const [filter, setFilter] = useState<CouponFilterId>("todos");
  const [horarioInicio] = useState(() => formatDataHoraAtual());
  const filtered = COUPONS.filter(c => filter === "todos" || c.origem === filter);

  return (
    <div className="w-[380px] shrink-0 border-r border-black/[0.06] flex flex-col">
      <div className="px-5 pt-5 pb-1">
        <p className="text-[17px] font-extrabold text-black">Console de LIVE</p>
        <p className="text-[12px] text-black/45 mt-0.5">Horário de início: {horarioInicio}</p>
      </div>

      <div className="flex px-5 pt-4 gap-1.5">
        {CONSOLE_TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-colors"
              style={active ? { background: "black", color: "white" } : { color: "rgba(0,0,0,0.5)" }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10.5px] font-semibold text-center leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {tab === "cupom" ? (
          <>
            <div className="flex items-center justify-between pt-4 pb-1">
              <span className="font-extrabold text-[15px]">Cupom de LIVE</span>
              <button
                className="flex items-center gap-1 text-[12.5px] font-bold px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/[0.03] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Criar
              </button>
            </div>
            <div className="flex gap-4 pb-3 pt-1 border-b border-black/[0.06] mb-1">
              {COUPON_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className="text-[12.5px] font-semibold pb-1.5 transition-colors"
                  style={filter === f.id ? { color: "black", borderBottom: "2px solid black" } : { color: "rgba(0,0,0,0.4)" }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-[11.5px] text-black/45 py-2">
              Você pode retirar ou excluir os cupons na <span className="font-semibold" style={{ color: "#00838f" }}>Central do Vendedor</span>.
            </p>
            <div className="space-y-3 pt-1">
              {filtered.map(c => <CouponCard key={c.id} coupon={c} />)}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center">
              {(() => { const Icon = CONSOLE_TABS.find(t => t.id === tab)!.icon; return <Icon className="w-5 h-5 text-black/30" />; })()}
            </div>
            <p className="text-[13px] text-black/40 max-w-[220px]">
              Demonstração — conteúdo de "{CONSOLE_TABS.find(t => t.id === tab)!.label}" disponível na versão completa.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Live preview + chat (coluna central) ────────────────────────────────────
interface ProdutoLive {
  video: string; img: string; nome: string; preco: string; precoNum: number; precoOriginal: string; rating: string; vendidos: string;
  taxaComissao: number;
  gmvInicial: number;
  cliquesInicial: number;
  impressoesInicial: number;
  viewersInicial: number;
  duracaoInicial: number;
  encerraNoSegundo?: number; // se definido, a live encerra sozinha ao atingir esse tempo
}

const PRODUTO_VARIANTS: Record<string, ProdutoLive> = {
  camisa: {
    video: "https://pub-69ddd09562c34185a376f620c936f5db.r2.dev/camisa.mp4",
    img: "https://pub-69ddd09562c34185a376f620c936f5db.r2.dev/camisa.png",
    nome: "Camisa Brasil Feminina Tamanho Único",
    preco: "R$ 29,03",
    precoNum: 29.03,
    precoOriginal: "R$ 59,90",
    rating: "6.6",
    vendidos: "2.529 vendidos",
    taxaComissao: 0.04,
    gmvInicial: 2903.00,
    cliquesInicial: 528,
    impressoesInicial: 22100,
    viewersInicial: 50,
    duracaoInicial: 33 * 60 + 34,
  },
  mochila: {
    video: "https://pub-69ddd09562c34185a376f620c936f5db.r2.dev/mochila.mp4",
    img: "https://pub-69ddd09562c34185a376f620c936f5db.r2.dev/mochila.png",
    nome: "Mochila Militar 30L Impermeável Reforçada Masculina Assault",
    preco: "R$ 89,90",
    precoNum: 89.90,
    precoOriginal: "R$ 149,90",
    rating: "6.5",
    vendidos: "1.908 vendidos",
    taxaComissao: 0.07,
    gmvInicial: 4674.80, // 52 vendas × R$89,90 → comissão final ≈ R$327,24
    cliquesInicial: 1221,
    impressoesInicial: 102500,
    viewersInicial: 38,
    duracaoInicial: 1 * 3600 + 59 * 60 + 52,
    encerraNoSegundo: 2 * 3600,
  },
  dorama: {
    video: "https://pub-69ddd09562c34185a376f620c936f5db.r2.dev/TikSave.io_7602272250087132437-hd.mp4",
    img: "https://pub-69ddd09562c34185a376f620c936f5db.r2.dev/images%20(1).jpg",
    nome: "Mochila Feminina Escolar Doramas",
    preco: "R$ 41,05",
    precoNum: 41.05,
    precoOriginal: "R$ 91,99",
    rating: "6.3",
    vendidos: "1.999 vendidos",
    taxaComissao: 0.06,
    gmvInicial: 882.00, // comissão final = 882 × 6% = R$52,92
    cliquesInicial: 214,
    impressoesInicial: 16400,
    viewersInicial: 22,
    duracaoInicial: 59 * 60 + 52,
  },
};

function formatTimer(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
}

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCompactBRL(n: number) {
  if (n >= 1000) return `R$ ${(n / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil`;
  return formatBRL(n);
}

function formatCompactNumber(n: number) {
  if (n >= 1000) return `${(n / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil`;
  return String(Math.round(n));
}

function formatDataHoraAtual() {
  const d = new Date();
  const data = d.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${data}, ${hora}`;
}

const CHAT_SEED = [
  { user: "LEALU", tag: "N°1", msg: "Sim, o que tá mostrando é tal camisnda!" },
  { user: "SuavaNaOnda", msg: "Faz um live 10 13" },
  { user: "Brisa Nares Lima", msg: "quero 5 peças" },
  { user: "LEALU", tag: "N°1", msg: "amei" },
  { user: "Orvilei", msg: "muito bom, do 40 10" },
  { user: "João Carlos Lima", msg: "entrega rápida" },
  { user: "Bia", tag: "★", msg: "dá de amarelo!" },
  { user: "Julia Costa de lima", msg: "entrega para mim" },
];

const CHAT_POOL = [
  "quero comprar 2!", "chegou rapidinho o meu", "tem no tamanho M?", "amei a qualidade",
  "quanto custa o frete?", "vou pedir agora", "adorei o modelo", "tem outras cores?",
  "comprei semana passada, top", "faz combo com outra peça?",
];

function ChatMessage({ user, tag, msg }: { user: string; tag?: string; msg: string }) {
  return (
    <div className="py-1.5">
      <p className="text-[12px] leading-snug">
        <span className="font-bold text-black/80">{user}</span>
        {tag && (
          <span className="ml-1.5 text-[9px] font-extrabold text-white px-1.5 py-[1px] rounded"
            style={{ background: RED }}>{tag}</span>
        )}
      </p>
      <p className="text-[12.5px] text-black/70 leading-snug">{msg}</p>
    </div>
  );
}

interface LiveState { elapsed: number; gmv: number; comissao: number; viewers: number; cliques: number; impressoes: number; vendasCount: number; ended: boolean; pulse: boolean; }

// Estado único da simulação — o cronômetro dita quando a live encerra,
// e o GMV é a fonte da verdade para o número de vendas e a comissão.
function useLiveSimulation(produto: ProdutoLive): LiveState {
  const [elapsed, setElapsed] = useState(produto.duracaoInicial);
  const [gmv, setGmv] = useState(produto.gmvInicial);
  const [viewers, setViewers] = useState(produto.viewersInicial);
  const [cliques, setCliques] = useState(produto.cliquesInicial);
  const [impressoes, setImpressoes] = useState(produto.impressoesInicial);
  const [ended, setEnded] = useState(false);
  const [pulse, setPulse] = useState(false);

  // reinicia o roteiro sempre que a variante da live mudar
  useEffect(() => {
    setElapsed(produto.duracaoInicial);
    setGmv(produto.gmvInicial);
    setViewers(produto.viewersInicial);
    setCliques(produto.cliquesInicial);
    setImpressoes(produto.impressoesInicial);
    setEnded(false);
  }, [produto]);

  // cronômetro — encerra sozinho ao atingir o tempo alvo, se a variante tiver um
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (produto.encerraNoSegundo != null && next >= produto.encerraNoSegundo) {
          setEnded(true);
          return produto.encerraNoSegundo;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [ended, produto]);

  // venda única 5s após carregar — só para variantes que não encerram sozinhas
  useEffect(() => {
    if (produto.encerraNoSegundo != null) return;
    const t = setTimeout(() => {
      setGmv(v => v + produto.precoNum);
      setPulse(true);
      setTimeout(() => setPulse(false), 900);
    }, 5000);
    return () => clearTimeout(t);
  }, [produto]);

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setViewers(v => Math.max(10, v - Math.round(Math.random() * 2))), 3000);
    return () => clearInterval(t);
  }, [ended, produto]);

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setCliques(c => c + 1 + Math.round(Math.random() * 2)), 4500);
    return () => clearInterval(t);
  }, [ended, produto]);

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setImpressoes(v => v + 50 + Math.round(Math.random() * 100)), 5000);
    return () => clearInterval(t);
  }, [ended, produto]);

  const comissao = gmv * produto.taxaComissao;
  const vendasCount = Math.max(1, Math.round(gmv / produto.precoNum));

  return { elapsed, gmv, comissao, viewers, cliques, impressoes, vendasCount, ended, pulse };
}

function LiveAndChat({ produto, elapsed, ended }: { produto: ProdutoLive; elapsed: number; ended: boolean }) {
  const [chatTab, setChatTab] = useState<"todos" | "produto">("todos");
  const [messages, setMessages] = useState(CHAT_SEED);
  const [pinned, setPinned] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // reinicia o chat sempre que a variante da live mudar
  useEffect(() => {
    setMessages(CHAT_SEED);
  }, [produto]);

  useEffect(() => {
    if (ended) { videoRef.current?.pause(); return; }
    videoRef.current?.play().catch(() => {});
  }, [ended]);

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => {
      const names = ["Rafa Souza", "Camila_", "PedroLuz", "Marina Alves", "GuGu.oficial"];
      const name = names[Math.floor(Math.random() * names.length)];
      const msg = CHAT_POOL[Math.floor(Math.random() * CHAT_POOL.length)];
      setMessages(prev => [...prev.slice(-24), { user: name, msg }]);
    }, 3200);
    return () => clearInterval(t);
  }, [ended, produto]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-[400px] shrink-0 border-r border-black/[0.06] flex flex-col px-5 py-5 gap-4">
      {/* Live video */}
      <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "4/5" }}>
        <video
          key={produto.video}
          ref={videoRef}
          src={produto.video}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          controlsList="nodownload noplaybackrate nofullscreen"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {ended && (
          <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-2 z-10">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
              <Video className="w-5 h-5 text-white/80" />
            </div>
            <p className="text-white font-bold text-[13px]">Transmissão encerrada</p>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
          <span className="flex items-center gap-1 text-white text-[11px] font-extrabold px-2 py-[3px] rounded"
            style={{ background: ended ? "#6b6b6b" : RED }}>{ended ? "ENCERRADA" : "LIVE"}</span>
          <span className="flex items-center gap-1 text-white text-[11px] font-semibold bg-black/40 px-2 py-[3px] rounded">
            <Clock className="w-3 h-3" /> {formatTimer(elapsed)}
          </span>
        </div>
        <button className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center z-20">
          <Maximize2 className="w-3.5 h-3.5 text-white" />
        </button>

        {/* Product overlay */}
        <div className="absolute left-2.5 right-2.5 bottom-2.5 bg-white/95 backdrop-blur rounded-xl px-2.5 py-2 flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-lg shrink-0 relative overflow-hidden">
            <img src={produto.img} alt={produto.nome} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold text-white bg-black/30 leading-tight">{produto.rating}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-black leading-tight line-clamp-1">{produto.nome}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[12px] font-extrabold text-black">{produto.preco}</span>
              <span className="text-[10px] text-black/40 line-through">{produto.precoOriginal}</span>
            </div>
            <p className="text-[9.5px] font-semibold mt-0.5" style={{ color: RED }}>⚡ Oferta Relâmpago | 01:41:35</p>
            <p className="text-[9px] text-black/40">{produto.vendidos}</p>
          </div>
          <button
            onClick={() => setPinned(v => !v)}
            className="shrink-0 px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold"
            style={{ background: pinned ? "#161823" : "#f0f0f0", color: pinned ? "white" : "rgba(0,0,0,0.5)" }}
          >
            {pinned ? "Desafixar" : "Fixar"}
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-extrabold text-[14px]">Chat</span>
          <div className="flex items-center gap-2 text-black/40">
            <button className="text-[11px] font-bold px-1">A-</button>
            <button className="text-[11px] font-bold px-1">A+</button>
            <Smile className="w-4 h-4" />
          </div>
        </div>
        <div className="flex gap-4 border-b border-black/[0.06] pb-2 mb-1">
          {[{ id: "todos" as const, label: "Todos os comentários" }, { id: "produto" as const, label: "Relacionados ao produto" }].map(t => (
            <button key={t.id} onClick={() => setChatTab(t.id)}
              className="text-[12px] font-semibold pb-1 transition-colors"
              style={chatTab === t.id ? { color: "black", borderBottom: "2px solid black" } : { color: "rgba(0,0,0,0.4)" }}>
              {t.label}
            </button>
          ))}
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto min-h-[160px] max-h-[260px] pr-1">
          {messages.map((m, i) => <ChatMessage key={i} {...m} />)}
        </div>
        <div className="flex items-center gap-2 bg-black/[0.04] rounded-full px-3 py-2 mt-2">
          <Smile className="w-4 h-4 text-black/35 shrink-0" />
          <input placeholder="Adicionar comentário..." className="flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-black/35" />
          <button className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: RED }}>
            <Send className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Análises de LIVE (coluna direita) ───────────────────────────────────────
// O GMV é a fonte da verdade: número de vendas = GMV / preço do produto,
// e a comissão estimada = GMV × taxa de comissão da variante.
function StatBlock({ label, value, pulse }: { label: string; value: string; pulse?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-black/45 mb-1">{label}</p>
      <p
        className="text-[16px] font-extrabold transition-all duration-500 inline-block origin-left"
        style={pulse ? { color: "#00838f", transform: "scale(1.14)" } : { color: "black", transform: "scale(1)" }}
      >
        {value}
      </p>
    </div>
  );
}

function AnalyticsPanel({ produto, gmv, comissao, viewers, cliques, impressoes, vendasCount, pulse }: {
  produto: ProdutoLive; gmv: number; comissao: number; viewers: number; cliques: number; impressoes: number; vendasCount: number; pulse: boolean;
}) {
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="flex-1 flex flex-col px-5 py-5 min-w-[300px]">
      <div className="flex items-center justify-between mb-4">
        <span className="font-extrabold text-[15px]">Análises de LIVE</span>
        <div className="flex items-center gap-3 text-black/35">
          <Maximize2 className="w-3.5 h-3.5" />
          <Smile className="w-3.5 h-3.5" />
          <HelpCircle className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-y-4 gap-x-2 pb-5 border-b border-black/[0.06]">
        <StatBlock label="GMV (Líquido)" value={formatCompactBRL(gmv)} pulse={pulse} />
        <StatBlock label="Current viewers" value={String(viewers)} />
        <StatBlock label="Impressões LIVE" value={formatCompactNumber(impressoes)} />
        <StatBlock label="Comissões est." value={formatBRL(comissao)} pulse={pulse} />
        <StatBlock label="Duração média de..." value="10s" />
        <StatBlock label="Cliques no produto" value={cliques.toLocaleString("pt-BR")} />
      </div>

      <div className="pt-4 flex-1 min-h-0 flex flex-col">
        <span className="font-extrabold text-[14px] mb-2">Atividade</span>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {Array.from({ length: vendasCount }, (_, i) => vendasCount - i).map((n, i) => (
            <div key={n} className={`flex items-center gap-3 rounded-lg transition-colors duration-700 ${i === 0 && pulse ? "bg-[#00838f]/10" : ""}`}>
              <div className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 text-black/50" />
              </div>
              <p className="flex-1 text-[12px] text-black/70">1 cliente comprou o produto n° 1</p>
              <span className="text-[12px] font-bold shrink-0">{formatBRL(produto.precoNum)}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowCart(v => !v)}
          className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.06] w-full"
        >
          <span className="text-[12.5px] font-semibold text-black/70">Adicionar ao carrinho</span>
          <ChevronDown className={`w-4 h-4 text-black/40 transition-transform ${showCart ? "rotate-180" : ""}`} />
        </button>
        {showCart && (
          <p className="text-[11.5px] text-black/40 pt-2">
            Demonstração — detalhamento de carrinho disponível na versão completa.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Resultados da LIVE (popup ao encerrar) ──────────────────────────────────
function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/[0.03] rounded-2xl px-3 py-3">
      <p className="text-[10px] text-black/45 mb-1">{label}</p>
      <p className="text-[15px] font-extrabold text-black">{value}</p>
    </div>
  );
}

function ResultsModal({ live, onClose }: { live: LiveState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
          <X className="w-4 h-4 text-black/50" />
        </button>
        <div className="flex flex-col items-center text-center mb-5">
          <img
            src="https://pub-69ddd09562c34185a376f620c936f5db.r2.dev/ca499019-e3de-428d-88bb-d0341eedd903.png"
            alt="TikTok Shop"
            className="h-12 w-auto object-contain mb-3"
          />
          <p className="font-extrabold text-[19px]">Resultados da LIVE</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="Duração total" value={formatTimer(live.elapsed)} />
          <ResultStat label="GMV (Líquido)" value={formatCompactBRL(live.gmv)} />
          <ResultStat label="Comissão estimada" value={formatBRL(live.comissao)} />
          <ResultStat label="Vendas" value={String(live.vendasCount)} />
          <ResultStat label="Cliques no produto" value={live.cliques.toLocaleString("pt-BR")} />
          <ResultStat label="Impressões" value={formatCompactNumber(live.impressoes)} />
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-2xl font-bold text-white text-[13px] transition-transform active:scale-[0.98]"
          style={{ background: "#161823" }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function GerenciadorLive({ variant = "camisa" }: { variant?: keyof typeof PRODUTO_VARIANTS }) {
  const produto = PRODUTO_VARIANTS[variant] ?? PRODUTO_VARIANTS.camisa;
  const live = useLiveSimulation(produto);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [produto]);

  const showResults = live.ended && !dismissed;

  return (
    <div className="min-w-[1360px] min-h-screen bg-[#f7f7f8] text-black" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <TopBar />
      <div className="flex">
        <Sidebar />
        <div className="flex flex-1">
          <ConsolePanel />
          <LiveAndChat produto={produto} elapsed={live.elapsed} ended={live.ended} />
          <AnalyticsPanel
            produto={produto}
            gmv={live.gmv}
            comissao={live.comissao}
            viewers={live.viewers}
            cliques={live.cliques}
            impressoes={live.impressoes}
            vendasCount={live.vendasCount}
            pulse={live.pulse}
          />
        </div>
      </div>
      {showResults && (
        <ResultsModal live={live} onClose={() => setDismissed(true)} />
      )}
    </div>
  );
}
