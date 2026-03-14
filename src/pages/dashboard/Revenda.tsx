import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RevendaToggle } from '@/components/revenda/RevendaToggle';
import { useAuth } from '@/contexts/AuthContext';
import { revendaService } from '@/services/revendaService';
import { API_BASE_URL } from '@/config/apiConfig';
import { cookieUtils } from '@/utils/cookieUtils';
import { RefreshCw, Store, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';

interface RevendaHistorico {
  id: number;
  indicado_nome: string;
  indicado_email: string;
  status: string;
  plano_contratado_id: number | null;
  valor_plano: number;
  comissao_paga: number;
  total_comissao: number;
  data_ativacao_plano: string | null;
  data_pagamento_comissao: string | null;
  created_at: string;
}

interface DashboardStats {
  total_indicados: number;
  indicados_ativos: number;
  total_bonus: number;
  bonus_este_mes: number;
}

const Revenda = () => {
  const { user } = useAuth();
  const [historico, setHistorico] = useState<RevendaHistorico[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_indicados: 0,
    indicados_ativos: 0,
    total_bonus: 0,
    bonus_este_mes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const token = cookieUtils.get('session_token');
      const response = await fetch(`${API_BASE_URL}/revendas/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [REVENDA] Response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.');
        } else {
          toast.error(`Erro ao carregar dados de revenda (${response.status})`);
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [REVENDA] Dashboard data:', result);

      if (result.success && result.data) {
        setStats(result.data.stats);
        setHistorico(result.data.referrals || []);
      } else {
        toast.error(result.message || 'Erro ao processar dados');
      }
    } catch (error) {
      console.error('❌ [REVENDA] Erro ao carregar dashboard:', error);
      if (error instanceof Error && !error.message.includes('401')) {
        toast.error('Erro ao carregar dados de revenda');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch (error) {
      return '-';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      ativo: { className: 'bg-green-500', label: 'Ativo' },
      pendente: { className: 'bg-yellow-500', label: 'Pendente' },
      inativo: { className: 'bg-gray-500', label: 'Inativo' }
    };

    const variant = variants[status] || variants.pendente;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      <DashboardTitleCard title="Revenda" icon={<Store className="h-4 w-4 sm:h-5 sm:w-5" />} />
      <RevendaToggle />

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Total Indicados</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.total_indicados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Indicados Ativos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.indicados_ativos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Total Comissões</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{formatCurrency(stats.total_bonus)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Este Mês</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{formatCurrency(stats.bonus_este_mes)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Revendas */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Store className="h-4 w-4 sm:h-5 sm:w-5" />
            Histórico de Revendas
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Comissões de 10% pagas quando seus indicados ativam planos
          </p>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {historico.length > 0 ? (
            <>
              {/* Layout Desktop - Tabela */}
              <div className="hidden sm:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicado</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor Plano</TableHead>
                      <TableHead className="text-right">Comissão</TableHead>
                      <TableHead>Data Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historico.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.indicado_nome || 'Não informado'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.indicado_email || '-'}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          {item.valor_plano ? formatCurrency(item.valor_plano) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {item.comissao_paga ? formatCurrency(item.comissao_paga) : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(item.data_pagamento_comissao)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Layout Mobile - Cards */}
              <div className="sm:hidden space-y-3">
                {historico.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate flex-1">{item.indicado_nome || 'Não informado'}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.indicado_email || '-'}</p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Valor Plano</p>
                        <p className="text-sm font-medium">{item.valor_plano ? formatCurrency(item.valor_plano) : '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Comissão</p>
                        <p className="text-sm font-bold text-green-600">{item.comissao_paga ? formatCurrency(item.comissao_paga) : '-'}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pago em: {formatDate(item.data_pagamento_comissao)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Store className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="font-medium text-sm sm:text-base">Nenhuma revenda encontrada</p>
              <p className="text-xs sm:text-sm mt-2">
                Quando seus indicados ativarem planos, as comissões aparecerão aqui
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Revenda;
