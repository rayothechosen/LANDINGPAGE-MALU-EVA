import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LpEva from "./pages/LpEva";
import LpMalu from "./pages/LpMalu";
import Obrigado from "./pages/Obrigado";

const activeVariant = import.meta.env.VITE_LP_VARIANT;

if (activeVariant !== "eva" && activeVariant !== "malu") {
  throw new Error("VITE_LP_VARIANT deve ser 'eva' ou 'malu'.");
}

const ActiveLandingPage = activeVariant === "eva" ? LpEva : LpMalu;

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ActiveLandingPage />} />
      <Route path="/obrigado" element={<Obrigado produto={activeVariant} />} />
      <Route path={`/obrigado/${activeVariant}`} element={<Obrigado produto={activeVariant} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
