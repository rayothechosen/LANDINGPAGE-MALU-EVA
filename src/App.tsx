import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import PackVideos from "./pages/PackVideos";
import IAVideos from "./pages/IAVideos";
import ProdutosEmAlta from "./pages/ProdutosEmAlta";
import GruposLucrativos from "./pages/GruposLucrativos";
import CriadorVideosIA from "./pages/CriadorVideosIA";
import CarrosseisProntos from "./pages/CarrosseisProntos";
import StoriesProntos from "./pages/StoriesProntos";
import GeradorVideosProprios from "./pages/GeradorVideosProprios";
import Treinamento from "./pages/Treinamento";
import Admin from "./pages/Admin";
import Conta from "./pages/Conta";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rota publica — login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas — exigem usuario autenticado */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/pack-videos" element={<ProtectedRoute><PackVideos /></ProtectedRoute>} />
          <Route path="/ia-videos" element={<ProtectedRoute><IAVideos /></ProtectedRoute>} />
          <Route path="/produtos-em-alta" element={<ProtectedRoute><ProdutosEmAlta /></ProtectedRoute>} />
          <Route path="/grupos-lucrativos" element={<ProtectedRoute><GruposLucrativos /></ProtectedRoute>} />
          <Route path="/criador-videos-ia" element={<ProtectedRoute><CriadorVideosIA /></ProtectedRoute>} />
          <Route path="/carrosseis-prontos" element={<ProtectedRoute><CarrosseisProntos /></ProtectedRoute>} />
          <Route path="/stories-prontos" element={<ProtectedRoute><StoriesProntos /></ProtectedRoute>} />
          <Route path="/gerador-videos-proprios" element={<ProtectedRoute><GeradorVideosProprios /></ProtectedRoute>} />
          <Route path="/treinamento" element={<ProtectedRoute><Treinamento /></ProtectedRoute>} />

          {/* Conta do usuario */}
          <Route path="/conta" element={<ProtectedRoute><Conta /></ProtectedRoute>} />

          {/* Painel admin — protegido + verificacao de admin interna */}
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
