import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Upload, Calendar, Gauge, Printer, Shield } from "lucide-react";
import DOMPurify from "dompurify";
import ThankYouScreen from "./ThankYouScreen";

interface FormData {
  id: string;
  numeroSerie: string;
  serieSuprimento: string;
  dataUltimaLeitura: string;
  nivelUltimaLeitura: string;
  organizacao: string;
  codigoProjeto: string;
  justificativa: string;
  anexo: File | null;
}

const SupplyJustificationForm = () => {
const [formData, setFormData] = useState<FormData>({
  id: "",
  numeroSerie: "",
  serieSuprimento: "",
  dataUltimaLeitura: "",
  nivelUltimaLeitura: "",
  organizacao: "",
  codigoProjeto: "",
  justificativa: "",
  anexo: null,
});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showThankYou, setShowThankYou] = useState(false);

  // Security: Allowed file types and their MIME types
  const ALLOWED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_TEXT_LENGTH = 250; // Maximum text length for justification

  // Security: Input sanitization
  const sanitizeInput = useCallback((input: string): string => {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
  }, []);

  // Security: Validate URL parameters
  const validateUrlParam = useCallback((param: string | null): string => {
    if (!param) return "";
    const sanitized = sanitizeInput(param);
    // Additional validation for expected formats
    if (sanitized.length > 100) return ""; // Prevent overly long parameters
    return sanitized;
  }, [sanitizeInput]);

  // Security: File validation
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: "O arquivo deve ter no máximo 10MB." };
    }

    // Check file type by MIME type and extension
    const mimeType = file.type;
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    const allowedExtensions = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
    if (!allowedExtensions || !allowedExtensions.includes(extension)) {
      return { isValid: false, error: "Tipo de arquivo não permitido. Use apenas: PDF, DOC, DOCX, JPG, PNG." };
    }

    // Check for potentially malicious filenames
    if (/[<>:"\/\\|?*\x00-\x1f]/.test(file.name)) {
      return { isValid: false, error: "Nome do arquivo contém caracteres inválidos." };
    }

    return { isValid: true };
  }, []);

  // Security: Text validation
  const validateText = useCallback((text: string, minLength = 0): { isValid: boolean; error?: string } => {
    const trimmedText = text.trim();
    
    if (trimmedText.length === 0) {
      return { isValid: false, error: "Este campo é obrigatório." };
    }
    
    if (minLength > 0 && trimmedText.length < minLength) {
      return { isValid: false, error: `Este campo deve ter no mínimo ${minLength} caracteres.` };
    }
    
    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return { isValid: false, error: `O texto deve ter no máximo ${MAX_TEXT_LENGTH} caracteres.` };
    }

    // Check for suspicious patterns (basic XSS/injection protection)
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        return { isValid: false, error: "Conteúdo não permitido detectado." };
      }
    }

    return { isValid: true };
  }, []);

  // Validate required fields
  const validateRequiredFields = useCallback((): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    
    // Validate all required fields
    if (!formData.numeroSerie.trim()) {
      newErrors.numeroSerie = "Número de Série é obrigatório.";
    }
    
    if (!formData.serieSuprimento.trim()) {
      newErrors.serieSuprimento = "Série do Suprimento é obrigatória.";
    }
    
    if (!formData.dataUltimaLeitura.trim()) {
      newErrors.dataUltimaLeitura = "Data da Última Leitura é obrigatória.";
    }
    
    if (!formData.nivelUltimaLeitura.trim()) {
      newErrors.nivelUltimaLeitura = "Nível da Última Leitura é obrigatório.";
    }
    
    // Validate justificativa with minimum 15 characters
    const justificativaValidation = validateText(formData.justificativa, 15);
    if (!justificativaValidation.isValid) {
      newErrors.justificativa = justificativaValidation.error || "Justificativa inválida.";
    }
    
    // Validate file if provided
    if (formData.anexo) {
      const fileValidation = validateFile(formData.anexo);
      if (!fileValidation.isValid) {
        newErrors.anexo = fileValidation.error || "Arquivo inválido.";
      }
    }
    
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, [formData, validateText, validateFile]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
setFormData(prev => ({
  ...prev,
  id: validateUrlParam(urlParams.get("id")),
  numeroSerie: validateUrlParam(urlParams.get("numeroSerie")),
  serieSuprimento: validateUrlParam(urlParams.get("serieSuprimento")),
  dataUltimaLeitura: validateUrlParam(urlParams.get("dataUltimaLeitura")),
  nivelUltimaLeitura: validateUrlParam(urlParams.get("nivelUltimaLeitura")),
  organizacao: validateUrlParam(urlParams.get("organizacao")),
  codigoProjeto: validateUrlParam(urlParams.get("codigoProjeto")),
}));
    
    // Mascarar URL após preenchimento automático
if (urlParams.toString()) {
  window.history.replaceState({}, document.title, window.location.pathname);
}
  }, [validateUrlParam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear previous error for this field
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));

    // For justificativa, preserve spaces and don't trim automatically
    const sanitizedValue = name === 'justificativa' ? value : sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Real-time validation for justificativa
    if (name === 'justificativa' && sanitizedValue) {
      const validation = validateText(sanitizedValue, 15);
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          [name]: validation.error || ""
        }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Clear previous file error
    setErrors(prev => ({
      ...prev,
      anexo: ""
    }));

    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          anexo: validation.error || ""
        }));
        // Clear the file input
        e.target.value = "";
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      anexo: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear all errors
    setErrors({});

    // Comprehensive validation before submission
    const validation = validateRequiredFields();
    
    // If there are validation errors, display them and stop submission
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Por favor, corrija os erros antes de enviar.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Security: Sanitize all inputs before submission
const sanitizedData = {
  id: sanitizeInput(formData.id),
  numeroSerie: sanitizeInput(formData.numeroSerie),
  serieSuprimento: sanitizeInput(formData.serieSuprimento),
  dataUltimaLeitura: sanitizeInput(formData.dataUltimaLeitura),
  nivelUltimaLeitura: sanitizeInput(formData.nivelUltimaLeitura),
  organizacao: sanitizeInput(formData.organizacao),
  codigoProjeto: sanitizeInput(formData.codigoProjeto),
  justificativa: sanitizeInput(formData.justificativa)
};

      const submitData = new FormData();
