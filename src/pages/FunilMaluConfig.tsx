import { useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import EvaFlow, { type EvaFlowOptions, type ProdutoFunil } from "@/components/EvaFlow";
import { BRAND_THEMES } from "@/lib/brandTheme";

const ASSET_R2 = "https://pub-cb414c95ac474ad58b42a6e89390fd35.r2.dev";
const VSL_PLAYER_SCRIPT = "https://scripts.converteai.net/84921071-af8a-4102-8d78-2be90931e856/players/6a7fa68f249e18139e7bd2b1/v4/player.js";

function asset(filename: string) {
  return `${ASSET_R2}/${encodeURIComponent(filename)}`;
}

function productCaptions(product: string, benefit: string, audience: string) {
  return [
    `${product}: o achadinho que está chamando atenção na Shopee`,
    `Olha como ${benefit}`,
    `Esse produto é perfeito para ${audience}`,
    "Eu não sabia que precisava disso até ver funcionando",
    `${product} está entre os produtos mais vendidos do momento`,
    "Veja esse achadinho em ação antes de escolher o seu",
    `Salva esse vídeo para não perder: ${product}`,
  ];
}

type Ranking = NonNullable<ProdutoFunil["ranking"]>;

function ranking(soldTotal: string, soldToday: string, commissionToday: string, reason: string): Ranking {
  return { soldTotal, soldToday, commissionToday, reason };
}

function uploadedProduct(prefix: string, nome: string, preco: string, captions: string[], hashtags: string, productRanking: Ranking): ProdutoFunil {
  return {
    id: prefix,
    nome,
    preco,
    comissao: "",
    badge: "TOP 3",
    img: asset(`${prefix}.png`),
    videos: Array.from({ length: 7 }, (_, index) => asset(`${prefix} video${String(index + 1).padStart(2, "0")}.mp4`)),
    captions,
    hashtags,
    ranking: productRanking,
  };
}

function petProduct(index: number, nome: string, preco: string, captions: string[], productRanking: Ranking): ProdutoFunil {
  const prefix = `pets0${index}`;
  return {
    id: prefix,
    nome,
    preco,
    comissao: "",
    badge: "TOP 3",
    img: asset(`${prefix}.png`),
    videos: Array.from({ length: 7 }, (_, videoIndex) => asset(`${prefix} video${String(videoIndex + 1).padStart(2, "0")}.mp4`)),
    captions,
    hashtags: "#pet #pets #achadinhopet #shopee #afiliadoshopee",
    ranking: productRanking,
  };
}

const CATALOG: Record<string, ProdutoFunil[]> = {
  moda: [
    uploadedProduct(
      "modaebeleza03",
      "Óculos de sol oval feminino",
      "R$ 77,90",
      productCaptions("Óculos de sol oval feminino", "esse modelo transforma qualquer look em segundos", "quem ama moda e acessórios estilosos"),
      "#oculosdesol #modafeminina #achadinhos #shopee #afiliadoshopee",
      ranking("7 mil+", "1.847 vendas", "R$ 21,5 mil", "Lidera o nicho em vendas hoje e tem o maior volume total da categoria."),
    ),
    uploadedProduct(
      "modaebeleza02",
      "Anel feminino em prata 925",
      "R$ 14,20",
      productCaptions("Anel feminino em prata 925", "esse anel deixa o visual mais delicado e elegante", "quem procura um acessório bonito para usar ou presentear"),
      "#anel #prata925 #modafeminina #achadinhos #shopee",
      ranking("345", "284 vendas", "R$ 3,4 mil", "O preço baixo aumentou a conversão e colocou o anel na segunda posição."),
    ),
    uploadedProduct(
      "modaebeleza01",
      "Pantufa feminina forrada",
      "R$ 79,00",
      productCaptions("Pantufa feminina forrada", "essa pantufa mantém os pés quentinhos e confortáveis", "quem quer conforto nos dias mais frios"),
      "#pantufa #inverno #modafeminina #achadinhos #shopee",
      ranking("218", "176 vendas", "R$ 2,1 mil", "A procura por produtos de inverno mantém a pantufa entre os destaques do dia."),
    ),
  ],
  casa: [
    uploadedProduct(
      "casa02",
      "Kit com 10 cabeceiras de cama",
      "R$ 32,89",
      productCaptions("Kit com 10 cabeceiras de cama", "essas peças renovam o quarto sem obra e sem complicação", "quem quer transformar o quarto gastando pouco"),
      "#cabeceira #decoracao #quartodecorado #achadinhos #shopee",
      ranking("100 mil+", "6.842 vendas", "R$ 33,7 mil", "É o campeão do nicho, com o maior volume total e mais vendas registradas hoje."),
    ),
    uploadedProduct(
      "casa01",
      "Relógio despertador digital",
      "R$ 32,98",
      productCaptions("Relógio despertador digital", "o horário fica fácil de enxergar até de longe", "quem gosta de um quarto moderno e organizado"),
      "#relogiodigital #decoracao #casa #achadinhos #shopee",
      ranking("30 mil+", "3.418 vendas", "R$ 16,9 mil", "Mantém uma procura forte e constante, garantindo a segunda posição no ranking."),
    ),
    uploadedProduct(
      "casa03",
      "Capa almofadada para assento sanitário",
      "R$ 14,99",
      productCaptions("Capa almofadada para assento sanitário", "essa capa deixa o assento mais confortável e protegido", "quem busca mais conforto e praticidade no banheiro"),
      "#banheiro #utilidades #casa #achadinhos #shopee",
      ranking("20 mil+", "2.107 vendas", "R$ 4,7 mil", "O preço acessível e a utilidade diária mantêm o produto entre os três melhores."),
    ),
  ],
  maternidade: [
    uploadedProduct(
      "maternidade03",
      "Brinquedo caranguejo musical",
      "R$ 28,38",
      productCaptions("Brinquedo caranguejo musical", "o caranguejo prende a atenção do bebê com luzes, sons e movimento", "famílias que querem estimular e divertir os pequenos"),
      "#brinquedoinfantil #bebe #maternidade #achadinhos #shopee",
      ranking("50 mil+", "4.921 vendas", "R$ 29,8 mil", "O apelo visual e o alto volume de vendas colocam o brinquedo no topo do nicho."),
    ),
    uploadedProduct(
      "maternidade01",
      "Saco de dormir para bebê",
      "R$ 38,90",
      productCaptions("Saco de dormir para bebê", "o bebê fica aquecido e confortável sem cobertas soltas", "mães que querem noites mais tranquilas e seguras"),
      "#sacodedormir #bebe #maternidade #achadinhos #shopee",
      ranking("40 mil+", "3.714 vendas", "R$ 21,6 mil", "A combinação de conforto e segurança mantém o produto na segunda posição."),
    ),
    uploadedProduct(
      "maternidade02",
      "Casinha de boneca em MDF",
      "R$ 58,50",
      productCaptions("Casinha de boneca em MDF", "essa casinha transforma a brincadeira em um mundo de imaginação", "crianças que amam brincar e criar histórias"),
      "#casinhadeboneca #brinquedo #infantil #achadinhos #shopee",
      ranking("20 mil+", "2.206 vendas", "R$ 19,3 mil", "O ticket mais alto gera boa comissão e mantém a casinha dentro do Top 3."),
    ),
  ],
  pets: [
    petProduct(
      2,
      "Coleira guia retrátil para pets",
      "R$ 15,99",
      productCaptions("Coleira guia retrátil para pets", "a guia dá mais liberdade ao pet sem perder o controle do passeio", "tutores que querem passeios mais práticos e seguros"),
      ranking("20 mil+", "2.846 vendas", "R$ 12,8 mil", "Tem o maior volume de vendas do nicho e lidera o ranking de hoje."),
    ),
    petProduct(
      1,
      "Túnel labirinto para pets",
      "R$ 22,47",
      productCaptions("Túnel labirinto para pets", "o túnel mantém gatos e pequenos pets entretidos por muito mais tempo", "tutores que querem enriquecer a rotina dos animais"),
      ranking("10 mil+", "1.634 vendas", "R$ 8,5 mil", "O forte interesse de tutores de gatos garante a segunda posição do dia."),
    ),
    petProduct(
      3,
      "Mochila panorâmica para cães e gatos",
      "R$ 92,63",
      productCaptions("Mochila panorâmica para cães e gatos", "a mochila deixa o transporte confortável e permite que o pet veja tudo", "tutores que gostam de levar o pet para todos os lugares"),
      ranking("1 mil+", "487 vendas", "R$ 6,7 mil", "Mesmo com ticket maior, mantém boas vendas e uma comissão atrativa por pedido."),
    ),
  ],
};

const OPTIONS: EvaFlowOptions = {
  niches: [
    { id: "moda", label: "Moda e beleza", tipo: "camiseta" },
    { id: "casa", label: "Casa e decoração", tipo: "panela" },
    { id: "maternidade", label: "Maternidade e infantil", tipo: "mamadeira" },
    { id: "pets", label: "Pets", tipo: "pata" },
    { id: "auto", label: "A Malu escolhe", tipo: "play" },
  ],
  catalog: CATALOG,
  quantities: [3, 5, 7],
  skipProductVerification: true,
  simpleReview: true,
};

const FunilMaluConfig = () => {
  const navigate = useNavigate();
  const theme = BRAND_THEMES.malu;
  const variables = {
    "--brand-primary": theme.primary,
    "--brand-secondary": theme.secondary,
    "--brand-accent": theme.accent,
    "--brand-background": theme.background,
    "--brand-card-dark": theme.cardDark,
  } as CSSProperties;

  useEffect(() => {
    const preloadVsl = () => {
      void import("./FunilMaluVsl");

      if (!document.querySelector(`link[href="${VSL_PLAYER_SCRIPT}"]`)) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "script";
        link.href = VSL_PLAYER_SCRIPT;
        document.head.appendChild(link);
      }
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(preloadVsl, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(preloadVsl, 1800);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div style={variables}>
      <EvaFlow
        produtos={CATALOG.moda}
        theme={theme}
        onExit={() => navigate("/funil-v1")}
        options={{ ...OPTIONS, onApprove: () => navigate("/funil-v1/vsl") }}
      />
    </div>
  );
};

export default FunilMaluConfig;
