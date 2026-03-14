import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Loader2,
  ShieldAlert,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import UnifiedAdminStatsCards from '@/components/dashboard/UnifiedAdminStatsCards';
import AdminRecentTransactions from '@/components/dashboard/AdminRecentTransactions';
import OnlineUsersLeaderboard from '@/components/dashboard/OnlineUsersLeaderboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useApiDashboardAdmin } from '@/hooks/useApiDashboardAdmin';
import { editarPdfService, type EditarPdfPedido } from '@/services/pdfPersonalizadoService';
import { pdfRgService, type PdfRgPedido } from '@/services/pdfRgService';

type PedidoAtencao = {
  id: string;
  origem: 'RG' | 'PDF';
  cliente: string;
  status: string;
  valor: number;
  createdAt: string;
  atrasoHoras: number;
};

const DashboardAdmin2 = () => {
  const { isSupport } = useAuth();
  const { stats, transactions, loadStats, loadTransactions, isLoading } = useApiDashboardAdmin();
  const [pedidosAtencao, setPedidosAtencao] = useState<PedidoAtencao[]>([]);
  const [isLoadingPedidos, setIsLoadingPedidos] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingPedidos(true);
      try {
        await Promise.all([loadStats(), loadTransactions(120)]);

        const [rgPendente, rgConfirmado, pdfPendente, pdfConfirmado] = await Promise.all([
          pdfRgService.listar({ status: 'realizado', limit: 30 }).catch(() => ({ success: false })),
          pdfRgService.listar({ status: 'pagamento_confirmado', limit: 30 }).catch(() => ({ success: false })),
          editarPdfService.listar({ status: 'realizado', limit: 30 }).catch(() => ({ success: false })),
          editarPdfService.listar({ status: 'pagamento_confirmado', limit: 30 }).catch(() => ({ success: false })),
        ]);

        const now = Date.now();

        const mapRg = (pedido: PdfRgPedido): PedidoAtencao => {
          const createdTime = new Date(pedido.created_at).getTime();
          return {
            id: `rg-${pedido.id}`,
            origem: 'RG',
            cliente: pedido.nome || pedido.cpf || 'Cliente não informado',
            status: pedido.status,
            valor: Number(pedido.preco_pago || 0),
            createdAt: pedido.created_at,
            atrasoHoras: Math.max(0, Math.floor((now - createdTime) / (1000 * 60 * 60))),
          };
        };

        const mapPdf = (pedido: EditarPdfPedido): PedidoAtencao => {
          const createdTime = new Date(pedido.created_at).getTime();
          return {
            id: `pdf-${pedido.id}`,
            origem: 'PDF',
            cliente: pedido.nome_solicitante || 'Cliente não informado',
            status: pedido.status,
            valor: Number(pedido.preco_pago || 0),
            createdAt: pedido.created_at,
            atrasoHoras: Math.max(0, Math.floor((now - createdTime) / (1000 * 60 * 60))),
          };
        };

        const getListData = <T,>(response: unknown): T[] => {
          if (!response || typeof response !== 'object') return [];
          const parsed = response as { success?: boolean; data?: { data?: T[] } };
          return parsed.success ? (parsed.data?.data || []) : [];
        };

        const rgPedidos = [
          ...getListData<PdfRgPedido>(rgPendente),
          ...getListData<PdfRgPedido>(rgConfirmado),
        ].map(mapRg);

        const pdfPedidos = [
          ...getListData<EditarPdfPedido>(pdfPendente),
          ...getListData<EditarPdfPedido>(pdfConfirmado),
        ].map(mapPdf);

        const ranking = [...rgPedidos, ...pdfPedidos]
          .sort((a, b) => b.atrasoHoras - a.atrasoHoras)
          .slice(0, 8);

        setPedidosAtencao(ranking);
      } finally {
        setIsLoadingPedidos(false);
      }
    };

    loadData();
  }, [loadStats, loadTransactions]);

  const recentTransactions = transactions
    .filter((t) => ['recarga', 'plano', 'compra_modulo', 'entrada', 'consulta', 'compra_login'].includes(t.type))
    .slice(0, 15);

  const calculatedRecharges = transactions.filter((t) => {
    const method = (t.payment_method || '').toLowerCase();
    const isPaymentMethod = ['pix', 'credit', 'paypal', 'cartao', 'card'].some((m) => method.includes(m));
    return t.type === 'recarga' && isPaymentMethod && t.amount > 0;
  }).reduce((sum, t) => sum + t.amount, 0);

  const referralTransactions = transactions.filter((t) => t.type === 'indicacao' && t.amount > 0);
  const calculatedReferrals = referralTransactions.length;
  const calculatedCommissions = referralTransactions.reduce((sum, t) => sum + t.amount, 0);

  const calculatedCashBalance = transactions
    .filter((t) => ['recarga', 'plano', 'compra_modulo', 'entrada', 'consulta', 'compra_login'].includes(t.type))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const adjustedStats = stats ? {
    ...stats,
    cash_balance: calculatedCashBalance || stats.cash_balance || ((stats.payment_pix || 0) + (stats.payment_card || 0) + (stats.payment_paypal || 0)),
    total_recharges: calculatedRecharges || stats.total_recharges,
    total_referrals: calculatedReferrals || stats.total_referrals,
    total_commissions: calculatedCommissions || stats.total_commissions,
  } : null;

  const fluxoData = useMemo(() => {
    const days = 14;
    const map = new Map<string, { date: string; entrada: number; saida: number }>();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, {
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        entrada: 0,
        saida: 0,
      });
    }

    transactions.forEach((t) => {
      const key = new Date(t.created_at).toISOString().slice(0, 10);
      const item = map.get(key);
      if (!item) return;

      const valor = Math.abs(Number(t.amount || 0));
      const isEntrada = Number(t.amount) > 0 || ['recarga', 'plano', 'compra_modulo', 'entrada', 'consulta', 'compra_login'].includes(t.type);

      if (isEntrada) item.entrada += valor;
      else item.saida += valor;
    });

    return Array.from(map.values());
  }, [transactions]);

  const entradas7d = useMemo(() => fluxoData.slice(-7).reduce((sum, d) => sum + d.entrada, 0), [fluxoData]);
  const saidas7d = useMemo(() => fluxoData.slice(-7).reduce((sum, d) => sum + d.saida, 0), [fluxoData]);

  const pagamentosData = useMemo(() => ([
    { name: 'PIX', value: Number(stats?.payment_pix || 0) },
    { name: 'Cartão', value: Number(stats?.payment_card || 0) },
    { name: 'PayPal', value: Number(stats?.payment_paypal || 0) },
  ]), [stats]);

  const atendimentoStats = useMemo(() => {
    const pendentes = pedidosAtencao.length;
    const criticos = pedidosAtencao.filter((p) => p.atrasoHoras >= 24).length;
    const ticket = pendentes > 0 ? pedidosAtencao.reduce((acc, p) => acc + p.valor, 0) / pendentes : 0;

    return {
      pendentes,
      criticos,
      ticket,
    };
  }, [pedidosAtencao]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const statusLabel: Record<string, string> = {
    realizado: 'Pendente',
    pagamento_confirmado: 'Pagamento confirmado',
    em_confeccao: 'Em confecção',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
  };

  if (!isSupport) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg">
          <CardContent className="py-10 text-center space-y-2">
            <ShieldAlert className="h-10 w-10 mx-auto text-destructive" />
            <h2 className="text-xl font-semibold">Acesso negado</h2>
            <p className="text-muted-foreground">Você não tem permissão para acessar este painel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardTitleCard
        title="Painel de Controle Profissional"
        subtitle="Visão executiva de entradas, saídas e pedidos prioritários"
        backTo="/dashboard/admin"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Saldo em caixa</span><Wallet className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(Number(stats?.cash_balance || 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Entradas (7 dias)</span><ArrowUpRight className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(entradas7d)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Saídas (7 dias)</span><ArrowDownRight className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(saidas7d)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Pedidos críticos</span><AlertTriangle className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">{atendimentoStats.criticos}</p>
            <p className="text-xs text-muted-foreground">{atendimentoStats.pendentes} em atenção</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fluxo de entrada e saída (14 dias)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluxoData}>
                <defs>
                  <linearGradient id="entradaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="saidaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 10, borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}
                />
                <Area type="monotone" dataKey="entrada" stroke="hsl(var(--primary))" fill="url(#entradaFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="saida" stroke="hsl(var(--destructive))" fill="url(#saidaFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição de pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pagamentosData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {pagamentosData.map((entry, index) => {
                      const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary-foreground))'];
                      return <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {pagamentosData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Pedidos que merecem atenção</CardTitle>
              <Badge variant="destructive">{atendimentoStats.criticos} críticos</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoadingPedidos ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="h-5 w-5 mx-auto animate-spin mb-2" />
                Carregando pedidos prioritários...
              </div>
            ) : pedidosAtencao.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">Sem pedidos pendentes no momento.</div>
            ) : (
              pedidosAtencao.map((pedido) => (
                <div key={pedido.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{pedido.cliente}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{pedido.origem}</Badge>
                      <span>{statusLabel[pedido.status] || pedido.status}</span>
                      <span>•</span>
                      <span>{new Date(pedido.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-semibold">{formatCurrency(pedido.valor)}</p>
                    <p className="text-xs text-destructive">{pedido.atrasoHoras}h em fila</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumo operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">Usuários online</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5" /> {Number(stats?.users_online || 0)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">Ticket médio (pedidos atenção)</p>
              <p className="text-2xl font-bold">{formatCurrency(atendimentoStats.ticket)}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">Total de usuários</p>
              <p className="text-2xl font-bold">{Number(stats?.total_users || 0)}</p>
            </div>
            <Button className="w-full" variant="outline" onClick={() => window.location.reload()} disabled={isLoading}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Atualizar painel
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comparativo de pagamentos</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pagamentosData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <Clock3 className="h-3.5 w-3.5" />
        Os dados são atualizados com base nas transações e pedidos ativos do sistema.
      </div>
    </div>
  );
};

export default DashboardAdmin2;
