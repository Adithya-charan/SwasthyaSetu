export default function PatientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <RoleRoute allowedRole="patient">
                <DashboardLayout role="patient">
                    {children}
                </DashboardLayout>
            </RoleRoute>
        </ProtectedRoute>
    );
}

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleRoute from '@/components/auth/RoleRoute';
