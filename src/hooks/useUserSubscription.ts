import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService, UserSubscription, PlanInfo } from '@/services/subscriptionService';
import { toast } from 'sonner';

export interface UserPlanStatus {
  hasActiveSubscription: boolean;
  subscription: UserSubscription | null;
  planInfo: PlanInfo | null;
  discountPercentage: number;
  isLoading: boolean;
  error: string | null;
}

export const useUserSubscription = () => {
  const { user } = useAuth();
  const [userPlanStatus, setUserPlanStatus] = useState<UserPlanStatus>({
    hasActiveSubscription: false,
    subscription: null,
    planInfo: null,
    discountPercentage: 0,
    isLoading: true,
    error: null
  });

  const checkUserSubscription = async () => {
    if (!user) {
      setUserPlanStatus(prev => ({
        ...prev,
        isLoading: false,
        hasActiveSubscription: false,
        subscription: null,
        planInfo: null,
        discountPercentage: 0
      }));
      return;
    }

    setUserPlanStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🔍 [USER_SUBSCRIPTION] Verificando assinatura para usuário:', user.id);

      // Primeiro verifica se há assinatura ativa na tabela user_subscriptions
      const subscriptionResponse = await subscriptionService.getUserActiveSubscription();
      
      if (subscriptionResponse.success && subscriptionResponse.data) {
        console.log('✅ [USER_SUBSCRIPTION] Assinatura ativa encontrada:', subscriptionResponse.data);
        
        // Se há assinatura ativa, buscar informações do plano
        const planResponse = await subscriptionService.getPlanInfo(subscriptionResponse.data.plan_name || '');
        
        // Usar APENAS o desconto configurado no plano (campo discount_percentage) / assinatura.
        // Não usar fallback local (planUtils), para refletir exatamente a configuração do painel de Personalização.
        const finalDiscountPercentage =
          subscriptionResponse.data.discount_percentage ??
          planResponse.data?.discount_percentage ??
          0;
        
        console.log('✅ [USER_SUBSCRIPTION] Desconto calculado:', {
          subscriptionDiscount: subscriptionResponse.data.discount_percentage,
          planDiscount: planResponse.data?.discount_percentage,
          finalDiscount: finalDiscountPercentage
        });
        
        setUserPlanStatus({
          hasActiveSubscription: true,
          subscription: subscriptionResponse.data,
          planInfo: planResponse.success ? planResponse.data || null : null,
          discountPercentage: finalDiscountPercentage,
          isLoading: false,
          error: null
        });
      } else {
        console.log('ℹ️ [USER_SUBSCRIPTION] Usuário sem assinatura ativa na API');
        
        setUserPlanStatus({
          hasActiveSubscription: false,
          subscription: null,
          planInfo: null,
          discountPercentage: 0,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('❌ [USER_SUBSCRIPTION] Erro ao verificar assinatura:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setUserPlanStatus({
        hasActiveSubscription: false,
        subscription: null,
        planInfo: null,
        discountPercentage: 0,
        isLoading: false,
        error: errorMessage
      });
      
      toast.error('Erro ao verificar plano do usuário');
    }
  };

  const calculateDiscountedPrice = (originalPrice: number, panelId?: number) => {
    // Painel 38 não tem desconto
    if (panelId === 38) {
      console.log('🚫 [USER_SUBSCRIPTION] Painel 38 - sem desconto aplicado');
      return {
        originalPrice,
        discountedPrice: originalPrice,
        discountAmount: 0,
        hasDiscount: false
      };
    }
    
    const finalDiscountPercentage = userPlanStatus.discountPercentage;
    
    console.log('🔍 [USER_SUBSCRIPTION] Calculando desconto:', {
      originalPrice,
      panelId,
      discountPercentage: finalDiscountPercentage
    });
    
    return subscriptionService.calculateDiscountedPrice(originalPrice, finalDiscountPercentage);
  };

  const refreshSubscription = async () => {
    await checkUserSubscription();
  };

  useEffect(() => {
    checkUserSubscription();
  }, [user]);

  // Listen for subscription updates
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      console.log('🔄 [USER_SUBSCRIPTION] Evento de atualização de assinatura recebido');
      checkUserSubscription();
    };

    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, []);

  return {
    ...userPlanStatus,
    calculateDiscountedPrice,
    refreshSubscription
  };
};