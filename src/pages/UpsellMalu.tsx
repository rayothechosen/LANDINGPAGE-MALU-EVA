import { useEffect } from "react";
import { ShoppingBag } from "lucide-react";

type UpsellSlug = "up01-live" | "up02-clonador" | "up03-comunidade";

interface UpsellData {
  slug: UpsellSlug;
  title: string;
  alert: string;
  headline: string;
  playerId: string;
  playerPadding: string;
  checkoutUrl: string;
  revealText?: string;
  originalPrice?: string;
  finalPrice: string;
  priceSuffix?: string;
  buttonText: string;
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
    revealText: "Essa condição promocional está disponível somente nesta página.",
    originalPrice: "97,00",
    finalPrice: "17,90",
    buttonText: "QUERO DESBLOQUEAR AS LIVES AUTOMÁTICAS",
  },
  "up02-clonador": {
    slug: "up02-clonador",
    title: "Sua compra principal está garantida!",
    alert: "TRIPLIQUE SUAS VENDAS COM ESSA FUNÇÃO SECRETA",
    headline: "Viralize até 5x mais usando o clonador de vídeos virais da Malu.",
    playerId: "6a88a7bde7b0609e45982091",
    playerPadding: "133.33333333333331%",
    checkoutUrl: "https://go.perfectpay.com.br/PPU38CQFHM6",
    revealText: "Essa função não voltará a estar disponível por esse valor.",
    originalPrice: "145,00",
    finalPrice: "45,00",
    buttonText: "QUERO ADICIONAR O CLONADOR DE VÍDEOS",
  },
  "up03-comunidade": {
    slug: "up03-comunidade",
    title: "Seu acesso está quase completo!",
    alert: "EU TENHO UM CONVITE PRA VOCÊ",
    headline: "Assista esse vídeo e pare de tentar crescer sozinha como afiliada da Shopee.",
    playerId: "6a88a7d092506d5973ba6ce4",
    playerPadding: "133.33333333333331%",
    checkoutUrl: "https://go.perfectpay.com.br/PPU38CQFHI9",
    finalPrice: "24,90",
    priceSuffix: "pagamento único",
    buttonText: "QUERO ENTRAR NA COMUNIDADE VIP",
  },
};

interface UpsellMaluProps {
  slug: UpsellSlug;
}

const UpsellMalu = ({ slug }: UpsellMaluProps) => {
  const upsell = UPSELLS[slug];
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
    <main className="min-h-screen overflow-x-hidden bg-[#F4F4F4] text-[#0C0B09]">
      <section className="bg-[#FFC326] px-4 py-3 text-center">
        <p className="text-[12px] font-extrabold tracking-tight text-[#0C0B09]">
          {upsell.title}
        </p>
      </section>

      <section className="px-4 pb-12 pt-5">
        <div className="mx-auto flex w-full max-w-[430px] flex-col items-center text-center">
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#E63212]">
            {upsell.alert}
          </p>

          <h1 className="max-w-[340px] text-[1.5rem] font-extrabold leading-[1.08] tracking-tight">
            {upsell.headline}
          </h1>

          <div className="mt-6 w-full max-w-[340px]">
            <div
              className="overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: `<vturb-smartplayer id="vid-${upsell.playerId}" style="display:block;margin:0 auto;width:100%;max-width:400px;"><div class="vturb-player-placeholder" style="position:relative;width:100%;padding:${upsell.playerPadding} 0 0;z-index:0;background-color:black;"></div></vturb-smartplayer>`,
              }}
            />
          </div>

          <div id="botao" className="mt-7 w-full max-w-[340px]" style={{ display: "none" }}>
            {upsell.revealText && (
              <p className="mb-5 text-center text-[12px] font-medium leading-relaxed text-black/45">
                {upsell.revealText}
              </p>
            )}

            <div className="mb-5 text-center">
              {upsell.originalPrice && (
                <p className="text-[13px] font-semibold text-red-500 line-through">
                  De R${upsell.originalPrice}
                </p>
              )}
              <p className="mt-0.5 text-[2.15rem] font-extrabold leading-none tracking-tight text-[#008C2F]">
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
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00952F] px-5 py-4 text-center text-[12px] font-extrabold text-white shadow-[0_12px_22px_rgba(0,149,47,0.22)] transition-transform active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              {upsell.buttonText}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default UpsellMalu;