submitData.append("id", sanitizedData.id);
submitData.append("Número de Série", sanitizedData.numeroSerie);
submitData.append("Série do Suprimento", sanitizedData.serieSuprimento);
submitData.append("Data da Última Leitura", sanitizedData.dataUltimaLeitura);
submitData.append("Nível da Última Leitura (%)", sanitizedData.nivelUltimaLeitura);
submitData.append("Organização", sanitizedData.organizacao);
submitData.append("Código do Projeto", sanitizedData.codigoProjeto);
submitData.append("Justificativa", sanitizedData.justificativa);

if (formData.anexo) {
  submitData.append("Anexo", formData.anexo);
}

      // Security: Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch("https://n8n.techub-hml.com.br/webhook-test/justificativa-suprimento", {
        method: "POST",
        body: submitData,
        signal: controller.signal,
        // Security: Add headers to prevent some attacks
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // Show thank you screen on success
        setShowThankYou(true);
      } else {
        // More specific error handling
        const errorText = response.status === 413 ? "Arquivo muito grande" : "Erro no servidor";
        throw new Error(`${errorText} (${response.status})`);
      }
    } catch (error) {
      console.error(error);
      
      // More descriptive error messages
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error("Tempo limite excedido. Verifique sua conexão e tente novamente.");
        } else if (error.message.includes("Failed to fetch")) {
          toast.error("❌ Ocorreu um erro ao enviar sua justificativa.\nPor favor, tente novamente em instantes.");
        } else {
          toast.error("❌ Ocorreu um erro ao enviar sua justificativa.\nPor favor, tente novamente em instantes.");
        }
      } else {
        toast.error("❌ Ocorreu um erro ao enviar sua justificativa.\nPor favor, tente novamente em instantes.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setShowThankYou(false);
    // Clear form after going back from thank you screen
    setFormData(prev => ({
      ...prev,
      justificativa: "",
      anexo: null,
    }));
    setErrors({});
    
    // Clear file input
    const fileInput = document.getElementById('anexo') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  if (showThankYou) {
    return <ThankYouScreen onBackToForm={handleBackToForm} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header da TECHUB */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img 
              src="/lovable-uploads/ddca40be-9bd7-4c6f-8151-cc65519b8457.png" 
              alt="TECHUB Logo" 
              className="h-8 w-auto"
            />
            <h1 className="text-2xl font-bold text-foreground">TECHUB</h1>
          </div>
          <p className="text-muted-foreground">Sistema de Justificativa de Troca Prematura</p>
        </div>

        <Card className="shadow-[var(--shadow-soft)] border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-foreground">
              Justificativa de Troca Prematura de Suprimento
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Preencha os campos abaixo para justificar a troca do suprimento identificada pelo sistema
            </p>
            {/* Security Indicator */}
            <div className="flex items-center justify-center gap-2 mt-4 p-2 bg-muted/30 rounded-lg">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                Formulário seguro - Dados validados e criptografados
              </span>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campos pré-preenchidos (readonly) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroSerie" className="flex items-center gap-2 text-foreground">
                    <Printer className="w-4 h-4 text-primary" />
                    Número de Série da Impressora <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="numeroSerie"
                    name="numeroSerie"
                    value={formData.numeroSerie}
                    readOnly
                    className={`bg-muted/50 text-muted-foreground cursor-not-allowed ${
                      errors.numeroSerie ? 'border-destructive' : ''
                    }`}
                  />
                  {errors.numeroSerie && (
                    <p className="text-sm text-destructive">{errors.numeroSerie}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serieSuprimento" className="flex items-center gap-2 text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    Série do Suprimento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="serieSuprimento"
                    name="serieSuprimento"
                    value={formData.serieSuprimento}
                    readOnly
                    className={`bg-muted/50 text-muted-foreground cursor-not-allowed ${
                      errors.serieSuprimento ? 'border-destructive' : ''
                    }`}
                  />
                  {errors.serieSuprimento && (
                    <p className="text-sm text-destructive">{errors.serieSuprimento}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataUltimaLeitura" className="flex items-center gap-2 text-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    Data/Hora da Última Leitura <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dataUltimaLeitura"
                    name="dataUltimaLeitura"
                    type="datetime-local"
                    value={formData.dataUltimaLeitura}
                    readOnly
                    className={`bg-muted/50 text-muted-foreground cursor-not-allowed ${
                      errors.dataUltimaLeitura ? 'border-destructive' : ''
                    }`}
                  />
                  {errors.dataUltimaLeitura && (
                    <p className="text-sm text-destructive">{errors.dataUltimaLeitura}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivelUltimaLeitura" className="flex items-center gap-2 text-foreground">
                    <Gauge className="w-4 h-4 text-primary" />
                    Nível da Última Leitura (%) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nivelUltimaLeitura"
                    name="nivelUltimaLeitura"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.nivelUltimaLeitura}
                    readOnly
                    className={`bg-muted/50 text-muted-foreground cursor-not-allowed ${
                      errors.nivelUltimaLeitura ? 'border-destructive' : ''
                    }`}
                  />
                  {errors.nivelUltimaLeitura && (
                    <p className="text-sm text-destructive">{errors.nivelUltimaLeitura}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="organizacao" className="flex items-center gap-2 text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    Organização
                  </Label>
                  <Input
                    id="organizacao"
                    name="organizacao"
                    value={formData.organizacao}
                    readOnly
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="codigoProjeto" className="flex items-center gap-2 text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    Código do Projeto
                  </Label>
                  <Input
                    id="codigoProjeto"
                    name="codigoProjeto"
                    value={formData.codigoProjeto}
                    readOnly
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Campos editáveis */}
              <div className="space-y-4 border-t border-border/50 pt-6">
                <div className="space-y-2">
                   <Label htmlFor="justificativa" className="flex items-center gap-2 text-foreground">
                     <FileText className="w-4 h-4 text-primary" />
                     Justificativa (15-250 caracteres) <span className="text-destructive">*</span>
                   </Label>
                  <Textarea
                    id="justificativa"
                    name="justificativa"
                    value={formData.justificativa}
                    onChange={handleInputChange}
                    placeholder="Descreva o motivo da troca prematura do suprimento..."
                    className={`min-h-[120px] bg-input border-border focus:ring-[var(--shadow-focus)] focus:border-primary resize-none ${
                      errors.justificativa ? 'border-destructive focus:border-destructive' : ''
                    }`}
                    required
                    maxLength={MAX_TEXT_LENGTH}
                  />
                  {errors.justificativa && (
                    <p className="text-sm text-destructive">{errors.justificativa}</p>
                  )}
                  <div className="text-xs text-muted-foreground text-right">
                    {formData.justificativa.length}/{MAX_TEXT_LENGTH} caracteres
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anexo" className="flex items-center gap-2 text-foreground">
                    <Upload className="w-4 h-4 text-primary" />
                    Anexo (opcional)
                  </Label>
                  <Input
                    id="anexo"
                    name="anexo"
                    type="file"
                    onChange={handleFileChange}
                    className={`bg-input border-border focus:ring-[var(--shadow-focus)] focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 overflow-hidden ${
                      errors.anexo ? 'border-destructive focus:border-destructive' : ''
                    }`}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {errors.anexo && (
                    <p className="text-sm text-destructive">{errors.anexo}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !validateRequiredFields().isValid}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 shadow-[var(--shadow-soft)] transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  "Enviar Justificativa"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2024 TECHUB - Sistema de Controle de Suprimentos</p>
        </div>
      </div>
    </div>
  );
};

export default SupplyJustificationForm;
