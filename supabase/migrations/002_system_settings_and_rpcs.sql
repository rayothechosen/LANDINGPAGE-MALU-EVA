-- ============================================================
-- Migration 002 — system_settings, is_app_admin, RLS,
--                 RPCs de admin, admin_audit_log
-- Aplicar manualmente no Supabase SQL Editor.
-- Todos os comandos usam IF NOT EXISTS / OR REPLACE para
-- serem idempotentes.
-- ============================================================


-- ── 1. Tabela system_settings ─────────────────────────────────
CREATE TABLE IF NOT EXISTS system_settings (
  key         text        PRIMARY KEY,
  value       jsonb       NOT NULL,
  description text,
  updated_at  timestamptz DEFAULT now(),
  updated_by  uuid        REFERENCES auth.users(id)
);


-- ── 2. Valores padrão (não sobrescreve se já existir) ─────────
INSERT INTO system_settings (key, value, description) VALUES

-- Limites
('limits.ai_routines_daily',          '3',    'Limite diario de rotinas com IA por usuario'),
('limits.group_plans_weekly',         '3',    'Limite semanal de planejamentos de grupos por usuario'),
('limits.product_videos_weekly',      '1',    'Limite semanal de Produto em Video por usuario'),
('limits.product_videos_trial_total', '1',    'Limite total de Produto em Video no trial'),

-- Expiracao
('expiration.ai_routines_days',       '3',    'Dias de disponibilidade das rotinas de IA'),
('expiration.product_videos_days',    '2',    'Dias de disponibilidade dos videos de produto gerados'),

-- Modulos — enabled
('modules.ai_videos.enabled',         'true', 'Ativar ou desativar IA de Videos'),
('modules.product_video.enabled',     'true', 'Ativar ou desativar Produto em Video'),
('modules.hot_products.enabled',      'true', 'Ativar ou desativar Produtos em Alta'),
('modules.groups.enabled',            'true', 'Ativar ou desativar Grupos Lucrativos'),
('modules.pack_videos.enabled',       'true', 'Ativar ou desativar Pack de Videos'),
('modules.carousels.enabled',         'true', 'Ativar ou desativar Carrosseis Prontos'),
('modules.video_maker.enabled',        'true', 'Ativar ou desativar Gerador Videos Proprios'),
('modules.stories.enabled',           'true', 'Ativar ou desativar Stories Prontos'),

-- Modulos — mensagens de bloqueio
('modules.ai_videos.disabled_message',
  '"IA de Videos esta temporariamente indisponivel."',
  'Mensagem ao bloquear IA de Videos'),
('modules.product_video.disabled_message',
  '"Produto em Video esta temporariamente indisponivel."',
  'Mensagem ao bloquear Produto em Video'),
('modules.hot_products.disabled_message',
  '"Produtos em Alta esta temporariamente indisponivel."',
  'Mensagem ao bloquear Produtos em Alta'),
('modules.groups.disabled_message',
  '"Grupos Lucrativos esta temporariamente indisponivel."',
  'Mensagem ao bloquear Grupos Lucrativos'),
('modules.pack_videos.disabled_message',
  '"Pack de Videos esta temporariamente indisponivel."',
  'Mensagem ao bloquear Pack de Videos'),
('modules.carousels.disabled_message',
  '"Carrosseis Prontos esta temporariamente indisponivel."',
  'Mensagem ao bloquear Carrosseis Prontos'),
('modules.video_maker.disabled_message',
  '"Gerador Videos Proprios esta temporariamente indisponivel."',
  'Mensagem ao bloquear Gerador Videos Proprios'),
('modules.stories.disabled_message',
  '"Stories Prontos esta temporariamente indisponivel."',
  'Mensagem ao bloquear Stories Prontos'),

-- Aviso global
('system.global_notice.enabled', 'false', 'Ativar aviso global no topo do app'),
('system.global_notice.message', '""',    'Mensagem do aviso global'),
('system.global_notice.type',    '"info"','Tipo do aviso: info | warning | danger | success')

ON CONFLICT (key) DO NOTHING;


-- ── 3. Funcao is_app_admin ────────────────────────────────────
CREATE OR REPLACE FUNCTION is_app_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_admins WHERE user_id = auth.uid()
  );
$$;


