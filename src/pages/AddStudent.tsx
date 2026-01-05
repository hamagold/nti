import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StudentForm } from '@/components/students/StudentForm';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap, CheckCircle } from 'lucide-react';

export default function AddStudent() {
  const [formOpen, setFormOpen] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  const handleSuccess = () => {
    setSuccessCount(prev => prev + 1);
    setFormOpen(false);
  };

  return (
    <div className="min-h-screen pb-8">
      <Header
        title="تۆمارکردنی قوتابی"
        subtitle="زیادکردنی قوتابیی نوێ"
      />

      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          {/* Stats */}
          <div className="rounded-2xl bg-card p-6 shadow-lg mb-8 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قوتابیان تۆمارکراو ئەمڕۆ</p>
                <p className="text-3xl font-bold text-foreground">{successCount}</p>
              </div>
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setFormOpen(true)}
              size="lg"
              className="gradient-primary text-primary-foreground px-12 py-6 text-lg"
            >
              <Plus className="h-6 w-6 ml-3" />
              تۆمارکردنی قوتابیی نوێ
            </Button>
          </div>

          {successCount > 0 && (
            <div className="mt-8 rounded-2xl bg-success/10 border border-success/20 p-6 animate-slide-up">
              <div className="flex items-center gap-3 text-success">
                <CheckCircle className="h-6 w-6" />
                <span className="font-semibold">{successCount} قوتابی بە سەرکەوتوویی تۆمارکران</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Form Dialog */}
      <StudentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
