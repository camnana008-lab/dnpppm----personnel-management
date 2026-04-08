import { useState, useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel, 
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  FilterFn,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { 
  Search, 
  Eye, 
  Edit, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Columns, 
  Filter,
  X,
  Check,
  Briefcase,
  Award,
  LayoutDashboard
} from 'lucide-react';
import { StaffProfile } from '../types';
import { translations, Language } from '../translations';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface StaffListProps {
  data: StaffProfile[];
  onView: (staff: StaffProfile) => void;
  onEdit: (staff: StaffProfile) => void;
  language: Language;
  isDarkMode?: boolean;
}

const columnHelper = createColumnHelper<StaffProfile>();

export default function StaffList({ data, onView, onEdit, language, isDarkMode }: StaffListProps) {
  const t = translations[language];
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  const columns = useMemo<ColumnDef<StaffProfile, any>[]>(() => [
    columnHelper.display({
      id: 'index',
      header: language === 'kh' ? 'ល.រ' : 'No.',
      cell: info => <span className="font-bold text-slate-500">{info.row.index + 1}</span>,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('nameKh', {
      header: t.nameKh,
      cell: info => (
        <button 
          onClick={() => onView(info.row.original)}
          className="font-khmer font-medium hover:text-primary hover:underline transition-all text-left"
        >
          {info.getValue()}
        </button>
      ),
    }),
    columnHelper.accessor('nameEn', {
      header: t.nameEn,
      cell: info => (
        <button 
          onClick={() => onView(info.row.original)}
          className="font-bold text-slate-700 hover:text-primary hover:underline transition-all text-left"
        >
          {info.getValue()}
        </button>
      ),
    }),
    columnHelper.accessor('gender', {
      header: t.gender,
      cell: info => (
        <span className={cn(
          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          info.getValue() === 'ប្រុស' ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
        )}>
          {info.getValue() === 'ប្រុស' ? t.male : t.female}
        </span>
      ),
    }),
    columnHelper.accessor('title', {
      header: t.title,
      cell: info => <span className="text-[10px] font-bold text-primary/80">{info.getValue()}</span>,
    }),
    columnHelper.accessor('position', {
      header: t.position,
      cell: info => <span className="text-xs font-medium text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('institution.office', {
      header: t.office,
    }),
    columnHelper.display({
      id: 'actions',
      header: t.actions,
      cell: info => (
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => onView(info.row.original)}
            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-all"
            title={t.viewProfile}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onEdit(info.row.original)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all"
            title={t.editProfile}
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ], [t, onView, onEdit, language]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    }
  });

  return (
    <div className="p-6 space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-[450px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all text-sm dark:text-white dark:placeholder-slate-600"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 relative min-w-[120px] sm:min-w-[160px] shadow-inner">
            <div className="flex relative w-full h-9">
              <motion.div
                className="absolute inset-y-0 bg-white dark:bg-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-xl border border-slate-200/50 dark:border-slate-600/50"
                initial={false}
                animate={{
                  left: viewMode === 'table' ? '2px' : 'calc(50% + 1px)',
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ width: 'calc(50% - 3px)', top: '2px', bottom: '2px' }}
              />
              
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 px-3 rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest",
                  viewMode === 'table' ? "text-primary dark:text-sky-400 scale-105" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}
                title={language === 'kh' ? 'មើលជាតារាង' : 'Table View'}
              >
                <Columns className={cn("w-3.5 h-3.5 transition-transform", viewMode === 'table' && "scale-110")} />
                <span className="hidden lg:inline">{language === 'kh' ? 'តារាង' : 'Table'}</span>
              </button>
              
              <button
                onClick={() => setViewMode('card')}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 px-3 rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest",
                  viewMode === 'card' ? "text-primary dark:text-sky-400 scale-105" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}
                title={language === 'kh' ? 'មើលជាកាត' : 'Card View'}
              >
                <Filter className={cn("w-3.5 h-3.5 rotate-90 transition-transform", viewMode === 'card' && "scale-110")} />
                <span className="hidden lg:inline">{language === 'kh' ? 'កាត' : 'Card'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative">
            <button 
              onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <Columns className="w-4 h-4" />
              {t.columns}
            </button>
            
            <AnimatePresence>
              {isColumnMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsColumnMenuOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden"
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.columns}</span>
                      <button onClick={() => table.toggleAllColumnsVisible()} className="text-[10px] text-primary dark:text-sky-400 font-bold hover:underline">
                        {t.showColumn}
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                      {table.getAllLeafColumns().map(column => {
                        if (column.id === 'actions') return null;
                        const isVisible = column.getIsVisible();
                        return (
                          <label 
                            key={column.id} 
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all border",
                              isVisible 
                                ? "bg-primary/5 dark:bg-sky-400/5 border-primary/20 dark:border-sky-400/20 text-primary dark:text-sky-400 shadow-sm" 
                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                            )}
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {column.id === 'photoUrl' ? t.photo : (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id)}
                            </span>
                            <div className={cn(
                              "w-8 h-4 rounded-full relative transition-colors shrink-0",
                              isVisible ? "bg-primary" : "bg-slate-200"
                            )}>
                              <motion.div 
                                className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                                animate={{ x: isVisible ? 16 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            </div>
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={column.getToggleVisibilityHandler()}
                              className="hidden"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {(globalFilter || columnFilters.length > 0) && (
            <button 
              onClick={() => {
                setGlobalFilter('');
                setColumnFilters([]);
              }}
              className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-xl text-sm font-bold transition-all"
            >
              <X className="w-4 h-4" />
              {language === 'kh' ? 'សម្អាតចម្រោះ' : 'Clear Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'table' ? (
        <div className="w-full bg-white/50 backdrop-blur-lg dark:bg-[#001a4d]/70 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse table-auto">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-white/50 dark:bg-[#001a4d]/50 border-b border-slate-200 dark:border-slate-700">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-4 py-4 text-left whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <div 
                            className={cn(
                              "text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2",
                              header.column.getCanSort() && "cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                          
                          {header.column.getCanFilter() && (
                            <div className="relative">
                              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 dark:text-slate-600" />
                              <input 
                                type="text"
                                value={(header.column.getFilterValue() ?? '') as string}
                                onChange={e => header.column.setFilterValue(e.target.value)}
                                placeholder={t.filter}
                                className="w-full pl-7 pr-2 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md text-[10px] outline-none focus:border-primary/30 dark:focus:border-sky-400/30 transition-all dark:text-slate-300"
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                        <Search className="w-8 h-8 opacity-20" />
                        <span className="text-sm font-medium">{t.noData}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map(row => {
              const staff = row.original;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={staff.id}
                  className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 p-6 flex gap-5 relative hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 group min-h-[160px]"
                >
                  {/* Actions Top Right */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onView(staff)}
                      className="p-1 text-slate-400 hover:text-primary transition-colors"
                      title={t.viewProfile}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEdit(staff)}
                      className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                      title={t.editProfile}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Left: Photo */}
                  <div className="w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {staff.photoUrl ? (
                      <img 
                        src={staff.photoUrl} 
                        alt={staff.nameEn} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                        <Search className="w-8 h-8 opacity-10" />
                      </div>
                    )}
                  </div>

                  {/* Right: Info */}
                  <div className="flex-1 min-w-0 pt-1">
                    <h4 className="font-khmer font-black text-lg text-slate-900 dark:text-white truncate leading-tight mb-1">
                      {staff.nameKh}
                    </h4>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 truncate mb-3 tracking-wide">
                      {staff.nameEn}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                        staff.gender === 'ប្រុស' 
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                          : "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                      )}>
                        {staff.gender === 'ប្រុស' ? t.male : t.female}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-bold border border-slate-200 dark:border-slate-600 truncate max-w-[100px]">
                        {staff.title}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-khmer font-medium text-slate-700 dark:text-slate-300 truncate">
                        {staff.position}
                      </p>
                      <p className="text-[10px] font-khmer text-slate-500 dark:text-slate-500 truncate">
                        {staff.institution?.office}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-8 h-8 opacity-20" />
                <span className="text-sm font-medium">{t.noData}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="w-full bg-white/50 backdrop-blur-lg dark:bg-[#001a4d]/70 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all">
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span>{t.itemsPerPage}</span>
              <select 
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 outline-none focus:border-primary dark:focus:border-sky-400 dark:text-slate-300"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>{pageSize}</option>
                ))}
              </select>
            </div>
            <span>
              {t.showing} {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} {t.to} {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} {t.of} {data.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: table.getPageCount() }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => table.setPageIndex(i)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                    table.getState().pagination.pageIndex === i 
                      ? "bg-primary text-white" 
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
      </div>
    </div>
  );
}
