import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.19";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Modelos ───────────────────────────────────────────────────────────────────
const BYPASS_LLM  = false;
const LLM_MODEL   = "openai/gpt-4.1-mini";
const IMAGE_MODEL = "google/nano-banana";

// ── Valores válidos para enums retornados pela LLM ────────────────────────────
const VALID_PRESENTATION_MODES = [
  "hold_in_hand",
  "hold_with_two_hands",
  "wear_product",
  "use_product",
  "stand_beside_product",
  "sit_on_product",
  "lie_on_product",
  "show_product_close",
  "show_product_in_environment",
  "unbox_on_table",
  "review_on_table",
] as const;

const VALID_PRODUCT_SCALES = ["small", "medium", "large", "wearable", "installed"] as const;

const VALID_GENDER_SUGGESTIONS = ["female", "male", "neutral"] as const;

// ── Estrutura do brief gerado pela LLM ────────────────────────────────────────
interface LlmBrief {
  product_style:      string;
  presentation_mode:  string;
  product_scale:      string;
  gender_suggestion:  string;
  environment_style:  string;
  image_prompt_en:    string;
  speech_pt_br:       string;
  simple_action_pt:   string;
  video_prompt_pt_br: string;
  caption_pt_br:      string;
  hashtags:           string[];
}

// ── Fala fixa: sempre cita Shopee + produto + link na bio ─────────────────────
function buildFixedSpeech(productName: string): string {
  const name = productName && productName.trim() ? productName.trim() : "esse produto";
  return `Olha isso que achei na Shopee: ${name}. O link esta na bio.`;
}

// ── Validar que a fala segue o padrao obrigatorio ─────────────────────────────
function looksLikeEnglish(text: string): boolean {
  if (!text || text.length < 5) return false;
  const pattern =
    /\b(the|this|your|amazing|perfect|great|click|check|out|now|buy|get|will|you are|it is|i am|don't|can't|won't|i'm|you're|it's|product|presenter|holder|holding)\b/i;
  return pattern.test(text);
}

function validateSpeech(speech: string, productName: string, context: string): string {
  if (!speech || speech.trim().length === 0) {
    console.log(`[${context}] fala vazia — usando fala fixa`);
    return buildFixedSpeech(productName);
  }
  if (looksLikeEnglish(speech)) {
    console.log(`[${context}] fala em ingles — usando fala fixa`);
    return buildFixedSpeech(productName);
  }
  if (!speech.toLowerCase().includes("shopee")) {
    console.log(`[${context}] fala sem Shopee — usando fala fixa`);
    return buildFixedSpeech(productName);
  }
  if (!/link.*bio|na bio/i.test(speech)) {
    console.log(`[${context}] fala sem link na bio — usando fala fixa`);
    return buildFixedSpeech(productName);
  }
  const words = speech.trim().split(/\s+/);
  if (words.length > 18) {
    console.log(`[${context}] fala muito longa (${words.length} palavras) — usando fala fixa`);
    return buildFixedSpeech(productName);
  }
  return speech.trim();
}

// ── Validar campo enum ────────────────────────────────────────────────────────
function validateEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
  fallback: T
): T {
  if (typeof value === "string" && validValues.includes(value as T)) return value as T;
  return fallback;
}

// ── Video prompt fallback em português — apenas para avatar_presenter ─────────
function buildFallbackVideoPromptPt(speechPtBr: string, simpleActionPt: string): string {
  return (
    `Faca a apresentadora mostrar o produto para a camera. ` +
    `Acao: ${simpleActionPt}. ` +
    `A apresentadora deve falar em portugues do Brasil: "${speechPtBr}" ` +
    `Nao mostrar texto na tela. Nao mostrar legenda. Nao mostrar overlay. ` +
    `Nao mostrar tela final. Nao mostrar elementos graficos. ` +
    `Cena continua e natural. Produto visivel e coerente com a cena.`
  );
}

// ── Video prompt para unboxing_review — produto em foco, narração ─────────────
function buildUnboxingVideoPromptPt(
  speechPtBr:      string,
  productName:     string,
  presentationMode: string,
  environmentStyle: string,
): string {
  const name    = productName.trim() || "esse produto";
  const noText  =
    `Nao mostrar texto na tela. Nao mostrar legenda. Nao mostrar overlay. ` +
    `Nao mostrar tela final. Nao mostrar elementos graficos.`;
  const noAvatar = `Nao gerar cena de apresentadora olhando fixamente para a camera.`;

  if (presentationMode === "unbox_on_table") {
    return (
      `Mostre o ${name} sendo desembalado em uma ${environmentStyle}. ` +
      `O produto deve ser o foco principal da cena. ` +
      `A pessoa abre a caixa e revela o produto naturalmente, com as maos interagindo com a embalagem. ` +
      `A voz narra em portugues do Brasil: "${speechPtBr}" ` +
      `${noAvatar} Cena estilo unboxing/review natural, produto em destaque. ${noText}`
    );
  }

  // review_on_table — específico por categoria
  const nameLower = name.toLowerCase();
  if (/panela|frigideira|conjunto|jogo.*panela|utensilio/.test(nameLower)) {
    return (
      `Mostre o ${name} em uma cozinha realista, com a pessoa mostrando as pecas, ` +
      `levantando tampas e demonstrando o conjunto sobre a bancada. ` +
      `O produto deve ser o foco principal. ` +
      `A voz narra em portugues do Brasil: "${speechPtBr}" ` +
      `${noAvatar} ${noText}`
    );
  }
  if (/airfryer|liquidificador|batedeira|cafeteira|fritadeira|forno|microondas/.test(nameLower)) {
    return (
      `Mostre o ${name} na bancada da cozinha, com a pessoa demonstrando suas funcoes e detalhes. ` +
      `O produto deve ser o foco principal. ` +
      `A voz narra em portugues do Brasil: "${speechPtBr}" ` +
      `${noAvatar} ${noText}`
    );
  }
  if (/vestido|blusa|camiseta|camisa|calca|shorts|saia|jaqueta|moletom|roupa/.test(nameLower)) {
    return (
      `Mostre o ${name} sendo apresentado — estendido na cama, no cabide ou sendo vestido. ` +
      `Destaque o caimento, tecido e detalhes da peca. O produto e o foco. ` +
      `A voz narra em portugues do Brasil: "${speechPtBr}" ` +
      `${noAvatar} ${noText}`
    );
  }

  return (
    `Mostre o ${name} em uma cena realista de review em ${environmentStyle}, com o produto como foco principal. ` +
    `A pessoa interage naturalmente — mostrando partes, abrindo, demonstrando uso ou destacando detalhes. ` +
    `A voz narra em portugues do Brasil: "${speechPtBr}" ` +
    `${noAvatar} Produto domina a cena. ${noText}`
  );
}

