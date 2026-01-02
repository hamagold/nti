import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main className="md:mr-64 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
