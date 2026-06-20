import bannerImage from "../../assets/images/banner.png";
import "./CoursesSection.css";

const courses = [
  {
    id: 1,
    title: "دوره جامع مدیریت سبز",
    startDate: "۱۴۰۵/۰۵/۰۵",
    instructor: "مهدیه سیفی",
    organizer: "امور فرهنگی دانشکدگان فنی",
    status: "در حال برگزاری",
  },
  {
    id: 2,
    title: "دوره جامع مدیریت سبز",
    startDate: "۱۴۰۵/۰۵/۰۵",
    instructor: "مهدیه سیفی",
    organizer: "امور فرهنگی دانشکدگان فنی",
    status: "در حال برگزاری",
  },
  {
    id: 3,
    title: "دوره جامع مدیریت سبز",
    startDate: "۱۴۰۵/۰۵/۰۵",
    instructor: "مهدیه سیفی",
    organizer: "امور فرهنگی دانشکدگان فنی",
    status: "در حال برگزاری",
  },
  {
    id: 4,
    title: "دوره جامع مدیریت و توسعه پایدار",
    startDate: "۱۴۰۵/۰۵/۰۵",
    instructor: "مهدیه سیفی",
    organizer: "امور فرهنگی دانشکدگان فنی",
    status: "در حال برگزاری",
  },
];

function CoursesSection() {
  return (
    <section className="courses-section" id="courses">
      <div className="container">
        <div className="courses-section__heading">
          <h2>دوره‌های توانمندسازی</h2>
          <span className="courses-section__line" />

          <div className="courses-section__dots" aria-hidden="true">
            <span />
            <span />
            <span className="courses-section__dot--active" />
            <span />
          </div>
        </div>

        <div className="courses-section__grid">
          {courses.map((course) => (
            <article className="course-card" key={course.id}>
              <div className="course-card__image-wrapper">
                <img
                  className="course-card__image"
                  src={bannerImage}
                  alt={course.title}
                />

                <span className="course-card__status">{course.status}</span>
              </div>

              <div className="course-card__content">
                <h3>{course.title}</h3>

                <dl className="course-card__details">
                  <div>
                    <dt>شروع از:</dt>
                    <dd>{course.startDate}</dd>
                  </div>

                  <div>
                    <dt>مدرس:</dt>
                    <dd>{course.instructor}</dd>
                  </div>

                  <div>
                    <dt>برگزارکننده:</dt>
                    <dd>{course.organizer}</dd>
                  </div>
                </dl>

                <a href="#course-details" className="course-card__button">
                  اطلاعات بیشتر
                </a>
              </div>
            </article>
          ))}
        </div>

        <a href="#all-courses" className="courses-section__view-all">
          مشاهده همه
        </a>
      </div>
    </section>
  );
}

export default CoursesSection;