// ── Image prompt fallback: realista por modo de apresentacao ──────────────────
function buildFallbackImagePrompt(
  productName: string,
  presentationMode: string,
  genderSuggestion: string
): string {
  const name      = productName.trim() || "produto";
  const genWord   = genderSuggestion === "male" ? "male" : "female";
  const presenter = `A realistic ${genWord} Brazilian content creator`;
  const realism   =
    "Realistic natural lighting. Realistic background coherent with the product. " +
    "No white background. No generic studio backdrop. No artificial cutout. " +
    "UGC social media style. Vertical 9:16 composition.";
  const noExtras  =
    "No text, no logos, no watermark, no price tags, no overlays, no extra products, no graphic elements.";

  switch (presentationMode) {
    case "hold_in_hand":
      return `${presenter} holding the ${name} naturally in one hand, showing it clearly to the camera. Realistic home or lifestyle environment. ${realism} ${noExtras}`;
    case "hold_with_two_hands":
      return `${presenter} holding the ${name} with both hands, clearly showing it close to the body, facing the camera. Realistic home or lifestyle environment. ${realism} ${noExtras}`;
    case "wear_product":
      return `${presenter} wearing the ${name} naturally, showing fit and style, facing the camera. Realistic home, bedroom or lifestyle environment. ${realism} ${noExtras}`;
    case "use_product":
      return `${presenter} using or demonstrating the ${name} naturally in a realistic home environment, facing the camera. ${realism} ${noExtras}`;
    case "stand_beside_product":
      return `The ${name} placed naturally in a realistic home environment. ${presenter} standing beside it, gesturing naturally toward it, facing the camera. ${realism} ${noExtras}`;
    case "sit_on_product":
      return `${presenter} sitting naturally on the ${name} in a realistic living room, facing the camera. ${realism} ${noExtras}`;
    case "lie_on_product":
      return `${presenter} resting or lying naturally on the ${name} in a realistic bedroom, facing the camera. ${realism} ${noExtras}`;
    case "show_product_close":
      return `${presenter} clearly showing the ${name} up close, highlighting its details, in a realistic environment, facing the camera. ${realism} ${noExtras}`;
    case "show_product_in_environment":
      return `The ${name} shown in its natural usage environment, realistic and coherent. ${presenter} presenting it naturally, facing the camera. ${realism} ${noExtras}`;
    case "unbox_on_table":
      // Unboxing: produto em foco, sem portrait de apresentadora
      return `Product-focused UGC unboxing scene. The ${name} is the main subject. Show the ${name} being unboxed on a realistic table or desk surface. Hands opening the box or revealing the product, product clearly in the foreground. Brazilian person partially visible or visible only by hands and arms. Do not frame as a talking-head portrait. Do not make the face the focal point. Realistic home desk or table environment. Realistic natural lighting. UGC social media style. Vertical 9:16 composition. ${noExtras}`;
    case "review_on_table":
      // Review: produto em foco, sem portrait de apresentadora
      return `Product-focused UGC review scene. The ${name} is the main subject. Show the ${name} clearly on a realistic surface appropriate to the product type. Brazilian person's hands or partial figure naturally interacting with the product — holding, touching, lifting, opening or demonstrating it. Product dominates the frame. Do not frame as a talking-head portrait. Do not make the face the focal point. Person is secondary to the product. Realistic natural lighting. UGC social media style. Vertical 9:16 composition. ${noExtras}`;
    default:
      return `${presenter} holding the ${name} naturally at chest level, in a realistic home or lifestyle environment. Facing the camera. ${realism} ${noExtras}`;
  }
}

