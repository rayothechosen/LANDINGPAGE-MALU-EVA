import { motion } from "framer-motion";
import { Check, Repeat, Shuffle } from "lucide-react";

interface VarietyStepProps {
  selectedVariety: string | null;
  onSelect: (variety: string) => void;
  onNext: () => void;
}

const varieties = [
  { 
    id: "poucos", 
    label: "Poucos produtos", 
    description: "Foco em produtos específicos com mais repetição",
    icon: Repeat 
  },
  { 
    id: "varios", 
    label: "Vários produtos", 
    description: "Mais variedade para testar diferentes ofertas",
    icon: Shuffle 
  },
];

const VarietyStep = ({ selectedVariety, onSelect, onNext }: VarietyStepProps) => {
  const handleSelect = (varietyId: string) => {
    onSelect(varietyId);
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
        Variedade de produtos
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-muted-foreground mb-6"
      >
        Quantos produtos diferentes divulgar?
      </motion.p>

      <div className="space-y-3 flex-1 content-start">
        {varieties.map((variety, index) => {
          const Icon = variety.icon;
          const isSelected = selectedVariety === variety.id;
          
          return (
            <motion.button
              key={variety.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(variety.id)}
              className={`option-card w-full flex items-start gap-4 p-5 ${isSelected ? "selected" : ""}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected 
                  ? "bg-primary text-white" 
                  : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-base font-semibold text-foreground block mb-1">{variety.label}</span>
                <span className="text-sm text-muted-foreground leading-snug">{variety.description}</span>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="check-badge flex-shrink-0"
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

export default VarietyStep;