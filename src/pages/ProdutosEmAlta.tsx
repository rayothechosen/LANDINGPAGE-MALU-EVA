import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import produtosImg from "@/assets/produtos-em-alta.png";
import ModuleBanner from "@/components/ModuleBanner";
import ModuleDisabledState from "@/components/ModuleDisabledState";
import { useSystemSettings } from "@/hooks/useSystemSettings";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Produto {
  id: string;
  nome: string;
  nicho: string | null;
  link_shopee: string | null;
  imagem_url: string | null;
  tags: string[] | null;
}

// ─── Helper: embaralha array (Fisher-Yates) ───────────────────────────────────

function embaralhar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── CardHero (ranking #1) ────────────────────────────────────────────────────

function CardHero({ produto }: { produto: Produto }) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const copiar = async () => {
    if (!produto.link_shopee) return;
    await navigator.clipboard.writeText(produto.link_shopee);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border-2 border-primary/25 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.13)] mb-3">
      {/* Imagem grande */}
      <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden">
        {produto.imagem_url && !imgError ? (
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
            <ShoppingBag className="w-14 h-14 text-primary/25" />
          </div>
        )}

        {/* Gradiente inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Badge ranking + status */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold bg-primary text-white px-2.5 py-1 rounded-full shadow-md">
            #1 Ranking de destaque
          </span>
          <span className="text-[9px] font-bold bg-white/90 backdrop-blur-sm text-foreground px-2 py-0.5 rounded-full w-fit">
            Produto em evidencia
          </span>
        </div>

        {/* Nicho */}
        {produto.nicho && (
          <span className="absolute top-3 right-3 text-[10px] font-bold bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
            {produto.nicho}
          </span>
        )}

        {/* Label inferior */}
        <div className="absolute bottom-3 left-4">
          <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">
            Selecionado para divulgar
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col gap-3">
        <p className="text-sm font-extrabold text-foreground leading-snug line-clamp-2">
          {produto.nome}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() =>
              produto.link_shopee && window.open(produto.link_shopee, "_blank")
            }
            disabled={!produto.link_shopee}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40 shadow-button"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver produto
          </button>
          <button
            onClick={copiar}
            disabled={!produto.link_shopee}
            className="flex items-center justify-center gap-1.5 bg-muted text-foreground text-xs font-bold px-5 py-3 rounded-2xl hover:bg-muted/80 transition-colors disabled:opacity-40"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CardRanking (#2 em diante) ───────────────────────────────────────────────

function CardRanking({ produto, rank }: { produto: Produto; rank: number }) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isTop3 = rank <= 3;

  const copiar = async () => {
    if (!produto.link_shopee) return;
    await navigator.clipboard.writeText(produto.link_shopee);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Badge de ranking com cores por posição
  const rankBadgeClass =
    rank === 2
      ? "bg-primary/90 text-white"
      : rank === 3
      ? "bg-primary/60 text-white"
      : "bg-black/45 text-white";

  return (
    <div
      className={`bg-card rounded-3xl overflow-hidden flex flex-col transition-shadow hover:shadow-card-hover ${
        isTop3 ? "border-2 border-primary/20 shadow-[0_4px_20px_rgba(0,0,0,0.09)]" : "border border-border"
      }`}
    >
      {/* Imagem */}
      <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
        {produto.imagem_url && !imgError ? (
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <ShoppingBag className="w-8 h-8 text-primary/25" />
          </div>
        )}

        {/* Badge ranking */}
        <span
          className={`absolute top-2.5 left-2.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${rankBadgeClass}`}
        >
          #{rank}
        </span>

        {/* Nicho */}
        {produto.nicho && (
          <span className="absolute top-2.5 right-2.5 text-[9px] font-bold bg-white/85 backdrop-blur-sm text-foreground px-2 py-0.5 rounded-full">
            {produto.nicho}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {isTop3 && (
          <span className="text-[9px] font-bold text-primary uppercase tracking-wide">
            Produto recomendado
          </span>
        )}

        <p className="text-xs font-bold text-foreground leading-snug line-clamp-3 flex-1">
          {produto.nome}
        </p>

        <div className="flex gap-1.5 mt-auto">
          <button
            onClick={() =>
              produto.link_shopee && window.open(produto.link_shopee, "_blank")
            }
            disabled={!produto.link_shopee}
            className="flex-1 flex items-center justify-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold py-2 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <ExternalLink className="w-3 h-3" />
            Ver produto
          </button>
          <button
            onClick={copiar}
            disabled={!produto.link_shopee}
            className="flex items-center justify-center gap-1 bg-muted text-foreground text-[10px] font-bold px-3 py-2 rounded-2xl hover:bg-muted/80 transition-colors disabled:opacity-40"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "OK" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RowExtra ─────────────────────────────────────────────────────────────────

function RowExtra({ produto, index }: { produto: Produto; index: number }) {
  const [copied, setCopied] = useState(false);

  const copiar = async () => {
    if (!produto.link_shopee) return;
    await navigator.clipboard.writeText(produto.link_shopee);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.4) }}
      className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 hover:shadow-card-hover transition-shadow"
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide">
          Produto para testar
        </span>
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-1 mt-0.5">
          {produto.nome}
        </p>
        {produto.nicho && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{produto.nicho}</p>
        )}
      </div>

      {/* Botoes icone */}
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={() =>
            produto.link_shopee && window.open(produto.link_shopee, "_blank")
          }
          disabled={!produto.link_shopee}
          title="Abrir produto"
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={copiar}
          disabled={!produto.link_shopee}
          title="Copiar link"
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-40"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────

const PAGE_SIZE_EXTRAS = 50;

const ProdutosEmAlta = () => {
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSystemSettings();

  // Destaques
  const [destaques, setDestaques] = useState<Produto[]>([]);
  const [loadingDestaques, setLoadingDestaques] = useState(true);
  const [erroDestaques, setErroDestaques] = useState<string | null>(null);

  // Extras
  const [extras, setExtras] = useState<Produto[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [erroExtras, setErroExtras] = useState<string | null>(null);
  const [mostrarExtras, setMostrarExtras] = useState(false);
  const [hasMoreExtras, setHasMoreExtras] = useState(true);
  const [pageExtras, setPageExtras] = useState(0);
  const [carregandoMais, setCarregandoMais] = useState(false);

  // Busca destaques ao montar via RPC
  useEffect(() => {
    const fetchDestaques = async () => {
      setLoadingDestaques(true);
      const { data, error } = await supabase.rpc("get_produtos_destaque");

      console.log("[Produtos] get_produtos_destaque →", { data, error });
      if (error) {
        console.error("[Produtos] Erro na RPC get_produtos_destaque:", error.message);
        setErroDestaques("Nao foi possivel carregar os destaques.");
      } else {
        const lista = (data as Produto[]) ?? [];
        console.log("[Produtos] Quantidade de destaques recebidos:", lista.length);
        setDestaques(embaralhar(lista));
      }
      setLoadingDestaques(false);
    };
    fetchDestaques();
  }, []);

  // Busca extras via RPC (paginada por offset)
  const fetchExtras = async (pageIndex: number) => {
    const offsetAtual = pageIndex * PAGE_SIZE_EXTRAS;

    const { data, error } = await supabase.rpc("get_mais_produtos", {
      _limit: PAGE_SIZE_EXTRAS,
      _offset: offsetAtual,
    });

    console.log("[Produtos] get_mais_produtos →", { data, error, offsetAtual });
    if (error) {
      console.error("[Produtos] Erro na RPC get_mais_produtos:", error.message);
      setErroExtras("Nao foi possivel carregar mais produtos.");
      return;
    }

    const lista = (data as Produto[]) ?? [];
    console.log("[Produtos] Quantidade de extras recebidos:", lista.length);
    setExtras((prev) => (pageIndex === 0 ? lista : [...prev, ...lista]));
    setHasMoreExtras(lista.length === PAGE_SIZE_EXTRAS);
    setPageExtras(pageIndex);
  };

  const handleVerMais = async () => {
    if (mostrarExtras) return;
    setMostrarExtras(true);
    setLoadingExtras(true);
    await fetchExtras(0);
    setLoadingExtras(false);
  };

  const handleCarregarMais = async () => {
    setCarregandoMais(true);
    await fetchExtras(pageExtras + 1);
    setCarregandoMais(false);
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings.modules.hot_products.enabled) {
    return (
      <ModuleDisabledState
        title="Produtos em Alta indisponivel"
        message={settings.modules.hot_products.disabled_message}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-foreground/40 text-xs font-semibold mb-5 hover:text-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            Produtos em Alta
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            Os mais vendidos <span className="text-primary">desta semana.</span>
          </h1>
        </div>
      </div>

      <ModuleBanner src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/banner-produtosemalta.png" alt="Produtos em Alta" />

      <div className="max-w-md mx-auto px-5 pb-12">

        {/* Glass card de intro */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-4 mb-5 mx-5"
        >
          <div className="flex items-center gap-2 mb-0.5">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <p className="text-sm font-extrabold text-foreground">Destaques do dia</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Selecionados manualmente para divulgacao
          </p>
        </motion.div>

        {/* Produtos em destaque */}
        <div className="px-5">
          {loadingDestaques ? (
            <div className="flex justify-center py-14">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : erroDestaques ? (
            <div className="text-center py-10">
              <p className="text-sm text-destructive">{erroDestaques}</p>
            </div>
          ) : destaques.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/25 mx-auto mb-3" />
              <p className="text-sm font-bold text-foreground mb-1">Nenhum destaque hoje</p>
              <p className="text-xs text-muted-foreground">
                Volte mais tarde para ver os produtos em destaque.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-6"
            >
              {/* Card hero — posicao #1 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <CardHero produto={destaques[0]} />
              </motion.div>

              {/* Grade #2 em diante */}
              {destaques.length > 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {destaques.slice(1).map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.05 }}
                    >
                      <CardRanking produto={p} rank={i + 2} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Secao extras */}
          {!loadingDestaques && !erroDestaques && (
            <>
              {!mostrarExtras ? (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleVerMais}
                  className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-bold py-3.5 rounded-2xl hover:shadow-card-hover transition-shadow mb-4"
                >
                  <ChevronDown className="w-4 h-4 text-primary" />
                  Mais produtos para divulgar
                </motion.button>
              ) : (
                <AnimatePresence>
                  <motion.div
                    key="extras-section"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Separador com titulo */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-px bg-border" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">
                        Mais produtos para divulgar
                      </p>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {loadingExtras ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : erroExtras ? (
                      <p className="text-center text-sm text-destructive py-6">
                        {erroExtras}
                      </p>
                    ) : extras.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Nenhum produto disponivel no momento.
                      </p>
                    ) : (
                      <>
                        <div className="space-y-2 mb-4">
                          {extras.map((p, i) => (
                            <RowExtra key={p.id} produto={p} index={i} />
                          ))}
                        </div>

                        {hasMoreExtras && (
                          <button
                            onClick={handleCarregarMais}
                            disabled={carregandoMais}
                            className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-semibold py-3 rounded-2xl hover:shadow-card-hover transition-shadow disabled:opacity-60 mb-4"
                          >
                            {carregandoMais ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            {carregandoMais ? "Carregando..." : "Carregar mais"}
                          </button>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          )}
        </div>
      </div>

      <p className="text-center text-muted-foreground/30 text-[10px] pb-8">
        Produtos em Alta • v2.0
      </p>
    </div>
  );
};

export default ProdutosEmAlta;
