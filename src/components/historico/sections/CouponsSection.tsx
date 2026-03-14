import React from 'react';
import { Ticket } from 'lucide-react';
import EmptyState from '../EmptyState';

interface CupomHistoryItem {
  id: string;
  codigo: string;
  descricao?: string;
  tipo: 'fixo' | 'percentual';
  valor_desconto: number;
  created_at: string;
}

interface CouponsSectionProps {
  cupomHistory: CupomHistoryItem[];
  formatBrazilianCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  loading?: boolean;
}

const CouponsSection: React.FC<CouponsSectionProps> = ({
  cupomHistory,
  formatBrazilianCurrency,
  formatDate,
  loading = false
}) => {
  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:block space-y-4">
        {cupomHistory.length > 0 ? (
          cupomHistory.map((cupom) => (
            <div key={cupom.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        Cupom {cupom.codigo}
                      </h5>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          ✅ Aplicado
                        </span>
                        <span className="text-xs text-gray-500">
                          {cupom.tipo === 'fixo' ? 'Desconto Fixo' : 'Desconto Percentual'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cupom.descricao || 'Cupom de desconto aplicado'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    📅 {formatDate(cupom.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">
                    + {formatBrazilianCurrency(cupom.valor_desconto)}
                  </div>
                  <p className="text-xs text-gray-500">Valor adicionado</p>
                  <div className="mt-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-xs text-green-600 dark:text-green-400">Creditado no Saldo</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="Nenhum cupom utilizado"
            subtitle="Seus cupons aplicados aparecerão aqui"
            loading={loading}
          />
        )}
      </div>

      {/* Mobile compact */}
      <div className="md:hidden">
        {cupomHistory.length > 0 ? (
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {cupomHistory.map((c) => (
              <div key={c.id} className="px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium truncate">Cupom {c.codigo}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {c.tipo === 'fixo' ? 'Fixo' : '%'}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground truncate">
                      {c.descricao || 'Cupom aplicado'}
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(c.created_at)}</div>
                  </div>

                  <div className="text-xs font-semibold">{formatBrazilianCurrency(c.valor_desconto)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum cupom utilizado"
            subtitle="Seus cupons aplicados aparecerão aqui"
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default CouponsSection;