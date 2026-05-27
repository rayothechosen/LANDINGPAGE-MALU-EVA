import { useState, useEffect } from "react";
import { ArrowLeft, Check, Zap, Loader2, CheckCircle2, Shield, Camera, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import whatsappImg from "@/assets/whatsapp-icon.webp";
import shopeeImg from "@/assets/shopee-icon.png";
import grupoIcon from "@/assets/grupo-icon.png";

type Step = "loading" | "connections" | "namePhoto" | "groups" | "niche" | "offers" | "growth" | "authorize";

const stepsConfig: { key: Step; label: string }[] = [
  { key: "namePhoto", label: "Nome" },
  { key: "groups", label: "Grupos" },
  { key: "niche", label: "Nicho" },
  { key: "offers", label: "Ofertas" },
  { key: "growth", label: "Crescimento" },
  { key: "authorize", label: "Autorizar" },
];

const connections = [
  { id: "whatsapp", name: "WhatsApp", img: whatsappImg, imgClass: "w-full h-full object-cover" },
  { id: "shopee", name: "Shopee", img: shopeeImg, imgClass: "w-8 h-8 object-contain" },
];

const groupOptions = [
  { id: "1", label: "1 Grupo", desc: "Para começar" },
  { id: "2", label: "2 Grupos", desc: "Dobrar alcance" },
  { id: "3", label: "3 Grupos", desc: "Máximo potencial" },
];

const niches = [
  { id: "variados", label: "Variados", emoji: "🎯" },
  { id: "maternidade", label: "Maternidade", emoji: "👶" },
  { id: "casa", label: "Casa", emoji: "🏠" },
  { id: "moda", label: "Moda", emoji: "👗" },
  { id: "eletronicos", label: "Eletrônicos", emoji: "📱" },
];

const offerOptions = [
  { id: "3", label: "3 ofertas/dia", desc: "Suave" },
  { id: "5", label: "5 ofertas/dia", desc: "Recomendado" },
  { id: "8", label: "8 ofertas/dia", desc: "Intenso" },
  { id: "10+", label: "+10 ofertas/dia", desc: "Máximo" },
];

const growthOptions = [
  { id: "lento", label: "Crescimento Lento", desc: "Orgânico e seguro" },
  { id: "moderado", label: "Crescimento Moderado", desc: "Equilíbrio ideal" },
  { id: "acelerado", label: "Crescimento Acelerado", desc: "Rápido e agressivo" },
];

const FluxoGrupos = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("loading");
  const [loadingStates, setLoadingStates] = useState<Record<string, "loading" | "done">>({ whatsapp: "loading", shopee: "loading" });
  const [groupName, setGroupName] = useState("ACHADINHOS");
  const [selectedGroups, setSelectedGroups] = useState<string | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [selectedOffers, setSelectedOffers] = useState<string | null>(null);
  const [selectedGrowth, setSelectedGrowth] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (step !== "loading") return;
    const timers = [
      setTimeout(() => setLoadingStates((s) => ({ ...s, whatsapp: "done" })), 1200),
      setTimeout(() => setLoadingStates((s) => ({ ...s, shopee: "done" })), 2200),
      setTimeout(() => setStep("connections"), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const currentStepIndex = stepsConfig.findIndex((s) => s.key === step);

  const StepProgress = () => (
    <div className="flex items-center gap-1 mb-6">
      {stepsConfig.map((s, i) => {
        const isCompleted = i < currentStepIndex;
        const isActive = s.key === step;
        return (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-primary text-white shadow-md" : "bg-muted text-muted-foreground"}`}>
              {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
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
      case "loading": return "Verificando conexões...";
      case "connections": return "Conexões verificadas";
      case "namePhoto": return "Nome e foto do grupo";
      case "groups": return "Quantos grupos criar?";
      case "niche": return "Qual nicho enviar?";
      case "offers": return "Ofertas por dia";
      case "growth": return "Velocidade de crescimento";
      case "authorize": return "Autorização final";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#075e54] to-[#128c7e] px-5 pt-6 pb-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-md mx-auto relative z-10">
          <button onClick={() => navigate("/grupos-lucrativos")} className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg">Criar Novo Grupo</h1>
              <p className="text-white/60 text-xs">Configure seu grupo automatizado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-8 relative z-10 pb-10">
        <div className="glass-card p-5 mb-5">
          {!["loading", "connections"].includes(step) && <StepProgress />}

          <motion.h2 key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-base font-extrabold text-foreground mb-1">
            {stepTitle()}
          </motion.h2>

          <AnimatePresence mode="wait">
            {step === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-3 mt-4">
                {connections.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-muted/50 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-card shrink-0">
                      <img src={c.img} alt={c.name} className={c.imgClass} />
                    </div>
                    <div className="flex-1"><p className="text-sm font-bold text-foreground">{c.name}</p></div>
                    {loadingStates[c.id] === "loading" ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full"><Zap className="w-3 h-3" /> Conectado</span>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {step === "connections" && (
              <motion.div key="connections" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-3 mt-4">
                {connections.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-muted/50 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-card shrink-0">
                      <img src={c.img} alt={c.name} className={c.imgClass} />
                    </div>
                    <div className="flex-1"><p className="text-sm font-bold text-foreground">{c.name}</p></div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full"><Zap className="w-3 h-3" /> Conectado</span>
                  </div>
                ))}
                <Button className="w-full h-12 rounded-2xl text-sm font-bold mt-4 shadow-button" size="lg" onClick={() => setStep("namePhoto")}>Continuar</Button>
              </motion.div>
            )}

            {step === "namePhoto" && (
              <motion.div key="namePhoto" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5 mt-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/20">
                      <img src={grupoIcon} alt="Foto do grupo" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Camera className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Imagem pré-selecionada</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Nome do grupo</label>
                  <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Ex: ACHADINHOS" className="w-full h-12 rounded-2xl bg-muted/50 border border-border px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                  <p className="text-[11px] text-muted-foreground">O sistema adicionará a numeração automaticamente (ex: ACHADINHOS #01)</p>
                </div>
                <Button className="w-full h-12 rounded-2xl text-sm font-bold shadow-button" size="lg" disabled={!groupName.trim()} onClick={() => setStep("groups")}>Continuar</Button>
              </motion.div>
            )}

            {step === "groups" && (
              <motion.div key="groups" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-3 mt-4">
                {groupOptions.map((g) => (
                  <div key={g.id} onClick={() => setSelectedGroups(g.id)} className={`option-card flex items-center justify-between ${selectedGroups === g.id ? "selected" : ""}`}>
                    <div>
                      <span className="text-sm font-bold text-foreground block">{g.label}</span>
                      <span className="text-[11px] text-muted-foreground">{g.desc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedGroups === g.id ? "border-primary bg-primary" : "border-muted-foreground/25"}`}>
                      {selectedGroups === g.id && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </div>
                ))}
                <Button className="w-full h-12 rounded-2xl text-sm font-bold mt-4 shadow-button" size="lg" disabled={!selectedGroups} onClick={() => setStep("niche")}>Continuar</Button>
              </motion.div>
            )}

            {step === "niche" && (
              <motion.div key="niche" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid grid-cols-2 gap-3 mt-4">
                {niches.map((n) => (
                  <div key={n.id} onClick={() => setSelectedNiche(n.id)} className={`option-card flex flex-col items-center gap-2 py-5 ${selectedNiche === n.id ? "selected" : ""}`}>
                    <span className="text-2xl">{n.emoji}</span>
                    <span className="text-sm font-bold text-foreground">{n.label}</span>
                  </div>
                ))}
                <Button className="w-full h-12 rounded-2xl text-sm font-bold mt-2 shadow-button col-span-2" size="lg" disabled={!selectedNiche} onClick={() => setStep("offers")}>Continuar</Button>
              </motion.div>
            )}

            {step === "offers" && (
              <motion.div key="offers" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-3 mt-4">
                {offerOptions.map((o) => (
                  <div key={o.id} onClick={() => setSelectedOffers(o.id)} className={`option-card flex items-center justify-between ${selectedOffers === o.id ? "selected" : ""}`}>
                    <div>
                      <span className="text-sm font-bold text-foreground block">{o.label}</span>
                      <span className="text-[11px] text-muted-foreground">{o.desc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedOffers === o.id ? "border-primary bg-primary" : "border-muted-foreground/25"}`}>
                      {selectedOffers === o.id && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </div>
                ))}
                <Button className="w-full h-12 rounded-2xl text-sm font-bold mt-4 shadow-button" size="lg" disabled={!selectedOffers} onClick={() => setStep("growth")}>Continuar</Button>
              </motion.div>
            )}

            {step === "growth" && (
              <motion.div key="growth" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-3 mt-4">
                {growthOptions.map((g) => (
                  <div key={g.id} onClick={() => setSelectedGrowth(g.id)} className={`option-card flex items-center justify-between ${selectedGrowth === g.id ? "selected" : ""}`}>
                    <div>
                      <span className="text-sm font-bold text-foreground block">{g.label}</span>
                      <span className="text-[11px] text-muted-foreground">{g.desc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedGrowth === g.id ? "border-primary bg-primary" : "border-muted-foreground/25"}`}>
                      {selectedGrowth === g.id && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground text-center mt-3 px-2">O sistema prioriza pessoas interessadas em produtos da Shopee.</p>
                <Button className="w-full h-12 rounded-2xl text-sm font-bold mt-4 shadow-button" size="lg" disabled={!selectedGrowth} onClick={() => setStep("authorize")}>Continuar</Button>
              </motion.div>
            )}

            {step === "authorize" && (
              <motion.div key="authorize" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5 mt-4">
                <div className="rounded-2xl bg-muted/40 p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Autorizar Funcionamento</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">Para que o sistema opere seus Grupos Lucrativos automaticamente, precisamos da sua autorização.</p>
                  <div className="space-y-2.5">
                    {["Criar grupos automaticamente no WhatsApp", "Adicionar pessoas interessadas em ofertas Shopee", "Enviar ofertas com seu link de afiliada", "Manter grupos ativos diariamente"].map((text, i) => (
                      <div key={i} className="flex items-start gap-2.5"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /><p className="text-xs text-foreground">{text}</p></div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-2xl border border-border p-4 space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Resumo</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="font-bold text-foreground">{groupName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Grupos</span>
                    <span className="font-bold text-foreground">{groupOptions.find(g => g.id === selectedGroups)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nicho</span>
                    <span className="font-bold text-foreground">{niches.find(n => n.id === selectedNiche)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ofertas</span>
                    <span className="font-bold text-foreground">{offerOptions.find(o => o.id === selectedOffers)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Crescimento</span>
                    <span className="font-bold text-foreground">{growthOptions.find(g => g.id === selectedGrowth)?.label}</span>
                  </div>
                </div>

                <Button className="w-full h-12 rounded-2xl text-sm font-bold shadow-button" size="lg" onClick={() => setShowSuccess(true)}>Autorizar e iniciar grupos</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: "spring", duration: 0.5 }} className="w-full max-w-sm glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Tudo certo!</h3>
              <p className="text-sm text-muted-foreground mb-6">Seus Grupos Lucrativos foram ativados com sucesso. O sistema começará a operar automaticamente.</p>
              <Button className="w-full h-12 rounded-2xl text-sm font-bold shadow-button" size="lg" onClick={() => navigate("/grupos-lucrativos")}>Voltar ao painel</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FluxoGrupos;