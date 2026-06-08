import { useState } from "react";
import { ArrowLeft, Check, Sparkles, Flame, Package, Play, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import shopeeImg from "@/assets/shopee-icon.png";
import tiktokImg from "@/assets/tiktok-icon.png";
import instagramImg from "@/assets/instagram-icon.webp";
import produto1 from "@/assets/produto-1.png";
import produto2 from "@/assets/produto-2.png";
import produto3 from "@/assets/produto-3.png";
import produto4 from "@/assets/produto-4.png";
import produto5 from "@/assets/produto-5.png";

const PRODUTOS_PLANO = [
  { id: "1", img: produto1, nome: "Medidor de Pressão Automático" },
  { id: "2", img: produto2, nome: "Stick 4K Ultra HD Android" },
  { id: "3", img: produto3, nome: "Massageador LED Pescoço" },
  { id: "4", img: produto4, nome: "Panela Wok Cerâmica 28cm" },
  { id: "5", img: produto5, nome: "Organizador Multifuncional" },
];

const DIAS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const ESTILOS = [
  { id: "viral",    label: "Viral",           Icon: Flame },
  { id: "unboxing", label: "Unboxing",         Icon: Package },
  { id: "demo",     label: "Demonstrativo",    Icon: Play },
  { id: "ia",       label: "Apresentação IA",  Icon: Bot },
];
const REDES = [
  { id: "shopee", label: "Shopee Vídeo", img: shopeeImg },
  { id: "tiktok", label: "TikTok",       img: tiktokImg },
  { id: "instagram", label: "Instagram", img: instagramImg },
];

const DURACOES = [
  { id: "7",  label: "7 dias",  sub: "14 vídeos",  tag: null },
  { id: "30", label: "30 dias", sub: "60 vídeos",  tag: "RECOMENDADO" },
  { id: "90", label: "90 dias", sub: "180 vídeos", tag: null },
];

export default function PlanoPostagem() {
  const navigate = useNavigate();
  const [duracao, setDuracao] = useState("30");
  const [produtos, setProdutos] = useState<string[]>(["1", "2", "3"]);
  const [dias, setDias] = useState<string[]>(["SEG", "TER", "QUA", "QUI", "SEX"]);
  const [estilos, setEstilos] = useState<string[]>(["viral", "unboxing"]);
  const [redes, setRedes] = useState<string[]>(["shopee", "tiktok", "instagram"]);
  const [gerado, setGerado] = useState(false);

  const toggle = <T extends string>(set: T[], val: T, setFn: (v: T[]) => void) =>
    setFn(set.includes(val) ? set.filter(x => x !== val) : [...set, val]);

  const duracaoObj = DURACOES.find(d => d.id === duracao)!;
  const totalVideos =
    duracao === "7" ? Math.round((dias.length / 7) * 7 * Math.max(estilos.length, 1) * Math.max(produtos.length, 1))
    : duracao === "30" ? Math.round((dias.length / 7) * 30 * Math.max(estilos.length, 1) * Math.max(produtos.length, 1))
    : Math.round((dias.length / 7) * 90 * Math.max(estilos.length, 1) * Math.max(produtos.length, 1));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-foreground/40 text-xs font-semibold mb-5 hover:text-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            Estratégia
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            Plano de <span className="text-primary">Postagem.</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Monte sua agenda completa de conteúdo em poucos cliques.</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pb-14 mt-4 space-y-4">

        {/* Duração */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-4"
        >
          <p className="text-[10px] font-extrabold text-foreground uppercase tracking-widest mb-3">
            Duração do plano
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DURACOES.map(d => (
              <button
                key={d.id}
                onClick={() => setDuracao(d.id)}
                className={`relative rounded-2xl py-3 px-2 text-center border-2 transition-all ${
                  duracao === d.id ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                }`}
              >
                {d.tag && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[7px] font-extrabold bg-primary text-white px-1.5 py-0.5 rounded-full uppercase whitespace-nowrap">
                    {d.tag}
                  </span>
                )}
                <p className={`text-lg font-extrabold leading-none ${duracao === d.id ? "text-primary" : "text-foreground"}`}>
                  {d.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{d.sub}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Produtos */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="bg-card border border-border rounded-3xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-extrabold text-foreground uppercase tracking-widest">Produtos</p>
            <span className="text-[10px] text-primary font-semibold">{produtos.length} selecionados</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PRODUTOS_PLANO.map(p => {
              const sel = produtos.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(produtos, p.id, setProdutos)}
                  className={`flex-shrink-0 w-[80px] rounded-2xl overflow-hidden border-2 transition-all relative ${
                    sel ? "border-primary" : "border-transparent opacity-60"
                  }`}
                >
                  <div className="aspect-square bg-muted">
                    <img src={p.img} alt={p.nome} className="w-full h-full object-cover" />
                  </div>
                  {sel && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Dias da semana */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-3xl p-4"
        >
          <p className="text-[10px] font-extrabold text-foreground uppercase tracking-widest mb-3">
            Dias da semana
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {DIAS.map(d => {
              const sel = dias.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggle(dias, d, setDias)}
                  className={`py-2 rounded-xl text-[10px] font-extrabold transition-all ${
                    sel
                      ? "bg-foreground text-background"
                      : "bg-muted/40 text-muted-foreground border border-border"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Estilos de vídeo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-card border border-border rounded-3xl p-4"
        >
          <p className="text-[10px] font-extrabold text-foreground uppercase tracking-widest mb-3">
            Estilos de vídeo
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ESTILOS.map(e => {
              const sel = estilos.includes(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => toggle(estilos, e.id, setEstilos)}
                  className={`rounded-2xl py-3 px-1 flex flex-col items-center gap-1 border-2 transition-all ${
                    sel ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                  }`}
                >
                  <e.Icon className={`w-5 h-5 ${sel ? "text-primary" : "text-foreground/60"}`} />
                  <span className={`text-[9px] font-bold text-center leading-tight ${sel ? "text-primary" : "text-foreground"}`}>
                    {e.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Onde publicar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-card border border-border rounded-3xl p-4"
        >
          <p className="text-[10px] font-extrabold text-foreground uppercase tracking-widest mb-3">
            Onde publicar
          </p>
          <div className="grid grid-cols-3 gap-2">
            {REDES.map(r => {
              const sel = redes.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggle(redes, r.id, setRedes)}
                  className={`rounded-2xl py-3 px-2 flex flex-col items-center gap-2 border-2 transition-all ${
                    sel ? "border-primary bg-primary/5" : "border-border bg-muted/20 opacity-60"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <img src={r.img} alt={r.label} className="w-5 h-5 object-contain" />
                  </div>
                  <span className={`text-[9px] font-bold text-center leading-tight ${sel ? "text-primary" : "text-foreground"}`}>
                    {r.label}
                  </span>
                  {sel && <Check className="w-3 h-3 text-primary" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Resumo do plano */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bg-foreground rounded-3xl p-5 text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-1">Resumo do plano</p>
              <p className="text-[2.2rem] font-extrabold leading-none text-primary">{Math.max(totalVideos, 1)}</p>
              <p className="text-xs text-white/60 mt-0.5">vídeos no total</p>
            </div>
            {/* Thumbs dos produtos selecionados */}
            <div className="flex -space-x-2">
              {PRODUTOS_PLANO.filter(p => produtos.includes(p.id)).slice(0, 3).map(p => (
                <div key={p.id} className="w-9 h-9 rounded-xl border-2 border-white/10 overflow-hidden">
                  <img src={p.img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: "Duração",    value: duracaoObj.label },
              { label: "Produtos",   value: `${Math.max(produtos.length, 0)}` },
              { label: "Dias/sem",   value: `${dias.length}` },
              { label: "Estilos",    value: `${Math.max(estilos.length, 0)}` },
              { label: "Redes",      value: `${Math.max(redes.length, 0)}` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                <span className="text-[10px] text-white/50">{item.label}</span>
                <span className="text-[11px] font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>

          {gerado ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-3 text-center">
              <Check className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-green-400">Plano gerado com sucesso!</p>
              <p className="text-[10px] text-green-400/70 mt-0.5">Seu calendário está pronto</p>
            </div>
          ) : (
            <button
              onClick={() => setGerado(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-opacity"
              style={{ boxShadow: "0 4px 16px rgba(255,90,31,0.35)" }}
            >
              <Sparkles className="w-4 h-4" />
              Gerar plano completo
            </button>
          )}
        </motion.div>

        <p className="text-center text-muted-foreground/30 text-[10px]">
          Plano de Postagem • v2.0
        </p>
      </div>
    </div>
  );
}
