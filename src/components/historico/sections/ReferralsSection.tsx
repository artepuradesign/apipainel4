import React from 'react';
import EmptyState from '../EmptyState';

interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  amount: number;
  created_at: string;
  status: 'pending' | 'paid';
  referred_name?: string;
}

interface ReferralsSectionProps {
  referralEarnings: ReferralEarning[];
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  loading?: boolean;
}

const ReferralsSection: React.FC<ReferralsSectionProps> = ({
  referralEarnings,
  formatBrazilianCurrency,
  formatDate,
  loading = false
}) => {
  return (
    <div className="rounded-lg border border-border bg-card p-4 md:p-6">
      {referralEarnings.length > 0 ? (
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-sm md:text-md font-semibold text-foreground border-b border-border pb-2">
              🎁 Histórico Detalhado de Bônus
            </h4>

            {/* Mobile: lista compacta */}
            <div className="md:hidden overflow-hidden rounded-lg border border-border bg-card">
              <div className="divide-y divide-border">
                {referralEarnings.map((earning) => (
                  <div key={earning.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                        {earning.referred_name ? earning.referred_name.charAt(0).toUpperCase() : 'U'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {earning.referred_name || `Usuário ${earning.referred_user_id}`}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              📅 {formatDate(earning.created_at)}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-foreground">
                              + {formatBrazilianCurrency(earning.amount)}
                            </p>
                            <span
                              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium w-fit ml-auto ${
                                earning.status === 'paid'
                                  ? 'bg-secondary text-secondary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {earning.status === 'paid' ? '✅ Pago' : '⏳ Pendente'}
                            </span>
                          </div>
                        </div>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          💝 Bônus de boas-vindas por indicação confirmada
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          ID: {earning.referred_user_id}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop: cards */}
            <div className="hidden md:block">
              {referralEarnings.map((earning) => (
                <div
                  key={earning.id}
                  className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                        {earning.referred_name ? earning.referred_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="truncate font-semibold text-base text-foreground">
                            {earning.referred_name || `Usuário ${earning.referred_user_id}`}
                          </h5>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              earning.status === 'paid'
                                ? 'bg-secondary text-secondary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {earning.status === 'paid' ? '✅ Pago' : '⏳ Pendente'}
                          </span>
                          <span className="text-xs text-muted-foreground">ID: {earning.referred_user_id}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          💝 Bônus de boas-vindas por indicação confirmada
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">📅 {formatDate(earning.created_at)}</p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xl font-bold text-foreground">
                        + {formatBrazilianCurrency(earning.amount)}
                      </div>
                      <p className="text-xs text-muted-foreground">Bônus recebido</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState 
          title="Nenhum bônus por indicação encontrado"
          subtitle="Seus ganhos por indicação aparecerão aqui quando você começar a indicar pessoas"
          loading={loading}
        />
      )}
    </div>
  );
};

export default ReferralsSection;