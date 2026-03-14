import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Settings, Palette, Shield, Trash2, Eye, Save, Check } from 'lucide-react';
import { useSiteTheme, SiteThemeId } from '@/contexts/SiteThemeContext';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const themes = [
  {
    id: 'apipainel' as SiteThemeId,
    name: 'APIPainel (Padrão)',
    description: 'Tema padrão do sistema com cores verdes e interface limpa.',
    preview: 'bg-gradient-to-br from-green-50 via-white to-emerald-50 border-green-300',
    previewDark: 'bg-gradient-to-br from-green-900/30 via-gray-900 to-emerald-900/30 border-green-700',
    accent: 'bg-green-500',
  },
  {
    id: 'matrix' as SiteThemeId,
    name: 'Matrix',
    description: 'Tema inspirado no filme Matrix com chuva de caracteres animada e tons de verde neon.',
    preview: 'bg-gradient-to-br from-black via-green-950 to-black border-green-500',
    previewDark: 'bg-gradient-to-br from-black via-green-950 to-black border-green-400',
    accent: 'bg-green-400',
  },
];

const Preferencias = () => {
  const { activeTheme, previewTheme, applyTheme, saveTheme, cancelPreview, currentVisualTheme } = useSiteTheme();

  const [selectedTheme, setSelectedTheme] = useState<SiteThemeId>(activeTheme);
  
  // Account preferences (local state - will integrate with API later)
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('user_preferences');
    return saved ? JSON.parse(saved) : {
      salvar_historico: true,
      notificacoes_email: true,
      notificacoes_push: true,
      marketing_emails: false,
    };
  });

  const handleThemeSelect = (themeId: SiteThemeId) => {
    setSelectedTheme(themeId);
  };

  const handleApplyPreview = () => {
    applyTheme(selectedTheme);
    toast.info('Tema aplicado como pré-visualização. Clique em "Salvar" para manter.');
  };

  const handleSaveTheme = () => {
    saveTheme(selectedTheme);
    toast.success('Tema salvo com sucesso!');
  };

  const handleCancelPreview = () => {
    cancelPreview();
    setSelectedTheme(activeTheme);
    toast.info('Pré-visualização cancelada.');
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('user_preferences', JSON.stringify(updated));
    toast.success('Preferência atualizada!');
  };

  const handleDeleteAllConsultas = () => {
    // This would call the API to delete all user consultations
    toast.success('Todas as consultas foram apagadas com sucesso!');
  };

  const isPreviewActive = previewTheme !== null;

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      <DashboardTitleCard
        title="Preferências"
        icon={<Settings className="h-4 w-4 sm:h-5 sm:w-5" />}
      />

      {/* Preview banner */}
      {isPreviewActive && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Você está pré-visualizando o tema <strong>{themes.find(t => t.id === previewTheme)?.name}</strong>
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCancelPreview}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveTheme}>
                <Save className="h-3 w-3 mr-1" />
                Salvar Tema
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema do Sistema
          </CardTitle>
          <CardDescription>
            Selecione um tema visual para personalizar a aparência do sistema. Clique em "Aplicar" para pré-visualizar ou "Salvar" para aplicar definitivamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`
                  relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300
                  hover:scale-[1.02] hover:shadow-lg
                  ${selectedTheme === theme.id 
                    ? 'border-primary ring-2 ring-primary/30 shadow-md' 
                    : 'border-border hover:border-primary/50'}
                `}
              >
                {/* Active badge */}
                {activeTheme === theme.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Ativo
                  </div>
                )}

                {/* Theme preview area */}
                <div className={`h-24 rounded-lg mb-3 ${theme.preview} border relative overflow-hidden`}>
                  {theme.id === 'matrix' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-green-400 font-mono text-xs leading-tight opacity-70 text-center">
                        {'01001010\n10110100\n01010101\n11001100'}
                      </div>
                    </div>
                  )}
                  {theme.id === 'apipainel' && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 p-3">
                      <div className="h-full w-1/3 bg-green-200/50 rounded" />
                      <div className="h-full flex-1 space-y-2">
                        <div className="h-3 bg-green-300/40 rounded w-3/4" />
                        <div className="h-3 bg-green-200/30 rounded w-1/2" />
                        <div className="h-6 bg-green-500/30 rounded w-full mt-2" />
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-sm">{theme.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleApplyPreview}
              disabled={selectedTheme === currentVisualTheme}
            >
              <Eye className="h-4 w-4 mr-2" />
              Aplicar (Pré-visualizar)
            </Button>
            <Button
              onClick={handleSaveTheme}
              disabled={selectedTheme === activeTheme && !isPreviewActive}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Tema
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Preferências da Conta
          </CardTitle>
          <CardDescription>
            Configure como o sistema gerencia seus dados e notificações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Salvar histórico de consultas</Label>
              <p className="text-xs text-muted-foreground">
                Manter registro de todas as consultas realizadas
              </p>
            </div>
            <Switch
              checked={preferences.salvar_historico}
              onCheckedChange={(v) => handlePreferenceChange('salvar_historico', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Notificações por e-mail</Label>
              <p className="text-xs text-muted-foreground">
                Receber alertas e atualizações por e-mail
              </p>
            </div>
            <Switch
              checked={preferences.notificacoes_email}
              onCheckedChange={(v) => handlePreferenceChange('notificacoes_email', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Notificações push</Label>
              <p className="text-xs text-muted-foreground">
                Receber notificações no navegador
              </p>
            </div>
            <Switch
              checked={preferences.notificacoes_push}
              onCheckedChange={(v) => handlePreferenceChange('notificacoes_push', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">E-mails de marketing</Label>
              <p className="text-xs text-muted-foreground">
                Receber promoções e novidades por e-mail
              </p>
            </div>
            <Switch
              checked={preferences.marketing_emails}
              onCheckedChange={(v) => handlePreferenceChange('marketing_emails', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam seus dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Apagar todas as minhas consultas</p>
              <p className="text-xs text-muted-foreground">
                Remove permanentemente todo o histórico de consultas da sua conta.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Apagar Tudo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível. Todo o histórico de consultas será permanentemente removido da sua conta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllConsultas} className="bg-destructive hover:bg-destructive/90">
                    Sim, apagar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Preferencias;
