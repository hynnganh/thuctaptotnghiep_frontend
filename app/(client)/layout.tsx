import Footer from "./components/Footer";
import CombinedNavbar from "./components/CombinedNavbar";
import ChatBubble from "./components/home/ChatBubble";
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CombinedNavbar />
      <main className="flex-grow">
        {children}
      <ChatBubble />
      </main>
      <Footer />
      
      
    </>
  );
}