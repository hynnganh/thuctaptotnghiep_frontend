import '@/app/ui/global.css';
import TopBanner from './(client)/components/TopBanner';
import TopMenu from './(client)/components/TopMenu';
import Navbar from './(client)/components/Navbar';
import Footer from './(client)/components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">

        <main className="flex-grow">
          {children}
        </main>
        
      </body>
    </html>
  );
}