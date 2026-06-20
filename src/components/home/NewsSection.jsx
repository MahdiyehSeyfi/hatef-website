import bannerImage from "../../assets/images/banner.png";
import "./NewsSection.css";

const newsItems = [
  {
    id: 1,
    title: "ویروس کرونا؛ هشدار درباره کاهش سریع اقدامات قرنطینه",
    description:
      "ویروس کرونا؛ هشدار درباره کاهش سریع اقدامات قرنطینه در حالی که جهان درگیر کنترل این بیماری است.",
    date: "۱۴۰۵/۰۵/۰۵",
  },
  {
    id: 2,
    title: "ویروس کرونا؛ هشدار درباره کاهش سریع اقدامات قرنطینه",
    description:
      "گزارشی کوتاه از تازه‌ترین اخبار علمی، پژوهشی و فناوری دانشگاه تهران.",
    date: "۱۴۰۵/۰۵/۰۵",
  },
  {
    id: 3,
    title: "ویروس کرونا؛ هشدار درباره کاهش سریع اقدامات قرنطینه",
    description:
      "مروری بر رویدادهای دانشگاهی و فعالیت‌های جدید در حوزه نوآوری و فناوری.",
    date: "۱۴۰۵/۰۵/۰۵",
  },
];

function NewsSection() {
  return (
    <section className="news-section" id="news">
      <div className="container">
        <div className="news-section__heading">
          <div className="news-section__heading-label">
            <span className="news-section__dot" />
            <h2>آخرین اخبار و رویدادها</h2>
          </div>

          <span className="news-section__heading-line" />
        </div>

        <div className="news-section__content">
          <article className="featured-news">
            <a href="#featured-news-details" className="featured-news__media">
              <img
                className="featured-news__image"
                src={bannerImage}
                alt="خبر شاخص برنامه هاتف"
              />

              <div className="featured-news__overlay">
                <span className="featured-news__eyebrow">
                  از سوی معاونت پژوهشی اعلام شد
                </span>

                <h3>
                  شناسایی پیش‌شاخص‌های زمین‌لرزه با داده‌های ماهواره‌ای و هوش
                  مصنوعی
                </h3>
              </div>
            </a>
          </article>

          <div className="news-section__side">
            <div className="news-section__list">
              {newsItems.map((item) => (
                <article className="news-list-item" key={item.id}>
                  <a
                    href="#news-details"
                    className="news-list-item__image-link"
                  >
                    <img
                      className="news-list-item__image"
                      src={bannerImage}
                      alt={item.title}
                    />
                  </a>

                  <div className="news-list-item__content">
                    <a href="#news-details" className="news-list-item__title">
                      {item.title}
                    </a>

                    <p>{item.description}</p>

                    <div className="news-list-item__meta">
                      <span>{item.date}</span>

                      <a href="#news-details" className="news-list-item__more">
                        ادامه مطلب
                        <span aria-hidden="true">←</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="news-section__footer">
              <a href="#all-news" className="news-section__view-all">
                مشاهده همه
                <span aria-hidden="true">←</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsSection;
