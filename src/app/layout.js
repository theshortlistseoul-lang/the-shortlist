import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata = {
  title: 'The Shortlist',
  description: '초대 기반 로테이션 소개팅',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
