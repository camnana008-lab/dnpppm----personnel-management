import { useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Clock, 
  Briefcase, 
  Award,
  TrendingUp,
  PieChart as PieChartIcon,
  User,
  GripVertical
} from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { useState } from 'react';
import { StaffProfile } from '@/src/types';
import { Language, translations } from '@/src/translations';
import { calculateAge, parseKhmerDate, arabicToKhmer } from '@/src/lib/dateUtils';
import { cn } from '@/src/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  staffList: StaffProfile[];
  language: Language;
  isDarkMode?: boolean;
}

export default function Dashboard({ staffList, language, isDarkMode }: DashboardProps) {
  const t = translations[language];

  const stats = useMemo(() => {
    const total = staffList.length;
    const male = staffList.filter(s => s.gender === 'ប្រុស' || s.gender === 'Male').length;
    const female = total - male;

    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    const retired = staffList.filter(s => {
      const age = calculateAge(s.dob);
      return age !== null && age >= 60;
    });

    const active = staffList.filter(s => {
      const age = calculateAge(s.dob);
      return age === null || age < 60;
    });

    const retiringSoon = staffList.filter(s => {
      const dob = parseKhmerDate(s.dob);
      if (!dob) return false;
      
      const retirementDate = new Date(dob);
      retirementDate.setFullYear(dob.getFullYear() + 60);
      
      return retirementDate > today && retirementDate <= threeMonthsFromNow;
    });

    const getGenderStats = (list: StaffProfile[]) => {
      const male = list.filter(s => s.gender === 'ប្រុស' || s.gender === 'Male').length;
      return {
        total: list.length,
        male,
        female: list.length - male
      };
    };

    // Group by position
    const byPosition = staffList.reduce((acc, s) => {
      const pos = s.position || 'N/A';
      if (!acc[pos]) acc[pos] = { total: 0, male: 0, female: 0 };
      acc[pos].total++;
      if (s.gender === 'ប្រុស' || s.gender === 'Male') acc[pos].male++;
      else acc[pos].female++;
      return acc;
    }, {} as Record<string, { total: number, male: number, female: number }>);

    const POSITIONS_ORDER = [
      'ប្រធាននាយកដ្ឋាន', 'អនុប្រធាននាយកដ្ឋាន', 'នាយការិយាល័យ',
      'នាយរងការិយាល័យ', 'នាយផ្នែក', 'នាយរងផ្នែក', 'មន្ត្រី'
    ];

    const byPositionData = POSITIONS_ORDER.map(name => ({
      name,
      total: byPosition[name]?.total || 0,
      female: byPosition[name]?.female || 0
    }));

    // Group by rank (title)
    const byRank = staffList.reduce((acc, s) => {
      const rank = s.title || 'N/A';
      if (!acc[rank]) acc[rank] = { total: 0, male: 0, female: 0 };
      acc[rank].total++;
      if (s.gender === 'ប្រុស' || s.gender === 'Male') acc[rank].male++;
      else acc[rank].female++;
      return acc;
    }, {} as Record<string, { total: number, male: number, female: number }>);

    const RANKS_ORDER = [
      'ឧត្តមសេនីយ៍ឯក', 'ឧត្តមសេនីយ៍ទោ', 'ឧត្តមសេនីយ៍ត្រី',
      'វរសេនីយ៍ឯក', 'វរសេនីយ៍ទោ', 'វរសេនីយ៍ត្រី',
      'អនុសេនីយ៍ឯក', 'អនុសេនីយ៍ទោ', 'អនុសេនីយ៍ត្រី',
      'ព្រឹន្ទបាលឯក', 'ព្រឹន្ទបាលទោ', 'ព្រឹន្ទបាលត្រី'
    ];

    const byRankData = RANKS_ORDER.map(name => ({
      name,
      total: byRank[name]?.total || 0,
      female: byRank[name]?.female || 0
    }));

    // Group by office
    const byOffice = staffList.reduce((acc, s) => {
      const office = s.institution?.office || 'N/A';
      if (!acc[office]) acc[office] = { total: 0, male: 0, female: 0 };
      acc[office].total++;
      if (s.gender === 'ប្រុស' || s.gender === 'Male') acc[office].male++;
      else acc[office].female++;
      return acc;
    }, {} as Record<string, { total: number, male: number, female: number }>);

    const OFFICES_ORDER = [
      'ថ្នាក់ដឹកនាំ', 'កា.ទី១', 'កា.ទី២', 'កា.ទី៣', 'កា.ទី៤', 'កា.ទី៥', 'កា.ទី៦'
    ];

    const byOfficeData = OFFICES_ORDER.map(name => ({
      name,
      total: byOffice[name]?.total || 0,
      female: byOffice[name]?.female || 0
    }));

    return {
      total,
      male,
      female,
      active: getGenderStats(active),
      retired: getGenderStats(retired),
      retiringSoon: getGenderStats(retiringSoon),
      byPosition: byPositionData,
      byRank: byRankData,
      byOffice: byOfficeData
    };
  }, [staffList]);

  const COLORS = isDarkMode ? ['#38bdf8', '#fb923c'] : ['#003399', '#ff6600']; // Theme-aware colors

  const genderData = [
    { name: t.maleCount, value: stats.male },
    { name: t.femaleCount, value: stats.female },
  ];

  const malePercent = Math.round((stats.male / stats.total) * 100) || 0;
  const femalePercent = Math.round((stats.female / stats.total) * 100) || 0;

  const [cardIds, setCardIds] = useState(['total', 'active', 'retired', 'retiringSoon']);

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-500 w-full bg-background dark:bg-slate-900 transition-colors">
      {/* Main Stats Grid - Draggable Reorder Group */}
      <Reorder.Group 
        axis="x" 
        values={cardIds} 
        onReorder={setCardIds}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
      >
        {cardIds.map((id) => {
          const cardProps = {
            total: id === 'total' ? stats.total : stats[id].total,
            male: id === 'total' ? stats.male : stats[id].male,
            female: id === 'total' ? stats.female : stats[id].female,
            label: id === 'total' ? t.totalStaff : (id === 'active' ? (language === 'kh' ? 'មន្ត្រីកំពុងបម្រើការ' : 'Active Staff') : (id === 'retired' ? t.retiredStaff : t.upcomingRetirement)),
            color: id === 'active' ? 'emerald' : (id === 'retired' ? 'amber' : (id === 'retiringSoon' ? 'rose' : 'blue')),
            language,
            t
          };

          return (
            <Reorder.Item 
              key={id} 
              value={id}
              className="cursor-grab active:cursor-grabbing transition-shadow active:shadow-xl rounded-[2rem]"
            >
              <CompactFeaturedCard {...cardProps} />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Charts Section - Responsive layout with better breathing room */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        style={{ marginBottom: '24px' }}
      >
        {/* Staff by Position - Redesigned to match image */}
        <div className="bg-white/60 backdrop-blur-md dark:bg-slate-800/60 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
          <div className="p-4 pb-0">
            <h3 className="text-2xl font-black text-[#001a4d] dark:text-sky-400 font-khmer mb-1 drop-shadow-md">
              មុខតំណែង
            </h3>
          </div>

          <div className="flex-1 p-2 pt-0 min-h-[350px] md:h-[450px] flex items-center justify-center">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stats.byPosition} 
                    layout="vertical"
                    margin={{ top: 20, right: 60, left: window.innerWidth < 640 ? 100 : 150, bottom: 20 }}
                    barGap={0}
                  >
                  <XAxis type="number" hide domain={[0, 80]} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={window.innerWidth < 640 ? 90 : 140} 
                    tick={{ 
                      fontSize: window.innerWidth < 640 ? 11 : 14, 
                      fontWeight: 800, 
                      fill: 'currentColor', 
                      fontFamily: 'Battambang' 
                    }}
                    className="text-slate-600 dark:text-slate-400"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="square"
                    wrapperStyle={{ paddingBottom: '10px', paddingRight: '10px' }}
                    formatter={(value) => (
                      <span className="text-xs font-bold text-slate-700 font-khmer ml-1">
                        {value === 'total' ? 'សរុប' : 'ស្រី'}
                      </span>
                    )}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#003399" 
                    radius={[0, 2, 2, 0]} 
                    barSize={window.innerWidth < 640 ? 18 : 28}
                    label={{ 
                      position: 'right', 
                      formatter: (val: number) => arabicToKhmer(val),
                      fill: 'currentColor',
                      fontSize: window.innerWidth < 640 ? 14 : 16,
                      fontWeight: 700,
                      fontFamily: 'Khmer OS Battambang',
                      offset: 5
                    }}
                  />
                  <Bar 
                    dataKey="female" 
                    fill="#E066FF" 
                    radius={[0, 2, 2, 0]} 
                    barSize={window.innerWidth < 640 ? 18 : 28}
                    label={{ 
                      position: 'right', 
                      formatter: (val: number) => arabicToKhmer(val),
                      fill: 'currentColor',
                      fontSize: window.innerWidth < 640 ? 14 : 16,
                      fontWeight: 700,
                      fontFamily: 'Khmer OS Battambang',
                      offset: 5
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Staff by Rank - Redesigned to match image */}
        <div className="bg-white/60 backdrop-blur-md dark:bg-slate-800/60 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
          <div className="p-4 pb-0">
            <h3 className="text-2xl font-black text-[#001a4d] dark:text-sky-400 font-khmer mb-1 drop-shadow-md">
              ឋានន្តរស័ក្តិ
            </h3>
          </div>

          <div className="flex-1 p-2 pt-0 min-h-[350px] md:h-[450px] flex items-center justify-center">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={stats.byRank} 
                  margin={{ top: 40, right: 40, left: 40, bottom: 100 }}
                  barGap={0}
                >
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0} 
                    height={90}
                    tick={{ fontSize: 11, fontWeight: 800, fill: 'currentColor', fontFamily: 'Khmer OS Battambang' }}
                    className="text-slate-900 dark:text-slate-300 transition-colors"
                    axisLine={{ stroke: '#ccc' }}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="square"
                    wrapperStyle={{ paddingBottom: '10px', paddingRight: '10px' }}
                    formatter={(value) => (
                      <span className="text-xs font-bold text-slate-700 font-khmer ml-1">
                        {value === 'total' ? 'សរុប' : 'ស្រី'}
                      </span>
                    )}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#003399" 
                    radius={[2, 2, 0, 0]} 
                    barSize={window.innerWidth < 640 ? 18 : 32}
                    label={{ 
                      position: 'top', 
                      formatter: (val: number) => arabicToKhmer(val),
                      fill: isDarkMode ? '#e2e8f0' : '#475569',
                      fontSize: window.innerWidth < 640 ? 12 : 14,
                      fontWeight: 700,
                      fontFamily: 'Khmer OS Battambang',
                      offset: 5
                    }}
                  />
                  <Bar 
                    dataKey="female" 
                    fill="#E066FF" 
                    radius={[2, 2, 0, 0]} 
                    barSize={window.innerWidth < 640 ? 18 : 32}
                    label={{ 
                      position: 'top', 
                      formatter: (val: number) => arabicToKhmer(val),
                      fill: isDarkMode ? '#e2e8f0' : '#475569',
                      fontSize: window.innerWidth < 640 ? 12 : 14,
                      fontWeight: 700,
                      fontFamily: 'Khmer OS Battambang',
                      offset: 5
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Staff by Office - New Chart from Image */}
      <div className="bg-white/60 backdrop-blur-md dark:bg-slate-800/60 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col w-full mb-8 transition-colors">
        <div className="p-6 pb-0">
          <h3 className="text-2xl font-black text-[#001a4d] dark:text-sky-400 font-khmer mb-1 drop-shadow-md text-center">
            មន្ត្រីនគរបាលជាតិតាមបណ្តាការិយាល័យ
          </h3>
        </div>
        <div className="px-6 pb-8 flex flex-col items-center justify-center">
          <div className="w-full h-[400px] md:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stats.byOffice} 
                margin={{ top: 40, right: 40, left: 40, bottom: 70 }}
                barGap={8}
              >
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0} 
                  height={90}
                  tick={{ fontSize: 11, fontWeight: 700, fill: 'currentColor', fontFamily: 'Khmer OS Battambang' }}
                  className="text-slate-900 dark:text-slate-300 transition-colors"
                  axisLine={{ stroke: '#ccc' }}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    borderRadius: '1.25rem', 
                    border: '1px solid rgba(0,0,0,0.05)', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', 
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px 16px'
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="square"
                  wrapperStyle={{ paddingBottom: '20px' }}
                  formatter={(value) => (
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-khmer ml-1">
                      {value === 'total' ? 'សរុប' : 'ស្រី'}
                    </span>
                  )}
                />
                <Bar 
                  dataKey="total" 
                  fill="#1a1a8c" 
                  radius={[2, 2, 0, 0]} 
                  barSize={window.innerWidth < 640 ? 25 : 45}
                  label={{ 
                    position: 'top', 
                    formatter: (val: number) => arabicToKhmer(val),
                    fill: 'currentColor',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'Khmer OS Battambang',
                    offset: 8,
                    className: "text-slate-700 dark:text-slate-300"
                  }}
                />
                <Bar 
                  dataKey="female" 
                  fill="#ff6600" 
                  radius={[2, 2, 0, 0]} 
                  barSize={window.innerWidth < 640 ? 25 : 45}
                  label={{ 
                    position: 'top', 
                    formatter: (val: number) => arabicToKhmer(val),
                    fill: 'currentColor',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'Khmer OS Battambang',
                    offset: 8,
                    className: "text-slate-700 dark:text-slate-300"
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white/60 backdrop-blur-md dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 flex justify-between items-center transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary dark:text-sky-400" />
              {t.byPosition}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider transition-colors">
                <tr>
                  <th className="px-6 py-3">{t.position}</th>
                  <th className="px-6 py-3 text-center">{t.maleCount}</th>
                  <th className="px-6 py-3 text-center">{t.femaleCount}</th>
                  <th className="px-6 py-3 text-center">{t.total}</th>
                  <th className="px-6 py-3 text-center">{t.percent}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 transition-colors">
                {stats.byPosition.map((pos, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{pos.name}</td>
                    <td className="px-6 py-4 text-center text-sky-600 dark:text-sky-400 font-bold">{pos.male}</td>
                    <td className="px-6 py-4 text-center text-pink-600 dark:text-pink-400 font-bold">{pos.female}</td>
                    <td className="px-6 py-4 text-center font-black text-slate-900 dark:text-white">{pos.total}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary dark:bg-sky-500" 
                            style={{ width: `${(pos.total / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {Math.round((pos.total / stats.total) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, total, male, female, icon: Icon, color, t }: any) {
  const colorClasses = {
    blue: "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30",
    amber: "bg-amber-50/50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/30",
    rose: "bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/30",
    emerald: "bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30",
  };

  return (
    <div className="bg-white/80 backdrop-blur-md dark:bg-slate-900/80 p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl border transition-all duration-500 group-hover:rotate-6", colorClasses[color as keyof typeof colorClasses])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{arabicToKhmer(total)}</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t.maleCount}</span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-200">{arabicToKhmer(male)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t.femaleCount}</span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-200">{arabicToKhmer(female)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactFeaturedCard({ title, label, total, male, female, t, color }: any) {
  const COLORS = ['#003399', '#ff6600']; // Male (Dark Blue), Female (Orange)
  const genderData = [
    { name: t.maleCount, value: male },
    { name: t.femaleCount, value: female },
  ];
  const malePercent = Math.round((male / total) * 100) || 0;
  const femalePercent = Math.round((female / total) * 100) || 0;

  const accentColor = color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : color === 'rose' ? '#e11d48' : '#3b82f6';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all duration-500 group relative">
      {/* Background Graphic Decoration */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="p-7 flex-1 flex flex-col justify-between z-10 relative">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xl font-black text-slate-900 dark:text-white font-khmer uppercase tracking-wider">
                {label}
              </span>
            </div>
            <div className={cn("p-2 rounded-full", color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" : (color === 'amber' ? "bg-amber-500/10 text-amber-500" : (color === 'rose' ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500")))}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="h-2" />
          
          <div className="flex items-center gap-6 py-2">
            {/* Total Count Display */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">
                  {arabicToKhmer(total)}
                </span>
                <span className="text-lg font-bold text-slate-400 dark:text-slate-500 font-khmer uppercase tracking-wider">រូប</span>
              </div>
            </div>
            
            {/* Minimal Donut Chart Preview */}
            <div className="w-20 h-20 shrink-0 ml-auto scale-110 opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    innerRadius="60%"
                    outerRadius="100%"
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                    stroke="none"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Gender Breakdown */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
          <div className="flex gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.femaleCount}</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#ff6600]">{arabicToKhmer(female)}</span>
                <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600">{femalePercent}%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 pr-4 border-r border-slate-100 dark:border-slate-800">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.maleCount}</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#003399] dark:text-blue-400">{arabicToKhmer(male)}</span>
                <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600">{malePercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
