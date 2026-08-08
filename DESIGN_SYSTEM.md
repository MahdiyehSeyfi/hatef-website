# Hatef Website Design System

> **Version:** 1.0  
> **Status:** Foundation / Initial Lock  
> **Project:** Hatef Website  
> **Purpose:** ایجاد یک زبان بصری واحد، قابل توسعه و قابل پیاده‌سازی برای تمام صفحات عمومی، احراز هویت و داشبوردهای وب‌سایت هاتف.

---

## 1. هدف سند

این سند مرجع اصلی تصمیمات بصری و رابط کاربری پروژه هاتف است.

از این مرحله به بعد، هنگام طراحی یا بازطراحی هر صفحه:

- رنگ جدید بدون دلیل به پروژه اضافه نمی‌شود.
- `border-radius` جدید به‌صورت موردی تعریف نمی‌شود.
- `box-shadow` جدید برای هر کامپوننت اختراع نمی‌شود.
- اندازه فونت‌ها از Scale مشخص این سند انتخاب می‌شوند.
- فاصله‌ها از Spacing Scale انتخاب می‌شوند.
- Button، Input، Card، Badge و سایر عناصر پایه از Component System مشترک استفاده می‌کنند.
- CSS یک صفحه نباید Shared Componentها را با `!important` تغییر دهد.
- هر استثناء طراحی باید آگاهانه، محدود و مستند باشد.

هدف نهایی:

> **یک وب‌سایت یکپارچه، حرفه‌ای، مدرن، قابل اعتماد و قابل توسعه.**

---

# 2. Design Direction

## 2.1 شخصیت بصری

زبان بصری هاتف بر پایه این چهار مفهوم ساخته می‌شود:

**Modern — Institutional — Technology — Trust**

سایت باید:

- حرفه‌ای و معتبر باشد.
- حس فناوری و نوآوری داشته باشد.
- بیش از حد رسمی و خشک نباشد.
- شبیه Landing Pageهای پر از Glow و Gradient نیز نباشد.
- در صفحات مختلف شخصیت بصری خود را حفظ کند.
- برای محتوای آموزشی، پژوهشی، سازمانی و خدماتی مناسب باشد.

---

## 2.2 اصول طراحی

### Principle 01 — Consistency

یک Component با کارکرد مشابه باید در تمام صفحات رفتار و ظاهر مشابه داشته باشد.

### Principle 02 — Hierarchy

کاربر باید بدون تلاش متوجه شود:

1. عنوان اصلی چیست؟
2. اطلاعات مهم کدام‌اند؟
3. CTA اصلی کدام است؟
4. عناصر ثانویه کدام‌اند؟

### Principle 03 — Restraint

از Gradient، Shadow، Animation و رنگ‌های Accent به‌صورت کنترل‌شده استفاده می‌کنیم.

### Principle 04 — Reusability

تا جای ممکن UI از کامپوننت‌های قابل استفاده مجدد ساخته می‌شود.

### Principle 05 — Accessibility

کنتراست، Focus State، اندازه عناصر تعاملی و خوانایی باید در تمام صفحات رعایت شوند.

### Principle 06 — Responsive by Default

تمام Componentهای اصلی از ابتدا باید برای Desktop، Tablet و Mobile طراحی شوند.

---

# 3. Design Tokens

تمام مقادیر پایه باید در فایل مرکزی Token نگهداری شوند.

مسیر پیشنهادی:

```text
src/styles/tokens.css
```

---

# 4. Color System

## 4.1 Brand — Navy

رنگ Navy پایه اصلی برند و عامل ایجاد حس اعتماد و اعتبار است.

```css
--color-brand-950: #07182B;
--color-brand-900: #0B2038;
--color-brand-800: #123052;
--color-brand-700: #1A365D;
--color-brand-600: #244C78;

--color-brand-100: #EAF0F6;
--color-brand-50:  #F5F8FB;
```

### کاربرد

- Header
- Primary Button
- تیترهای بسیار مهم
- بخش‌های Dark
- Footer
- Navigation active state
- عناصر Institutional

رنگ پایه موجود سایت:

```css
#1A365D
```

