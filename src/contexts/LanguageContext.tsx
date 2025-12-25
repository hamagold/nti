import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ku' | 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations: Record<Language, Record<string, string>> = {
  ku: {
    // Navigation
    'nav.home': 'سەرەکی',
    'nav.departments': 'بەشەکان',
    'nav.activities': 'چالاکییەکان',
    'nav.about': 'دەربارە',
    'nav.contact': 'پەیوەندی',
    
    // Hero
    'hero.title': 'پەیمانگای تەکنیکی نیشتمانی',
    'hero.subtitle': 'پەروەردەی تەکنیکی بۆ داهاتووی ڕۆشن',
    'hero.description': 'ئێمە پڕۆگرامی خوێندنی پیشەیی و تەکنیکی دەخوێنین کە قوتابیانمان ئامادە دەکات بۆ سەرکەوتن لە بازاڕی کار',
    'hero.apply': 'تۆمارکردن',
    'hero.learn': 'زیاتر بزانە',
    
    // Departments
    'dept.title': 'بەشەکانی خوێندن',
    'dept.computer': 'کۆمپیوتەر',
    'dept.computer.desc': 'فێربوونی پڕۆگرامینگ، نێتوۆرک، و تەکنەلۆژیای زانیاری',
    'dept.patrol': 'پاتڕۆل',
    'dept.patrol.desc': 'فێربوونی ئەندازیاری نەوت و گاز و پاڵاوتن',
    'dept.accounting': 'ژمێریاری',
    'dept.accounting.desc': 'فێربوونی ژمێریاری، داراییی، و بەڕێوەبەرایەتی',
    'dept.admin': 'کارگێڕی',
    'dept.admin.desc': 'فێربوونی بەڕێوەبەرایەتی کار و بازرگانی',
    'dept.years': 'ماوەی خوێندن: ٥ ساڵ',
    'dept.rooms': 'ژوورەکان: A، B، C',
    
    // Years
    'year.1': 'ساڵی یەکەم',
    'year.2': 'ساڵی دووەم',
    'year.3': 'ساڵی سێیەم',
    'year.4': 'ساڵی چوارەم',
    'year.5': 'ساڵی پێنجەم',
    
    // Computer Curriculum
    'computer.year1': 'بنەماکانی کۆمپیوتەر، Windows، Office، تایپکردن',
    'computer.year2': 'پڕۆگرامینگ بەکارهێنانی C++، HTML، CSS',
    'computer.year3': 'JavaScript، Database، PHP',
    'computer.year4': 'نێتوۆرکینگ، سێرڤەر، کلاود',
    'computer.year5': 'پڕۆژەی کۆتایی، تایبەتمەندی',
    
    // Patrol Curriculum
    'patrol.year1': 'کیمیا، فیزیا، ماتماتیک',
    'patrol.year2': 'ئەندازیاری نەوت، جیۆلۆژی',
    'patrol.year3': 'پاڵاوتنی نەوت، پرۆسێسینگ',
    'patrol.year4': 'سەلامەتی پیشەیی، دەزگاکان',
    'patrol.year5': 'پڕۆژەی کۆتایی، شانسکاری',
    
    // Accounting Curriculum
    'accounting.year1': 'بنەماکانی ژمێریاری، ماتماتیک',
    'accounting.year2': 'ژمێریاری تێچووەکان، خەرجییەکان',
    'accounting.year3': 'ژمێریاری کۆمپانیاکان، باج',
    'accounting.year4': 'پشکنینی ژمێریاری، داراییی',
    'accounting.year5': 'پڕۆژەی کۆتایی، ڕاپۆرتنووسی',
    
    // Admin Curriculum
    'admin.year1': 'بنەماکانی بەڕێوەبەرایەتی، کۆمپیوتەر',
    'admin.year2': 'بەڕێوەبەرایەتی کەسایەتی، پەیوەندییەکان',
    'admin.year3': 'بەڕێوەبەرایەتی پڕۆژە، پلاندانان',
    'admin.year4': 'بازرگانی ئەلیکترۆنی، ماکێتینگ',
    'admin.year5': 'پڕۆژەی کۆتایی، داڕشتنی کار',
    
    // Activities
    'activities.title': 'چالاکییە نوێیەکان',
    'activities.readMore': 'زیاتر بخوێنەوە',
    
    // Contact
    'contact.title': 'پەیوەندی',
    'contact.address': 'ناونیشان',
    'contact.phone': 'تەلەفۆن',
    'contact.email': 'ئیمەیڵ',
    'contact.location': 'شوێن',
    
    // Footer
    'footer.rights': 'هەموو مافەکان پارێزراون',
    'footer.developer': 'دروستکراوە لەلایەن قوتابی: محمد سلێمان احمد',
    
    // About
    'about.title': 'دەربارەی پەیمانگا',
    'about.description': 'پەیمانگای تەکنیکی نیشتمانی یەکێکە لە باشترین پەیمانگاکانی هەرێم کە لە ساڵی ٢٠١٠ دامەزراوە. ئێمە خزمەتی پەروەردەی تەکنیکی و پیشەیی دەکەین بۆ قوتابیانی هەموو بەشەکان.',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.departments': 'الأقسام',
    'nav.activities': 'النشاطات',
    'nav.about': 'حول',
    'nav.contact': 'اتصل بنا',
    
    // Hero
    'hero.title': 'المعهد التقني الوطني',
    'hero.subtitle': 'التعليم التقني لمستقبل مشرق',
    'hero.description': 'نقدم برامج تعليمية مهنية وتقنية تُعد طلابنا للنجاح في سوق العمل',
    'hero.apply': 'التسجيل',
    'hero.learn': 'اعرف المزيد',
    
    // Departments
    'dept.title': 'الأقسام الدراسية',
    'dept.computer': 'الحاسوب',
    'dept.computer.desc': 'تعلم البرمجة والشبكات وتكنولوجيا المعلومات',
    'dept.patrol': 'البترول',
    'dept.patrol.desc': 'تعلم هندسة النفط والغاز والتكرير',
    'dept.accounting': 'المحاسبة',
    'dept.accounting.desc': 'تعلم المحاسبة والمالية والإدارة',
    'dept.admin': 'الإدارة',
    'dept.admin.desc': 'تعلم إدارة الأعمال والتجارة',
    'dept.years': 'مدة الدراسة: ٥ سنوات',
    'dept.rooms': 'الغرف: A، B، C',
    
    // Years
    'year.1': 'السنة الأولى',
    'year.2': 'السنة الثانية',
    'year.3': 'السنة الثالثة',
    'year.4': 'السنة الرابعة',
    'year.5': 'السنة الخامسة',
    
    // Computer Curriculum
    'computer.year1': 'أساسيات الحاسوب، Windows، Office، الطباعة',
    'computer.year2': 'البرمجة بـ C++، HTML، CSS',
    'computer.year3': 'JavaScript، قواعد البيانات، PHP',
    'computer.year4': 'الشبكات، السيرفرات، الكلاود',
    'computer.year5': 'مشروع التخرج، التخصص',
    
    // Patrol Curriculum
    'patrol.year1': 'الكيمياء، الفيزياء، الرياضيات',
    'patrol.year2': 'هندسة النفط، الجيولوجيا',
    'patrol.year3': 'تكرير النفط، المعالجة',
    'patrol.year4': 'السلامة المهنية، المعدات',
    'patrol.year5': 'مشروع التخرج، التدريب الميداني',
    
    // Accounting Curriculum
    'accounting.year1': 'أساسيات المحاسبة، الرياضيات',
    'accounting.year2': 'محاسبة التكاليف، المصروفات',
    'accounting.year3': 'محاسبة الشركات، الضرائب',
    'accounting.year4': 'التدقيق المحاسبي، المالية',
    'accounting.year5': 'مشروع التخرج، كتابة التقارير',
    
    // Admin Curriculum
    'admin.year1': 'أساسيات الإدارة، الحاسوب',
    'admin.year2': 'إدارة الموارد البشرية، العلاقات',
    'admin.year3': 'إدارة المشاريع، التخطيط',
    'admin.year4': 'التجارة الإلكترونية، التسويق',
    'admin.year5': 'مشروع التخرج، تخطيط الأعمال',
    
    // Activities
    'activities.title': 'آخر النشاطات',
    'activities.readMore': 'اقرأ المزيد',
    
    // Contact
    'contact.title': 'اتصل بنا',
    'contact.address': 'العنوان',
    'contact.phone': 'الهاتف',
    'contact.email': 'البريد الإلكتروني',
    'contact.location': 'الموقع',
    
    // Footer
    'footer.rights': 'جميع الحقوق محفوظة',
    'footer.developer': 'تم التطوير بواسطة الطالب: محمد سليمان أحمد',
    
    // About
    'about.title': 'عن المعهد',
    'about.description': 'المعهد التقني الوطني هو أحد أفضل المعاهد في الإقليم، تأسس عام ٢٠١٠. نقدم خدمات التعليم التقني والمهني لطلاب جميع الأقسام.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.departments': 'Departments',
    'nav.activities': 'Activities',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.title': 'National Technical Institute',
    'hero.subtitle': 'Technical Education for a Bright Future',
    'hero.description': 'We offer professional and technical education programs that prepare our students for success in the job market',
    'hero.apply': 'Apply Now',
    'hero.learn': 'Learn More',
    
    // Departments
    'dept.title': 'Our Departments',
    'dept.computer': 'Computer',
    'dept.computer.desc': 'Learn programming, networking, and IT',
    'dept.patrol': 'Petroleum',
    'dept.patrol.desc': 'Learn oil & gas engineering and refining',
    'dept.accounting': 'Accounting',
    'dept.accounting.desc': 'Learn accounting, finance, and management',
    'dept.admin': 'Administration',
    'dept.admin.desc': 'Learn business management and commerce',
    'dept.years': 'Duration: 5 Years',
    'dept.rooms': 'Rooms: A, B, C',
    
    // Years
    'year.1': 'First Year',
    'year.2': 'Second Year',
    'year.3': 'Third Year',
    'year.4': 'Fourth Year',
    'year.5': 'Fifth Year',
    
    // Computer Curriculum
    'computer.year1': 'Computer Basics, Windows, Office, Typing',
    'computer.year2': 'Programming with C++, HTML, CSS',
    'computer.year3': 'JavaScript, Database, PHP',
    'computer.year4': 'Networking, Servers, Cloud',
    'computer.year5': 'Final Project, Specialization',
    
    // Patrol Curriculum
    'patrol.year1': 'Chemistry, Physics, Mathematics',
    'patrol.year2': 'Petroleum Engineering, Geology',
    'patrol.year3': 'Oil Refining, Processing',
    'patrol.year4': 'Occupational Safety, Equipment',
    'patrol.year5': 'Final Project, Field Training',
    
    // Accounting Curriculum
    'accounting.year1': 'Accounting Basics, Mathematics',
    'accounting.year2': 'Cost Accounting, Expenses',
    'accounting.year3': 'Corporate Accounting, Taxes',
    'accounting.year4': 'Auditing, Finance',
    'accounting.year5': 'Final Project, Report Writing',
    
    // Admin Curriculum
    'admin.year1': 'Management Basics, Computer',
    'admin.year2': 'HR Management, Relations',
    'admin.year3': 'Project Management, Planning',
    'admin.year4': 'E-Commerce, Marketing',
    'admin.year5': 'Final Project, Business Planning',
    
    // Activities
    'activities.title': 'Latest Activities',
    'activities.readMore': 'Read More',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.address': 'Address',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.location': 'Location',
    
    // Footer
    'footer.rights': 'All Rights Reserved',
    'footer.developer': 'Developed by Student: Muhammad Suleiman Ahmed',
    
    // About
    'about.title': 'About the Institute',
    'about.description': 'National Technical Institute is one of the best institutes in the region, established in 2010. We provide technical and vocational education services for students of all departments.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ku');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'en' ? 'ltr' : 'rtl';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