// ── Image prompt dedicado para unboxing_review ────────────────────────────────
// Produto e o foco. Sem portrait de apresentadora. Ambiente coerente com o produto.
function buildUnboxingImagePrompt(
  productName:     string,
  presentationMode: string,
  environmentStyle: string,
): string {
  const name     = productName.trim() || "produto";
  const nameLower = name.toLowerCase();
  const noExtras =
    `No text, no subtitles, no labels, no watermark, no logo, no price tag, ` +
    `no graphic overlay, no artificial white or studio catalog background.`;
  const realism = `Realistic natural lighting. UGC social media style. Vertical 9:16 composition.`;
  const noAvatar =
    `Do not create a talking-head presenter portrait. ` +
    `Do not make the presenter face the focal point. ` +
    `Do not frame as a waist-up portrait of a person looking directly at the camera. `;
  const productFocus =
    `The ${name} must be the main subject and dominate the frame. ` +
    `Show the product clearly in a realistic review or demonstration setup. `;

  if (presentationMode === "unbox_on_table") {
    return (
      `Product-focused UGC unboxing scene. ${productFocus}${noAvatar}` +
      `Show the ${name} being unboxed on a realistic ${environmentStyle}. ` +
      `Hands opening the box or revealing the product. Product in the foreground. ` +
      `Brazilian person partially visible or visible only by hands and arms interacting naturally. ` +
      `Scene looks like a genuine unboxing moment. ` +
      `${realism} ${noExtras}`
    );
  }

  // review_on_table — prompt específico por categoria de produto
  if (/panela|frigideira|conjunto|jogo.*panela|utensilio/.test(nameLower)) {
    return (
      `Product-focused UGC review scene. ${productFocus}${noAvatar}` +
      `Show the ${name} arranged on a realistic kitchen counter or stovetop. ` +
      `Hands lifting a lid, showing the inside of a pan, or organizing the set. ` +
      `The cookware fills most of the frame. Realistic Brazilian kitchen with warm natural lighting. ` +
      `Person partially visible — hands or arms interacting with the cookware. ` +
      `${realism} ${noExtras}`
    );
  }
  if (/airfryer|liquidificador|batedeira|cafeteira|fritadeira|forno|microondas/.test(nameLower)) {
    return (
      `Product-focused UGC review scene. ${productFocus}${noAvatar}` +
      `Show the ${name} on a realistic kitchen counter. ` +
      `Hands touching or pointing at the appliance, demonstrating features or controls. ` +
      `Appliance fills most of the frame. Realistic Brazilian kitchen environment. ` +
      `${realism} ${noExtras}`
    );
  }
  if (/vestido|blusa|camiseta|camisa|calca|shorts|saia|jaqueta|moletom|roupa/.test(nameLower)) {
    return (
      `Product-focused UGC review scene. ${productFocus}${noAvatar}` +
      `Show the ${name} spread on a bed, held up on a hanger, or worn naturally. ` +
      `Focus on the fabric, cut and details of the garment. ` +
      `Realistic bedroom or lifestyle environment. Person partially visible or showing garment. ` +
      `${realism} ${noExtras}`
    );
  }
  if (/perfume|creme|shampoo|maquiagem|batom|skincare|hidratante|serum/.test(nameLower)) {
    return (
      `Product-focused UGC review scene. ${productFocus}${noAvatar}` +
      `Show the ${name} on a realistic vanity or bathroom counter. ` +
      `Hands holding or demonstrating the product up close. Product clearly in the foreground. ` +
      `Realistic bathroom or vanity environment. ` +
      `${realism} ${noExtras}`
    );
  }
  if (/celular|tablet|notebook|fone|headphone|teclado|mouse/.test(nameLower)) {
    return (
      `Product-focused UGC review scene. ${productFocus}${noAvatar}` +
      `Show the ${name} on a realistic desk surface. ` +
      `Hands holding or demonstrating the device, screen or details visible. Product in the foreground. ` +
      `Realistic home desk or office environment. ` +
      `${realism} ${noExtras}`
    );
  }

  // review_on_table genérico
  return (
    `Product-focused UGC review scene. ${productFocus}${noAvatar}` +
    `Show the ${name} on a realistic ${environmentStyle}. ` +
    `Brazilian person's hands or partial figure naturally interacting with the product — ` +
    `holding, opening, pointing at or demonstrating it. ` +
    `Product dominates the frame. Scene feels like a genuine product review moment. ` +
    `${realism} ${noExtras}`
  );
}

