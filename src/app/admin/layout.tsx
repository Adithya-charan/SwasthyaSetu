export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <RoleRoute allowedRole="admin">
                <DashboardLayout role="admin">
                    {children}
                </DashboardLayout>
            </RoleRoute>
        </ProtectedRoute>
    );
}

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleRoute from '@/components/auth/RoleRoute';
