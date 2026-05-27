import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      .from("ai_video_jobs")
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
      {
        headers: { Authorization: `Bearer ${replicateToken}` },
      }
    );

    if (!predResp.ok) {
      throw new Error(`Falha ao consultar Replicate: ${predResp.status}`);
    }

    const prediction = await predResp.json();

    // ── 5. Atualizar job conforme status da Replicate ─────────────────────────
    let update: Record<string, unknown> = {};

    if (prediction.status === "succeeded") {
      const output = prediction.output;
      const videoUrl = Array.isArray(output) ? output[0] : output ?? null;
      update = {
        status: "succeeded",
        result_video_url: videoUrl,
        completed_at: new Date().toISOString(),
      };
    } else if (
      prediction.status === "failed" ||
      prediction.status === "canceled"
    ) {
      update = {
        status: "failed",
        error_message:
          prediction.error ?? "Geracao falhou na Replicate.",
        completed_at: new Date().toISOString(),
      };
    }
    // Se "starting" ou "processing", nao atualiza — polling continuara

    let updatedJob = { ...job };

    if (Object.keys(update).length > 0) {
      const { data: upd } = await supabase
        .from("ai_video_jobs")
        .update(update)
        .eq("id", job.id)
        .select()
        .single();
      if (upd) updatedJob = upd;
    }

    return new Response(JSON.stringify(updatedJob), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno.";
    console.error("[ai-video-refresh]", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