// ── Inferir apresentacao por palavras-chave do nome do produto ────────────────
function inferPresentation(productName: string, videoStyle = "avatar_presenter"): {
  mode:            string;
  scale:           string;
  gender:          string;
  simpleAction:    string;
  environmentStyle: string;
} {
  // Para estilo unboxing_review — ambiente específico por categoria
  if (videoStyle === "unboxing_review") {
    const name = productName.trim().toLowerCase();

    if (/panela|frigideira|conjunto|jogo.*panela|utensilio/.test(name)) {
      return { mode: "review_on_table", scale: "large",    gender: "female",  simpleAction: "mostra as pecas do conjunto de panelas na bancada da cozinha, levantando tampas e apresentando os itens",  environmentStyle: "realistic Brazilian kitchen counter or stovetop" };
    }
    if (/airfryer|liquidificador|batedeira|cafeteira|fritadeira|forno|microondas/.test(name)) {
      return { mode: "review_on_table", scale: "large",    gender: "female",  simpleAction: "demonstra o eletrodomestico na bancada da cozinha mostrando seus recursos",                                environmentStyle: "realistic Brazilian kitchen counter" };
    }
    if (/sofa|poltrona|cadeira|cama|colchao|mesa|rack|armario|guarda.roupa/.test(name)) {
      return { mode: "review_on_table", scale: "large",    gender: "neutral", simpleAction: "apresenta o produto no ambiente mostrando seus detalhes e diferenciais",                                    environmentStyle: "realistic home living room or bedroom" };
    }
    if (/vestido|blusa|camiseta|camisa|calca|shorts|saia|jaqueta|moletom|roupa/.test(name)) {
      return { mode: "review_on_table", scale: "wearable", gender: "female",  simpleAction: "mostra a peca de roupa estendida ou sendo vestida, destacando caimento e detalhes",                        environmentStyle: "realistic bedroom or clothing area" };
    }
    if (/perfume|creme|shampoo|maquiagem|batom|skincare|hidratante|serum|secador|chapinha/.test(name)) {
      return { mode: "unbox_on_table",  scale: "small",    gender: "female",  simpleAction: "abre a embalagem e mostra o produto na bancada do banheiro ou penteadeira",                                environmentStyle: "realistic bathroom counter or vanity" };
    }
    if (/celular|tablet|notebook|fone|headphone|teclado|mouse/.test(name)) {
      return { mode: "unbox_on_table",  scale: "medium",   gender: "neutral", simpleAction: "abre a caixa do dispositivo e mostra o produto na mesa",                                                   environmentStyle: "realistic desk or home office surface" };
    }

    // Padrão unboxing
    return { mode: "unbox_on_table", scale: "medium", gender: "female", simpleAction: "abre a caixa do produto na mesa e mostra o conteudo", environmentStyle: "realistic home desk or table surface" };
  }

  const name = productName.trim().toLowerCase();

  if (/vestido|blusa|camiseta|camisa|calca|shorts|saia|jaqueta|moletom|regata|conjunto|roupa/.test(name)) {
    return { mode: "wear_product",              scale: "wearable", gender: "female",  simpleAction: "veste a roupa e mostra o caimento para a camera",            environmentStyle: "realistic bedroom or home interior" };
  }
  if (/sapato|tenis|bota|botina|sandalia|chinelo|mocassim|scarpin|calcado/.test(name)) {
    return { mode: "wear_product",              scale: "wearable", gender: "female",  simpleAction: "segura o calcado e mostra o design para a camera",           environmentStyle: "realistic home or bedroom" };
  }
  if (/bolsa|mochila|carteira|pochete|necessaire|clutch/.test(name)) {
    return { mode: "wear_product",              scale: "wearable", gender: "female",  simpleAction: "usa a bolsa no corpo e mostra para a camera",                environmentStyle: "realistic home or lifestyle" };
  }
  if (/sofa|poltrona|cadeira|banco|pufe|puff/.test(name)) {
    return { mode: "sit_on_product",            scale: "large",    gender: "neutral", simpleAction: "senta no produto e apresenta para a camera",                 environmentStyle: "realistic living room" };
  }
  if (/cama|colchao|sofa.cama|sofacama|colchonete/.test(name)) {
    return { mode: "lie_on_product",            scale: "large",    gender: "neutral", simpleAction: "apoia no produto e apresenta para a camera",                 environmentStyle: "realistic bedroom" };
  }
  if (/mesa|escrivaninha|estante|rack|armario|guarda.roupa|prateleira/.test(name)) {
    return { mode: "stand_beside_product",      scale: "large",    gender: "neutral", simpleAction: "fica ao lado do produto e aponta para ele",                  environmentStyle: "realistic home interior" };
  }
  if (/tapete|cortina|quadro|espelho|luminaria|lustre|abajur/.test(name)) {
    return { mode: "show_product_in_environment", scale: "large",  gender: "neutral", simpleAction: "apresenta o produto no ambiente naturalmente",               environmentStyle: "realistic home interior" };
  }
  if (/airfryer|liquidificador|batedeira|forno|microondas|cafeteira|fritadeira/.test(name)) {
    return { mode: "stand_beside_product",      scale: "large",    gender: "female",  simpleAction: "mostra o produto sobre a bancada da cozinha",                environmentStyle: "realistic kitchen" };
  }
  if (/panela|frigideira|escorredor|xicara|caneca|prato|tigela/.test(name)) {
    return { mode: "hold_with_two_hands",       scale: "medium",   gender: "female",  simpleAction: "segura o item com as duas maos e apresenta para a camera",   environmentStyle: "realistic kitchen" };
  }
  if (/secador|chapinha|escova|perfume|creme|shampoo|maquiagem|batom|skincare|hidratante|serum/.test(name)) {
    return { mode: "hold_in_hand",              scale: "small",    gender: "female",  simpleAction: "segura o produto proximo ao rosto e apresenta para a camera", environmentStyle: "realistic bathroom or vanity" };
  }
  if (/smartwatch|relogio/.test(name)) {
    return { mode: "wear_product",              scale: "small",    gender: "neutral", simpleAction: "mostra o produto no pulso para a camera",                    environmentStyle: "realistic home or lifestyle" };
  }
  if (/celular|tablet|notebook|fone|headphone|teclado|mouse/.test(name)) {
    return { mode: "hold_in_hand",              scale: "small",    gender: "neutral", simpleAction: "segura o dispositivo e mostra para a camera",                environmentStyle: "realistic desk or home" };
  }
  if (/camera|filmadora|drone/.test(name)) {
    return { mode: "hold_with_two_hands",       scale: "medium",   gender: "neutral", simpleAction: "segura o equipamento com as duas maos e apresenta",          environmentStyle: "realistic home or outdoor" };
  }
  if (/brinquedo|infantil|bebe|crianca/.test(name)) {
    return { mode: "hold_with_two_hands",       scale: "medium",   gender: "neutral", simpleAction: "segura o produto com as duas maos e apresenta para a camera", environmentStyle: "realistic clean home environment" };
  }
  if (/pet|gato|cachorro|caes|felino|aquario/.test(name)) {
    return { mode: "hold_in_hand",              scale: "small",    gender: "neutral", simpleAction: "apresenta o produto para a camera naturalmente",              environmentStyle: "realistic home environment" };
  }
  if (/halter|haltere|barra|anilha|kettlebell|elastico|yoga|fitness|academia/.test(name)) {
    return { mode: "hold_in_hand",              scale: "medium",   gender: "neutral", simpleAction: "segura o item e apresenta para a camera",                    environmentStyle: "realistic home gym or living room" };
  }

  // Padrao: segurar com duas maos
  return { mode: "hold_with_two_hands", scale: "medium", gender: "neutral", simpleAction: "segura o produto com as duas maos e apresenta para a camera", environmentStyle: "realistic home environment" };
}

// ── Brief de fallback quando a LLM falha ─────────────────────────────────────
function buildFallbackBrief(productName: string, videoStyle = "avatar_presenter"): LlmBrief {
  const speech = buildFixedSpeech(productName);
  const pres   = inferPresentation(productName, videoStyle);

  const imagePromptEn =
    videoStyle === "unboxing_review"
      ? buildUnboxingImagePrompt(productName, pres.mode, pres.environmentStyle)
      : buildFallbackImagePrompt(productName, pres.mode, pres.gender);

  const videoPromptPtBr =
    videoStyle === "unboxing_review"
      ? buildUnboxingVideoPromptPt(speech, productName, pres.mode, pres.environmentStyle)
      : buildFallbackVideoPromptPt(speech, pres.simpleAction);

  return {
    product_style:      "produto geral",
    presentation_mode:  pres.mode,
    product_scale:      pres.scale,
    gender_suggestion:  pres.gender,
    environment_style:  pres.environmentStyle,
    image_prompt_en:    imagePromptEn,
    speech_pt_br:       speech,
    simple_action_pt:   pres.simpleAction,
    video_prompt_pt_br: videoPromptPtBr,
    caption_pt_br:      "Produto encontrado na Shopee. Gere seu link de afiliada antes de postar.",
    hashtags:           ["#shopee", "#achadinhosshopee", "#shopeebrasil", "#divulgacao"],
  };
}

