import Header from "../components/layout/Header";
import HeroSlider from "../components/home/HeroSlider";
import SupportPlansSection from "../components/home/SupportPlansSection";
import NewsSection from "../components/home/NewsSection";
import AchievementsSection from "../components/home/AchievementsSection";
import PartnersSection from "../components/home/PartnersSection";

function HomePage() {
  return (
    <>
      <Header />

      <main>
        <HeroSlider />
        <SupportPlansSection />
        <NewsSection />
        <AchievementsSection />
        <PartnersSection />
      </main>
    </>
  );
}

export default HomePage;
