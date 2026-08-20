import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m as motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Edge, CtaBtn } from "@/components/LpPrimitives";
import { IconVideos, IconRelogio } from "@/components/LpIcons";
import type { LpVariant } from "@/lib/lpVariants";

const LpBody = lazy(() => import("@/components/LpBody"));

// ─── Ícones autorais da seção "Quem é a Malu" (traço monoline do painel) ─────
const INK = "#16130E";

interface LpIconProps { size?: number; stroke?: string; accent?: string; bg?: string }

function sparklePath(cx: number, cy: number, s: number) {
  return `M ${cx} ${cy - s}
    C ${cx + s * 0.12} ${cy - s * 0.38}, ${cx + s * 0.38} ${cy - s * 0.12}, ${cx + s} ${cy}
    C ${cx + s * 0.38} ${cy + s * 0.12}, ${cx + s * 0.12} ${cy + s * 0.38}, ${cx} ${cy + s}
    C ${cx - s * 0.12} ${cy + s * 0.38}, ${cx - s * 0.38} ${cy + s * 0.12}, ${cx - s} ${cy}
    C ${cx - s * 0.38} ${cy - s * 0.12}, ${cx - s * 0.12} ${cy - s * 0.38}, ${cx} ${cy - s} Z`;
}

// Lupa com sparkle: a Malu garimpando os produtos.
function IconLupa({ size = 27, stroke = INK, accent = "var(--brand-primary)", bg = "#fff" }: LpIconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <circle cx="20.5" cy="20.5" r="12.5" fill={bg} stroke={stroke} strokeWidth="4" />
      <path d="M30 30 L40.5 40.5" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
      <motion.path d={sparklePath(20.5, 20.5, 6.5)} fill={accent}
        animate={{ scale: [1, 0.68, 1], rotate: [0, 16, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "20.5px", originY: "20.5px" }} />
    </svg>
  );
}

// Carteira com moeda caindo: as comissões chegando sozinhas.
function IconCarteira({ size = 27, stroke = INK, accent = "var(--brand-primary)", bg = "#fff" }: LpIconProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <motion.g
        animate={{ y: [0, 4, 0], opacity: [1, 1, 0.75] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}>
        <circle cx="31" cy="9" r="5.2" fill={accent} />
        <path d="M31 6.2 L31 11.8 M29 7.6 Q31 6.2 33 7.6 M29 10.4 Q31 11.8 33 10.4"
          stroke={bg} strokeWidth="1.7" strokeLinecap="round" fill="none" />
      </motion.g>
      <path d="M8 23 Q8 19 12 19 L36 19 Q40 19 40 23 L40 36 Q40 40 36 40 L12 40 Q8 40 8 36 Z"
        fill={bg} stroke={stroke} strokeWidth="4" />
      <path d="M40 26.5 L34 26.5 Q30.5 26.5 30.5 29.5 Q30.5 32.5 34 32.5 L40 32.5"
        fill={bg} stroke={stroke} strokeWidth="3.4" />
      <circle cx="34.5" cy="29.5" r="1.9" fill={accent} />
    </svg>
  );
}

