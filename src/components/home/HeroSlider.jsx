import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  getCurrentUser,
  getCurrentUserDashboardPath,
} from "../../services/authService";

import slide1 from "../../assets/images/slide-1.png";
import slide2 from "../../assets/images/slide-2.png";
import slide3 from "../../assets/images/slide-3.png";
import slide4 from "../../assets/images/slide-4.png";

import Button from "../ui/Button/Button";
import IconButton from "../ui/IconButton/IconButton";

import "./HeroSlider.css";

const slides = [
  {
    id: 1,
    image: slide1,
    title: "هاتف",
    subtitle: "برنامه هدایت اعتبارات توسعه فناوری",
    descriptions: [
      "توضیحات برنامه هاتف برای پژوهشگران و متقاضیان برنامه هاتف",
      "برای پژوهشگران، فناوران و صاحبان ایده‌های توسعه فناوری",
      "حمایت از تجاری‌سازی بروندادهای دانشگاهی و توسعه محصولات فناورانه",
    ],
  },
  {
    id: 2,
    image: slide2,
    title: "حمایت پژوهشی",
    subtitle: "توسعه ایده‌های دانشگاهی و فناورانه",
    descriptions: [
      "حمایت از پژوهشگران و صاحبان ایده‌های نوآورانه",
      "تسهیل ارتباط دانشگاه با صنعت و بازار",
      "توسعه راهکارهای کاربردی و قابل تجاری‌سازی",
    ],
  },
  {
    id: 3,
    image: slide3,
    title: "تجاری‌سازی",
    subtitle: "تبدیل دستاوردهای پژوهشی به محصول",
    descriptions: [
      "همراهی با تیم‌های دانشگاهی در مسیر توسعه محصول",
      "ایجاد فرصت‌های همکاری و سرمایه‌گذاری",
      "حمایت از پروژه‌های دارای ظرفیت ورود به بازار",
    ],
  },
  {
    id: 4,
    image: slide4,
    title: "همکاری",
    subtitle: "ارتباط مؤثر میان دانشگاه و صنعت",
    descriptions: [
      "ایجاد شبکه همکاری میان پژوهشگران و صنایع",
      "توسعه پروژه‌های مشترک و مسئله‌محور",
      "استفاده از ظرفیت‌های علمی دانشگاه تهران",
    ],
  },
];

function ArrowIcon({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`hero-slider__arrow-icon hero-slider__arrow-icon--${direction}`}
    >
      <path
        d="M8.5 5.5 15 12l-6.5 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeroSlider() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSlide = slides[activeIndex];

  const showNextSlide = () => {
    setActiveIndex((currentIndex) => {
      return (currentIndex + 1) % slides.length;
    });
  };

  const showPreviousSlide = () => {
    setActiveIndex((currentIndex) => {
      return (currentIndex - 1 + slides.length) % slides.length;
    });
  };

  const showSelectedSlide = (index) => {
    setActiveIndex(index);
  };

  const handleSupportButtonClick = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/auth");
      return;
    }

    const dashboardPath = getCurrentUserDashboardPath();

    navigate(dashboardPath && dashboardPath !== "/" ? dashboardPath : "/");
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveIndex((currentIndex) => {
        return (currentIndex + 1) % slides.length;
      });
    }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeIndex]);

  return (
    <section className="hero-slider">
      <img
        key={`hero-image-${activeSlide.id}`}
        className="hero-slider__image"
        src={activeSlide.image}
        alt=""
      />

      <div className="hero-slider__overlay" />

      <div className="container hero-slider__content">
        <div className="hero-slider__panel">
          <div
            key={`hero-copy-${activeSlide.id}`}
            className="hero-slider__copy"
            aria-live="polite"
          >
            <h1 className="hero-slider__title">{activeSlide.title}</h1>

            <h2 className="hero-slider__subtitle">{activeSlide.subtitle}</h2>

            <div className="hero-slider__description">
              {activeSlide.descriptions.map((description) => (
                <p key={description}>{description}</p>
              ))}
            </div>
          </div>

          <div className="hero-slider__buttons">
            <Button
              type="button"
              variant="secondary"
              size="md"
              width="wide"
              className="hero-slider__button"
              onClick={handleSupportButtonClick}
            >
              دریافت حمایت
            </Button>

            <Button
              to="/research-support/calls"
              variant="inverse"
              size="md"
              width="wide"
              className="hero-slider__button"
            >
              فراخوان‌ها
            </Button>
          </div>
        </div>
      </div>

      <IconButton
        type="button"
        variant="inverse"
        size="md"
        className="hero-slider__navigation hero-slider__navigation--previous"
        onClick={showPreviousSlide}
        aria-label="اسلاید قبلی"
      >
        <ArrowIcon direction="previous" />
      </IconButton>

      <IconButton
        type="button"
        variant="inverse"
        size="md"
        className="hero-slider__navigation hero-slider__navigation--next"
        onClick={showNextSlide}
        aria-label="اسلاید بعدی"
      >
        <ArrowIcon direction="next" />
      </IconButton>

      <div className="hero-slider__dots" aria-label="انتخاب اسلاید">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={slide.id}
              type="button"
              className={`hero-slider__dot ${
                isActive ? "hero-slider__dot--active" : ""
              }`}
              onClick={() => showSelectedSlide(index)}
              aria-label={`نمایش اسلاید ${index + 1}`}
              aria-current={isActive ? "true" : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}

export default HeroSlider;
