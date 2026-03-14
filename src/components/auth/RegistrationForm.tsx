
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User, Mail, Gift } from "lucide-react";
import { toast } from 'sonner';
import { makeDirectRequest } from '@/config/apiConfig';
import { externalReferralApiService } from '@/services/externalReferralApiService';
import { useBonusConfig } from '@/services/bonusConfigService';

interface RegistrationFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isSubmitting: boolean;
  isFormComplete: boolean;
  referralId: string;
  setReferralId: (value: string) => void;
  onVerifyReferralId: (referrerId: number, referralCode: string) => void;
  referralValidation: any;
  isProcessingUrl?: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  isSubmitting,
  isFormComplete,
  referralId,
  setReferralId,
  onVerifyReferralId,
  referralValidation,
  isProcessingUrl = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const { bonusAmount } = useBonusConfig();

  const validateReferralCode = async () => {
    if (!referralId.trim()) {
      toast('Por favor, digite um código de indicação');
      return;
    }

    if (hasVerified || referralValidation?.isValid) {
      console.log('🔄 [REFERRAL_FORM] Código já validado');
      return;
    }

    if (isProcessingUrl) {
      console.log('🔄 [REFERRAL_FORM] Aguardando processamento da URL...');
      return;
    }

    setIsValidating(true);
    
    try {
      console.log('🔍 [REFERRAL_FORM] Validando código manualmente:', referralId.trim());
      
      const externalValidation = await externalReferralApiService.validateReferralCode(referralId.trim());
      
      if (externalValidation.valid) {
        console.log('✅ [REFERRAL_FORM] Código válido na API externa:', externalValidation);
        
        const referrerName = externalValidation.referrer_name || 'Usuário Indicador';
        
        console.log('👤 [REFERRAL_FORM] Nome do indicador extraído:', referrerName);
        
        setHasVerified(true);
        onVerifyReferralId(externalValidation.referrer_id!, referralId.trim());
        
        toast(`Ótimo! Código de ${referrerName} aplicado com sucesso!`);
        return;
      }
      
      console.log('🔄 [REFERRAL_FORM] Tentando API local como fallback...');
      
      const response = await makeDirectRequest('/auth/validate-referral', { 
        code: referralId.trim() 
      }, 'POST');
      
      console.log('📡 [REFERRAL_FORM] Resposta completa da API local:', response);
      
      if (response.success && response.data) {
        console.log('✅ [REFERRAL_FORM] Código válido na API local:', response.data);
        
        let referrerName = 'Usuário Indicador';
        if (response.data.referrer_name) {
          referrerName = response.data.referrer_name;
        } else if (response.data.referrerName) {
          referrerName = response.data.referrerName;
        } else if (response.data.full_name) {
          referrerName = response.data.full_name;
        } else if (response.data.name) {
          referrerName = response.data.name;
        }
        
        console.log('👤 [REFERRAL_FORM] Nome do indicador extraído:', referrerName);
        
        setHasVerified(true);
        onVerifyReferralId(response.data.referrer_id, referralId.trim());
        
        toast(`Ótimo! Código de ${referrerName} aplicado com sucesso!`);
      } else {
        console.log('❌ [REFERRAL_FORM] Código inválido - resposta completa:', response);
        
        toast(response.message || 'Código de indicação não encontrado');
        setHasVerified(false);
      }
    } catch (error) {
      console.error('❌ [REFERRAL_FORM] Erro na validação - erro completo:', error);
      toast('Erro ao validar código. Tente novamente.');
      setHasVerified(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (value: string) => {
    console.log('📝 [REFERRAL_FORM] Campo alterado:', value);
    setReferralId(value.toUpperCase());
    setHasVerified(false);
  };

  const isCodeVerified = referralValidation?.isValid || hasVerified;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="name"
            type="text"
            placeholder="Digite seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10 h-9"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-9"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Crie uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-9"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referral-code" className="text-sm font-medium">
          Código de Indicação (Opcional)
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Gift className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="referral-code"
              type="text"
              value={referralId}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Ex: USER123"
              className="pl-10 uppercase h-9"
              disabled={isValidating || isCodeVerified || isProcessingUrl}
            />
          </div>
          <Button
            type="button"
            onClick={validateReferralCode}
            disabled={!referralId.trim() || isValidating || isCodeVerified || isProcessingUrl}
            variant={isCodeVerified ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap min-w-[80px] h-9"
          >
            {isValidating 
              ? '...' 
              : isCodeVerified 
                ? '✓ OK' 
                : 'Validar'
            }
          </Button>
        </div>
        {referralValidation && (
          <div className={`text-xs p-2 rounded ${
            referralValidation.isValid 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : referralValidation.isExpired
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {referralValidation.isValid 
              ? `✅ Código válido! Indicado por: ${referralValidation.referrerName || 'Usuário Indicador'} — Bônus: ${bonusAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
              : referralValidation.isExpired
                ? '⏰ Código expirado'
              : `❌ ${referralValidation.message || 'Código inválido'}`
            }
          </div>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-12 text-base font-semibold premium-button"
        disabled={isSubmitting || !isFormComplete}
      >
        {isSubmitting ? "Processando..." : "Criar Conta"}
      </Button>
    </div>
  );
};

export default RegistrationForm;
