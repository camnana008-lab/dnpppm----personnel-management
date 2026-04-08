import { Printer, FileDown, Paperclip, ChevronLeft, Edit, ChevronRight } from 'lucide-react';
import { StaffProfile } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';
import { Language, translations } from '@/src/translations';
import { parseKhmerDate, calculateSeniority } from '@/src/lib/dateUtils';

interface ProfileViewProps {
  profile: StaffProfile;
  language: Language;
  onBack: () => void;
  onEdit: (staff: StaffProfile) => void;
  isDarkMode?: boolean;
}

export default function ProfileView({ profile, language, onBack, onEdit, isDarkMode }: ProfileViewProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('position');

  const getHistoryField = (tabId: string): keyof StaffProfile => {
    switch (tabId) {
      case 'position': return 'positionHistory';
      case 'title': return 'titleHistory';
      case 'commendation': return 'awardsHistory';
      case 'discipline': return 'disciplineHistory';
      case 'education': return 'educationHistory';
      case 'history': return 'employmentHistory';
      default: return 'employmentHistory';
    }
  };

  const activeHistoryField = getHistoryField(activeTab);
  const activeHistory = (profile[activeHistoryField] || []) as any[];

  const tabs = [
    { id: 'position', label: t.position },
    { id: 'title', label: t.title },
    { id: 'commendation', label: t.awards },
    { id: 'discipline', label: t.discipline },
    { id: 'education', label: t.education },
    { id: 'history', label: t.workHistory },
    { id: 'documents', label: t.personalDocuments },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 bg-background dark:bg-slate-900 transition-colors">
      {/* Header with Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <button 
              onClick={onBack}
              className="text-[10px] font-bold uppercase tracking-widest hover:text-primary dark:hover:text-sky-400 transition-colors"
            >
              {t.staffList}
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary dark:text-sky-400">
              {t.staffProfile}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
            {profile.nameKh}
          </h1>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.cancel}
          </button>
          <button 
            onClick={() => onEdit(profile)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-amber-600 transition-all"
          >
            <Edit className="w-4 h-4" />
            {t.editProfile}
          </button>
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm transition-all">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Left: Photo & IDs */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden rounded shadow-inner transition-colors">
              <img 
                alt="Staff portrait" 
                className="w-full h-full object-cover" 
                src={profile.photoUrl}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.staffId}</span>
                <span className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-sm font-bold border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white transition-colors">
                  {profile.staffId}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.gender}</span>
                <span className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white transition-colors">
                  {profile.gender === 'ប្រុស' || profile.gender === 'Male' ? t.male : t.female}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Basic Info Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">{t.nameKh}</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {profile.nameKh}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">{t.nameEn}</span>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {profile.nameEn}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">{t.dob}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {profile.dob}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">{t.gender}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {profile.gender === 'ប្រុស' || profile.gender === 'Male' ? t.male : t.female}
                </span>
              </div>
            </div>
            <div className="flex flex-col pt-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">{t.position}</span>
              <span className="text-sm font-black text-blue-600 dark:text-sky-400">
                {profile.position}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">{t.phone}</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                {profile.phone}
              </span>
            </div>
          </div>

          {/* Right: Institution Block */}
          <div className="md:col-span-4">
            <div className="border-2 border-primary/20 dark:border-sky-500/20 rounded-lg p-4 h-full bg-slate-50/50 dark:bg-slate-900/30 relative transition-colors">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#e2edc4] dark:bg-emerald-900/80 px-4 py-1 border border-primary dark:border-sky-500 text-[10px] font-bold rounded-full shadow-sm dark:text-emerald-100 transition-colors">
                  {t.institution}
                </span>
              </div>
              <div className="space-y-3 pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.ministry}</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1 transition-colors">
                    {profile.institution.ministry}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.generalDept}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1 transition-colors">
                    {profile.institution.generalDept}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.department}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1 transition-colors">
                    {profile.institution.department}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.office}</span>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-1 transition-colors">
                    {profile.institution.office}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm relative p-4 md:p-6 transition-all">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-white dark:bg-slate-800 border-2 border-primary dark:border-sky-500 px-6 py-1.5 rounded-full shadow-sm font-bold text-[10px] text-primary dark:text-sky-400 whitespace-nowrap transition-colors">
            {tabs.find(tab => tab.id === activeTab)?.label || t.employmentHistory}
          </span>
        </div>
        
        <div className="flex flex-col lg:flex-row min-h-[320px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
          {/* Side Tabs */}
          <div className="w-full lg:w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full text-left px-6 py-4 transition-all duration-300 text-xs font-black uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 last:border-b-0",
                  activeTab === tab.id 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg z-10 scale-[1.02]" 
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table Content */}
          <div className="flex-1 p-1 overflow-x-auto bg-white dark:bg-slate-800 transition-colors">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#001a4d] dark:bg-slate-950 text-white transition-colors">
                <tr>
                  {activeTab === 'education' ? (
                    <>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left">{t.degree}</th>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left">{t.major}</th>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left">{t.school}</th>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left w-32">{t.year}</th>
                    </>
                  ) : activeTab === 'history' ? (
                    <>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left">{t.organization}</th>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left">{t.role}</th>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left w-40">{t.startDate}</th>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left w-40">{t.endDate}</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left">{t.docNumber}</th>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left w-40">{t.docDate}</th>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left w-32">{t.seniority}</th>
                      <th className="px-4 py-3 border border-white/20 font-bold text-left">{t.note}</th>
                    </>
                  )}
                  <th className="px-4 py-3 border border-white/20 font-bold text-center w-24">{t.attachFile}</th>
                </tr>
              </thead>
              <tbody>
                {activeHistory.map((item, idx) => (
                  <tr key={item.id} className={cn(idx % 2 === 0 ? "bg-slate-50/80 dark:bg-slate-800/40" : "bg-white dark:bg-slate-900/40")}>
                    {activeTab === 'education' ? (
                      <>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{item.degree}</td>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{item.major}</td>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{item.school}</td>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{item.year}</td>
                      </>
                    ) : activeTab === 'history' ? (
                      <>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{item.organization}</td>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{item.role}</td>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{item.startDate}</td>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{item.endDate}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 font-mono text-xs dark:text-slate-300">{item.docNumber}</td>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{item.date}</td>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{calculateSeniority(item.date, language)}</td>
                        <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-xs dark:text-slate-300">{item.note}</td>
                      </>
                    )}
                    <td className="px-4 py-3 border border-white/10 dark:border-slate-600 text-center">
                      {item.attachmentName ? (
                        <a 
                          href={item.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity group"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-primary dark:text-sky-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[8px] font-bold text-primary dark:text-sky-400 truncate max-w-[70px]" title={item.attachmentName}>
                            {item.attachmentName}
                          </span>
                        </a>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 text-[10px]">---</span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Empty rows to maintain height if needed */}
                {Array.from({ length: Math.max(0, 4 - activeHistory.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className={cn((activeHistory.length + i) % 2 === 0 ? "bg-slate-50/80 dark:bg-slate-800/40" : "bg-white dark:bg-slate-900/40")}>
                    <td className="px-4 py-3 border border-white/10 dark:border-slate-600 h-10"></td>
                    <td className="px-4 py-3 border border-white/10 dark:border-slate-600"></td>
                    <td className="px-4 py-3 border border-white/10 dark:border-slate-600"></td>
                    <td className="px-4 py-3 border border-white/10 dark:border-slate-600"></td>
                    <td className="px-4 py-3 border border-white/10 dark:border-slate-600"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="bg-white/50 backdrop-blur-lg dark:bg-[#001a4d]/70 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {t.lastUpdated}
        </p>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <Printer className="w-4 h-4" />
            {t.print}
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary dark:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-primary-dim dark:hover:bg-sky-700 transition-all">
            <FileDown className="w-4 h-4" />
            {t.export}
          </button>
        </div>
      </div>
    </div>
  );
}