-- ── 4. RLS system_settings ────────────────────────────────────
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated can read system settings" ON system_settings;
CREATE POLICY "authenticated can read system settings"
ON system_settings FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "admins can manage system settings" ON system_settings;
CREATE POLICY "admins can manage system settings"
ON system_settings FOR ALL
TO authenticated
USING    (is_app_admin())
WITH CHECK (is_app_admin());


-- ── 5. RLS app_admins — admins veem todos, usuario ve propria linha ────────
-- Remove politicas anteriores
DROP POLICY IF EXISTS "admins_select_own"       ON app_admins;
DROP POLICY IF EXISTS "admins can read app_admins" ON app_admins;

CREATE POLICY "admins can read app_admins"
ON app_admins FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_app_admin());


-- ── 6. RPC get_admin_dashboard_metrics ───────────────────────
CREATE OR REPLACE FUNCTION get_admin_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM app_admins WHERE user_id = auth.uid()) THEN
    RETURN jsonb_build_object('error', 'forbidden');
  END IF;

  SELECT jsonb_build_object(
    'total_users',
      (SELECT COUNT(*) FROM auth.users),
    'active_users_7d',
      (
        SELECT COUNT(DISTINCT sub.user_id)
        FROM (
          SELECT user_id FROM ia_planos_gerados  WHERE created_at > now() - interval '7 days'
          UNION ALL
          SELECT user_id FROM grupos_planos       WHERE created_at > now() - interval '7 days'
          UNION ALL
          SELECT user_id FROM produto_video_jobs  WHERE created_at > now() - interval '7 days'
        ) sub
      ),
    'total_ai_routines',
      (SELECT COUNT(*) FROM ia_planos_gerados),
    'total_group_plans',
      (SELECT COUNT(*) FROM grupos_planos),
    'total_product_videos',
      (SELECT COUNT(*) FROM produto_video_jobs WHERE status = 'succeeded')
  ) INTO result;

  RETURN result;
END;
$$;


-- ── 7. RPC get_admin_user_usage (atualizada) ──────────────────
-- Mantemos o mesmo nome para compatibilidade com Admin.tsx existente.
-- Agora retorna last_activity_at e is_active_7d tambem.
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
  IF NOT EXISTS (SELECT 1 FROM app_admins WHERE user_id = auth.uid()) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    u.id::uuid,
    u.email::text,
    u.created_at,
    COALESCE((SELECT COUNT(*) FROM ia_planos_gerados  p WHERE p.user_id = u.id), 0)::bigint,
    COALESCE((SELECT COUNT(*) FROM grupos_planos       g WHERE g.user_id = u.id), 0)::bigint,
    COALESCE((SELECT COUNT(*) FROM produto_video_jobs  v WHERE v.user_id = u.id), 0)::bigint,
    GREATEST(
      (SELECT MAX(created_at) FROM ia_planos_gerados  p WHERE p.user_id = u.id),
      (SELECT MAX(created_at) FROM grupos_planos       g WHERE g.user_id = u.id),
      (SELECT MAX(created_at) FROM produto_video_jobs  v WHERE v.user_id = u.id)
    ),
    COALESCE(
      GREATEST(
        (SELECT MAX(created_at) FROM ia_planos_gerados  p WHERE p.user_id = u.id),
        (SELECT MAX(created_at) FROM grupos_planos       g WHERE g.user_id = u.id),
        (SELECT MAX(created_at) FROM produto_video_jobs  v WHERE v.user_id = u.id)
      ) > (now() - interval '7 days'),
      false
    )
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;


-- ── 8. Tabela admin_audit_log ─────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid        REFERENCES auth.users(id),
  action        text        NOT NULL,
  target        text,
  old_value     jsonb,
  new_value     jsonb,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins can read audit log" ON admin_audit_log;
CREATE POLICY "admins can read audit log"
ON admin_audit_log FOR SELECT
TO authenticated
USING (is_app_admin());

DROP POLICY IF EXISTS "admins can insert audit log" ON admin_audit_log;
CREATE POLICY "admins can insert audit log"
ON admin_audit_log FOR INSERT
TO authenticated
WITH CHECK (is_app_admin());


-- ── Instrucoes pos-deploy ─────────────────────────────────────
-- Para adicionar um admin:
--   INSERT INTO app_admins (user_id) VALUES ('<seu-user-id>');
--
-- Para encontrar seu user_id:
--   SELECT id, email FROM auth.users WHERE email = 'seu@email.com';
