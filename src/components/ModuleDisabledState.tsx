import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldOff } from "lucide-react";

interface ModuleDisabledStateProps {
  title:   string;
  message: string;
}

export default function ModuleDisabledState({
  title,
  message,
}: ModuleDisabledStateProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 gap-5">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <ShieldOff className="w-8 h-8 text-muted-foreground/40" />
      </div>
      <div className="text-center max-w-xs">
        <p className="font-extrabold text-foreground text-lg leading-snug mb-2">
          {title}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:opacity-80 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao inicio
      </button>
    </div>
  );
}
