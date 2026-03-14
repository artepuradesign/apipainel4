
import { SidebarItem } from './types';
import { createAssinanteSidebarItems } from './sidebar/assinanteSidebarItems';

// Função principal que retorna os menus baseado no role do usuário
export const createSidebarItems = (handleLogout: () => void, isSupport: boolean = false, panelMenus: SidebarItem[] = []): SidebarItem[] => {
  return createAssinanteSidebarItems(handleLogout, panelMenus, isSupport);
};

// Items administrativos removidos - agora estão integrados nos menus principais
export const adminItems: SidebarItem[] = [];
