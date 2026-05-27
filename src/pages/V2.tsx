import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-kit-afiliada.png";
import videosImg from "@/assets/videos-lucrativos.png";
import whatsappImg from "@/assets/whatsapp-logo.png";
import produtosImg from "@/assets/produtos-em-alta.png";
import treinamentoImg from "@/assets/treinamento.png";
import packImg from "@/assets/pack-10mil.png";

const items = [
  { img: videosImg, title: "Inteligência Artificial Vídeos", desc: "IA que posta por você", route: "/videos-lucrativos" },
  { img: whatsappImg, title: "Grupos Lucrativos", desc: "Melhores grupos", route: "/grupos-lucrativos" },
  { img: packImg, title: "Pack +10.000 Vídeos", desc: "Prontos para nichos", route: "/pack-videos" },
  { img: produtosImg, title: "Produtos em Alta", desc: "Mais vendidos da semana", route: "/produtos-em-alta" },
  { img: treinamentoImg, title: "Treinamento", desc: "Domine todas as ferramentas", route: "/treinamento" },
];

const V2 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-gradient">
      {/* Hero - fundo cinza */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-background px-5 pt-8 pb-16 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center justify-center mb-6">
            <img src={logo} alt="Kit Afiliada Shopee" className="w-64 h-auto" />
          </div>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="max-w-md mx-auto px-5 -mt-8 relative z-10 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="space-y-3"
        >
          {items.map((item) => (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className="tile-card flex items-center gap-4 text-left w-full shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm leading-tight">{item.title}</h3>
                <p className="text-muted-foreground text-[11px] mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
            </button>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/40 text-[10px] mt-10"
        >
          Kit Afiliada Shopee • v2.0
        </motion.p>
      </div>
    </div>
  );
};

export default V2;
