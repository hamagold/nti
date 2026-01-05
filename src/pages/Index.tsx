import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePermissions } from '@/hooks/usePermissions';
import Dashboard from './Dashboard';
import AddStudent from './AddStudent';

const Index = () => {
  const { isLocalStaff, canView } = usePermissions();

  // Local staff should be redirected to add student page
  if (isLocalStaff) {
    return (
      <MainLayout>
        <AddStudent />
      </MainLayout>
    );
  }

  // Admin and SuperAdmin go to dashboard
  if (canView('dashboard')) {
    return (
      <MainLayout>
        <Dashboard />
      </MainLayout>
    );
  }

  // Fallback - should not happen
  return <Navigate to="/login" replace />;
};

export default Index;
