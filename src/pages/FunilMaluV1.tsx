import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LP_VARIANTS } from "@/lib/lpVariants";

const PLAYER_ID = "6a7fa6974746a66b4b3e1a18";
const PLAYER_SCRIPT =
  "https://scripts.converteai.net/84921071-af8a-4102-8d78-2be90931e856/players/6a7fa6974746a66b4b3e1a18/v4/player.js";

const FunilMaluV1 = () => {
  const variant = LP_VARIANTS.malu;
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Teste a Malu gratuitamente";

    if (document.querySelector(`script[data-funil-malu-player="${PLAYER_ID}"]`)) return;

    const script = document.createElement("script");
    script.src = PLAYER_SCRIPT;
    script.async = true;
    script.dataset.funilMaluPlayer = PLAYER_ID;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const preloadNextStep = () => {
      void import("./FunilMaluConfig");
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(preloadNextStep, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(preloadNextStep, 1400);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 pb-16"
      style={{ ...variant.vars, background: "#F7F2E8", color: "#16130E" }}
    >
      <div
        className="absolute inset-x-0 top-0 flex min-h-9 items-center justify-center px-4 py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.12em]"
        style={{ background: "linear-gradient(90deg, #F86015, #FFCA26, #D42518)", color: "#16130E" }}
      >
        O segredo das top afiliadas revelado
      </div>

      <div className="pointer-events-none absolute -left-16 top-44 h-44 w-44 rounded-full bg-[#F86015]/10" />
      <div className="pointer-events-none absolute -right-20 top-[30rem] h-52 w-52 rounded-full bg-[#30673A]/10" />

      <section className="relative z-10 mx-auto flex w-full max-w-[430px] flex-col items-center pt-16 text-center">
        <img
          src={variant.copy.logoUrl}
          alt={variant.copy.logoAlt}
          className="mb-6 h-9 w-auto max-w-[190px] object-contain"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />

        <h1 className="max-w-sm text-[1.72rem] font-extrabold leading-[1.12] tracking-tight sm:text-[1.9rem]">
          Você está prestes a testar de graça a{" "}
          <span
            className="inline-block -rotate-1 rounded-lg px-2.5 py-1 text-white"
            style={{ background: "linear-gradient(135deg, #F86015, #D42518)" }}
          >
            Malu
          </span>
        </h1>

        <p className="mt-3 max-w-xs text-[1rem] font-extrabold leading-snug" style={{ color: "#30673A" }}>
          Sua funcionária digital que posta por você.
        </p>

        <div
          className="relative mt-8 w-full max-w-[400px] rounded-[1.55rem] p-2"
          style={{
            background: "#FFFDF8",
            border: "1px solid rgba(22,19,14,0.10)",
            boxShadow: "0 22px 52px rgba(48,103,58,0.18), 0 8px 20px rgba(22,19,14,0.12)",
          }}
        >
          <div className="overflow-hidden rounded-[1.15rem] bg-black">
            <div
              dangerouslySetInnerHTML={{
                __html: `<vturb-smartplayer id="vid-${PLAYER_ID}" style="display:block;margin:0 auto;width:100%;max-width:400px;"><div class="vturb-player-placeholder" style="position:relative;width:100%;padding:144.44444444444443% 0 0;z-index:0;background-color:black;"></div></vturb-smartplayer>`,
              }}
            />
          </div>
        </div>

        <section id="botao" className="mt-8 w-full max-w-[400px]" style={{ display: "none" }}>
          <p className="mb-3 text-sm font-semibold text-black/50">
            Clique abaixo para testar a Malu agora:
          </p>
          <button
            type="button"
            onClick={() => navigate("/funil-v1/configurar")}
            className="relative flex w-full items-center justify-center overflow-hidden rounded-full px-6 py-4 text-base font-extrabold text-white transition-transform active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #1F7A36 0%, #30673A 100%)",
              boxShadow: "0 12px 28px rgba(48,103,58,0.34), 0 3px 8px rgba(22,19,14,0.16)",
            }}
          >
            TESTAR A MALU
          </button>
          <p className="mt-3 text-[11px] font-semibold text-black/40">Leva menos de 2 minutos</p>
        </section>
      </section>
    </main>
  );
};

export default FunilMaluV1;
