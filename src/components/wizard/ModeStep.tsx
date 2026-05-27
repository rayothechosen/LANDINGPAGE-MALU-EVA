import { motion } from "framer-motion";
import { Check, Shield, Zap, Leaf } from "lucide-react";

interface ModeStepProps {
  selectedMode: string | null;
  onSelect: (mode: string) => void;
  onNext: () => void;
}

const modes = [
  { 
    id: "normal", 
    label: "Normal", 
    description: "Equilibrado e seguro",
    icon: Shield,
    color: "success",
    recommended: true 
  },
  { 
    id: "acelerado", 
    label: "Acelerado", 
    description: "Mais movimento e testes",
    icon: Zap,
    color: "primary",
    recommended: false 
  },
  { 
    id: "gradual", 
    label: "Gradual", 
    description: "Crescimento constante",
    icon: Leaf,
    color: "muted",
    recommended: false 
  },
];

const ModeStep = ({ selectedMode, onSelect, onNext }: ModeStepProps) => {
  const handleSelect = (modeId: string) => {
    onSelect(modeId);
    setTimeout(onNext, 300);
  };

  return (
    <div className="flex flex-col flex-1">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        Ritmo do grupo
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-muted-foreground mb-6"
      >
        Qual velocidade de crescimento?
      </motion.p>

      <div className="space-y-3 flex-1 content-start">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(mode.id)}
              className={`option-card w-full flex items-center gap-4 ${isSelected ? "selected" : ""}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isSelected 
                  ? "bg-primary text-white" 
                  : mode.color === "success"
                  ? "bg-success/10 text-success"
                  : mode.color === "primary"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{mode.label}</span>
                  {mode.recommended && (
                    <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full uppercase">
                      recomendado
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{mode.description}</span>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="check-badge"
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ModeStep;