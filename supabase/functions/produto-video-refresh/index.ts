import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.19";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Modelos ───────────────────────────────────────────────────────────────────
const IMAGE_MODEL = "google/nano-banana";
const VIDEO_MODEL = "prunaai/p-video-avatar";

// ── Fala fixa: sempre cita Shopee + produto + link na bio ─────────────────────
function buildFixedSpeech(productName: string): string {
  const name = productName && productName.trim() ? productName.trim() : "esse produto";
  return `Olha isso que achei na Shopee: ${name}. O link esta na bio.`;
}

// ── Video prompt fallback em portugues ────────────────────────────────────────
function buildFallbackVideoPromptPt(speechPtBr: string): string {
  return (
    `Faca a apresentadora mostrar o produto para a camera e falar em portugues do Brasil. ` +
    `Acao natural e simples. Produto visivel. ` +
    `Nao mostrar texto na tela. Nao mostrar legenda. Nao mostrar overlay. ` +
    `Nao mostrar tela final. Cena continua e natural.`
  );
}

// ── Detectar se o texto parece ingles ─────────────────────────────────────────
function looksLikeEnglish(text: string): boolean {
  if (!text || text.length < 5) return false;
  const pattern =
    /\b(the|this|your|amazing|perfect|great|click|check|out|now|buy|get|will|you are|it is|i am|don't|can't|won't|i'm|you're|it's|product|presenter|holder|holding)\b/i;
  return pattern.test(text);
}

// ── Validar e corrigir fala ───────────────────────────────────────────────────
function validateAndFixSpeech(speech: string, productName: string, context: string): string {
  const fixed = buildFixedSpeech(productName);
  if (!speech || speech.trim().length === 0) {
    console.log(`[${context}] fala vazia — usando fala fixa`);
    return fixed;
  }
  if (looksLikeEnglish(speech)) {
    console.log(`[${context}] fala em ingles — usando fala fixa`);
    return fixed;
  }
  if (!speech.toLowerCase().includes("shopee")) {
    console.log(`[${context}] fala sem Shopee — usando fala fixa`);
    return fixed;
  }
  if (!/link.*bio|na bio/i.test(speech)) {
    console.log(`[${context}] fala sem link na bio — usando fala fixa`);
    return fixed;
  }
  const words = speech.trim().split(/\s+/);
  if (words.length > 18) {
    console.log(`[${context}] fala muito longa — usando fala fixa`);
    return fixed;
  }
  return speech.trim();
}

// ── Constantes de fallback ────────────────────────────────────────────────────
const FALLBACK_SPEECH       = "Olha isso que achei na Shopee: esse produto. O link esta na bio.";
const FALLBACK_IMAGE_PROMPT =
  "A realistic Brazilian female content creator facing the camera and holding the product clearly " +
  "at chest level in a realistic home environment. Natural lighting. Vertical 9:16 composition. " +
  "No text, no logos, no price tags, no overlays, no extra products.";

const FRIENDLY_ERROR = "Nao foi possivel gerar o video agora. Tente novamente em alguns instantes.";

// ── Upload de bytes para R2 ───────────────────────────────────────────────────
async function uploadToR2(
  aws: AwsClient,
  endpoint: string,
  bucket: string,
  key: string,
  body: ArrayBuffer,
  contentType: string
): Promise<void> {
  const resp = await aws.fetch(`${endpoint}/${bucket}/${key}`, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body,
  });
  if (!resp.ok) {
    const errBody = await resp.text().catch(() => "");
    throw new Error(`R2 upload falhou (${resp.status}): ${errBody}`);
  }
}

