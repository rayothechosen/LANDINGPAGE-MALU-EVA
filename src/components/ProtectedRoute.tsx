import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import GlobalNotice from "@/components/GlobalNotice";

export const DEMO_TOKEN_KEY = "kit_afiliada_token";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { settings } = useSystemSettings();
  const [ready, setReady] = useState(false);

  const token = localStorage.getItem(DEMO_TOKEN_KEY);

  useEffect(() => {
    if (!token) return;

    const ensureSession = async () => {
      try {
        // Valida se a sessão atual é real (faz round-trip ao servidor)
        const { error: userError } = await supabase.auth.getUser();

        if (userError) {
          // Sessão expirada ou inválida — limpa e cria nova anônima
          await supabase.auth.signOut();
          await supabase.auth.signInAnonymously();
        }
      } catch {
        // Sem sessão nenhuma — cria anônima
        try {
          await supabase.auth.signInAnonymously();
        } catch {
          // anonymous auth não habilitado — continua mesmo assim
        }
      } finally {
        setReady(true);
      }
    };

    ensureSession();
  }, [token]);

  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <GlobalNotice notice={settings.system.global_notice} />
      {children}
    </>
  );
};

export default ProtectedRoute;
