import { useState } from "react";
import { ArrowLeft, Clock, BookOpen, X, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ModuleBanner from "@/components/ModuleBanner";

// ─── Dados das aulas ──────────────────────────────────────────────────────────

interface Aula {
  numero: string;
  titulo: string;
  descricao: string;
  duracao: string;
  qtdAulas: number;
}

const AULAS: Aula[] = [
  {
    numero:   "01",
    titulo:   "Inteligência Artificial de Vídeos",
    descricao: "Aprenda como gerar postagens automáticas com vídeos, legendas e links prontos.",
    duracao:  "8 min",
    qtdAulas: 3,
  },
  {
    numero:   "02",
    titulo:   "Produto em Vídeo",
    descricao: "Veja como transformar um link de produto em vídeos prontos para divulgar.",
    duracao:  "6 min",
    qtdAulas: 2,
  },
  {
    numero:   "03",
    titulo:   "Produtos em Alta",
    descricao: "Aprenda como encontrar produtos com potencial para divulgar no dia.",
    duracao:  "5 min",
    qtdAulas: 2,
  },
  {
    numero:   "04",
    titulo:   "Gerador de Vídeos Próprios",
    descricao: "Veja como modelar vídeos virais usando um vídeo de referência e um modelo de IA.",
    duracao:  "9 min",
    qtdAulas: 3,
  },
  {
    numero:   "05",
    titulo:   "Grupos Lucrativos",
    descricao: "Aprenda como configurar grupos automáticos com ofertas da Shopee.",
    duracao:  "7 min",
    qtdAulas: 3,
  },
  {
    numero:   "06",
    titulo:   "Pack com +10.000 Vídeos",
    descricao: "Veja como encontrar, baixar e usar vídeos prontos por nicho.",
    duracao:  "4 min",
    qtdAulas: 2,
  },
  {
    numero:   "07",
    titulo:   "Carrosséis Prontos",
    descricao: "Aprenda como baixar sequências de carrossel e usar o link do produto.",
    duracao:  "4 min",
    qtdAulas: 2,
  },
  {
    numero:   "08",
    titulo:   "Stories Prontos",
    descricao: "Veja como baixar stories prontos e postar com o link do produto.",
    duracao:  "3 min",
    qtdAulas: 2,
  },
];

// ─── Modal player simulado ────────────────────────────────────────────────────

function ModalPlayer({ aula, onClose }: { aula: Aula; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
            Aula {aula.numero}
          </p>
          <h3 className="text-sm font-extrabold text-white leading-snug truncate">
            {aula.titulo}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Área do player */}
      <div className="flex-1 flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          {/* Tela do vídeo */}
          <div
            className="w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center"
            style={{ aspectRatio: "16/9" }}
          >
            <button
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 hover:opacity-90 transition-opacity active:scale-95"
            >
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </button>
            <p className="text-white/30 text-xs mt-4">Clique para assistir</p>
          </div>

          {/* Barra de progresso */}
          <div className="mt-4 space-y-2">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-primary rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/30">0:00</span>
              <span className="text-[10px] text-white/30">{aula.duracao}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info inferior */}
      <div className="px-5 py-6 max-w-md mx-auto w-full">
        <p className="text-sm font-semibold text-white mb-1">{aula.titulo}</p>
        <p className="text-xs text-white/40 leading-relaxed">{aula.descricao}</p>
      </div>
    </motion.div>
  );
}

// ─── Card de aula ─────────────────────────────────────────────────────────────

function AulaCard({ aula, index, onAssistir }: { aula: Aula; index: number; onAssistir: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.04)" }}
    >
      <div className="p-4">
        {/* Número da aula */}
        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2.5">
          Aula {aula.numero}
        </p>

        {/* Conteúdo principal */}
        <div className="flex items-start gap-3">
          {/* Thumbnail numérica */}
          <div className="w-14 h-14 rounded-xl bg-primary/8 border border-primary/12 flex items-center justify-center shrink-0">
            <span className="text-xl font-extrabold text-primary/40">{aula.numero}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-bold text-foreground leading-snug mb-1">
              {aula.titulo}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
              {aula.descricao}
            </p>
          </div>
        </div>

        {/* Metadados */}
        <div className="flex items-center gap-3 mt-3 mb-3.5">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <BookOpen className="w-3 h-3" />
            <span>{aula.qtdAulas} aulas rápidas</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{aula.duracao}</span>
          </div>
        </div>

        {/* Botão */}
        <button
          onClick={onAssistir}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-2.5 rounded-xl text-[12px] hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          Assistir aula
        </button>
      </div>
    </motion.div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Treinamento() {
  const navigate = useNavigate();
  const [aulaAtiva, setAulaAtiva] = useState<Aula | null>(null);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <div className="max-w-md mx-auto px-5 pt-6 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase mb-1">
          Treinamento
        </p>
        <h1 className="text-2xl font-extrabold text-foreground leading-tight">
          Treinamento
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aprenda a usar cada funcionalidade do sistema em poucos minutos.
        </p>
      </div>

      {/* ── Banner ── */}
      <ModuleBanner
        src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/banner-treinamento.png"
        alt="Banner Treinamento"
      />

      {/* ── Conteúdo ── */}
      <div className="max-w-md mx-auto px-5 mt-3 pb-12 space-y-3">

        {/* Card "Comece por aqui" */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-primary/5 border border-primary/15 rounded-2xl p-4"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">
            Comece por aqui
          </p>
          <p className="text-sm text-foreground font-semibold leading-snug">
            Assista as aulas na ordem para aprender a usar todo o sistema.
          </p>
        </motion.div>

        {/* Cards das aulas */}
        {AULAS.map((aula, i) => (
          <AulaCard
            key={aula.numero}
            aula={aula}
            index={i + 1}
            onAssistir={() => setAulaAtiva(aula)}
          />
        ))}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-foreground/20 text-[10px] pt-3 tracking-widest uppercase"
        >
          Kit Afiliada Shopee · Treinamento
        </motion.p>
      </div>

      {/* ── Modal player ── */}
      <AnimatePresence>
        {aulaAtiva && (
          <ModalPlayer
            aula={aulaAtiva}
            onClose={() => setAulaAtiva(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
