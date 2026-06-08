import { useState } from "react";
import { ArrowLeft, Check, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MODEL_IMG = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/modeloia.png";

type View = "config" | "loading" | "result";

const LOADING_STEPS = [
  "Processando características",
  "Criando modelo fotorrealista",
  "Ajustando tom de pele",
  "Finalizando detalhes faciais",
];

function LoadingView({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useState(() => {
    const timers = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setStep(i), i * 900)
    );
    const done = setTimeout(onDone, LOADING_STEPS.length * 900 + 400);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-10">
      <div className="glass-card p-6 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">Gerando modelo.</h2>
        <p className="text-xs text-muted-foreground mb-6">Não feche essa tela</p>
        <div className="space-y-3 text-left">
          {LOADING_STEPS.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                i < step ? "bg-primary" : i === step ? "bg-primary/20 border-2 border-primary" : "bg-muted"
              }`}>
                {i < step ? <Check className="w-3 h-3 text-white" /> : null}
              </div>
              <span className={`text-sm font-medium ${i <= step ? "text-foreground" : "text-muted-foreground/50"}`}>
                {s}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function GeradorModeloIA() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("config");
  const [sexo, setSexo]         = useState("");
  const [idade, setIdade]       = useState("");
  const [aparencia, setApar]    = useState("");
  const [estilo, setEstilo]     = useState("");

  const completo = sexo && idade && aparencia && estilo;

  const OPCOES = {
    sexo:     ["Mulher", "Homem"],
    idade:    ["18 a 25", "26 a 35", "36 a 45", "46+"],
    aparencia:["Brasileira", "Europeia", "Latina", "Não tenho preferência"],
    estilo:   ["Casual", "Elegante", "Esportivo", "Jovem"],
  };

  const handleBack = () => {
    if (view === "config")  navigate(-1);
    else if (view === "result") setView("config");
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-foreground/40 text-xs font-semibold mb-5 hover:text-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {view === "config" ? "Voltar" : "Refazer"}
          </button>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            Modelo de IA
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            {view === "config"  ? <>Gerar seu <span className="text-primary">modelo.</span></> :
             view === "loading" ? <>Criando <span className="text-primary">modelo.</span></> :
                                  <>Modelo <span className="text-primary">pronto!</span></>}
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {view === "config" && (
            <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-5 pb-10 space-y-4"
            >
              {/* Sexo */}
              <div className="glass-card p-4 space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Sexo</p>
                <div className="grid grid-cols-2 gap-2">
                  {OPCOES.sexo.map(o => (
                    <button key={o} onClick={() => setSexo(o)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        sexo === o ? "bg-primary text-white border-primary" : "bg-muted/40 text-foreground border-border hover:border-primary/40"
                      }`}
                    >{o}</button>
                  ))}
                </div>
              </div>

              {/* Idade */}
              <div className="glass-card p-4 space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Faixa de idade</p>
                <div className="grid grid-cols-2 gap-2">
                  {OPCOES.idade.map(o => (
                    <button key={o} onClick={() => setIdade(o)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        idade === o ? "bg-primary text-white border-primary" : "bg-muted/40 text-foreground border-border hover:border-primary/40"
                      }`}
                    >{o}</button>
                  ))}
                </div>
              </div>

              {/* Aparência */}
              <div className="glass-card p-4 space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Aparência</p>
                <div className="space-y-1.5">
                  {OPCOES.aparencia.map(o => (
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

              {/* Estilo */}
              <div className="glass-card p-4 space-y-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Estilo</p>
                <div className="grid grid-cols-2 gap-2">
                  {OPCOES.estilo.map(o => (
                    <button key={o} onClick={() => setEstilo(o)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        estilo === o ? "bg-primary text-white border-primary" : "bg-muted/40 text-foreground border-border hover:border-primary/40"
                      }`}
                    >{o}</button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setView("loading")}
                disabled={!completo}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ boxShadow: completo ? "0 4px 16px rgba(255,90,31,0.30)" : undefined }}
              >
                <User className="w-4 h-4" />
                Gerar modelo
              </button>
            </motion.div>
          )}

          {view === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingView onDone={() => setView("result")} />
            </motion.div>
          )}

          {view === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-5 pb-10 space-y-4"
            >
              <div className="glass-card p-5 space-y-4">
                <div className="text-center">
                  <h2 className="text-[1.1rem] font-extrabold text-foreground">Modelo gerado!</h2>
                  <p className="text-xs text-muted-foreground">Seu modelo IA está pronto para usar</p>
                </div>

                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 16 }}
                  className="rounded-2xl overflow-hidden border-2 border-primary/20 relative"
                  style={{ maxHeight: 380 }}
                >
                  <img src={MODEL_IMG} alt="Modelo IA" className="w-full object-cover" style={{ objectPosition: "top" }} />
                  <div className="absolute top-3 left-0 right-0 flex justify-center">
                    <span className="bg-primary/90 backdrop-blur-sm text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">
                      ✨ Modelo criado com IA
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2">
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-wide">Características</p>
                    <p className="text-xs text-white font-semibold mt-0.5">
                      {sexo} · {idade} · {aparencia} · {estilo}
                    </p>
                  </div>
                </motion.div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setView("config")}
                    className="flex-1 py-3 rounded-2xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Refazer
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white font-bold py-3 rounded-2xl text-sm hover:opacity-90 transition-opacity"
                    style={{ boxShadow: "0 4px 16px rgba(255,90,31,0.30)" }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Usar em vídeo
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-muted-foreground/30 text-[10px] pb-8">
        Gerador Modelo IA • v1.0
      </p>
    </div>
  );
}