// ── Parsear e validar output da LLM campo a campo ────────────────────────────
function parseLlmOutput(rawOutput: unknown, productName: string, videoStyle = "avatar_presenter"): LlmBrief {
  const fallback = buildFallbackBrief(productName, videoStyle);

  let text = "";
  if (typeof rawOutput === "string") {
    text = rawOutput;
  } else if (Array.isArray(rawOutput)) {
    text = rawOutput.join("");
  } else {
    console.warn("[produto-video-create] LLM output formato inesperado:", typeof rawOutput);
    return fallback;
  }

  console.log("[produto-video-create] LLM raw output:", text.slice(0, 500));

  // Extrair JSON (com ou sem bloco markdown)
  let jsonText = text;
  const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (mdMatch) {
    jsonText = mdMatch[1].trim();
  } else {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      jsonText = objMatch[0];
    } else {
      console.warn("[produto-video-create] Nenhum JSON no output — usando fallback");
      return fallback;
    }
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    console.warn("[produto-video-create] JSON.parse falhou — usando fallback:", e);
    return fallback;
  }

  // Campos enumerados
  const presentationMode = validateEnum(
    parsed.presentation_mode, VALID_PRESENTATION_MODES,
    fallback.presentation_mode as typeof VALID_PRESENTATION_MODES[number]
  );
  const productScale = validateEnum(
    parsed.product_scale, VALID_PRODUCT_SCALES,
    fallback.product_scale as typeof VALID_PRODUCT_SCALES[number]
  );
  const genderSuggestion = validateEnum(
    parsed.gender_suggestion, VALID_GENDER_SUGGESTIONS,
    fallback.gender_suggestion as typeof VALID_GENDER_SUGGESTIONS[number]
  );

  // Fala: validar padrao obrigatorio
  const rawSpeech   = typeof parsed.speech_pt_br === "string" ? parsed.speech_pt_br.trim() : "";
  const validSpeech = validateSpeech(rawSpeech, productName, "produto-video-create/parseLlmOutput");

  const simpleAction = typeof parsed.simple_action_pt === "string" && parsed.simple_action_pt.trim()
    ? parsed.simple_action_pt.trim()
    : fallback.simple_action_pt;

  // image_prompt_en e video_prompt_pt_br:
  // Para unboxing_review: SEMPRE usar nossas funções determinísticas de produto-foco,
  // independente do que a LLM retornar — garante que o estilo nunca vire avatar.
  // Para avatar_presenter: usar da LLM se disponível, fallback por modo.
  let imagePromptEn: string;
  let videoPromptPtBr: string;

  if (videoStyle === "unboxing_review") {
    const envStyle = typeof parsed.environment_style === "string" && parsed.environment_style.trim()
      ? parsed.environment_style.trim()
      : fallback.environment_style;
    imagePromptEn  = buildUnboxingImagePrompt(productName, presentationMode, envStyle);
    videoPromptPtBr = buildUnboxingVideoPromptPt(validSpeech, productName, presentationMode, envStyle);
  } else {
    const llmImagePrompt = typeof parsed.image_prompt_en === "string" && parsed.image_prompt_en.trim()
      ? parsed.image_prompt_en.trim()
      : null;
    imagePromptEn = llmImagePrompt ?? buildFallbackImagePrompt(productName, presentationMode, genderSuggestion);

    const llmVideoPrompt = typeof parsed.video_prompt_pt_br === "string" && parsed.video_prompt_pt_br.trim()
      ? parsed.video_prompt_pt_br.trim()
      : null;
    videoPromptPtBr = llmVideoPrompt ?? buildFallbackVideoPromptPt(validSpeech, simpleAction);
  }

  const brief: LlmBrief = {
    product_style: typeof parsed.product_style === "string" && parsed.product_style.trim()
      ? parsed.product_style.trim() : fallback.product_style,
    presentation_mode:  presentationMode,
    product_scale:      productScale,
    gender_suggestion:  genderSuggestion,
    environment_style: typeof parsed.environment_style === "string" && parsed.environment_style.trim()
      ? parsed.environment_style.trim() : fallback.environment_style,
    image_prompt_en:    imagePromptEn,
    speech_pt_br:       validSpeech,
    simple_action_pt:   simpleAction,
    video_prompt_pt_br: videoPromptPtBr,
    caption_pt_br: typeof parsed.caption_pt_br === "string" && parsed.caption_pt_br.trim()
      ? parsed.caption_pt_br.trim() : fallback.caption_pt_br,
    hashtags: Array.isArray(parsed.hashtags) && parsed.hashtags.length > 0
      ? parsed.hashtags : fallback.hashtags,
  };

  console.log("[produto-video-create] brief parsed:", JSON.stringify({
    presentation_mode: brief.presentation_mode,
    product_scale:     brief.product_scale,
    gender_suggestion: brief.gender_suggestion,
    speech_pt_br:      brief.speech_pt_br,
    simple_action_pt:  brief.simple_action_pt,
  }));

  return brief;
}

