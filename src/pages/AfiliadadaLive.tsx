import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft, ArrowUpRight, ChevronRight, ChevronDown, Check,
  Zap, Clock, Film, TrendingUp, GraduationCap, BookOpen,
  Loader2, Video, Star, ExternalLink, Copy, Search, Play, Download,
  Images, LayoutGrid, Eye, X, Info, Layers, ImageIcon, AlertCircle,
  Package, ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

// ─── Constants ────────────────────────────────────────────────────────────────
const R2S  = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/shopee";
const LOGO = `${R2S}/logo.png`;
const P    = "hsl(14,100%,52%)";
const GRAD = "linear-gradient(135deg, hsl(14,100%,52%) 0%, hsl(24,100%,55%) 100%)";
const GLOW = "0 4px 24px hsl(14 100% 52% / 0.42)";
const DARK = "#161616";
const VID_PAGE = 30;
const CS_PAGE  = 20;

const fluxoImg  = (n: string) => `${R2S}/liveia%20fluxo%20produto${n}.PNG`;
const previaImg = (n: string) => `${R2S}/shopee%20previa%20produto%20${n}.png`;
const prodImg   = (n: string) => `${R2S}/liveia%20previa%20produto${n}.png`;

const AULAS_SHOPEE = [
  { num:"01", titulo:"Como criar sua primeira live na Shopee",  desc:"Configure tudo em menos de 10 minutos e comece a vender.", duracao:"28min", nivel:"Iniciante",     aulas:4 },
  { num:"02", titulo:"Produtos que mais vendem em live",        desc:"Os nichos e estratégias com maior taxa de conversão.",    duracao:"41min", nivel:"Iniciante",     aulas:5 },
  { num:"03", titulo:"IA de apresentador: guia completo",       desc:"Personalize seu apresentador virtual passo a passo.",     duracao:"35min", nivel:"Intermediário", aulas:6 },
  { num:"04", titulo:"Destrava Shopee Live — perfil do zero",   desc:"Como liberar o live shopping em contas novas.",           duracao:"22min", nivel:"Iniciante",     aulas:3 },
];

const CS_CHIPS = ["Todos","Pet","Eletronicos","Kids / Maternidade","Casa e Decoracao","Moda e Beleza","Diversos"];

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "home" | "live" | "pack" | "carrossei" | "stories" | "produtos" | "treinamento";

interface ProdutoLive  { id:string; nome:string; preco:string; desconto:string; img:string; }
interface Nicho        { nicho:string; total:number; }
interface VideoItem    { message_id:string; nicho:string; link_shopee:string|null; link_video:string|null; r2_key:string|null; topico_original:string|null; arquivo_local:string|null; data_telegram:string|null; }
interface CreativeAsset { id:string; creative_set_id:string; position:number; image_url:string; r2_key:string; original_filename:string|null; created_at:string; }
interface CreativeSet   { id:string; type:string; category:string|null; product_url:string|null; product_name:string|null; r2_folder:string|null; is_active:boolean; created_at:string; creative_assets:CreativeAsset[]; }
interface ProdutoExtra  { id:string; nome:string; nicho:string|null; link_shopee:string|null; imagem_url:string|null; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const PRODUTOS_LIVE: ProdutoLive[] = [
  { id:"01", nome:"Conjunto Fitness Premium",     preco:"R$ 67,90",  desconto:"-52%", img:fluxoImg("01") },
  { id:"02", nome:"Kit Skincare Anti-idade",       preco:"R$ 89,90",  desconto:"-38%", img:fluxoImg("02") },
  { id:"03", nome:"Hidratante Nutritivo Corporal", preco:"R$ 34,90",  desconto:"-45%", img:fluxoImg("03") },
  { id:"04", nome:"Perfume Importado 100ml",       preco:"R$ 119,90", desconto:"-40%", img:fluxoImg("04") },
];

const PRODUTOS_ALTA = [
  { id:"01", nome:"Conjunto Fitness Premium",     preco:"R$ 67,90",  precoOrig:"R$ 139,90", desconto:"-52%", badge:"EM ALTA",  rating:5.0, img:prodImg("01"), link:"https://shopee.com.br" },
  { id:"02", nome:"Kit Skincare Anti-idade",       preco:"R$ 89,90",  precoOrig:"R$ 149,90", desconto:"-40%", badge:"DESTAQUE", rating:4.9, img:prodImg("02"), link:"https://shopee.com.br" },
  { id:"03", nome:"Hidratante Nutritivo Corporal", preco:"R$ 34,90",  precoOrig:"R$ 63,00",  desconto:"-45%", badge:"POPULAR",  rating:4.8, img:prodImg("03"), link:"https://shopee.com.br" },
  { id:"04", nome:"Perfume Importado 100ml",       preco:"R$ 119,90", precoOrig:"R$ 199,90", desconto:"-40%", badge:"TOP",      rating:5.0, img:prodImg("04"), link:"https://shopee.com.br" },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────
function PrimaryBtn({ children, onClick, disabled }: { children:React.ReactNode; onClick:()=>void; disabled?:boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-4 rounded-2xl text-white font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
      style={{ background:GRAD, boxShadow:GLOW }}>
      {children}
    </button>
  );
}

function TopBar({ title, onBack }: { title:string; onBack:()=>void }) {
  return (
    <div className="max-w-md mx-auto px-5 pt-7 pb-3 flex items-center gap-3">
      <button onClick={onBack}
        className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform shrink-0"
        style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
        <ArrowLeft className="w-4 h-4 text-foreground/60" />
      </button>
      <p className="font-bold text-[15px] text-foreground">{title}</p>
    </div>
  );
}

function StepBar({ step, total }: { step:number; total:number }) {
  return (
    <div className="flex gap-1.5 px-5 mb-6">
      {Array.from({ length:total }).map((_,i) => (
        <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden bg-foreground/10">
          <motion.div className="h-full rounded-full" style={{ background:GRAD }}
            animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration:0.4 }} />
        </div>
      ))}
    </div>
  );
}

function Divider() {
  return <div className="w-10 h-[3px] rounded-full mt-3 mb-1" style={{ background:P }} />;
}

