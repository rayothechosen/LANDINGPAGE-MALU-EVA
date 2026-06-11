import { motion } from "framer-motion";

const R2 = "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev";

const PAIRS = [
  {
    id: 1,
    ref: `${R2}/referencia01.mp4`,
    gen: `${R2}/gerado01.mp4`,
    author: "@luaramatoos.ofc",
    plat: "TikTok",
  },
  {
    id: 2,
    ref: `${R2}/referencia02.mp4`,
    gen: `${R2}/gerado02.mp4`,
    author: "@mashopeedicas",
    plat: "Instagram",
  },
  {
    id: 3,
    ref: `${R2}/referencia03.mp4`,
    gen: `${R2}/gerado03.mp4`,
    author: "@luizacampoos002",
    plat: "TikTok",
  },
];

export default function VideosAgora() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">
          Inteligência Artificial
        </p>
        <h1 className="text-[26px] font-extrabold leading-tight text-foreground">
          Veja o que a IA
          <br />
          <span className="text-primary">é capaz de fazer.</span>
        </h1>
        <p className="text-[13px] text-foreground/50 mt-2 leading-snug">
          Vídeos recriados com identidade própria a partir de referências reais.
        </p>
      </motion.div>

      {/* Pairs */}
      <div className="flex flex-col gap-8">
        {PAIRS.map((pair, i) => (
          <motion.div
            key={pair.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            {/* Labels */}
            <div className="flex mb-2 px-0.5">
              <div className="flex-1 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                  Referência
                </span>
                <span className="text-[10px] text-foreground/30">·</span>
                <span className="text-[10px] text-foreground/35">{pair.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Com IA
                </span>
              </div>
            </div>

            {/* Videos side by side */}
            <div className="flex gap-2" style={{ height: 380 }}>
              {/* Reference */}
              <div className="relative bg-black rounded-2xl overflow-hidden flex-1">
                <video
                  src={pair.ref}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 inline-flex items-center gap-1">
                    <span className="text-[9px] text-white/80 font-semibold">{pair.plat}</span>
                  </div>
                </div>
              </div>

              {/* Generated */}
              <div className="relative bg-[#0d0d0d] rounded-2xl overflow-hidden flex-1 ring-1 ring-primary/30">
                <video
                  src={pair.gen}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Glow top */}
                <div
                  className="absolute top-0 inset-x-0 h-10 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,90,31,0.18), transparent)",
                  }}
                />
                <div className="absolute top-2 left-2">
                  <div className="bg-primary rounded-lg px-2 py-0.5">
                    <span className="text-[9px] text-white font-extrabold uppercase tracking-wide">
                      IA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-10 mb-4 text-center"
      >
        <p className="text-[12px] text-foreground/35 leading-snug">
          Todos os vídeos recriados com modelo de IA personalizado.
        </p>
      </motion.div>
    </div>
  );
}