// ── System prompt da LLM ──────────────────────────────────────────────────────
function buildLlmSystemPrompt(): string {
  return `Voce e um especialista em criacao de videos UGC comerciais para afiliados da Shopee no Brasil.

Sua funcao e analisar o nome do produto, a imagem enviada e o estilo de video solicitado, e retornar um JSON puro com instrucoes para gerar uma imagem realista e um video curto de divulgacao.

O nome do produto e a referencia principal.
A imagem serve para confirmar aparencia, escala, formato, cor e contexto visual.

Existem dois estilos de video possiveis:

Estilo avatar_presenter (Apresentador IA):
Uma pessoa apresenta o produto de frente para a camera em estilo UGC.
Modos de apresentacao disponiveis para este estilo:
- hold_in_hand: produto pequeno, cabe em uma mao
- hold_with_two_hands: produto medio, segurado com destaque
- wear_product: roupa, calcado, bolsa, acessorio vestivel
- use_product: produto com uso claro e demonstravel
- stand_beside_product: produto grande, movel, eletrodomestico maior
- sit_on_product: cadeira, sofa, poltrona
- lie_on_product: cama, colchao, sofa-cama
- show_product_close: produto pequeno com detalhes visuais importantes
- show_product_in_environment: produto decorativo, instalado ou de ambiente

Estilo unboxing_review (Unboxing / Review):
O produto e o foco principal. A cena e de review, demonstracao ou unboxing.
NAO gerar cena de apresentadora olhando para a camera (talking-head portrait).
NAO fazer o rosto da pessoa o foco principal da imagem.
O produto deve dominar o frame.
A pessoa pode aparecer parcialmente — maos, bracos ou figura parcial interagindo com o produto.
Modos disponiveis para este estilo:
- unbox_on_table: produto sendo desembalado sobre uma mesa — maos abrindo caixa, produto revelado
- review_on_table: produto em superficie coerente, pessoa mostrando detalhes ou demonstrando uso

Use unbox_on_table (padrao para produtos com embalagem) ou review_on_table (para produtos grandes ou sem caixa).

Para image_prompt_en no estilo unboxing_review:
- Nao usar frases como "presenter facing the camera", "talking to camera", "portrait",
  "waist-up presenter", "looking directly at camera", "presenter holding product at chest level"
- Usar frases como "product-focused scene", "hands interacting with the product",
  "review setup", "unboxing scene", "product in foreground", "person partially visible"
- Ambiente coerente com o produto: cozinha para panelas, bancada do banheiro para beleza,
  escrivaninha para eletronicos, cama/quarto para roupas

Para video_prompt_pt_br no estilo unboxing_review:
- Descrever acao de demonstracao ou unboxing, nao cena de apresentadora
- O produto deve ser o foco
- A fala funciona como narracao de review

Nunca force todo produto a ser segurado na mao.
A imagem deve parecer realista, natural e em estilo UGC.
O fundo deve ser realista e coerente com o produto.
Nao use fundo branco, fundo generico artificial ou cenario abstrato.

A pessoa deve parecer real, brasileira e coerente com o produto.
Use gender_suggestion = female para produtos femininos, male para masculinos, neutral para genericos.

Regras obrigatorias da fala (speech_pt_br):
- Em portugues do Brasil
- Citar obrigatoriamente Shopee
- Citar obrigatoriamente o nome do produto
- Terminar obrigatoriamente com "O link esta na bio."
- Maximo de 18 palavras
- Estrutura base: "Olha isso que achei na Shopee: {nome do produto}. O link esta na bio."
- Nao inventar preco, desconto, promocao, frete gratis, garantia ou comissao

Regras do video_prompt_pt_br:
- Em portugues do Brasil
- Descricao curta e objetiva da acao
- Coerente com o estilo de video (apresentador ou unboxing/review)
- Nao pedir texto na tela, legenda, overlay, tela final ou graficos

Retorne apenas JSON puro. Nao use markdown. Nao use \`\`\`json. Nao explique fora do JSON.

Schema JSON obrigatorio:
{"product_style":"","presentation_mode":"","product_scale":"","gender_suggestion":"","environment_style":"","image_prompt_en":"","speech_pt_br":"","simple_action_pt":"","video_prompt_pt_br":"","caption_pt_br":"","hashtags":[]}

Valores validos para presentation_mode: hold_in_hand, hold_with_two_hands, wear_product, use_product, stand_beside_product, sit_on_product, lie_on_product, show_product_close, show_product_in_environment, unbox_on_table, review_on_table
Valores validos para product_scale: small, medium, large, wearable, installed
Valores validos para gender_suggestion: female, male, neutral`;
}

// ── User prompt da LLM ────────────────────────────────────────────────────────
function buildLlmUserPrompt(productName: string, videoStyle = "avatar_presenter"): string {
  const styleLabel = videoStyle === "unboxing_review"
    ? "Unboxing / Review (unbox_on_table ou review_on_table)"
    : "Apresentador IA (escolha o modo de apresentacao mais coerente com o produto)";

  const styleInstructions = videoStyle === "unboxing_review"
    ? `Use presentation_mode = "unbox_on_table" (padrao para produtos com caixa) ou "review_on_table" (para produtos grandes ou sem embalagem).

Regras obrigatorias para este estilo:
- Do not create a talking-head presenter scene.
- Do not make the face the main focus.
- Make the product the main focus.
- Prefer a realistic review or demo scene.
- Show hands interacting with the product when possible.
- Show the product clearly in the foreground.
- The person may be partially visible, but the product must dominate the frame.
- The scene should look like a Brazilian UGC review or unboxing video.
- The video should feel like someone showing a Shopee find with voice narration.
- Use a realistic environment based on the product:
  kitchen counter for cookware, vanity for beauty, desk for electronics,
  bedroom for clothing, living room for furniture.
- For image_prompt_en: never use "presenter facing the camera", "talking to camera",
  "portrait", "waist-up presenter", "looking directly at camera".
  Use instead: "product-focused scene", "hands interacting with product",
  "review setup", "product in foreground", "person partially visible".`
    : `Escolha o presentation_mode mais coerente com o tipo e tamanho do produto.
Nunca force o produto a ser segurado se ele for grande, instalado ou decorativo.`;

  return `Analise a imagem do produto e o nome informado.

Nome do produto:
${productName}

Estilo de video solicitado:
${styleLabel}

${styleInstructions}

Contexto:
Este conteudo sera usado para um video curto vertical de divulgacao como afiliado da Shopee no Brasil.

O video final deve:
- ter aparencia UGC realista
- ser coerente com o estilo de video solicitado
- ter fala curta em portugues do Brasil
- mencionar Shopee e o nome do produto
- terminar com "O link esta na bio."
- nao ter texto na tela, legenda, overlay, tela final ou graficos

Gere a fala seguindo obrigatoriamente este padrao:
"Olha isso que achei na Shopee: ${productName}. O link esta na bio."

Retorne apenas JSON puro no schema exigido.`;
}

