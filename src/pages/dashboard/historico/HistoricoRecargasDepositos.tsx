import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, RefreshCcw } from 'lucide-react';
import { useHistoricoData } from '@/hooks/useHistoricoData';
import RechargesSection from '@/components/historico/sections/RechargesSection';
import { formatBrazilianCurrency, formatDate } from '@/utils/historicoUtils';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';

const HistoricoRecargasDepositos = () => {
  const { state, refresh, rechargeTransactions } = useHistoricoData();

  return (
    <div className="space-y-3 sm:space-y-6 relative z-10 px-1 sm:px-0">
      <DashboardTitleCard
        title="Histórico · Recargas e Depósitos"
        icon={<RefreshCcw className="h-4 w-4 sm:h-5 sm:w-5" />}
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

      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <RechargesSection
            rechargeTransactions={rechargeTransactions}
            formatBrazilianCurrency={formatBrazilianCurrency}
            formatDate={formatDate}
            loading={state.loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricoRecargasDepositos;
