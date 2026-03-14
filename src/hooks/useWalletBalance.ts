import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userApiService } from '@/services/userApiService';
import { toast } from 'sonner';

interface WalletBalance {
  saldo: number;
  saldo_plano: number;
  total: number;
}

export const useWalletBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance>({
    saldo: 0,
    saldo_plano: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando saldo da API para usuário:', user.id);
      
      const response = await userApiService.getUserBalance();
      
      if (response.success && response.data) {
        const balanceData = response.data;
        
        // A API retorna o formato correto do backend
        const newBalance = {
          saldo: balanceData.saldo || 0,
          saldo_plano: balanceData.saldo_plano || 0,
          total: balanceData.total || 0
        };
        
        setBalance(newBalance);
        
        console.log('✅ Saldo carregado da API:', newBalance);
      } else {
        console.warn('⚠️ Erro ao buscar saldo:', response.error);
        setError(response.error || 'Erro ao carregar saldo');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro na API de saldo:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, [user?.id]);

  // Carrega saldo automaticamente quando usuário está disponível
  useEffect(() => {
    if (user?.id) {
      loadBalance();
    }
  }, [user?.id, loadBalance]);

  // Escutar eventos específicos de atualização de saldo
  useEffect(() => {
    // Evento específico para recargas
    const handleBalanceRecharge = () => {
      console.log('💰 [useWalletBalance] Recarga detectada - recarregando saldo');
      loadBalance();
    };

    // Evento específico para compras de planos
    const handlePlanPurchase = () => {
      console.log('💎 [useWalletBalance] Compra de plano detectada - recarregando saldo');
      loadBalance();
    };

    // Manter compatibilidade com evento genérico
    const handleBalanceUpdate = () => {
      console.log('🔄 Evento balanceUpdated genérico recebido - recarregando saldo');
      loadBalance();
    };

    window.addEventListener('balanceRechargeUpdated', handleBalanceRecharge);
    window.addEventListener('planPurchaseUpdated', handlePlanPurchase);
    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('balanceRechargeUpdated', handleBalanceRecharge);
      window.removeEventListener('planPurchaseUpdated', handlePlanPurchase);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, [loadBalance]);

  // Função para adicionar saldo via API (removida - agora o processamento é feito pelo hook de pagamento)
  const addBalance = async (amount: number, description: string = 'Recarga de saldo', paymentMethod: string = 'PIX'): Promise<boolean> => {
    console.log('ℹ️ [useWalletBalance] addBalance chamado mas delegando para hook de pagamento');
    // Esta função é mantida para compatibilidade, mas o processamento é feito via hook de pagamento
    return true;
  };

  return {
    balance,
    isLoading,
    hasLoadedOnce,
    error,
    loadBalance,
    addBalance,
    // Compatibilidade com hooks antigos
    totalAvailableBalance: balance.total,
    calculateTotalAvailableBalance: () => balance.total,
    loadTotalAvailableBalance: loadBalance
  };
};