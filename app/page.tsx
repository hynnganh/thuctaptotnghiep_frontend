import PostSection from "./(client)/components/home/PostSection";
import MovieSection from "./(client)/components/home/MovieSection";
import ComboSection from "./(client)/components/home/ComboSection";
import HeroSection from "./(client)/components/home/HeroSection";
import TopBanner from "./(client)/components/TopBanner";
import TopMenu from "./(client)/components/TopMenu";
import Navbar from "./(client)/components/Navbar";
import Footer from "./(client)/components/Footer";
import ChatBubble from "./(client)/components/home/ChatBubble";
export default function Home() {
  return (
    <>
      <TopBanner />
      <TopMenu />
      <Navbar />
      <HeroSection />
      <ComboSection />
      <PostSection />
      <MovieSection />
      <ChatBubble />
      <Footer />
    </>
  );
}