در سیستم جدید حفظ می‌شود.

---

# 5. Action Color — Cyan

```css
--color-action-700: #0B6F9C;
--color-action-600: #008FC8;
--color-action-500: #00ADEA;

--color-action-100: #DEF5FD;
--color-action-50:  #F0FAFF;
```

رنگ اصلی فعلی:

```css
#00ADEA
```

### کاربرد

- Interactive Accent
- Link
- Active Indicator
- Icon Accent
- Highlight
- Secondary CTA
- Decorative Detail

> برای متن‌های کوچک روی پس‌زمینه سفید، ترجیحاً از `action-700` یا `action-600` استفاده شود.

---

# 6. Accent Color — Teal

```css
--color-accent-700: #087F84;
--color-accent-600: #009E99;
--color-accent-500: #01D2C9;

--color-accent-100: #DFFAF8;
--color-accent-50:  #F0FDFC;
```

رنگ فعلی:

```css
#01D2C9
```

### کاربرد

- Accent ثانویه
- Statusهای مثبت
- Decorative Highlight
- برخی Visualizationها
- Section Accentهای محدود

---

# 7. Neutral Colors

```css
--color-neutral-950: #0F172A;
--color-neutral-900: #111827;
--color-neutral-800: #1F2937;
--color-neutral-700: #374151;
--color-neutral-600: #4B5563;
--color-neutral-500: #6B7280;
--color-neutral-400: #9CA3AF;
--color-neutral-300: #D1D5DB;
--color-neutral-200: #E5E7EB;
--color-neutral-100: #F3F4F6;
--color-neutral-50:  #F8FAFC;
--color-white:       #FFFFFF;
```

---

# 8. Semantic Colors

```css
--color-success: #15803D;
--color-warning: #B7791F;
--color-danger:  #B42318;
--color-info:    #0B6F9C;
```

در صورت نیاز به Background State:

```css
--color-success-bg: #F0FDF4;
--color-warning-bg: #FFFBEB;
--color-danger-bg:  #FEF2F2;
--color-info-bg:    #F0F9FF;
```

---

# 9. Surface Colors

```css
--surface-page:   #FFFFFF;
--surface-subtle: #F8FAFC;
--surface-muted:  #F3F6F9;
--surface-dark:   #0B2038;
```

قاعده پیشنهادی:

- Background اصلی صفحات: `surface-page`
- سکشن جایگزین: `surface-subtle`
- Box یا Panel ثانویه: `surface-muted`
- Dark Sections: `surface-dark`

---

# 10. Text Colors

```css
--text-primary:   #111827;
--text-secondary: #4B5563;
--text-muted:     #6B7280;
--text-disabled:  #9CA3AF;
--text-inverse:   #FFFFFF;
```

### قانون

از رنگ Brand برای همه متن‌ها استفاده نکنید.

متن عادی باید عمدتاً Neutral باشد.

---

# 11. Border Colors

```css
--border-subtle:  #E5E7EB;
--border-default: #D1D5DB;
--border-strong:  #9CA3AF;
```

---

# 12. Typography

فونت اصلی فعلی پروژه حفظ می‌شود:

```text
IRANSans
```

## 12.1 Font Family

```css
--font-primary: "IRANSans", sans-serif;
```

---

# 13. Type Scale

```css
--text-display: 42px;

--text-h1: 36px;
--text-h2: 30px;
--text-h3: 24px;
--text-h4: 20px;

--text-body-lg: 16px;
--text-body:    14px;
--text-body-sm: 13px;
--text-caption: 12px;
```

---

# 14. Font Weight

```css
--weight-regular: 400;
--weight-medium:  500;
--weight-semibold: 600;
--weight-bold:    700;
--weight-black:   900;
```

---

# 15. Line Height

```css
--line-display: 1.45;
--line-heading: 1.55;
--line-body:    1.9;
--line-compact: 1.6;
```

---

# 16. Typography Roles

## Display

برای Heroهای محدود و صفحات مهم.

```text
42 / 900
```

## H1

عنوان اصلی صفحه.

```text
36 / 800–900
```

## H2

عنوان Sectionهای اصلی.

