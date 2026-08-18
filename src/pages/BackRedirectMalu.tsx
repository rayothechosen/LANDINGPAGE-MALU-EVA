import { useEffect, useRef, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { LP_VARIANTS } from "@/lib/lpVariants";

const OFFER_DURATION_SECONDS = 5 * 60;

const OFFER_ITEMS = [
  "Malu: sua assistente inteligente",
  "Mais de 7 mil vídeos prontos",
  "Monitoramento de produtos em alta",
  "Academia da Malu",
  "Garantia de 7 dias",
  "Suporte no WhatsApp",
];

interface BackRedirectMaluProps {
  originalPrice: string;
  discountedPrice: string;
  checkoutLink: string;
}

const BackRedirectMalu = ({ originalPrice, discountedPrice, checkoutLink }: BackRedirectMaluProps) => {
  const variant = LP_VARIANTS.malu;
  const deadline = useRef(Date.now() + OFFER_DURATION_SECONDS * 1000);
  const [remainingSeconds, setRemainingSeconds] = useState(OFFER_DURATION_SECONDS);

  useEffect(() => {
    document.title = "Última oportunidade | Malu";

    const updateTimer = () => {
      const nextValue = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemainingSeconds(nextValue);
    };

    updateTimer();
    const timerId = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(timerId);
  }, []);

  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");

  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{
        ...variant.vars,
        background: "radial-gradient(circle at 8% 28%, rgba(248,96,21,0.16), transparent 24rem), radial-gradient(circle at 92% 72%, rgba(48,103,58,0.18), transparent 28rem), #0B0B09",
        color: "#16130E",
      }}
    >
      <section className="relative overflow-hidden px-4 pb-5 pt-5 text-center" style={{ background: "#FFCA26" }}>
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 400 180" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-30 135 C 60 70, 130 165, 220 105 S 350 35, 440 85" stroke="#F86015" strokeWidth="30" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-md">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em]">Última oportunidade!</p>
          <div className="mt-3 flex items-center justify-center gap-3" aria-label={`${minutes} minutos e ${seconds} segundos restantes`}>
            <div>
              <p className="text-[3.6rem] font-extrabold leading-none tabular-nums tracking-tight">{minutes}</p>
              <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.18em]">Minutos</p>
            </div>
            <span className="mb-5 text-[3.2rem] font-extrabold leading-none">:</span>
            <div>
              <p className="text-[3.6rem] font-extrabold leading-none tabular-nums tracking-tight">{seconds}</p>
              <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.18em]">Segundos</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 pb-16 pt-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-20 h-56 w-56 rounded-full border border-[#F86015]/15" />
          <div className="absolute -right-24 top-[34rem] h-64 w-64 rounded-full border border-[#30673A]/20" />
        </div>

        <div className="relative mx-auto w-full max-w-[430px]">
          <div className="mb-7 text-center text-white">
            <h1 className="text-[1.9rem] font-extrabold leading-[1.12] tracking-tight">
              Espera, temos um <span className="text-[#FFCA26]">desconto</span> para você
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/65">
              Tenha acesso à Malu hoje com 50% de desconto e comece a postar no automático.
            </p>
          </div>

          <article className="overflow-hidden rounded-[1.6rem] bg-[#FFFDF8] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <div className="px-4 py-3 text-center text-[12px] font-extrabold uppercase tracking-[0.12em]" style={{ background: "#FFCA26" }}>
              Acesso imediato
            </div>

            <img
              src={variant.assets.oferta}
              alt="Malu e bônus exclusivos"
              className="block h-auto w-full"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />

            <div className="px-5 pb-6 pt-6 sm:px-7">
              <h2 className="text-center text-[1.15rem] font-extrabold leading-tight">Malu + Bônus Exclusivos</h2>

              <ul className="mt-5 space-y-3">
                {OFFER_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[13px] font-medium sm:text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#18B86A] shadow-[0_3px_8px_rgba(24,184,106,0.25)]">
                      <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="my-6 border-y border-black/10 py-5 text-center">
                <p className="text-sm text-red-500 line-through">De R${originalPrice}</p>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
                  <p className="text-[2.9rem] font-extrabold leading-none tracking-tight text-[#00832A] tabular-nums">R${discountedPrice}</p>
                  <span className="rounded-full bg-[#FFCA26] px-3 py-1.5 text-[10px] font-extrabold uppercase">50% OFF</span>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-black/40">Pagamento único, sem mensalidade</p>
              </div>

              <a
                href={checkoutLink}
                className="flex w-full items-center justify-center rounded-full bg-[#00832A] px-5 py-4 text-center text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(0,131,42,0.28)] transition-transform active:scale-[0.98]"
              >
                QUERO MEU DESCONTO AGORA
              </a>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-black/45">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00832A]" /> Compra protegida por 7 dias
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
};

export default BackRedirectMalu;
