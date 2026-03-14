import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Package, FileEdit } from 'lucide-react';
import { pdfRgService, type PdfRgPedido } from '@/services/pdfRgService';
import { editarPdfService, type EditarPdfPedido } from '@/services/pdfPersonalizadoService';

interface PdfOrder {
  id: string;
  type: 'pdf_rg' | 'pdf_personalizado';
  description: string;
  amount: number;
  status: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  realizado: 'Realizado',
  pagamento_confirmado: 'Pgto Confirmado',
  em_confeccao: 'Em Confecção',
  entregue: 'Entregue',
};

const PdfOrdersHistorySection = () => {
  const [orders, setOrders] = useState<PdfOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rgRes, persRes] = await Promise.allSettled([
          pdfRgService.listar({ limit: 100 }),
          editarPdfService.listar({ limit: 100 }),
        ]);

        const unified: PdfOrder[] = [];

        if (rgRes.status === 'fulfilled' && rgRes.value.success && rgRes.value.data) {
          rgRes.value.data.data.forEach((p: PdfRgPedido) => {
            unified.push({
              id: `rg_${p.id}`,
              type: 'pdf_rg',
              description: `PDF RG - ${p.nome || p.cpf}`,
              amount: p.preco_pago,
              status: p.status,
              created_at: p.created_at,
            });
          });
        }

        if (persRes.status === 'fulfilled' && persRes.value.success && persRes.value.data) {
          persRes.value.data.data.forEach((p: EditarPdfPedido) => {
            unified.push({
              id: `pers_${p.id}`,
              type: 'pdf_personalizado',
              description: `PDF Personalizado - ${p.nome_solicitante}`,
              amount: p.preco_pago,
              status: p.status,
              created_at: p.created_at,
            });
          });
        }

        unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(unified);
      } catch (e) {
        console.error('Erro ao carregar pedidos PDF:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Carregando pedidos...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum pedido de PDF registrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div
          key={order.id}
          className={`border rounded-lg p-3 bg-card border-l-4 ${
            order.type === 'pdf_rg' ? 'border-l-blue-500' : 'border-l-violet-500'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium">{order.description}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 h-4 ${
                    order.type === 'pdf_rg'
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                      : 'bg-violet-500/10 text-violet-600 border-violet-500/30'
                  }`}
                >
                  {order.type === 'pdf_rg' ? 'PDF RG' : 'PDF Personalizado'}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {statusLabels[order.status] || order.status}
                </Badge>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-xs font-semibold px-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 flex-shrink-0"
            >
              {formatCurrency(order.amount)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PdfOrdersHistorySection;
