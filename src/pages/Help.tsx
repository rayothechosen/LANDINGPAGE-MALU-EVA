import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const reasons = [
  "Não era o que eu esperava",
  "Não consegui acessar",
  "Comprei errado",
  "Problema técnico",
  "Não quero mais aguardar",
  "Outro motivo",
];

const Help = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [confirm, setConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !cpf || !whatsapp || !reason) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (email !== emailConfirm) {
      toast({ title: "Os e-mails não coincidem", variant: "destructive" });
      return;
    }
    if (!confirm) {
      toast({ title: "Você precisa confirmar para prosseguir", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f5f7f9] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {!submitted ? (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[#ee4d2d]/10 flex items-center justify-center">
                <LifeBuoy className="w-6 h-6 text-[#ee4d2d]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Central de Ajuda</h1>
                <p className="text-sm text-muted-foreground">Precisa de suporte ou reembolso?</p>
              </div>
            </div>

            {!showForm ? (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Caso você queira solicitar o reembolso da sua compra, preencha o formulário
                  abaixo. Nossa equipe analisará seu pedido e dará retorno em até 3 dias úteis.
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-[#ee4d2d] hover:bg-[#d63f1f] text-white h-12 rounded-xl font-semibold"
                >
                  Solicitar reembolso
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <section>
                  <h2 className="font-semibold text-base mb-3 text-foreground">Dados da compra</h2>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Nome completo</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail usado na compra</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF usado na compra</Label>
                      <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="font-semibold text-base mb-3 text-foreground">Dados para contato</h2>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp com DDD</Label>
                      <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="emailConfirm">Confirmação do e-mail</Label>
                      <Input
                        id="emailConfirm"
                        type="email"
                        value={emailConfirm}
                        onChange={(e) => setEmailConfirm(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Repetir o e-mail usado na compra evita erro de digitação.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="font-semibold text-base mb-3 text-foreground">Motivo do reembolso</h2>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {reasons.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-3">
                    <Label htmlFor="description">Descreva brevemente o motivo (opcional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      rows={4}
                    />
                  </div>
                </section>

                <section className="bg-[#f5f7f9] rounded-2xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={confirm}
                      onCheckedChange={(v) => setConfirm(v === true)}
                      className="mt-1"
                    />
                    <span className="text-sm text-foreground leading-relaxed">
                      Confirmo que os dados informados estão corretos e entendo que, após o
                      reembolso, meu acesso ao produto será cancelado.
                    </span>
                  </label>
                </section>

                <Button
                  type="submit"
                  className="w-full bg-[#ee4d2d] hover:bg-[#d63f1f] text-white h-12 rounded-xl font-semibold"
                >
                  Solicitar reembolso
                </Button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Solicitação recebida</h1>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p className="text-foreground font-medium">
                Solicitação de reembolso recebida com sucesso.
              </p>
              <p>
                Se os dados informados estiverem corretos e a compra estiver dentro do prazo de
                garantia, o estorno será processado em até 3 dias úteis.
              </p>
              <p>
                Após o processamento, o prazo para o valor aparecer na sua conta pode variar de
                acordo com a instituição bancária, operadora de cartão ou meio de pagamento
                utilizado na compra. Esse prazo não depende diretamente da nossa equipe, pois a
                compensação final é realizada pelo banco ou plataforma responsável pelo pagamento.
              </p>
              <p>
                Caso seja necessário confirmar alguma informação, nossa equipe entrará em contato
                pelo e-mail ou WhatsApp informado no formulário.
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="w-full mt-6 bg-[#ee4d2d] hover:bg-[#d63f1f] text-white h-12 rounded-xl font-semibold"
            >
              Voltar ao início
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Help;
