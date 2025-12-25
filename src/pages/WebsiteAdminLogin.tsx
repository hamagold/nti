import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebsiteStore } from '@/store/websiteStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Lock, User, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ntiLogo from '@/assets/nti-logo.jpg';

const WebsiteAdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWebsiteAdmin } = useWebsiteStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const success = loginWebsiteAdmin(username, password);
      if (success) {
        toast({
          title: 'چوونەژوورەوە سەرکەوتوو بوو',
          description: 'بەخێربێیت بۆ پانێلی ئەدمینی سایت',
        });
        navigate('/website-admin/dashboard');
      } else {
        toast({
          title: 'هەڵە',
          description: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4" dir="rtl">
      {/* Background Effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl">
        <CardHeader className="text-center pb-0">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-xl opacity-50" />
              <img src={ntiLogo} alt="NTI Logo" className="relative w-24 h-24 rounded-2xl object-cover shadow-lg" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm mx-auto mb-2">
            <Globe className="h-4 w-4" />
            پانێلی ئەدمینی سایت
          </div>
          <h1 className="text-2xl font-bold text-foreground">چوونەژوورەوە</h1>
          <p className="text-muted-foreground text-sm">بۆ بەڕێوەبردنی سایتی پەیمانگا</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">ناوی بەکارهێنەر</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-10 bg-muted/50 border-border/50"
                  placeholder="ناوی بەکارهێنەر"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">وشەی نهێنی</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 bg-muted/50 border-border/50"
                  placeholder="وشەی نهێنی"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'چاوەڕوان بە...' : 'چوونەژوورەوە'}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              <strong>ئەدمینی بنەڕەت:</strong><br />
              webadmin / nti2024
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteAdminLogin;
