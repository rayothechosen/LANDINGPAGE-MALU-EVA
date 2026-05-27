import { useState } from "react";
import { ArrowLeft, Check, Shield, Sparkles, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import shopeeImg from "@/assets/shopee-icon.png";
import tiktokImg from "@/assets/tiktok-icon.png";
import instagramImg from "@/assets/instagram-icon.webp";
import IntegrationPopup from "@/components/IntegrationPopup";
import VideoFeePopup from "@/components/wizard/VideoFeePopup";

type Step = "frequency" | "niche" | "authorize" | "connections";

const stepsConfig: { key: Step; label: string }[] = [
  { key: "frequency", label: "Frequência" },
  { key: "niche", label: "Nicho" },
  { key: "authorize", label: "Autorizar" },
  { key: "connections", label: "Conexões" },
];

const platforms = [
  { id: "shopee", name: "Shopee Vídeo", img: shopeeImg, imgSize: "w-8 h-8" },
  { id: "tiktok", name: "TikTok", img: tiktokImg, imgSize: "w-7 h-7" },
  { id: "instagram", name: "Instagram", img: instagramImg, imgSize: "w-8 h-8" },
];

const frequencies = [
  { id: "1-3", label: "1 a 3 vídeos", desc: "Ideal para começar" },
  { id: "4-7", label: "4 a 7 vídeos", desc: "Crescimento constante" },
  { id: "10+", label: "+10 vídeos", desc: "Máximo alcance" },
];

const niches = [
  { id: "variados", label: "Variados", emoji: "🎯" },
  { id: "maternidade", label: "Maternidade", emoji: "👶" },
  { id: "casa", label: "Casa", emoji: "🏠" },
  { id: "moda", label: "Moda", emoji: "👗" },
  { id: "eletronicos", label: "Eletrônicos", emoji: "📱" },
];

const FluxoVideos = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("frequency");
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [showConnectPopup, setShowConnectPopup] = useState(false);

  const currentStepIndex = stepsConfig.findIndex((s) => s.key === step);

  const StepProgress = () => (
    <div className="flex items-center gap-1.5 mb-6">
      {stepsConfig.map((s, i) => {
        const isCompleted = i < currentStepIndex;
        const isActive = s.key === step;
        return (
          <div key={s.key} className="flex items-center gap-1.5 flex-1">
            <div className={`step-indicator ${isCompleted ? "completed" : isActive ? "active" : "pending"}`}>
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            {i < stepsConfig.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full ${isCompleted ? "bg-green-400" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const stepTitle = () => {
    switch (step) {
      case "frequency": return "Quantos vídeos por dia?";
      case "niche": return "Qual nicho você quer?";
      case "authorize": return "Autorização final";
      case "connections": return "Conectar plataformas";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="hero-gradient px-5 pt-6 pb-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-md mx-auto relative z-10">
          <button onClick={() => navigate("/videos-lucrativos")} className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg">Programar Vídeos</h1>
              <p className="text-white/60 text-xs">Configure sua publicação automática</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-8 relative z-10 pb-10">
        <div className="glass-card p-5 mb-5">
          <StepProgress />

          <motion.h2 key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-base font-extrabold text-foreground mb-1">
            {stepTitle()}
          </motion.h2>
          <p className="text-xs text-muted-foreground mb-5">
            {step === "frequency" && "Defina a quantidade de vídeos por dia"}
            {step === "niche" && "Escolha o nicho dos produtos"}
            {step === "authorize" && "Revise e autorize o funcionamento"}
            {step === "connections" && "Conecte suas contas para publicação automática"}
          </p>

          <AnimatePresence mode="wait">
            {step === "frequency" && (
              <motion.div key="frequency" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-3">
                {frequencies.map((f) => {
                  const selected = selectedFrequency === f.id;
                  return (
                    <div key={f.id} onClick={() => setSelectedFrequency(f.id)} className={`option-card flex items-center justify-between ${selected ? "selected" : ""}`}>
                      <div>
                        <span className="text-sm font-bold text-foreground block">{f.label}</span>
                        <span className="text-[11px] text-muted-foreground">{f.desc}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "border-primary bg-primary" : "border-muted-foreground/25"}`}>
                        {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </div>
                  );
                })}
                <Button className="w-full h-12 rounded-2xl text-sm font-bold mt-4 shadow-button" size="lg" disabled={!selectedFrequency} onClick={() => setStep("niche")}>Continuar</Button>
              </motion.div>
            )}

            {step === "niche" && (
              <motion.div key="niche" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid grid-cols-2 gap-3">
                {niches.map((n) => {
                  const selected = selectedNiche === n.id;
                  return (
                    <div key={n.id} onClick={() => setSelectedNiche(n.id)} className={`option-card flex flex-col items-center gap-2 py-5 ${selected ? "selected" : ""}`}>
                      <span className="text-2xl">{n.emoji}</span>
                      <span className="text-sm font-bold text-foreground">{n.label}</span>
                    </div>
                  );
                })}
                <Button className="w-full h-12 rounded-2xl text-sm font-bold mt-2 shadow-button col-span-2" size="lg" disabled={!selectedNiche} onClick={() => setStep("authorize")}>Continuar</Button>
              </motion.div>
            )}

            {step === "authorize" && (
              <motion.div key="authorize" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
                <div className="rounded-2xl bg-muted/40 p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Autorizar Publicação Automática</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">Para que o sistema funcione, precisamos da sua autorização para publicar vídeos automaticamente nas suas contas com seu link de afiliada Shopee.</p>
                  <div className="space-y-2.5">
                    {["Os vídeos serão publicados automaticamente", "Seu link de afiliada será aplicado em cada vídeo", "Você pode pausar a qualquer momento"].map((text, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <p className="text-xs text-foreground">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4 space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Resumo</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequência</span>
                    <span className="font-bold text-foreground">{frequencies.find(f => f.id === selectedFrequency)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nicho</span>
                    <span className="font-bold text-foreground">{niches.find(n => n.id === selectedNiche)?.label}</span>
                  </div>
                </div>

                <Button className="w-full h-12 rounded-2xl text-sm font-bold shadow-button" size="lg" onClick={() => setStep("connections")}>Autorizar e continuar</Button>
              </motion.div>
            )}

            {step === "connections" && (
              <motion.div key="connections" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-3">
                {platforms.map((p) => (
                  <div key={p.id} className="rounded-2xl bg-muted/50 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-card shrink-0">
                      <img src={p.img} alt={p.name} className={`${p.imgSize} object-contain`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{p.name}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                      Desconectado
                    </span>
                  </div>
                ))}
                <Button className="w-full h-12 rounded-2xl text-sm font-bold mt-4 shadow-button gap-2" size="lg" onClick={() => setShowConnectPopup(true)}>
                  <Link2 className="w-4 h-4" />
                  Conectar Plataformas
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Video Fee Popup */}
      <VideoFeePopup isOpen={showConnectPopup} />
    </div>
  );
};

export default FluxoVideos;
