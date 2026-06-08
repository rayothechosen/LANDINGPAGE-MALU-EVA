import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  ImageIcon,
  AlertCircle,
  Layers,
  Eye,
  X,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import ModuleBanner from "@/components/ModuleBanner";
import ModuleDisabledState from "@/components/ModuleDisabledState";
import { useSystemSettings } from "@/hooks/useSystemSettings";

// ── Constantes ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

const BASE_CHIPS = [
  "Todos",
  "Pet",
  "Eletronicos",
  "Kids / Maternidade",
  "Casa e Decoracao",
  "Moda e Beleza",
  "Diversos",
];

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface CreativeAsset {
  id: string;
  creative_set_id: string;
  position: number;
  image_url: string;
  r2_key: string;
  original_filename: string | null;
  created_at: string;
}

interface CreativeSet {
  id: string;
  type: string;
  category: string | null;
  product_url: string | null;
  product_name: string | null;
  r2_folder: string | null;
  is_active: boolean;
  created_at: string;
  creative_assets: CreativeAsset[];
}

// ── Modal de visualização do story ────────────────────────────────────────────
// Mostra imagem(ns) em lista vertical com links diretos para download.
// Não usa fetch, blob nem ZIP — evita problema de CORS com o R2.
function StoryPreviewModal({
  set,
  onClose,
}: {
  set: CreativeSet;
  onClose: () => void;
}) {
  const assets = [...(set.creative_assets ?? [])].sort(
    (a, b) => a.position - b.position
  );
  const total = assets.length;

  const [copied, setCopied] = useState(false);

  // Bloquear scroll do body enquanto modal aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Fechar com Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCopy = async () => {
    if (!set.product_url) return;
    await navigator.clipboard.writeText(set.product_url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Cabeçalho fixo */}
      <div className="shrink-0 flex items-start justify-between px-4 pt-4 pb-3 border-b border-white/10">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-white font-bold text-base leading-tight truncate">
            {set.product_name?.trim() || "Story pronto"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {set.category && (
              <span className="text-[10px] font-semibold bg-primary/25 text-primary px-2 py-0.5 rounded-full">
                {set.category}
              </span>
            )}
            <span className="text-white/40 text-[11px]">
              {total} {total === 1 ? "imagem" : "imagens"}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Imagem(ns) scrollável */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {assets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <ImageIcon className="w-8 h-8 text-white/20" />
            <p className="text-white/40 text-sm">Nenhuma imagem disponivel.</p>
          </div>
        )}

        {assets.map((asset, i) => (
          <div key={asset.id} className="space-y-2">
            {/* Label — só exibido se houver mais de 1 imagem */}
            {total > 1 && (
              <p className="text-white/50 text-[11px] font-semibold uppercase tracking-wide">
                Imagem {i + 1} de {total}
              </p>
            )}

            {/* Preview da imagem em proporção retrato */}
            <div className="rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
              <img
                src={asset.image_url}
                alt={`Story ${i + 1}`}
                loading="lazy"
                className="w-full object-contain max-h-[70vh]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* Botão de download — link direto R2, sem fetch */}
            <a
              href={asset.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar imagem
            </a>
          </div>
        ))}
      </div>

      {/* Rodapé fixo com ações principais */}
      <div className="shrink-0 px-4 pb-6 pt-3 space-y-2 border-t border-white/10">
        {set.product_url && (
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-3 rounded-xl transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                Link copiado
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar link do produto
              </>
            )}
          </button>
        )}

        {set.product_url && (
          <a
            href={set.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-primary text-white text-sm font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-4 h-4" />
            Ver produto na Shopee
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Área de preview retrato */}
      <div className="h-52 bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 bg-muted animate-pulse rounded-full" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded-full" />
        <div className="space-y-1.5 pt-1">
          <div className="h-9 bg-muted animate-pulse rounded-xl" />
          <div className="h-9 bg-muted animate-pulse rounded-xl" />
          <div className="h-9 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Card de story ──────────────────────────────────────────────────────────────
function StoryCard({
  set,
  onOpenPreview,
}: {
  set: CreativeSet;
  onOpenPreview: (set: CreativeSet) => void;
}) {
  const assets       = [...(set.creative_assets ?? [])].sort((a, b) => a.position - b.position);
  const firstAsset   = assets[0] ?? null;
  const extraCount   = assets.length - 1;

  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!set.product_url) return;
    await navigator.clipboard.writeText(set.product_url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Preview retrato — clicável, abre o modal */}
      <button
        onClick={() => onOpenPreview(set)}
        className="relative w-full block overflow-hidden bg-muted group focus:outline-none"
        style={{ aspectRatio: "9/14" }}
      >
        {firstAsset ? (
          <>
            <img
              src={firstAsset.image_url}
              alt={set.product_name?.trim() || "Story"}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Overlay sutil no hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {/* Indicador se houver mais imagens */}
            {extraCount > 0 && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                <Layers className="w-3 h-3 text-white" />
                <span className="text-white text-[10px] font-bold">+{extraCount}</span>
              </div>
            )}
            {/* Ícone de visualizar */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
          </div>
        )}
      </button>

      {/* Corpo */}
      <div className="p-3 space-y-2.5">
        {/* Informações */}
        <div>
          {set.category && (
            <span className="inline-block text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-1">
              {set.category}
            </span>
          )}
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
            {set.product_name?.trim() || "Story pronto"}
          </p>
        </div>

        {/* Botoes */}
        <div className="space-y-1.5">
          {/* 1. Ver story */}
          <button
            onClick={() => onOpenPreview(set)}
            className="w-full flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-bold py-2.5 rounded-xl hover:opacity-85 transition-opacity"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver story
          </button>

          {/* 2. Ver produto — laranja, destaque máximo */}
          {set.product_url && (
            <a
              href={set.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver produto na Shopee
            </a>
          )}

          {/* 3. Baixar imagem + Copiar link — lado a lado */}
          <div className="flex gap-1.5">
            {firstAsset && (
              <a
                href={firstAsset.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 bg-background border border-border text-foreground text-xs font-semibold py-2.5 rounded-xl hover:bg-muted transition-colors"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                Baixar
              </a>
            )}

            {set.product_url && (
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1 bg-background border border-border text-foreground text-xs font-semibold py-2.5 rounded-xl hover:bg-muted transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0 text-green-500" />
                    <span className="text-green-500">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    Copiar link
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
const StoriesProntos = () => {
  const navigate = useNavigate();
  const chipsRef = useRef<HTMLDivElement>(null);
  const { settings, loading: settingsLoading } = useSystemSettings();

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [chips, setChips]                   = useState<string[]>(BASE_CHIPS);
  const [sets, setSets]                     = useState<CreativeSet[]>([]);
  const [loading, setLoading]               = useState(true);
  const [loadingMore, setLoadingMore]       = useState(false);
  const [hasMore, setHasMore]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [offset, setOffset]                 = useState(0);

  // Estado do modal
  const [previewSet, setPreviewSet] = useState<CreativeSet | null>(null);

  const openPreview  = (set: CreativeSet) => setPreviewSet(set);
  const closePreview = ()               => setPreviewSet(null);

  // Busca paginada
  const fetchSets = useCallback(
    async (category: string, offsetVal: number): Promise<CreativeSet[]> => {
      let query = supabase
        .from("creative_sets")
        .select(`
          id, type, category, product_url, product_name, r2_folder, is_active, created_at,
          creative_assets (
            id, creative_set_id, position, image_url, r2_key, original_filename, created_at
          )
        `)
        .eq("type", "story")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(offsetVal, offsetVal + PAGE_SIZE - 1);

      if (category !== "Todos") {
        query = query.eq("category", category);
      }

      const { data, error: dbErr } = await query;
      if (dbErr) throw dbErr;
      return (data as unknown as CreativeSet[]) ?? [];
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSets([]);
    setOffset(0);
    setHasMore(false);

    fetchSets(activeCategory, 0)
      .then((data) => {
        if (cancelled) return;
        setSets(data);
        setHasMore(data.length === PAGE_SIZE);
        // Adicionar categorias extras que vieram do banco
        const extra = data
          .map((s) => s.category)
          .filter((c): c is string => !!c && !BASE_CHIPS.includes(c));
        if (extra.length > 0) {
          setChips((prev) => [...new Set([...prev, ...extra])]);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Nao foi possivel carregar os stories agora.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, fetchSets]);

  const loadMore = async () => {
    const nextOffset = offset + PAGE_SIZE;
    setLoadingMore(true);
    try {
      const data = await fetchSets(activeCategory, nextOffset);
      setSets((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      setOffset(nextOffset);
    } catch {
      // silencioso no load more
    } finally {
      setLoadingMore(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings.modules.stories.enabled) {
    return (
      <ModuleDisabledState
        title="Stories Prontos indisponivel"
        message={settings.modules.stories.disabled_message}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-foreground/40 text-xs font-semibold mb-5 hover:text-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            Stories Prontos
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            Imagens prontas <span className="text-primary">para postar.</span>
          </h1>
        </div>
      </div>

      <ModuleBanner src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/banner-storiesprontos.png" alt="Stories Prontos" />

      <div className="max-w-md mx-auto">
        {/* Contador */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-5 mx-5 mb-4 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <p className="text-3xl font-extrabold text-foreground">+1.051</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">stories disponíveis</p>
        </motion.div>

        {/* Chips de categoria */}
        <div className="px-5 mb-4">
          <div
            ref={chipsRef}
            className="glass-card px-3 py-2.5 flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {chips.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-12">
          {/* Skeletons — grid 2 colunas para stories (formato retrato) */}
          {loading && (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Erro */}
          {!loading && error && (
            <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && sets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Layers className="w-7 h-7 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Nenhum story encontrado ainda.
              </p>
            </div>
          )}

          {/* Lista em grid 2 colunas */}
          {!loading && !error && sets.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {sets.map((set, i) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <StoryCard set={set} onOpenPreview={openPreview} />
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-semibold py-3 rounded-2xl hover:shadow-card-hover transition-shadow disabled:opacity-60"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loadingMore ? "Carregando..." : "Carregar mais"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <p className="text-center text-muted-foreground/30 text-[10px] pb-8">
        Stories Prontos • v1.0
      </p>

      {/* Modal de visualização */}
      <AnimatePresence>
        {previewSet && (
          <StoryPreviewModal
            set={previewSet}
            onClose={closePreview}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesProntos;
