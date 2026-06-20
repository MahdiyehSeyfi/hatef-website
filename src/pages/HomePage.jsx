import Header from "../components/layout/Header";
import HeroSlider from "../components/home/HeroSlider";
import SupportPlansSection from "../components/home/SupportPlansSection";

function HomePage() {
  return (
    <>
      <Header />

      <main>
        <HeroSlider />
        <SupportPlansSection />
      </main>
    </>
  );
}

export default HomePage;
