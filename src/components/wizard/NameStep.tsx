import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Copy, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";

interface NameStepProps {
  selectedName: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
}

const NameStep = ({ selectedName, onNameChange, onNext }: NameStepProps) => {
  const canProceed = selectedName.trim().length >= 3;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onNameChange(text);
      toast.success("Colado!");
    } catch {
      toast.error("Não foi possível colar");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto"
    >
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Como vai se chamar seu grupo?
        </h2>
        <p className="text-sm text-muted-foreground">
          Escolha um nome atrativo para o seu grupo
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Ex: Ofertas Imperdíveis"
            value={selectedName}
            onChange={(e) => onNameChange(e.target.value)}
            className="text-center text-lg h-14 rounded-xl border-2 border-muted focus:border-primary transition-colors pr-12"
            maxLength={50}
          />
          <button
            onClick={pasteFromClipboard}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ClipboardPaste className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Mínimo de 3 caracteres
        </p>
      </div>

      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full h-14 rounded-xl text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar
      </Button>

      <div className="flex justify-center gap-6 mt-12 opacity-50 hover:opacity-80 transition-opacity">
        <button
          onClick={() => copyToClipboard("GRUPO DE ACHADINHOS #61")}
          className="p-2 hover:text-primary transition-colors"
        >
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => copyToClipboard("ACHADINHOS DA MAVI #1")}
          className="p-2 hover:text-primary transition-colors"
        >
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
};

export default NameStep;
