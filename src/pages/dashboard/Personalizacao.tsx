import React from 'react';
import PersonalizationSettings from '@/components/configuracoes/PersonalizationSettings';
import { ModuleTemplateProvider } from '@/contexts/ModuleTemplateContext';
import DashboardTitleCard from '@/components/dashboard/DashboardTitleCard';
import { Settings } from 'lucide-react';

const Personalizacao = () => {
  return (
    <ModuleTemplateProvider>
      <div className="space-y-4 sm:space-y-6">
        <DashboardTitleCard
          title="Personalização"
          subtitle="Configure painéis, módulos e planos do sistema"
          icon={<Settings className="h-4 w-4 sm:h-5 sm:w-5" />}
          backTo="/dashboard/admin"
        />
        
        <PersonalizationSettings />
      </div>
    </ModuleTemplateProvider>
  );
};

export default Personalizacao;
