
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import PageLayout from '@/components/layout/PageLayout';
import LoginForm from '@/components/auth/LoginForm';
import LoginLoadingScreen from '@/components/auth/LoginLoadingScreen';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginFooter from '@/components/auth/LoginFooter';
import SuspendedAccountAlert from '@/components/auth/SuspendedAccountAlert';
import InactiveAccountAlert from '@/components/auth/InactiveAccountAlert';
import PendingAccountAlert from '@/components/auth/PendingAccountAlert';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuspendedAlert, setShowSuspendedAlert] = useState(false);
  const [showInactiveAlert, setShowInactiveAlert] = useState(false);
  const [showPendingAlert, setShowPendingAlert] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();

  // Se usuário já logado, redirecionar IMEDIATAMENTE
  useEffect(() => {
    if (!loading && user) {
      console.log('✅ [LOGIN] Usuário já logado, redirecionando IMEDIATAMENTE...');
      const redirectTo = user.user_role === 'suporte' ? '/dashboard/admin' : '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate]);

  // Carregar credenciais salvas apenas dos cookies
  useEffect(() => {
    if (!loading && !user) {
      const savedEmail = localStorage.getItem('saved_email');

      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
        setRememberMe(true);
      }
    }
  }, [loading, user]);

  // Mostrar loading durante verificação apenas
  if (loading) {
    return <LoginLoadingScreen />;
  }

  // Se usuário já logado, não mostrar form
  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Preencha email e senha');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔄 [LOGIN] Tentando login...');
      
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ [LOGIN] Login realizado com sucesso!');
        
        if (rememberMe) {
          localStorage.setItem('saved_email', formData.email);
        } else {
          localStorage.removeItem('saved_email');
        }
        
        if (result.redirectTo) {
          console.log('🎯 [LOGIN] Redirecionando diretamente para:', result.redirectTo);
          navigate(result.redirectTo, { replace: true });
        }
        
      } else {
        console.error('❌ [LOGIN] Falha no login:', result.message, 'Status code:', result.statusCode);
        
        // Verificar status específico da conta
        if (result.statusCode === 'account_suspended') {
          setShowSuspendedAlert(true);
        } else if (result.statusCode === 'account_inactive') {
          setShowInactiveAlert(true);
        } else if (result.statusCode === 'account_pending') {
          setShowPendingAlert(true);
        } else {
          toast.error(result.message || 'Email ou senha incorretos');
        }
      }
    } catch (error) {
      console.error('❌ [LOGIN] Erro no processo:', error);
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToRegister = () => {
    navigate('/registration');
  };

  return (
    <PageLayout variant="auth" backgroundOpacity="strong" showGradients={false}>
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm relative z-10" data-aos="fade-up">
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/30 dark:bg-gray-800/95 dark:border-gray-700/50 relative">
            <LoginHeader />

            <LoginForm
              formData={formData}
              setFormData={setFormData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
            
            <LoginFooter onNavigateToRegister={navigateToRegister} />
          </div>
        </div>
      </div>

      <SuspendedAccountAlert isOpen={showSuspendedAlert} onClose={() => setShowSuspendedAlert(false)} />
      <InactiveAccountAlert isOpen={showInactiveAlert} onClose={() => setShowInactiveAlert(false)} />
      <PendingAccountAlert isOpen={showPendingAlert} onClose={() => setShowPendingAlert(false)} />
    </PageLayout>
  );
};

export default Login;
