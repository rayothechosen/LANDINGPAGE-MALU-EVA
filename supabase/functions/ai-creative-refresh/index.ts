import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.19";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
        JSON.stringify({ error: "Token ausente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: "Token invalido." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Parse body ──────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { job_id } = body as { job_id?: string };

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: "job_id e obrigatorio." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Buscar job ──────────────────────────────────────────────────────────
    const { data: job, error: jobErr } = await supabase
      .from("ai_creative_jobs")
      .select("*")
      .eq("id", job_id)
      .eq("user_id", user.id)
      .single();

    if (jobErr || !job) {
      return new Response(
        JSON.stringify({ error: "Job nao encontrado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Se ja em estado terminal, retorna como esta
    if (job.status === "succeeded" || job.status === "failed") {
      return new Response(JSON.stringify(job), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!job.replicate_prediction_id) {
      return new Response(JSON.stringify(job), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 4. Consultar Replicate ─────────────────────────────────────────────────
    const replicateToken = Deno.env.get("REPLICATE_API_TOKEN")!;

    const predResp = await fetch(
      `https://api.replicate.com/v1/predictions/${job.replicate_prediction_id}`,
      { headers: { Authorization: `Bearer ${replicateToken}` } }
    );

    if (!predResp.ok) {
      throw new Error(`Falha ao consultar Replicate: ${predResp.status}`);
    }

    const prediction = await predResp.json();

    // ── 5. Atualizar job conforme status ──────────────────────────────────────
    let update: Record<string, unknown> = {};
    let updatedJob = { ...job };

    if (prediction.status === "succeeded") {
      const output = prediction.output;
      const replicateImageUrl =
        typeof output === "string"
          ? output
          : Array.isArray(output)
          ? output[0]
          : null;

      if (!replicateImageUrl) {
        update = {
          status: "failed",
          error_message: "Replicate nao retornou uma imagem.",
          completed_at: new Date().toISOString(),
        };
      } else {
        // Baixar imagem da Replicate e salvar permanentemente no R2
        console.log("[ai-creative-refresh] baixando imagem:", replicateImageUrl);

        const imgResp = await fetch(replicateImageUrl);
        if (!imgResp.ok) {
          throw new Error(`Falha ao baixar imagem da Replicate: ${imgResp.status}`);
        }
        const imgBytes = await imgResp.arrayBuffer();

        const r2Endpoint = Deno.env.get("R2_ENDPOINT")!;
        const r2Bucket = Deno.env.get("R2_BUCKET")!;
        const r2AccessKey = Deno.env.get("R2_ACCESS_KEY_ID")!;
        const r2SecretKey = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
        const r2PublicBase = Deno.env.get("R2_PUBLIC_BASE_URL")!;

        const aws = new AwsClient({
          accessKeyId: r2AccessKey,
          secretAccessKey: r2SecretKey,
          service: "s3",
          region: "auto",
        });

        const r2ResultKey = `ai-creatives/${job.user_id}/${job.id}/result.jpg`;
        const r2UploadUrl = `${r2Endpoint}/${r2Bucket}/${r2ResultKey}`;

        const uploadResp = await aws.fetch(r2UploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: imgBytes,
        });

        if (!uploadResp.ok) {
          const errBody = await uploadResp.text().catch(() => "");
          throw new Error(`R2 upload do resultado falhou (${uploadResp.status}): ${errBody}`);
        }

        const resultImageUrl = `${r2PublicBase}/${r2ResultKey}`;
        console.log("[ai-creative-refresh] resultado salvo em R2:", resultImageUrl);

        update = {
          status: "succeeded",
          result_image_url: resultImageUrl,
          completed_at: new Date().toISOString(),
        };
      }
    } else if (
      prediction.status === "failed" ||
      prediction.status === "canceled"
    ) {
      update = {
        status: "failed",
        error_message: prediction.error ?? "Geracao falhou na Replicate.",
        completed_at: new Date().toISOString(),
      };
    }
    // Se "starting" ou "processing", nao atualiza — polling continuara

    if (Object.keys(update).length > 0) {
      const { data: upd, error: updateErr } = await supabase
        .from("ai_creative_jobs")
        .update(update)
        .eq("id", job.id)
        .select()
        .single();
      if (updateErr) console.error("[ai-creative-refresh] erro ao atualizar:", updateErr.message);
      if (upd) updatedJob = upd;
    }

    return new Response(JSON.stringify(updatedJob), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno.";
    console.error("[ai-creative-refresh]", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