// ── Download de URL (normal ou data:base64) ───────────────────────────────────
async function fetchBytes(url: string): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  if (url.startsWith("data:")) {
    const comma       = url.indexOf(",");
    const contentType = url.slice(5, comma).split(";")[0];
    const b64         = url.slice(comma + 1);
    const bin         = atob(b64);
    const bytes       = new Uint8Array([...bin].map((c) => c.charCodeAt(0))).buffer;
    return { bytes, contentType };
  }
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download falhou (${resp.status}): ${url.slice(0, 80)}`);
  const bytes       = await resp.arrayBuffer();
  const contentType = resp.headers.get("content-type") || "application/octet-stream";
  return { bytes, contentType };
}

// ── Marcar job como failed ────────────────────────────────────────────────────
async function markFailed(
  supabase: ReturnType<typeof createClient>,
  jobId: string,
  reason: string
) {
  const { data } = await supabase
    .from("produto_video_jobs")
    .update({ status: "failed", error_message: reason, completed_at: new Date().toISOString() })
    .eq("id", jobId)
    .select()
    .single();
  return data;
}

// ── Status HTTP que permite retry automatico ──────────────────────────────────
function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

// ── Iniciar nano-banana ───────────────────────────────────────────────────────
async function startNanoBanana(
  replicateToken: string,
  imagePromptEn: string,
  sourceImageUrl: string
): Promise<{ ok: true; predId: string } | { ok: false; errBody: string; status: number }> {
  console.log(
    `[produto-video-refresh] chamando nano-banana model=${IMAGE_MODEL} ` +
    `prompt="${imagePromptEn.slice(0, 80)}..."`
  );

  const resp = await fetch(
    `https://api.replicate.com/v1/models/${IMAGE_MODEL}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${replicateToken}`,
        "Content-Type": "application/json",
        Prefer:         "respond-async",
      },
      body: JSON.stringify({
        input: {
          prompt:        imagePromptEn,
          aspect_ratio:  "9:16",
          image_input:   [sourceImageUrl],
          output_format: "jpg",
        },
      }),
    }
  );

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => "");
    console.error(`[produto-video-refresh] nano-banana HTTP ${resp.status}:`, errBody.slice(0, 300));
    return { ok: false, errBody, status: resp.status };
  }
  const pred = await resp.json();
  console.log("[produto-video-refresh] nano-banana prediction iniciada:", pred.id);
  return { ok: true, predId: pred.id };
}

