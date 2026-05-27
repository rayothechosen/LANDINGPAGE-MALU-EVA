import { useState } from "react";
import { X, Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import type { GlobalNoticeConfig } from "@/hooks/useSystemSettings";

interface GlobalNoticeProps {
  notice: GlobalNoticeConfig;
}

const TYPE_STYLES = {
  info: {
    wrap: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    icon: "text-blue-500",
    Icon: Info,
  },
  warning: {
    wrap: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    icon: "text-amber-500",
    Icon: AlertTriangle,
  },
  danger: {
    wrap: "bg-red-50 border-red-100",
    text: "text-red-800",
    icon: "text-red-500",
    Icon: XCircle,
  },
  success: {
    wrap: "bg-green-50 border-green-200",
    text: "text-green-800",
    icon: "text-green-500",
    Icon: CheckCircle2,
  },
} as const;

export default function GlobalNotice({ notice }: GlobalNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!notice.enabled || !notice.message.trim() || dismissed) return null;

  const style = TYPE_STYLES[notice.type] ?? TYPE_STYLES.info;
  const { Icon } = style;

  return (
    <div className={`w-full border-b px-4 py-2.5 ${style.wrap}`}>
      <div className="max-w-md mx-auto flex items-start gap-2.5">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${style.icon}`} />
        <p className={`text-xs flex-1 leading-snug font-medium ${style.text}`}>
          {notice.message}
        </p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fechar aviso"
          className={`shrink-0 hover:opacity-60 transition-opacity ${style.icon}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
