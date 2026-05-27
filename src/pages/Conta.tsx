import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, LogOut } from "lucide-react";

const DEMO_TOKEN_KEY = "kit_afiliada_token";

export default function Conta() {
  const navigate = useNavigate();
  const token = localStorage.getItem(DEMO_TOKEN_KEY) ?? "—";

  const handleLogout = () => {
    localStorage.removeItem(DEMO_TOKEN_KEY);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-foreground/40 text-xs font-semibold mb-5 hover:text-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            Minha Conta
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            Sua conta e <span className="text-primary">acesso.</span>
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pb-14 space-y-3">

        {/* Card — Código de acesso */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-card rounded-2xl border border-border p-5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.04)" }}
        >
          <p className="text-[10px] font-bold tracking-[0.16em] text-foreground/40 uppercase mb-4">
            Informacoes da conta
          </p>

          <div className="flex items-center gap-3 py-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium">Codigo de acesso</p>
              <p className="text-sm font-bold text-foreground tracking-widest uppercase truncate">
                {token}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Botão sair */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive font-bold py-3.5 rounded-2xl text-sm hover:bg-destructive/15 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </motion.div>

      </div>
    </div>
  );
}
