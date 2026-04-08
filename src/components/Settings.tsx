import { Moon, Sun, Monitor, Languages, Palette, Save, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Language, translations } from '@/src/translations';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export default function Settings({ language, setLanguage, isDarkMode, setIsDarkMode }: SettingsProps) {
  const t = translations[language];
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline mb-2">
          {t.settings}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {language === 'kh' ? 'គ្រប់គ្រងការកំណត់ប្រព័ន្ធ និងរូបរាងរបស់អ្នក' : 'Manage your system preferences and appearance'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <section className="bg-white/50 backdrop-blur-lg dark:bg-[#001a4d]/70 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Palette className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white">{t.appearance}</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.themeSettings}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setIsDarkMode(false)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                    !isDarkMode 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400"
                  )}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t.lightMode}</span>
                </button>

                <button
                  onClick={() => setIsDarkMode(true)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                    isDarkMode 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400"
                  )}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t.darkMode}</span>
                </button>

                <button
                  disabled
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-slate-50 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50"
                >
                  <Monitor className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t.systemDefault}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section className="bg-white/50 backdrop-blur-lg dark:bg-[#001a4d]/70 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Languages className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white">{t.languageSettings}</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setLanguage('kh')}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300",
                  language === 'kh' 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇰🇭</span>
                  <span className="font-khmer font-bold">ភាសាខ្មែរ</span>
                </div>
                {language === 'kh' && <CheckCircle2 className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300",
                  language === 'en' 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇺🇸</span>
                  <span className="font-bold">English</span>
                </div>
                {language === 'en' && <CheckCircle2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm"
              >
                <CheckCircle2 className="w-5 h-5" />
                {t.settingsUpdated}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={handleSave}
            className="ml-auto flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dim hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-primary/20"
          >
            <Save className="w-5 h-5" />
            {t.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
}
