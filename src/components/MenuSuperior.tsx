import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Plus, DollarSign, Package, House, ChevronLeft, ChevronRight, LogIn, UserPlus, LayoutGrid, Gift } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ThemeSwitcher from './ThemeSwitcher';
import { cn } from '@/lib/utils';
import TextLogo from './TextLogo';
import UserInfo from './UserInfo';
import NotificationIcon from './notifications/NotificationIcon';
import UserProfileDropdown from './menu/UserProfileDropdown';

import { useAuth } from '@/contexts/AuthContext';
import { useUserBalance } from '@/hooks/useUserBalance';
import { SimpleCounter } from '@/components/ui/simple-counter';
import UserWalletDropdown from '@/components/ui/user-wallet-dropdown';
import { useLiquidGlass } from '@/contexts/LiquidGlassContext';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

import SidebarMenu from './dashboard/layout/sidebar/SidebarMenu';
import { createSidebarItems } from './dashboard/layout/sidebarData';
import { usePanelMenus } from '@/hooks/usePanelMenus';
import { ScrollArea } from '@/components/ui/scroll-area';

const MenuSuperior = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isSupport } = useAuth();
  const { totalAvailableBalance } = useUserBalance();
  const { panelMenus } = usePanelMenus();
  const { config: liquidGlassConfig } = useLiquidGlass();

  // Verificar páginas atuais para exibir links contextuais
  const isDashboardPage = location.pathname.startsWith('/dashboard');
  const isHomePage = location.pathname === '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 [LOGOUT] Iniciando logout via MenuSuperior...');
      
      // Executar signOut do contexto
      await signOut();
      
      // Mostrar toast de sucesso
      toast.success("Logout realizado com sucesso!");
      
      console.log('✅ [LOGOUT] Logout completo, redirecionando para home...');
      
      // Redirecionar para a página inicial
      navigate("/", { replace: true });
      
    } catch (error) {
      console.error('❌ [LOGOUT] Erro no logout:', error);
      // Mesmo com erro, forçar redirecionamento
      navigate("/", { replace: true });
    }
  };

  const handleDashboardNavigation = () => {
    if (user) {
      // Determinar redirecionamento baseado no role do usuário
      const redirectTo = user.user_role === 'suporte' ? '/dashboard/admin' : '/dashboard';
      console.log(`🎯 [NAVIGATION] Redirecionando para: ${redirectTo} (role: ${user.user_role})`);
      navigate(redirectTo);
    }
  };

  const handleAddBalance = () => {
    navigate('/dashboard/adicionar-saldo');
  };

  const formatBrazilianCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Criar itens do sidebar para o menu mobile
  const sidebarItems = user ? createSidebarItems(handleLogout, isSupport, panelMenus) : [];

  // Funções para o menu mobile
  const isSubmenuActive = (subItems?: any[]) => {
    if (!subItems) return false;
    return subItems.some(subItem => location.pathname === subItem.path);
  };

  const handleSubItemClick = (subItem: any) => {
    if (subItem.onClick) {
      subItem.onClick();
    } else if (subItem.path !== '#') {
      navigate(subItem.path);
    }
    setIsMenuOpen(false); // Fechar menu após navegação
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header className={`sticky top-0 z-50 border-b ${liquidGlassConfig.enabled ? 'liquid-glass-container border-white/20' : 'bg-background border-border'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            {/* Tablet e Desktop - Logo com Theme e Notifications (>=768px) */}
            <div className="hidden md:flex items-center space-x-4">
              <TextLogo to="/dashboard" />
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ThemeSwitcher />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Alternar tema</p>
                  </TooltipContent>
                </Tooltip>
                {user && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <NotificationIcon />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notificações</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Mobile - Logo compacto (< 768px) */}
            <div className="md:hidden flex items-center gap-2">
              <TextLogo to="/dashboard" showFullOnMobile={!user} />
              <ThemeSwitcher />
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <nav className="hidden lg:flex items-center space-x-1">
                {!isHomePage && (
                  <Link to="/">
                    <Button variant="ghost" size="sm" className={cn("text-muted-foreground hover:text-foreground", liquidGlassConfig.enabled && "hover:bg-white/10")}>Início</Button>
                  </Link>
                )}
                <Link to="/modulos">
                  <Button variant="ghost" size="sm" className={cn("text-muted-foreground hover:text-foreground", liquidGlassConfig.enabled && "hover:bg-white/10")}>Módulos</Button>
                </Link>
                <Link to="/planos-publicos">
                  <Button variant="ghost" size="sm" className={cn("text-muted-foreground hover:text-foreground", liquidGlassConfig.enabled && "hover:bg-white/10")}>Planos</Button>
                </Link>
                {!isDashboardPage && (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className={cn("menu-paineis-link text-muted-foreground hover:text-foreground font-semibold", liquidGlassConfig.enabled && "hover:bg-white/10")}>Painéis</Button>
                  </Link>
                )}
              </nav>

              {user ? (
                <>
                  <UserWalletDropdown onLogout={handleLogout} />
                  <UserProfileDropdown onLogout={handleLogout} />
                </>
              ) : (
                <>
                  {liquidGlassConfig.enabled ? (
                    <>
                      <span
                        className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors duration-200"
                        onClick={() => navigate('/registration')}
                      >
                        Cadastre-se
                      </span>
                      <LiquidGlassButton
                        variant="outline"
                        className="text-sm px-4 py-2"
                        onClick={() => navigate('/login')}
                        ariaLabel="Entrar"
                      >
                        Entrar
                      </LiquidGlassButton>
                    </>
                  ) : (
                    <>
                      <Link to="/registration" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                        Cadastre-se
                      </Link>
                      <Link to="/login">
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold">
                          Entrar
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile - User Wallet e Menu (< 768px) */}
            <div className="md:hidden flex items-center gap-2">
              {user && (
                <UserWalletDropdown onLogout={handleLogout} />
              )}
              <button onClick={toggleMenu} className="p-2 rounded-md text-muted-foreground hover:text-foreground focus:outline-none relative z-[60]" aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu - FORA do header para não ser limitado pelo stacking context */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] animate-in fade-in-0 duration-200"
            onClick={toggleMenu}
          />
          
          {/* Slide-in Panel */}
          <div className="md:hidden fixed inset-y-0 right-0 z-[9999] w-[85vw] max-w-[320px] animate-in slide-in-from-right duration-300">
            <div className="h-full flex flex-col bg-card border-l border-border shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                <span className="text-sm font-bold text-foreground tracking-tight">Menu</span>
                <button 
                  onClick={toggleMenu}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {user ? (
                <ScrollArea className="flex-1">
                  <div className="py-2">
                    <SidebarMenu
                      filteredItems={sidebarItems}
                      location={location}
                      collapsed={false}
                      isMobile={true}
                      isTablet={false}
                      setMobileMenuOpen={setIsMenuOpen}
                      isSubmenuActive={isSubmenuActive}
                      handleSubItemClick={handleSubItemClick}
                      setCollapsed={() => {}}
                    />
                  </div>

                  {/* Logout */}
                  <div className="px-4 pb-6 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da conta
                    </button>
                  </div>
                </ScrollArea>
              ) : (
                <ScrollArea className="flex-1">
                  <nav className="p-4 space-y-1">
                    {[
                      { to: '/login', icon: LogIn, label: 'Entrar' },
                      { to: '/registration', icon: UserPlus, label: 'Criar conta' },
                      { to: '/planos-publicos', icon: LayoutGrid, label: 'Painéis disponíveis' },
                      { to: '/modulos', icon: Package, label: 'Módulos' },
                      { to: '/indicacoes', icon: Gift, label: 'Indicações' },
                    ].map(({ to, icon: ItemIcon, label }) => (
                      <Link key={to} to={to} onClick={toggleMenu} className="block">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                          <ItemIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="flex-1">{label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                        </div>
                      </Link>
                    ))}
                  </nav>
                </ScrollArea>
              )}
            </div>
          </div>
        </>
      )}
    </TooltipProvider>
  );
};

export default MenuSuperior;