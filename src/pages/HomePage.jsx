import Header from "../components/layout/Header";
import HeroSlider from "../components/home/HeroSlider";
import SupportPlansSection from "../components/home/SupportPlansSection";
import NewsSection from "../components/home/NewsSection";
import AchievementsSection from "../components/home/AchievementsSection";

function HomePage() {
  return (
    <>
      <Header />

      <main>
        <HeroSlider />
        <SupportPlansSection />
        <NewsSection />
        <AchievementsSection />
      </main>
    </>
  );
}

export default HomePage;