// ── Handler principal ─────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase       = createClient(supabaseUrl, serviceRoleKey);
  const replicateToken = Deno.env.get("REPLICATE_API_TOKEN")!;
  const r2Endpoint     = Deno.env.get("R2_ENDPOINT")!;
  const r2Bucket       = Deno.env.get("R2_BUCKET")!;
  const r2AccessKey    = Deno.env.get("R2_ACCESS_KEY_ID")!;
  const r2SecretKey    = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
  const r2PublicBase   = Deno.env.get("R2_PUBLIC_BASE_URL")!;

  const aws = new AwsClient({
    accessKeyId:     r2AccessKey,
    secretAccessKey: r2SecretKey,
    service: "s3",
    region:  "auto",
  });

  const respond = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return respond({ error: "Token ausente." }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return respond({ error: "Token invalido." }, 401);
    }

    // ── 2. Parse body ────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { job_id } = body as { job_id?: string };
    if (!job_id) {
      return respond({ error: "job_id e obrigatorio." }, 400);
    }

    // ── 3. Carregar job ──────────────────────────────────────────────────────
    const { data: job, error: jobErr } = await supabase
      .from("produto_video_jobs")
      .select("*")
      .eq("id", job_id)
      .eq("user_id", user.id)
      .single();

    if (jobErr || !job) {
      return respond({ error: "Job nao encontrado." }, 404);
    }

    // Estado terminal: retorna sem alteracao
    if (job.status === "succeeded" || job.status === "failed") {
      return respond(job);
    }

    // ── 4. Criar imagem (retry de nano-banana sem prediction_id) ──────────────
    if (!job.replicate_prediction_id) {
      if (job.status === "creating_image") {
        const imageAttempts = ((job.image_attempts as number) || 0) + 1;
        console.log(
          `[produto-video-refresh] creating_image sem prediction_id — ` +
          `tentativa ${imageAttempts}/3`
        );

        if (imageAttempts > 3) {
          const failed = await markFailed(
            supabase, job.id,
            "Numero maximo de tentativas atingido para geracao da imagem. Tente novamente."
          );
          return respond(failed ?? job);
        }

        const imagePrompt = (job.image_prompt_en as string) || FALLBACK_IMAGE_PROMPT;
        const nanoResult  = await startNanoBanana(
          replicateToken, imagePrompt, job.source_image_url as string
        );

        if (!nanoResult.ok) {
          const retryable = isRetryableStatus(nanoResult.status);
          if (!retryable || imageAttempts >= 3) {
            const failed = await markFailed(supabase, job.id, "Falha ao gerar a imagem da apresentadora.");
            return respond(failed ?? job);
          }
          const { data: upd } = await supabase
            .from("produto_video_jobs")
            .update({
              image_attempts: imageAttempts,
              error_message:  `nano-banana ${nanoResult.status}, retry scheduled (attempt ${imageAttempts}/3)`,
            })
            .eq("id", job.id)
            .select()
            .single();
          return respond(upd ?? job);
        }

        const { data: upd } = await supabase
          .from("produto_video_jobs")
          .update({
            replicate_prediction_id: nanoResult.predId,
            image_attempts:          imageAttempts,
            error_message:           null,
          })
          .eq("id", job.id)
          .select()
          .single();
        return respond(upd ?? job);
      }

      console.warn("[produto-video-refresh] job sem prediction_id:", job.id, "status:", job.status);
      return respond(job);
    }

    // ── 5. Consultar prediction atual na Replicate ────────────────────────────
    console.log(
      `[produto-video-refresh] polling job=${job.id} status=${job.status} ` +
      `pred=${job.replicate_prediction_id}`
    );

    const predResp = await fetch(
      `https://api.replicate.com/v1/predictions/${job.replicate_prediction_id}`,
      { headers: { Authorization: `Bearer ${replicateToken}` } }
    );
    if (!predResp.ok) {
      console.error("[produto-video-refresh] poll HTTP falhou:", predResp.status);
      throw new Error(`Replicate poll falhou: ${predResp.status}`);
    }
    const prediction = await predResp.json();

    console.log(
      `[produto-video-refresh] prediction id=${prediction.id} status=${prediction.status}` +
      (prediction.error ? ` error="${prediction.error}"` : "")
    );

    // Ainda em fila — retornar sem mudanca
    if (prediction.status === "starting" || prediction.status === "processing") {
      return respond(job);
    }

    let updatedJob = { ...job };

    // ════════════════════════════════════════════════════════════════════════
    // ESTAGIO: creating_image
    // nano-banana terminou. Salvar imagem e iniciar p-video-avatar.
    // ════════════════════════════════════════════════════════════════════════
    if (job.status === "creating_image") {

      if (prediction.status === "failed" || prediction.status === "canceled") {
        console.error(
          `[produto-video-refresh] nano-banana falhou. ` +
          `id=${prediction.id} error=${prediction.error}`
        );
        const failed = await markFailed(supabase, job.id, FRIENDLY_ERROR);
        return respond(failed ?? job);
      }

      // Extrair URL da imagem gerada
      const rawUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : typeof prediction.output === "string" ? prediction.output : null;

      console.log("[produto-video-refresh] nano-banana succeeded. rawUrl:", rawUrl?.slice(0, 80));

      if (!rawUrl) {
        console.error("[produto-video-refresh] nano-banana sem URL no output:", prediction.output);
        const failed = await markFailed(supabase, job.id, FRIENDLY_ERROR);
        return respond(failed ?? job);
      }

      // Download e upload da imagem intermediaria para R2
      const { bytes, contentType } = await fetchBytes(rawUrl);
      const imgKey = `produto-videos/${job.user_id}/${job.id}/intermediate.jpg`;
      await uploadToR2(
        aws, r2Endpoint, r2Bucket, imgKey, bytes,
        contentType.startsWith("image") ? contentType : "image/jpeg"
      );
      const intermediateImageUrl = `${r2PublicBase}/${imgKey}`;
      console.log("[produto-video-refresh] imagem intermediaria salva:", intermediateImageUrl);

      // Validar fala salva no job
      const productName = (job.product_name as string) || "";
      const speechPtBr  = validateAndFixSpeech(
        (job.speech_pt_br as string) || "",
        productName,
        "produto-video-refresh/creating_image"
      );

      // video_prompt_en armazena o prompt pt_br (reutilizacao de coluna existente)
      const videoPromptPtBr = (job.video_prompt_en as string) ||
        buildFallbackVideoPromptPt(speechPtBr);

      // Atualizar speech se foi corrigido
      if (speechPtBr !== (job.speech_pt_br as string)) {
        await supabase
          .from("produto_video_jobs")
          .update({ speech_pt_br: speechPtBr })
          .eq("id", job.id);
        console.log("[produto-video-refresh] speech_pt_br atualizado no job");
      }

      // ── Chamar p-video-avatar ─────────────────────────────────────────────
      const pVideoInput: Record<string, unknown> = {
        image:                     intermediateImageUrl,
        voice:                     "Kore (Female)",
        resolution:                "720p",
        video_prompt:              videoPromptPtBr,
        voice_prompt:              "Say the following.",
        voice_script:              speechPtBr,
        voice_language:            "Portuguese (Brazil)",
        disable_safety_filter:     true,
        disable_prompt_upsampling: false,
        draft:                     true,
      };

      console.log(
        `[produto-video-refresh] chamando p-video-avatar model=${VIDEO_MODEL} ` +
        `speech="${speechPtBr}"`
      );

      const pVideoResp = await fetch(
        `https://api.replicate.com/v1/models/${VIDEO_MODEL}/predictions`,
        {
          method: "POST",
          headers: {
            Authorization:  `Bearer ${replicateToken}`,
            "Content-Type": "application/json",
            Prefer:         "respond-async",
          },
          body: JSON.stringify({ input: pVideoInput }),
        }
      );

      if (!pVideoResp.ok) {
        const errBody = await pVideoResp.text().catch(() => "");
        console.error(
          "[produto-video-refresh] p-video-avatar HTTP falhou:",
          pVideoResp.status, errBody.slice(0, 300)
        );
        const failed = await markFailed(supabase, job.id, FRIENDLY_ERROR);
        return respond(failed ?? job);
      }

      const pVideoPred = await pVideoResp.json();
      console.log("[produto-video-refresh] p-video-avatar prediction iniciada:", pVideoPred.id);

      const { data: upd } = await supabase
        .from("produto_video_jobs")
        .update({
          status:                  "creating_video",
          replicate_prediction_id: pVideoPred.id,
          intermediate_image_url:  intermediateImageUrl,
        })
        .eq("id", job.id)
        .select()
        .single();

      updatedJob = upd ?? updatedJob;
    }

    // ════════════════════════════════════════════════════════════════════════
    // ESTAGIO: creating_video
    // p-video-avatar terminou. Salvar video final.
    // ════════════════════════════════════════════════════════════════════════
    else if (job.status === "creating_video") {

      if (prediction.status === "failed" || prediction.status === "canceled") {
        console.error(
          `[produto-video-refresh] p-video-avatar falhou. ` +
          `id=${prediction.id} error=${prediction.error}`
        );
        const failed = await markFailed(supabase, job.id, FRIENDLY_ERROR);
        return respond(failed ?? job);
      }

      const rawUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : typeof prediction.output === "string" ? prediction.output : null;

      console.log("[produto-video-refresh] p-video-avatar succeeded. rawUrl:", rawUrl?.slice(0, 80));

      if (!rawUrl) {
        console.error("[produto-video-refresh] p-video-avatar sem URL no output:", prediction.output);
        const failed = await markFailed(supabase, job.id, FRIENDLY_ERROR);
        return respond(failed ?? job);
      }

      // Download e upload do video final para R2
      const { bytes } = await fetchBytes(rawUrl);
      const videoKey  = `produto-videos/${job.user_id}/${job.id}/video.mp4`;
      await uploadToR2(aws, r2Endpoint, r2Bucket, videoKey, bytes, "video/mp4");
      const resultVideoUrl = `${r2PublicBase}/${videoKey}`;
      console.log("[produto-video-refresh] video final salvo:", resultVideoUrl);

      const { data: upd } = await supabase
        .from("produto_video_jobs")
        .update({
          status:           "succeeded",
          result_video_url: resultVideoUrl,
          completed_at:     new Date().toISOString(),
          error_message:    null,
        })
        .eq("id", job.id)
        .select()
        .single();

      updatedJob = upd ?? updatedJob;
    }

    return respond(updatedJob);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno.";
    console.error("[produto-video-refresh] catch:", msg);
    return respond({ error: FRIENDLY_ERROR }, 500);
  }
});
