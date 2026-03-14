import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { pdfRgService, PdfRgPedido, PdfRgStatus } from '@/services/pdfRgService';
import { editarPdfService, EditarPdfPedido } from '@/services/pdfPersonalizadoService';
import { qrcodeRegistrationsService, type QrRegistration } from '@/services/qrcodeRegistrationsService';
import { Search, Eye, Trash2, RefreshCw, Download, Loader2, Upload, Package, DollarSign, Hammer, CheckCircle, X, FileEdit } from 'lucide-react';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import QrCadastroCard from '@/components/qrcode/QrCadastroCard';
import { getFullApiUrl } from '@/utils/apiHelper';
import { cookieUtils } from '@/utils/cookieUtils';

const STATUS_ORDER: PdfRgStatus[] = ['realizado', 'pagamento_confirmado', 'em_confeccao', 'entregue'];

const statusLabels: Record<PdfRgStatus, string> = {
  realizado: 'Pedido Realizado',
  pagamento_confirmado: 'Pagamento Confirmado',
  em_confeccao: 'Em Confecção',
  entregue: 'Entregue',
};

const statusIcons: Record<PdfRgStatus, React.ReactNode> = {
  realizado: <Package className="h-5 w-5" />,
  pagamento_confirmado: <DollarSign className="h-5 w-5" />,
  em_confeccao: <Hammer className="h-5 w-5" />,
  entregue: <CheckCircle className="h-5 w-5" />,
};

const statusColors: Record<PdfRgStatus, string> = {
  realizado: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  pagamento_confirmado: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  em_confeccao: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  entregue: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
};

const formatDateBR = (dateStr: string | null) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
};

const formatTime = (dateString: string | null) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const getStatusIndex = (status: PdfRgStatus) => STATUS_ORDER.indexOf(status);

type UnifiedPedido = {
  type: 'pdf-rg' | 'pdf-personalizado';
  id: number;
  status: PdfRgStatus;
  label: string;
  sublabel: string;
  created_at: string;
  preco_pago: number;
  realizado_at: string | null;
  pagamento_confirmado_at: string | null;
  em_confeccao_at: string | null;
  entregue_at: string | null;
  pdf_entrega_nome?: string | null;
  raw_rg?: PdfRgPedido;
  raw_personalizado?: EditarPdfPedido;
};

const getStepTimestamp = (pedido: UnifiedPedido, step: PdfRgStatus): string | null => {
  const map: Record<PdfRgStatus, string | null> = {
    realizado: pedido.realizado_at,
    pagamento_confirmado: pedido.pagamento_confirmado_at,
    em_confeccao: pedido.em_confeccao_at,
    entregue: pedido.entregue_at,
  };
  return map[step];
};

