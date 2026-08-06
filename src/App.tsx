import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LiveShopDemo from "./pages/LiveShopDemo";
import Eva from "./pages/Eva";
import Malu from "./pages/Malu";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/liveshop" replace />} />

      <Route path="/liveshop" element={<LiveShopDemo />} />

      <Route path="/eva" element={<Eva />} />
      <Route path="/eva/v1" element={<Eva versao="v1" />} />
      <Route path="/eva/v2" element={<Eva versao="v2" />} />

      <Route path="/malu" element={<Malu />} />

      {/* Rotas antigas do Destrava — redirecionam para a Eva */}
      <Route path="/destrava-tiktok-shop" element={<Navigate to="/eva" replace />} />
      <Route path="/destrava-tiktok-shop/v1" element={<Navigate to="/eva/v1" replace />} />
      <Route path="/destrava-tiktok-shop/v2" element={<Navigate to="/eva/v2" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
