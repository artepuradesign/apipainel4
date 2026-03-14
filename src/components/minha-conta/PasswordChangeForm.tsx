import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cookieUtils } from '@/utils/cookieUtils';

const PasswordChangeForm = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = (field: 'current' | 'new') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('A nova senha deve ser diferente da senha atual');
      return;
    }

    setLoading(true);
    try {
      const sessionToken = cookieUtils.get('session_token') || cookieUtils.get('api_session_token');
      
      if (!sessionToken || sessionToken === 'authenticated') {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      const requestData = {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      };

      console.log('🔄 [PASSWORD_CHANGE] Enviando requisição para alterar senha...');
      console.log('🔄 [PASSWORD_CHANGE] Request data:', { current_password: '[HIDDEN]', new_password: '[HIDDEN]' });

      const response = await fetch('https://api.apipainel.com.br/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('📨 [PASSWORD_CHANGE] Response status:', response.status);
      console.log('📨 [PASSWORD_CHANGE] Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [PASSWORD_CHANGE] Success response:', result);
        if (result.success) {
          toast.success('Senha alterada com sucesso! Redirecionando...');

          await signOut();
          cookieUtils.remove('api_session_token');
          sessionStorage.clear();
          navigate('/login', { replace: true });
          return;
        } else {
          toast.error(result.message || 'Erro ao alterar senha');
        }
      } else {
        const errorData = await response.text();
        console.error('❌ [PASSWORD_CHANGE] Response não ok:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        try {
          const jsonError = JSON.parse(errorData);
          console.error('❌ [PASSWORD_CHANGE] Error JSON:', jsonError);
          
          if (jsonError.message && jsonError.message.includes("Unknown column 'password'")) {
            toast.error(`❌ ERRO SQL IDENTIFICADO: A API está tentando acessar a coluna 'password' que não existe. 
            
A estrutura da tabela usa 'password_hash'. Entre em contato com o desenvolvedor para corrigir a query SQL.

Erro: ${jsonError.message}`);
          } else {
            toast.error(`Erro interno ao alterar senha: ${jsonError.message || jsonError.error || 'Erro desconhecido'}`);
          }
        } catch {
          if (response.status === 401) {
            toast.error('Senha atual incorreta');
          } else if (response.status === 404) {
            toast.error('Serviço não encontrado. Entre em contato com o suporte.');
          } else if (response.status === 500) {
            toast.error('Erro interno do servidor. A estrutura do banco pode estar incorreta. Entre em contato com o suporte.');
          } else {
            toast.error(`Erro interno ao alterar senha: ${response.status} - ${response.statusText}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ [PASSWORD_CHANGE] Erro ao alterar senha:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Erro de conexão: Verifique sua internet');
      } else {
        toast.error('Erro interno ao alterar senha: ' + (error instanceof Error ? error.message : String(error)));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Key className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />
          Alterar Senha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="current_password" className="text-sm">Senha Atual *</Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Digite sua senha atual"
                className="pr-10 text-sm sm:text-base"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="new_password" className="text-sm">Nova Senha *</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                className="pr-10 text-sm sm:text-base"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handlePasswordChange}
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
            className="w-full bg-brand-purple hover:bg-brand-darkPurple text-sm sm:text-base"
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordChangeForm;
