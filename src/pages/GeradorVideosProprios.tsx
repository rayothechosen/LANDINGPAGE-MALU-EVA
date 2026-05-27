import { useState, useEffect } from "react";
import { ArrowLeft, Check, Loader2, Upload, Sparkles, Clipboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PostagemAutomaticaPopup from "@/components/PostagemAutomaticaPopup";
import tiktokImg from "@/assets/tiktok-icon.png";

// ─── URLs fixas ───────────────────────────────────────────────────────────────
const PREVIEW_VIDEO  = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/antesvideosproprios.mp4";
const DEMO_TIKTOK    = "https://www.tiktok.com/video/7620556285833907476/";
const MODEL_IMG      = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/modeloia.png";
const RESULT_VIDEO   = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/resultadovideosproprios.mp4";
const BANNER_URL     = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/banner-videosproprios.png";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type View =
  | "step1"
  | "step2"
  | "model_config"
  | "model_loading"
  | "model_result"
  | "video_loading"
  | "result";

// ─── Loading animado ──────────────────────────────────────────────────────────
function LoadingScreen({
  titulo, steps, onDone,
}: { titulo: string; steps: string[]; onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setStep(i), i * 900));
    const done   = setTimeout(onDone, steps.length * 900 + 400);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-10">
      <div className="glass-card p-6 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">{titulo}</h2>
        <p className="text-xs text-muted-foreground mb-6">Não feche essa tela</p>

        <div className="space-y-3 text-left">
          {steps.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                i < step    ? "bg-primary"
                : i === step ? "bg-primary/20 border-2 border-primary"
                :              "bg-muted"
              }`}>
                {i < step    ? <Check className="w-3 h-3 text-white" />
                : i === step ? <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
                : null}
              </div>
              <span className={`text-sm ${i <= step ? "text-foreground font-medium" : "text-muted-foreground/50"}`}>
                {s}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 1 — Link do vídeo ───────────────────────────────────────────────────
function Step1({ onContinue }: { onContinue: () => void }) {
  const [link, setLink]           = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleLink = (v: string) => {
    setLink(v);
    if (v.trim()) setShowPreview(true);
    else setShowPreview(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-10">
      <div className="glass-card p-5 space-y-4">
        <div className="text-center">
          <h2 className="text-[1.15rem] font-extrabold text-foreground mb-1">
            Cole o link do vídeo que quer modelar
          </h2>
          <p className="text-xs text-muted-foreground">Instagram, TikTok ou Shopee Vídeo</p>
        </div>

        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://www.tiktok.com/@..."
            value={link}
            onChange={e => handleLink(e.target.value)}
            className="flex-1 bg-muted/50 border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={() => handleLink(DEMO_TIKTOK)}
            title="Usar link de demonstração"
            className="w-[52px] flex items-center justify-center rounded-2xl bg-muted/50 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all shrink-0"
          >
            <Clipboard className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Preview fake estilo TikTok */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl overflow-hidden relative bg-black mx-auto"
              style={{ aspectRatio: "9/16", maxHeight: 360, maxWidth: 200 }}
            >
              <video
                src={PREVIEW_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Overlay TikTok */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Logo TikTok canto superior */}
                <div className="absolute top-3 left-0 right-0 flex justify-center">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <img src={tiktokImg} alt="TikTok" className="w-4 h-4 object-contain" />
                    <span className="text-white text-[11px] font-bold">TikTok</span>
                  </div>
                </div>
                {/* Username */}
                <div className="absolute bottom-12 left-3 right-3">
                  <p className="text-white font-bold text-sm drop-shadow-md">@susiachadinhosbrasil</p>
                  <p className="text-white/70 text-[10px] mt-0.5 drop-shadow">Produto incrível! #shopee #achadinhos</p>
                </div>
                {/* Barra de progresso fake */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-white/60 w-2/5" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onContinue}
          disabled={!link.trim()}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Continuar
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 2 — Quem irá aparecer ───────────────────────────────────────────────
function Step2({
  onVoceMesmo, onModeloIA,
}: { onVoceMesmo: () => void; onModeloIA: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-10">
      <div className="glass-card p-5 space-y-4">
        <div className="text-center">
          <h2 className="text-[1.15rem] font-extrabold text-foreground mb-1">Quem irá aparecer?</h2>
          <p className="text-xs text-muted-foreground">Escolha o tipo de apresentação do vídeo</p>
        </div>

        {/* Opção: Você mesmo */}
        <button
          onClick={onVoceMesmo}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Você mesmo</p>
            <p className="text-xs text-muted-foreground mt-0.5">Upload de foto sua para o vídeo</p>
          </div>
        </button>

        {/* Opção: Modelo de IA (principal da demo) */}
        <button
          onClick={onModeloIA}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-primary bg-primary/10 hover:bg-primary/15 transition-all text-left relative overflow-hidden"
        >
          <div className="absolute top-2 right-3">
            <span className="text-[9px] font-bold text-white bg-primary px-2 py-0.5 rounded-full uppercase tracking-wide">
              Recomendado
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">Modelo de IA</p>
            <p className="text-xs text-muted-foreground mt-0.5">IA cria um modelo realista para o vídeo</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Model Config ─────────────────────────────────────────────────────────────
function ModelConfig({ onGerar }: { onGerar: () => void }) {
  const [sexo, setSexo]       = useState<string>("");
  const [idade, setIdade]     = useState<string>("");
  const [aparencia, setApar]  = useState<string>("");

  const completo = sexo && idade && aparencia;

  const opts = {
    sexo:     ["Mulher", "Homem"],
    idade:    ["18 a 25", "26 a 35", "36 a 45", "46+"],
    aparencia:["Brasileira", "Europeia", "Latina", "Não tenho preferência"],
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-10">
      <div className="glass-card p-5 space-y-5">
        <div className="text-center">
          <h2 className="text-[1.15rem] font-extrabold text-foreground mb-1">Configurar Modelo IA</h2>
          <p className="text-xs text-muted-foreground">Personalize as características do modelo</p>
        </div>

        {/* Sexo */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Sexo</p>
          <div className="grid grid-cols-2 gap-2">
            {opts.sexo.map(o => (
              <button key={o} onClick={() => setSexo(o)}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  sexo === o ? "bg-primary text-white border-primary" : "bg-muted/40 text-foreground border-border hover:border-primary/40"
                }`}
              >{o}</button>
            ))}
          </div>
        </div>

        {/* Faixa de idade */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Faixa de idade</p>
          <div className="grid grid-cols-2 gap-2">
            {opts.idade.map(o => (
              <button key={o} onClick={() => setIdade(o)}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  idade === o ? "bg-primary text-white border-primary" : "bg-muted/40 text-foreground border-border hover:border-primary/40"
                }`}
              >{o}</button>
            ))}
          </div>
        </div>

        {/* Aparência */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Aparência</p>
          <div className="space-y-1.5">
            {opts.aparencia.map(o => (
              <button key={o} onClick={() => setApar(o)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                  aparencia === o ? "bg-primary/10 border-primary" : "bg-muted/30 border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  aparencia === o ? "border-primary bg-primary" : "border-border"
                }`}>
                  {aparencia === o && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className={`text-sm font-medium ${aparencia === o ? "text-primary font-semibold" : "text-foreground"}`}>
                  {o}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onGerar}
          disabled={!completo}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Gerar modelo
        </button>
      </div>
    </motion.div>
  );
}