```text
30 / 700–900
```

## H3

عنوان Card یا Subsection مهم.

```text
24 / 700
```

## H4

عنوان‌های کوچک‌تر.

```text
20 / 700
```

## Body Large

متن Intro و Lead.

```text
16 / 400–500
```

## Body

متن عمومی.

```text
14 / 400
```

## Body Small

Meta Data یا اطلاعات ثانویه.

```text
13 / 400–500
```

## Caption

Label یا Helper Text.

```text
12 / 400–500
```

---

# 17. Spacing System

Base Unit:

```text
4px
```

Tokens:

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

---

# 18. Spacing Rules

## داخل Card

معمولاً:

```text
16 / 20 / 24 / 32px
```

## فاصله بین آیتم‌های مرتبط

```text
8 / 12 / 16px
```

## فاصله بین گروه‌های محتوایی

```text
24 / 32 / 40px
```

## فاصله بین Sectionهای صفحه

Desktop:

```text
64–96px
```

Mobile:

```text
48–64px
```

---

# 19. Radius System

فقط پنج سطح مجاز داریم:

```css
--radius-sm:   8px;
--radius-md:   12px;
--radius-lg:   16px;
--radius-xl:   24px;
--radius-full: 999px;
```

### Component Mapping

| Component | Radius |
|---|---:|
| Input | 12px |
| Button | 12px |
| Small Card | 12px |
| Standard Card | 16px |
| Large Panel | 24px |
| Modal | 24px |
| Badge | Full |
| Avatar | Full |

---

# 20. Shadow System

```css
--shadow-xs:
  0 1px 2px rgba(15, 23, 42, 0.05);

--shadow-sm:
  0 4px 12px rgba(15, 23, 42, 0.06);

--shadow-md:
  0 12px 28px rgba(15, 23, 42, 0.08);

--shadow-lg:
  0 24px 56px rgba(15, 23, 42, 0.12);
```

### کاربرد

| Level | کاربرد |
|---|---|
| xs | input / subtle |
| sm | card |
| md | hover / dropdown |
| lg | modal / floating panel |

---

# 21. Focus State

تمام عناصر Interactive باید Focus قابل مشاهده داشته باشند.

```css
--focus-ring:
  0 0 0 3px rgba(0, 173, 234, 0.14);
```

مثال:

