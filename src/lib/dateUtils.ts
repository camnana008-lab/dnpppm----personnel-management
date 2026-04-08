
import { Language } from '../translations';

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

export const parseKhmerDate = (dateStr: string) => {
  if (!dateStr) return null;
  
  // Handle YYYY-MM-DD if it comes from a date input
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(dateStr);
  }

  // Handle DD-Month-YYYY (Khmer)
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return null;

  const day = parseInt(khmerToArabic(parts[0]));
  const monthPart = parts[1];
  const year = parseInt(khmerToArabic(parts[2]));

  const monthIndex = KHMER_MONTHS.indexOf(monthPart);
  if (monthIndex === -1) {
    // Try parsing as number if not found in Khmer months
    const month = parseInt(khmerToArabic(monthPart));
    if (!isNaN(month)) return new Date(year, month - 1, day);
    
    // Try English months if needed (optional, but good for mock data)
    const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const enMonthIndex = enMonths.findIndex(m => monthPart.startsWith(m));
    if (enMonthIndex !== -1) return new Date(year, enMonthIndex, day);

    return null;
  }

  return new Date(year, monthIndex, day);
};

export const arabicToKhmer = (num: number | string) => {
  const map: { [key: string]: string } = {
    '0': '០', '1': '១', '2': '២', '3': '៣', '4': '៤',
    '5': '៥', '6': '៦', '7': '៧', '8': '៨', '9': '៩'
  };
  return num.toString().replace(/\d/g, (m) => map[m]);
};

export const calculateAge = (dobStr: string) => {
  const dob = parseKhmerDate(dobStr);
  if (!dob || isNaN(dob.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const calculateSeniority = (dateStr: string, lang: Language) => {
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
