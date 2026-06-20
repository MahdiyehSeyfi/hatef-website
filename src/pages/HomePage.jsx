import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HeroSlider from "../components/home/HeroSlider";
import SupportPlansSection from "../components/home/SupportPlansSection";
import NewsSection from "../components/home/NewsSection";
import AchievementsSection from "../components/home/AchievementsSection";
import PartnersSection from "../components/home/PartnersSection";
import CoursesSection from "../components/home/CoursesSection";

function HomePage() {
  return (
    <>
      <Header />

      <main className="home-page__main">
        <HeroSlider />
        <SupportPlansSection />
        <NewsSection />
        <AchievementsSection />
        <PartnersSection />
        <CoursesSection />
      </main>

      <Footer />
    </>
  );
}

export default HomePage;