function PillSelect({ label, options, value, onChange }: { label:string; options:{id:string;label:string}[]; value:string; onChange:(v:string)=>void }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-foreground/40 mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)}
            className="px-4 py-2 rounded-full text-[12px] font-bold transition-all active:scale-95"
            style={{ background:value===o.id ? P : "white", color:value===o.id ? "white" : "rgba(0,0,0,0.55)", boxShadow:value===o.id ? GLOW : "0 1px 4px rgba(0,0,0,0.07)" }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Pack: VideoModal ─────────────────────────────────────────────────────────
function VideoModal({ video, onClose }: { video:VideoItem; onClose:()=>void }) {
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    if (!video.link_shopee) return;
    await navigator.clipboard.writeText(video.link_shopee);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const baixar = () => {
    if (!video.link_video) return;
    const a = document.createElement("a"); a.href = video.link_video;
    a.download = `video-${video.message_id}.mp4`; a.target = "_blank"; a.click();
  };
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}>
      <motion.div className="bg-card rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
        transition={{ type:"spring", damping:25, stiffness:300 }} onClick={e => e.stopPropagation()}>
        <div className="relative bg-black w-full aspect-video flex items-center justify-center">
          {video.link_video
            ? <video src={video.link_video} controls playsInline className="w-full h-full object-contain" />
            : <div className="flex flex-col items-center gap-2 text-white/40"><Play className="w-10 h-10" /><span className="text-xs">Vídeo não disponível</span></div>}
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm font-semibold text-foreground">Vídeo pronto para divulgação</p>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Código #{video.message_id}</p>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-2">
              <button onClick={baixar} disabled={!video.link_video}
                className="flex-1 flex items-center justify-center gap-1.5 bg-muted text-foreground text-xs font-semibold py-2.5 rounded-2xl disabled:opacity-40">
                <Download className="w-3.5 h-3.5" /> Baixar vídeo
              </button>
              <button onClick={() => video.link_shopee && window.open(video.link_shopee,"_blank")} disabled={!video.link_shopee}
                className="flex-1 flex items-center justify-center gap-1.5 bg-muted text-foreground text-xs font-semibold py-2.5 rounded-2xl disabled:opacity-40">
                <ExternalLink className="w-3.5 h-3.5" /> Ver produto
              </button>
            </div>
            <button onClick={copyLink} disabled={!video.link_shopee}
              className="w-full flex items-center justify-center gap-1.5 text-white text-xs font-semibold py-2.5 rounded-2xl disabled:opacity-40"
              style={{ background:P }}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar link Shopee</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Pack: VideoCard ──────────────────────────────────────────────────────────
function VideoCard({ video, onPlay }: { video:VideoItem; onPlay:(v:VideoItem)=>void }) {
  const [copied, setCopied] = useState(false);
  const [vidErr, setVidErr] = useState(false);
  const copyLink = async (e:React.MouseEvent) => {
    e.stopPropagation();
    if (!video.link_shopee) return;
    await navigator.clipboard.writeText(video.link_shopee);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const baixar = (e:React.MouseEvent) => {
    e.stopPropagation();
    if (!video.link_video) return;
    const a = document.createElement("a"); a.href = video.link_video;
    a.download = `video-${video.message_id}.mp4`; a.target = "_blank"; a.click();
  };
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden flex flex-col">
      <button onClick={() => onPlay(video)} className="relative w-full aspect-[9/16] bg-muted overflow-hidden group">
        {video.link_video && !vidErr
          ? <video src={video.link_video} muted playsInline preload="metadata" onError={() => setVidErr(true)} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60"><Play className="w-8 h-8 text-muted-foreground/30" /></div>}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ background:P }}>
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>
      </button>
      <div className="p-3 flex flex-col gap-2">
        <p className="text-xs font-semibold text-foreground leading-snug">Vídeo pronto para divulgação</p>
        <p className="text-[10px] text-muted-foreground font-mono">Código #{video.message_id}</p>
        {video.topico_original && <p className="text-[10px] text-muted-foreground/60 leading-snug line-clamp-2">{video.topico_original}</p>}
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          <button onClick={() => onPlay(video)} className="flex items-center justify-center gap-1 text-white text-[10px] font-bold py-1.5 rounded-xl" style={{ background:P }}>
            <Play className="w-3 h-3 fill-white" /> Assistir
          </button>
          <button onClick={baixar} disabled={!video.link_video} className="flex items-center justify-center gap-1 bg-muted text-foreground text-[10px] font-bold py-1.5 rounded-xl disabled:opacity-40">
            <Download className="w-3 h-3" /> Baixar
          </button>
          <button onClick={e => { e.stopPropagation(); video.link_shopee && window.open(video.link_shopee,"_blank"); }} disabled={!video.link_shopee}
            className="flex items-center justify-center gap-1 bg-muted text-foreground text-[10px] font-bold py-1.5 rounded-xl disabled:opacity-40">
            <ExternalLink className="w-3 h-3" /> Ver produto
          </button>
          <button onClick={copyLink} disabled={!video.link_shopee} className="flex items-center justify-center gap-1 bg-muted text-foreground text-[10px] font-bold py-1.5 rounded-xl disabled:opacity-40">
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pack: NichosView / VideosView ────────────────────────────────────────────
function NichosView({ onSelect }: { onSelect:(nicho:string,total:number)=>void }) {
  const [nichos, setNichos] = useState<Nicho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  useEffect(() => {
    supabase.rpc("get_nichos_videos").then(({ data, error:err }) => {
      if (err) setError("Erro ao carregar nichos.");
      else setNichos((data as Nicho[]) ?? []);
      setLoading(false);
    });
  }, []);
  return (
    <div className="px-5 pb-10">
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        className="glass-card p-5 mb-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          <p className="text-3xl font-extrabold text-foreground">7.000+</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">vídeos disponíveis</p>
      </motion.div>
      {loading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      {error && <p className="text-center text-sm text-destructive py-6">{error}</p>}
      {!loading && !error && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay:0.1 }} className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Escolha um nicho</p>
          {nichos.map((n,i) => (
            <motion.button key={n.nicho} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.05*i }}
              onClick={() => onSelect(n.nicho, Number(n.total))}
              className="w-full flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5 hover:shadow-card-hover hover:border-primary/30 transition-all text-left group">
              <div>
                <p className="font-semibold text-foreground text-sm">{n.nicho}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{Number(n.total).toLocaleString("pt-BR")} vídeos</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function VideosView({ nicho, total, onBack }: { nicho:string; total:number; onBack:()=>void }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [activeVideo, setActiveVideo] = useState<VideoItem|null>(null);

  const fetchVideos = useCallback(async (pageIndex:number, searchTerm:string) => {
    const from = pageIndex * VID_PAGE, to = from + VID_PAGE - 1;
    let q = supabase.from("videos_achadinhos")
      .select("message_id,nicho,link_shopee,link_video,r2_key,topico_original,arquivo_local,data_telegram")
      .eq("nicho", nicho).order("message_id", { ascending:false }).range(from, to);
    if (searchTerm.trim()) q = q.ilike("topico_original", `%${searchTerm.trim()}%`);
    const { data, error } = await q;
    if (error) return [];
    return (data as VideoItem[]) ?? [];
  }, [nicho]);

  useEffect(() => {
    setVideos([]); setPage(0); setHasMore(true);
    const load = async () => {
      setLoading(true);
      const data = await fetchVideos(0, search);
      setVideos(data); setHasMore(data.length === VID_PAGE); setLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nicho, search]);

  const loadMore = async () => {
    const next = page + 1; setLoadingMore(true);
    const data = await fetchVideos(next, search);
    setVideos(prev => [...prev, ...data]); setHasMore(data.length === VID_PAGE); setPage(next); setLoadingMore(false);
  };

  return (
    <>
      <div className="px-5 pb-10">
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} className="glass-card p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{total.toLocaleString("pt-BR")}</span> vídeos disponíveis</p>
            <button onClick={onBack} className="text-xs font-semibold text-primary flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Nichos
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar vídeo..."
              className="w-full bg-background border border-border rounded-2xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </motion.div>
        {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          : videos.length === 0 ? <p className="text-center text-sm text-muted-foreground py-10">Nenhum vídeo encontrado.</p>
          : <>
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="grid grid-cols-2 gap-3">
                {videos.map(v => <VideoCard key={v.message_id} video={v} onPlay={setActiveVideo} />)}
              </motion.div>
              {hasMore && (
                <button onClick={loadMore} disabled={loadingMore}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-semibold py-3 rounded-2xl disabled:opacity-60">
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loadingMore ? "Carregando..." : "Carregar mais"}
                </button>
              )}
            </>}
      </div>
      <AnimatePresence>
        {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
      </AnimatePresence>
    </>
  );
}

function PackScreen({ onBack }: { onBack:()=>void }) {
  const [sel, setSel] = useState<{nicho:string;total:number}|null>(null);
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <TopBar title={sel ? sel.nicho : "Pack +7.000 Vídeos"} onBack={sel ? () => setSel(null) : onBack} />
        <AnimatePresence mode="wait">
          {!sel
            ? <motion.div key="nichos" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}><NichosView onSelect={(n,t) => setSel({nicho:n,total:t})} /></motion.div>
            : <motion.div key="videos" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}><VideosView nicho={sel.nicho} total={sel.total} onBack={() => setSel(null)} /></motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Carrosséis: Modal + Card + Screen ───────────────────────────────────────
function CarouselPreviewModal({ set, showDownloadHint, onClose }: { set:CreativeSet; showDownloadHint:boolean; onClose:()=>void }) {
  const assets = [...(set.creative_assets ?? [])].sort((a,b) => a.position - b.position);
  const [copied, setCopied] = useState(false);
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  useEffect(() => { const fn = (e:KeyboardEvent) => { if (e.key==="Escape") onClose(); }; window.addEventListener("keydown",fn); return () => window.removeEventListener("keydown",fn); }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div className="shrink-0 flex items-start justify-between px-4 pt-4 pb-3 border-b border-white/10">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-white font-bold text-base leading-tight truncate">{set.product_name?.trim() || "Carrossel pronto"}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {set.category && <span className="text-[10px] font-semibold bg-primary/25 text-primary px-2 py-0.5 rounded-full">{set.category}</span>}
            <span className="text-white/40 text-[11px]">{assets.length} imagens</span>
          </div>
        </div>
        <button onClick={onClose} className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
      </div>
      {showDownloadHint && (
        <div className="shrink-0 mx-4 mt-3 flex items-start gap-2 bg-primary/15 border border-primary/25 rounded-xl px-3 py-2.5">
          <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-primary/90 leading-snug">Baixe cada imagem usando os botões abaixo.</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {assets.length === 0 && <div className="flex flex-col items-center justify-center py-12 gap-2"><Images className="w-8 h-8 text-white/20" /><p className="text-white/40 text-sm">Nenhuma imagem disponível.</p></div>}
        {assets.map((asset,i) => (
          <div key={asset.id} className="space-y-2">
            <p className="text-white/50 text-[11px] font-semibold uppercase tracking-wide">Imagem {i+1} de {assets.length}</p>
            <div className="rounded-xl overflow-hidden bg-white/5">
              <img src={asset.image_url} alt={`Imagem ${i+1}`} loading="lazy" className="w-full object-contain max-h-[60vh]" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
            </div>
            <a href={asset.image_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">
              <Download className="w-3.5 h-3.5" /> Baixar imagem
            </a>
          </div>
        ))}
      </div>
      <div className="shrink-0 px-4 pb-6 pt-3 space-y-2 border-t border-white/10">
        {set.product_url && (
          <button onClick={async () => { await navigator.clipboard.writeText(set.product_url!).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
            className="w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-3 rounded-xl transition-colors">
            {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Link copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar link do produto</>}
          </button>
        )}
        {set.product_url && (
          <a href={set.product_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full text-white text-sm font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity" style={{ background:P }}>
            <ExternalLink className="w-4 h-4" /> Ver produto na Shopee
          </a>
        )}
      </div>
    </motion.div>
  );
}

function CarrosselCard({ set, onOpen }: { set:CreativeSet; onOpen:(set:CreativeSet,hint:boolean)=>void }) {
  const assets = [...(set.creative_assets ?? [])].sort((a,b) => a.position - b.position);
  const preview = assets.slice(0,4);
  const extra = assets.length - preview.length;
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex h-28 overflow-hidden bg-muted">
        {preview.length === 0
          ? <button onClick={() => onOpen(set,false)} className="flex-1 flex items-center justify-center"><Images className="w-8 h-8 text-muted-foreground/20" /></button>
          : preview.map((a,i) => (
              <button key={a.id} onClick={() => onOpen(set,false)} className="relative flex-1 overflow-hidden group focus:outline-none">
                <img src={a.image_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
                {i < preview.length-1 && <div className="absolute top-0 right-0 bottom-0 w-px bg-black/10" />}
                {i === preview.length-1 && extra > 0 && <div className="absolute inset-0 bg-black/55 flex items-center justify-center"><span className="text-white font-bold text-sm">+{extra}</span></div>}
              </button>
            ))}
      </div>
      <div className="p-3 space-y-2.5">
        <div>
          {set.category && <span className="inline-block text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-1">{set.category}</span>}
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{set.product_name?.trim() || "Carrossel pronto"}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{assets.length} imagens</p>
        </div>
        <div className="space-y-1.5">
          <button onClick={() => onOpen(set,false)} className="w-full flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-bold py-2.5 rounded-xl hover:opacity-85 transition-opacity">
            <Eye className="w-3.5 h-3.5" /> Ver carrossel
          </button>
          <button onClick={() => onOpen(set,true)} disabled={assets.length===0} className="w-full flex items-center justify-center gap-1.5 bg-background border border-border text-foreground text-xs font-bold py-2.5 rounded-xl hover:bg-muted transition-colors disabled:opacity-50">
            <Download className="w-3.5 h-3.5" /> Baixar tudo
          </button>
          {set.product_url && (
            <a href={set.product_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-1.5 text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity" style={{ background:P }}>
              <ExternalLink className="w-3.5 h-3.5" /> Ver produto na Shopee
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function useCreativeSets(type: "carousel"|"story") {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [chips, setChips]   = useState<string[]>(CS_CHIPS);
  const [sets, setSets]     = useState<CreativeSet[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError]   = useState<string|null>(null);
  const [offset, setOffset] = useState(0);

  const fetchSets = useCallback(async (cat:string, off:number): Promise<CreativeSet[]> => {
    let q = supabase.from("creative_sets")
      .select("id,type,category,product_url,product_name,r2_folder,is_active,created_at,creative_assets(id,creative_set_id,position,image_url,r2_key,original_filename,created_at)")
      .eq("type", type).eq("is_active", true)
      .order("created_at", { ascending:false }).range(off, off + CS_PAGE - 1);
    if (cat !== "Todos") q = q.eq("category", cat);
    const { data, error:dbErr } = await q;
    if (dbErr) throw dbErr;
    return (data as unknown as CreativeSet[]) ?? [];
  }, [type]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setSets([]); setOffset(0); setHasMore(false);
    fetchSets(activeCategory, 0)
      .then(data => {
        if (cancelled) return;
        setSets(data); setHasMore(data.length === CS_PAGE);
        const extra = data.map(s => s.category).filter((c): c is string => !!c && !CS_CHIPS.includes(c));
        if (extra.length > 0) setChips(prev => [...new Set([...prev, ...extra])]);
      })
      .catch(() => { if (!cancelled) setError("Erro ao carregar conteúdo."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeCategory, fetchSets]);

  const loadMore = async () => {
    const next = offset + CS_PAGE; setLoadingMore(true);
    try {
      const data = await fetchSets(activeCategory, next);
      setSets(prev => [...prev, ...data]); setHasMore(data.length === CS_PAGE); setOffset(next);
    } catch { /* silent */ } finally { setLoadingMore(false); }
  };

  return { activeCategory, setActiveCategory, chips, sets, loading, loadingMore, hasMore, error, loadMore };
}

function CarrosseisScreen({ onBack }: { onBack:()=>void }) {
  const chipsRef = useRef<HTMLDivElement>(null);
  const { activeCategory, setActiveCategory, chips, sets, loading, loadingMore, hasMore, error, loadMore } = useCreativeSets("carousel");
  const [previewSet, setPreviewSet] = useState<CreativeSet|null>(null);
  const [previewHint, setPreviewHint] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <TopBar title="Carrosséis Prontos" onBack={onBack} />
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass-card p-5 mx-5 mb-4 text-center">
          <div className="flex items-center justify-center gap-2"><LayoutGrid className="w-5 h-5 text-primary" /><p className="text-3xl font-extrabold text-foreground">+512</p></div>
          <p className="text-xs text-muted-foreground mt-1">carrosséis disponíveis</p>
        </motion.div>
        <div className="px-5 mb-4">
          <div ref={chipsRef} className="glass-card px-3 py-2.5 flex gap-2 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
            {chips.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCategory===cat ? "text-white shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                style={activeCategory===cat ? { background:P } : {}}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-12">
          {loading && <div className="space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden"><div className="h-28 bg-muted animate-pulse" /><div className="p-3"><div className="h-4 w-2/3 bg-muted animate-pulse rounded-full mb-2" /><div className="h-9 bg-muted animate-pulse rounded-xl" /></div></div>)}</div>}
          {!loading && error && <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-2xl p-4"><AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" /><p className="text-sm text-destructive">{error}</p></div>}
          {!loading && !error && sets.length === 0 && <div className="flex flex-col items-center justify-center py-16 gap-3"><div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center"><Images className="w-7 h-7 text-muted-foreground/30" /></div><p className="text-sm text-muted-foreground text-center">Nenhum carrossel encontrado.</p></div>}
          {!loading && !error && sets.length > 0 && (
            <>
              <div className="space-y-3">
                {sets.map((set,i) => (
                  <motion.div key={set.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:Math.min(i*0.04,0.3) }}>
                    <CarrosselCard set={set} onOpen={(s,hint) => { setPreviewSet(s); setPreviewHint(hint); }} />
                  </motion.div>
                ))}
              </div>
              {hasMore && <button onClick={loadMore} disabled={loadingMore} className="mt-5 w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-semibold py-3 rounded-2xl disabled:opacity-60">{loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{loadingMore ? "Carregando..." : "Carregar mais"}</button>}
            </>
          )}
        </div>
      </div>
      <AnimatePresence>
        {previewSet && <CarouselPreviewModal set={previewSet} showDownloadHint={previewHint} onClose={() => setPreviewSet(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Stories: Modal + Card + Screen ──────────────────────────────────────────
function StoryPreviewModal({ set, onClose }: { set:CreativeSet; onClose:()=>void }) {
  const assets = [...(set.creative_assets ?? [])].sort((a,b) => a.position - b.position);
  const [copied, setCopied] = useState(false);
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  useEffect(() => { const fn = (e:KeyboardEvent) => { if (e.key==="Escape") onClose(); }; window.addEventListener("keydown",fn); return () => window.removeEventListener("keydown",fn); }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-sm" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div className="shrink-0 flex items-start justify-between px-4 pt-4 pb-3 border-b border-white/10">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-white font-bold text-base leading-tight truncate">{set.product_name?.trim() || "Story pronto"}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {set.category && <span className="text-[10px] font-semibold bg-primary/25 text-primary px-2 py-0.5 rounded-full">{set.category}</span>}
            <span className="text-white/40 text-[11px]">{assets.length} {assets.length===1?"imagem":"imagens"}</span>
          </div>
        </div>
        <button onClick={onClose} className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {assets.length === 0 && <div className="flex flex-col items-center justify-center py-16 gap-2"><ImageIcon className="w-8 h-8 text-white/20" /><p className="text-white/40 text-sm">Nenhuma imagem disponível.</p></div>}
        {assets.map((asset,i) => (
          <div key={asset.id} className="space-y-2">
            {assets.length > 1 && <p className="text-white/50 text-[11px] font-semibold uppercase tracking-wide">Imagem {i+1} de {assets.length}</p>}
            <div className="rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
              <img src={asset.image_url} alt={`Story ${i+1}`} loading="lazy" className="w-full object-contain max-h-[70vh]" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
            </div>
            <a href={asset.image_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 w-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">
              <Download className="w-3.5 h-3.5" /> Baixar imagem
            </a>
          </div>
        ))}
      </div>
      <div className="shrink-0 px-4 pb-6 pt-3 space-y-2 border-t border-white/10">
        {set.product_url && (
          <button onClick={async () => { await navigator.clipboard.writeText(set.product_url!).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
            className="w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-3 rounded-xl transition-colors">
            {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Link copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar link do produto</>}
          </button>
        )}
        {set.product_url && (
          <a href={set.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full text-white text-sm font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity" style={{ background:P }}>
            <ExternalLink className="w-4 h-4" /> Ver produto na Shopee
          </a>
        )}
      </div>
    </motion.div>
  );
}

function StoryCard({ set, onOpen }: { set:CreativeSet; onOpen:(set:CreativeSet)=>void }) {
  const assets = [...(set.creative_assets ?? [])].sort((a,b) => a.position - b.position);
  const first = assets[0] ?? null;
  const extra = assets.length - 1;
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e:React.MouseEvent) => {
    e.stopPropagation();
    if (!set.product_url) return;
    await navigator.clipboard.writeText(set.product_url).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <button onClick={() => onOpen(set)} className="relative w-full block overflow-hidden bg-muted group focus:outline-none" style={{ aspectRatio:"9/14" }}>
        {first ? (
          <>
            <img src={first.image_url} alt={set.product_name?.trim()||"Story"} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {extra > 0 && <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1"><Layers className="w-3 h-3 text-white" /><span className="text-white text-[10px] font-bold">+{extra}</span></div>}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div></div>
          </>
        ) : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/20" /></div>}
      </button>
      <div className="p-3 space-y-2.5">
        <div>
          {set.category && <span className="inline-block text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-1">{set.category}</span>}
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{set.product_name?.trim()||"Story pronto"}</p>
        </div>
        <div className="space-y-1.5">
          <button onClick={() => onOpen(set)} className="w-full flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-bold py-2.5 rounded-xl hover:opacity-85 transition-opacity">
            <Eye className="w-3.5 h-3.5" /> Ver story
          </button>
          {set.product_url && (
            <a href={set.product_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-1.5 text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity" style={{ background:P }}>
              <ExternalLink className="w-3.5 h-3.5" /> Ver produto na Shopee
            </a>
          )}
          <div className="flex gap-1.5">
            {first && <a href={first.image_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 bg-background border border-border text-foreground text-xs font-semibold py-2.5 rounded-xl hover:bg-muted transition-colors"><Download className="w-3.5 h-3.5 shrink-0" /> Baixar</a>}
            {set.product_url && (
              <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-1 bg-background border border-border text-foreground text-xs font-semibold py-2.5 rounded-xl hover:bg-muted transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 shrink-0 text-green-500" /><span className="text-green-500">Copiado</span></> : <><Copy className="w-3.5 h-3.5 shrink-0" /> Copiar link</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StoriesScreen({ onBack }: { onBack:()=>void }) {
  const chipsRef = useRef<HTMLDivElement>(null);
  const { activeCategory, setActiveCategory, chips, sets, loading, loadingMore, hasMore, error, loadMore } = useCreativeSets("story");
  const [previewSet, setPreviewSet] = useState<CreativeSet|null>(null);
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <TopBar title="Stories Prontos" onBack={onBack} />
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass-card p-5 mx-5 mb-4 text-center">
          <div className="flex items-center justify-center gap-2"><Layers className="w-5 h-5 text-primary" /><p className="text-3xl font-extrabold text-foreground">+1.051</p></div>
          <p className="text-xs text-muted-foreground mt-1">stories disponíveis</p>
        </motion.div>
        <div className="px-5 mb-4">
          <div ref={chipsRef} className="glass-card px-3 py-2.5 flex gap-2 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
            {chips.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCategory===cat ? "text-white shadow-sm" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                style={activeCategory===cat ? { background:P } : {}}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-12">
          {loading && <div className="grid grid-cols-2 gap-3">{Array.from({length:6}).map((_,i) => <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden"><div className="h-52 bg-muted animate-pulse" /><div className="p-3"><div className="h-4 w-2/3 bg-muted animate-pulse rounded-full mb-2" /><div className="h-9 bg-muted animate-pulse rounded-xl" /></div></div>)}</div>}
          {!loading && error && <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-2xl p-4"><AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" /><p className="text-sm text-destructive">{error}</p></div>}
          {!loading && !error && sets.length === 0 && <div className="flex flex-col items-center justify-center py-16 gap-3"><div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center"><Layers className="w-7 h-7 text-muted-foreground/30" /></div><p className="text-sm text-muted-foreground text-center">Nenhum story encontrado.</p></div>}
          {!loading && !error && sets.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {sets.map((set,i) => (
                  <motion.div key={set.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:Math.min(i*0.04,0.3) }}>
                    <StoryCard set={set} onOpen={s => setPreviewSet(s)} />
                  </motion.div>
                ))}
              </div>
              {hasMore && <button onClick={loadMore} disabled={loadingMore} className="mt-5 w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-semibold py-3 rounded-2xl disabled:opacity-60">{loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{loadingMore ? "Carregando..." : "Carregar mais"}</button>}
            </>
          )}
        </div>
      </div>
      <AnimatePresence>
        {previewSet && <StoryPreviewModal set={previewSet} onClose={() => setPreviewSet(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Produtos em Alta ─────────────────────────────────────────────────────────
function Stars({ rating }: { rating:number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({length:5}).map((_,i) => <Star key={i} className="w-3 h-3" fill={i<Math.floor(rating)?"#FF5A1F":"none"} stroke={i<Math.floor(rating)?"#FF5A1F":"#ccc"} />)}
      <span className="text-[10px] font-bold text-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProdutoAltaCard({ produto, rank }: { produto:typeof PRODUTOS_ALTA[0]; rank:number }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex-shrink-0 w-[220px] bg-card border border-border rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.09)]">
      <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
        <img src={produto.img} alt={produto.nome} className="w-full h-full object-cover" />
        <span className="absolute top-2.5 left-2.5 text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background:P }}>{produto.badge}</span>
        <span className="absolute top-2.5 right-2.5 text-[11px] font-extrabold text-foreground/60 tabular-nums">#{String(rank).padStart(2,"0")}</span>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">{produto.nome}</p>
        <Stars rating={produto.rating} />
        <div>
          <p className="text-[1rem] font-extrabold text-foreground leading-none">{produto.preco}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-muted-foreground line-through">{produto.precoOrig}</span>
            <span className="text-[10px] font-bold text-red-500">{produto.desconto}</span>
          </div>
        </div>
        <div className="flex gap-1.5 mt-auto">
          <button onClick={() => window.open(produto.link,"_blank")} className="flex-1 flex items-center justify-center gap-1 text-white text-[10px] font-bold py-2 rounded-2xl hover:opacity-90 transition-opacity" style={{ background:P }}>
            <ExternalLink className="w-3 h-3" /> Ver produto
          </button>
          <button onClick={async () => { await navigator.clipboard.writeText(produto.link); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
            className="flex items-center justify-center gap-1 bg-muted text-foreground text-[10px] font-semibold px-3 py-2 rounded-2xl hover:bg-muted/70 transition-colors">
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            {copied ? "OK" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RowExtra({ produto, index }: { produto:ProdutoExtra; index:number }) {
  const [copied, setCopied] = useState(false);
  return (
    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:Math.min(index*0.025,0.4) }}
      className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide">Produto para divulgar</span>
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-1 mt-0.5">{produto.nome}</p>
        {produto.nicho && <p className="text-[10px] text-muted-foreground mt-0.5">{produto.nicho}</p>}
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={() => produto.link_shopee && window.open(produto.link_shopee,"_blank")} disabled={!produto.link_shopee}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40">
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button onClick={async () => { if (!produto.link_shopee) return; await navigator.clipboard.writeText(produto.link_shopee); setCopied(true); setTimeout(()=>setCopied(false),2000); }} disabled={!produto.link_shopee}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-40">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </motion.div>
  );
}

function ProdutosAltaScreen({ onBack }: { onBack:()=>void }) {
  const [extras, setExtras]           = useState<ProdutoExtra[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [erroExtras, setErroExtras]   = useState<string|null>(null);
  const [mostrarExtras, setMostrarExtras] = useState(false);
  const [hasMore, setHasMore]         = useState(true);
  const [page, setPage]               = useState(0);
  const [loadingMais, setLoadingMais] = useState(false);

  const fetchExtras = async (p:number) => {
    const { data, error } = await supabase.rpc("get_mais_produtos", { _limit:50, _offset:p*50 });
    if (error) { setErroExtras("Não foi possível carregar mais produtos."); return; }
    const lista = (data as ProdutoExtra[]) ?? [];
    setExtras(prev => p===0 ? lista : [...prev,...lista]); setHasMore(lista.length===50); setPage(p);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <TopBar title="Produtos em Alta" onBack={onBack} />
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="px-5 pt-2 pb-4 text-center">
          <p className="text-[9px] font-bold tracking-[0.2em] text-foreground/40 uppercase mb-1">Atualizado hoje</p>
          <h1 className="text-[1.9rem] font-extrabold leading-[1.1]">Banco de <span style={{ color:P }}>Produtos</span></h1>
          <p className="text-xs text-muted-foreground mt-1.5">Os mais vendidos nos últimos 30 dias.</p>
          <div className="w-8 h-0.5 mx-auto mt-3 rounded-full" style={{ background:P }} />
        </motion.div>
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="px-5 mb-5">
          <div className="bg-card border border-border rounded-3xl p-4 flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Catálogo disponível</p>
              <p className="text-[1.4rem] font-extrabold leading-none" style={{ color:P }}>+3.897 produtos</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">prontos para virar vídeo</p>
            </div>
          </div>
        </motion.div>
        <div className="px-5 mb-3 flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-foreground uppercase tracking-widest">Top {PRODUTOS_ALTA.length}</span>
          <span className="text-[10px] text-muted-foreground">Atualizado hoje</span>
        </div>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }} className="pl-5 pb-2">
          <div className="flex gap-3 overflow-x-auto pb-3 pr-5" style={{ scrollSnapType:"x mandatory" }}>
            {PRODUTOS_ALTA.map((p,i) => (
              <motion.div key={p.id} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1+i*0.07 }} style={{ scrollSnapAlign:"start" }}>
                <ProdutoAltaCard produto={p} rank={i+1} />
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className="px-5 pb-12 mt-2">
          {!mostrarExtras ? (
            <motion.button initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
              onClick={async () => { setMostrarExtras(true); setLoadingExtras(true); await fetchExtras(0); setLoadingExtras(false); }}
              className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-bold py-3.5 rounded-2xl hover:shadow-md transition-shadow">
              <ChevronDown className="w-4 h-4 text-primary" /> Ver +500 produtos para divulgar
            </motion.button>
          ) : (
            <AnimatePresence>
              <motion.div key="extras" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
                <div className="flex items-center gap-2 mb-4"><div className="flex-1 h-px bg-border" /><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">Mais produtos para divulgar</p><div className="flex-1 h-px bg-border" /></div>
                {loadingExtras ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  : erroExtras ? <p className="text-center text-sm text-destructive py-6">{erroExtras}</p>
                  : extras.length === 0 ? <div className="text-center py-8"><ShoppingBag className="w-10 h-10 text-muted-foreground/25 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Nenhum produto disponível.</p></div>
                  : <>
                      <div className="space-y-2 mb-4">{extras.map((p,i) => <RowExtra key={p.id} produto={p} index={i} />)}</div>
                      {hasMore && <button onClick={async () => { setLoadingMais(true); await fetchExtras(page+1); setLoadingMais(false); }} disabled={loadingMais}
                        className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-semibold py-3 rounded-2xl hover:shadow-md transition-shadow disabled:opacity-60 mb-4">
                        {loadingMais ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                        {loadingMais ? "Carregando..." : "Carregar mais"}
                      </button>}
                    </>}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Treinamento ──────────────────────────────────────────────────────────────
function TreinamentoScreen({ onBack }: { onBack:()=>void }) {
  const [aberta, setAberta] = useState<string>("01");
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-7 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-black/[0.07] cursor-pointer active:scale-95 transition-transform"
            style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }} onClick={onBack}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </div>
        </div>
        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-4">Academia</p>
          <h2 className="text-[2rem] font-extrabold leading-[1.1]">Domine o<br /><span style={{ color:P }}>sistema</span></h2>
          <Divider />
          <p className="text-foreground/50 text-[13px] mt-3">Quatro módulos práticos para você fazer lives na Shopee.</p>
        </div>
        <div className="px-5 mt-6 pb-14 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">Em destaque</span>
            <span className="text-[10px] font-bold" style={{ color:P }}>Comece por aqui</span>
          </div>
          {AULAS_SHOPEE.map(a => {
            const isOpen = aberta === a.num;
            return (
              <div key={a.num} className="bg-white rounded-2xl overflow-hidden cursor-pointer" style={{ boxShadow:"0 1px 5px rgba(0,0,0,0.07)" }}
                onClick={() => setAberta(isOpen ? "" : a.num)}>
                {isOpen && (
                  <div className="relative w-full overflow-hidden">
                    {a.num === "01" ? (
                      <>
                        <img src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/thumbnail.png" alt="Aula 01" className="w-full block" />
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background:"rgba(0,0,0,0.22)" }}>
                          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}>
                            <Play className="w-6 h-6 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-center" style={{ height:110, background:`linear-gradient(135deg, rgba(255,90,31,0.12) 0%, rgba(255,90,31,0.04) 100%)` }}>
                        <Play className="w-8 h-8" style={{ color:P }} fill={P} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[9px] font-extrabold tracking-wider text-white px-2.5 py-[4px] rounded-full uppercase" style={{ background:P }}>Aula {a.num}</span>
                    <span className="absolute bottom-3 right-3 text-[10px] font-bold text-white bg-black/40 px-2.5 py-1 rounded-full">{a.duracao}</span>
                  </div>
                )}
                <div className="px-4 pt-3.5 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background:isOpen ? P : "rgba(0,0,0,0.05)" }}>
                      {isOpen ? <Play className="w-4 h-4 text-white ml-0.5" fill="white" /> : <span className="text-[11px] font-extrabold text-foreground/35">{a.num}</span>}
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
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background:"rgba(255,90,31,0.1)", color:P }}>{a.nivel}</span>
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

// ─── Live Flow ────────────────────────────────────────────────────────────────
function LiveStep1({ produto, onSelect, onConfirm }: { produto:ProdutoLive|null; onSelect:(p:ProdutoLive)=>void; onConfirm:()=>void }) {
  return (
    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="px-5 pb-10">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Produto</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">Escolha o<br /><span style={{ color:P }}>Produto</span></h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">Qual produto será divulgado nessa live?</p>
      <div className="grid grid-cols-2 gap-3">
        {PRODUTOS_LIVE.map(p => {
          const sel = produto?.id === p.id;
          return (
            <div key={p.id} className="rounded-2xl overflow-hidden bg-white border-2 flex flex-col"
              style={{ borderColor:sel ? P : "transparent", boxShadow:sel ? GLOW : "0 2px 10px rgba(0,0,0,0.08)" }}>
              <img src={p.img} alt={p.nome} className="w-full block" />
              <div className="p-2.5 flex flex-col gap-1.5">
                <p className="text-[11px] font-bold text-foreground leading-snug line-clamp-2">{p.nome}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-extrabold" style={{ color:P }}>{p.preco}</span>
                  <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">{p.desconto}</span>
                </div>
                {sel ? (
                  <button onClick={onConfirm}
                    className="w-full py-2 text-[11px] font-bold text-white rounded-xl active:scale-95 transition-transform"
                    style={{ background:GRAD }}>
                    Criar live com esse produto
                  </button>
                ) : (
                  <button onClick={() => onSelect(p)}
                    className="w-full py-2 text-[11px] font-bold text-white rounded-xl active:scale-95 transition-transform"
                    style={{ background:"#1C1C1E" }}>
                    Usar produto
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function LiveStep2({ genero, setGenero, idade, setIdade, cenario, setCenario, onNext }: { genero:string; setGenero:(v:string)=>void; idade:string; setIdade:(v:string)=>void; cenario:string; setCenario:(v:string)=>void; onNext:()=>void }) {
  return (
    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="px-5 pb-10">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Apresentador IA</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">Configure o apresentador<br /><span style={{ color:P }}>e o cenário</span></h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">Defina o perfil do apresentador e o ambiente da live.</p>
      <PillSelect label="Gênero" value={genero} onChange={setGenero} options={[{id:"feminino",label:"Feminino"},{id:"masculino",label:"Masculino"}]} />
      <PillSelect label="Faixa etária" value={idade} onChange={setIdade} options={[{id:"jovem",label:"Jovem"},{id:"adulto",label:"Adulto"},{id:"maduro",label:"Maduro"}]} />
      <PillSelect label="Cenário da live" value={cenario} onChange={setCenario} options={[{id:"quarto",label:"Quarto"},{id:"sala",label:"Sala de estar"},{id:"loja",label:"Loja"},{id:"mesa",label:"Mesa de produtos"}]} />
      <PrimaryBtn onClick={onNext}>Próximo <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </motion.div>
  );
}

function LiveStep3({ duracao, setDuracao, onNext }: { duracao:string; setDuracao:(v:string)=>void; onNext:()=>void }) {
  return (
    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="px-5 pb-10">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Duração</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">Quanto tempo<br /><span style={{ color:P }}>vai durar?</span></h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-6">Escolha a duração da sua live na Shopee.</p>
      <PillSelect label="Duração da live" options={[{id:"1h",label:"1 hora"},{id:"2h",label:"2 horas"},{id:"3h",label:"3 horas"}]} value={duracao} onChange={setDuracao} />
      <PrimaryBtn onClick={onNext}>Próximo <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </motion.div>
  );
}

function LiveStep4({ produto, onNext }: { produto:ProdutoLive|null; onNext:()=>void }) {
  const [generating, setGenerating] = useState(true);
  const gifUrl = produto ? previaImg(produto.id) : null;
  useEffect(() => { const t = setTimeout(() => setGenerating(false), 2000); return () => clearTimeout(t); }, []);
  if (generating) return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="px-5 flex flex-col items-center justify-center min-h-[55vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin" style={{ color:P }} />
      <div className="text-center">
        <p className="font-extrabold text-[15px]">Gerando prévia da live...</p>
        <p className="text-[12px] text-foreground/40 mt-1">A IA está preparando sua apresentação</p>
      </div>
    </motion.div>
  );
  return (
    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="px-5 pb-10">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Prévia</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">Como vai<br /><span style={{ color:P }}>ficar</span></h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">Pré-visualização antes de publicar.</p>
      <div className="rounded-2xl overflow-hidden relative mb-5">
        {gifUrl ? <img src={gifUrl} alt="prévia da live" className="w-full block" />
          : <div className="w-full aspect-video bg-muted flex items-center justify-center"><Video className="w-10 h-10 text-foreground/20" /></div>}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 px-2.5 py-[5px] rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white text-[10px] font-bold tracking-wide">AO VIVO</span>
        </div>
      </div>
      <PrimaryBtn onClick={onNext}>Confirmar e agendar <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </motion.div>
  );
}

function LiveStep5({ inicio, setInicio, onSubmit }: { inicio:string; setInicio:(v:string)=>void; onSubmit:()=>void }) {
  return (
    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="px-5 pb-10">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Programar</p>
      <h2 className="text-[1.8rem] font-extrabold leading-[1.1]">Quando<br /><span style={{ color:P }}>começar?</span></h2>
      <Divider />
      <p className="text-foreground/50 text-[12px] mt-3 mb-5">Escolha quando a live vai ao ar.</p>
      <div className="space-y-3 mb-6">
        {[
          { id:"agora",     icon:<Zap className="w-5 h-5" />,   title:"Agora",              desc:"A live começa imediatamente após confirmar." },
          { id:"programar", icon:<Clock className="w-5 h-5" />, title:"Programar data e hora", desc:"Escolha dia e hora para a live ir ao ar automaticamente." },
        ].map(o => (
          <button key={o.id} onClick={() => setInicio(o.id)}
            className="w-full flex items-center gap-4 bg-card border-2 rounded-2xl px-4 py-4 text-left active:scale-[0.98] transition-all"
            style={{ borderColor:inicio===o.id ? P : "hsl(var(--border))", boxShadow:inicio===o.id ? GLOW : "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background:inicio===o.id ? P : "rgba(0,0,0,0.04)", color:inicio===o.id ? "white" : "rgba(0,0,0,0.4)" }}>
              {o.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] text-foreground">{o.title}</p>
              <p className="text-[11px] text-foreground/50 mt-0.5 leading-snug">{o.desc}</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center" style={{ borderColor:inicio===o.id ? P : "hsl(var(--border))" }}>
              {inicio===o.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background:P }} />}
            </div>
          </button>
        ))}
      </div>
      <PrimaryBtn onClick={onSubmit}>Criar live <ChevronRight className="w-4 h-4" /></PrimaryBtn>
    </motion.div>
  );
}

function LivePreparingScreen({ onDone }: { onDone:()=>void }) {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const d = setInterval(() => setDots(n => (n+1)%4), 400);
    const t = setTimeout(onDone, 3500);
    return () => { clearInterval(d); clearTimeout(t); };
  }, [onDone]);
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="min-h-screen flex flex-col items-center justify-center px-8 gap-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background:GRAD, boxShadow:GLOW }}>
        <Video className="w-7 h-7 text-white" />
      </div>
      <div className="text-center">
        <p className="font-extrabold text-[17px]">Preparando sua live{"".padEnd(dots+1,".")}</p>
        <p className="text-foreground/45 text-[13px] mt-1">A IA está configurando tudo</p>
      </div>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background:P }}
            animate={{ opacity:[0.3,1,0.3], scale:[0.8,1.2,0.8] }} transition={{ duration:1.2, repeat:Infinity, delay:i*0.2 }} />
        ))}
      </div>
    </motion.div>
  );
}

function LiveSuccess({ onBack }: { onBack:()=>void }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="min-h-screen flex flex-col items-center justify-center px-8">
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:280, delay:0.1 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background:GRAD, boxShadow:GLOW }}>
        <Check className="w-9 h-9 text-white" strokeWidth={2.5} />
      </motion.div>
      <h2 className="text-[1.9rem] font-extrabold text-center leading-[1.1] mb-2">
        Live<br /><span style={{ color:P }}>criada!</span>
      </h2>
      <p className="text-foreground/50 text-[13px] text-center max-w-[220px] mb-8">
        Sua live na Shopee foi configurada com sucesso.
      </p>
      <div className="w-full max-w-xs flex flex-col gap-3">
        <PrimaryBtn onClick={() => window.open("https://shopee.com.br","_blank")}>
          <ExternalLink className="w-4 h-4" /> Ver live na Shopee
        </PrimaryBtn>
        <button onClick={onBack} className="w-full py-3 text-foreground/50 text-sm font-semibold rounded-2xl bg-card border border-border active:scale-[0.98] transition-transform">
          Voltar ao início
        </button>
      </div>
    </motion.div>
  );
}

function LiveFlow({ onBack }: { onBack:()=>void }) {
  const [step, setStep]       = useState<1|2|3|4|5>(1);
  const [produto, setProduto] = useState<ProdutoLive|null>(null);
  const [genero, setGenero]   = useState("feminino");
  const [idade, setIdade]     = useState("jovem");
  const [cenario, setCenario] = useState("quarto");
  const [duracao, setDuracao] = useState("1h");
  const [inicio, setInicio]   = useState("agora");
  const [preparing, setPreparing] = useState(false);
  const [success, setSuccess] = useState(false);
  const names = ["Produto","Apresentador","Duração","Prévia","Programar"];
  const prev  = () => step===1 ? onBack() : setStep((step-1) as 1|2|3|4|5);
  if (success)   return <LiveSuccess onBack={onBack} />;
  if (preparing) return <LivePreparingScreen onDone={() => { setPreparing(false); setSuccess(true); }} />;
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <div className="px-5 pt-7 pb-2 flex items-center justify-between">
          <button onClick={prev} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform" style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </button>
          <span className="text-[11px] font-bold" style={{ color:P }}>Etapa {step} — {names[step-1]}</span>
          <div className="w-9" />
        </div>
        <StepBar step={step} total={5} />
        <AnimatePresence mode="wait">
          {step===1 && <LiveStep1 key="s1" produto={produto} onSelect={setProduto} onConfirm={() => setStep(2)} />}
          {step===2 && <LiveStep2 key="s2" genero={genero} setGenero={setGenero} idade={idade} setIdade={setIdade} cenario={cenario} setCenario={setCenario} onNext={() => setStep(3)} />}
          {step===3 && <LiveStep3 key="s3" duracao={duracao} setDuracao={setDuracao} onNext={() => setStep(4)} />}
          {step===4 && <LiveStep4 key="s4" produto={produto} onNext={() => setStep(5)} />}
          {step===5 && <LiveStep5 key="s5" inicio={inicio} setInicio={setInicio} onSubmit={() => setPreparing(true)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function Home({ onNavigate }: { onNavigate:(s:Screen)=>void }) {
  const modules = [
    { id:"pack"        as Screen, title:"Pack +7.000 Vídeos",  desc:"Vídeos prontos por nicho para alimentar seu perfil.", Icon:Film },
    { id:"carrossei"   as Screen, title:"Carrosséis Prontos",   desc:"Sequências de imagens prontas para postar.",          Icon:LayoutGrid },
    { id:"stories"     as Screen, title:"Stories Prontos",      desc:"Stories prontos para divulgar seus produtos.",        Icon:Layers },
    { id:"produtos"    as Screen, title:"Produtos em Alta",     desc:"Os mais vendidos para divulgar nas suas lives.",      Icon:TrendingUp },
    { id:"treinamento" as Screen, title:"Treinamento",          desc:"Aprenda a fazer lives na Shopee do zero.",            Icon:GraduationCap },
  ];
  return (
    <div className="min-h-screen bg-background">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="max-w-md mx-auto px-5 pt-8 pb-0 flex items-center justify-between">
        <img src={LOGO} alt="Afiliada Live" className="h-14 w-auto" style={{ objectFit:"contain" }} />
      </motion.div>
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }} className="max-w-md mx-auto px-5 pt-5 pb-6">
        <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-3">Painel de Lives</p>
        <h1 className="text-[2rem] font-extrabold leading-[1.12] text-foreground">
          Venda mais com lives<br /><span className="text-primary">na Shopee.</span>
        </h1>
      </motion.div>
      <div className="max-w-md mx-auto px-5 pb-14 space-y-2.5">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }} className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">Ferramentas</span>
          <span className="text-[10px] font-semibold text-primary">6 ativas</span>
        </motion.div>
        {/* Card principal — IA de Lives */}
        <motion.button initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          onClick={() => onNavigate("live")}
          className="w-full text-left rounded-[1.4rem] px-5 pt-4 pb-5 relative overflow-hidden active:scale-[0.98] transition-transform"
          style={{ background:DARK, boxShadow:"0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse 60% 50% at 80% 0%, rgba(255,90,31,0.18) 0%, transparent 70%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block text-[9px] font-bold tracking-wider text-white px-2.5 py-[3px] rounded-full uppercase" style={{ background:P }}>Principal</span>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background:P }}>
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-[15px] leading-snug">IA de Lives</h3>
                <p className="text-white/50 text-[11px] mt-0.5 leading-snug">Crie uma live automática para vender na Shopee.</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/30 shrink-0 self-start mt-0.5" />
            </div>
          </div>
        </motion.button>
        {/* Cards secundários */}
        {modules.map(({ id, title, desc, Icon }, i) => (
          <motion.button key={id} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2+i*0.05 }}
            onClick={() => onNavigate(id)}
            className="w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3.5 border border-black/[0.06] active:scale-[0.98] transition-transform bg-white"
            style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.04)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background:"rgba(255,90,31,0.08)" }}>
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground leading-snug">{title}</p>
              <p className="text-[11px] mt-0.5 leading-snug text-foreground/45">{desc}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 shrink-0 text-foreground/20" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Code Login ───────────────────────────────────────────────────────────────
function CodeLogin({ onCode }: { onCode:(c:string)=>void }) {
  const [val, setVal] = useState("");
  const submit = () => { if (val.trim()) onCode(val.trim().toUpperCase()); };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background">
      <img src={LOGO} alt="Afiliada Live" className="h-20 w-auto mb-12" style={{ objectFit:"contain" }} />
      <div className="w-full max-w-xs">
        <h2 className="text-[1.8rem] font-extrabold leading-[1.1] mb-1.5">Acesse com<br /><span style={{ color:P }}>seu código</span></h2>
        <p className="text-foreground/45 text-[13px] mb-6">Digite o código de acesso para entrar.</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-foreground/40 mb-2">Código de acesso</p>
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key==="Enter" && submit()}
          placeholder="· · · ·"
          className="w-full bg-white border border-border rounded-2xl px-4 py-3.5 text-[15px] font-bold tracking-widest text-center outline-none focus:border-primary mb-4"
          style={{ boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }} />
        <PrimaryBtn onClick={submit} disabled={!val.trim()}>
          Entrar <ChevronRight className="w-4 h-4" />
        </PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AfiliadadaLive() {
  const [code, setCode]     = useState<string|null>(() => sessionStorage.getItem("afilive_code"));
  const [screen, setScreen] = useState<Screen>("home");

  const handleCode = (c:string) => { sessionStorage.setItem("afilive_code", c); setCode(c); };

  if (!code) return <CodeLogin onCode={handleCode} />;

  return (
    <AnimatePresence mode="wait">
      {screen==="home"        && <motion.div key="home"        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}><Home onNavigate={setScreen} /></motion.div>}
      {screen==="live"        && <motion.div key="live"        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}><LiveFlow onBack={() => setScreen("home")} /></motion.div>}
      {screen==="pack"        && <motion.div key="pack"        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}><PackScreen onBack={() => setScreen("home")} /></motion.div>}
      {screen==="carrossei"   && <motion.div key="carrossei"   initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}><CarrosseisScreen onBack={() => setScreen("home")} /></motion.div>}
      {screen==="stories"     && <motion.div key="stories"     initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}><StoriesScreen onBack={() => setScreen("home")} /></motion.div>}
      {screen==="produtos"    && <motion.div key="produtos"    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}><ProdutosAltaScreen onBack={() => setScreen("home")} /></motion.div>}
      {screen==="treinamento" && <motion.div key="treinamento" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}><TreinamentoScreen onBack={() => setScreen("home")} /></motion.div>}
    </AnimatePresence>
  );
}
