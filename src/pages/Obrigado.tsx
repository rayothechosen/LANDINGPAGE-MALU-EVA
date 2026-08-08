import { useEffect } from "react";
import { LP_VARIANTS, type LpVariant } from "@/lib/lpVariants";

const CheckIcon = () => (
  <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="currentColor" />
    <path
      d="M18 33.5 27.5 43 47 22"
      fill="none"
      stroke="#fff"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ObrigadoContent = ({ variant }: { variant: LpVariant }) => {
  useEffect(() => {
    document.title = `Compra recebida · ${variant.nome}`;
  }, [variant.nome]);

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-8 text-center"
      style={{ ...variant.vars, background: "var(--brand-background)" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-52"
        style={{ background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-28 h-28 bg-[var(--brand-background)] [clip-path:polygon(0_58%,18%_46%,38%_62%,60%_43%,82%_58%,100%_45%,100%_100%,0_100%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col items-center justify-center">
        <img
          src={variant.copy.logoUrl}
          alt={variant.copy.logoAlt}
          className="mb-7 h-9 w-auto max-w-[220px] object-contain"
          style={{ filter: variant.id === "malu" ? "brightness(0) invert(1)" : undefined }}
          loading="eager"
          decoding="async"
        />

        <section
          className="w-full rounded-[2rem] bg-white px-6 py-8"
          style={{ boxShadow: "0 22px 60px rgba(22,19,14,0.18)", border: "1px solid rgba(22,19,14,0.08)" }}
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
            <span style={{ color: "var(--lp-buy, #00832A)" }}><CheckIcon /></span>
          </div>

          <span
            className="mb-4 inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em]"
            style={{ background: "var(--brand-accent)", color: "#16130E" }}
          >
            Pedido recebido
          </span>

          <h1 className="text-[2rem] font-extrabold leading-[1.12] tracking-tight text-foreground">
            Parabéns pela{" "}<br />sua compra!
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-foreground/60">
            Confira o e-mail usado na compra. Seu acesso à {variant.nome} e todas as instruções estarão lá.
          </p>

          <div className="mt-7 rounded-2xl bg-[var(--brand-background)] p-5 text-left">
            <p className="text-sm font-extrabold text-foreground">Não encontrou o e-mail?</p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/55">
              Aguarde alguns minutos e confira também as pastas Spam, Promoções e Lixo eletrônico.
            </p>
          </div>

        </section>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/35">
          {variant.nome} · Acesso enviado por e-mail
        </p>
      </div>
    </main>
  );
};

const Obrigado = ({ produto }: { produto: "eva" | "malu" }) => (
  <ObrigadoContent variant={LP_VARIANTS[produto]} />
);

export default Obrigado;
