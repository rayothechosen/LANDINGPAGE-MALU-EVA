import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface IntegrationPopupProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  buttonLabel?: string;
  buttonAction?: () => void;
}

const IntegrationPopup = ({ title, children, onClose, buttonLabel = "Voltar e fazer conexão", buttonAction }: IntegrationPopupProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
          className="w-full sm:max-w-sm glass-card p-5 sm:p-6 max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
          {children}
          <Button
            onClick={buttonAction || onClose}
            className="w-full h-12 rounded-2xl text-sm font-bold mt-4 shadow-button gap-2"
            size="lg"
          >
            {!buttonAction && <ArrowLeft className="w-4 h-4" />}
            {buttonLabel}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IntegrationPopup;
