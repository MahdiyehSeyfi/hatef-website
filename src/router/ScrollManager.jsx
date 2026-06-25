import { useEffect } from "react";
import { useLocation } from "react-router";

const HEADER_OFFSET = 115;

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      if (location.hash) {
        const sectionId = decodeURIComponent(location.hash.replace("#", ""));

        const targetElement = document.getElementById(sectionId);

        if (!targetElement) {
          return;
        }

        const targetTop =
          targetElement.getBoundingClientRect().top +
          window.scrollY -
          HEADER_OFFSET;

        window.scrollTo({
          top: targetTop,
          left: 0,
          behavior: "smooth",
        });

        return;
      }

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [location.pathname, location.hash, location.key]);

  return null;
}

export default ScrollManager;
