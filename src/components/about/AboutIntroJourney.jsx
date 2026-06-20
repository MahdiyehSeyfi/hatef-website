import { useCallback, useEffect, useRef, useState } from "react";

import universityImage from "../../assets/images/about/university.png";
import researchImage from "../../assets/images/about/research.png";
import commercializationImage from "../../assets/images/about/commercialization.png";
import investingImage from "../../assets/images/about/investing.png";

import "./AboutIntroJourney.css";

const scenes = [
  {
    id: "university",
    eyebrow: "هاتف در دانشگاه",
    title: "درباره هاتف",
    subtitle: "هدایت اعتبارات توسعه فناوری به پژوهشگران برجسته",
    image: universityImage,
    imageAlt: "نمای ایزومتریک هاتف در دانشگاه",
    paragraphs: [
      "برنامه هاتف با هدف حمایت از پژوهشگران، توسعه طرح‌های فناورانه و تبدیل دستاوردهای دانشگاهی به راهکارهای کاربردی ایجاد شده است.",
      "در این مسیر، پژوهشگران و صاحبان ایده از حمایت‌های تخصصی، مالی و اجرایی برای توسعه محصولات و خدمات فناورانه بهره‌مند می‌شوند.",
    ],
  },
  {
    id: "research",
    eyebrow: "هاتف در پژوهش",
    title: "پژوهش و توسعه فناوری",
    subtitle: "تقویت پژوهش‌های مسئله‌محور و توسعه ایده‌های نوآورانه",
    image: researchImage,
    imageAlt: "نمای ایزومتریک پژوهشگاه فناوری",
    paragraphs: [
      "هاتف بستری برای شناسایی و حمایت از پژوهش‌هایی فراهم می‌کند که توانایی پاسخ‌گویی به مسائل واقعی و نیازهای آینده را دارند.",
      "این حمایت، مسیر تبدیل دانش دانشگاهی به فناوری‌های قابل‌استفاده و راهکارهای مؤثر را کوتاه‌تر و منسجم‌تر می‌کند.",
    ],
  },
  {
    id: "commercialization",
    eyebrow: "هاتف در صنعت",
    title: "پیوند دانشگاه و صنعت",
    subtitle: "تجاری‌سازی فناوری و تبدیل ایده به محصول",
    image: commercializationImage,
    imageAlt: "نمای ایزومتریک مرکز تجاری‌سازی فناوری",
    paragraphs: [
      "هاتف ارتباط میان ظرفیت‌های پژوهشی دانشگاه و نیازهای واقعی صنایع را تقویت می‌کند و زمینه شکل‌گیری همکاری‌های مشترک را فراهم می‌سازد.",
      "در این مرحله، طرح‌های پژوهشی به راهکارهای عملی، محصولات توسعه‌پذیر و فناوری‌های موردنیاز صنعت تبدیل می‌شوند.",
    ],
  },
  {
    id: "investing",
    eyebrow: "سرمایه‌گذاران در هاتف",
    title: "فناوری در مسیر سرمایه‌گذاری",
    subtitle: "همکاری‌های تجاری در فرصت‌های سرمایه‌گذاری",
    image: investingImage,
    imageAlt: "نمای ایزومتریک صندوق سرمایه‌گذاری فناوری",
    paragraphs: [
      "طرح‌های آماده توسعه در هاتف به شبکه‌ای از سرمایه‌گذاران، شرکت‌ها و مجموعه‌های تجاری متصل می‌شوند.",
      "این ارتباط، مسیر تأمین سرمایه، توسعه بازار و تبدیل پروژه‌های دانشگاهی به کسب‌وکارهای پایدار را هموار می‌کند.",
    ],
  },
];

const TRANSITION_DURATION = 1050;
const BODY_SWAP_DELAY = 260;
const WHEEL_THRESHOLD = 8;
const WHEEL_IDLE_DURATION = 170;

