export default function DoctorLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <RoleRoute allowedRole="doctor">
                <DashboardLayout role="doctor">
                    {children}
                </DashboardLayout>
            </RoleRoute>
        </ProtectedRoute>
    );
}

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleRoute from '@/components/auth/RoleRoute';
