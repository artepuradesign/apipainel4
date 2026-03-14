import React from 'react';
import RechargeCard from '../RechargeCard';
import EmptyState from '../EmptyState';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'bonus' | 'referral_bonus' | 'plan_purchase' | 'plan_activation' | 'recharge' | 'plan_credit' | 'recarga' | 'consultation';
  description: string;
  created_at: string;
  balance_type?: 'wallet' | 'plan';
  status?: string;
  payment_method?: string;
}

interface RechargesSectionProps {
  rechargeTransactions: Transaction[];
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  loading?: boolean;
}

const RechargesSection: React.FC<RechargesSectionProps> = ({
  rechargeTransactions,
  formatBrazilianCurrency,
  formatDate,
  loading = false
}) => {
  const getMethodShort = (method?: string) => {
    switch ((method || '').toLowerCase()) {
      case 'pix':
        return 'PIX';
      case 'boleto':
        return 'Boleto';
      case 'credit_card':
        return 'Cartão';
      case 'debit_card':
        return 'Débito';
      default:
        return 'Recarga';
    }
  };

  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:block space-y-3 md:space-y-4">
        {rechargeTransactions.length > 0 ? (
          rechargeTransactions.map((transaction) => (
            <RechargeCard
              key={transaction.id}
              transaction={transaction}
              formatBrazilianCurrency={formatBrazilianCurrency}
              formatDate={formatDate}
            />
          ))
        ) : (
          <EmptyState
            title="Nenhuma recarga encontrada"
            subtitle="Suas recargas aparecerão aqui"
            loading={loading}
          />
        )}
      </div>

      {/* Mobile compact */}
      <div className="md:hidden">
        {rechargeTransactions.length > 0 ? (
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {rechargeTransactions.map((t) => (
              <div key={t.id} className="px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium truncate">
                        {t.description || 'Recarga'}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {getMethodShort(t.payment_method)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatDate(t.created_at)}
                    </div>
                  </div>
                  <div className="text-xs font-semibold">{formatBrazilianCurrency(t.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma recarga encontrada"
            subtitle="Suas recargas aparecerão aqui"
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default RechargesSection;