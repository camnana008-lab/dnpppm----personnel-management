import { Bell, HelpCircle, Search, Menu, Globe } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Language, translations } from '@/src/translations';
import { User } from '@/src/types';

interface TopNavbarProps {
  activeView: 'list' | 'view' | 'form';
  setActiveView: (view: 'list' | 'view' | 'form') => void;
  onToggleSidebar: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User;
}

export default function TopNavbar({ activeView, setActiveView, onToggleSidebar, language, setLanguage, user }: TopNavbarProps) {
  const t = translations[language];

  return (
    <header className="flex justify-between items-center px-4 sm:px-6 w-full h-16 border-b border-slate-200/60 dark:border-slate-800/50 bg-white/80 backdrop-blur-md dark:bg-[#001a4d]/80 sticky top-0 z-40 transition-all duration-300 shadow-sm shadow-slate-100/50 dark:shadow-none">
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <h2 className="text-lg sm:text-xl font-black tracking-[0.1em] text-slate-800 dark:text-white font-headline truncate max-w-[120px] sm:max-w-none">
          DNPPPM
        </h2>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 sm:mx-2 hidden sm:block"></div>
        
        {activeView === 'view' ? (
          <nav className="flex gap-2 sm:gap-6 h-full overflow-x-auto no-scrollbar">
            <button 
              className="text-sky-800 dark:text-sky-400 font-khmer font-black border-b-2 border-sky-800 dark:border-sky-400 h-16 px-1 sm:px-2 flex items-center whitespace-nowrap text-sm sm:text-base tracking-wide"
            >
              {t.staffProfile}
            </button>
            <button className="text-slate-500 dark:text-slate-400 font-khmer font-bold hover:text-slate-700 dark:hover:text-slate-200 transition-colors h-16 px-1 sm:px-2 flex items-center whitespace-nowrap text-sm sm:text-base">
              Documents
            </button>
            <button className="text-slate-500 dark:text-slate-400 font-khmer font-bold hover:text-slate-700 dark:hover:text-slate-200 transition-colors h-16 px-1 sm:px-2 flex items-center whitespace-nowrap text-sm sm:text-base">
              Payroll
            </button>
          </nav>
        ) : (
          <div className="relative hidden md:block group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              className="pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 w-72 dark:text-white dark:placeholder-slate-600 transition-all outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-200/50 dark:bg-slate-800 rounded-full p-1 mr-2 transition-colors">
          <button 
            onClick={() => setLanguage('kh')}
            className={cn(
              "px-3 py-1 text-[10px] font-bold rounded-full transition-all",
              language === 'kh' ? "bg-white dark:bg-slate-700 text-primary dark:text-sky-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            ខ្មែរ
          </button>
          <button 
            onClick={() => setLanguage('en')}
            className={cn(
              "px-3 py-1 text-[10px] font-bold rounded-full transition-all",
              language === 'en' ? "bg-white dark:bg-slate-700 text-primary dark:text-sky-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            EN
          </button>
        </div>

        <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:flex">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200/60 dark:border-slate-800 transition-colors">
          <div className="text-right hidden md:block">
            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
              {user.displayName}
            </p>
            <p className="text-[9px] font-khmer font-black text-blue-600 dark:text-sky-400 uppercase tracking-widest mt-0.5">
              {user.role}
            </p>
          </div>
          <div className="relative">
            <img 
              alt={user.displayName} 
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm object-cover" 
              src={user.photoUrl}
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
