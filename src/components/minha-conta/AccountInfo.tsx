
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Clock, Calendar, CreditCard } from 'lucide-react';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { formatDistanceToNow, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getDiscount } from '@/utils/planUtils';

interface AccountInfoProps {
  userData: {
    id: number;
    status: string;
    created_at: string;
    tipoplano?: string;
    data_inicio?: string;
    data_fim?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
    subscription_status?: string;
  };
  onPremiumUnlock?: () => void;
  onPremiumLock?: () => void;
  isPremiumUnlocked?: boolean;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ userData, onPremiumUnlock, onPremiumLock, isPremiumUnlocked }) => {
  const { hasActiveSubscription, subscription, planInfo, discountPercentage, isLoading } = useUserSubscription();
  
  // Secret sequence: Shield → User → Clock (unlock), reverse Clock → User → Shield (lock)
  const [secretStep, setSecretStep] = useState(0);
  const [lockStep, setLockStep] = useState(0);
  
  const handleSecretClick = useCallback((icon: 'shield' | 'user' | 'clock') => {
    if (!isPremiumUnlocked) {
      // Unlock sequence: Shield → User → Clock
      if (icon === 'shield' && secretStep === 0) {
        setSecretStep(1);
      } else if (icon === 'user' && secretStep === 1) {
        setSecretStep(2);
      } else if (icon === 'clock' && secretStep === 2) {
        setSecretStep(3);
        onPremiumUnlock?.();
      } else {
        setSecretStep(0);
      }
    } else {
      // Lock sequence (reverse): Clock → User → Shield
      if (icon === 'clock' && lockStep === 0) {
        setLockStep(1);
      } else if (icon === 'user' && lockStep === 1) {
        setLockStep(2);
      } else if (icon === 'shield' && lockStep === 2) {
        setLockStep(0);
        setSecretStep(0);
        onPremiumLock?.();
      } else {
        setLockStep(0);
      }
    }
  }, [secretStep, lockStep, isPremiumUnlocked, onPremiumUnlock, onPremiumLock]);
  
  // Debug: Log dos dados recebidos
  console.log('📦 [ACCOUNT_INFO] userData recebido:', {
    id: userData.id,
    created_at: userData.created_at,
    data_inicio: userData.data_inicio,
    data_fim: userData.data_fim,
    subscription_start_date: userData.subscription_start_date,
    subscription_end_date: userData.subscription_end_date,
    subscription_status: userData.subscription_status
  });
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    
    try {
      // Se for uma data ISO completa (YYYY-MM-DD HH:MM:SS ou YYYY-MM-DDTHH:MM:SS.sssZ)
      if (dateString.includes('T') || dateString.includes(' ')) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
      }
      
      // Se for apenas YYYY-MM-DD
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const getPlanInfo = () => {
    const planName = userData.tipoplano || 'Pré-Pago';
    
    // Para plano Pré-Pago, não mostrar datas
    if (planName === 'Pré-Pago') {
      return {
        planName,
        startDate: 'Não se aplica',
        endDate: 'Não se aplica',
        daysRemaining: 0
      };
    }
    
    // Usar dados reais da tabela users (data_inicio e data_fim)
    const startDate = userData.data_inicio ? new Date(userData.data_inicio) : null;
    const endDate = userData.data_fim ? new Date(userData.data_fim) : null;
    
    if (startDate && endDate) {
      const now = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        planName,
        startDate: formatDate(userData.data_inicio),
        endDate: formatDate(userData.data_fim),
        daysRemaining: Math.max(0, daysRemaining)
      };
    } else if (startDate && !endDate) {
      // Plano com data de início mas sem data de fim (plano vitalício)
      return {
        planName,
        startDate: formatDate(userData.data_inicio),
        endDate: 'Sem vencimento',
        daysRemaining: 999999
      };
    } else {
      // Caso não tenha datas definidas
      return {
        planName,
        startDate: 'Não informado',
        endDate: 'Não informado',
        daysRemaining: 0
      };
    }
  };

  const planData = getPlanInfo();

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />
          Informações da Conta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
        {/* Informações básicas da conta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <User 
              className="h-6 w-6 sm:h-8 sm:w-8 text-brand-purple flex-shrink-0 cursor-pointer select-none" 
              onClick={() => handleSecretClick('user')}
            />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">ID do Usuário</p>
              <p className="font-semibold text-sm sm:text-base">{userData.id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Shield 
              className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0 cursor-pointer select-none" 
              onClick={() => handleSecretClick('shield')}
            />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Status</p>
              <span className={`px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${
                userData.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {userData.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Clock 
              className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 cursor-pointer select-none" 
              onClick={() => handleSecretClick('clock')}
            />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Membro desde</p>
              <p className="font-semibold text-sm sm:text-base">{formatDate(userData.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Informações do plano */}
        <div className="border-t pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />
            Plano Atual
          </h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <div className="relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                {/* Badge de desconto no canto superior direito do card do plano */}
                {(() => {
                  const planDiscount = getDiscount(planData.planName);
                  return planDiscount > 0 ? (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="bg-purple-600 text-white shadow-lg border-2 border-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1">
                        {planDiscount}%
                      </Badge>
                    </div>
                  ) : null;
                })()}
                
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Plano</p>
                  <p className="font-semibold text-purple-600 text-xs sm:text-base truncate">{planData.planName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Início</p>
                  <p className="font-semibold text-green-600 text-xs sm:text-base truncate">{planData.startDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Término</p>
                  <p className="font-semibold text-orange-600 text-xs sm:text-base truncate">{planData.endDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Restantes</p>
                  <p className="font-semibold text-blue-600 text-xs sm:text-base">
                    {planData.daysRemaining === 999999 
                      ? 'Ilimitado' 
                      : (planData.daysRemaining > 0 ? `${planData.daysRemaining} dias` : 'Expirado')
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountInfo;
