import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Play,
  Video,
  Search,
  Copy,
  ExternalLink,
  Check,
  X,
  ChevronRight,
  Loader2,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import packImg from "@/assets/pack-10mil.png";
import ModuleBanner from "@/components/ModuleBanner";
import ModuleDisabledState from "@/components/ModuleDisabledState";
import { useSystemSettings } from "@/hooks/useSystemSettings";

const PAGE_SIZE = 30;

interface Nicho {
  nicho: string;
  total: number;
}

interface VideoItem {
  message_id: string;
  nicho: string;
  link_shopee: string | null;
  link_video: string | null;
  r2_key: string | null;
  topico_original: string | null;
  arquivo_local: string | null;
  data_telegram: string | null;
}

// ── Modal de player ──────────────────────────────────────────────────────────
function VideoModal({
  video,
  onClose,
}: {
  video: VideoItem;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (!video.link_shopee) return;
    await navigator.clipboard.writeText(video.link_shopee);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const baixar = () => {
    if (!video.link_video) return;
    const a = document.createElement("a");
    a.href = video.link_video;
    a.download = `video-${video.message_id}.mp4`;
    a.target = "_blank";
    a.click();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Player */}
        <div className="relative bg-black w-full aspect-video flex items-center justify-center">
          {video.link_video ? (
            <video
              src={video.link_video}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/40">
              <Play className="w-10 h-10" />
              <span className="text-xs">Vídeo não disponível</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-sm font-semibold text-foreground">Vídeo pronto para divulgação</p>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
            Código #{video.message_id}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-2">
              <button
                onClick={baixar}
                disabled={!video.link_video}
                className="flex-1 flex items-center justify-center gap-1.5 bg-muted text-foreground text-xs font-semibold py-2.5 rounded-2xl hover:bg-muted/80 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar vídeo
              </button>
              <button
                onClick={() => video.link_shopee && window.open(video.link_shopee, "_blank")}
                disabled={!video.link_shopee}
                className="flex-1 flex items-center justify-center gap-1.5 bg-muted text-foreground text-xs font-semibold py-2.5 rounded-2xl hover:bg-muted/80 transition-colors disabled:opacity-40"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver produto
              </button>
            </div>
            <button
              onClick={copyLink}
              disabled={!video.link_shopee}
              className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar link Shopee
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Card de vídeo ────────────────────────────────────────────────────────────
function VideoCard({
  video,
  onPlay,
}: {
  video: VideoItem;
  onPlay: (v: VideoItem) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video.link_shopee) return;
    await navigator.clipboard.writeText(video.link_shopee);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const baixar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!video.link_video) return;
    const a = document.createElement("a");
    a.href = video.link_video;
    a.download = `video-${video.message_id}.mp4`;
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden hover:shadow-card-hover transition-shadow flex flex-col">
      {/* Preview */}
      <button
        onClick={() => onPlay(video)}
        className="relative w-full aspect-[9/16] bg-muted overflow-hidden group"
      >
        {video.link_video && !videoError ? (
          <video
            src={video.link_video}
            muted
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
            <Play className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>
      </button>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2">
        <p className="text-xs font-semibold text-foreground leading-snug">
          Vídeo pronto para divulgação
        </p>
        <p className="text-[10px] text-muted-foreground font-mono">
          Código #{video.message_id}
        </p>
        {video.topico_original && (
          <p className="text-[10px] text-muted-foreground/60 leading-snug line-clamp-2">
            {video.topico_original}
          </p>
        )}

        {/* Botões 2×2 */}
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          <button
            onClick={() => onPlay(video)}
            className="flex items-center justify-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold py-1.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Play className="w-3 h-3 fill-white" />
            Assistir
          </button>
          <button
            onClick={baixar}
            disabled={!video.link_video}
            className="flex items-center justify-center gap-1 bg-muted text-foreground text-[10px] font-bold py-1.5 rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-40"
          >
            <Download className="w-3 h-3" />
            Baixar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); video.link_shopee && window.open(video.link_shopee, "_blank"); }}
            disabled={!video.link_shopee}
            className="flex items-center justify-center gap-1 bg-muted text-foreground text-[10px] font-bold py-1.5 rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-40"
          >
            <ExternalLink className="w-3 h-3" />
            Ver produto
          </button>
          <button
            onClick={copyLink}
            disabled={!video.link_shopee}
            className="flex items-center justify-center gap-1 bg-muted text-foreground text-[10px] font-bold py-1.5 rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tela de nichos ────────────────────────────────────────────────────────────
function NichosView({ onSelect }: { onSelect: (nicho: string, total: number) => void }) {
  const [nichos, setNichos] = useState<Nicho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNichos = async () => {
      const { data, error } = await supabase.rpc("get_nichos_videos");
      if (error) {
        setError("Erro ao carregar nichos. Tente novamente.");
      } else {
        setNichos((data as Nicho[]) ?? []);
      }
      setLoading(false);
    };
    fetchNichos();
  }, []);

  const totalGeral = nichos.reduce((acc, n) => acc + Number(n.total), 0);

  return (
    <div className="px-5 pb-10">
      {/* Count geral */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-5 mb-5 text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          <p className="text-3xl font-extrabold text-foreground">
            10.783
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">videos disponiveis</p>
      </motion.div>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-destructive py-6">{error}</p>
      )}

      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Escolha um nicho
          </p>
          {nichos.map((n, i) => (
            <motion.button
              key={n.nicho}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => onSelect(n.nicho, Number(n.total))}
              className="w-full flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5 hover:shadow-card-hover hover:border-primary/30 transition-all text-left group"
            >
              <div>
                <p className="font-semibold text-foreground text-sm">{n.nicho}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {Number(n.total).toLocaleString("pt-BR")} vídeos
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ── Tela de vídeos por nicho ──────────────────────────────────────────────────
function VideosView({
  nicho,
  total,
  onBack,
}: {
  nicho: string;
  total: number;
  onBack: () => void;
}) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const fetchVideos = useCallback(
    async (pageIndex: number, searchTerm: string) => {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("videos_achadinhos")
        .select("message_id, nicho, link_shopee, link_video, r2_key, topico_original, arquivo_local, data_telegram")
        .eq("nicho", nicho)
        .order("message_id", { ascending: false })
        .range(from, to);

      if (searchTerm.trim()) {
        query = query.ilike("topico_original", `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;
      if (error) return [];
      return (data as VideoItem[]) ?? [];
    },
    [nicho]
  );

  // Carregamento inicial
  useEffect(() => {
    setVideos([]);
    setPage(0);
    setHasMore(true);

    const load = async () => {
      setLoading(true);
      const data = await fetchVideos(0, search);
      setVideos(data);
      setHasMore(data.length === PAGE_SIZE);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nicho, search]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const data = await fetchVideos(nextPage, search);
    setVideos((prev) => [...prev, ...data]);
    setHasMore(data.length === PAGE_SIZE);
    setPage(nextPage);
    setLoadingMore(false);
  };

  return (
    <>
      <div className="px-5 pb-10">
        {/* Info + busca em glass-card (flutua sobre o header laranja) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-4 mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{total.toLocaleString("pt-BR")}</span>{" "}
              vídeos disponíveis
            </p>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-3 h-3" />
              Nichos
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar vídeo..."
              className="w-full bg-background border border-border rounded-2xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            Nenhum vídeo encontrado.
          </p>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-3"
            >
              {videos.map((v) => (
                <VideoCard key={v.message_id} video={v} onPlay={setActiveVideo} />
              ))}
            </motion.div>

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-semibold py-3 rounded-2xl hover:shadow-card-hover transition-shadow disabled:opacity-60"
              >
                {loadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {loadingMore ? "Carregando..." : "Carregar mais"}
              </button>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeVideo && (
          <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Page principal ────────────────────────────────────────────────────────────
const PackVideos = () => {
  const navigate = useNavigate();
  const [selectedNicho, setSelectedNicho] = useState<{ nicho: string; total: number } | null>(null);

  const { settings, loading: settingsLoading } = useSystemSettings();

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings.modules.pack_videos.enabled) {
    return (
      <ModuleDisabledState
        title="Pack de Videos indisponivel"
        message={settings.modules.pack_videos.disabled_message}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={selectedNicho ? () => setSelectedNicho(null) : () => navigate("/")}
            className="flex items-center gap-1 text-foreground/40 text-xs font-semibold mb-5 hover:text-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {selectedNicho ? "Nichos" : "Voltar"}
          </button>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            Pack de Videos
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            {selectedNicho ? selectedNicho.nicho : (<>+10.000 videos <span className="text-primary">prontos pra usar.</span></>)}
          </h1>
        </div>
      </div>

      <ModuleBanner src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/banner-packvideos.png" alt="Pack de Videos" />

      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {!selectedNicho ? (
            <motion.div key="nichos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NichosView onSelect={(nicho, total) => setSelectedNicho({ nicho, total })} />
            </motion.div>
          ) : (
            <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <VideosView
                nicho={selectedNicho.nicho}
                total={selectedNicho.total}
                onBack={() => setSelectedNicho(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-muted-foreground/30 text-[10px] pb-8">
        Pack de Vídeos • v2.0
      </p>
    </div>
  );
};

export default PackVideos;
