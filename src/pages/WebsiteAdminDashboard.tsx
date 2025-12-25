import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebsiteStore, Activity, WebsiteAdmin } from '@/store/websiteStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Edit,
  LogOut,
  Globe,
  Users,
  Newspaper,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ntiLogo from '@/assets/nti-logo.jpg';

const WebsiteAdminDashboard = () => {
  const navigate = useNavigate();
  const {
    activities,
    admins,
    currentWebsiteAdmin,
    isWebsiteAdminAuthenticated,
    addActivity,
    updateActivity,
    deleteActivity,
    addAdmin,
    deleteAdmin,
    logoutWebsiteAdmin,
  } = useWebsiteStore();

  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [activityForm, setActivityForm] = useState({
    titleKu: '',
    titleAr: '',
    titleEn: '',
    descKu: '',
    descAr: '',
    descEn: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [adminForm, setAdminForm] = useState({
    username: '',
    password: '',
    name: '',
    role: 'admin' as 'admin' | 'super_admin',
  });

  // Redirect if not authenticated
  if (!isWebsiteAdminAuthenticated) {
    navigate('/website-admin');
    return null;
  }

  const handleLogout = () => {
    logoutWebsiteAdmin();
    navigate('/website-admin');
  };

  const resetActivityForm = () => {
    setActivityForm({
      titleKu: '',
      titleAr: '',
      titleEn: '',
      descKu: '',
      descAr: '',
      descEn: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingActivity(null);
  };

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activityData = {
      title: { ku: activityForm.titleKu, ar: activityForm.titleAr, en: activityForm.titleEn },
      description: { ku: activityForm.descKu, ar: activityForm.descAr, en: activityForm.descEn },
      image: activityForm.image,
      date: activityForm.date,
    };

    if (editingActivity) {
      updateActivity(editingActivity.id, activityData);
      toast({ title: 'چالاکی نوێکرایەوە', description: 'چالاکییەکە بە سەرکەوتوویی نوێکرایەوە' });
    } else {
      addActivity(activityData);
      toast({ title: 'چالاکی زیادکرا', description: 'چالاکییەکە بە سەرکەوتوویی زیادکرا' });
    }

    resetActivityForm();
    setIsActivityDialogOpen(false);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityForm({
      titleKu: activity.title.ku,
      titleAr: activity.title.ar,
      titleEn: activity.title.en,
      descKu: activity.description.ku,
      descAr: activity.description.ar,
      descEn: activity.description.en,
      image: activity.image,
      date: activity.date,
    });
    setIsActivityDialogOpen(true);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAdmin(adminForm);
    toast({ title: 'ئەدمین زیادکرا', description: 'ئەدمینەکە بە سەرکەوتوویی زیادکرا' });
    setAdminForm({ username: '', password: '', name: '', role: 'admin' });
    setIsAdminDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={ntiLogo} alt="NTI" className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <h1 className="font-bold text-foreground">پانێلی ئەدمینی سایت</h1>
                <p className="text-xs text-muted-foreground">{currentWebsiteAdmin?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                بینینی سایت
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Newspaper className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activities.length}</p>
                  <p className="text-sm text-muted-foreground">چالاکییەکان</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{admins.length}</p>
                  <p className="text-sm text-muted-foreground">ئەدمینەکان</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-sm text-muted-foreground">زمانەکان</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            <TabsTrigger value="activities" className="gap-2">
              <Newspaper className="h-4 w-4" />
              چالاکییەکان
            </TabsTrigger>
            {currentWebsiteAdmin?.role === 'super_admin' && (
              <TabsTrigger value="admins" className="gap-2">
                <Users className="h-4 w-4" />
                ئەدمینەکان
              </TabsTrigger>
            )}
          </TabsList>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>بەڕێوەبردنی چالاکییەکان</CardTitle>
                <Dialog open={isActivityDialogOpen} onOpenChange={(open) => {
                  setIsActivityDialogOpen(open);
                  if (!open) resetActivityForm();
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      زیادکردن
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingActivity ? 'نوێکردنەوەی چالاکی' : 'زیادکردنی چالاکی'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleActivitySubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>ناونیشان (کوردی)</Label>
                          <Input
                            value={activityForm.titleKu}
                            onChange={(e) => setActivityForm({ ...activityForm, titleKu: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ناونیشان (عەرەبی)</Label>
                          <Input
                            value={activityForm.titleAr}
                            onChange={(e) => setActivityForm({ ...activityForm, titleAr: e.target.value })}
                            required
                            dir="rtl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title (English)</Label>
                          <Input
                            value={activityForm.titleEn}
                            onChange={(e) => setActivityForm({ ...activityForm, titleEn: e.target.value })}
                            required
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>وەسف (کوردی)</Label>
                          <Textarea
                            value={activityForm.descKu}
                            onChange={(e) => setActivityForm({ ...activityForm, descKu: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>وەسف (عەرەبی)</Label>
                          <Textarea
                            value={activityForm.descAr}
                            onChange={(e) => setActivityForm({ ...activityForm, descAr: e.target.value })}
                            required
                            dir="rtl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (English)</Label>
                          <Textarea
                            value={activityForm.descEn}
                            onChange={(e) => setActivityForm({ ...activityForm, descEn: e.target.value })}
                            required
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>لینکی وینە</Label>
                          <Input
                            type="url"
                            value={activityForm.image}
                            onChange={(e) => setActivityForm({ ...activityForm, image: e.target.value })}
                            placeholder="https://..."
                            required
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>بەروار</Label>
                          <Input
                            type="date"
                            value={activityForm.date}
                            onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        {editingActivity ? 'نوێکردنەوە' : 'زیادکردن'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50"
                    >
                      <img
                        src={activity.image}
                        alt={activity.title.ku}
                        className="w-20 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{activity.title.ku}</h3>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditActivity(activity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>سڕینەوەی چالاکی</AlertDialogTitle>
                              <AlertDialogDescription>
                                دڵنیای لە سڕینەوەی ئەم چالاکییە؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>پاشگەزبوونەوە</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  deleteActivity(activity.id);
                                  toast({ title: 'سڕایەوە', description: 'چالاکییەکە سڕایەوە' });
                                }}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                سڕینەوە
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          {currentWebsiteAdmin?.role === 'super_admin' && (
            <TabsContent value="admins">
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>بەڕێوەبردنی ئەدمینەکان</CardTitle>
                  <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        زیادکردن
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>زیادکردنی ئەدمین</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAdminSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>ناو</Label>
                          <Input
                            value={adminForm.name}
                            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ناوی بەکارهێنەر</Label>
                          <Input
                            value={adminForm.username}
                            onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                            required
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>وشەی نهێنی</Label>
                          <Input
                            type="password"
                            value={adminForm.password}
                            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ڕۆڵ</Label>
                          <Select
                            value={adminForm.role}
                            onValueChange={(value: 'admin' | 'super_admin') =>
                              setAdminForm({ ...adminForm, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">ئەدمین</SelectItem>
                              <SelectItem value="super_admin">سوپەر ئەدمین</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full">زیادکردن</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50"
                      >
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{admin.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            @{admin.username} • {admin.role === 'super_admin' ? 'سوپەر ئەدمین' : 'ئەدمین'}
                          </p>
                        </div>
                        {admin.role !== 'super_admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>سڕینەوەی ئەدمین</AlertDialogTitle>
                                <AlertDialogDescription>
                                  دڵنیای لە سڕینەوەی ئەم ئەدمینە؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>پاشگەزبوونەوە</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    deleteAdmin(admin.id);
                                    toast({ title: 'سڕایەوە', description: 'ئەدمینەکە سڕایەوە' });
                                  }}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  سڕینەوە
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default WebsiteAdminDashboard;
