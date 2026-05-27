import { motion } from "framer-motion";
import { Check, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import shopeeLogo from "@/assets/shopee-logo.png";
import whatsappLogo from "@/assets/whatsapp-logo.png";

interface ConfirmationStepProps {
  onActivate: () => void;
}

const checklistItems = [
  { logo: shopeeLogo, label: "Shopee conectada" },
  { logo: whatsappLogo, label: "WhatsApp conectado" },
  { logo: null, label: "Link de afiliada ativo" },
  { logo: null, label: "Configurações salvas" },
  { logo: null, label: "Pronto para postar" },
];

const ConfirmationStep = ({ onActivate }: ConfirmationStepProps) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    checklistItems.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems((prev) => [...prev, index]);
      }, 100 + index * 150);
    });

    setTimeout(() => {
      setShowContent(true);
    }, 100 + checklistItems.length * 150 + 200);
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-success/30"
      >
        <Rocket className="w-7 h-7 text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-foreground mb-1 text-center"
      >
        Quase lá!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-muted-foreground text-center mb-6"
      >
        Confirmando suas configurações...
      </motion.p>

      <div className="glass-card p-4 mb-6">
        <div className="space-y-3">
          {checklistItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -16 }}
              animate={
                visibleItems.includes(index)
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0.3, x: 0 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex items-center gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={visibleItems.includes(index) ? { scale: 1 } : { scale: 0 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.05 }}
                className="check-badge"
              >
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </motion.div>
              {item.logo && (
                <img src={item.logo} alt="" className="w-4 h-4 object-contain" />
              )}
              <span className={`text-sm transition-colors ${
                visibleItems.includes(index) ? "text-foreground" : "text-muted-foreground"
              }`}>
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        className="mt-auto"
      >
        <p className="text-sm text-center text-muted-foreground mb-4">
          Seu grupo receberá ofertas automaticamente com seu link de afiliada.
        </p>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onActivate}
          className="btn-primary w-full text-base flex items-center justify-center gap-2"
        >
          <Rocket className="w-5 h-5" />
          Ativar Grupo
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ConfirmationStep;