
import React from 'react';
import { Link } from 'react-router-dom';
import RegistrationCard from './RegistrationCard';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import TextLogo from '@/components/TextLogo';
import PageLayout from '@/components/layout/PageLayout';

interface RegistrationContainerProps {
  onNavigateToLogin?: () => void;
}

const RegistrationContainer = ({ onNavigateToLogin }: RegistrationContainerProps) => {
  const handleNavigateToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Clique em "Faça login" detectado');
    
    if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  return (
    <PageLayout variant="auth" backgroundOpacity="strong" showGradients={false}>
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-sm relative z-10" data-aos="fade-up">
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/30 dark:bg-gray-800/95 dark:border-gray-700/50 relative">
            {/* Theme Switcher no canto superior direito dentro do card */}
            <div className="absolute top-4 right-4 z-10">
              <ThemeSwitcher />
            </div>

            <div className="mb-5">
              <TextLogo to="/" showFullOnMobile={true} />
            </div>

            <RegistrationCard />
            
            <div className="mt-5 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Já tem uma conta?{' '}
                <button 
                  onClick={handleNavigateToLogin}
                  className="text-brand-purple hover:underline cursor-pointer transition-colors duration-200"
                  type="button"
                >
                  Faça login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default RegistrationContainer;
