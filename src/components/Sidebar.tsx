import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Settings, 
  HelpCircle, 
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Language, translations } from '@/src/translations';
import { User as UserType } from '@/src/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  language: Language;
  user: UserType;
  isDarkMode?: boolean;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  isCollapsed, 
  onToggleCollapse,
  onClose, 
  language, 
  user,
  isDarkMode
}: SidebarProps) {
  const t = translations[language];

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'staff-list', label: t.staffList, icon: Users },
    { id: 'add-staff', label: t.addStaff, icon: UserPlus },
    ...(user.role === 'Super Admin' ? [{ id: 'user-management', label: t.userManagement, icon: ShieldCheck }] : []),
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const bottomItems = [
    { id: 'help', label: t.help, icon: HelpCircle },
    { id: 'logout', label: t.logout, icon: LogOut },
  ];

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 transition-all duration-500 ease-in-out transform border-r flex flex-col overflow-hidden shadow-2xl",
      isDarkMode 
        ? "bg-slate-900/95 backdrop-blur-xl text-white border-white/5" 
        : "bg-white/90 backdrop-blur-xl text-slate-900 border-slate-200/60",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      isCollapsed ? "md:w-24" : "md:w-72",
      !isCollapsed && "w-72"
    )}>
      <div className={cn(
        "flex flex-col h-full p-4 transition-all duration-300 relative z-10",
        isCollapsed ? "items-center" : ""
      )}>
        {/* Close button for mobile */}
        <button 
          onClick={onClose}
          className={cn(
            "md:hidden absolute right-4 top-4 p-2 rounded-full transition-colors",
            isDarkMode ? "text-white/50 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Section */}
        <div className={cn(
          "flex flex-col items-center gap-4 mb-10 pt-4 transition-all duration-300",
          isCollapsed ? "mb-12" : "mb-10"
        )}>
          <div className={cn(
            "flex items-center justify-center transition-all duration-500 group cursor-pointer",
            isCollapsed ? "w-14 h-14 rounded-2xl" : "w-full px-2",
            isCollapsed && (isDarkMode ? "bg-white/5" : "bg-slate-50")
          )}>
            <span className={cn(
              "font-black tracking-[0.3em] transition-all duration-500 group-hover:tracking-[0.4em] group-hover:scale-105",
              isDarkMode ? "text-white" : "text-slate-900",
              isCollapsed ? "text-xl" : "text-4xl text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400"
            )}>
              {isCollapsed ? "D" : "DNPPPM"}
            </span>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 space-y-1.5 w-full overflow-y-auto no-scrollbar pr-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 768) onClose();
              }}
              title={isCollapsed ? item.label : ""}
              className={cn(
                "w-full flex items-center rounded-2xl text-[11px] font-black transition-all duration-500 relative overflow-hidden group",
                isCollapsed ? "justify-center p-4" : "px-5 py-4 justify-start gap-5",
                activeTab === item.id 
                  ? (isDarkMode 
                      ? "bg-white text-slate-900 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] scale-[1.02]" 
                      : "bg-slate-900 text-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.2)] scale-[1.02]")
                  : (isDarkMode 
                      ? "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-100")
              )}
            >
              <item.icon className={cn(
                "transition-all duration-500 group-hover:scale-110",
                isCollapsed ? "w-6 h-6" : "w-5 h-5",
                activeTab === item.id 
                  ? (isDarkMode ? "text-slate-900" : "text-white") 
                  : (isDarkMode ? "text-slate-500 group-hover:text-white" : "text-slate-400 group-hover:text-slate-900")
              )} />
              
              {!isCollapsed && (
                <span className="font-khmer whitespace-nowrap overflow-hidden tracking-[0.05em]">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className={cn(
          "mt-auto pt-4 space-y-2 w-full",
          isDarkMode ? "border-t border-white/10" : "border-t border-slate-200"
        )}>
          {/* Collapse Toggle Button (Tablet/Desktop) */}
          <button
            onClick={onToggleCollapse}
            className={cn(
              "hidden md:flex w-full items-center rounded-xl text-xs font-bold transition-all duration-300 group mb-2",
              isCollapsed ? "justify-center p-3" : "px-4 py-3 justify-start gap-4",
              isDarkMode ? "text-white/40 hover:text-white hover:bg-white/5" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!isCollapsed && <span className="font-khmer font-black uppercase tracking-wider">បង្រួម مឺនុយ</span>}
          </button>

          {/* User Profile Summary in Sidebar */}
          {!isCollapsed && (
            <div className={cn(
              "px-4 py-3 mb-2 rounded-2xl border flex items-center gap-3",
              isDarkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}>
              <img 
                src={user.photoUrl} 
                alt={user.displayName}
                className={cn(
                  "w-8 h-8 rounded-full border",
                  isDarkMode ? "border-white/20" : "border-slate-300"
                )}
              />
              <div className="overflow-hidden">
                <p className={cn(
                  "text-[10px] font-black truncate",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}>{user.displayName}</p>
                <p className={cn(
                  "text-[8px] font-bold uppercase tracking-wider",
                  isDarkMode ? "text-white/40" : "text-slate-500"
                )}>{user.role}</p>
              </div>
            </div>
          )}

          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              title={isCollapsed ? item.label : ""}
              className={cn(
                "w-full flex items-center rounded-xl text-xs font-bold transition-all duration-300 group",
                isCollapsed ? "justify-center p-3" : "px-4 py-3 justify-start gap-4",
                isDarkMode ? "text-white/50 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <item.icon className={cn(
                "transition-all duration-300 group-hover:scale-110",
                isCollapsed ? "w-6 h-6" : "w-5 h-5"
              )} />
              {!isCollapsed && (
                <span className="font-khmer whitespace-nowrap overflow-hidden tracking-wide">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
