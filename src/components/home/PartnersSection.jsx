import shoppingBagIcon from "../../assets/icons/shopping-bag.svg";
import behsazanLogo from "../../assets/logos/behsazan-mellat-logo.jpg";
import mellatBankLogo from "../../assets/logos/mellat-bank-logo.jpg";
import mellatVenturesLogo from "../../assets/logos/mellat-ventures-logo.png";
import "./PartnersSection.css";

const statistics = [
  {
    id: 1,
    number: "+۱۲",
    label: "دانشکده‌های شرکت‌کرده",
  },
  {
    id: 2,
    number: "+۱۲",
    label: "دانشکده‌های شرکت‌کرده",
  },
  {
    id: 3,
    number: "+۱۲",
    label: "دانشکده‌های شرکت‌کرده",
  },
  {
    id: 4,
    number: "+۱۲",
    label: "دانشکده‌های شرکت‌کرده",
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

              <span className="partner-statistic__label">{item.label}</span>
            </article>
          ))}
        </div>

        <div className="partners-section__actions">
          <a
            href="#collaboration-opportunities"
            className="partners-section__button partners-section__button--primary"
          >
            فرصت‌های همکاری
          </a>

          <a
            href="#collaboration-contact"
            className="partners-section__button partners-section__button--secondary"
          >
            ارتباط جهت همکاری
          </a>
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
