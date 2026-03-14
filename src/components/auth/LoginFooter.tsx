
import React from 'react';

interface LoginFooterProps {
  onNavigateToRegister: () => void;
}

const LoginFooter: React.FC<LoginFooterProps> = ({ onNavigateToRegister }) => {
  return (
    <div className="mt-5 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Não tem conta?{" "}
        <button 
          onClick={onNavigateToRegister}
          className="text-brand-purple hover:underline cursor-pointer transition-colors duration-200"
        >
          Cadastre-se
        </button>
      </p>
    </div>
  );
};

export default LoginFooter;