```css
.button:focus-visible,
.input:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

---

# 22. Layout System

دو Container اصلی:

```css
--layout-wide:    1440px;
--layout-content: 1240px;
```

---

# 23. Page Gutter

```css
--gutter-desktop: 28px;
--gutter-tablet:  24px;
--gutter-mobile:  16px;
```

---

# 24. Container Utility

```css
.container {
  width: min(
    calc(100% - (var(--gutter-desktop) * 2)),
    var(--layout-content)
  );
  margin-inline: auto;
}
```

---

# 25. Wide Container

برای Header یا Heroهای خاص:

```css
.container-wide {
  width: min(
    calc(100% - (var(--gutter-desktop) * 2)),
    var(--layout-wide)
  );
  margin-inline: auto;
}
```

---

# 26. Breakpoints

```css
--breakpoint-sm:  640px;
--breakpoint-md:  768px;
--breakpoint-lg:  1024px;
--breakpoint-xl:  1280px;
--breakpoint-2xl: 1440px;
```

> ترجیحاً Media Queryها بر اساس نیاز واقعی Component تنظیم شوند، نه صرفاً Device Name.

---

# 27. Grid

Desktop:

```text
12 Columns
```

Tablet:

```text
8 Columns
```

Mobile:

```text
4 Columns
```

Gap استاندارد:

```text
24px Desktop
20px Tablet
16px Mobile
```

---

# 28. Component Architecture

Shared UI Components در مسیر زیر قرار می‌گیرند:

```text
src/components/ui/
```

ساختار پیشنهادی:

```text
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── IconButton/
│   │   ├── Card/
│   │   ├── SectionHeader/
│   │   ├── PageHeader/
│   │   ├── Badge/
│   │   ├── FormField/
│   │   ├── Input/
│   │   ├── Textarea/
│   │   ├── Select/
│   │   ├── Checkbox/
│   │   ├── Tabs/
│   │   ├── Breadcrumb/
│   │   ├── Pagination/
│   │   ├── Alert/
│   │   ├── EmptyState/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Skeleton/
│   │   └── SliderControls/
│   │
│   ├── layout/
│   ├── home/
│   └── ...
│
├── styles/
│   ├── tokens.css
│   ├── fonts.css
│   ├── globals.css
│   └── utilities.css
│
├── layouts/
└── pages/
```

---

# 29. Button Component

تمام Buttonهای پروژه باید در نهایت از Shared Button استفاده کنند.

## Variants

```text
primary
secondary
outline
ghost
danger
```

## Sizes

```text
sm
md
lg
```

---

# 30. Button — Primary

```text
Background: Brand Navy
Text: White
Border: Transparent
```

Hover:

- کمی تیره‌تر
- Shadow بسیار محدود
- بدون حرکت شدید

---

# 31. Button — Secondary

```text
Background: Action Cyan
Text: Brand 950
```

---

# 32. Button — Outline

```text
Background: White
Border: Border Default
Text: Brand 700
```

---

# 33. Button — Ghost

```text
Background: Transparent
Border: None
```

Hover:

```text
Background: Brand 50
```

---

# 34. Button Dimensions

### Small

```text
Height: 36px
Padding-inline: 14px
```

### Medium

```text
Height: 44px
Padding-inline: 20px
```

### Large

```text
Height: 52px
Padding-inline: 24px
```

---

# 35. Icon Button

Sizes:

```text
36px
40px
44px
```

Icon Button باید:

- square باشد
- focus state داشته باشد
- tooltip برای iconهای نامشخص داشته باشد

---

# 36. Section Header

تمام Sectionهای اصلی باید از یک الگوی ثابت استفاده کنند.

Props پیشنهادی:

```jsx
<SectionHeader
  eyebrow="..."
  title="..."
  description="..."
  action="..."
  align="start"
/>
```

ساختار:

```text
Eyebrow
Title
Description
Action
```

تمام موارد الزامی نیستند.

---

# 37. Page Header

برای صفحات داخلی:

```jsx
<PageHeader
  eyebrow="..."
  title="..."
  description="..."
  breadcrumb={...}
/>
```

هدف:

تمام صفحات داخلی شروع بصری مشابه داشته باشند.

---

# 38. Card System

چهار Card Type اصلی:

```text
Standard Card
Interactive Card
Media Card
Feature Card
```

---

# 39. Standard Card

```text
Background: White
Border: 1px solid subtle
Radius: 16px
Padding: 24px
Shadow: xs / none
```

---

# 40. Interactive Card

Hover:

```text
translateY(-4px)
shadow-md
border-action
```

Interaction باید subtle باشد.

---

# 41. Media Card

برای:

- News
- Course
- Event
- Article
- Service

ساختار:

```text
Image
Meta
Title
Description
Footer / CTA
```

---

# 42. Image Radius

تصاویر داخل Card:

```text
12px
```

تصاویر Hero:

```text
16–24px
```

---

# 43. Badge

Variants:

```text
neutral
brand
info
success
warning
danger
```

Badge نباید Shadow داشته باشد.

---

# 44. Forms

تمام Inputها از Component مشترک استفاده کنند.

ساختار Form Field:

```text
Label
Input
Helper Text
Error Message
```

---

# 45. Input

```text
Height: 44px
Radius: 12px
Border: default
Background: white
Font-size: 14px
```

Focus:

```text
Border: Action 600
Focus Ring
```

Error:

```text
Border: Danger
```

---

# 46. Textarea

Minimum Height:

```text
120px
```

Resize:

```text
vertical
```

---

# 47. Select

ظاهر و ارتفاع Select باید با Input یکسان باشد.

---

# 48. Form Rules

- Placeholder نباید جای Label را بگیرد.
- Error باید نزدیک Field نمایش داده شود.
- Required State باید واضح باشد.
- Disabled State باید قابل تشخیص باشد.
- Focus State حذف نشود.

---

# 49. Navigation

Header باید:

- ساده باشد.
- Active State مشخص داشته باشد.
- Dropdownها یک زبان مشترک داشته باشند.
- Hoverها subtle باشند.
- تعداد styleهای متفاوت navigation محدود شود.

---

# 50. Header

ارتفاع پیشنهادی Desktop:

```css
--header-height: 96px;
```

Header باید در تمام صفحات عمومی ثابت بماند.

---

# 51. Footer

Footer باید از یک ساختار ثابت استفاده کند:

```text
Brand
Navigation Groups
Contact
Social
Legal
```

---

# 52. Breadcrumb

تمام صفحات Detail و بخش‌های داخلی عمیق باید Breadcrumb مشترک داشته باشند.

---

# 53. Tabs

Tabs باید دارای:

- Active indicator ثابت
- Keyboard support
- Focus state
- spacing استاندارد

باشند.

---

# 54. Pagination

Pagination در News، Documents و List Pageها باید دقیقاً یک Component باشد.

---

# 55. Empty State

هیچ صفحه‌ای نباید فقط یک متن ساده «داده‌ای وجود ندارد» نمایش دهد.

ساختار:

```text
Icon / Illustration
Title
Description
Optional Action
```

---

# 56. Loading State

برای صفحات Data-driven از Skeleton استفاده شود.

از Spinner تمام‌صفحه فقط در شرایط خاص استفاده شود.

---

# 57. Motion System

```css
--duration-fast:   160ms;
--duration-normal: 220ms;
--duration-slow:   320ms;

