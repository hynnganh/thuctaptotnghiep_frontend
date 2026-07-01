export default function AdminFooter() {
  return (
    <footer className="p-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#050505]/30">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
        &copy; 2026 A&K Cinema Management System. All Rights Reserved.
      </p>
      <div className="flex gap-6 text-[9px] font-bold uppercase tracking-[0.2em]">
        <span className="text-green-500 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> DB Connected
        </span>
        <span className="text-zinc-500">Version 3.4.0-stable</span>
        <a href="#" className="text-zinc-500 hover:text-white transition-colors">Hỗ trợ kỹ thuật</a>
      </div>
    </footer>
  );
}