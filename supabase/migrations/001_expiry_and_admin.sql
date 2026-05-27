-- ============================================================
-- Migration 001 — Expiry columns, app_admins, RPC admin
-- Aplicar manualmente no Supabase SQL Editor ou via CLI.
-- Todos os comandos usam IF NOT EXISTS / OR REPLACE para
-- serem idempotentes.
-- ============================================================

-- ── 1. ia_planos_gerados: adicionar expires_at ────────────────
ALTER TABLE ia_planos_gerados
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Preencher linhas existentes que ficaram sem expires_at
UPDATE ia_planos_gerados
SET expires_at = created_at + interval '3 days'
WHERE expires_at IS NULL;

-- Trigger: ao inserir novo plano, setar expires_at = now() + 3 dias
CREATE OR REPLACE FUNCTION set_ia_plano_expires_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + interval '3 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_ia_planos_expires_at ON ia_planos_gerados;
CREATE TRIGGER tr_ia_planos_expires_at
  BEFORE INSERT ON ia_planos_gerados
  FOR EACH ROW EXECUTE FUNCTION set_ia_plano_expires_at();


-- ── 2. grupos_planos: adicionar expires_at ────────────────────
ALTER TABLE grupos_planos
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Preencher linhas existentes
-- Usa fim da semana em que o plano foi criado (domingo 23:59:59)
UPDATE grupos_planos
SET expires_at = (
  date_trunc('week', created_at) + interval '6 days 23 hours 59 minutes 59 seconds'
)
WHERE expires_at IS NULL;

-- Trigger: ao inserir novo plano de grupo, setar expires_at = fim da semana atual
CREATE OR REPLACE FUNCTION set_grupo_plano_expires_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  day_of_week  int;
  days_to_sun  int;
BEGIN
  IF NEW.expires_at IS NULL THEN
    -- EXTRACT(DOW ...) retorna 0=Dom, 1=Seg ... 6=Sab
    day_of_week := EXTRACT(DOW FROM now())::int;
    days_to_sun := CASE WHEN day_of_week = 0 THEN 0 ELSE 7 - day_of_week END;
    NEW.expires_at := date_trunc('day', now())
                     + (days_to_sun || ' days')::interval
                     + interval '23 hours 59 minutes 59 seconds';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_grupos_planos_expires_at ON grupos_planos;
CREATE TRIGGER tr_grupos_planos_expires_at
  BEFORE INSERT ON grupos_planos
  FOR EACH ROW EXECUTE FUNCTION set_grupo_plano_expires_at();


-- ── 3. produto_video_jobs: expires_at ja existe (via edge function).
--    Apenas garantir que linhas sem expires_at recebam 2 dias a partir do created_at.
UPDATE produto_video_jobs
SET expires_at = created_at + interval '2 days'
WHERE expires_at IS NULL;


-- ── 4. Tabela de admins ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS (apenas admins via service_role podem inserir manualmente)
ALTER TABLE app_admins ENABLE ROW LEVEL SECURITY;

-- Politica: qualquer usuario autenticado pode ler a propria linha
-- (necessario para o check de admin no frontend)
CREATE POLICY IF NOT EXISTS "admins_select_own"
ON app_admins FOR SELECT
TO authenticated
USING (user_id = auth.uid());


-- ── 5. RPC get_admin_user_usage ───────────────────────────────
-- Retorna metricas de todos os usuarios, mas apenas se o chamador
-- estiver na tabela app_admins.
-- SECURITY DEFINER permite acessar auth.users.
CREATE OR REPLACE FUNCTION get_admin_user_usage()
RETURNS TABLE (
  user_id             uuid,
  email               text,
  joined_at           timestamptz,
  rotinas_count       bigint,
  planejamentos_count bigint,
  videos_count        bigint,
  last_activity       timestamptz,
  is_active           boolean
)
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar se o chamador e admin
  IF NOT EXISTS (
    SELECT 1 FROM app_admins WHERE user_id = auth.uid()
  ) THEN
    RETURN; -- retorna conjunto vazio se nao for admin
  END IF;

  RETURN QUERY
  SELECT
    u.id::uuid                                                              AS user_id,
    u.email::text                                                           AS email,
    u.created_at                                                            AS joined_at,
    COALESCE(
      (SELECT COUNT(*) FROM ia_planos_gerados p WHERE p.user_id = u.id), 0
    )::bigint                                                               AS rotinas_count,
    COALESCE(
      (SELECT COUNT(*) FROM grupos_planos g WHERE g.user_id = u.id), 0
    )::bigint                                                               AS planejamentos_count,
    COALESCE(
      (SELECT COUNT(*) FROM produto_video_jobs v WHERE v.user_id = u.id), 0
    )::bigint                                                               AS videos_count,
    GREATEST(
      (SELECT MAX(created_at) FROM ia_planos_gerados p WHERE p.user_id = u.id),
      (SELECT MAX(created_at) FROM grupos_planos g WHERE g.user_id = u.id),
      (SELECT MAX(created_at) FROM produto_video_jobs v WHERE v.user_id = u.id)
    )                                                                       AS last_activity,
    COALESCE(
      GREATEST(
        (SELECT MAX(created_at) FROM ia_planos_gerados p WHERE p.user_id = u.id),
        (SELECT MAX(created_at) FROM grupos_planos g WHERE g.user_id = u.id),
        (SELECT MAX(created_at) FROM produto_video_jobs v WHERE v.user_id = u.id)
      ) > (now() - interval '7 days'),
      false
    )                                                                       AS is_active
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- ── Instrucoes pos-deploy ─────────────────────────────────────
-- Para adicionar um admin manualmente:
--   INSERT INTO app_admins (user_id) VALUES ('<seu-user-id>');
--
-- Para encontrar seu user_id:
--   SELECT id, email FROM auth.users WHERE email = 'seu@email.com';
