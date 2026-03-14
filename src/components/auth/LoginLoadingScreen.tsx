
import React from 'react';
import LoadingScreen from '@/components/layout/LoadingScreen';

interface LoginLoadingScreenProps {
  message?: string;
  variant?: 'auth' | 'dashboard' | 'default';
}

const LoginLoadingScreen: React.FC<LoginLoadingScreenProps> = ({ 
  message = "Verificando sessão",
  variant = "auth" 
}) => {
  return (
    <LoadingScreen 
      message={message} 
      variant={variant} 
    />
  );
};

export default LoginLoadingScreen;
