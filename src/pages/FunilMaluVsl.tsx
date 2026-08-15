import { lazy, Suspense, useEffect } from "react";
import { LazyMotion, domAnimation, m as motion } from "framer-motion";
import { Edge } from "@/components/LpBody";
import { usePersistentReveal } from "@/hooks/usePersistentReveal";
import { LP_VARIANTS } from "@/lib/lpVariants";

const LpMaluBase = lazy(() => import("@/components/LpMaluBase"));

const PLAYER_ID = "6a7fa68f249e18139e7bd2b1";
const PLAYER_SCRIPT = `https://scripts.converteai.net/84921071-af8a-4102-8d78-2be90931e856/players/${PLAYER_ID}/v4/player.js`;

const FunilMaluVsl = () => {
  const variant = LP_VARIANTS.malu;
  const { elementRef: pageRef, revealed: pageRevealed } = usePersistentReveal<HTMLDivElement>();

  useEffect(() => {
    document.title = "Tenha acesso à Malu";

    if (document.querySelector(`script[data-funil-vsl="${PLAYER_ID}"]`)) return;

    const script = document.createElement("script");
    script.src = PLAYER_SCRIPT;
    script.async = true;
    script.dataset.funilVsl = PLAYER_ID;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const preloadSalesPage = () => {
      void import("@/components/LpMaluBase");
    };
    const timeoutId = window.setTimeout(preloadSalesPage, 4000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="flex min-h-screen flex-col overflow-x-hidden" style={{ ...variant.vars, background: "var(--brand-background)" }}>
        <div className="relative w-full overflow-hidden px-4 py-2.5 text-center" style={{ background: variant.faixa.background }}>
          <div className="pointer-events-none absolute inset-0">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 40" preserveAspectRatio="none">
              <path d="M-30 30 C 60 10, 100 38, 185 22 S 320 2, 440 18" stroke="rgba(255,255,255,0.10)" strokeWidth="14" fill="none" strokeLinecap="round" />
              <path d="M-20 10 C 90 0, 170 26, 260 8 S 380 20, 430 4" stroke="rgba(22,19,14,0.10)" strokeWidth="9" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <p className="relative text-sm font-bold tracking-wide" style={{ color: variant.faixa.color }}>
            Poste todos os dias usando a Malu
          </p>
        </div>

        <section className="relative z-10 flex flex-col items-center px-4 pb-0 pt-8 text-center">
          <div className="mx-auto w-full max-w-md">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-5 flex justify-center">
              <img
                src={variant.copy.logoUrl}
                alt={variant.copy.logoAlt}
                className="h-8 w-auto"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                draggable={false}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mb-3 text-[1.75rem] font-extrabold leading-[1.25] tracking-tight text-foreground"
            >
              Assista ao vídeo para ter acesso à{" "}
              <span className="relative inline-block">
                <em className="font-display italic" style={{ color: "var(--brand-primary)" }}>Malu</em>
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 60 8" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 6 Q 12 2 22 5 T 42 5 T 58 4" stroke="var(--brand-primary)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
                </svg>
              </span>
              , sua funcionária que posta por você.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mx-auto mb-4 max-w-md text-sm text-foreground/50"
            >
              Assista agora para entender como ter acesso à Malu.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="relative z-20 mx-auto -mb-44 w-full max-w-[400px] rounded-[1.6rem] bg-white p-2"
              style={{ boxShadow: "0 18px 44px rgba(22,19,14,0.28)" }}
            >
              <div
                className="overflow-hidden rounded-[1.1rem]"
                dangerouslySetInnerHTML={{
                  __html: `<vturb-smartplayer id="vid-${PLAYER_ID}" style="display:block;margin:0 auto;width:100%;max-width:400px;"><div class="vturb-player-placeholder" style="position:relative;width:100%;padding:144.44444444444443% 0 0;z-index:0;background-color:black;"></div></vturb-smartplayer>`,
                }}
              />
            </motion.div>
          </div>
        </section>

        <section
          className="relative min-h-44 flex-1 overflow-hidden"
          style={{ background: "var(--lp-garantia-bg, linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%))" }}
          aria-hidden="true"
        >
          <Edge color="var(--brand-background)" position="top" />
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 176" preserveAspectRatio="none">
            <path d="M-20 135 C 90 70, 170 190, 260 90 S 380 160, 430 70" stroke="rgba(22,19,14,0.08)" strokeWidth="30" fill="none" strokeLinecap="round" />
          </svg>
        </section>

        <div ref={pageRef} id="pagina" style={{ display: pageRevealed ? "block" : "none" }}>
          {pageRevealed && (
            <Suspense
              fallback={(
                <div
                  className="h-28"
                  style={{ background: "var(--lp-garantia-bg, linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%))" }}
                />
              )}
            >
              <LpMaluBase variant={variant} contentOnly />
            </Suspense>
          )}
        </div>
      </div>
    </LazyMotion>
  );
};

export default FunilMaluVsl;
