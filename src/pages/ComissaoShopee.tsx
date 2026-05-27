import { useState } from "react";
import { ArrowLeft, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import shopeeLogoWhite from "@/assets/shopee-logo-white.webp";
import tiktokIcon from "@/assets/tiktok-icon.png";
import whatsappIcon from "@/assets/whatsapp-icon.webp";
import instagramIcon from "@/assets/instagram-icon.webp";
import shopeeIcon from "@/assets/shopee-icon.png";

const now = new Date();
const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const periodos = {
  hoje: {
    label: "Hoje",
    comissao: "350,94",
    visitantes: "8.993",
    cliques: "17.884",
    pedidos: "319",
    compradores: "188",
    canais: [
      { nome: "TikTok", icon: tiktokIcon, valor: "R$ 112,30" },
      { nome: "WhatsApp", icon: whatsappIcon, valor: "R$ 89,47" },
      { nome: "Instagram", icon: instagramIcon, valor: "R$ 67,22" },
      { nome: "Shopee Vídeo", icon: shopeeIcon, valor: "R$ 48,15" },
      { nome: "Outros", icon: null as string | null, valor: "R$ 33,80" },
    ],
  },
  semana: {
    label: "Últimos 7 dias",
    comissao: "2.092,05",
    visitantes: "53.598",
    cliques: "106.588",
    pedidos: "1.901",
    compradores: "1.120",
    canais: [
      { nome: "TikTok", icon: tiktokIcon, valor: "R$ 669,31" },
      { nome: "WhatsApp", icon: whatsappIcon, valor: "R$ 533,24" },
      { nome: "Instagram", icon: instagramIcon, valor: "R$ 400,63" },
      { nome: "Shopee Vídeo", icon: shopeeIcon, valor: "R$ 287,38" },
      { nome: "Outros", icon: null as string | null, valor: "R$ 201,49" },
    ],
  },
  mes: {
    label: "Últimos 30 dias",
    comissao: "7.884,91",
    visitantes: "202.112",
    cliques: "401.933",
    pedidos: "7.168",
    compradores: "4.224",
    canais: [
      { nome: "TikTok", icon: tiktokIcon, valor: "R$ 2.523,58" },
      { nome: "WhatsApp", icon: whatsappIcon, valor: "R$ 2.010,49" },
      { nome: "Instagram", icon: instagramIcon, valor: "R$ 1.510,85" },
      { nome: "Shopee Vídeo", icon: shopeeIcon, valor: "R$ 1.082,34" },
      { nome: "Outros", icon: null as string | null, valor: "R$ 757,65" },
    ],
  },
};

type Periodo = keyof typeof periodos;

const ComissaoShopee = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const data = periodos[periodo];

  return (
    <div className="min-h-screen bg-background">
      {/* Orange Header */}
      <div className="bg-gradient-to-r from-[#ee4d2d] to-[#ff6633] px-4 md:px-8 pb-20 pt-3 relative">
        <div className="flex items-center mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-sm font-medium">achadinhosdavale</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="h-[1px] w-20 md:w-32 bg-white/40" />
          <img src={shopeeLogoWhite} alt="Shopee" className="h-8 md:h-10" />
          <div className="h-[1px] w-20 md:w-32 bg-white/40" />
        </div>
        <div className="text-center">
          <h1 className="text-white text-xl md:text-2xl font-bold mb-1">Comissões {data.label}</h1>
          <div className="inline-block bg-[#d4421e] text-white text-[10px] md:text-xs px-3 py-0.5 rounded-full">
            {dateStr} {timeStr} (GMT-03)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto -mt-16 mb-0 relative z-20 px-4">
        <div className="flex justify-center gap-2 mb-4">
          {(Object.keys(periodos) as Periodo[]).map((key) => (
            <button
              key={key}
              onClick={() => setPeriodo(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                periodo === key
                  ? "bg-white text-[#ee4d2d] shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {periodos[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Value Card */}
      <motion.div key={periodo} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-2xl mx-auto mb-5 relative z-10 px-4">
        <div className="glass-card py-6 md:py-8 px-4 text-center">
          <p className="text-[#ee4d2d] text-4xl md:text-6xl font-bold">
            <span className="text-2xl md:text-3xl mr-1">R$</span>{data.comissao}
          </p>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div key={`metrics-${periodo}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="glass-card p-6">
          <h2 className="text-foreground font-bold text-base mb-4 border-b border-border pb-3">Métricas Principais</h2>
          <div className="grid grid-cols-2 divide-x divide-border py-4 border-b border-border">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Visitantes</p>
              <p className="text-xl font-bold text-foreground mt-1">{data.visitantes}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Cliques</p>
              <p className="text-xl font-bold text-foreground mt-1">{data.cliques}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border py-4">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Pedidos</p>
              <p className="text-xl font-bold text-foreground mt-1">{data.pedidos}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Novos Compradores</p>
              <p className="text-xl font-bold text-foreground mt-1">{data.compradores}</p>
            </div>
          </div>
        </motion.div>

        <motion.div key={`canais-${periodo}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="glass-card p-6 flex flex-col">
          <h2 className="text-foreground font-bold text-lg mb-5 self-start w-full">Top 5 Canais de Origem</h2>
          <div className="flex flex-col gap-4">
            {data.canais.map((canal, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm font-medium w-5">{i + 1}</span>
                  {canal.icon ? (
                    <img src={canal.icon} alt={canal.nome} className="w-8 h-8 rounded-full object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">+</div>
                  )}
                  <span className="text-foreground text-sm font-medium">{canal.nome}</span>
                </div>
                <span className="text-foreground font-bold text-sm">{canal.valor}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComissaoShopee;
