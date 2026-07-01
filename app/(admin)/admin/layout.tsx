import AdminSidebar from '@/app/(admin)/components/AdminSidebar';
import AdminHeader from '@/app/(admin)/components/AdminHeader';
import AdminFooter from '@/app/(admin)/components/AdminFooter';
import { Toaster } from 'react-hot-toast';
export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* Sidebar cố định bên trái */}
      <AdminSidebar />
      
      {/* Vùng nội dung bên phải có thể cuộn */}
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-10 overflow-y-auto">
          {children}
          <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b', // zinc-900
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '12px',
            textTransform: 'uppercase',
            fontWeight: '900',
            borderRadius: '1rem',
          },
        }}
      />
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}