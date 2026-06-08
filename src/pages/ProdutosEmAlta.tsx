import { useState } from "react";
import {
  ArrowLeft, Star, ExternalLink, Copy, Check, Package,
  ChevronDown, Loader2, ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import produto1 from "@/assets/produto-1.png";
import produto2 from "@/assets/produto-2.png";
import produto3 from "@/assets/produto-3.png";
import produto4 from "@/assets/produto-4.png";
import produto5 from "@/assets/produto-5.png";

const R2 = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev";
const LOGO_URL = `${R2}/Sem%20t%C3%ADtulo%20-%2027%20de%20maio%20de%202026%20%C3%A0s%2000.47.41.png`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProdutoExtra {
  id: string;
  nome: string;
  nicho: string | null;
  link_shopee: string | null;
  imagem_url: string | null;
}

interface ProdutoMock {
  id: string;
  nome: string;
  preco: string;
  precoOriginal: string;
  desconto: string;
  rating: number;
  badge: "OFICIAL" | "EM ALTA" | "POPULAR" | "DESTAQUE" | "TOP";
  img: string;
  link: string;
}

const PRODUTOS: ProdutoMock[] = [
  {
    id: "1",
    nome: "Medidor de Pressão Automático Túnel - Alta Precisão Hospitalar",
    preco: "R$392,99",
    precoOriginal: "R$1.000,00",
    desconto: "-61%",
    rating: 5.0,
    badge: "OFICIAL",
    img: produto1,
    link: "https://shopee.com.br",
  },
  {
    id: "2",
    nome: "Stick 4K Ultra HD Sistema Android - 512GB+1TB, Controle Bluetooth",
    preco: "R$144,99",
    precoOriginal: "R$356,22",
    desconto: "-59%",
    rating: 5.0,
    badge: "EM ALTA",
    img: produto2,
    link: "https://shopee.com.br",
  },
  {
    id: "3",
    nome: "Massageador De Pescoço e Rosto LED Vibração Fototerapia",
    preco: "R$31,89",
    precoOriginal: "R$79,00",
    desconto: "-60%",
    rating: 5.0,
    badge: "POPULAR",
    img: produto3,
    link: "https://shopee.com.br",
  },
  {
    id: "4",
    nome: "Panela Wok Antiaderente Cerâmica Premium 28cm com Tampa de Vidro",
    preco: "R$89,90",
    precoOriginal: "R$189,00",
    desconto: "-52%",
    rating: 5.0,
    badge: "DESTAQUE",
    img: produto4,
    link: "https://shopee.com.br",
  },
  {
    id: "5",
    nome: "Organizador Multifuncional Dobrável - Guarda-Roupa e Calçados",
    preco: "R$45,90",
    precoOriginal: "R$98,00",
    desconto: "-53%",
    rating: 5.0,
    badge: "TOP",
    img: produto5,
    link: "https://shopee.com.br",
  },
];

const PAGE_SIZE = 50;

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-3 h-3"
          fill={i < Math.floor(rating) ? "#FF5A1F" : "none"}
          stroke={i < Math.floor(rating) ? "#FF5A1F" : "#ccc"}
        />
      ))}
      <span className="text-[10px] font-bold text-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Product Card (TOP 5) ─────────────────────────────────────────────────────

