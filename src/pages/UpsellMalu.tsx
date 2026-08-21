import { useEffect } from "react";
import { CheckCircle2, LockKeyhole, ShoppingBag } from "lucide-react";
import { LP_VARIANTS } from "@/lib/lpVariants";

type UpsellSlug = "up01-live" | "up02-clonador" | "up03-comunidade";

interface UpsellData {
  slug: UpsellSlug;
  title: string;
  alert: string;
  headline: string;
  playerId: string;
  playerPadding: string;
  checkoutUrl: string;
  nextUrl: string;
  revealText?: string;
  originalPrice?: string;
  finalPrice: string;
  priceSuffix?: string;
  buttonText: string;
  declineText: string;
}

const UPSSELL_PARAM = "upsell";

const addUpsellParam = (url: string) => {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${UPSSELL_PARAM}=true`;
};

const UPSELLS: Record<UpsellSlug, UpsellData> = {
  "up01-live": {
    slug: "up01-live",
    title: "A sua compra foi efetuada com sucesso!",
    alert: "ATENÇÃO: NÃO FECHE ESTA PÁGINA!",
    headline: "Assista esse vídeo e desbloqueie a função de lives automáticas da Malu.",
    playerId: "6a88a7dd2a0e4f0bc1114bcd",
    playerPadding: "133.33333333333331%",
    checkoutUrl: "https://go.perfectpay.com.br/PPU38CQFHLT",
    nextUrl: "https://malu.afiliadosbrasil.top/up02-clonador",
    revealText: "Essa condição promocional está disponível somente nesta página.",
    originalPrice: "97,00",
    finalPrice: "17,90",
    buttonText: "QUERO DESBLOQUEAR AS LIVES AUTOMÁTICAS",
    declineText: "Continuar sem a função de lives automáticas",
  },
  "up02-clonador": {
    slug: "up02-clonador",
    title: "Sua compra principal está garantida!",
    alert: "TRIPLIQUE SUAS VENDAS COM ESSA FUNÇÃO SECRETA",
    headline: "Viralize até 5x mais usando o clonador de vídeos virais da Malu.",
    playerId: "6a88a7bde7b0609e45982091",
    playerPadding: "133.33333333333331%",
    checkoutUrl: "https://go.perfectpay.com.br/PPU38CQFHM6",
    nextUrl: "https://malu.afiliadosbrasil.top/up03-comunidade",
    revealText: "Essa função não voltará a estar disponível por esse valor.",
    originalPrice: "145,00",
    finalPrice: "45,00",
    buttonText: "QUERO ADICIONAR O CLONADOR DE VÍDEOS",
    declineText: "Continuar sem o clonador de vídeos virais",
  },
  "up03-comunidade": {
    slug: "up03-comunidade",
    title: "Seu acesso está quase completo!",
    alert: "EU TENHO UM CONVITE PRA VOCÊ",
    headline: "Assista esse vídeo e pare de tentar crescer sozinha como afiliada da Shopee.",
    playerId: "6a88a7d092506d5973ba6ce4",
    playerPadding: "133.33333333333331%",
    checkoutUrl: "https://go.perfectpay.com.br/PPU38CQFHI9",
    nextUrl: "https://malu.afiliadosbrasil.top/up04-obrigado",
    finalPrice: "24,90",
    priceSuffix: "pagamento único",
    buttonText: "QUERO ENTRAR NA COMUNIDADE VIP",
    declineText: "Continuar sem entrar na comunidade agora",
  },
};

interface UpsellMaluProps {
  slug: UpsellSlug;
}

const UpsellMalu = ({ slug }: UpsellMaluProps) => {
  const upsell = UPSELLS[slug];
  const variant = LP_VARIANTS.malu;
  const playerScript = `https://scripts.converteai.net/84921071-af8a-4102-8d78-2be90931e856/players/${upsell.playerId}/v4/player.js`;

  useEffect(() => {
    document.title = `${upsell.title} | Malu`;

    if (document.querySelector(`script[data-upsell-player="${upsell.playerId}"]`)) return;

    const script = document.createElement("script");
    script.src = playerScript;
    script.async = true;
    script.dataset.upsellPlayer = upsell.playerId;
    document.head.appendChild(script);
  }, [playerScript, upsell.playerId, upsell.title]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F0E6] text-[#0C0B09]">
      <section className="relative border-t-[6px] border-[#0C0B09] bg-[#FFC326] px-4 py-2.5 text-center">
        <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#0C0B09]">
          {upsell.title}
        </p>
      </section>

      <section className="relative px-4 pb-12 pt-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-28 top-20 h-56 w-56 rounded-full bg-[#F86015]/8" />
          <div className="absolute -right-24 bottom-32 h-64 w-64 rounded-full bg-[#30673A]/10" />
        </div>

        <div className="relative mx-auto flex w-full max-w-[430px] flex-col items-center text-center">
          <img
            src={variant.copy.logoUrl}
            alt={variant.copy.logoAlt}
            className="mb-4 h-8 w-auto"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <p className="mb-3 rounded-full bg-[#E63212] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(230,50,18,0.22)]">
            {upsell.alert}
          </p>

          <h1 className="max-w-sm text-[1.55rem] font-extrabold leading-[1.16] tracking-tight sm:text-[1.75rem]">
            {upsell.headline}
          </h1>

          <div className="mt-5 w-full max-w-[400px] rounded-[1.35rem] bg-white p-2 shadow-[0_18px_42px_rgba(22,19,14,0.16)]">
            <div
              className="overflow-hidden rounded-[0.95rem]"
              dangerouslySetInnerHTML={{
                __html: `<vturb-smartplayer id="vid-${upsell.playerId}" style="display:block;margin:0 auto;width:100%;max-width:400px;"><div class="vturb-player-placeholder" style="position:relative;width:100%;padding:${upsell.playerPadding} 0 0;z-index:0;background-color:black;"></div></vturb-smartplayer>`,
              }}
            />
          </div>

          <div id="botao" className="mt-6 w-full" style={{ display: "none" }}>
            <article className="overflow-hidden rounded-[1.35rem] bg-white text-left shadow-[0_18px_42px_rgba(22,19,14,0.14)]">
              <div className="bg-[#0C0B09] px-5 py-3 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#FFC326]">
                Oferta especial liberada
              </div>

              <div className="px-5 pb-6 pt-5">
                {upsell.revealText && (
                  <p className="mb-4 text-center text-sm font-semibold text-[#E63212]">
                    {upsell.revealText}
                  </p>
                )}

                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" />
                    Acesso imediato após a compra
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" />
                    Pagamento unico, sem mensalidade
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold">
                    <LockKeyhole className="h-5 w-5 shrink-0 text-[#16A34A]" />
                    Condição exclusiva desta etapa
                  </li>
                </ul>

                <div className="my-5 border-y border-black/10 py-5 text-center">
                  {upsell.originalPrice && (
                    <p className="text-sm font-semibold text-red-500 line-through">
                      De R${upsell.originalPrice}
                    </p>
                  )}
                  <p className="mt-1 text-[2.7rem] font-extrabold leading-none tracking-tight text-[#0A8F36]">
                    R${upsell.finalPrice}
                  </p>
                  {upsell.priceSuffix && (
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">
                      {upsell.priceSuffix}
                    </p>
                  )}
                </div>

                <a
                  href={addUpsellParam(upsell.checkoutUrl)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5A14] px-5 py-4 text-center text-[13px] font-extrabold text-white shadow-[0_14px_28px_rgba(248,96,21,0.32)] transition-transform active:scale-[0.98]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {upsell.buttonText}
                </a>

                <a
                  href={addUpsellParam(upsell.nextUrl)}
                  className="mx-auto mt-4 block max-w-xs text-center text-xs font-semibold leading-relaxed text-black/45 underline-offset-4 hover:text-black/70 hover:underline"
                >
                  {upsell.declineText}
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default UpsellMalu;
