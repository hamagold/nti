import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Activity {
  id: string;
  title: {
    ku: string;
    ar: string;
    en: string;
  };
  description: {
    ku: string;
    ar: string;
    en: string;
  };
  image: string;
  date: string;
}

export interface WebsiteAdmin {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'super_admin' | 'admin';
}

interface WebsiteState {
  activities: Activity[];
  admins: WebsiteAdmin[];
  isWebsiteAdminAuthenticated: boolean;
  currentWebsiteAdmin: WebsiteAdmin | null;
  
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  
  addAdmin: (admin: Omit<WebsiteAdmin, 'id'>) => void;
  deleteAdmin: (id: string) => void;
  
  loginWebsiteAdmin: (username: string, password: string) => boolean;
  logoutWebsiteAdmin: () => void;
}

export const useWebsiteStore = create<WebsiteState>()(
  persist(
    (set, get) => ({
      activities: [
        {
          id: '1',
          title: {
            ku: 'کۆبوونەوەی تەکنیکی',
            ar: 'اجتماع تقني',
            en: 'Technical Meeting',
          },
          description: {
            ku: 'کۆبوونەوەی قوتابیان لەگەڵ پسپۆڕانی تەکنەلۆژیا',
            ar: 'اجتماع الطلاب مع خبراء التكنولوجيا',
            en: 'Students meeting with technology experts',
          },
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          date: '2024-01-15',
        },
        {
          id: '2',
          title: {
            ku: 'یاریزانی پڕۆگرامینگ',
            ar: 'مسابقة البرمجة',
            en: 'Programming Competition',
          },
          description: {
            ku: 'یاریزانی ساڵانەی پڕۆگرامینگ بۆ قوتابیانی بەشی کۆمپیوتەر',
            ar: 'مسابقة البرمجة السنوية لطلاب قسم الحاسوب',
            en: 'Annual programming competition for Computer department students',
          },
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
          date: '2024-01-20',
        },
        {
          id: '3',
          title: {
            ku: 'سەردانی کارگە',
            ar: 'زيارة المصنع',
            en: 'Factory Visit',
          },
          description: {
            ku: 'سەردانی قوتابیانی بەشی پاتڕۆل بۆ پاڵاوگە',
            ar: 'زيارة طلاب قسم البترول للمصفاة',
            en: 'Petroleum department students visit to refinery',
          },
          image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
          date: '2024-01-25',
        },
      ],
      
      admins: [
        {
          id: '1',
          username: 'webadmin',
          password: 'nti2024',
          name: 'ئەدمینی سەرەکی',
          role: 'super_admin',
        },
      ],
      
      isWebsiteAdminAuthenticated: false,
      currentWebsiteAdmin: null,
      
      addActivity: (activity) => set((state) => ({
        activities: [...state.activities, { ...activity, id: Date.now().toString() }],
      })),
      
      updateActivity: (id, activity) => set((state) => ({
        activities: state.activities.map((a) =>
          a.id === id ? { ...a, ...activity } : a
        ),
      })),
      
      deleteActivity: (id) => set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
      })),
      
      addAdmin: (admin) => set((state) => ({
        admins: [...state.admins, { ...admin, id: Date.now().toString() }],
      })),
      
      deleteAdmin: (id) => set((state) => ({
        admins: state.admins.filter((a) => a.id !== id && a.role !== 'super_admin'),
      })),
      
      loginWebsiteAdmin: (username, password) => {
        const admin = get().admins.find(
          (a) => a.username === username && a.password === password
        );
        if (admin) {
          set({ isWebsiteAdminAuthenticated: true, currentWebsiteAdmin: admin });
          return true;
        }
        return false;
      },
      
      logoutWebsiteAdmin: () => set({
        isWebsiteAdminAuthenticated: false,
        currentWebsiteAdmin: null,
      }),
    }),
    {
      name: 'website-storage',
    }
  )
);
