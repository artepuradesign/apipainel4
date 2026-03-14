import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CreditCard } from 'lucide-react';
import { useHistoricoData } from '@/hooks/useHistoricoData';
import PixPaymentsSection from '@/components/dashboard/PixPaymentsSection';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';

const HistoricoPagamentosPix = () => {
  const { state, refresh } = useHistoricoData();

  return (
    <div className="space-y-3 sm:space-y-6 relative z-10 px-1 sm:px-0">
      <DashboardTitleCard
        title="Histórico · Pagamentos PIX"
        icon={<CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/historico"
        right={
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={state.loading}
            className="h-8 w-8 p-0"
            aria-label="Atualizar"
          >
            <RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
          </Button>
        }
      />

      <PixPaymentsSection />
    </div>
  );
};

export default HistoricoPagamentosPix;