function ProdutoCard({ produto, rank }: { produto: ProdutoMock; rank: number }) {
  const [copied, setCopied] = useState(false);

  const copiar = async () => {
    await navigator.clipboard.writeText(produto.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-shrink-0 w-[220px] bg-card border border-border rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.09)]">
      <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
        <img src={produto.img} alt={produto.nome} className="w-full h-full object-cover" />
        <span className="absolute top-2.5 left-2.5 text-[9px] font-extrabold text-white bg-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
          {produto.badge}
        </span>
        <span className="absolute top-2.5 right-2.5 text-[11px] font-extrabold text-foreground/60 tabular-nums">
          #{String(rank).padStart(2, "0")}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">{produto.nome}</p>
        <Stars rating={produto.rating} />

        <div>
          <p className="text-[1rem] font-extrabold text-foreground leading-none">{produto.preco}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-muted-foreground line-through">{produto.precoOriginal}</span>
            <span className="text-[10px] font-bold text-red-500">{produto.desconto}</span>
          </div>
        </div>

        <div className="flex gap-1.5 mt-auto">
          <button
            onClick={() => window.open(produto.link, "_blank")}
            className="flex-1 flex items-center justify-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold py-2 rounded-2xl hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-3 h-3" />
            Ver produto
          </button>
          <button
            onClick={copiar}
            className="flex items-center justify-center gap-1 bg-muted text-foreground text-[10px] font-semibold px-3 py-2 rounded-2xl hover:bg-muted/70 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            {copied ? "OK" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RowExtra ─────────────────────────────────────────────────────────────────

function RowExtra({ produto, index }: { produto: ProdutoExtra; index: number }) {
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
      className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3"
    >
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide">
          Produto para divulgar
        </span>
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-1 mt-0.5">
          {produto.nome}
        </p>
        {produto.nicho && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{produto.nicho}</p>
        )}
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={() => produto.link_shopee && window.open(produto.link_shopee, "_blank")}
          disabled={!produto.link_shopee}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={copiar}
          disabled={!produto.link_shopee}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-40"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProdutosEmAlta = () => {
  const navigate = useNavigate();

  const [extras, setExtras] = useState<ProdutoExtra[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [erroExtras, setErroExtras] = useState<string | null>(null);
  const [mostrarExtras, setMostrarExtras] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [loadingMais, setLoadingMais] = useState(false);

  const fetchExtras = async (pageIndex: number) => {
    const { data, error } = await supabase.rpc("get_mais_produtos", {
      _limit: PAGE_SIZE,
      _offset: pageIndex * PAGE_SIZE,
    });
    if (error) {
      setErroExtras("Não foi possível carregar mais produtos.");
      return;
    }
    const lista = (data as ProdutoExtra[]) ?? [];
    setExtras(prev => pageIndex === 0 ? lista : [...prev, ...lista]);
    setHasMore(lista.length === PAGE_SIZE);
    setPage(pageIndex);
  };

  const handleVerMais = async () => {
    if (mostrarExtras) return;
    setMostrarExtras(true);
    setLoadingExtras(true);
    await fetchExtras(0);
    setLoadingExtras(false);
  };

  const handleCarregarMais = async () => {
    setLoadingMais(true);
    await fetchExtras(page + 1);
    setLoadingMais(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-md mx-auto px-5 pt-8 pb-0 flex items-center justify-between">
        <img src={LOGO_URL} alt="Logo" className="h-12 w-auto" style={{ objectFit: "contain" }} />
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-foreground/40 text-xs font-semibold hover:text-foreground/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
        </button>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md mx-auto px-5 pt-5 pb-4 text-center"
      >
        <p className="text-[9px] font-bold tracking-[0.2em] text-foreground/40 uppercase mb-1">
          Atualizado hoje
        </p>
        <h1 className="text-[1.9rem] font-extrabold leading-[1.1]">
          Banco de <span className="text-primary">Produtos</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1.5">Os mais vendidos nos últimos 30 dias.</p>
        <div className="w-8 h-0.5 bg-primary mx-auto mt-3 rounded-full" />
      </motion.div>

      {/* Catalog stat */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-md mx-auto px-5 mb-5"
      >
        <div className="bg-card border border-border rounded-3xl p-4 flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Catálogo disponível</p>
            <p className="text-[1.4rem] font-extrabold text-primary leading-none">+3.897 produtos</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">prontos para virar vídeo</p>
          </div>
        </div>
      </motion.div>

      {/* TOP 5 */}
      <div className="max-w-md mx-auto px-5 mb-3 flex items-center justify-between">
        <span className="text-[10px] font-extrabold text-foreground uppercase tracking-widest">Top 5</span>
        <span className="text-[10px] text-muted-foreground">Atualizado hoje</span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="pl-5 pb-2"
      >
        <div className="flex gap-3 overflow-x-auto pb-3 pr-5" style={{ scrollSnapType: "x mandatory" }}>
          {PRODUTOS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              style={{ scrollSnapAlign: "start" }}
            >
              <ProdutoCard produto={p} rank={i + 1} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Extras section */}
      <div className="max-w-md mx-auto px-5 pb-12 mt-2">
        {!mostrarExtras ? (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleVerMais}
            className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-bold py-3.5 rounded-2xl hover:shadow-md transition-shadow"
          >
            <ChevronDown className="w-4 h-4 text-primary" />
            Ver +500 produtos para divulgar
          </motion.button>
        ) : (
          <AnimatePresence>
            <motion.div
              key="extras"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
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
                <p className="text-center text-sm text-destructive py-6">{erroExtras}</p>
              ) : extras.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground/25 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum produto disponível no momento.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {extras.map((p, i) => (
                      <RowExtra key={p.id} produto={p} index={i} />
                    ))}
                  </div>

                  {hasMore && (
                    <button
                      onClick={handleCarregarMais}
                      disabled={loadingMais}
                      className="w-full flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-semibold py-3 rounded-2xl hover:shadow-md transition-shadow disabled:opacity-60 mb-4"
                    >
                      {loadingMais ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                      {loadingMais ? "Carregando..." : "Carregar mais"}
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <p className="text-center text-muted-foreground/30 text-[10px] pb-8">
        Banco de Produtos • Atualizado diariamente
      </p>
    </div>
  );
};

export default ProdutosEmAlta;