// ─── Model Result ─────────────────────────────────────────────────────────────
function ModelResult({ onGerarVideo }: { onGerarVideo: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-10">
      <div className="glass-card p-5 space-y-4">
        <div className="text-center">
          <h2 className="text-[1.1rem] font-extrabold text-foreground mb-1">Modelo gerado!</h2>
          <p className="text-xs text-muted-foreground">Seu modelo IA está pronto para o vídeo</p>
        </div>

        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 16 }}
          className="rounded-2xl overflow-hidden border border-primary/20"
          style={{ maxHeight: 340 }}
        >
          <img
            src={MODEL_IMG}
            alt="Modelo IA"
            className="w-full object-cover"
            style={{ objectPosition: "top" }}
          />
        </motion.div>

        <button
          onClick={onGerarVideo}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-opacity"
          style={{ boxShadow: "0 4px 16px rgba(255,90,31,0.30)" }}
        >
          <Sparkles className="w-4 h-4" />
          Gerar vídeo
        </button>
      </div>
    </motion.div>
  );
}

// ─── Final Result ─────────────────────────────────────────────────────────────
function FinalResult() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <AnimatePresence>
        {showPopup && <PostagemAutomaticaPopup onClose={() => setShowPopup(false)} />}
      </AnimatePresence>

      <div className="px-5 pb-10 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-[1.2rem] font-extrabold text-foreground">Comparação final</h2>
          <p className="text-xs text-muted-foreground mt-1">Veja o vídeo original e o vídeo criado lado a lado.</p>
        </motion.div>

        {/* Side-by-side comparison */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Original */}
          <div className="flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-center mb-2">
              Vídeo original
            </p>
            <div
              className="rounded-2xl overflow-hidden bg-black mx-auto"
              style={{ aspectRatio: "9/16", maxHeight: 340 }}
            >
              <video
                src={PREVIEW_VIDEO}
                muted
                loop
                playsInline
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Criado */}
          <div className="flex-1">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wide text-center mb-2">
              Vídeo criado
            </p>
            <div
              className="rounded-2xl overflow-hidden bg-black border-2 border-primary/30 mx-auto"
              style={{ aspectRatio: "9/16", maxHeight: 340 }}
            >
              <video
                src={RESULT_VIDEO}
                muted
                loop
                playsInline
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Legenda sugerida */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-card border border-border rounded-2xl p-4 space-y-2"
        >
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
            Legenda sugerida
          </p>
          <p className="text-sm text-foreground leading-snug">
            Olha esse vídeo que eu criei com IA! Produto incrível da Shopee com qualidade top e preço acessível. Vale muito a pena conferir! Link na bio.
          </p>
          <p className="text-[11px] text-primary font-medium">
            #tiktok #viral #achadinhos #shopee #iacreatorcontent #produtodaboa
          </p>
        </motion.div>

        {/* Botão Postagem Automática */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          onClick={() => setShowPopup(true)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-opacity"
          style={{ boxShadow: "0 4px 16px rgba(255,90,31,0.30)" }}
        >
          <Sparkles className="w-4 h-4" />
          Postagem Automática
        </motion.button>
      </div>
    </>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function GeradorVideosProprios() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("step1");

  const headerTitles: Record<View, JSX.Element> = {
    step1:        <>Cole o <span className="text-primary">link do vídeo.</span></>,
    step2:        <>Quem irá <span className="text-primary">aparecer?</span></>,
    model_config: <>Configure o <span className="text-primary">modelo IA.</span></>,
    model_loading:<>Gerando <span className="text-primary">modelo.</span></>,
    model_result: <>Modelo <span className="text-primary">criado!</span></>,
    video_loading:<>Gerando <span className="text-primary">vídeo.</span></>,
    result:       <>Vídeo <span className="text-primary">pronto!</span></>,
  };

  const handleBack = () => {
    if (view === "step1")        navigate("/");
    else if (view === "step2")   setView("step1");
    else if (view === "model_config") setView("step2");
    else if (view === "model_result") setView("model_config");
    else if (view === "result")  setView("step1");
    else navigate("/");
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
              {view === "step1" ? "Voltar" : "Anterior"}
            </button>
          </div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            Vídeos Próprios
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            {headerTitles[view]}
          </h1>
        </div>
      </div>

      {/* Banner */}
      <div className="max-w-md mx-auto px-5">
        <div className="w-full rounded-2xl overflow-hidden mb-2">
          <img
            src={BANNER_URL}
            alt="Vídeos Próprios"
            className="w-full h-auto block"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {view === "step1" && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Step1 onContinue={() => setView("step2")} />
            </motion.div>
          )}
          {view === "step2" && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Step2
                onVoceMesmo={() => setView("model_config")}
                onModeloIA={() => setView("model_config")}
              />
            </motion.div>
          )}
          {view === "model_config" && (
            <motion.div key="model_config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ModelConfig onGerar={() => setView("model_loading")} />
            </motion.div>
          )}
          {view === "model_loading" && (
            <motion.div key="model_loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingScreen
                titulo="Gerando seu modelo."
                steps={[
                  "Processando características",
                  "Criando modelo fotorrealista",
                  "Ajustando detalhes faciais",
                ]}
                onDone={() => setView("model_result")}
              />
            </motion.div>
          )}
          {view === "model_result" && (
            <motion.div key="model_result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ModelResult onGerarVideo={() => setView("video_loading")} />
            </motion.div>
          )}
          {view === "video_loading" && (
            <motion.div key="video_loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingScreen
                titulo="IA Trabalhando."
                steps={[
                  "Clonando voz do vídeo original",
                  "Posicionando modelo no vídeo",
                  "Sincronizando lábios e gestos",
                  "Finalizando renderização",
                ]}
                onDone={() => setView("result")}
              />
            </motion.div>
          )}
          {view === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FinalResult />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-muted-foreground/30 text-[10px] pb-8">
        Vídeos Próprios • v2.0
      </p>
    </div>
  );
}
