import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import MenuSuperior from '@/components/MenuSuperior';
import NewFooter from '@/components/NewFooter';
import PageLayout from '@/components/layout/PageLayout';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useApiPanels } from '@/hooks/useApiPanels';
import { useAuth } from '@/contexts/AuthContext';
import { ModuleTemplateProvider } from '@/contexts/ModuleTemplateContext';
import PanelsGrid from '@/components/dashboard/PanelsGrid';
import EmptyState from '@/components/ui/empty-state';
import * as Icons from 'lucide-react';

const ModulosContent = () => {
  const { panels, isLoading } = useApiPanels();
  const { user } = useAuth();

  // Filtrar apenas painéis de consulta ativos
  const consultaPanels = useMemo(() => {
    if (!Array.isArray(panels)) return [];
    return panels.filter(p => 
      p.is_active && 
      (p.name?.toLowerCase().includes('consult') || p.category?.toLowerCase().includes('consult'))
    );
  }, [panels]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (consultaPanels.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum painel de consulta ativo"
        description="Nenhum módulo de consulta disponível no momento."
      />
    );
  }

  return (
    <ModuleTemplateProvider>
      <div className="space-y-6 w-full">
        <PanelsGrid activePanels={consultaPanels} />
      </div>
    </ModuleTemplateProvider>
  );
};

const Modulos = () => {
  const { user } = useAuth();

  // Se logado, exibir com DashboardLayout (sidebar) igual ao /dashboard
  if (user) {
    return (
      <DashboardLayout>
        <ModulosContent />
      </DashboardLayout>
    );
  }

  // Se não logado, exibir com layout público
  return (
    <PageLayout variant="auth" backgroundOpacity="strong" showGradients={false} className="flex flex-col">
      <MenuSuperior />
      <main className="w-full overflow-x-hidden flex-1">
        <section className="py-8 sm:py-12">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Módulos de Consulta</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Confira todos os módulos de consulta disponíveis na plataforma
              </p>
            </motion.div>
            <ModulosContent />
          </div>
        </section>
      </main>
      <NewFooter />
    </PageLayout>
  );
};

export default Modulos;
