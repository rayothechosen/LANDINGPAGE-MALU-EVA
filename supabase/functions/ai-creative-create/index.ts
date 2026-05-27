import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.19";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Prompts oficiais por estilo ────────────────────────────────────────────────

const STYLE_PROMPTS: Record<string, string> = {
  "studio-premium": `Transform this product photo into a premium studio advertisement image.

Keep the product exactly as it appears in the original photo — same shape, proportions, colors, and key visual details. Do not alter or replace the product itself.

Remove the original background completely and rebuild the scene as a clean, minimal studio environment. Use a soft neutral background (white, light gray, or warm cream). Add professional studio lighting with subtle directional light and gentle soft shadows beneath the product. The surface should be clean and minimal.

No people, no hands, no text, no logos, no graphic overlays. The product should be perfectly centered and clearly visible. The final result must look like a high-end ecommerce product advertisement optimized for vertical social media format.`,

  "ambiente": `Transform this product photo into a lifestyle advertisement image.

Keep the product exactly as it appears — same shape, proportions, colors, and key visual details. Do not alter or replace the product.

Remove the original background and place the product in a clean, aspirational lifestyle environment appropriate for this type of product. The setting should feel natural, premium, and relatable. Use warm, soft natural lighting. Keep the scene simple and uncluttered — the product must remain the clear focal point.

No text, no logos, no graphic overlays. The final result should feel like a polished lifestyle advertisement optimized for vertical social media format.`,

  "redes-sociais": `Transform this product photo into a bold social media advertisement image.

Keep the product exactly as it appears — same shape, proportions, colors, and key visual details. Do not alter or replace the product.

Remove the original background and create a visually striking, modern composition. The product should be the clear and dominant focal point. Use a clean, contemporary aesthetic with dynamic but controlled framing. Choose a background color or gradient that feels fresh and modern while complementing the product.

No text, no logos, no graphic overlays, no people. The final result should feel scroll-stopping and commercially polished, optimized for vertical Instagram and TikTok format.`,

  "oferta": `Transform this product photo into a clean promotional advertisement image.

Keep the product exactly as it appears — same shape, proportions, colors, and key visual details. Do not alter or replace the product.

Remove the original background and place the product prominently on a clean, bright surface with generous empty space around it. Use clear, attractive lighting that highlights the product's details and makes it look appealing and valuable. The background should be minimal, light, and inviting.

No text, no logos, no graphic overlays, no people. The final result should feel like a polished value-focused promotional advertisement optimized for vertical social media format.`,
};

const VALID_STYLES = Object.keys(STYLE_PROMPTS);

// ── Handler ────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // ── 1. Validar auth ────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Token de autenticacao ausente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: "Token invalido ou expirado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[ai-creative-create] user autenticado:", user.id);

    // ── 2. Parse FormData ──────────────────────────────────────────────────────
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const styleRaw = (formData.get("style") as string | null)?.trim() ?? "";
    const style = VALID_STYLES.includes(styleRaw) ? styleRaw : "studio-premium";

    console.log("[ai-creative-create] estilo:", style);

    if (!imageFile || imageFile.size === 0) {
      console.log("[ai-creative-create] imagem nao recebida");
      return new Response(
        JSON.stringify({ error: "Imagem nao enviada." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Imagem muito grande. Limite: 5 MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[ai-creative-create] imagem recebida:", imageFile.name, imageFile.type, imageFile.size, "bytes");

    // ── 3. Gerar jobId e fazer upload da imagem de origem para R2 ─────────────
    const jobId = crypto.randomUUID();

    const r2Endpoint = Deno.env.get("R2_ENDPOINT")!;
    const r2Bucket = Deno.env.get("R2_BUCKET")!;
    const r2AccessKey = Deno.env.get("R2_ACCESS_KEY_ID")!;
    const r2SecretKey = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
    const r2PublicBase = Deno.env.get("R2_PUBLIC_BASE_URL")!;

    const ext =
      imageFile.type === "image/png"
        ? "png"
        : imageFile.type === "image/webp"
        ? "webp"
        : "jpg";

    const r2Key = `ai-creatives/${user.id}/${jobId}/source.${ext}`;
    const imageBytes = await imageFile.arrayBuffer();

    console.log("[ai-creative-create] r2Key:", r2Key);

    const aws = new AwsClient({
      accessKeyId: r2AccessKey,
      secretAccessKey: r2SecretKey,
      service: "s3",
      region: "auto",
    });

    const uploadResp = await aws.fetch(`${r2Endpoint}/${r2Bucket}/${r2Key}`, {
      method: "PUT",
      headers: { "Content-Type": imageFile.type },
      body: imageBytes,
    });

    if (!uploadResp.ok) {
      const errBody = await uploadResp.text().catch(() => "");
      throw new Error(`R2 upload falhou (${uploadResp.status}): ${errBody}`);
    }

    const sourceImageUrl = `${r2PublicBase}/${r2Key}`;
    console.log("[ai-creative-create] sourceImageUrl:", sourceImageUrl);

    // ── 4. Inserir job com source_image_url ja definida ───────────────────────
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: job, error: jobErr } = await supabase
      .from("ai_creative_jobs")
      .insert({
        id: jobId,
        user_id: user.id,
        status: "processing",
        style,
        source_image_url: sourceImageUrl,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (jobErr || !job) throw new Error(jobErr?.message ?? "Erro ao criar job.");
    console.log("[ai-creative-create] job criado:", job.id);

    // ── 5. Chamar Replicate (flux-kontext-pro) ────────────────────────────────
    const replicateToken = Deno.env.get("REPLICATE_API_TOKEN")!;
    const prompt = STYLE_PROMPTS[style];

    const predResp = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${replicateToken}`,
          "Content-Type": "application/json",
          Prefer: "respond-async",
        },
        body: JSON.stringify({
          input: {
            prompt,
            input_image: sourceImageUrl,
            aspect_ratio: "9:16",
            output_format: "jpg",
            safety_tolerance: 2,
          },
        }),
      }
    );

    if (!predResp.ok) {
      const errBody = await predResp.text().catch(() => "");
      console.error("[ai-creative-create] Replicate error:", predResp.status, errBody);
      const { error: updateErr } = await supabase
        .from("ai_creative_jobs")
        .update({
          status: "failed",
          error_message: `Replicate error (${predResp.status}): ${errBody}`,
        })
        .eq("id", job.id);
      if (updateErr) console.error("[ai-creative-create] erro ao marcar failed:", updateErr.message);
      throw new Error("NAO_FOI_POSSIVEL_GERAR");
    }

    const prediction = await predResp.json();
    console.log("[ai-creative-create] prediction id:", prediction.id);

    // ── 6. Salvar prediction_id ────────────────────────────────────────────────
    const { error: updateErr } = await supabase
      .from("ai_creative_jobs")
      .update({ replicate_prediction_id: prediction.id })
      .eq("id", job.id);
    if (updateErr) console.error("[ai-creative-create] erro ao salvar prediction_id:", updateErr.message);

    return new Response(
      JSON.stringify({ job_id: job.id, prediction_id: prediction.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const internal = err instanceof Error ? err.message : "Erro interno.";
    console.error("[ai-creative-create] erro:", internal);

    return new Response(
      JSON.stringify({ error: "Nao foi possivel gerar a imagem agora. Tente novamente em alguns instantes." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
