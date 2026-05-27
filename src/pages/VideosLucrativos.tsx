import { ArrowLeft, Plus, Video, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import shopeeImg from "@/assets/shopee-icon.png";
import tiktokImg from "@/assets/tiktok-icon.png";
import instagramImg from "@/assets/instagram-icon.webp";
import videosMenuImg from "@/assets/videos-lucrativos.png";

const VideosLucrativos = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <div className="hero-gradient px-5 pt-6 pb-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-md mx-auto relative z-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/20 shrink-0">
              <img src={videosMenuImg} alt="Vídeos" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg">IA Vídeos Lucrativos</h1>
              <p className="text-white/60 text-xs">Seus vídeos automáticos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-8 relative z-10 pb-10">
        {/* Stats Row - zeroed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-4 mb-5"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/60 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Video className="w-4 h-4 text-primary" />
                <p className="text-2xl font-extrabold text-foreground">0</p>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Vídeos postados</p>
            </div>
            <div className="bg-muted/60 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Eye className="w-4 h-4 text-primary" />
                <p className="text-2xl font-extrabold text-primary">0</p>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Views hoje</p>
            </div>
          </div>
        </motion.div>

        {/* Platforms - disconnected */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center gap-3 mb-5"
        >
          {[
            { img: shopeeImg, name: "Shopee Vídeo", alt: "Shopee", size: "w-8 h-8" },
            { img: tiktokImg, name: "TikTok", alt: "TikTok", size: "w-7 h-7" },
            { img: instagramImg, name: "Instagram", alt: "Instagram", size: "w-8 h-8" },
          ].map((p) => (
            <div key={p.alt} className="glass-card w-[100px] p-3 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-muted/60">
                <img src={p.img} alt={p.alt} className={`${p.size} object-contain`} />
              </div>
              <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{p.name}</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
                Desconectado
              </span>
            </div>
          ))}
        </motion.div>

        {/* No videos section - empty state */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-6 mb-6 text-center"
        >
          <Video className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-bold text-foreground mb-1">Nenhum vídeo postado ainda</p>
          <p className="text-xs text-muted-foreground">Programe seus primeiros vídeos para começar</p>
        </motion.div>

        <Button
          onClick={() => navigate("/fluxo-videos")}
          className="w-full h-12 rounded-2xl text-sm font-bold gap-2 shadow-button"
          size="lg"
        >
          <Plus className="w-4 h-4" />
          Programar mais vídeos
        </Button>

        <p className="text-center text-muted-foreground/40 text-[10px] mt-10">
          IA Vídeos Lucrativos • v2.0
        </p>
      </div>
    </div>
  );
};

export default VideosLucrativos;