function AnimatedTypewriterTitle({ text }) {
  const [displayedText, setDisplayedText] = useState("");

  const [phase, setPhase] = useState("typing");

  const displayedTextRef = useRef("");
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const targetCharacters = Array.from(text);

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };

    const updateText = (nextText) => {
      if (cancelled) {
        return;
      }

      displayedTextRef.current = nextText;
      setDisplayedText(nextText);
    };

    const typeCharacter = (characterIndex) => {
      if (cancelled) {
        return;
      }

      if (characterIndex >= targetCharacters.length) {
        setPhase("complete");
        return;
      }

      const nextText = targetCharacters.slice(0, characterIndex + 1).join("");

      updateText(nextText);

      timerRef.current = window.setTimeout(() => {
        typeCharacter(characterIndex + 1);
      }, 42);
    };

    const startTyping = () => {
      if (cancelled) {
        return;
      }

      setPhase("typing");

      timerRef.current = window.setTimeout(() => {
        typeCharacter(0);
      }, 90);
    };

    const deleteCharacter = () => {
      if (cancelled) {
        return;
      }

      const currentCharacters = Array.from(displayedTextRef.current);

      if (currentCharacters.length === 0) {
        startTyping();
        return;
      }

      const nextText = currentCharacters.slice(0, -1).join("");

      updateText(nextText);

      timerRef.current = window.setTimeout(deleteCharacter, 20);
    };

    clearTimer();

    timerRef.current = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      if (displayedTextRef.current.length > 0) {
        setPhase("deleting");
        deleteCharacter();
      } else {
        startTyping();
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [text]);

  return (
    <h1 className="about-journey__title" aria-label={text}>
      <span aria-hidden="true">{displayedText}</span>

      <i
        className={`about-journey__typing-cursor about-journey__typing-cursor--${phase}`}
        aria-hidden="true"
      />
    </h1>
  );
}

