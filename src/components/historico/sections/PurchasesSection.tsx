import React from 'react';
import PlanTransactionCard from '../PlanTransactionCard';
import EmptyState from '../EmptyState';

interface HistoryItem {
  id: string;
  type?: string;
  description?: string;
  [key: string]: any;
}

interface PurchasesSectionProps {
  allHistory: Array<HistoryItem>;
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  loading?: boolean;
}

const PurchasesSection: React.FC<PurchasesSectionProps> = ({
  allHistory,
  formatBrazilianCurrency,
  formatDate,
  loading = false
}) => {
  const purchaseItems = allHistory.filter(item => 
    'type' in item && 
    (item.type === 'plan_purchase' || 
     item.type === 'plan_activation' ||
     (item.description && (
       item.description.includes('Compra do plano') || 
       item.description.includes('Ativação do plano')
     )))
  );

  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:block space-y-3 md:space-y-4">
        {purchaseItems.length > 0 ? (
          purchaseItems.map((item) => {
            const planTransaction = item as HistoryItem;

            // Determinar o tipo correto baseado na descrição se necessário
            let planType: 'plan_purchase' | 'plan_activation' = 'plan_purchase';
            if (planTransaction.type === 'plan_activation' || planTransaction.description?.includes('Ativação')) {
              planType = 'plan_activation';
            }

            return (
              <PlanTransactionCard
                key={planTransaction.id}
                transaction={{
                  ...planTransaction,
                  type: planType,
                  amount: planTransaction.amount || 0,
                  created_at: planTransaction.created_at || new Date().toISOString(),
                  description: planTransaction.description || 'Transação de plano',
                  payment_method: planTransaction.payment_method,
                  coupon_applied: planTransaction.description?.includes('Cupom')
                    ? planTransaction.description.match(/Cupom:\s*([A-Z0-9]+)/)?.[1]
                    : undefined,
                  original_amount: planTransaction.description?.includes('Cupom')
                    ? planTransaction.amount * 1.2
                    : undefined,
                }}
                formatBrazilianCurrency={formatBrazilianCurrency}
                formatDate={formatDate}
              />
            );
          })
        ) : (
          <EmptyState
            title="Nenhuma compra encontrada"
            subtitle="Suas compras e ativações de planos aparecerão aqui"
            loading={loading}
          />
        )}
      </div>

      {/* Mobile compact */}
      <div className="md:hidden">
        {purchaseItems.length > 0 ? (
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {purchaseItems.map((item: any) => {
              const isActivation = item.type === 'plan_activation' || item.description?.includes('Ativação');
              const amount = Math.abs(Number(item.amount) || 0);
              const label = isActivation ? 'Ativação' : 'Compra';

              return (
                <div key={item.id} className="px-3 py-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium truncate">
                          {item.description || (isActivation ? 'Ativação do plano' : 'Compra do plano')}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {label}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatDate(item.created_at)}
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-destructive">
                      -{formatBrazilianCurrency(amount)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma compra encontrada"
            subtitle="Suas compras e ativações de planos aparecerão aqui"
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default PurchasesSection;