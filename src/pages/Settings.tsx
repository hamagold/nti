import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DepartmentManagement } from '@/components/settings/DepartmentManagement';
import { AdminManagement } from '@/components/settings/AdminManagement';
import { ContactManagement } from '@/components/settings/ContactManagement';
import { ActivityLogView } from '@/components/settings/ActivityLogView';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { RolePermissions } from '@/components/settings/RolePermissions';
import { DataManagement } from '@/components/settings/DataManagement';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Building2,
  Users,
  Phone,
  History,
  Bell,
  Settings as SettingsIcon,
  Shield,
  Database,
} from 'lucide-react';

export default function Settings() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pb-8">
      <Header
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      <div className="p-4 md:p-8">
        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-muted/50 p-2 rounded-xl">
            <TabsTrigger
              value="departments"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.departmentsTab')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="admins"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.adminsTab')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.contactTab')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.notificationsTab')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.permissionsTab')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dataManagement.dataTab')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.logsTab')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departments">
            <div className="rounded-2xl bg-card p-4 md:p-8 shadow-lg animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('settings.departmentManagement')}</h2>
                  <p className="text-sm text-muted-foreground">{t('settings.departmentManagementDesc')}</p>
                </div>
              </div>
              <DepartmentManagement />
            </div>
          </TabsContent>

          <TabsContent value="admins">
            <div className="rounded-2xl bg-card p-4 md:p-8 shadow-lg animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl gradient-secondary flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('settings.adminManagement')}</h2>
                  <p className="text-sm text-muted-foreground">{t('settings.adminManagementDesc')}</p>
                </div>
              </div>
              <AdminManagement />
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <div className="rounded-2xl bg-card p-4 md:p-8 shadow-lg animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center">
                  <Phone className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('settings.contactInfo')}</h2>
                  <p className="text-sm text-muted-foreground">{t('settings.contactInfoDesc')}</p>
                </div>
              </div>
              <ContactManagement />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="rounded-2xl bg-card p-4 md:p-8 shadow-lg animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('settings.notificationSettings')}</h2>
                  <p className="text-sm text-muted-foreground">{t('settings.notificationSettingsDesc')}</p>
                </div>
              </div>
              <NotificationSettings />
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <div className="rounded-2xl bg-card p-4 md:p-8 shadow-lg animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('settings.permissionManagement')}</h2>
                  <p className="text-sm text-muted-foreground">{t('settings.permissionManagementDesc')}</p>
                </div>
              </div>
              <RolePermissions />
            </div>
          </TabsContent>

          <TabsContent value="data">
            <DataManagement />
          </TabsContent>

          <TabsContent value="logs">
            <div className="rounded-2xl bg-card p-4 md:p-8 shadow-lg animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <History className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('settings.recentChanges')}</h2>
                  <p className="text-sm text-muted-foreground">{t('settings.recentChangesDesc')}</p>
                </div>
              </div>
              <ActivityLogView />
            </div>
          </TabsContent>
        </Tabs>

        {/* Developer Info */}
        <div className="mt-8 rounded-2xl bg-card p-4 md:p-8 shadow-lg animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{t('settings.aboutSystem')}</h2>
              <p className="text-sm text-muted-foreground">{t('settings.developerInfo')}</p>
            </div>
          </div>

          <div className="text-center py-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full gradient-hero mb-4">
              <span className="text-3xl">👨‍💻</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {t('settings.developerName')}
            </h3>
            <p className="text-muted-foreground">
              {t('settings.developerRole')}
            </p>
            <div className="mt-6 inline-block px-6 py-2 rounded-full bg-muted text-sm text-muted-foreground">
              {t('settings.version')} ١.٠.٠
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