function AboutIntroJourney() {
  const sectionRef = useRef(null);

  const activeSceneRef = useRef(0);
  const transitionLockedRef = useRef(false);

  const wheelAccumulatorRef = useRef(0);
  const wheelGestureConsumedRef = useRef(false);

  const wheelIdleTimerRef = useRef(null);
  const bodySwapTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const [bodySceneIndex, setBodySceneIndex] = useState(0);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const [isBodyLeaving, setIsBodyLeaving] = useState(false);

  const activeBodyScene = scenes[bodySceneIndex];
  const activeTitleScene = scenes[activeSceneIndex];

  const resetWheelGestureAfterIdle = useCallback(() => {
    if (wheelIdleTimerRef.current) {
      window.clearTimeout(wheelIdleTimerRef.current);
    }

    wheelIdleTimerRef.current = window.setTimeout(() => {
      wheelAccumulatorRef.current = 0;
      wheelGestureConsumedRef.current = false;
    }, WHEEL_IDLE_DURATION);
  }, []);

  const transitionToScene = useCallback((nextSceneIndex) => {
    const currentSceneIndex = activeSceneRef.current;

    const invalidSceneIndex =
      nextSceneIndex < 0 || nextSceneIndex >= scenes.length;

    if (
      transitionLockedRef.current ||
      invalidSceneIndex ||
      nextSceneIndex === currentSceneIndex
    ) {
      return;
    }

    transitionLockedRef.current = true;
    activeSceneRef.current = nextSceneIndex;

    setIsTransitioning(true);
    setIsBodyLeaving(true);
    setActiveSceneIndex(nextSceneIndex);

    if (bodySwapTimerRef.current) {
      window.clearTimeout(bodySwapTimerRef.current);
    }

    bodySwapTimerRef.current = window.setTimeout(() => {
      setBodySceneIndex(nextSceneIndex);
      setIsBodyLeaving(false);
    }, BODY_SWAP_DELAY);

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      transitionLockedRef.current = false;

      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  }, []);

  useEffect(() => {
    const sectionElement = sectionRef.current;

    if (!sectionElement) {
      return undefined;
    }

    const handleWheel = (event) => {
      if (event.ctrlKey) {
        return;
      }

      const wheelDelta = event.deltaY;

      if (Math.abs(wheelDelta) < 0.5) {
        return;
      }

      const wheelDirection = wheelDelta > 0 ? 1 : -1;

      const currentSceneIndex = activeSceneRef.current;

      const isFirstScene = currentSceneIndex === 0;

      const isLastScene = currentSceneIndex === scenes.length - 1;

      const wantsToLeaveFromTop = wheelDirection < 0 && isFirstScene;

      const wantsToLeaveFromBottom = wheelDirection > 0 && isLastScene;

      /*
       * هنگام اجرای موشن، صفحه ثابت می‌ماند.
       */
      if (transitionLockedRef.current) {
        event.preventDefault();
        resetWheelGestureAfterIdle();
        return;
      }

      /*
       * در اولین و آخرین مرحله، اسکرول رو به
       * بیرون مهار نمی‌شود و مرورگر می‌تواند
       * صفحه را به‌صورت طبیعی جابه‌جا کند.
       */
      if (wantsToLeaveFromTop || wantsToLeaveFromBottom) {
        wheelAccumulatorRef.current = 0;
        wheelGestureConsumedRef.current = false;

        return;
      }

      /*
       * بین مراحل، اسکرول صفحه متوقف می‌شود
       * و فقط مرحله بعد یا قبل فعال می‌شود.
       */
      event.preventDefault();
      resetWheelGestureAfterIdle();

      if (wheelGestureConsumedRef.current) {
        return;
      }

      const previousWheelDirection = Math.sign(wheelAccumulatorRef.current);

      if (
        previousWheelDirection !== 0 &&
        previousWheelDirection !== wheelDirection
      ) {
        wheelAccumulatorRef.current = 0;
      }

      wheelAccumulatorRef.current += wheelDelta;

      if (Math.abs(wheelAccumulatorRef.current) < WHEEL_THRESHOLD) {
        return;
      }

      const sceneDirection = wheelAccumulatorRef.current > 0 ? 1 : -1;

      wheelAccumulatorRef.current = 0;

      wheelGestureConsumedRef.current = true;

      transitionToScene(currentSceneIndex + sceneDirection);
    };

    sectionElement.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      sectionElement.removeEventListener("wheel", handleWheel);
    };
  }, [resetWheelGestureAfterIdle, transitionToScene]);

  useEffect(() => {
    return () => {
      const timerRefs = [
        wheelIdleTimerRef,
        bodySwapTimerRef,
        transitionTimerRef,
      ];

      timerRefs.forEach((timerRef) => {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
        }
      });
    };
  }, []);

  const handleKeyDown = (event) => {
    const currentSceneIndex = activeSceneRef.current;

    const isNextKey = event.key === "ArrowDown" || event.key === "PageDown";

    const isPreviousKey = event.key === "ArrowUp" || event.key === "PageUp";

    if (isNextKey) {
      if (currentSceneIndex < scenes.length - 1) {
        event.preventDefault();

        transitionToScene(currentSceneIndex + 1);
      }

      return;
    }

    if (isPreviousKey && currentSceneIndex > 0) {
      event.preventDefault();

      transitionToScene(currentSceneIndex - 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`about-journey ${
        isTransitioning ? "about-journey--transitioning" : ""
      }`}
      id="about-intro"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="about-journey__background">
        <span />
        <span />
        <span />
      </div>

      <div className="about-journey__layout">
        <div className="about-journey__visual">
          <div className="about-journey__visual-glow" />

          {scenes.map((scene, sceneIndex) => {
            const isActive = sceneIndex === activeSceneIndex;

            const isBefore = sceneIndex < activeSceneIndex;

            return (
              <figure
                key={scene.id}
                className={`about-journey__visual-item ${
                  isActive ? "about-journey__visual-item--active" : ""
                } ${
                  isBefore
                    ? "about-journey__visual-item--before"
                    : "about-journey__visual-item--after"
                }`}
                aria-hidden={!isActive}
              >
                <img src={scene.image} alt={isActive ? scene.imageAlt : ""} />
              </figure>
            );
          })}
        </div>

        <div className="about-journey__content">
          <article className="about-journey__content-card">
            <div
              className={`about-journey__supporting-text ${
                isBodyLeaving
                  ? "about-journey__supporting-text--leaving"
                  : "about-journey__supporting-text--visible"
              }`}
            >
              <span className="about-journey__eyebrow">
                {activeBodyScene.eyebrow}
              </span>
            </div>

            <AnimatedTypewriterTitle text={activeTitleScene.title} />

            <div
              className={`about-journey__supporting-text ${
                isBodyLeaving
                  ? "about-journey__supporting-text--leaving"
                  : "about-journey__supporting-text--visible"
              }`}
            >
              <p className="about-journey__subtitle">
                {activeBodyScene.subtitle}
              </p>

              <div className="about-journey__paragraphs">
                {activeBodyScene.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="about-journey__counter">
                <span>۰{bodySceneIndex + 1}</span>

                <i />

                <span>۰{scenes.length}</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <nav
        className="about-journey__navigation"
        aria-label="بخش‌های معرفی هاتف"
      >
        {scenes.map((scene, sceneIndex) => {
          const isActive = sceneIndex === activeSceneIndex;

          return (
            <button
              key={scene.id}
              type="button"
              className={`about-journey__navigation-item ${
                isActive ? "about-journey__navigation-item--active" : ""
              }`}
              onClick={() => {
                transitionToScene(sceneIndex);
              }}
              disabled={isTransitioning}
              aria-label={`نمایش ${scene.eyebrow}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span />

              <small>{scene.eyebrow}</small>
            </button>
          );
        })}
      </nav>

      <div className="about-journey__scroll-hint">
        <span>
          {activeSceneIndex === scenes.length - 1
            ? "برای ورود به بخش بعد اسکرول کنید"
            : "برای مشاهده مرحله بعد اسکرول کنید"}
        </span>

        <i aria-hidden="true" />
      </div>

      <div className="about-journey__progress">
        <span
          style={{
            width: `${((activeSceneIndex + 1) / scenes.length) * 100}%`,
          }}
        />
      </div>
    </section>
  );
}

export default AboutIntroJourney;
