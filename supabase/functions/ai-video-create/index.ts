import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.19";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Prompt fixo para animacao de imagem publicitaria ja gerada
const PROMPT_FROM_CREATIVE =
  "Animate this product advertisement image with smooth, cinematic motion. Apply a slow, gentle push-in camera movement. Add subtle parallax depth effect. Keep all visual content exactly as shown — do not add, remove, or alter any elements. No scene changes, no added objects, no text. Commercial style. Vertical social media format.";

// ── Prompts por estilo (para upload direto de produto) ────────────────────────
const STYLE_PROMPTS: Record<string, string> = {
  demonstrativo: `Create a short vertical product showcase video from this image.

Preserve the product exactly as provided. Keep the same product identity, overall shape, proportions, colors, and visible design details. Completely ignore the original background and rebuild the scene as a clean neutral studio setting with soft shadows, premium lighting, and a minimal commercial style.

Keep the product as the only subject. No humans. No hands. No lifestyle environment. No complex scene changes. No extra props unless absolutely necessary. No text, no subtitles, no logos, and no graphic overlays.

Use a simple and elegant sequence:
1. opening shot with the product centered,
2. slow cinematic camera push-in,
3. gentle side angle reveal,
4. close-up detail shot,
5. final hero shot of the product centered.

The motion should be smooth, controlled, realistic, and visually pleasing. The result must look like a premium ecommerce ad for social media in a vertical format.`,

  "produto-em-uso": `Create a short vertical product-in-use video from this image.

Preserve the product exactly as provided, including its shape, proportions, colors, and key visual details. Completely ignore the original background and rebuild the scene in a clean, controlled, premium commercial environment.

Show the product being naturally demonstrated in a simple and believable way, with minimal human interaction only if necessary. The main focus must remain on the product itself, clearly visible at all times. Avoid complex lifestyle scenes.

Use soft professional lighting, smooth camera movement, and visually clean composition. No clutter, no text, no subtitles, no logos, and no distracting background elements. The final result should feel like a polished vertical ecommerce ad.`,

  unboxing: `Create a short vertical unboxing-style product video from this image.

Preserve the product exactly as provided, including its shape, proportions, colors, and key design details. Completely ignore the original background and rebuild the scene in a clean premium studio setting.

Show a simple and elegant unboxing presentation: a minimal package or clean wrapping is opened in a controlled way, revealing the product as the main focus. Keep the reveal visually satisfying and polished.

Use soft commercial lighting and smooth camera movement. No complex environment, no clutter, no text, no subtitles, no logos. The final result should feel like a refined social media ecommerce ad in vertical format.`,

  viral: `Create a short vertical viral-style product video from this image.

Preserve the product exactly as provided, including its shape, proportions, colors, and visible design details. Completely ignore the original background and replace it with a clean, premium visual setup that feels modern and attention-grabbing.

Open with a strong product-focused hook in the first second. Use dynamic but controlled camera movement, bold framing, and visually satisfying motion while keeping the product clearly visible and dominant throughout. The style should feel engaging and scroll-stopping, but still clean and commercially polished.

Do not add people unless absolutely necessary. Do not add clutter, complex storytelling, text, subtitles, logos, or graphic overlays.`,
};

const VALID_STYLES = Object.keys(STYLE_PROMPTS);

