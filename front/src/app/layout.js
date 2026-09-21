import "./globals.css";
import { AuthProvider } from '@/context/authContext';
import { LoadingProvider } from '@/context/loadingContext';
import NavigationLoader from '@/app/components/navigationLoader';
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from 'next/font/google';

const bricolage = Bricolage_Grotesque({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-bricolage',
    display: 'swap',
});

const geist = Geist({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-geist',
    display: 'swap',
});

const jetbrains = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-jetbrains',
    display: 'swap',
});

export const metadata = {
    title: "INNVIX - Sistema Administrativo",
    description: "Sistema administrativo para la gestión corporativa",
    icons: {
        icon: '/innvix-x-mark.svg',
    },
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="es"
            className={`${bricolage.variable} ${geist.variable} ${jetbrains.variable}`}
            style={{ colorScheme: 'light' }}
        >
            <body className="antialiased">
                <AuthProvider>
                    <LoadingProvider>
                        <NavigationLoader />
                        {children}
                    </LoadingProvider>
                </AuthProvider>
            </body>
        </html>
    );
}