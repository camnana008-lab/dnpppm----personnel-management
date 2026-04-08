import { Save, X, PlusCircle, Camera, ChevronRight, Trash2, Paperclip, Calendar as CalendarIcon, Check } from 'lucide-react';
import { StaffProfile, StaffHistoryItem } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { useState, FormEvent, ChangeEvent } from 'react';
import { Language, translations } from '@/src/translations';
import { auth, storage } from '@/src/lib/firebase';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from 'date-fns';
import { km } from 'date-fns/locale';

const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const khmerToArabic = (str: string) => {
  const map: { [key: string]: string } = {
    '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
    '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9'
  };
  return str.replace(/[០-៩]/g, (m) => map[m]);
};

const parseKhmerDate = (dateStr: string) => {
  if (!dateStr) return null;
  
  // Handle YYYY-MM-DD if it comes from a date input
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(dateStr);
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY or DD-Month-YYYY
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return null;

  const day = parseInt(khmerToArabic(parts[0]));
  const monthPart = parts[1];
  const year = parseInt(khmerToArabic(parts[2]));

  const monthIndex = KHMER_MONTHS.indexOf(monthPart);
  if (monthIndex === -1) {
    const month = parseInt(khmerToArabic(monthPart));
    if (!isNaN(month)) return new Date(year, month - 1, day);
    return null;
  }

  return new Date(year, monthIndex, day);
};

const calculateSeniority = (dateStr: string, lang: Language) => {
  const startDate = parseKhmerDate(dateStr);
  if (!startDate || isNaN(startDate.getTime())) return '---';
  
  const now = new Date();
  if (startDate > now) return lang === 'kh' ? '០ ខែ' : '0 Month';

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const yearStr = years > 0 ? `${years} ${lang === 'kh' ? 'ឆ្នាំ' : 'Year'}` : '';
  const monthStr = months > 0 ? `${months} ${lang === 'kh' ? 'ខែ' : 'Month'}` : '';

  if (!yearStr && !monthStr) return lang === 'kh' ? '០ ខែ' : '0 Month';
  return `${yearStr} ${monthStr}`.trim();
};

interface ProfileFormProps {
  initialData?: StaffProfile;
  onSave: (data: StaffProfile) => Promise<boolean>;
  onCancel: () => void;
  language: Language;
  isDarkMode?: boolean;
}

