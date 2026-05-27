import { Navigate, useLocation } from "react-router-dom";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import GlobalNotice from "@/components/GlobalNotice";

export const DEMO_TOKEN_KEY = "kit_afiliada_token";

/**
 * ProtectedRoute — demo version.
 * Verifica se o usuário digitou qualquer código de acesso (salvo no localStorage).
 * Sem validação real — qualquer token não-vazio libera o acesso.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { settings } = useSystemSettings();

  const token = localStorage.getItem(DEMO_TOKEN_KEY);

  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return (
    <>
      <GlobalNotice notice={settings.system.global_notice} />
      {children}
    </>
  );
};

export default ProtectedRoute;
