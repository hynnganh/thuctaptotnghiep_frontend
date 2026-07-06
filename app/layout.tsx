import '@/app/ui/global.css';

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