--ease-standard:
  cubic-bezier(.2, 0, 0, 1);

--ease-emphasized:
  cubic-bezier(.2, .8, .2, 1);
```

---

# 58. Hover Motion

Card:

```css
transform: translateY(-4px);
```

Button:

```text
بدون حرکت یا حداکثر تغییر بسیار محدود
```

Icon:

```text
2–4px directional motion only when meaningful
```

---

# 59. Motion Rules

ممنوع:

- Scale شدید
- Bounce غیرضروری
- Gradientهای دائماً متحرک در چندین Section
- Animationهای متفاوت بدون منطق مشترک
- Hoverهای آزاردهنده

مجاز:

- Fade
- Subtle Slide
- Controlled Elevation
- Meaningful Carousel Motion
- Progress / Loading Motion

---

# 60. Gradient Policy

Gradient جزو Accent است، نه Background پیش‌فرض.

استفاده مجاز:

- Heroهای منتخب
- CTA خاص
- Illustration
- Decorative Shape

استفاده نامناسب:

- تمام Headingها
- تمام Buttonها
- تمام Cardها
- چند Gradient متفاوت در یک صفحه

---

# 61. Iconography

قواعد:

- یک Icon Family اصلی انتخاب شود.
- Stroke Width در تمام صفحات ثابت باشد.
- Iconهای رنگی فقط در صورت نیاز.
- داخل Button اندازه Icon معمولاً 18–20px باشد.
- decorative iconها با iconهای functional اشتباه نشوند.

---

# 62. Images

تمام تصاویر Cardهای یک گروه باید Aspect Ratio یکسان داشته باشند.

پیشنهادها:

```text
News: 16:10
Course: 16:10
Event: 16:9
Profile: 1:1
Hero: context dependent
```

---

# 63. Content Width

متن‌های طولانی نباید تمام عرض Container را بگیرند.

حداکثر عرض مناسب برای متن Long-form:

```text
720–800px
```

---

# 64. Accessibility

Minimum Target Size:

```text
44 × 44px
```

برای عناصر تعاملی اصلی.

---

# 65. Keyboard

تمام موارد زیر باید keyboard accessible باشند:

- Menu
- Dropdown
- Button
- Tabs
- Modal
- Carousel Controls
- Form controls

---

# 66. Reduced Motion

باید در نسخه نهایی از:

```css
@media (prefers-reduced-motion: reduce)
```

پشتیبانی شود.

---

# 67. RTL

پروژه فارسی است، بنابراین:

```css
direction: rtl;
```

اما:

- Iconهای directional باید RTL-aware باشند.
- Layout logic ترجیحاً از `margin-inline`, `padding-inline`, `inset-inline` استفاده کند.
- تا حد امکان از `left/right` برای layout عمومی اجتناب شود.

---

# 68. CSS Rules

## ممنوع

```css
!important
```

مگر در شرایط کاملاً استثنایی و مستند.

---

## ترجیح داده شود

```css
margin-inline
padding-inline
inset-inline
border-inline
```

به جای نسخه‌های `left/right`.

---

# 69. Component Overrides

این الگو ممنوع است:

```css
.news-section .shared-button {
  width: ... !important;
  border-radius: ... !important;
}
```

راه درست:

```jsx
<Button
  variant="outline"
  size="sm"
