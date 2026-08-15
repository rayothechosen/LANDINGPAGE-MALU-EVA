import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

const LpEva = lazy(() => import("./pages/LpEva"));
const LpMalu = lazy(() => import("./pages/LpMalu"));
const Obrigado = lazy(() => import("./pages/Obrigado"));
const FunilMaluV1 = lazy(() => import("./pages/FunilMaluV1"));
const FunilMaluConfig = lazy(() => import("./pages/FunilMaluConfig"));
const FunilMaluVsl = lazy(() => import("./pages/FunilMaluVsl"));

const activeVariant = import.meta.env.VITE_LP_VARIANT;

if (activeVariant !== "eva" && activeVariant !== "malu") {
  throw new Error("VITE_LP_VARIANT deve ser 'eva' ou 'malu'.");
}

const ActiveLandingPage = activeVariant === "eva" ? LpEva : LpMalu;

const EmptyHome = () => (
  <main className="min-h-screen" style={{ background: "#F0EBE6" }} aria-label="Página inicial" />
);

const RouteFallback = () => (
  <main className="min-h-screen" style={{ background: "#F7F2E8" }} aria-label="Carregando" />
);

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<EmptyHome />} />
        <Route path="/home" element={<EmptyHome />} />
        <Route path="/lp-v1" element={<ActiveLandingPage />} />
        <Route
          path="/funil-v1"
          element={activeVariant === "malu" ? <FunilMaluV1 /> : <Navigate to="/" replace />}
        />
        <Route
          path="/funil-v1/configurar"
          element={activeVariant === "malu" ? <FunilMaluConfig /> : <Navigate to="/" replace />}
        />
        <Route
          path="/funil-v1/vsl"
          element={activeVariant === "malu" ? <FunilMaluVsl /> : <Navigate to="/" replace />}
        />
        <Route path="/obrigado" element={<Obrigado produto={activeVariant} />} />
        <Route path={`/obrigado/${activeVariant}`} element={<Obrigado produto={activeVariant} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
