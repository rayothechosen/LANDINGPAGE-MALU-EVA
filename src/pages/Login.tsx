import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, KeyRound } from "lucide-react";

const LOGO_URL =
  "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/Sem%20t%C3%ADtulo%20-%2027%20de%20maio%20de%202026%20%C3%A0s%2000.47.41.png";

export const DEMO_TOKEN_KEY = "kit_afiliada_token";

const Login = () => {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();
  const redirectTo     = params.get("redirect") ?? "/";

  const [token, setToken]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Digite seu código de acesso.");
      return;
    }

    setLoading(true);
    // Simula breve validação
    await new Promise(r => setTimeout(r, 800));

    localStorage.setItem(DEMO_TOKEN_KEY, token.trim());
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Cabeçalho */}
      <div className="max-w-sm mx-auto w-full px-5 pt-14 pb-7">
        <img
          src={LOGO_URL}
          alt="Kit Afiliada"
          className="h-12 w-auto mb-6"
          style={{ objectFit: "contain" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-3">
          Kit Afiliada Shopee
        </p>
        <h1 className="text-[2rem] font-extrabold leading-[1.12] text-foreground">
          Bem-vinda ao<br /><span className="text-primary">sistema.</span>
        </h1>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-start justify-center px-5 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm bg-card rounded-3xl border border-border p-6"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Código de acesso</p>
              <p className="text-[11px] text-muted-foreground">Digite o código que você recebeu</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              required
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(null); }}
              placeholder="Ex: AFILIADA2025"
              autoComplete="off"
              className="w-full bg-background border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 tracking-widest font-semibold uppercase"
              style={{ letterSpacing: "0.12em" }}
            />

            {error && (
              <p className="text-xs text-destructive px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Validando...</>
                : "Acessar sistema"}
            </button>
          </form>
        </motion.div>
      </div>

      <p className="text-center text-foreground/20 text-[10px] pb-6 tracking-widest uppercase">
        Kit Afiliada Shopee · v2.1
      </p>
    </div>
  );
};

export default Login;
