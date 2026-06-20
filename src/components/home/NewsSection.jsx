import bannerImage from "../../assets/images/banner.png";
import "./NewsSection.css";

const newsItems = [
  {
    id: 1,
    title: "بررسی کوتاه؛ صنعت امروز به کدام سو حرکت می‌کند؟",
    description: "گزارشی کوتاه از تازه‌ترین روندهای حوزه فناوری و توسعه صنعتی.",
    date: "۱۴۰۵/۰۳/۱۲",
  },
  {
    id: 2,
    title: "بررسی کوتاه؛ صنعت امروز به کدام سو حرکت می‌کند؟",
    description:
      "نگاهی به فرصت‌های همکاری میان دانشگاه، صنعت و شرکت‌های فناور.",
    date: "۱۴۰۵/۰۳/۱۰",
  },
  {
    id: 3,
    title: "بررسی کوتاه؛ صنعت امروز به کدام سو حرکت می‌کند؟",
    description: "معرفی برخی از فعالیت‌ها و دستاوردهای جدید برنامه هاتف.",
    date: "۱۴۰۵/۰۳/۰۸",
  },
  {
    id: 4,
    title: "بررسی کوتاه؛ صنعت امروز به کدام سو حرکت می‌کند؟",
    description:
      "گزارشی از رویدادها، فراخوان‌ها و برنامه‌های آتی توسعه فناوری.",
    date: "۱۴۰۵/۰۳/۰۵",
  },
];

function NewsSection() {
  return (
    <section className="news-section" id="news">
      <div className="container">
        <div className="news-section__heading">
          <div className="news-section__title">
            <span className="news-section__dot" />
            <h2>آخرین اخبار و رویدادها</h2>
          </div>

          <span className="news-section__line" />
        </div>

        <div className="news-section__content">
          <div className="news-section__list">
            {newsItems.map((item) => (
              <article className="news-list-item" key={item.id}>
                <img
                  className="news-list-item__image"
                  src={bannerImage}
                  alt={item.title}
                />

                <div className="news-list-item__content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>

                  <div className="news-list-item__meta">
                    <span>{item.date}</span>
                    <a href="#news-details">ادامه مطلب</a>
                  </div>
                </div>
              </article>
            ))}

            <a href="#all-news" className="news-section__view-all">
              مشاهده همه
            </a>
          </div>

          <article className="featured-news">
            <img
              className="featured-news__image"
              src={bannerImage}
              alt="خبر شاخص برنامه هاتف"
            />

            <div className="featured-news__overlay">
              <span className="featured-news__category">اخبار فناوری</span>

              <h3>
                معرفی دستاوردهای پژوهشی دانشگاه تهران در حوزه فناوری و توسعه
                صنعتی
              </h3>

              <p>
                گزارشی از تازه‌ترین برنامه‌ها، همکاری‌ها و فعالیت‌های توسعه
                فناوری
              </p>

              <div className="featured-news__meta">
                <span>۱۴۰۵/۰۳/۱۵</span>
                <a href="#featured-news">مشاهده خبر</a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default NewsSection;
