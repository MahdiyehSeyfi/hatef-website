import HeroSlider from "../components/home/HeroSlider";
import SupportPlansSection from "../components/home/SupportPlansSection";
import NewsSection from "../components/home/NewsSection";
import AchievementsSection from "../components/home/AchievementsSection";
import PartnersSection from "../components/home/PartnersSection";
import CoursesSection from "../components/home/CoursesSection";

function HomePage() {
  return (
    <div className="home-page">
      <HeroSlider />
      <SupportPlansSection />
      <NewsSection />
      <AchievementsSection />
      <PartnersSection />
      <CoursesSection />
    </div>
  );
}

export default HomePage;
