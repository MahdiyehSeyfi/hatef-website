import { Link, useNavigate } from "react-router";

import shoppingBagIcon from "../../assets/icons/shopping-bag.svg";
import behsazanLogo from "../../assets/logos/behsazan-mellat-logo.jpg";
import mellatBankLogo from "../../assets/logos/mellat-bank-logo.jpg";
import mellatVenturesLogo from "../../assets/logos/mellat-ventures-logo.png";

import {
  getCurrentUser,
  getCurrentUserDashboardPath,
} from "../../services/authService";

import "./PartnersSection.css";

const statistics = [
  {
    id: 1,
    number: "+۱۲",
    label: "دانشکده‌های شرکت‌کرده",
    description:
      "دانشکده‌های مشارکت‌کننده در فراخوان‌ها، طرح‌ها و برنامه‌های توسعه فناوری هاتف",
  },
  {
    id: 2,
    number: "+۱۲",
    label: "دانشکده‌های شرکت‌کرده",
    description: "مشارکت واحدهای دانشگاهی در اجرای پروژه‌های پژوهشی و فناورانه",
  },
  {
    id: 3,
    number: "+۱۲",
    label: "دانشکده‌های شرکت‌کرده",
    description: "همکاری دانشکده‌ها برای توسعه راهکارهای نوآورانه و کاربردی",
  },
  {
    id: 4,
    number: "+۱۲",
    label: "دانشکده‌های شرکت‌کرده",
    description: "حضور دانشکده‌های مختلف در مسیر ارتباط دانشگاه، صنعت و فناوری",
  },
];

const partnerLogos = [
  {
    id: 1,
    image: behsazanLogo,
    alt: "بهسازان ملت",
  },
  {
    id: 2,
    image: mellatVenturesLogo,
    alt: "هلدینگ سرمایه‌گذاری ملت",
  },
  {
    id: 3,
    image: mellatBankLogo,
    alt: "بانک ملت",
  },
];

function PartnersSection() {
  const navigate = useNavigate();

  const handleCollaborationClick = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/auth");
      return;
    }

    const dashboardPath = getCurrentUserDashboardPath();

    navigate(dashboardPath && dashboardPath !== "/" ? dashboardPath : "/");
  };

  return (
    <section className="partners-section" id="business">
      <div className="container">
        <div className="partners-section__statistics">
          {statistics.map((item) => (
            <article className="partner-statistic" key={item.id}>
              <img
                className="partner-statistic__icon"
                src={shoppingBagIcon}
                alt=""
              />

              <span className="partner-statistic__divider" />

              <strong className="partner-statistic__number">
                {item.number}
              </strong>

              <div className="partner-statistic__text">
                <span className="partner-statistic__label">{item.label}</span>

                <p className="partner-statistic__description">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="partners-section__actions">
          <Link
            to="/business/opportunities"
            className="partners-section__button partners-section__button--primary"
          >
            فرصت‌های همکاری
          </Link>

          <button
            type="button"
            className="partners-section__button partners-section__button--secondary"
            onClick={handleCollaborationClick}
          >
            ارتباط جهت همکاری
          </button>
        </div>

        <div className="partners-section__logos">
          {partnerLogos.map((logo) => (
            <img
              key={logo.id}
              src={logo.image}
              alt={logo.alt}
              className="partners-section__logo"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PartnersSection;
