import PostSection from "./(client)/components/home/PostSection";
import MovieSection from "./(client)/components/home/MovieSection";
import ComboSection from "./(client)/components/home/ComboSection";
import HeroSection from "./(client)/components/home/HeroSection";
import Footer from "./(client)/components/Footer";
import ChatBubble from "./(client)/components/home/ChatBubble";
import CombinedNavbar from "./(client)/components/CombinedNavbar";
export default function Home() {
  return (
    <>
      <CombinedNavbar />
      <HeroSection />
      <ComboSection />
      <PostSection />
      <MovieSection />
      <ChatBubble />
      <Footer />
    </>
  );
}