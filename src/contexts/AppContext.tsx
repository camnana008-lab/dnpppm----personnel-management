import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../translations';
import { StaffProfile } from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeView: 'list' | 'view' | 'form' | 'dashboard';
  setActiveView: (view: 'list' | 'view' | 'form' | 'dashboard') => void;
  selectedStaff: StaffProfile | null;
  setSelectedStaff: (staff: StaffProfile | null) => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('kh');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme_v2');
    return savedTheme === 'dark';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeView, setActiveView] = useState<'list' | 'view' | 'form' | 'dashboard'>('dashboard');
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);

  // Apply dark mode & persist
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_v2', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_v2', 'light');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed(prev => !prev);
    } else {
      setIsSidebarOpen(prev => !prev);
    }
  };

  const value: AppContextType = {
    language,
    setLanguage,
    isDarkMode,
    setIsDarkMode,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    activeTab,
    setActiveTab,
    activeView,
    setActiveView,
    selectedStaff,
    setSelectedStaff,
    toggleSidebar
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
