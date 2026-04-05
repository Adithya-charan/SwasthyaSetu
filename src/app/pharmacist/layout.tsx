export default function PharmacistLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <RoleRoute allowedRole="pharmacist">
                <DashboardLayout role="pharmacist">
                    {children}
                </DashboardLayout>
            </RoleRoute>
        </ProtectedRoute>
    );
}

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleRoute from '@/components/auth/RoleRoute';
