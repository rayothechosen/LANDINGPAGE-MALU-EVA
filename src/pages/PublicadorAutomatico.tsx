import { useState } from "react";
import { ArrowLeft, Check, Calendar, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import shopeeImg from "@/assets/shopee-icon.png";
import tiktokImg from "@/assets/tiktok-icon.png";
import instagramImg from "@/assets/instagram-icon.webp";
import vid01 from "@/assets/pack-vid-01.jfif";
import vid02 from "@/assets/pack-vid-02.jfif";
import vid03 from "@/assets/pack-vid-03.jfif";
import vid04 from "@/assets/pack-vid-04.jfif";
import vid05 from "@/assets/pack-vid-05.jfif";
import vid06 from "@/assets/pack-vid-06.jfif";
import vid07 from "@/assets/pack-vid-07.jfif";
import vid08 from "@/assets/pack-vid-08.jfif";

const VIDEOS = [
  { id: "VEL-SX2", thumb: vid01, tipo: "VIRAL" },
  { id: "UNB-9A1", thumb: vid02, tipo: "UNBOXING" },
  { id: "DMO-3K7", thumb: vid03, tipo: "DEMONSTRATIVO" },
  { id: "AIA-5M2", thumb: vid04, tipo: "APRESENTAÇÃO IA" },
  { id: "VEL-2P9", thumb: vid05, tipo: "VIRAL" },
  { id: "UNB-7Z1", thumb: vid06, tipo: "UNBOXING" },
  { id: "VEL-8F3", thumb: vid07, tipo: "VIRAL" },
  { id: "DMO-1Q9", thumb: vid08, tipo: "DEMONSTRATIVO" },
];

const REDES = [
  { id: "shopee", label: "Shopee Vídeo", img: shopeeImg, cor: "bg-orange-500" },
  { id: "tiktok", label: "TikTok",       img: tiktokImg, cor: "bg-zinc-800" },
  { id: "instagram", label: "Instagram", img: instagramImg, cor: "bg-pink-500" },
];

type PublishState = "idle" | "publishing" | "done";

export default function PublicadorAutomatico() {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedRedes, setSelectedRedes] = useState<string[]>(["shopee", "tiktok", "instagram"]);
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [scheduled, setScheduled] = useState(false);

  const toggleRede = (id: string) =>
    setSelectedRedes(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );

  const handlePublicar = () => {
    if (!selectedVideo) return;
    setPublishState("publishing");
    setTimeout(() => setPublishState("done"), 2200);
  };

  const handleProgramar = () => {
    if (!selectedVideo) return;
    setScheduled(true);
  };

  const selectedVideoObj = VIDEOS.find(v => v.id === selectedVideo);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-foreground/40 text-xs font-semibold mb-5 hover:text-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase mb-2">
            Automação
          </p>
          <h1 className="text-[1.75rem] font-extrabold leading-[1.15] text-foreground">
            Publicador <span className="text-primary">Automático.</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Escolha um vídeo, as redes e publique em segundos.</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pb-14 space-y-4">

        {/* Selecione o vídeo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl overflow-hidden"
        >
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <p className="text-[10px] font-extrabold text-foreground uppercase tracking-widest">
              Selecione o vídeo
            </p>
            <span className="text-[10px] text-primary font-bold">1.547 disponíveis</span>
          </div>

          {/* Horizontal scroll */}
          <div className="px-4 pb-1">
            <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
              {VIDEOS.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVideo(v.id)}
                  style={{ scrollSnapAlign: "start" }}
                  className={`flex-shrink-0 w-[90px] rounded-2xl overflow-hidden relative border-2 transition-all ${
                    selectedVideo === v.id ? "border-primary shadow-[0_0_12px_rgba(255,90,31,0.35)]" : "border-transparent"
                  }`}
                >
                  <div style={{ aspectRatio: "9/16" }} className="bg-muted">
                    <img src={v.thumb} alt={v.id} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-1.5 left-1.5 bg-primary/90 px-1.5 py-0.5 rounded-md">
                    <span className="text-[7px] font-extrabold text-white uppercase">{v.tipo}</span>
                  </div>
                  <div className="absolute bottom-1.5 left-0 right-0 text-center">
                    <span className="text-[8px] font-bold text-white/80 drop-shadow">{v.id}</span>
                  </div>
                  {selectedVideo === v.id && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4">
            <button className="w-full py-2 text-[11px] font-semibold text-muted-foreground border border-border rounded-xl hover:border-primary/30 transition-colors">
              Ver mais 380 vídeos
            </button>
          </div>
        </motion.div>

        {/* Redes de postagem */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="bg-card border border-border rounded-3xl p-4"
        >
          <p className="text-[10px] font-extrabold text-foreground uppercase tracking-widest mb-3">
            Redes de postagem
          </p>
          <div className="space-y-2">
            {REDES.map(r => {
              const ativo = selectedRedes.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRede(r.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border-2 transition-all ${
                    ativo ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <img src={r.img} alt={r.label} className="w-5 h-5 object-contain" />
                  </div>
                  <span className="flex-1 text-sm font-bold text-foreground text-left">{r.label}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    ativo ? "bg-primary border-primary" : "border-border"
                  }`}>
                    {ativo && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Resumo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-foreground rounded-3xl p-4 text-white space-y-3"
        >
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">Resumo</p>

          {selectedVideoObj ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                <img src={selectedVideoObj.thumb} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold">{selectedVideoObj.id}</p>
                <p className="text-[10px] text-white/50">{selectedVideoObj.tipo}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm font-bold text-white/60">Selecione um vídeo.</p>
          )}

          <p className="text-[11px] text-white/50">
            {selectedRedes.length} rede{selectedRedes.length !== 1 ? "s" : ""} selecionada{selectedRedes.length !== 1 ? "s" : ""}
          </p>

          {/* Botões */}
          {publishState === "done" || scheduled ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-3 text-center">
              <Check className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-green-400">
                {publishState === "done" ? "Publicado com sucesso!" : "Agendado com sucesso!"}
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handlePublicar}
                disabled={!selectedVideo || selectedRedes.length === 0 || publishState === "publishing"}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ boxShadow: "0 4px 16px rgba(255,90,31,0.35)" }}
              >
                <Zap className="w-4 h-4" />
                {publishState === "publishing" ? "Publicando..." : "Publicar Agora"}
              </button>

              <button
                onClick={handleProgramar}
                disabled={!selectedVideo || selectedRedes.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-3 rounded-2xl text-sm hover:bg-white/15 transition-colors disabled:opacity-40"
              >
                <Calendar className="w-4 h-4" />
                Programar
              </button>
            </>
          )}
        </motion.div>

        <p className="text-center text-muted-foreground/30 text-[10px]">
          Publicador Automático • v2.0
        </p>
      </div>
    </div>
  );
}