function buildPrompt(style: string, extraDetail: string): string {
  const base = STYLE_PROMPTS[style] ?? STYLE_PROMPTS["demonstrativo"];
  if (extraDetail.trim()) {
    return `${base}\n\nAdditional direction: ${extraDetail.trim()}`;
  }
  return base;
}

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

    console.log("[ai-video-create] user autenticado:", user.id);

    // ── 2. Parse FormData ──────────────────────────────────────────────────────
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const sourceImageUrl = (formData.get("source_image_url") as string | null)?.trim();
    const styleRaw = (formData.get("style") as string | null)?.trim() ?? "";
    const extraDetail = (formData.get("extraDetail") as string | null)?.trim() ?? "";

    // Precisa de imagem OU URL de criativo
    if (!sourceImageUrl && (!imageFile || imageFile.size === 0)) {
      return new Response(
        JSON.stringify({ error: "Imagem nao enviada." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Imagem muito grande. Limite: 5 MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Quando vem de um criativo, usa prompt de animacao fixo
    // Quando vem de upload direto, usa estilo selecionado
    const isFromCreative = !!sourceImageUrl;
    const style = VALID_STYLES.includes(styleRaw) ? styleRaw : "demonstrativo";
    const prompt = isFromCreative
      ? PROMPT_FROM_CREATIVE
      : buildPrompt(style, extraDetail);

    console.log(
      "[ai-video-create] modo:",
      isFromCreative ? "from-creative" : "direct-upload",
      "| estilo:", isFromCreative ? "fixo" : style
    );

    // ── 3. Verificar limite semanal ────────────────────────────────────────────
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - daysFromMonday);
    monday.setUTCHours(0, 0, 0, 0);

    const { data: weekJobs, error: countErr } = await supabase
      .from("ai_video_jobs")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "succeeded"])
      .gte("created_at", monday.toISOString());

    if (countErr) throw new Error(countErr.message);

    console.log("[ai-video-create] videos usados esta semana:", weekJobs?.length ?? 0);

    if ((weekJobs?.length ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ error: "Voce atingiu o limite de 3 videos IA nesta semana." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Obter URL da imagem (R2 upload ou URL do criativo) ─────────────────
    const jobId = crypto.randomUUID();
    let imageUrl: string;

    if (isFromCreative) {
      // Usa diretamente a imagem publicitaria ja armazenada no R2
      imageUrl = sourceImageUrl!;
      console.log("[ai-video-create] usando criativo como input:", imageUrl);
    } else {
      // Upload do arquivo para R2
      const r2Endpoint = Deno.env.get("R2_ENDPOINT")!;
      const r2Bucket = Deno.env.get("R2_BUCKET")!;
      const r2AccessKey = Deno.env.get("R2_ACCESS_KEY_ID")!;
      const r2SecretKey = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
      const r2PublicBase = Deno.env.get("R2_PUBLIC_BASE_URL")!;

      const ext =
        imageFile!.type === "image/png"
          ? "png"
          : imageFile!.type === "image/webp"
          ? "webp"
          : "jpg";

      const r2Key = `ai-inputs/${user.id}/${jobId}/input.${ext}`;
      const imageBytes = await imageFile!.arrayBuffer();

      console.log("[ai-video-create] r2Key:", r2Key);

      const aws = new AwsClient({
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
        service: "s3",
        region: "auto",
      });

      const uploadResp = await aws.fetch(`${r2Endpoint}/${r2Bucket}/${r2Key}`, {
        method: "PUT",
        headers: { "Content-Type": imageFile!.type },
        body: imageBytes,
      });

      if (!uploadResp.ok) {
        const errBody = await uploadResp.text().catch(() => "");
        throw new Error(`R2 upload falhou (${uploadResp.status}): ${errBody}`);
      }

      imageUrl = `${r2PublicBase}/${r2Key}`;
      console.log("[ai-video-create] imageUrl:", imageUrl);
    }

    // ── 5. Inserir job com image_url ja definida ───────────────────────────────
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: job, error: jobErr } = await supabase
      .from("ai_video_jobs")
      .insert({
        id: jobId,
        user_id: user.id,
        status: "processing",
        prompt,
        image_url: imageUrl,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (jobErr || !job) throw new Error(jobErr?.message ?? "Erro ao criar job.");
    console.log("[ai-video-create] job criado:", job.id);

    // ── 6. Chamar Replicate ────────────────────────────────────────────────────
    const replicateToken = Deno.env.get("REPLICATE_API_TOKEN")!;

    const predResp = await fetch(
      "https://api.replicate.com/v1/models/wan-video/wan-2.2-i2v-fast/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${replicateToken}`,
          "Content-Type": "application/json",
          Prefer: "respond-async",
        },
        body: JSON.stringify({
          input: {
            image: imageUrl,
            prompt,
            max_area: "480*832",
            fast_mode: "Balanced",
            sample_steps: 30,
          },
        }),
      }
    );

    if (!predResp.ok) {
      const errBody = await predResp.text().catch(() => "");
      console.error("[ai-video-create] Replicate error:", predResp.status, errBody);
      const { error: updateErr } = await supabase
        .from("ai_video_jobs")
        .update({
          status: "failed",
          error_message: `Replicate API error (${predResp.status}): ${errBody}`,
        })
        .eq("id", job.id);
      if (updateErr) console.error("[ai-video-create] erro ao marcar failed:", updateErr.message);
      throw new Error("NAO_FOI_POSSIVEL_GERAR");
    }

    const prediction = await predResp.json();
    console.log("[ai-video-create] prediction id:", prediction.id);

    // ── 7. Salvar prediction_id ────────────────────────────────────────────────
    const { error: updateErr } = await supabase
      .from("ai_video_jobs")
      .update({ replicate_prediction_id: prediction.id })
      .eq("id", job.id);
    if (updateErr) console.error("[ai-video-create] erro ao salvar prediction_id:", updateErr.message);

    return new Response(
      JSON.stringify({ job_id: job.id, prediction_id: prediction.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const internal = err instanceof Error ? err.message : "Erro interno.";
    console.error("[ai-video-create] erro:", internal);

    return new Response(
      JSON.stringify({ error: "Nao foi possivel gerar o video agora. Tente novamente em ate 3 horas." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
