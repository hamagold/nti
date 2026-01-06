import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Mail, LogIn } from 'lucide-react';
import ntiLogo from '@/assets/nti-logo.jpg';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success(t('login.loginSuccess'));
        navigate('/');
      } else {
        toast.error(t('login.loginError'));
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(t('login.errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      {/* Language Switcher - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="bg-card rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm mb-4 ring-4 ring-white/30 overflow-hidden">
              <img src={ntiLogo} alt="NTI Logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t('login.instituteName')}
            </h1>
            <p className="text-white/80 text-sm">
              {t('login.instituteNameEn')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {t('login.title')}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {t('login.subtitle')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t('login.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="bg-muted/50 h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {t('login.password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-muted/50 h-12"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-primary text-primary-foreground text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('login.pleaseWait')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  {t('login.loginButton')}
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {t('login.createdBy')} محمد سلێمان احمد
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
