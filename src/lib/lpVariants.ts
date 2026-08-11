import type { CSSProperties } from "react";
import type { LpDecor } from "@/components/LpBody";

// Cada LP é um conjunto de CSS vars (paleta) + textos da marca.
// As vars --brand-* alimentam gradientes, itálicos, rabiscos e kickers;
// as vars --lp-* controlam pontos específicos (banner da oferta, cor de
// compra, fundo dos depoimentos, ornamentos, pills).

export interface LpBrandCopy {
  assistente: string;    // "Malu" | "Eva"
  ctaLabel: string;
  checkoutLink: string;
  logoUrl: string;       // logo da plataforma no topo do hero
  logoAlt: string;
  naPlataforma: string;  // "na Shopee" | "no TikTok Shop"
  daPlataforma: string;  // "da Shopee" | "do TikTok Shop"
  canais: string;        // onde ela publica (usado no FAQ)
  publico: string;       // "afiliadas Shopee" | "afiliadas do TikTok Shop"
}

export interface LpVariant {
  id: string;
  nome: string;
  vars: CSSProperties;
  faixa: { background: string; color: string; brush?: boolean };
  decor: LpDecor;
  checkerColors?: [string, string];
  copy: LpBrandCopy;
  assets: {
    card01: string;
    card02: string;
    card03: string;
    card04: string;
    oferta: string;
    criadora: string;
    depoimentos: {
      videos: string[];
      images: string[];
      audios: { src: string; label: string }[];
      authors?: { name: string; image: string }[];
    };
  };
}

export const LP_VARIANTS: Record<"malu" | "eva", LpVariant> = {
  // ── Malu · laranja vibrante + pistache + verde retrô (Shopee) ──────────────
  malu: {
    id: "malu",
    nome: "Malu",
    vars: {
      "--brand-primary": "#F86015",
      "--brand-secondary": "#D42518",
      "--brand-accent": "#E9E9C7",
      "--brand-background": "#E9E9C7",
      "--brand-card-dark": "#30673A",
      "--lp-banner": "#FFCA26",
      "--lp-banner-text": "#16130E",
      "--lp-buy": "#00832A",
      "--lp-star": "#30673A",
      "--lp-star-ondark": "#E9E9C7",
      "--lp-depo-bg": "#30673A",
      "--lp-pill": "#30673A",
      "--lp-pill-text": "#E9E9C7",
    } as CSSProperties,
    faixa: { background: "#30673A", color: "#E9E9C7" },
    decor: "star",
    copy: {
      assistente: "Malu",
      ctaLabel: "QUERO A MALU TRABALHANDO PRA MIM",
      checkoutLink: "https://checkout.perfectpay.com.br/pay/PPU38CQF7CI",
      logoUrl: "https://pub-087c3f92e3134b8cb358b6210b3554f5.r2.dev/logo%20shopee.png",
      logoAlt: "Shopee",
      naPlataforma: "na Shopee",
      daPlataforma: "da Shopee",
      canais: "no Shopee Vídeo, no TikTok e no Instagram",
      publico: "afiliadas Shopee",
    },
    assets: {
      card01: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/card01%20malu.png",
      card02: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/card02%20malu.png",
      card03: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/card03%20malu.png",
      card04: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/card04%20malu.png",
      oferta: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/cardoferta%20malu.png",
      criadora: "https://pub-69ddd09562c34185a376f620c936f5db.r2.dev/insta.jpg",
      depoimentos: {
        videos: [],
        images: [
          "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/dep01%20malu.png",
          "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/dep02%20malu.png",
          "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/dep03%20malu.png",
          "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/dep04%20malu.png",
        ],
        audios: [],
        authors: [
          {
            name: "Maria de Lourdes",
            image: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/malu%20mulher01.jpg",
          },
          {
            name: "Joana Fonseca Peres",
            image: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/malu%20mulher02.jpg",
          },
          {
            name: "Juliana Alves",
            image: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/malu%20mulher03.jpg",
          },
          {
            name: "Dirce Montana",
            image: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/malu/malu%20mulher04.jpg",
          },
        ],
      },
    },
  },

  // ── Eva · roxo vívido + rosa + lima + creme (TikTok Shop) ──────────────────
  eva: {
    id: "eva",
    nome: "Eva",
    vars: {
      "--brand-primary": "#7A2BF5",
      "--brand-secondary": "#EC4899",
      "--brand-accent": "#B9F227",
      "--brand-background": "#F4EFE6",
      "--brand-card-dark": "#16130E",
      "--lp-banner": "#FFCA26",
      "--lp-banner-text": "#16130E",
      "--lp-buy": "#00832A",
      "--lp-star": "#B9F227",
      "--lp-star-ondark": "#B9F227",
      "--lp-depo-bg": "#16130E",
      "--lp-pill": "#E7DCFA",
      "--lp-pill-text": "#5B21B6",
      "--lp-scroll-bg": "#FFFFFF",
      "--lp-scroll-text": "#16130E",
      "--lp-scroll-shadow": "0 10px 28px rgba(0,0,0,0.22)",
      "--lp-intro-pill-bg": "#B9F227",
      "--lp-intro-pill-text": "#16130E",
      "--lp-intro-cta-bg": "#B9F227",
      "--lp-intro-cta-text": "#16130E",
      "--lp-feature-card-bg": "#EEEAE6",
      "--lp-feature-card-shadow": "0 10px 26px rgba(0,0,0,0.22)",
      "--lp-on-gradient": "#FFFFFF",
      "--lp-on-gradient-muted": "rgba(255,255,255,0.80)",
      "--lp-support-cta-bg": "#FFCA26",
      "--lp-support-cta-text": "#16130E",
      "--lp-support-cta-shadow": "0 8px 24px rgba(255,202,38,0.30), 0 2px 6px rgba(22,19,14,0.18)",
    } as CSSProperties,
    faixa: { background: "#16130E", color: "#B9F227" },
    decor: "star",
    copy: {
      assistente: "Eva",
      ctaLabel: "QUERO A EVA TRABALHANDO PRA MIM",
      checkoutLink: "https://checkout.perfectpay.com.br/pay/PPU38CQF7CL",
      logoUrl: "https://pub-e79c36fa1fb84177b4cf2c066a2fefae.r2.dev/tiktoklogo.png",
      logoAlt: "TikTok",
      naPlataforma: "no TikTok Shop",
      daPlataforma: "do TikTok Shop",
      canais: "no TikTok",
      publico: "afiliadas do TikTok Shop",
    },
    assets: {
      card01: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/eva/card01%20eva.png",
      card02: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/eva/card02%20eva.png",
      card03: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/eva/card03%20eva.png",
      card04: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/eva/card04%20eva.png",
      oferta: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/eva/cardoferta%20eva.png",
      criadora: "https://pub-0b252875d435478a830daa595535d16c.r2.dev/eva/karina.png",
      depoimentos: {
        videos: [
          "https://pub-0b252875d435478a830daa595535d16c.r2.dev/eva/dep03%20eva.mp4",
          "https://pub-0b252875d435478a830daa595535d16c.r2.dev/eva/eva%20dep04.mp4",
        ],
        images: [
          "https://pub-0b252875d435478a830daa595535d16c.r2.dev/eva/dep01%20eva.png",
          "https://pub-0b252875d435478a830daa595535d16c.r2.dev/eva/dep02%20eva.png",
        ],
        audios: [],
      },
    },
  },
};
