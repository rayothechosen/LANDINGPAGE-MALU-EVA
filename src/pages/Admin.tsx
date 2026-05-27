import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Shield,
  Users,
  TrendingUp,
  Video,
  Activity,
  Loader2,
  AlertCircle,
  Search,
  Bell,
  BarChart3,
  Sliders,
  LayoutGrid,
  Save,
  Calendar,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  useSystemSettings,
  SystemSettings,
  invalidateSettingsCache,
} from "@/hooks/useSystemSettings";
import { Switch } from "@/components/ui/switch";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface DashboardMetrics {
  total_users:          number;
  active_users_7d:      number;
  total_ai_routines:    number;
  total_group_plans:    number;
  total_product_videos: number;
}

interface UserUsage {
  user_id:             string;
  email:               string;
  joined_at:           string;
  rotinas_count:       number;
  planejamentos_count: number;
  videos_count:        number;
  last_activity:       string | null;
  is_active:           boolean;
}

type AdminTab = "overview" | "users" | "limits" | "modules" | "notice";

type SaveEntry = { key: string; value: unknown };

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7)  return `${days} dias atras`;
  if (days < 30) return `${Math.floor(days / 7)} semanas atras`;
  return `${Math.floor(days / 30)} meses atras`;
}

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({
  label, value, icon: Icon, sub,
}: {
  label: string;
  value: string | number;
  icon:  React.ElementType;
  sub?:  string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground font-medium leading-tight">{label}</p>
      </div>
      <p className="text-2xl font-extrabold text-foreground">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── OverviewTab ───────────────────────────────────────────────────────────────

function OverviewTab({
  metrics,
  loadingMetrics,
  users,
}: {
  metrics:        DashboardMetrics | null;
  loadingMetrics: boolean;
  users:          UserUsage[];
}) {
  const totalAtivos  = users.filter((u) => u.is_active).length;
  const totalRotinas = users.reduce((s, u) => s + (u.rotinas_count ?? 0), 0);
  const totalVideos  = users.reduce((s, u) => s + (u.videos_count ?? 0), 0);
  const totalGrupos  = users.reduce((s, u) => s + (u.planejamentos_count ?? 0), 0);

  if (loadingMetrics) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const m = metrics;

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">
        Resumo geral
      </p>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Total de usuarios"
          value={m?.total_users ?? users.length}
          icon={Users}
          sub={`${totalAtivos} ativos nos ultimos 7 dias`}
        />
        <MetricCard
          label="Ativos 7 dias"
          value={m?.active_users_7d ?? totalAtivos}
          icon={Activity}
        />
        <MetricCard
          label="Rotinas de IA"
          value={m?.total_ai_routines ?? totalRotinas}
          icon={TrendingUp}
          sub="total geradas"
        />
        <MetricCard
          label="Grupos gerados"
          value={m?.total_group_plans ?? totalGrupos}
          icon={Calendar}
          sub="planejamentos totais"
        />
        <MetricCard
          label="Videos de produto"
          value={m?.total_product_videos ?? totalVideos}
          icon={Video}
          sub="videos gerados com sucesso"
        />
        <MetricCard
          label="Total cadastros"
          value={m?.total_users ?? users.length}
          icon={BarChart3}
        />
      </div>
    </div>
  );
}

// ── UsersTab ──────────────────────────────────────────────────────────────────

function UsersTab({
  users,
  loading,
  onRefresh,
}: {
  users:     UserUsage[];
  loading:   boolean;
  onRefresh: () => void;
}) {
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState<"todos" | "ativos" | "inativos">("todos");
  const [expanded,   setExpanded]   = useState<string | null>(null);

  const filtered = users
    .filter((u) => {
      if (filter === "ativos")   return u.is_active;
      if (filter === "inativos") return !u.is_active;
      return true;
    })
    .filter((u) =>
      !search.trim() || u.email?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filtros */}
      <div className="bg-card rounded-2xl border border-border p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {(["todos", "ativos", "inativos"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
                  filter === f
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={onRefresh}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por e-mail..."
            className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <p className="text-[10px] font-bold tracking-[0.14em] text-foreground/40 uppercase">
        {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Users className="w-10 h-10 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">Nenhum usuario encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u, i) => (
            <motion.div
              key={u.user_id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              {/* Header da linha */}
              <button
                onClick={() =>
                  setExpanded((prev) => (prev === u.user_id ? null : u.user_id))
                }
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {u.email || "Email nao disponivel"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Entrou em {formatDate(u.joined_at)}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    u.is_active
                      ? "bg-green-500/15 text-green-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {u.is_active ? "Ativo" : "Inativo"}
                </span>

                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground/40 shrink-0 transition-transform ${
                    expanded === u.user_id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Detalhes expandidos */}
              <AnimatePresence>
                {expanded === u.user_id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
                      {/* Metricas */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-muted/40 rounded-xl p-2.5 text-center">
                          <p className="text-base font-extrabold text-foreground">
                            {u.rotinas_count}
                          </p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            Rotinas IA
                          </p>
                        </div>
                        <div className="bg-muted/40 rounded-xl p-2.5 text-center">
                          <p className="text-base font-extrabold text-foreground">
                            {u.planejamentos_count}
                          </p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            Planos Grupo
                          </p>
                        </div>
                        <div className="bg-muted/40 rounded-xl p-2.5 text-center">
                          <p className="text-base font-extrabold text-foreground">
                            {u.videos_count}
                          </p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            Videos Prod.
                          </p>
                        </div>
                      </div>

                      {/* Ultima atividade */}
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground">
                          Ultima atividade:
                        </p>
                        <p className="text-[11px] font-semibold text-foreground">
                          {timeAgo(u.last_activity)}
                        </p>
                      </div>

                      {/* ID */}
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground">ID:</p>
                        <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[60%]">
                          {u.user_id}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LimitsTab ─────────────────────────────────────────────────────────────────

function LimitsTab({
  settings,
  onSaveMany,
  saving,
}: {
  settings:    SystemSettings;
  onSaveMany:  (entries: SaveEntry[]) => Promise<boolean>;
  saving:      boolean;
}) {
  const [form, setForm] = useState({
    ai_routines_daily:           settings.limits.ai_routines_daily,
    group_plans_weekly:          settings.limits.group_plans_weekly,
    product_videos_weekly:       settings.limits.product_videos_weekly,
    product_videos_trial_total:  settings.limits.product_videos_trial_total,
    ai_routines_days:            settings.expiration.ai_routines_days,
    product_videos_days:         settings.expiration.product_videos_days,
  });

  // Sync quando settings mudar (apos save)
  useEffect(() => {
    setForm({
      ai_routines_daily:           settings.limits.ai_routines_daily,
      group_plans_weekly:          settings.limits.group_plans_weekly,
      product_videos_weekly:       settings.limits.product_videos_weekly,
      product_videos_trial_total:  settings.limits.product_videos_trial_total,
      ai_routines_days:            settings.expiration.ai_routines_days,
      product_videos_days:         settings.expiration.product_videos_days,
    });
  }, [settings]);

  const set = (k: keyof typeof form, v: string) => {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 0) setForm((f) => ({ ...f, [k]: n }));
    if (v === "") setForm((f) => ({ ...f, [k]: 0 }));
  };

  const handleSave = async () => {
    const entries: SaveEntry[] = [
      { key: "limits.ai_routines_daily",           value: form.ai_routines_daily },
      { key: "limits.group_plans_weekly",           value: form.group_plans_weekly },
      { key: "limits.product_videos_weekly",        value: form.product_videos_weekly },
      { key: "limits.product_videos_trial_total",   value: form.product_videos_trial_total },
      { key: "expiration.ai_routines_days",         value: form.ai_routines_days },
      { key: "expiration.product_videos_days",      value: form.product_videos_days },
    ];
    await onSaveMany(entries);
  };

  const fields: Array<{
    key:   keyof typeof form;
    label: string;
    hint:  string;
    min:   number;
    max:   number;
  }> = [
    { key: "ai_routines_daily",          label: "Rotinas de IA por dia",              hint: "Limite de rotinas que cada usuario pode gerar por dia", min: 0, max: 50 },
    { key: "group_plans_weekly",         label: "Planejamentos de grupos por semana", hint: "Limite de planejamentos de grupo por usuario por semana", min: 0, max: 30 },
    { key: "product_videos_weekly",      label: "Videos de produto por semana",       hint: "Limite semanal de geracao de videos (backend tambem valida)", min: 0, max: 10 },
    { key: "product_videos_trial_total", label: "Videos de produto no trial",         hint: "Total de videos que usuarios em trial podem gerar", min: 0, max: 10 },
    { key: "ai_routines_days",           label: "Expiracao de rotinas (dias)",        hint: "Quantos dias as rotinas ficam disponiveis apos a geracao", min: 1, max: 30 },
    { key: "product_videos_days",        label: "Expiracao de videos (dias)",         hint: "Quantos dias os videos gerados ficam disponiveis para download", min: 1, max: 30 },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">
        Limites e expiracao
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Alteracoes aqui afetam o frontend imediatamente. Os limites criticos
        tambem sao validados no backend (Edge Functions).
      </p>

      <div className="space-y-3">
        {fields.map(({ key, label, hint, min, max }) => (
          <div key={key} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {hint}
                </p>
              </div>
              <input
                type="number"
                value={form[key]}
                min={min}
                max={max}
                onChange={(e) => set(key, e.target.value)}
                className="w-20 bg-background border border-border rounded-xl px-3 py-2 text-sm font-bold text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Salvar limites
      </button>
    </div>
  );
}

// ── ModulesTab ────────────────────────────────────────────────────────────────

const MODULE_META: Array<{
  key:   keyof SystemSettings["modules"];
  label: string;
  Icon:  React.ElementType;
}> = [
  { key: "ai_videos",             label: "IA de Videos",             Icon: TrendingUp },
  { key: "product_video",         label: "Produto em Video",         Icon: Video      },
  { key: "hot_products",          label: "Produtos em Alta",         Icon: BarChart3  },
  { key: "video_maker",           label: "Gerador Videos Proprios",  Icon: Video      },
  { key: "groups",                label: "Grupos Lucrativos",        Icon: Users      },
  { key: "pack_videos",           label: "Pack de Videos",           Icon: LayoutGrid },
  { key: "carousels",             label: "Carrosseis Prontos",       Icon: Activity   },
  { key: "stories",               label: "Stories Prontos",          Icon: Activity   },
];

function ModuleRow({
  meta,
  config,
  onToggle,
  onSaveMessage,
  savingToggle,
  savingMsg,
}: {
  meta:          (typeof MODULE_META)[0];
  config:        SystemSettings["modules"][keyof SystemSettings["modules"]];
  onToggle:      (key: keyof SystemSettings["modules"], val: boolean) => void;
  onSaveMessage: (key: keyof SystemSettings["modules"], msg: string) => void;
  savingToggle:  boolean;
  savingMsg:     boolean;
}) {
  const [msg, setMsg] = useState(config.disabled_message);

  // Sync from outside (after save)
  useEffect(() => setMsg(config.disabled_message), [config.disabled_message]);

  const { Icon } = meta;
  const changed = msg !== config.disabled_message;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
          <p className={`text-[11px] font-semibold mt-0.5 ${config.enabled ? "text-green-600" : "text-destructive"}`}>
            {config.enabled ? "Ativo" : "Inativo"}
          </p>
        </div>
        {savingToggle ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
        ) : (
          <Switch
            checked={config.enabled}
            onCheckedChange={(val) => onToggle(meta.key, val)}
          />
        )}
      </div>

      {/* Mensagem de bloqueio */}
      <div>
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
          Mensagem quando inativo
        </label>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        {changed && (
          <button
            onClick={() => onSaveMessage(meta.key, msg)}
            disabled={savingMsg}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-75 transition-opacity disabled:opacity-50"
          >
            {savingMsg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Salvar mensagem
          </button>
        )}
      </div>
    </div>
  );
}

function ModulesTab({
  settings,
  onSaveMany,
  savingKeys,
}: {
  settings:    SystemSettings;
  onSaveMany:  (entries: SaveEntry[]) => Promise<boolean>;
  savingKeys:  Set<string>;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">
        Controle de modulos
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Desativar um modulo bloqueia o acesso dos usuarios ao conteudo. A
        mensagem configurada e exibida na pagina do modulo.
      </p>

      <div className="space-y-3">
        {MODULE_META.map((meta) => (
          <ModuleRow
            key={meta.key}
            meta={meta}
            config={settings.modules[meta.key]}
            savingToggle={savingKeys.has(`modules.${meta.key}.enabled`)}
            savingMsg={savingKeys.has(`modules.${meta.key}.disabled_message`)}
            onToggle={(key, val) =>
              onSaveMany([{ key: `modules.${key}.enabled`, value: val }])
            }
            onSaveMessage={(key, msg) =>
              onSaveMany([{ key: `modules.${key}.disabled_message`, value: msg }])
            }
          />
        ))}
      </div>
    </div>
  );
}

// ── NoticeTab ─────────────────────────────────────────────────────────────────

function NoticeTab({
  settings,
  onSaveMany,
  saving,
}: {
  settings:   SystemSettings;
  onSaveMany: (entries: SaveEntry[]) => Promise<boolean>;
  saving:     boolean;
}) {
  const n = settings.system.global_notice;
  const [enabled, setEnabled] = useState(n.enabled);
  const [type,    setType]    = useState(n.type);
  const [message, setMessage] = useState(n.message);

  useEffect(() => {
    setEnabled(n.enabled);
    setType(n.type);
    setMessage(n.message);
  }, [n.enabled, n.type, n.message]);

  const handleSave = async () => {
    await onSaveMany([
      { key: "system.global_notice.enabled", value: enabled },
      { key: "system.global_notice.type",    value: type    },
      { key: "system.global_notice.message", value: message },
    ]);
  };

  const TYPE_OPTIONS: Array<{ value: string; label: string; color: string }> = [
    { value: "info",    label: "Informativo", color: "text-blue-600"  },
    { value: "warning", label: "Aviso",       color: "text-amber-600" },
    { value: "danger",  label: "Urgente",     color: "text-red-600"   },
    { value: "success", label: "Sucesso",     color: "text-green-600" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/40 uppercase">
        Aviso global
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Quando ativado, um banner aparece no topo do app para todos os usuarios
        logados. Use para comunicar manutencoes, novidades ou avisos urgentes.
      </p>

      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Ativar aviso</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {enabled ? "Banner visivel para todos os usuarios" : "Banner desativado"}
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {/* Tipo */}
        <div>
          <label className="text-xs font-semibold text-foreground/70 block mb-2">
            Tipo de aviso
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value as typeof type)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-left ${
                  type === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                <span className={opt.color}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mensagem */}
        <div>
          <label className="text-xs font-semibold text-foreground/70 block mb-1.5">
            Mensagem
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Digite a mensagem que aparecera no banner..."
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">
            {message.length}/300
          </p>
        </div>

        {/* Preview */}
        {message.trim() && (
          <div
            className={`rounded-xl px-3 py-2 border text-xs font-medium leading-snug ${
              type === "info"    ? "bg-blue-50  border-blue-200  text-blue-800"  :
              type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
              type === "danger"  ? "bg-red-50   border-red-100   text-red-800"   :
                                   "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5 opacity-60">
              Preview
            </p>
            {message}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Salvar aviso global
      </button>
    </div>
  );
}

// ── Tabs nav ──────────────────────────────────────────────────────────────────

const TABS: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
  { id: "overview", label: "Visao Geral",  icon: BarChart3   },
  { id: "users",    label: "Usuarios",     icon: Users       },
  { id: "limits",   label: "Limites",      icon: Sliders     },
  { id: "modules",  label: "Modulos",      icon: LayoutGrid  },
  { id: "notice",   label: "Aviso",        icon: Bell        },
];

// ── Token de acesso ───────────────────────────────────────────────────────────

const ADMIN_TOKEN    = "APkit-9Xm3Qr7vTf2sLbW8nKpDe4cZhJ6";
const LS_KEY         = "adm_tk";

// ── Tela de token ─────────────────────────────────────────────────────────────

function TokenGate({ onAccess }: { onAccess: () => void }) {
  const navigate                = useNavigate();
  const [input,   setInput]     = useState("");
  const [error,   setError]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (input.trim() === ADMIN_TOKEN) {
        localStorage.setItem(LS_KEY, ADMIN_TOKEN);
        onAccess();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">Acesso restrito</h1>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            Insira o token de administrador para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Token de acesso"
            className={`w-full h-12 rounded-xl border bg-card px-4 text-sm font-mono outline-none transition-colors ${
              error
                ? "border-destructive focus:border-destructive"
                : "border-border focus:border-primary"
            }`}
            autoComplete="off"
            autoFocus
          />
          {error && (
            <p className="text-xs text-destructive font-semibold px-1">
              Token invalido. Tente novamente.
            </p>
          )}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 transition-opacity active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-6 mx-auto w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao inicio
        </button>
      </motion.div>
    </div>
  );
}

// ── Admin principal ───────────────────────────────────────────────────────────

const Admin = () => {
  const navigate = useNavigate();

  const [isAdmin,     setIsAdmin]     = useState(
    () => localStorage.getItem(LS_KEY) === ADMIN_TOKEN
  );
  const [activeTab,   setActiveTab]   = useState<AdminTab>("overview");
  const [users,       setUsers]       = useState<UserUsage[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [metrics,     setMetrics]     = useState<DashboardMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [savingKeys,  setSavingKeys]  = useState<Set<string>>(new Set());
  const [savingAll,   setSavingAll]   = useState(false);
  const [adminUid,    setAdminUid]    = useState("");

  const { settings, refetch: refetchSettings } = useSystemSettings();

  // Captura uid do usuario logado (para audit log)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user.id) setAdminUid(session.user.id);
    });
  }, []);

  // ── Carregar dados quando admin confirmado ────────────────────────────────
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase.rpc("get_admin_user_usage");
    if (error) {
      toast.error("Erro ao carregar usuarios: " + error.message);
    } else {
      setUsers((data as UserUsage[]) ?? []);
    }
    setLoadingUsers(false);
  }, []);

  const loadMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    const { data, error } = await supabase.rpc("get_admin_dashboard_metrics");
    if (error) {
      console.warn("[Admin] metrics error:", error.message);
    } else {
      setMetrics(data as DashboardMetrics);
    }
    setLoadingMetrics(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
    loadMetrics();
  }, [isAdmin, loadUsers, loadMetrics]);

  // ── Funcao de save ────────────────────────────────────────────────────────
  const handleSaveMany = useCallback(async (
    entries: SaveEntry[]
  ): Promise<boolean> => {
    const keys = entries.map((e) => e.key);

    // Marcar como salvando
    setSavingKeys((prev) => new Set([...prev, ...keys]));
    setSavingAll(true);

    const upsertData = entries.map(({ key, value }) => ({
      key,
      value,                                       // jsonb aceita JS direto
      updated_at: new Date().toISOString(),
      updated_by: adminUid || null,
    }));

    const { error } = await supabase
      .from("system_settings")
      .upsert(upsertData, { onConflict: "key" });

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      setSavingKeys((prev) => {
        const n = new Set(prev);
        keys.forEach((k) => n.delete(k));
        return n;
      });
      setSavingAll(false);
      return false;
    }

    // Audit log (silencioso)
    const auditRows = entries.map(({ key, value }) => ({
      admin_user_id: adminUid || null,
      action:        "update_setting",
      target:        key,
      new_value:     { value },
    }));
    await supabase.from("admin_audit_log").insert(auditRows).catch(() => {});

    // Invalida cache global e refetch
    invalidateSettingsCache();
    await refetchSettings();

    toast.success("Salvo com sucesso.");

    setSavingKeys((prev) => {
      const n = new Set(prev);
      keys.forEach((k) => n.delete(k));
      return n;
    });
    setSavingAll(false);
    return true;
  }, [adminUid, refetchSettings]);

  // ── Gate de token ─────────────────────────────────────────────────────────
  if (!isAdmin) {
    return <TokenGate onAccess={() => setIsAdmin(true)} />;
  }

  // ── Painel ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-foreground/40 text-xs font-semibold mb-5 hover:text-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-foreground/35 uppercase">
                Administracao
              </p>
              <h1 className="text-[1.5rem] font-extrabold leading-tight text-foreground">
                Painel <span className="text-primary">Admin.</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteudo */}
      <div className="max-w-2xl mx-auto px-5 pt-5 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "overview" && (
              <OverviewTab
                metrics={metrics}
                loadingMetrics={loadingMetrics || loadingUsers}
                users={users}
              />
            )}

            {activeTab === "users" && (
              <UsersTab
                users={users}
                loading={loadingUsers}
                onRefresh={loadUsers}
              />
            )}

            {activeTab === "limits" && (
              <LimitsTab
                settings={settings}
                onSaveMany={handleSaveMany}
                saving={savingAll}
              />
            )}

            {activeTab === "modules" && (
              <ModulesTab
                settings={settings}
                onSaveMany={handleSaveMany}
                savingKeys={savingKeys}
              />
            )}

            {activeTab === "notice" && (
              <NoticeTab
                settings={settings}
                onSaveMany={handleSaveMany}
                saving={savingAll}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
