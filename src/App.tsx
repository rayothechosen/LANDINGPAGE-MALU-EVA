import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

const LpEva = lazy(() => import("./pages/LpEva"));
const LpMalu = lazy(() => import("./pages/LpMalu"));
const Obrigado = lazy(() => import("./pages/Obrigado"));
const FunilMaluV1 = lazy(() => import("./pages/FunilMaluV1"));
const FunilMaluConfig = lazy(() => import("./pages/FunilMaluConfig"));
const FunilMaluVsl = lazy(() => import("./pages/FunilMaluVsl"));
const BackRedirectMalu = lazy(() => import("./pages/BackRedirectMalu"));
const UpsellMalu = lazy(() => import("./pages/UpsellMalu"));

const UpsellObrigado = () => (
  <main className="min-h-screen overflow-x-hidden bg-[#F7F0E6] px-4 py-8 text-[#0C0B09]">
    <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[430px] flex-col items-center justify-center text-center">
      <div className="mb-5 inline-flex items-center justify-center rounded-full bg-[#FFC326] px-5 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em]">
        Compra concluída
      </div>
      <h1 className="max-w-sm text-[2rem] font-extrabold leading-tight">
        Tudo certo. Seu acesso está liberado.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/55">
        Clique abaixo para entrar na Malu e conferir seu acesso.
      </p>
      <a
        href="https://app-assistente-malu.vercel.app/?upsell=true"
        className="mt-8 flex w-full max-w-sm items-center justify-center rounded-full bg-[#FF5A14] px-5 py-4 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(248,96,21,0.28)] transition-transform active:scale-[0.98]"
      >
        ACESSAR A MALU AGORA
      </a>
    </section>
  </main>
);

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
        <Route
          path="/back-redirect"
          element={activeVariant === "malu" ? <BackRedirectMalu originalPrice="37,90" discountedPrice="18,95" checkoutLink="https://checkout.perfectpay.com.br/pay/PPU38CQFEL6" /> : <Navigate to="/" replace />}
        />
        <Route
          path="/back-redirect-27"
          element={activeVariant === "malu" ? <BackRedirectMalu originalPrice="27,90" discountedPrice="13,95" checkoutLink="https://checkout.perfectpay.com.br/pay/PPU38CQFEL5" /> : <Navigate to="/" replace />}
        />
        <Route
          path="/live"
          element={activeVariant === "malu" ? <UpsellMalu slug="up01-live" /> : <Navigate to="/" replace />}
        />
        <Route
          path="/clonador"
          element={activeVariant === "malu" ? <UpsellMalu slug="up02-clonador" /> : <Navigate to="/" replace />}
        />
        <Route
          path="/comunidade"
          element={activeVariant === "malu" ? <UpsellMalu slug="up03-comunidade" /> : <Navigate to="/" replace />}
        />
        <Route
          path="/up01-live"
          element={activeVariant === "malu" ? <UpsellMalu slug="up01-live" /> : <Navigate to="/" replace />}
        />
        <Route
          path="/up02-clonador"
          element={activeVariant === "malu" ? <UpsellMalu slug="up02-clonador" /> : <Navigate to="/" replace />}
        />
        <Route
          path="/up03-comunidade"
          element={activeVariant === "malu" ? <UpsellMalu slug="up03-comunidade" /> : <Navigate to="/" replace />}
        />
        <Route
          path="/up04-obrigado"
          element={activeVariant === "malu" ? <UpsellObrigado /> : <Navigate to="/" replace />}
        />
        <Route path="/obrigado" element={<Obrigado produto={activeVariant} />} />
        <Route path={`/obrigado/${activeVariant}`} element={<Obrigado produto={activeVariant} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