/>
```

یا اضافه کردن API منطقی به خود Component.

---

# 70. Naming Convention

نام Componentها:

```text
PascalCase
```

مثال:

```text
SectionHeader
MediaCard
IconButton
```

CSS class:

```text
kebab-case
```

یا در صورت استفاده از CSS Module:

```text
camelCase
```

یک روش باید برای کل پروژه قفل شود.

---

# 71. Page Composition

Pageها باید تا حد امکان Compose شوند، نه اینکه خودشان primitive UI بسازند.

مثال مناسب:

```jsx
<PageHeader />
<FilterBar />
<MediaGrid />
<Pagination />
```

نامناسب:

یک فایل Page بسیار بزرگ که Button، Input، Card و Heading را مستقیماً style کند.

---

# 72. Responsive Rules

## Desktop

- Layout کامل
- چندستونه
- spacing بیشتر

## Tablet

- کاهش تعداد ستون‌ها
- spacing متوسط

## Mobile

- CTAهای اصلی full-width در صورت نیاز
- Grid تک‌ستونه یا دو ستونه محدود
- Navigation موبایل مستقل
- Typography responsive
- Horizontal overflow ممنوع

---

# 73. Mobile Type Scale

برای Mobile در صورت نیاز:

```text
Display: 34px
H1: 30px
H2: 26px
H3: 22px
```

Body معمولاً ثابت می‌ماند.

---

# 74. Z-index Scale

از z-indexهای تصادفی استفاده نشود.

```css
--z-base:      0;
--z-raised:    10;
--z-dropdown:  100;
--z-sticky:    200;
--z-overlay:   500;
--z-modal:     600;
--z-toast:     700;
```

---

# 75. UI States

هر Component تعاملی باید در صورت مرتبط بودن این stateها را داشته باشد:

```text
Default
Hover
Focus
Active
Disabled
Loading
Error
Selected
```

---

# 76. Design System Source of Truth

ترتیب اعتبار:

1. `DESIGN_SYSTEM.md`
2. `tokens.css`
3. Shared UI Components
4. Page-specific styles

Page-specific CSS اجازه نقض سه لایه بالاتر را ندارد مگر با تصمیم مستند.

---

# 77. Implementation Order

پیاده‌سازی Design System باید مرحله‌ای باشد.

## Phase 1 — Foundation

ساخت:

```text
tokens.css
globals.css
utilities.css
```

پاکسازی:

```text
variables.css
```

یا انتقال تدریجی آن به Tokens.

---

## Phase 2 — Core Components

به ترتیب:

1. Button
2. IconButton
3. SectionHeader
4. PageHeader
5. Card
6. Badge
7. FormField
8. Input
9. Select
10. Breadcrumb
11. Pagination

---

## Phase 3 — Global Layout

بازطراحی:

1. Header
2. Footer
3. MainLayout
4. Global Container
5. Page spacing

---

## Phase 4 — Reference Page

صفحه Home به‌عنوان اولین صفحه مرجع Design System بازطراحی می‌شود.

---

## Phase 5 — Public Pages

پیشنهاد ترتیب:

1. About
2. Contact
3. News
4. News Detail
5. Events
6. Courses
7. Detail Pages
8. Documents

---

## Phase 6 — Service Pages

تمام صفحات Service و Research Support از Componentهای تثبیت‌شده استفاده می‌کنند.

---

## Phase 7 — Authentication

یکپارچه‌سازی:

- Login
- Register
- Reset Password
- سایر صفحات Auth

---

## Phase 8 — Dashboards

داشبوردها در لایه دوم Design System قرار می‌گیرند.

Dashboard ممکن است density متفاوتی داشته باشد، اما باید همان:

- Color Tokens
- Typography
- Buttons
- Inputs
- Radius
- Shadows
- Focus States

را حفظ کند.

---

# 78. Migration Strategy

بازطراحی نباید یکباره کل CSS پروژه را حذف کند.

روش استاندارد:

### Step 1

Component جدید ایجاد شود.

### Step 2

یک بخش موجود به Component جدید مهاجرت کند.

### Step 3

Visual Regression بررسی شود.

### Step 4

CSS قدیمی مربوط به همان بخش حذف شود.

### Step 5

به بخش بعدی برویم.

---

# 79. Definition of Done — Component

یک Component زمانی تکمیل است که:

- از Tokenها استفاده کند.
- Responsive باشد.
- Focus State داشته باشد.
- Stateهای لازم را پوشش دهد.
- در چند صفحه قابل استفاده باشد.
- بدون `!important` کار کند.
- CSS صفحه مجبور به override کردن آن نباشد.

---

# 80. Definition of Done — Page

یک Page زمانی Design-System compliant است که:

- Heading hierarchy صحیح باشد.
- تمام CTAها از Button System باشند.
- Cardهای آن از Card System استفاده کنند.
- spacing از Scale باشد.
- radius تصادفی نداشته باشد.
- shadow تصادفی نداشته باشد.
- رنگ hard-coded غیرضروری نداشته باشد.
- Mobile layout بررسی شده باشد.
- Hover / Focus state بررسی شده باشد.
- Shared component با CSS موضعی override نشده باشد.

---

# 81. Design Review Checklist

قبل از Merge هر صفحه:

### Visual

- [ ] آیا صفحه شبیه بخشی از همان محصول است؟
- [ ] آیا hierarchy واضح است؟
- [ ] آیا رنگ Accent بیش از حد استفاده نشده؟
- [ ] آیا radiusها یکپارچه‌اند؟
- [ ] آیا Shadowها محدود و استانداردند؟
- [ ] آیا تیترها از Type Scale پیروی می‌کنند؟
- [ ] آیا Section spacing صحیح است؟

### Component

- [ ] Shared Button؟
- [ ] Shared Card؟
- [ ] Shared SectionHeader؟
- [ ] Shared Form controls؟
- [ ] Shared Pagination/Breadcrumb در صورت نیاز؟

### CSS

- [ ] `!important` جدید نداریم؟
- [ ] Hex color غیرضروری نداریم؟
- [ ] spacing تصادفی نداریم؟
- [ ] z-index تصادفی نداریم؟
- [ ] RTL logical properties رعایت شده؟

### Responsive

- [ ] 1440px
- [ ] 1280px
- [ ] 1024px
- [ ] 768px
- [ ] 390px

### Accessibility

- [ ] Keyboard
- [ ] Focus Visible
- [ ] Contrast
- [ ] Target Size
- [ ] Form Labels
- [ ] Reduced Motion

---

# 82. Initial Token File

نسخه اولیه پیشنهادی:

```css
:root {
  /* Brand */
  --color-brand-950: #07182b;
  --color-brand-900: #0b2038;
  --color-brand-800: #123052;
  --color-brand-700: #1a365d;
  --color-brand-600: #244c78;
  --color-brand-100: #eaf0f6;
  --color-brand-50: #f5f8fb;

  /* Action */
  --color-action-700: #0b6f9c;
  --color-action-600: #008fc8;
  --color-action-500: #00adea;
  --color-action-100: #def5fd;
  --color-action-50: #f0faff;

  /* Accent */
  --color-accent-700: #087f84;
  --color-accent-600: #009e99;
  --color-accent-500: #01d2c9;
  --color-accent-100: #dffaf8;
  --color-accent-50: #f0fdfc;

  /* Neutral */
  --color-neutral-950: #0f172a;
  --color-neutral-900: #111827;
  --color-neutral-800: #1f2937;
  --color-neutral-700: #374151;
  --color-neutral-600: #4b5563;
  --color-neutral-500: #6b7280;
  --color-neutral-400: #9ca3af;
  --color-neutral-300: #d1d5db;
  --color-neutral-200: #e5e7eb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-50: #f8fafc;

  /* Semantic */
  --color-success: #15803d;
  --color-warning: #b7791f;
  --color-danger: #b42318;
  --color-info: #0b6f9c;

  /* Surface */
  --surface-page: #ffffff;
  --surface-subtle: #f8fafc;
  --surface-muted: #f3f6f9;
  --surface-dark: #0b2038;

  /* Text */
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;
  --text-disabled: #9ca3af;
  --text-inverse: #ffffff;

  /* Border */
  --border-subtle: #e5e7eb;
  --border-default: #d1d5db;
  --border-strong: #9ca3af;

  /* Typography */
  --font-primary: "IRANSans", sans-serif;

  --text-display: 42px;
  --text-h1: 36px;
  --text-h2: 30px;
  --text-h3: 24px;
  --text-h4: 20px;
  --text-body-lg: 16px;
  --text-body: 14px;
  --text-body-sm: 13px;
  --text-caption: 12px;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-black: 900;

  --line-display: 1.45;
  --line-heading: 1.55;
  --line-body: 1.9;
  --line-compact: 1.6;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 999px;

  /* Shadow */
  --shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-sm: 0 4px 12px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 12px 28px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 24px 56px rgba(15, 23, 42, 0.12);

  --focus-ring: 0 0 0 3px rgba(0, 173, 234, 0.14);

  /* Motion */
  --duration-fast: 160ms;
  --duration-normal: 220ms;
  --duration-slow: 320ms;

  --ease-standard: cubic-bezier(.2, 0, 0, 1);
  --ease-emphasized: cubic-bezier(.2, .8, .2, 1);

  /* Layout */
  --layout-wide: 1440px;
  --layout-content: 1240px;

  --gutter-desktop: 28px;
  --gutter-tablet: 24px;
  --gutter-mobile: 16px;

  --header-height: 96px;

  /* Z-index */
  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 500;
  --z-modal: 600;
  --z-toast: 700;
}
```

---

# 83. Refactoring Rule

هنگام بازطراحی هر صفحه، اول سؤال زیر پرسیده می‌شود:

> آیا Component یا Token مورد نیاز این UI از قبل وجود دارد؟

اگر پاسخ **بله** باشد:

از همان استفاده می‌کنیم.

اگر پاسخ **خیر** باشد:

ابتدا بررسی می‌کنیم آیا این نیاز:

1. عمومی و قابل استفاده مجدد است؟
2. فقط مربوط به همین صفحه است؟

اگر عمومی باشد:

به Design System اضافه می‌شود.

اگر اختصاصی باشد:

در سطح Feature/Page باقی می‌ماند.

---

# 84. Governance

هر تغییر اساسی در موارد زیر باید ابتدا در Design System ثبت شود:

- Brand Color
- Typography Scale
- Spacing Scale
- Radius
- Shadow
- Button API
- Form API
- Global Layout
- Navigation Pattern

صفحه نباید به‌تنهایی این موارد را تغییر دهد.

---

# 85. Versioning

این سند Version خواهد داشت.

مثال:

```text
v1.0 — Foundation
v1.1 — Core Components
v1.2 — Home Patterns
v1.3 — Dashboard Patterns
v2.0 — Major visual revision
```

---

# 86. Current Project Strategy

ترتیب پیشنهادی ادامه پروژه:

```text
Design System Foundation
↓
Tokens
↓
Core Components
↓
Header / Footer / Layout
↓
Home Page
↓
Public Pages
↓
Service Pages
↓
Authentication
↓
Dashboard
↓
Responsive Audit
↓
Accessibility Audit
↓
Final Visual Consistency Audit
```

---

# 87. Final Principle

هدف Design System این نیست که همه صفحات دقیقاً شبیه هم شوند.

هدف این است که:

> **تمام صفحات متفاوت باشند، اما واضح باشد که همه متعلق به یک محصول هستند.**

---

**Hatef Design System — v1.0**
