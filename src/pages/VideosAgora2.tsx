import { motion } from "framer-motion";

const R2 = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev";

const PAIRS = [
  { id: 1, img: `${R2}/product01.PNG`, video: `${R2}/product01.mp4` },
  { id: 2, img: `${R2}/product02.PNG`, video: `${R2}/product02.mp4` },
  { id: 3, img: `${R2}/product03.PNG`, video: `${R2}/product03.mp4` },
  { id: 4, img: `${R2}/product04.PNG`, video: `${R2}/product04.mp4` },
  { id: 5, img: `${R2}/product05.png`, video: `${R2}/product05.mp4` },
];

export default function VideosAgora2() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header compacto */}
      <div className="max-w-6xl mx-auto px-10 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1.5">
              Inteligência Artificial · Shopee
            </p>
            <h1 className="text-[38px] font-extrabold leading-tight text-foreground">
              De produto a vídeo{" "}
              <span className="text-primary">em segundos.</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-4 py-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[12px] font-semibold text-foreground/55">5 vídeos gerados com IA</span>
          </div>
        </motion.div>
      </div>

      {/* Grid 2+2+1 */}
      <div className="max-w-6xl mx-auto px-10 pb-16 flex flex-col gap-5">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-5">
          {PAIRS.slice(0, 2).map((p, i) => <Card key={p.id} pair={p} index={i} />)}
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-5">
          {PAIRS.slice(2, 4).map((p, i) => <Card key={p.id} pair={p} index={i + 2} />)}
        </div>
        {/* Row 3 — centered */}
        <div className="flex justify-center">
          <div className="w-1/2 pr-2.5">
            <Card pair={PAIRS[4]} index={4} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  pair,
  index,
}: {
  pair: { id: number; img: string; video: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="rounded-3xl bg-muted/15 border border-border/40 overflow-hidden flex"
      style={{ height: 280 }}
    >
      {/* Produto */}
      <div
        className="flex flex-col items-center justify-center bg-white/60 dark:bg-white/5 flex-shrink-0"
        style={{ width: "42%" }}
      >
        <img
          src={pair.img}
          alt=""
          className="w-full h-full object-contain p-5"
        />
      </div>

      {/* Seta */}
      <div className="flex flex-col items-center justify-center px-3 gap-1 flex-shrink-0">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M4 11h14M12 5l6 6-6 6"
            stroke="#FF5A1F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[8px] font-extrabold text-primary uppercase tracking-widest mt-0.5">
          IA
        </span>
      </div>

      {/* Vídeo */}
      <div className="flex items-center justify-center flex-1 py-5 pr-5 pl-1">
        <div
          className="relative rounded-2xl overflow-hidden bg-black ring-1 ring-primary/20 h-full"
          style={{ aspectRatio: "9/16" }}
        >
          <video
            src={pair.video}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* glow topo */}
          <div
            className="absolute top-0 inset-x-0 h-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,90,31,0.3), transparent)",
            }}
          />
          <div className="absolute top-2 left-2">
            <span className="bg-primary text-white text-[8px] font-extrabold uppercase tracking-wide rounded-md px-1.5 py-0.5">
              IA
            </span>
          </div>
          <div className="absolute bottom-2 inset-x-2">
            <div className="bg-black/55 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              <span className="text-[8px] text-white/80 font-semibold leading-none">
                Pronto para publicar
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