// Estrutura compartilhada pelas LPs: a configuração da variante troca apenas
// identidade, copy e paleta, preservando as mesmas dobras e componentes.
const LpMaluBase = ({ variant, contentOnly = false }: { variant: LpVariant; contentOnly?: boolean }) => {
  const { copy, assets } = variant;
  const CTA_LABEL = copy.ctaLabel;
  const CHECKOUT_LINK = copy.checkoutLink;
  const isEva = variant.id === "eva";
  const vslPlayerId = isEva ? "6a7ba2a41399a6fdc41f45ed" : "6a7b8f1d3aa8434ef5c7d566";
  const vslPlayerScript = isEva
    ? "https://scripts.converteai.net/84921071-af8a-4102-8d78-2be90931e856/players/6a7ba2a41399a6fdc41f45ed/v4/player.js"
    : "https://scripts.converteai.net/84921071-af8a-4102-8d78-2be90931e856/players/6a7b8f1d3aa8434ef5c7d566/v4/player.js";
  const introSteps = [
    "Encontra os produtos que mais vendem no seu nicho",
    "Busca os melhores vídeos e transforma em conteúdo próprio",
    "Faz cortes, edita e cria legendas e hashtags",
    "Posta no automático nos melhores horários para viralizar",
  ];
  const [bodyReady, setBodyReady] = useState(contentOnly);
  const bodyTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentOnly) return;
    if (document.querySelector("script[data-lp-vsl-player]")) return;

    // O VSL é o conteúdo principal da primeira dobra e precisa iniciar junto
    // com a LP. O script continua assíncrono para não bloquear a interface.
    const script = document.createElement("script");
    script.src = vslPlayerScript;
    script.async = true;
    script.dataset.lpVslPlayer = "true";
    document.head.appendChild(script);
  }, [contentOnly, vslPlayerScript]);

  useEffect(() => {
    if (contentOnly) {
      setBodyReady(true);
      return;
    }

    const revealBody = () => setBodyReady(true);
    const observer = new IntersectionObserver(revealBody, { rootMargin: "200px" });
    if (bodyTriggerRef.current) observer.observe(bodyTriggerRef.current);

    let idleId: number | undefined;
    const delayId = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(revealBody, { timeout: 1200 });
      } else {
        revealBody();
      }
    }, 500);

    return () => {
      observer.disconnect();
      window.clearTimeout(delayId);
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [contentOnly]);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen overflow-x-hidden" style={{ ...variant.vars, background: "var(--brand-background)" }}>
      {/* ===== FAIXA TOPO ===== */}
      {!contentOnly && <div className="relative w-full py-2.5 px-4 text-center overflow-hidden"
        style={{ background: variant.faixa.background }}>
        {variant.faixa.brush && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 40" preserveAspectRatio="none">
              <path d="M-30 30 C 60 10, 100 38, 185 22 S 320 2, 440 18"
                stroke="rgba(255,255,255,0.10)" strokeWidth="14" fill="none" strokeLinecap="round" />
              <path d="M-20 10 C 90 0, 170 26, 260 8 S 380 20, 430 4"
                stroke="rgba(22,19,14,0.10)" strokeWidth="9" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <p className="relative text-sm font-bold tracking-wide" style={{ color: variant.faixa.color }}>
          {isEva ? "O novo jeito de vender no TikTok Shop no automático" : "O novo jeito de vender na Shopee no automático"}
        </p>
      </div>}
      {!contentOnly && variant.checkerColors && (
        <div style={{ height: 14, background: `repeating-conic-gradient(${variant.checkerColors[0]} 0% 25%, ${variant.checkerColors[1]} 0% 50%) 0 0 / 28px 28px` }} />
      )}

      {/* ===== SEÇÃO 01: HERO + VSL (o vídeo atravessa a troca de seção) ===== */}
      {!contentOnly && <section className="relative z-10 px-4 pt-8 pb-0 flex flex-col items-center text-center">
        <div className="max-w-md mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-5"
          >
            <img
              src={copy.logoUrl}
              alt={copy.logoAlt}
              className="h-8 w-auto"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              draggable={false}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[1.75rem] font-extrabold leading-[1.25] mb-3 text-foreground tracking-tight"
          >
            Conheça a{" "}
            <span className="relative inline-block">
              <em className="font-display italic" style={{ color: "var(--brand-primary)" }}>{copy.assistente}</em>
              <svg className="absolute left-0 -bottom-1 w-full" height="8" viewBox="0 0 60 8" preserveAspectRatio="none">
                <path d="M2 6 Q 12 2 22 5 T 42 5 T 58 4" stroke="var(--brand-primary)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
              </svg>
            </span>
            , a assistente que posta por você
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-foreground/50 text-sm mb-4 max-w-md mx-auto"
          >
            Assista ao vídeo abaixo para ver como ela trabalha.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative z-20 w-full max-w-[400px] mx-auto rounded-[1.6rem] bg-white p-2 -mb-44"
            style={{ boxShadow: "0 18px 44px rgba(22,19,14,0.28)" }}
          >
            <div
              className="rounded-[1.1rem] overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: isEva
                  ? `<vturb-smartplayer id="vid-${vslPlayerId}" style="display:block;margin:0 auto;width:100%;max-width:400px;"><div class="vturb-player-placeholder" style="position:relative;width:100%;padding:133.33333333333331% 0 0;z-index:0;background-color:black;"></div></vturb-smartplayer>`
                  : `<vturb-smartplayer id="vid-${vslPlayerId}" style="display:block;margin:0 auto;width:100%;max-width:400px;"><div class="vturb-player-placeholder" style="position:relative;width:100%;padding:148.88888888888889% 0 0;z-index:0;background-color:black;"></div></vturb-smartplayer>`,
              }}
            />
          </motion.div>
        </div>
      </section>}

      {/* ===== SEÇÃO 02: QUEM É A MALU (fundo laranja, o vídeo invade a seção) ===== */}
      <section className={`relative px-4 pb-16 ${contentOnly ? "pt-10" : "pt-56"}`}
        style={{ background: "var(--lp-garantia-bg, linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%))" }}>
        {!contentOnly && <Edge color="var(--brand-background)" position="top" />}
        {/* Pinceladas orgânicas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
            <path d="M-30 380 C 60 300, 100 430, 185 340 S 320 160, 440 260"
              stroke="rgba(255,255,255,0.07)" strokeWidth="46" fill="none" strokeLinecap="round" />
            <path d="M-20 120 C 90 60, 170 190, 260 90 S 380 160, 430 70"
              stroke="rgba(22,19,14,0.08)" strokeWidth="30" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <div className="max-w-md mx-auto relative z-10">
          {/* Role para baixo, logo abaixo do vídeo sobreposto */}
          <motion.div
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center mb-10"
          >
            <span className="inline-flex items-center gap-2 rounded-full pl-4 pr-3 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.12em]"
              style={{ background: "var(--lp-scroll-bg, var(--lp-banner, #FFBF29))", color: "var(--lp-scroll-text, var(--lp-banner-text, #16130E))", boxShadow: "var(--lp-scroll-shadow, 0 10px 28px rgba(0,0,0,0.28))" }}>
              Role para baixo
              <ChevronDown className="w-4 h-4" strokeWidth={3.2} style={{ color: "var(--lp-scroll-text, var(--lp-banner-text, #16130E))" }} />
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] tracking-[0.18em] uppercase font-extrabold mb-3"
              style={{ background: "var(--lp-intro-pill-bg, var(--brand-accent))", color: "var(--lp-intro-pill-text, #16130E)" }}>
              Sua nova funcionária
            </span>
            <h2 className="text-[2.1rem] font-extrabold leading-[1.1] tracking-tight" style={{ color: "var(--lp-on-gradient, #fff)" }}>
              Quem é a{" "}
              <span className="relative inline-block">
                <em className="font-display italic" style={{ color: "var(--lp-intro-name, inherit)" }}>{copy.assistente}?</em>
                <svg className="absolute left-0 -bottom-1.5 w-full" height="8" viewBox="0 0 60 8" preserveAspectRatio="none">
                  <path d="M2 6 Q 12 2 22 5 T 42 5 T 58 4" stroke="var(--brand-accent)" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            <p className="text-sm mt-4 max-w-[260px] mx-auto leading-relaxed" style={{ color: "var(--lp-on-gradient-muted, rgba(255,255,255,0.8))" }}>
              {isEva
                ? "A assistente inteligente que cria, edita e posta vídeos por você no TikTok Shop."
                : "A assistente inteligente que cria, edita e posta vídeos por você no Shopee Vídeo, TikTok e Instagram para você vender como afiliada Shopee."}
            </p>
          </motion.div>

          <div className="space-y-3">
            {[
              { Comp: IconLupa,     texto: introSteps[0] },
              { Comp: IconVideos,   texto: introSteps[1] },
              { Comp: IconRelogio,  texto: introSteps[2] },
              { Comp: IconCarteira, texto: introSteps[3] },
            ].map(({ Comp, texto }, i) => {
              const chipBg = "color-mix(in srgb, var(--brand-primary) 10%, #fff)";
              return (
                <motion.div key={texto}
                  initial={{ opacity: 0, y: 16, rotate: [-1.3, 1.2, -1, 1.3][i] }}
                  whileInView={{ opacity: 1, y: 0, rotate: [-1.3, 1.2, -1, 1.3][i] }}
                  whileHover={{ rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * i }}
                  className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: "var(--lp-feature-card-bg, #fff)", boxShadow: "var(--lp-feature-card-shadow, 0 10px 26px rgba(0,0,0,0.22))" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: chipBg }}>
                    <Comp size={27} stroke={INK} accent="var(--brand-primary)" bg={chipBg} />
                  </div>
                  <p className="font-extrabold text-[14px] leading-snug" style={{ color: INK }}>{texto}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-8">
            <CtaBtn checkoutLink={CHECKOUT_LINK} look="intro">{CTA_LABEL}</CtaBtn>
          </motion.div>
        </div>

        {/* Sai da seção em onda para "O que você recebe" */}
        <Edge color="var(--brand-background)" position="bottom" />
      </section>

      {/* ===== CORPO DA LP ===== */}
      <div ref={bodyTriggerRef} className="h-px" aria-hidden="true" />
      {bodyReady && <Suspense fallback={<div className="min-h-px" aria-hidden="true" />}>
      <LpBody
        checkoutLink={CHECKOUT_LINK}
        decor={variant.decor}
        checkerColors={variant.checkerColors}
        ctaLabel={CTA_LABEL}
        featuresKicker="O que você recebe"
        featuresTitle={<>Tudo isso liberado <em className="italic" style={{ color: "var(--brand-primary)" }}>hoje</em></>}
        features={[
          {
            image: assets.card01,
            title: `${copy.assistente}: sua assistente inteligente`,
            alt: `${copy.assistente}: sua assistente inteligente`,
            description:
              isEva
                ? "Você escolhe o nicho e a Eva faz o resto: encontra os produtos com mais potencial, busca os melhores vídeos, faz cortes, edita e transforma tudo em conteúdo próprio. Depois, cria legendas e hashtags e posta nos melhores horários. Tudo no automático."
                : "Você escolhe o nicho e a Malu faz o resto: encontra os produtos com mais potencial na Shopee, busca os melhores vídeos, faz cortes, edita e transforma tudo em conteúdo próprio. Depois, cria legendas e hashtags e posta no Shopee Vídeo, TikTok e Instagram. Tudo no automático.",
          },
        ]}
        bonusCards={[
          {
            image: assets.card02,
            title: "Mais de 7 mil Vídeos Prontos",
            alt: "Mais de 7 mil Vídeos Prontos",
            description:
              isEva
                ? "Tenha acesso a um pack com mais de 7 mil vídeos organizados por nicho, editados e prontos para usar quando quiser."
                : "Tenha acesso ao maior pack para afiliadas Shopee, com mais de 7 mil vídeos organizados nicho por nicho, editados e prontos para usar quando quiser.",
          },
          {
            image: assets.card03,
            title: "Produtos em Alta nas Últimas 24h",
            alt: "Produtos em Alta nas Últimas 24h",
            description:
              isEva
                ? "Veja todos os dias os produtos que mais estão vendendo no TikTok Shop nas últimas 24 horas e encontre as melhores oportunidades para divulgar."
                : "Veja todos os dias os produtos que mais estão vendendo na Shopee nas últimas 24 horas e encontre oportunidades com comissões mais altas para divulgar.",
          },
          {
            image: assets.card04,
            title: isEva ? "Academia da Eva" : "Academia da Malu",
            alt: isEva ? "Academia da Eva" : "Academia da Malu",
            description:
              isEva
                ? "Um treinamento rápido e sem enrolação para aprender a usar a Eva no dia a dia e começar a vender no TikTok Shop."
                : "Um treinamento rápido e sem enrolação para aprender a usar a Malu no dia a dia e começar a vender como afiliada Shopee o quanto antes.",
          },
        ]}
        depoimentosTitle={`Resultados de quem usa a ${copy.assistente}`}
        depoimentosSub={`Resultados de afiliados que usam a ${copy.assistente} todos os dias`}
        depoimentosCtaLabel={CTA_LABEL}
        videoDepoimentos={assets.depoimentos.videos}
        imageDepoimentos={assets.depoimentos.images}
        audioDepoimentos={assets.depoimentos.audios}
        testimonialAuthors={assets.depoimentos.authors}
        criadoraImage={assets.criadora}
        criadoraKicker={`Conheça a criadora da ${copy.assistente}`}
        criadoraTitle={isEva
          ? <>Olá, eu sou a Karina Morato,<br />Top Afiliada do TikTok Shop.</>
          : <>Olá, eu sou a Karina Morato,<br />Top Afiliada da Shopee.</>}
        criadoraParagraphs={isEva ? [
          <>Durante muito tempo, eu perdia horas procurando vídeos, editando conteúdos, criando legendas, escolhendo hashtags e tentando manter uma rotina de postagens.</>,
          <>Depois de três anos como afiliada, durante um evento do TikTok Shop, conheci um desenvolvedor e compartilhei a ideia de criar uma assistente que assumisse a parte mais cansativa do trabalho. Foi assim que nasceu a Eva.</>,
          <strong className="text-foreground">Hoje, a Eva já transforma a rotina de afiliados que querem postar com consistência, ganhar tempo e buscar mais resultados no TikTok Shop.</strong>,
        ] : [
          <>Durante muito tempo, eu perdia horas procurando vídeos, editando conteúdos, criando legendas, escolhendo hashtags e tentando manter uma rotina de postagens.</>,
          <>Depois de três anos como afiliada, durante um evento para afiliados da Shopee, conheci um desenvolvedor e compartilhei a ideia de criar uma assistente que assumisse a parte mais cansativa do trabalho. Foi assim que nasceu a Malu.</>,
          <strong className="text-foreground">Hoje, a Malu já transforma a rotina de afiliadas que querem postar com consistência, ganhar tempo e buscar mais resultados como afiliadas Shopee.</strong>,
        ]}
        showSuporte
        suporteTitle="Suporte via WhatsApp"
        suporteDescription={isEva
          ? "Precisa de ajuda para configurar ou usar a Eva? Nossa equipe acompanha você pelo WhatsApp e, se necessário, faz uma ligação para orientar tudo passo a passo."
          : "Precisa de ajuda para configurar ou usar a Malu? Nossa equipe acompanha você pelo WhatsApp e, se necessário, faz uma ligação para orientar tudo passo a passo."}
        ofertaHeading={`Chegou a hora de colocar a ${copy.assistente} para trabalhar para você!`}
        ofertaSubtitle="Aproveite a oferta de hoje e receba acesso imediato a tudo isso:"
        ofertaBannerLabel="ACESSO IMEDIATO"
        ofertaImage={assets.oferta}
        ofertaTitle={`${copy.assistente} + Bônus Exclusivos`}
        ofertaItems={[
          `${copy.assistente}: sua assistente inteligente`,
          "Mais de 7 mil vídeos prontos",
          "Monitoramento de produtos em alta",
          `Academia da ${copy.assistente}: treinamento rápido e prático`,
          "Garantia de 7 dias",
          "Suporte no WhatsApp",
        ]}
        ofertaDePrice="97,45"
        paidPrice={isEva ? "27,90" : "37,90"}
        ofertaCtaLabel="COMPRAR AGORA"
        garantiaTitle="Garantia de 7 dias"
        garantiaBody="Se por qualquer motivo você não estiver satisfeita, basta solicitar o reembolso dentro de 7 dias. Você recebe 100% do seu dinheiro de volta, sem perguntas ou burocracias."
        faqItems={isEva ? [
          { question: "O pagamento é único ou mensal?", answer: "O pagamento é feito uma única vez. A Eva não é uma assinatura e você não terá cobranças mensais." },
          { question: "E se eu comprar e não gostar?", answer: "Você tem 7 dias completos para testar. Caso não fique satisfeita, basta solicitar o reembolso dentro desse prazo e você receberá seu dinheiro de volta sem burocracia." },
          { question: "Quantos vídeos posso postar por dia?", answer: "Quantos você quiser. Não existe limite diário de vídeos dentro da plataforma." },
          { question: "A Eva cria as legendas e hashtags?", answer: "Sim. A Eva cria legendas e hashtags estratégicas para cada conteúdo e programa a postagem nos melhores horários para aumentar suas chances de viralizar." },
          { question: "Posso tomar bloqueio por conteúdo duplicado?", answer: "A Eva faz cortes, edita e transforma o material em um vídeo próprio antes da postagem. Isso ajuda a evitar conteúdo repetido e reduz o risco de bloqueios no TikTok Shop." },
          { question: "Funciona pelo celular?", answer: "Sim. Você pode usar a Eva pelo celular, computador ou tablet, sem precisar instalar programas complicados." },
          { question: "Terei suporte se precisar de ajuda?", answer: "Sim. Você terá suporte pelo WhatsApp e, se necessário, nossa equipe poderá fazer uma ligação para ajudar na configuração e orientar tudo passo a passo." },
        ] : [
          { question: "O pagamento é único ou mensal?", answer: "O pagamento é feito uma única vez. A Malu não é uma assinatura e você não terá cobranças mensais." },
          { question: "E se eu comprar e não gostar?", answer: "Você tem 7 dias completos para testar. Caso não fique satisfeita, basta solicitar o reembolso dentro desse prazo e você receberá seu dinheiro de volta sem burocracia." },
          { question: "Quantos vídeos posso postar por dia?", answer: "Quantos você quiser. Não existe limite diário de vídeos dentro da plataforma." },
          { question: "A Malu cria as legendas e hashtags?", answer: "Sim. A Malu cria legendas e hashtags estratégicas para cada conteúdo e programa a postagem nos melhores horários para aumentar suas chances de viralizar." },
          { question: "Posso tomar bloqueio por conteúdo duplicado?", answer: "A Malu faz cortes, edita e transforma o material em um vídeo próprio antes da postagem. Isso ajuda a evitar conteúdo repetido e reduz o risco de bloqueios no Shopee Vídeo, TikTok e Instagram." },
          { question: "Funciona pelo celular?", answer: "Sim. Você pode usar a Malu pelo celular, computador ou tablet, sem precisar instalar programas complicados." },
          { question: "Terei suporte se precisar de ajuda?", answer: "Sim. Você terá suporte pelo WhatsApp e, se necessário, nossa equipe poderá fazer uma ligação para ajudar na configuração e orientar tudo passo a passo." },
        ]}
        footerBrand={`${copy.assistente} · Sua assistente virtual · Todos os direitos reservados`}
      />
      </Suspense>}
      </div>
    </LazyMotion>
  );
};

export default LpMaluBase;
