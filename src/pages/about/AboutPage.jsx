import { useEffect } from "react";
import { useLocation } from "react-router";

import AboutIntroJourney from "../../components/about/AboutIntroJourney";
import AboutContentSections from "../../components/about/AboutContentSections";

function AboutPage() {
  const location = useLocation();

  useEffect(() => {
    let firstFrameId;
    let secondFrameId;

    firstFrameId = window.requestAnimationFrame(() => {
      secondFrameId = window.requestAnimationFrame(() => {
        const hash = decodeURIComponent(location.hash.replace("#", ""));

        if (!hash) {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          return;
        }

        const targetElement = document.getElementById(hash);

        if (!targetElement) {
          return;
        }

        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrameId);
      window.cancelAnimationFrame(secondFrameId);
    };
  }, [location.pathname, location.hash, location.key]);

  return (
    <main className="about-page">
      <AboutIntroJourney />

      <AboutContentSections />
    </main>
  );
}

export default AboutPage;
