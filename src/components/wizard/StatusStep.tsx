import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import whatsappLogo from "@/assets/whatsapp-logo.png";

interface StatusStepProps {
  onNext: () => void;
  onConnectWhatsApp?: () => void;
}

const StatusStep = ({ onNext, onConnectWhatsApp }: StatusStepProps) => {
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsappNumber(formatPhone(e.target.value));
  };

  const handleConnect = () => {
    if (onConnectWhatsApp) {
      onConnectWhatsApp();
    }
  };

  const phoneDigits = whatsappNumber.replace(/\D/g, "");

  return (
    <div className="flex flex-col flex-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">
          Conecte seu WhatsApp
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Digite seu número para vincular ao sistema
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
        className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <img src={whatsappLogo} alt="WhatsApp" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <span className="font-semibold text-foreground text-lg">WhatsApp</span>
            <p className="text-sm text-muted-foreground">Informe seu número abaixo</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              placeholder="(11) 9 9999-9999"
              value={whatsappNumber}
              onChange={handlePhoneChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-200 bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400"
            />
          </div>
          <button
            onClick={handleConnect}
            disabled={phoneDigits.length < 11}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <img src={whatsappLogo} alt="" className="w-5 h-5 brightness-0 invert" />
            Conectar WhatsApp
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StatusStep;