const safeParseDate = (dateStr: string) => {
  if (!dateStr) return null;
  try {
    const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (e) {
    return null;
  }
};

export default function ProfileForm({ initialData, onSave, onCancel, language, isDarkMode }: ProfileFormProps) {
  const t = translations[language];
  const [formData, setFormData] = useState<StaffProfile>(initialData || {
    id: '',
    staffId: '',
    nameKh: '',
    nameEn: '',
    gender: 'ប្រុស',
    dob: '',
    position: '',
    title: '',
    phone: '',
    address: '',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFCpqctgRcJy3T4qxX0RxoqoYAezNsUDdY2j-wjr7joDsqBmY3jXDJH4Z0yNHVfPaHN4qFioJO2CNO9Rya2rzd74hiD9rGQPktTmf-Y8L_vk23dFkbZ92yypxJg21So5RXjZ9kT2jbM3lDgS5tlzK3CAq5nO_CHbgq_CyeNkeAdzxhk1GOQe50bnW_t5zrGnjxqrv_Lw4hwmQ39ZbXOcGX78SSlYWwD7V5Mcy3gnGsnjmqWhLdP-jGT9nbmpQU5cUocjechkMN7tiC',
    institution: {
      ministry: '',
      generalDept: '',
      department: '',
      office: '',
    },
    employmentHistory: initialData?.employmentHistory || [],
    educationHistory: initialData?.educationHistory || [],
    workHistory: initialData?.workHistory || [],
    positionHistory: initialData?.positionHistory || [],
    titleHistory: initialData?.titleHistory || [],
    awardsHistory: initialData?.awardsHistory || [],
    disciplineHistory: initialData?.disciplineHistory || [],
  });

  const [activeTab, setActiveTab] = useState('position');
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null);

  const getHistoryField = (tabId: string): keyof StaffProfile => {
    switch (tabId) {
      case 'position': return 'positionHistory';
      case 'title': return 'titleHistory';
      case 'commendation': return 'awardsHistory';
      case 'discipline': return 'disciplineHistory';
      case 'education': return 'educationHistory';
      case 'history': return 'workHistory';
      default: return 'employmentHistory';
    }
  };

  const activeHistoryField = getHistoryField(activeTab);
  const activeHistory = (formData[activeHistoryField] || []) as any[];

  const handleAddRow = () => {
    let newRow: any;
    if (activeTab === 'education') {
      newRow = { id: crypto.randomUUID(), degree: '', major: '', school: '', year: '' };
    } else if (activeTab === 'history') {
      newRow = { id: crypto.randomUUID(), organization: '', role: '', startDate: '', endDate: '' };
    } else {
      newRow = { id: crypto.randomUUID(), docNumber: '', date: '', status: '', note: '' };
    }
    
    setFormData(prev => ({
      ...prev,
      [activeHistoryField]: [...(prev[activeHistoryField] as any[] || []), newRow],
    }));
  };

  const handleDeleteRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      [activeHistoryField]: (prev[activeHistoryField] as any[] || []).filter(item => item.id !== id),
    }));
  };

  const handleUpdateRow = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [activeHistoryField]: (prev[activeHistoryField] as any[] || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleFileChange = async (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingRowId(id);
      setFormError(null);
      const fieldToUpdate = activeHistoryField;
      
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        const now = new Date();
        const dateFolder = `${now.getMonth() + 1}_${now.getDate()}_${now.getFullYear()}`;
        const fileId = Math.random().toString(36).substring(2, 15);
        const filePath = `users/${user.uid}/attachments/${dateFolder}/${fileId}_${file.name}`;
        
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        
        const downloadURL = await getDownloadURL(storageRef);

        setFormData(prev => ({
          ...prev,
          [fieldToUpdate]: (prev[fieldToUpdate] as any[] || []).map((item) =>
            item.id === id ? { ...item, attachmentName: file.name, attachmentUrl: downloadURL } : item
          ),
        }));
      } catch (error) {
        console.error("Upload error:", error);
        setFormError(language === 'kh' ? 'ការបង្ហោះឯកសារបានបរាជ័យ' : `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setUploadingRowId(null);
        if (e.target) e.target.value = '';
      }
    }
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setFormError(null);
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        const now = new Date();
        const dateFolder = `${now.getMonth() + 1}_${now.getDate()}_${now.getFullYear()}`;
        const fileId = Math.random().toString(36).substring(2, 15);
        const filePath = `users/${user.uid}/photos/${dateFolder}/${fileId}_${file.name}`;
        
        const storageRef = ref(storage, filePath);
        console.log("Uploading to bucket:", storage.app.options.storageBucket);
        console.log("File path:", filePath);
        await uploadBytes(storageRef, file);
        
        const downloadURL = await getDownloadURL(storageRef);
        
        setFormData({
          ...formData,
          photoUrl: downloadURL
        });
      } catch (error) {
        console.error("Photo processing error:", error);
        setFormError(language === 'kh' ? 'ការបង្ហោះរូបថតបានបរាជ័យ' : `Photo upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Basic validation
    const requiredFields = ['staffId', 'nameKh', 'nameEn', 'dob'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof StaffProfile]);
    
    if (missingFields.length > 0) {
      setFormError(`${t.pleaseFillAllRequiredFields}: ${missingFields.join(', ')}`);
      return;
    }

    setIsUploading(true);
    const success = await onSave(formData);
    setIsUploading(false);
    
    if (!success) {
      // Error message is handled in App.tsx via alert, but we can also set formError here
      setFormError(language === 'kh' ? 'ការរក្សាទុកបានបរាជ័យ ឬមានទិន្នន័យស្ទួន' : 'Save failed or duplicate data found');
    }
  };

  const tabs = [
    { id: 'position', label: t.position },
    { id: 'title', label: t.title },
    { id: 'commendation', label: t.awards },
    { id: 'discipline', label: t.discipline },
    { id: 'education', label: t.education },
    { id: 'history', label: t.workHistory },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
          <button 
            onClick={onCancel}
            className="text-[10px] font-bold uppercase tracking-widest hover:text-primary dark:hover:text-sky-400 transition-colors"
          >
            {t.staffList}
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary dark:text-sky-400">
            {initialData?.staffId ? t.editStaff : t.addNewStaff}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
          {initialData ? initialData.nameKh : (language === 'kh' ? 'បន្ថែមមន្ត្រីថ្មី' : t.addNewStaff)}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Form Error Message */}
        {formError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
            {formError}
          </div>
        )}
        
        {/* Section 1: Main Identification Section */}
        <div className="border-2 border-primary dark:border-sky-500 p-4 md:p-5 bg-white/50 backdrop-blur-lg dark:bg-[#001a4d]/70 rounded-xl shadow-sm grid grid-cols-12 gap-4 md:gap-6 relative transition-colors">
          {/* Left: Photo & Codes */}
          <div className="col-span-12 md:col-span-3 flex flex-col gap-3">
            <div 
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="w-full aspect-[4/5] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 group hover:border-primary dark:hover:border-sky-400 transition-all cursor-pointer overflow-hidden relative"
            >
              <input 
                id="photo-upload"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <img 
                alt="Profile placeholder" 
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" 
                src={formData.photoUrl}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
                <span className="text-white text-[10px] font-bold mt-1">{t.changePhoto}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 min-w-[80px] rounded transition-colors">{t.staffId}</span>
                <input 
                  type="text" 
                  className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent py-1 text-sm focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors dark:text-white"
                  placeholder="---"
                  value={formData.staffId}
                  onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 min-w-[80px] rounded transition-colors">{t.gender}</span>
                <select 
                  className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent py-1 text-sm focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors dark:text-white"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                >
                  <option value="ប្រុស">{t.male}</option>
                  <option value="ស្រី">{t.female}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Middle: Personal Fields */}
          <div className="col-span-12 md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 min-w-[110px] rounded transition-colors">{t.nameKh}:</span>
              <input 
                type="text" 
                className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent py-1 text-sm font-bold focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors dark:text-white"
                placeholder={language === 'kh' ? 'គោត្តនាម និងនាម' : 'Full Name (Khmer)'}
                value={formData.nameKh}
                onChange={(e) => setFormData({...formData, nameKh: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 min-w-[110px] rounded transition-colors">{t.nameEn}:</span>
              <input 
                type="text" 
                className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent py-1 text-sm font-semibold uppercase focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors dark:text-white"
                placeholder="FULL NAME"
                value={formData.nameEn}
                onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 min-w-[110px] rounded transition-colors">{t.dob}</span>
              <div className="flex-1 relative">
                <DatePicker
                  selected={safeParseDate(formData.dob)}
                  onChange={(date) => setFormData({...formData, dob: date ? format(date, 'dd/MM/yyyy') : ''})}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="ថ្ងៃ-ខែ-ឆ្នាំ (dd/mm/yyyy)"
                  className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent py-1 text-sm focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors pr-8 dark:text-white"
                  locale={language === 'kh' ? km : undefined}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  maxDate={new Date()}
                />
                <CalendarIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 min-w-[110px] rounded transition-colors">{t.position}</span>
              <select 
                className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent py-1 text-sm focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors dark:text-white"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              >
                <option value="">{language === 'kh' ? 'សូមជ្រើសរើសមុខតំណែង' : 'Select Position'}</option>
                {[
                  'ប្រធាននាយកដ្ឋាន', 'អនុប្រធាននាយកដ្ឋាន', 'នាយការិយាល័យ',
                  'នាយរងការិយាល័យ', 'នាយផ្នែក', 'នាយរងផ្នែក', 'មន្ត្រី'
                ].map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 min-w-[110px] rounded transition-colors">{t.title}</span>
              <select 
                className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent py-1 text-sm focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors dark:text-white"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              >
                <option value="">{language === 'kh' ? 'សូមជ្រើសរើសងារ' : 'Select Rank'}</option>
                {[
                  'ឧត្តមសេនីយ៍ឯក', 'ឧត្តមសេនីយ៍ទោ', 'ឧត្តមសេនីយ៍ត្រី',
                  'វរសេនីយ៍ឯក', 'វរសេនីយ៍ទោ', 'វរសេនីយ៍ត្រី',
                  'អនុសេនីយ៍ឯក', 'អនុសេនីយ៍ទោ', 'អនុសេនីយ៍ត្រី',
                  'ព្រឹន្ទបាលឯក', 'ព្រឹន្ទបាលទោ', 'ព្រឹន្ទបាលត្រី'
                ].map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 min-w-[110px] rounded transition-colors">{t.phone}</span>
              <input 
                type="tel" 
                className="flex-1 border-b border-slate-200 dark:border-slate-700 bg-transparent py-1 text-sm focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors font-mono dark:text-white"
                placeholder="0XX XXX XXX"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 w-full rounded transition-colors">{t.address}</span>
              <textarea 
                className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent py-1 text-sm focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors min-h-[50px] dark:text-white"
                placeholder={language === 'kh' ? 'អាសយដ្ឋានលម្អិត...' : 'Detailed address...'}
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              ></textarea>
            </div>
          </div>

          {/* Right: Institution Selector */}
          <div className="col-span-12 md:col-span-4 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-4 bg-slate-50/30 dark:bg-slate-900/30 transition-colors">
            <div className="text-center mb-4 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <span className="relative font-bold text-primary dark:text-sky-400 px-5 bg-white dark:bg-slate-800 border border-primary dark:border-sky-500 rounded-full py-1 text-[10px] uppercase tracking-widest transition-colors">
                {t.institution}
              </span>
            </div>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{t.ministry}</label>
                <select 
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-primary/20 dark:focus:ring-sky-400/20 dark:text-white transition-colors"
                  value={formData.institution.ministry}
                  onChange={(e) => setFormData({...formData, institution: {...formData.institution, ministry: e.target.value}})}
                >
                  <option value="">{language === 'kh' ? 'សូមជ្រើសរើសក្រសួង' : 'Select Ministry'}</option>
                  <option value="ក្រសួងមុខងារសាធារណៈ">ក្រសួងមុខងារសាធារណៈ</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{t.generalDept}</label>
                <select 
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-primary/20 dark:focus:ring-sky-400/20 dark:text-white transition-colors"
                  value={formData.institution.generalDept}
                  onChange={(e) => setFormData({...formData, institution: {...formData.institution, generalDept: e.target.value}})}
                >
                  <option value="">{language === 'kh' ? 'សូមជ្រើសរើសអគ្គនាយកដ្ឋាន' : 'Select General Dept'}</option>
                  <option value="អគ្គនាយកដ្ឋានរដ្ឋបាល">អគ្គនាយកដ្ឋានរដ្ឋបាល</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{t.department}</label>
                <select 
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-primary/20 dark:focus:ring-sky-400/20 dark:text-white transition-colors"
                  value={formData.institution.department}
                  onChange={(e) => setFormData({...formData, institution: {...formData.institution, department: e.target.value}})}
                >
                  <option value="">{language === 'kh' ? 'សូមជ្រើសរើសនាយកដ្ឋាន' : 'Select Department'}</option>
                  <option value="នាយកដ្ឋានបុគ្គលិក">នាយកដ្ឋានបុគ្គលិក</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{t.office}</label>
                <select 
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-primary/20 dark:focus:ring-sky-400/20 dark:text-white transition-colors"
                  value={formData.institution.office}
                  onChange={(e) => setFormData({...formData, institution: {...formData.institution, office: e.target.value}})}
                >
                  <option value="">{language === 'kh' ? 'សូមជ្រើសរើសការិយាល័យ' : 'Select Office'}</option>
                  {[
                    'ថ្នាក់ដឹកនាំ', 'កា.ទី១', 'កា.ទី២', 'កា.ទី៣', 'កា.ទី៤', 'កា.ទី៥', 'កា.ទី៦'
                  ].map(office => (
                    <option key={office} value={office}>{office}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Employment History Table */}
        <div className="border-2 border-primary dark:border-sky-500 p-4 md:p-5 bg-white/50 backdrop-blur-lg dark:bg-[#001a4d]/70 rounded-xl shadow-sm relative pt-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-white dark:bg-slate-800 border-2 border-primary dark:border-sky-500 px-6 py-1.5 rounded-full shadow-sm font-bold text-[10px] text-primary dark:text-sky-400">
              {tabs.find(t => t.id === activeTab)?.label}
            </span>
          </div>
          
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 md:col-span-3 space-y-1.5">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full py-2 px-3 border transition-all duration-200 rounded-lg text-xs text-left",
                    activeTab === tab.id 
                      ? "border-primary dark:border-sky-500 bg-primary dark:bg-sky-600 text-white font-bold shadow-md" 
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="col-span-12 md:col-span-9">
              <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-primary/90 dark:bg-sky-800 text-white text-[10px] uppercase tracking-wider">
                      {activeTab === 'education' ? (
                        <>
                          <th className="border-r border-white/20 p-3 font-bold text-left">{t.degree}</th>
                          <th className="border-r border-white/20 p-3 font-bold text-left">{t.major}</th>
                          <th className="border-r border-white/20 p-3 font-bold text-left">{t.school}</th>
                          <th className="border-r border-white/20 p-3 font-bold text-left w-32">{t.year}</th>
                        </>
                      ) : activeTab === 'history' ? (
                        <>
                          <th className="border-r border-white/20 p-3 font-bold text-left">{t.organization}</th>
                          <th className="border-r border-white/20 p-3 font-bold text-left">{t.role}</th>
                          <th className="border-r border-white/20 p-3 font-bold text-left w-40">{t.startDate}</th>
                          <th className="border-r border-white/20 p-3 font-bold text-left w-40">{t.endDate}</th>
                        </>
                      ) : (
                        <>
                          <th className="border-r border-white/20 p-3 font-bold text-left">{t.docNumber}</th>
                          <th className="border-r border-white/20 p-3 font-bold text-left w-40">{t.docDate}</th>
                          <th className="border-r border-white/20 p-3 font-bold text-left w-32">{t.seniority}</th>
                          <th className="border-r border-white/20 p-3 font-bold text-left">{t.note}</th>
                        </>
                      )}
                      <th className="border-r border-white/20 p-3 font-bold text-center w-24">{t.attachFile}</th>
                      <th className="p-3 font-bold text-center w-12">{t.delete}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeHistory.map((item, idx) => (
                      <tr key={item.id} className={cn(
                        "group transition-colors",
                        idx % 2 === 0 
                          ? "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60" 
                          : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      )}>
                        {activeTab === 'education' ? (
                          <>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <input type="text" className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs transition-all dark:text-slate-200" value={item.degree} onChange={(e) => handleUpdateRow(item.id, 'degree', e.target.value)} />
                            </td>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <input type="text" className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs transition-all dark:text-slate-200" value={item.major} onChange={(e) => handleUpdateRow(item.id, 'major', e.target.value)} />
                            </td>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <input type="text" className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs transition-all dark:text-slate-200" value={item.school} onChange={(e) => handleUpdateRow(item.id, 'school', e.target.value)} />
                            </td>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <input type="text" className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs transition-all dark:text-slate-200" value={item.year} onChange={(e) => handleUpdateRow(item.id, 'year', e.target.value)} />
                            </td>
                          </>
                        ) : activeTab === 'history' ? (
                          <>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <input type="text" className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs transition-all dark:text-slate-200" value={item.organization} onChange={(e) => handleUpdateRow(item.id, 'organization', e.target.value)} />
                            </td>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <input type="text" className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs transition-all dark:text-slate-200" value={item.role} onChange={(e) => handleUpdateRow(item.id, 'role', e.target.value)} />
                            </td>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <div className="relative">
                                <DatePicker
                                  selected={safeParseDate(item.startDate)}
                                  onChange={(date) => handleUpdateRow(item.id, 'startDate', date ? format(date, 'dd/MM/yyyy') : '')}
                                  dateFormat="dd/MM/yyyy"
                                  placeholderText="dd/mm/yyyy"
                                  className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs transition-all pr-6 dark:text-slate-200"
                                  locale={language === 'kh' ? km : undefined}
                                  showYearDropdown
                                  scrollableYearDropdown
                                  yearDropdownItemNumber={100}
                                />
                                <CalendarIcon className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </td>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <div className="relative">
                                <DatePicker
                                  selected={safeParseDate(item.endDate)}
                                  onChange={(date) => handleUpdateRow(item.id, 'endDate', date ? format(date, 'dd/MM/yyyy') : '')}
                                  dateFormat="dd/MM/yyyy"
                                  placeholderText="dd/mm/yyyy"
                                  className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs transition-all pr-6 dark:text-slate-200"
                                  locale={language === 'kh' ? km : undefined}
                                  showYearDropdown
                                  scrollableYearDropdown
                                  yearDropdownItemNumber={100}
                                />
                                <CalendarIcon className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <input 
                                type="text" 
                                className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs font-mono transition-all dark:text-slate-200" 
                                placeholder="---" 
                                value={item.docNumber}
                                onChange={(e) => handleUpdateRow(item.id, 'docNumber', e.target.value)}
                              />
                            </td>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <div className="relative">
                                <DatePicker
                                  selected={safeParseDate(item.date)}
                                  onChange={(date) => handleUpdateRow(item.id, 'date', date ? format(date, 'dd/MM/yyyy') : '')}
                                  dateFormat="dd/MM/yyyy"
                                  placeholderText="dd/mm/yyyy"
                                  className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs transition-all pr-6 dark:text-slate-200"
                                  locale={language === 'kh' ? km : undefined}
                                  showYearDropdown
                                  scrollableYearDropdown
                                  yearDropdownItemNumber={100}
                                />
                                <CalendarIcon className="w-3 h-3 text-slate-400 dark:text-slate-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </td>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <div className="w-full p-1.5 text-[10px] font-bold text-primary dark:text-sky-400 bg-primary/5 dark:bg-sky-400/5 rounded border border-primary/10 dark:border-sky-400/10 text-center">
                                {calculateSeniority(item.date, language)}
                              </div>
                            </td>
                            <td className="border-r border-slate-100 dark:border-slate-700 p-1">
                              <input 
                                type="text" 
                                className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 rounded p-1.5 focus:ring-0 text-xs transition-all dark:text-slate-200" 
                                placeholder="..." 
                                value={item.note}
                                onChange={(e) => handleUpdateRow(item.id, 'note', e.target.value)}
                              />
                            </td>
                          </>
                        )}
                        <td className="border-r border-slate-100 dark:border-slate-700 p-1 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {uploadingRowId === item.id ? (
                              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                              <label className="cursor-pointer p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-sky-400 transition-colors rounded-md hover:bg-primary/10 dark:hover:bg-sky-400/10 flex items-center justify-center">
                                <Paperclip className={cn("w-4 h-4", item.attachmentName && "text-primary dark:text-sky-400")} />
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  onChange={(e) => handleFileChange(item.id, e)}
                                />
                              </label>
                            )}
                            {item.attachmentName && (
                              <div className="flex flex-col items-center">
                                <span className="text-[8px] text-primary dark:text-sky-400 font-bold truncate max-w-[80px] block px-1" title={item.attachmentName}>
                                  {item.attachmentName}
                                </span>
                                <span className="text-[7px] text-emerald-500 font-bold flex items-center gap-0.5">
                                  <Check className="w-2 h-2" />
                                  {t.fileAttached}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-1 text-center">
                          <button 
                            type="button"
                            onClick={() => handleDeleteRow(item.id)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Add some empty rows if list is short for visual consistency */}
                    {activeHistory.length < 3 && Array.from({ length: 3 - activeHistory.length }).map((_, i) => (
                      <tr key={`empty-${i}`} className={(activeHistory.length + i) % 2 === 0 ? "bg-slate-50 dark:bg-slate-800/50" : "bg-white dark:bg-slate-900"}>
                        <td className="border-r border-slate-100 dark:border-slate-700 p-2 h-10"></td>
                        <td className="border-r border-slate-100 dark:border-slate-700 p-2 h-10"></td>
                        <td className="border-r border-slate-100 dark:border-slate-700 p-2 h-10"></td>
                        <td className="border-r border-slate-100 dark:border-slate-700 p-2 h-10"></td>
                        <td className="border-r border-slate-100 dark:border-slate-700 p-2 h-10"></td>
                        <td className="p-2 h-10"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  type="button" 
                  onClick={handleAddRow}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary dark:text-sky-400 hover:text-primary-dim dark:hover:text-sky-300 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  {t.addRow}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex justify-end gap-4 pt-6 pb-12">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            {t.cancel}
          </button>
          <button 
            type="submit" 
            disabled={isUploading}
            className={cn(
              "px-12 py-3 bg-primary dark:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 dark:shadow-sky-400/20 hover:bg-primary-dim dark:hover:bg-sky-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 border-2 border-primary/20 dark:border-sky-400/20",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isUploading ? (language === 'kh' ? 'កំពុងបង្ហោះ...' : 'Uploading...') : t.save}
          </button>
        </div>
      </form>

      {/* Background Watermark */}
      <div className="fixed bottom-12 right-12 opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
        <span className="text-9xl font-black text-primary dark:text-sky-500">SOVEREIGN</span>
      </div>
    </div>
  );
}
