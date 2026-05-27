import { motion } from "framer-motion";
import { Check, Shield, Zap, TrendingUp } from "lucide-react";

interface FrequencyStepProps {
  selectedFrequency: string | null;
  onSelect: (frequency: string) => void;
  onNext: () => void;
}

const frequencies = [
  { 
    id: "1-2", 
    label: "1 a 2 por dia", 
    description: "Recomendado para iniciar",
    icon: Shield,
    recommended: true 
  },
  { 
    id: "3-4", 
    label: "3 a 4 por dia", 
    description: "Testar mais produtos",
    icon: TrendingUp,
    recommended: false 
  },
  { 
    id: "5+", 
    label: "5+ por dia", 
    description: "Para experientes",
    icon: Zap,
    recommended: false 
  },
];

const FrequencyStep = ({ selectedFrequency, onSelect, onNext }: FrequencyStepProps) => {
  const handleSelect = (frequencyId: string) => {
    onSelect(frequencyId);
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
        Frequência de ofertas
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-muted-foreground mb-6"
      >
        Quantas ofertas quer postar por dia?
      </motion.p>

      <div className="space-y-3 flex-1 content-start">
        {frequencies.map((freq, index) => {
          const Icon = freq.icon;
          const isSelected = selectedFrequency === freq.id;
          
          return (
            <motion.button
              key={freq.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(freq.id)}
              className={`option-card w-full flex items-center gap-4 ${isSelected ? "selected" : ""}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isSelected 
                  ? "bg-primary text-white" 
                  : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{freq.label}</span>
                  {freq.recommended && (
                    <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full uppercase">
                      recomendado
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{freq.description}</span>
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

export default FrequencyStep;