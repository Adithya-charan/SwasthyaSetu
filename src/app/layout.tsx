import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SwasthyaBot from '@/components/shared/SwasthyaBot';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { LanguageProvider } from '@/context/LanguageContext';

const manrope = Manrope({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'SwasthyaSetu - Virtual Health Platform',
    description: 'Connect with doctors, manage prescriptions, and track your health.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={manrope.className} suppressHydrationWarning>
                <LanguageProvider>
                    <AuthProvider>
                        <AccessibilityProvider>
                            {children}
                            <SwasthyaBot />
                            <ToastContainer position="top-right" autoClose={3000} />
                        </AccessibilityProvider>
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    )
}
