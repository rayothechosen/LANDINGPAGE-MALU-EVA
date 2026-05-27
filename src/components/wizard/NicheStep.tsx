import { motion } from "framer-motion";
import { Check, ShoppingBag, Sparkles, Home, Shirt, Smartphone, Baby } from "lucide-react";

interface NicheStepProps {
  selectedNiche: string | null;
  onSelect: (niche: string) => void;
  onNext: () => void;
}

const niches = [
  { id: "achadinhos", label: "Achadinhos", icon: Sparkles },
  { id: "beleza", label: "Beleza", icon: ShoppingBag },
  { id: "casa", label: "Casa", icon: Home },
  { id: "moda", label: "Moda", icon: Shirt },
  { id: "eletronicos", label: "Eletrônicos", icon: Smartphone },
  { id: "maternidade", label: "Maternidade", icon: Baby },
];

const NicheStep = ({ selectedNiche, onSelect, onNext }: NicheStepProps) => {
  const handleSelect = (nicheId: string) => {
    onSelect(nicheId);
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
        Escolha seu nicho
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-muted-foreground mb-6"
      >
        Sobre o que você quer vender?
      </motion.p>

      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {niches.map((niche, index) => {
          const Icon = niche.icon;
          const isSelected = selectedNiche === niche.id;
          
          return (
            <motion.button
              key={niche.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(niche.id)}
              className={`niche-card flex-col gap-3 py-6 ${isSelected ? "selected" : ""}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isSelected 
                  ? "bg-primary text-white" 
                  : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-semibold transition-colors ${
                isSelected ? "text-primary" : "text-foreground"
              }`}>
                {niche.label}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 check-badge"
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

export default NicheStep;