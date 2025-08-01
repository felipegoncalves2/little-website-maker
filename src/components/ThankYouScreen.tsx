import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText } from "lucide-react";

interface ThankYouScreenProps {
  onBackToForm: () => void;
}

const ThankYouScreen = ({ onBackToForm }: ThankYouScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header da TECHUB */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">TECHUB</h1>
          </div>
          <p className="text-muted-foreground">Sistema de Justificativa de Troca Prematura</p>
        </div>

        <Card className="shadow-[var(--shadow-soft)] border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl text-foreground">
              ✅ Justificativa enviada com sucesso!
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">Obrigado por enviar sua justificativa.</strong>
              </p>
              <p>
                Ela foi registrada corretamente em nosso sistema e será analisada pela equipe TECHUB.
              </p>
              <p>
                Caso seja necessário, entraremos em contato por e-mail ou WhatsApp.
              </p>
            </div>

            <div className="pt-6">
              <Button
                onClick={onBackToForm}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-8 shadow-[var(--shadow-soft)] transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              >
                Enviar Nova Justificativa
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2024 TECHUB - Sistema de Controle de Suprimentos</p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouScreen;