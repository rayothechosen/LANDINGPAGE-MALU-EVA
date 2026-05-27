import { useState, useEffect } from "react";
import {
  ArrowLeft, Check, Loader2, Plus, Users, TrendingUp,
  MessageCircle, ChevronRight, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ModuleBanner from "@/components/ModuleBanner";
import ModuleDisabledState from "@/components/ModuleDisabledState";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import shopeeImg from "@/assets/shopee-icon.png";
import whatsappImg from "@/assets/whatsapp-icon.webp";

// ─── Constantes ───────────────────────────────────────────────────────────────
const GRUPO_ICON = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/grupo-icon-C74Uqm7c%20(1).png";

const GRUPOS_FAKE = [
  { nome: "ACHADINHOS #50", membros: 487, ofertas: 12, faturamento: "R$98,37" },
  { nome: "ACHADINHOS #07", membros: 312, ofertas: 5,  faturamento: "R$43,88" },
  { nome: "ACHADINHOS #35", membros: 621, ofertas: 11, faturamento: "R$109,79" },
];

const NICHOS_WIZARD = ["Variados", "Maternidade", "Casa", "Moda", "Eletrônicos"];

const OFERTAS_DIA = [
  { valor: 3,   label: "3 ofertas/dia",  desc: "Suave" },
  { valor: 5,   label: "5 ofertas/dia",  desc: "Recomendado" },
  { valor: 8,   label: "8 ofertas/dia",  desc: "Intenso" },
  { valor: 10,  label: "+10 ofertas/dia", desc: "Máximo" },
];

const VELOCIDADES = [
  { value: "lento",     label: "Crescimento Lento",     desc: "Orgânico e seguro" },
  { value: "moderado",  label: "Crescimento Moderado",   desc: "Equilíbrio ideal" },
  { value: "acelerado", label: "Crescimento Acelerado",  desc: "Rápido e agressivo" },
];

type View =
  | "dashboard"
  | "connecting"
  | "connected"
  | "step1"
  | "step2"
  | "step3"
  | "step4"
  | "finalizing"
  | "success";

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="px-5 pb-10 space-y-4">
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-2"
      >
        {[
          { label: "Ofertas",  value: "721" },
          { label: "Grupos",   value: "61" },
          { label: "Cliques",  value: "1.490" },
        ].map(m => (
          <div key={m.label} className="bg-card border border-border rounded-2xl p-3 text-center">
            <p className="text-[1.1rem] font-extrabold text-foreground">
              {m.value}
            </p>
            <p className="text-[9px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-wide">
              {m.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Grupos */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="px-4 pt-4 pb-3 border-b border-border/60 flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">Seus Grupos</p>
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            Hoje
          </span>
        </div>

        <div className="divide-y divide-border/40">
          {GRUPOS_FAKE.map((g, i) => (
            <motion.div
              key={g.nome}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="flex items-center gap-3 px-4 py-3.5"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                <img src={GRUPO_ICON} alt={g.nome} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-bold text-foreground truncate">{g.nome}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {g.ofertas} ofertas enviadas
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-primary">{g.faturamento}</p>
                <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-0.5">
                  <Users className="w-2.5 h-2.5" /> {g.membros} membros
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Conexões */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { label: "WhatsApp", img: whatsappImg, bg: "bg-green-500/10", text: "text-green-600" },
          { label: "Shopee",   img: shopeeImg,   bg: "bg-orange-500/10", text: "text-orange-500" },
        ].map(c => (
          <div key={c.label} className="bg-card border border-border rounded-2xl p-3 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <img src={c.img} alt={c.label} className="w-7 h-7 object-contain" />
            </div>
            <p className="text-xs font-bold text-foreground">{c.label}</p>
            <span className={`text-[10px] font-bold flex items-center gap-1 ${c.text} ${c.bg} px-2 py-0.5 rounded-full`}>
              <Check className="w-2.5 h-2.5" /> Conectado
            </span>
          </div>
        ))}
      </motion.div>

      {/* Botão criar */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        onClick={onCreate}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-opacity"
        style={{ boxShadow: "0 4px 16px rgba(255,90,31,0.30)" }}
      >
        <Plus className="w-4 h-4" />
        Criar novo grupo
      </motion.button>

      <p className="text-center text-muted-foreground/30 text-[10px]">
        Grupos Lucrativos • v2.0
      </p>
    </div>
  );
}

// ─── Connecting Screen ────────────────────────────────────────────────────────
function ConnectingScreen({ onDone }: { onDone: () => void }) {
  const STEPS = [
    "Verificando conexão WhatsApp",
    "Verificando conexão Shopee",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1200);
    const t2 = setTimeout(onDone, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-10">
      <div className="glass-card p-6 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin" />
        </div>
        <h2 className="text-lg font-extrabold text-foreground mb-1">Verificando conexões</h2>
        <p className="text-xs text-muted-foreground mb-6">Aguarde um momento...</p>

        <div className="space-y-3 text-left">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                i < step    ? "bg-green-500"
                : i === step ? "bg-green-500/20 border-2 border-green-500"
                :              "bg-muted"
              }`}>
                {i < step    ? <Check className="w-3 h-3 text-white" />
                : i === step ? <Loader2 className="w-2.5 h-2.5 text-green-500 animate-spin" />
                : null}
              </div>
              <span className={`text-sm ${i <= step ? "text-foreground" : "text-muted-foreground/50"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Connected Screen ─────────────────────────────────────────────────────────
function ConnectedScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-5 pb-10">
      <div className="glass-card p-6 text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30"
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Tudo conectado com sucesso</h2>
          <p className="text-xs text-muted-foreground mt-1">
            WhatsApp e Shopee estão prontos para criar seu grupo
          </p>
        </div>
        <div className="flex justify-center gap-3">
          {[
            { img: whatsappImg, label: "WhatsApp" },
            { img: shopeeImg,   label: "Shopee" },
          ].map(c => (
            <div key={c.label} className="flex flex-col items-center gap-1.5 bg-muted/30 rounded-2xl px-5 py-3">
              <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <img src={c.img} alt={c.label} className="w-7 h-7 object-contain" />
              </div>
              <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" /> {c.label}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={onContinue}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity"
        >
          Continuar
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 1 — Nome e foto ─────────────────────────────────────────────────────
function WizardStep1({ onContinue }: { onContinue: () => void }) {
  const [nome, setNome] = useState("ACHADINHOS #64");

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-10">
      <div className="glass-card p-5 space-y-5">
        <div className="text-center">
          <h2 className="text-[1.1rem] font-extrabold text-foreground mb-1">Nome e foto do grupo</h2>
          <p className="text-xs text-muted-foreground">Configure a identidade do seu grupo</p>
        </div>

        {/* Imagem do grupo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
            <img src={GRUPO_ICON} alt="Foto do grupo" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] font-semibold text-primary">Foto pré-selecionada</span>
        </div>

        {/* Nome */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">
            Nome do grupo
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          onClick={onContinue}
          disabled={!nome.trim()}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Continuar
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 2 — Nicho ───────────────────────────────────────────────────────────
function WizardStep2({ onContinue }: { onContinue: () => void }) {
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const toggle = (n: string) =>
    setSelecionados(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : prev.length < 2 ? [...prev, n] : prev
    );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-10">
      <div className="glass-card p-5 space-y-4">
        <div className="text-center">
          <h2 className="text-[1.1rem] font-extrabold text-foreground mb-1">Qual nicho enviar?</h2>
          <p className="text-xs text-muted-foreground">Selecione até 2 nichos para o grupo</p>
        </div>

        <div className="space-y-2">
          {NICHOS_WIZARD.map(n => {
            const sel = selecionados.includes(n);
            const dis = !sel && selecionados.length >= 2;
            return (
              <button
                key={n}
                onClick={() => toggle(n)}
                disabled={dis}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left ${
                  sel ? "bg-primary/10 border-primary"
                  : dis ? "bg-muted/20 border-border opacity-40"
                  : "bg-muted/30 border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  sel ? "bg-primary border-primary" : "border-border"
                }`}>
                  {sel && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm font-semibold ${sel ? "text-primary" : "text-foreground"}`}>{n}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onContinue}
          disabled={selecionados.length === 0}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Continuar
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 3 — Ofertas por dia ─────────────────────────────────────────────────
function WizardStep3({ onContinue }: { onContinue: () => void }) {
  const [selecionado, setSelecionado] = useState<number>(5);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-10">
      <div className="glass-card p-5 space-y-4">
        <div className="text-center">
          <h2 className="text-[1.1rem] font-extrabold text-foreground mb-1">Ofertas por dia</h2>
          <p className="text-xs text-muted-foreground">Quantas ofertas o bot enviará por dia</p>
        </div>

        <div className="space-y-2">
          {OFERTAS_DIA.map(o => {
            const sel = selecionado === o.valor;
            return (
              <button
                key={o.valor}
                onClick={() => setSelecionado(o.valor)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left ${
                  sel ? "bg-primary/10 border-primary" : "bg-muted/30 border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  sel ? "bg-primary border-primary" : "border-border"
                }`}>
                  {sel && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${sel ? "text-primary" : "text-foreground"}`}>{o.label}</p>
                  <p className="text-[10px] text-muted-foreground">{o.desc}</p>
                </div>
                {o.desc === "Recomendado" && (
                  <span className="text-[9px] font-bold text-white bg-primary px-2 py-0.5 rounded-full shrink-0">
                    Ideal
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity"
        >
          Continuar
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 4 — Velocidade ──────────────────────────────────────────────────────
function WizardStep4({ onCriar }: { onCriar: () => void }) {
  const [selecionado, setSelecionado] = useState("moderado");

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-10">
      <div className="glass-card p-5 space-y-4">
        <div className="text-center">
          <h2 className="text-[1.1rem] font-extrabold text-foreground mb-1">Velocidade de crescimento</h2>
          <p className="text-xs text-muted-foreground">Escolha como seu grupo vai crescer</p>
        </div>

        <div className="space-y-2">
          {VELOCIDADES.map(v => {
            const sel = selecionado === v.value;
            return (
              <button
                key={v.value}
                onClick={() => setSelecionado(v.value)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left ${
                  sel ? "bg-primary/10 border-primary" : "bg-muted/30 border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  sel ? "bg-primary border-primary" : "border-border"
                }`}>
                  {sel && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${sel ? "text-primary" : "text-foreground"}`}>{v.label}</p>
                  <p className="text-[10px] text-muted-foreground">{v.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-muted/30 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-muted-foreground text-center leading-snug flex items-center justify-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-primary shrink-0" />
            O sistema prioriza pessoas interessadas em produtos da Shopee.
          </p>
        </div>

        <button
          onClick={onCriar}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          Criar grupo
        </button>
      </div>
    </motion.div>
  );
}

// ─── Finalizing Screen ────────────────────────────────────────────────────────
function FinalizingScreen({ onDone }: { onDone: () => void }) {
  const STEPS = [
    "Criando grupo no WhatsApp",
    "Conectando com a Shopee",
    "Configurando automação",
    "Ativando bot de ofertas",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) => setTimeout(() => setStep(i), i * 900));
    const done   = setTimeout(onDone, STEPS.length * 900 + 400);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-10">
      <div className="glass-card p-6 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin" />
        </div>
        <h2 className="text-lg font-extrabold text-foreground mb-1">Criando seu grupo.</h2>
        <p className="text-xs text-muted-foreground mb-6">Aguarde enquanto configuramos tudo</p>

        <div className="space-y-3 text-left">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                i < step    ? "bg-green-500"
                : i === step ? "bg-green-500/20 border-2 border-green-500"
                :              "bg-muted"
              }`}>
                {i < step    ? <Check className="w-3 h-3 text-white" />
                : i === step ? <Loader2 className="w-2.5 h-2.5 text-green-500 animate-spin" />
                : null}
              </div>
              <span className={`text-sm ${i <= step ? "text-foreground" : "text-muted-foreground/50"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-5 pb-10">
      <div className="glass-card p-6 text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30"
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Grupo criado!</h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Seu grupo será criado em até <strong>1 hora</strong>.<br />
            O bot já está configurado e pronto para enviar ofertas.
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src={GRUPO_ICON} alt="Grupo" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">ACHADINHOS #64</p>
              <p className="text-[10px] text-muted-foreground">Ativação em andamento...</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500">Ativo</span>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity"
        >
          Ver meus grupos
        </button>
      </div>
    </motion.div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
const GruposLucrativos = () => {
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSystemSettings();
  const [view, setView] = useState<View>("dashboard");

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings.modules.groups.enabled) {
    return (
      <ModuleDisabledState
        title="Grupos Lucrativos indisponível"
        message={settings.modules.groups.disabled_message}
      />
    );
  }

  const STEP_VIEWS: View[] = ["connecting", "connected", "step1", "step2", "step3", "step4", "finalizing", "success"];
  const isWizard = STEP_VIEWS.includes(view);

  const stepLabel = (v: View): string => {
    const map: Partial<Record<View, string>> = {
      connecting: "Verificando conexões",
      connected:  "Conexão confirmada",
      step1:      "Nome do grupo",
      step2:      "Nicho",
      step3:      "Frequência",
      step4:      "Crescimento",
      finalizing: "Criando grupo",
      success:    "Concluído",
    };
    return map[v] ?? "";
  };

  const headerTitles: Partial<Record<View, JSX.Element>> = {
    dashboard:  <><span className="text-primary">Grupos</span> Lucrativos.</>,
    connecting: <>Verificando <span className="text-primary">conexões.</span></>,
    connected:  <>Tudo <span className="text-primary">conectado!</span></>,
    step1:      <>Nome do <span className="text-primary">grupo.</span></>,
    step2:      <>Escolha o <span className="text-primary">nicho.</span></>,
    step3:      <>Ofertas por <span className="text-primary">dia.</span></>,
    step4:      <>Velocidade de <span className="text-primary">crescimento.</span></>,
    finalizing: <>Criando seu <span className="text-primary">grupo.</span></>,
    success:    <>Grupo <span className="text-primary">criado!</span></>,
  };

  const handleBack = () => {
    if (view === "dashboard") navigate("/");
    else setView("dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-foreground/40 text-xs font-semibold hover:text-foreground/70 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {view === "dashboard" ? "Voltar" : "Início"}
            </button>
            {isWizard && view !== "finalizing" && view !== "success" && (
              <span className="text-[10px] text-muted-foreground font-semibold">
                {stepLabel(view)}
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            Grupos Lucrativos
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            {headerTitles[view]}
          </h1>
        </div>
      </div>

      <ModuleBanner
        src="https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/banner-gruposlucrativos.png"
        alt="Grupos Lucrativos"
      />

      <div className="max-w-md mx-auto mt-2">
        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard onCreate={() => setView("connecting")} />
            </motion.div>
          )}
          {view === "connecting" && (
            <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ConnectingScreen onDone={() => setView("connected")} />
            </motion.div>
          )}
          {view === "connected" && (
            <motion.div key="connected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ConnectedScreen onContinue={() => setView("step1")} />
            </motion.div>
          )}
          {view === "step1" && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WizardStep1 onContinue={() => setView("step2")} />
            </motion.div>
          )}
          {view === "step2" && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WizardStep2 onContinue={() => setView("step3")} />
            </motion.div>
          )}
          {view === "step3" && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WizardStep3 onContinue={() => setView("step4")} />
            </motion.div>
          )}
          {view === "step4" && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WizardStep4 onCriar={() => setView("finalizing")} />
            </motion.div>
          )}
          {view === "finalizing" && (
            <motion.div key="finalizing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FinalizingScreen onDone={() => setView("success")} />
            </motion.div>
          )}
          {view === "success" && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SuccessScreen onBack={() => setView("dashboard")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GruposLucrativos;