// ── Helper de resposta JSON ───────────────────────────────────────────────────
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Handler principal ─────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let currentStage = "boot";

  const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase       = createClient(supabaseUrl, serviceRoleKey);
  const replicateToken = Deno.env.get("REPLICATE_API_TOKEN")!;

  try {
    // ── 1. Auth ──────────────────────────────────────────────────────────────
    currentStage = "auth";
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Token ausente.", stage: currentStage }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return json({ error: "Token invalido.", stage: currentStage, details: authErr?.message }, 401);
    }

    // ── 1.5 Carregar configuracoes dinamicas do sistema ──────────────────────
    currentStage = "fetch_settings";
    let weeklyLimit     = 1;     // fallback seguro
    let moduleEnabled   = true;
    let disabledMessage = "Produto em Video esta temporariamente indisponivel.";

    try {
      const { data: settingRows } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("key", [
          "limits.product_videos_weekly",
          "modules.product_video.enabled",
          "modules.product_video.disabled_message",
        ]);

      if (settingRows) {
        for (const row of settingRows) {
          if (row.key === "limits.product_videos_weekly") {
            const v = row.value;
            weeklyLimit = typeof v === "number" ? v : parseInt(String(v), 10) || 1;
          }
          if (row.key === "modules.product_video.enabled") {
            moduleEnabled = row.value === true || row.value === "true";
          }
          if (row.key === "modules.product_video.disabled_message") {
            if (typeof row.value === "string") disabledMessage = row.value;
          }
        }
      }
    } catch (e) {
      console.warn("[produto-video-create] Erro ao carregar settings, usando fallback:", e);
    }

    // Modulo desativado pelo admin?
    if (!moduleEnabled) {
      return json({ error: disabledMessage }, 503);
    }

    // ── 2. Parse FormData ────────────────────────────────────────────────────
    currentStage = "parse_form";
    const formData    = await req.formData();
    const imageFile   = formData.get("image") as File | null;
    const productName = ((formData.get("product_name") as string | null) ?? "").trim();
    const videoStyle  = ((formData.get("video_style") as string | null) ?? "avatar_presenter").trim();
    const validVideoStyle = videoStyle === "unboxing_review" ? "unboxing_review" : "avatar_presenter";

    if (!imageFile || imageFile.size === 0) {
      return json({ error: "Imagem do produto e obrigatoria.", stage: currentStage }, 400);
    }
    if (!productName) {
      return json({ error: "Nome do produto e obrigatorio.", stage: currentStage }, 400);
    }

    console.log(`[produto-video-create] stage=${currentStage} size=${imageFile.size} product="${productName}" video_style="${validVideoStyle}"`);

    // ── 2.5 Verificar limite semanal (1 video por semana por usuario) ────────
    currentStage = "check_weekly_limit";
    {
      const now = new Date();
      const dayOfWeek      = now.getUTCDay(); // 0 = domingo, 1 = segunda...
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart      = new Date(now);
      weekStart.setUTCDate(now.getUTCDate() - daysFromMonday);
      weekStart.setUTCHours(0, 0, 0, 0);

      const { count: weeklyCount, error: countErr } = await supabase
        .from("produto_video_jobs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .neq("status", "failed")
        .gte("created_at", weekStart.toISOString());

      if (countErr) {
        console.warn(`[produto-video-create] Erro ao verificar limite semanal: ${countErr.message}`);
      }

      if ((weeklyCount ?? 0) >= weeklyLimit) {
        console.log(`[produto-video-create] limite semanal atingido user_id=${user.id} weeklyCount=${weeklyCount} limit=${weeklyLimit}`);
        return json(
          {
            error:
              `Limite semanal atingido. Voce pode gerar ${weeklyLimit} video(s) por semana. ` +
              "Disponivel novamente na proxima segunda-feira.",
          },
          429
        );
      }
    }

    // ── 3. Upload da imagem para R2 ──────────────────────────────────────────
    currentStage = "upload_r2";
    const r2Endpoint   = Deno.env.get("R2_ENDPOINT")!;
    const r2Bucket     = Deno.env.get("R2_BUCKET")!;
    const r2AccessKey  = Deno.env.get("R2_ACCESS_KEY_ID")!;
    const r2SecretKey  = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
    const r2PublicBase = Deno.env.get("R2_PUBLIC_BASE_URL")!;

    const aws = new AwsClient({
      accessKeyId:     r2AccessKey,
      secretAccessKey: r2SecretKey,
      service: "s3",
      region:  "auto",
    });

    const jobId    = crypto.randomUUID();
    const ext      = imageFile.type.includes("png") ? "png" : "jpg";
    const r2Key    = `produto-videos/${user.id}/${jobId}/source.${ext}`;
    const imgBytes = await imageFile.arrayBuffer();

    const uploadResp = await aws.fetch(`${r2Endpoint}/${r2Bucket}/${r2Key}`, {
      method: "PUT",
      headers: { "Content-Type": imageFile.type },
      body: imgBytes,
    });

    if (!uploadResp.ok) {
      const body = await uploadResp.text().catch(() => "");
      throw new Error(`[${currentStage}] R2 PUT ${uploadResp.status}: ${body}`);
    }

    const sourceImageUrl = `${r2PublicBase}/${r2Key}`;
    const expiresAt      = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    console.log(`[produto-video-create] sourceImageUrl=${sourceImageUrl}`);

    // ── 4. Chamar LLM para gerar brief ───────────────────────────────────────
    currentStage = "call_llm";
    let brief: LlmBrief;
    let llmNote = "";

    if (BYPASS_LLM) {
      console.log("[produto-video-create] BYPASS_LLM=true — usando fallback");
      brief   = buildFallbackBrief(productName, validVideoStyle);
      llmNote = "BYPASS_LLM=true";
    } else {
      console.log(`[produto-video-create] chamando LLM model=${LLM_MODEL} product="${productName}" video_style="${validVideoStyle}"`);

      const llmResp = await fetch(
        `https://api.replicate.com/v1/models/${LLM_MODEL}/predictions`,
        {
          method: "POST",
          headers: {
            Authorization:  `Bearer ${replicateToken}`,
            "Content-Type": "application/json",
            Prefer:         "wait",
          },
          body: JSON.stringify({
            input: {
              messages: [
                {
                  role:    "system",
                  content: buildLlmSystemPrompt(),
                },
                {
                  role: "user",
                  content: [
                    { type: "image_url", image_url: { url: sourceImageUrl } },
                    { type: "text", text: buildLlmUserPrompt(productName, validVideoStyle) },
                  ],
                },
              ],
            },
          }),
        }
      );

      if (!llmResp.ok) {
        const errText = await llmResp.text().catch(() => "");
        console.error(`[produto-video-create] LLM HTTP ${llmResp.status}: ${errText.slice(0, 300)}`);
        brief   = buildFallbackBrief(productName, validVideoStyle);
        llmNote = `LLM HTTP ${llmResp.status}: ${errText.slice(0, 200)}`;
      } else {
        const llmPred = await llmResp.json();
        console.log("[produto-video-create] LLM output:", JSON.stringify(llmPred.output)?.slice(0, 500));

        if (llmPred.status === "succeeded" && llmPred.output != null) {
          brief   = parseLlmOutput(llmPred.output, productName, validVideoStyle);
          llmNote = llmPred.error ? `LLM warning: ${llmPred.error}` : "";
        } else {
          console.error(
            `[produto-video-create] LLM falhou status=${llmPred.status} error=${llmPred.error}`
          );
          brief   = buildFallbackBrief(productName, validVideoStyle);
          llmNote = `LLM status=${llmPred.status} error=${String(llmPred.error)}`;
        }
      }
    }

    console.log("[produto-video-create] speech_pt_br:", brief.speech_pt_br);
    console.log("[produto-video-create] presentation_mode:", brief.presentation_mode);
    console.log("[produto-video-create] image_prompt_en:", brief.image_prompt_en.slice(0, 200));

    if (validVideoStyle === "unboxing_review") {
      console.log("[produto-video-create] unboxing_review presentation_mode:", brief.presentation_mode);
      console.log("[produto-video-create] unboxing_review image_prompt_en:", brief.image_prompt_en);
      console.log("[produto-video-create] unboxing_review video_prompt_pt_br:", brief.video_prompt_pt_br);
    }

    // ── 5. Inserir job no banco ──────────────────────────────────────────────
    currentStage = "insert_job";

    // Nota: video_prompt_en armazena o video_prompt_pt_br para compatibilidade com schema existente
    const basePayload = {
      id:               jobId,
      user_id:          user.id,
      status:           "creating_image",
      product_name:     productName,
      video_style:      validVideoStyle,
      tone:             "direto",       // mantido por compatibilidade com schema do banco
      cta_option:       "link-na-bio",  // mantido por compatibilidade com schema do banco
      source_image_url: sourceImageUrl,
      expires_at:       expiresAt,
      image_prompt_en:  brief.image_prompt_en,
      speech_pt_br:     brief.speech_pt_br,
      video_prompt_en:  brief.video_prompt_pt_br, // coluna existente reutilizada para o prompt pt_br
      caption_pt_br:    brief.caption_pt_br,
      hashtags:         brief.hashtags,
      error_message:    llmNote || null,
    };

    // Tentar com llm_result; fallback gracioso se coluna nao existir
    let insertResult = await supabase
      .from("produto_video_jobs")
      .insert({ ...basePayload, llm_result: JSON.stringify(brief) })
      .select()
      .single();

    if (insertResult.error?.message?.toLowerCase().includes("llm_result")) {
      console.warn("[produto-video-create] coluna llm_result nao existe — insert sem ela");
      insertResult = await supabase
        .from("produto_video_jobs")
        .insert(basePayload)
        .select()
        .single();
    }

    const { data: job, error: insertErr } = insertResult;
    if (insertErr || !job) {
      throw new Error(`[${currentStage}] Supabase insert: ${insertErr?.message ?? "no data"}`);
    }

    console.log(`[produto-video-create] job inserido job_id=${jobId}`);

    // ── 6. Chamar nano-banana (sincrono com Prefer: wait) ────────────────────
    currentStage = "call_nano_banana";

    const nanoResp = await fetch(
      `https://api.replicate.com/v1/models/${IMAGE_MODEL}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${replicateToken}`,
          "Content-Type": "application/json",
          Prefer:         "wait",
        },
        body: JSON.stringify({
          input: {
            aspect_ratio:  "9:16",
            image_input:   [sourceImageUrl],
            output_format: "jpg",
            prompt:        brief.image_prompt_en,
          },
        }),
      }
    );

    console.log(`[produto-video-create] nano-banana HTTP=${nanoResp.status}`);

    if (!nanoResp.ok) {
      const nanoErr  = await nanoResp.text().catch(() => "");
      const httpCode = nanoResp.status;
      const retryable =
        httpCode === 429 || httpCode === 500 || httpCode === 502 ||
        httpCode === 503 || httpCode === 504;

      if (retryable) {
        // Manter job em creating_image sem prediction_id; refresh vai retentar
        await supabase
          .from("produto_video_jobs")
          .update({
            image_attempts: 1,
            error_message:  `nano-banana ${httpCode}, retry scheduled (attempt 1/3)`,
          })
          .eq("id", jobId);
        return json(job);
      }

      // Falha definitiva
      await supabase
        .from("produto_video_jobs")
        .update({
          status:        "failed",
          error_message: `nano-banana ${httpCode}: ${nanoErr.slice(0, 200)}`,
          completed_at:  new Date().toISOString(),
        })
        .eq("id", jobId);
      throw new Error(`[${currentStage}] Replicate ${httpCode}: ${nanoErr.slice(0, 500)}`);
    }

    const nanoPred = await nanoResp.json();
    console.log(`[produto-video-create] nano-banana pred_id=${nanoPred.id} status=${nanoPred.status}`);

    // ── 7. Salvar prediction_id e retornar job ao frontend ───────────────────
    currentStage = "save_prediction";
    const { data: updatedJob } = await supabase
      .from("produto_video_jobs")
      .update({ replicate_prediction_id: nanoPred.id })
      .eq("id", jobId)
      .select()
      .single();

    console.log(`[produto-video-create] concluido job_id=${jobId} speech="${brief.speech_pt_br}"`);

    return json(updatedJob ?? job);

  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : String(err);
    console.error(`[produto-video-create] ERRO stage=${currentStage}:`, details);
    return json({ error: "internal_error", stage: currentStage, details }, 500);
  }
});
