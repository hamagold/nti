import { useState } from 'react';
import { Save, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/store/settingsStore';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

export function ContactManagement() {
  const { contactInfo, updateContactInfo, addActivityLog } = useSettingsStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState(contactInfo.email);
  const [phone, setPhone] = useState(contactInfo.phone);
  const [location, setLocation] = useState(contactInfo.location);
  const [website, setWebsite] = useState(contactInfo.website || '');

  const handleSave = () => {
    updateContactInfo({
      email,
      phone,
      location,
      website: website || undefined,
    });
    
    addActivityLog({
      type: 'settings',
      description: 'نوێکردنەوەی زانیاری پەیوەندی',
      user: 'ئەدمین',
    });
    
    toast({
      title: t('contactMgmt.saved'),
      description: t('contactMgmt.infoUpdated'),
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-foreground">{t('contactMgmt.title')}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            {t('contactMgmt.email')}
          </Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@example.com"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            {t('contactMgmt.phone')}
          </Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+964 750 123 4567"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {t('contactMgmt.location')}
          </Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="سلێمانی، کوردستان"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            {t('contactMgmt.website')}
          </Label>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="www.example.com"
            dir="ltr"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 ml-2" />
          {t('contactMgmt.save')}
        </Button>
      </div>
    </div>
  );
}