const StatusProgressCircles = ({
  pedido,
  onClickStep,
  disabled,
}: {
  pedido: UnifiedPedido;
  onClickStep?: (step: PdfRgStatus) => void;
  disabled?: boolean;
}) => {
  const currentIdx = getStatusIndex(pedido.status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-[12%] right-[12%] h-1 bg-muted rounded-full" />
        <div
          className="absolute top-5 left-[12%] h-1 rounded-full transition-all duration-500 bg-emerald-500"
          style={{ width: `${Math.max(0, (currentIdx / 3) * 76)}%` }}
        />

        {STATUS_ORDER.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isActive = idx <= currentIdx;
          const isEmConfeccao = step === 'em_confeccao' && isCurrent;
          const canClick = onClickStep && step !== pedido.status && !disabled;
          const timestamp = getStepTimestamp(pedido, step);

          return (
            <div key={step} className="flex flex-col items-center z-10 flex-1">
              <button
                type="button"
                onClick={() => canClick && onClickStep?.(step)}
                disabled={!canClick}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted || (isCurrent && step === 'entregue')
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : isEmConfeccao
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse'
                    : isCurrent
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''} ${
                  canClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                }`}
              >
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : statusIcons[step]}
              </button>
              <span className={`text-[10px] mt-2 text-center leading-tight max-w-[80px] ${
                isActive
                  ? (isEmConfeccao ? 'text-blue-600 font-semibold' : 'text-emerald-600 font-semibold')
                  : 'text-muted-foreground'
              }`}>
                {statusLabels[step]}
              </span>
              {timestamp && isActive && (
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  {formatTime(timestamp)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState<UnifiedPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const urlParams = new URLSearchParams(window.location.search);
  const initialStatus = urlParams.get('status') || 'all';
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [selectedPedido, setSelectedPedido] = useState<UnifiedPedido | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingPdf, setDeletingPdf] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [qrCadastroSelecionado, setQrCadastroSelecionado] = useState<QrRegistration | null>(null);
  const [qrCadastroLoading, setQrCadastroLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadQrCadastroByPedido = useCallback(async (pedido: PdfRgPedido) => {
    setQrCadastroLoading(true);
    setQrCadastroSelecionado(null);

    try {
      const pedidoCpf = qrcodeRegistrationsService.normalizeDigits(pedido.cpf || '');
      const pedidoPlano = (pedido.qr_plan || '1m') as '1m' | '3m' | '6m';

      const selecionarMatch = (registros: QrRegistration[]) => {
        const porCpf = registros.filter(
          (registro) => qrcodeRegistrationsService.normalizeDigits(registro.document_number || '') === pedidoCpf,
        );
        return porCpf.find((registro) => registro.inferred_plan === pedidoPlano) || porCpf[0] || null;
      };

      const registrosPorUsuario = await qrcodeRegistrationsService.list({
        limit: 100,
        ...(pedido.user_id ? { idUser: String(pedido.user_id) } : {}),
      });

      let match = selecionarMatch(registrosPorUsuario);

      if (!match && pedido.user_id) {
        const registrosGlobais = await qrcodeRegistrationsService.list({ limit: 100 });
        match = selecionarMatch(registrosGlobais);
      }

      setQrCadastroSelecionado(match);
    } catch {
      setQrCadastroSelecionado(null);
    } finally {
      setQrCadastroLoading(false);
    }
  }, []);

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const results: UnifiedPedido[] = [];
      let totalCount = 0;

      // Fetch pdf-rg orders
      if (typeFilter === 'all' || typeFilter === 'pdf-rg') {
        const res = await pdfRgService.listar(params);
        if (res.success && res.data) {
          res.data.data.forEach((p: PdfRgPedido) => {
            results.push({
              type: 'pdf-rg',
              id: p.id,
              status: p.status,
              label: p.cpf,
              sublabel: p.nome || '',
              created_at: p.created_at,
              preco_pago: p.preco_pago,
              realizado_at: p.realizado_at,
              pagamento_confirmado_at: p.pagamento_confirmado_at,
              em_confeccao_at: p.em_confeccao_at,
              entregue_at: p.entregue_at,
              raw_rg: p,
            });
          });
          totalCount += res.data.pagination.total;
        }
      }

      // Fetch pdf-personalizado orders
      if (typeFilter === 'all' || typeFilter === 'pdf-personalizado') {
        const res2 = await editarPdfService.listar(params);
        if (res2.success && res2.data) {
          res2.data.data.forEach((p: EditarPdfPedido) => {
            results.push({
              type: 'pdf-personalizado',
              id: p.id,
              status: p.status,
              label: p.nome_solicitante,
              sublabel: p.descricao_alteracoes?.substring(0, 60) || '',
              created_at: p.created_at,
              preco_pago: p.preco_pago,
              realizado_at: p.realizado_at,
              pagamento_confirmado_at: p.pagamento_confirmado_at,
              em_confeccao_at: p.em_confeccao_at,
              entregue_at: p.entregue_at,
              raw_personalizado: p,
            });
          });
          totalCount += res2.data.pagination.total;
        }
      }

      // Sort by created_at desc
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPedidos(results);
      setTotal(totalCount);
    } catch (e) {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  const handleViewDetail = async (pedido: UnifiedPedido) => {
    setDetailLoading(true);
    setPdfFile(null);
    try {
      if (pedido.type === 'pdf-rg') {
        const res = await pdfRgService.obter(pedido.id);
        if (res.success && res.data) {
          setSelectedPedido({
            ...pedido,
            pdf_entrega_nome: res.data.pdf_entrega_nome || null,
            raw_rg: res.data,
          });
          await loadQrCadastroByPedido(res.data);
        } else {
          toast.error('Erro ao carregar detalhes');
          setQrCadastroSelecionado(null);
        }
      } else {
        const res = await editarPdfService.obter(pedido.id);
        if (res.success && res.data) {
          setSelectedPedido({
            ...pedido,
            pdf_entrega_nome: res.data.pdf_entrega_nome || null,
            raw_personalizado: res.data,
          });
        } else {
          toast.error('Erro ao carregar detalhes');
        }
        setQrCadastroSelecionado(null);
      }
    } catch (e) {
      toast.error('Erro ao carregar detalhes');
    } finally {
      setDetailLoading(false);
    }
  };

  const sendNotification = async (userId: number | null, pedidoId: number, newStatus: PdfRgStatus, pedidoType: string) => {
    if (!userId) return;
    try {
      const token = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      const typeLabel = pedidoType === 'pdf-personalizado' ? 'PDF Personalizado' : 'PDF RG';
      await fetch(getFullApiUrl('/notifications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: userId,
          type: 'pedido_status',
          title: `${typeLabel} #${pedidoId} - ${statusLabels[newStatus]}`,
          message: `Seu pedido ${typeLabel} #${pedidoId} teve o status atualizado para: ${statusLabels[newStatus]}.${newStatus === 'entregue' ? ' O arquivo PDF está disponível para download.' : ''}`,
          priority: newStatus === 'entregue' ? 'high' : 'medium',
        }),
      });
    } catch (e) {
      console.error('Erro ao enviar notificação:', e);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
      reader.readAsDataURL(file);
    });

  const handleUpdateStatus = async (newStatus: PdfRgStatus) => {
    if (!selectedPedido) return;

    if (newStatus === 'entregue' && !pdfFile && !getExistingPdfNome()) {
      toast.error('É obrigatório enviar o arquivo PDF para marcar como Entregue.');
      return;
    }

    setUpdatingStatus(true);
    try {
      const extraData: any = {};

      if (pdfFile) {
        const base64 = await fileToBase64(pdfFile);
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        const fileName = `${selectedPedido.id}_${dateStr}.pdf`;
        extraData.pdf_entrega_base64 = base64;
        extraData.pdf_entrega_nome = fileName;
      }

      let res;
      const userId = selectedPedido.type === 'pdf-rg'
        ? selectedPedido.raw_rg?.user_id
        : selectedPedido.raw_personalizado?.user_id;

      if (selectedPedido.type === 'pdf-rg') {
        res = await pdfRgService.atualizarStatus(selectedPedido.id, newStatus, Object.keys(extraData).length > 0 ? extraData : undefined);
      } else {
        res = await editarPdfService.atualizarStatus(selectedPedido.id, newStatus, Object.keys(extraData).length > 0 ? extraData : undefined);
      }

      if (res.success) {
        toast.success(`Status atualizado para: ${statusLabels[newStatus]}`);
        await sendNotification(userId || null, selectedPedido.id, newStatus, selectedPedido.type);
        loadPedidos();
        // Re-fetch detail
        if (selectedPedido.type === 'pdf-rg') {
          const detail = await pdfRgService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? {
              ...prev,
              status: detail.data!.status,
              realizado_at: detail.data!.realizado_at,
              pagamento_confirmado_at: detail.data!.pagamento_confirmado_at,
              em_confeccao_at: detail.data!.em_confeccao_at,
              entregue_at: detail.data!.entregue_at,
              raw_rg: detail.data!,
            } : null);
          }
        } else {
          const detail = await editarPdfService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? {
              ...prev,
              status: detail.data!.status,
              realizado_at: detail.data!.realizado_at,
              pagamento_confirmado_at: detail.data!.pagamento_confirmado_at,
              em_confeccao_at: detail.data!.em_confeccao_at,
              entregue_at: detail.data!.entregue_at,
              raw_personalizado: detail.data!,
            } : null);
          }
        }
        setPdfFile(null);
      } else {
        toast.error(res.error || 'Erro ao atualizar status');
      }
    } catch (e) {
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getExistingPdfNome = () => {
    if (!selectedPedido) return null;
    // Check unified field first (updated after save), then raw data
    if (selectedPedido.pdf_entrega_nome) return selectedPedido.pdf_entrega_nome;
    if (selectedPedido.type === 'pdf-rg') return selectedPedido.raw_rg?.pdf_entrega_nome;
    return selectedPedido.raw_personalizado?.pdf_entrega_nome;
  };

  const getExistingPdfBase64 = () => {
    if (!selectedPedido) return null;
    if (selectedPedido.type === 'pdf-rg') return selectedPedido.raw_rg?.pdf_entrega_base64;
    return selectedPedido.raw_personalizado?.pdf_entrega_base64;
  };

  const handleDeletePdf = async () => {
    if (!selectedPedido) return;
    if (!confirm('Tem certeza que deseja excluir o PDF? O pedido voltará para Em Confecção (produção).')) return;

    setDeletingPdf(true);
    try {
      const targetStatus: PdfRgStatus = 'em_confeccao';
      const extraData = { remove_pdf: true };

      const res = selectedPedido.type === 'pdf-rg'
        ? await pdfRgService.atualizarStatus(selectedPedido.id, targetStatus, extraData)
        : await editarPdfService.atualizarStatus(selectedPedido.id, targetStatus, extraData);

      if (res.success) {
        toast.success('PDF excluído e pedido retornado para Em Confecção.');

        if (selectedPedido.type === 'pdf-rg') {
          const detail = await pdfRgService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? {
              ...prev,
              status: detail.data.status,
              pdf_entrega_nome: detail.data.pdf_entrega_nome || null,
              realizado_at: detail.data.realizado_at,
              pagamento_confirmado_at: detail.data.pagamento_confirmado_at,
              em_confeccao_at: detail.data.em_confeccao_at,
              entregue_at: detail.data.entregue_at,
              raw_rg: detail.data,
            } : null);
          }
        } else {
          const detail = await editarPdfService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? {
              ...prev,
              status: detail.data.status,
              pdf_entrega_nome: detail.data.pdf_entrega_nome || null,
              realizado_at: detail.data.realizado_at,
              pagamento_confirmado_at: detail.data.pagamento_confirmado_at,
              em_confeccao_at: detail.data.em_confeccao_at,
              entregue_at: detail.data.entregue_at,
              raw_personalizado: detail.data,
            } : null);
          }
        }

        setPdfFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadPedidos();
      } else {
        toast.error(res.error || 'Erro ao excluir PDF');
      }
    } catch {
      toast.error('Erro ao excluir PDF');
    } finally {
      setDeletingPdf(false);
    }
  };

  const handleSavePdf = async () => {
    if (!selectedPedido || !pdfFile) return;
    setSavingPdf(true);
    try {
      const base64 = await fileToBase64(pdfFile);
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const fileName = `${selectedPedido.id}_${dateStr}.pdf`;
      const extraData = { pdf_entrega_base64: base64, pdf_entrega_nome: fileName };

      let res;
      if (selectedPedido.type === 'pdf-rg') {
        res = await pdfRgService.atualizarStatus(selectedPedido.id, selectedPedido.status, extraData);
      } else {
        res = await editarPdfService.atualizarStatus(selectedPedido.id, selectedPedido.status, extraData);
      }

      if (res.success) {
        toast.success('PDF de entrega salvo com sucesso!');
        // Re-fetch detail and update selectedPedido with new pdf name
        if (selectedPedido.type === 'pdf-rg') {
          const detail = await pdfRgService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? { ...prev, pdf_entrega_nome: detail.data!.pdf_entrega_nome || fileName, raw_rg: detail.data! } : null);
          } else {
            setSelectedPedido(prev => prev ? { ...prev, pdf_entrega_nome: fileName } : null);
          }
        } else {
          const detail = await editarPdfService.obter(selectedPedido.id);
          if (detail.success && detail.data) {
            setSelectedPedido(prev => prev ? { ...prev, pdf_entrega_nome: detail.data!.pdf_entrega_nome || fileName, raw_personalizado: detail.data! } : null);
          } else {
            setSelectedPedido(prev => prev ? { ...prev, pdf_entrega_nome: fileName } : null);
          }
        }
        setPdfFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadPedidos();
      } else {
        toast.error(res.error || 'Erro ao salvar PDF');
      }
    } catch {
      toast.error('Erro ao salvar PDF');
    } finally {
      setSavingPdf(false);
    }
  };

  const handleDelete = async (pedido: UnifiedPedido) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      let res;
      if (pedido.type === 'pdf-rg') {
        res = await pdfRgService.deletar(pedido.id);
      } else {
        res = await editarPdfService.deletar(pedido.id);
      }
      if (res.success) {
        toast.success('Pedido excluído');
        loadPedidos();
        if (selectedPedido?.id === pedido.id && selectedPedido?.type === pedido.type) setSelectedPedido(null);
      } else {
        toast.error(res.error || 'Erro ao excluir');
      }
    } catch (e) {
      toast.error('Erro ao excluir');
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx 20MB)');
      return;
    }
    setPdfFile(file);
  };

  const typeLabel = (type: string) => type === 'pdf-rg' ? 'PDF RG' : 'PDF Personalizado';

  const renderDetailContent = () => {
    if (!selectedPedido) return null;

    if (selectedPedido.type === 'pdf-rg' && selectedPedido.raw_rg) {
      const p = selectedPedido.raw_rg;
      return (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">CPF:</span> {p.cpf}</div>
          <div><span className="text-muted-foreground">Nome:</span> {p.nome || '—'}</div>
          <div><span className="text-muted-foreground">Nascimento:</span> {formatDateBR(p.dt_nascimento)}</div>
          <div><span className="text-muted-foreground">Naturalidade:</span> {p.naturalidade || '—'}</div>
          <div><span className="text-muted-foreground">Mãe:</span> {p.filiacao_mae || '—'}</div>
          <div><span className="text-muted-foreground">Pai:</span> {p.filiacao_pai || '—'}</div>
          <div><span className="text-muted-foreground">Preço:</span> R$ {Number(p.preco_pago || 0).toFixed(2)}</div>
          <div>
            <span className="text-muted-foreground">Status:</span>{' '}
            <Badge variant="outline" className={statusColors[p.status] || ''}>
              {statusLabels[p.status] || p.status}
            </Badge>
          </div>
        </div>
      );
    }

    if (selectedPedido.type === 'pdf-personalizado' && selectedPedido.raw_personalizado) {
      const p = selectedPedido.raw_personalizado;
      return (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Solicitante:</span> {p.nome_solicitante}</div>
          <div><span className="text-muted-foreground">Preço:</span> R$ {Number(p.preco_pago || 0).toFixed(2)}</div>
          <div className="col-span-2"><span className="text-muted-foreground">Descrição:</span> {p.descricao_alteracoes}</div>
          <div>
            <span className="text-muted-foreground">Status:</span>{' '}
            <Badge variant="outline" className={statusColors[p.status] || ''}>
              {statusLabels[p.status] || p.status}
            </Badge>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderAnexos = () => {
    if (!selectedPedido) return null;
    const raw = selectedPedido.type === 'pdf-rg' ? selectedPedido.raw_rg : selectedPedido.raw_personalizado;
    if (!raw) return null;

    return (
      <div>
        <p className="text-sm font-medium mb-2">Anexos:</p>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3].map(i => {
            const nome = (raw as any)[`anexo${i}_nome`];
            if (!nome) return null;
            // Construir URL de download do servidor
            const downloadUrl = getFullApiUrl(`/upload/serve?file=${encodeURIComponent(nome)}`);
            return (
              <Badge key={i} variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80">
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <Download className="h-3 w-3" /> Anexo {i}
                </a>
              </Badge>
            );
          })}
        </div>
      </div>
    );
  };

  const existingPdfNome = getExistingPdfNome();

  return (
    <div className="space-y-6">
      <DashboardTitleCard
        title="Gerenciar Pedidos"
        icon={<Package className="h-4 w-4 sm:h-5 sm:w-5" />}
        backTo="/dashboard/admin"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por CPF, nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="pdf-rg">PDF RG</SelectItem>
            <SelectItem value="pdf-personalizado">PDF Personalizado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="realizado">Pedido Realizado</SelectItem>
            <SelectItem value="pagamento_confirmado">Pagamento Confirmado</SelectItem>
            <SelectItem value="em_confeccao">Em Confecção</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={loadPedidos}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pedidos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum pedido encontrado.</p>
          ) : (
            <div className="space-y-3">
              {pedidos.map((p) => (
                <div
                  key={`${p.type}-${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={p.type === 'pdf-personalizado' ? 'bg-violet-500/10 text-violet-600 border-violet-500/30' : 'bg-sky-500/10 text-sky-600 border-sky-500/30'}>
                        {p.type === 'pdf-personalizado' ? <FileEdit className="h-3 w-3 mr-1" /> : <Package className="h-3 w-3 mr-1" />}
                        {typeLabel(p.type)}
                      </Badge>
                      <span className="font-medium text-sm">#{p.id}</span>
                      <span className="text-sm">{p.label}</span>
                      {p.sublabel && <span className="text-sm text-muted-foreground truncate max-w-[200px]">— {p.sublabel}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={statusColors[p.status] || ''}>
                        {statusLabels[p.status] || p.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetail(p)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedPedido}
        onOpenChange={() => {
          setSelectedPedido(null);
          setPdfFile(null);
          setQrCadastroSelecionado(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 pr-8">
              <DialogTitle className="flex items-center gap-2">
                <Badge variant="outline" className={selectedPedido?.type === 'pdf-personalizado' ? 'bg-violet-500/10 text-violet-600 border-violet-500/30' : 'bg-sky-500/10 text-sky-600 border-sky-500/30'}>
                  {selectedPedido ? typeLabel(selectedPedido.type) : ''}
                </Badge>
                Pedido #{selectedPedido?.id}
              </DialogTitle>
              {existingPdfNome && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/10 flex-shrink-0"
                  onClick={() => {
                    const url = getFullApiUrl(`/upload/delivery?file=${encodeURIComponent(existingPdfNome)}`);
                    window.open(url, '_blank');
                  }}
                  title={`Baixar: ${existingPdfNome}`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs">Baixar PDF</span>
                </Button>
              )}
            </div>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : selectedPedido && (
            <div className="space-y-5">
              <StatusProgressCircles pedido={selectedPedido} />

              {renderDetailContent()}
              {renderAnexos()}

              {selectedPedido.type === 'pdf-rg' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Cadastro QR vinculado:</p>
                  {qrCadastroLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Carregando QR Code...
                    </div>
                  ) : qrCadastroSelecionado ? (
                    <QrCadastroCard registration={qrCadastroSelecionado} />
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhum cadastro QR encontrado para este pedido.</p>
                  )}
                </div>
              )}

              {/* PDF Upload for delivery */}
              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Gerenciar PDF de Entrega
                  {selectedPedido.status !== 'entregue' && <span className="text-xs text-destructive">(obrigatório para Entregue)</span>}
                </Label>

                {existingPdfNome && !pdfFile && (
                  <div className="flex items-center justify-between bg-background rounded-md p-2 border gap-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      PDF atual: <strong>{existingPdfNome}</strong>
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7"
                      onClick={handleDeletePdf}
                      disabled={deletingPdf}
                      title="Excluir PDF e voltar para produção"
                    >
                      {deletingPdf ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                      {deletingPdf ? 'Excluindo...' : 'Excluir (voltar produção)'}
                    </Button>
                  </div>
                )}

                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="cursor-pointer"
                />
                {pdfFile && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> {pdfFile.name}
                    </p>
                    <Button
                      size="sm"
                      onClick={handleSavePdf}
                      disabled={savingPdf}
                      className="gap-1"
                    >
                      {savingPdf ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      {savingPdf ? 'Atualizando...' : 'Atualizar PDF'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Atualizar Status:</p>
                <p className="text-xs text-muted-foreground">Clique em uma etapa para atualizar o status do pedido.</p>
                <StatusProgressCircles
                  pedido={selectedPedido}
                  onClickStep={handleUpdateStatus}
                  disabled={updatingStatus}
                />

                {updatingStatus && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Atualizando...
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPedidos;
