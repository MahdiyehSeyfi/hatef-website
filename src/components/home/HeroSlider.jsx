import slide1 from "../../assets/images/slide-1.png";
import slide2 from "../../assets/images/slide-2.png";
import slide3 from "../../assets/images/slide-3.png";
import slide4 from "../../assets/images/slide-4.png";
import "./HeroSlider.css";

const slides = [
  {
    id: 1,
    image: slide1,
    title: "هاتف",
    subtitle: "برنامه هدایت اعتبارات توسعه فناوری",
  },
  {
    id: 2,
    image: slide2,
    title: "هاتف",
    subtitle: "حمایت از توسعه فناوری‌های دانشگاهی",
  },
  {
    id: 3,
    image: slide3,
    title: "هاتف",
    subtitle: "تجاری‌سازی دستاوردهای پژوهشی",
  },
  {
    id: 4,
    image: slide4,
    title: "هاتف",
    subtitle: "ارتباط دانشگاه، صنعت و فناوری",
  },
];

function HeroSlider() {
  const activeSlide = slides[0];

  return (
    <section
      className="hero-slider"
      style={{ backgroundImage: `url(${activeSlide.image})` }}
    >
      <div className="hero-slider__shade" />

      <div className="hero-slider__content">
        <div className="hero-slider__panel">
          <h1 className="hero-slider__title">{activeSlide.title}</h1>

          <h2 className="hero-slider__subtitle">{activeSlide.subtitle}</h2>

          <div className="hero-slider__description">
            <p>توضیحات برنامه هاتف برای پژوهشگران و متقاضیان برنامه هاتف</p>
            <p>برای پژوهشگران، فناوران و صاحبان ایده‌های توسعه فناوری</p>
            <p>
              حمایت از تجاری‌سازی بروندادهای دانشگاهی و توسعه محصولات فناورانه
            </p>
          </div>

          <div className="hero-slider__buttons">
            <a
              href="#support"
              className="hero-slider__button hero-slider__button--primary"
            >
              دریافت حمایت
            </a>

            <a
              href="#calls"
              className="hero-slider__button hero-slider__button--outline"
            >
              فراخوان‌ها
            </a>
          </div>
        </div>
      </div>

      <div className="hero-slider__controls" aria-hidden="true">
        <span className="hero-slider__arrow">⌃</span>

        <div className="hero-slider__dots">
          {slides.map((slide, index) => (
            <span
              key={slide.id}
              className={`hero-slider__dot ${
                index === 0 ? "hero-slider__dot--active" : ""
              }`}
            />
          ))}
        </div>

        <span className="hero-slider__arrow">⌄</span>
      </div>
    </section>
  );
}

export default HeroSlider;
