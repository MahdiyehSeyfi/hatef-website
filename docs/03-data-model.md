# 03 - مدل داده سامانه هاتف

این سند مدل داده اولیه سامانه هاتف را مشخص می‌کند.
هدف این است که قبل از اتصال دیتابیس، بدانیم هر بخش سامانه چه داده‌هایی نیاز دارد و ارتباط بین داده‌ها چگونه است.

این مدل در مراحل بعدی می‌تواند برای طراحی دیتابیس در Firebase، Supabase یا هر بک‌اند دیگر استفاده شود.

---

## 1. User - کاربر

تمام کاربران سامانه در این مدل ذخیره می‌شوند؛ مثل فناور، داور، دبیرخانه، همکار تجاری و مدرس.

| فیلد           | توضیح              |
| -------------- | ------------------ |
| `id`           | شناسه یکتا         |
| `firstName`    | نام                |
| `lastName`     | نام خانوادگی       |
| `fullName`     | نام کامل           |
| `email`        | ایمیل              |
| `mobile`       | شماره موبایل       |
| `role`         | نقش کاربر          |
| `organization` | سازمان یا شرکت     |
| `expertise`    | حوزه تخصصی         |
| `avatarUrl`    | تصویر پروفایل      |
| `createdAt`    | تاریخ ایجاد حساب   |
| `updatedAt`    | تاریخ آخرین ویرایش |

### مقدارهای role

```text
innovator
reviewer
committee
business_partner
instructor
support
admin
```

---

## 2. Call - فراخوان

فراخوان‌هایی که دبیرخانه ایجاد می‌کند.

| فیلد              | توضیح                       |
| ----------------- | --------------------------- |
| `id`              | شناسه یکتا                  |
| `title`           | عنوان فراخوان               |
| `subtitle`        | زیرعنوان                    |
| `field`           | حوزه فراخوان                |
| `description`     | توضیح اصلی                  |
| `moreDescription` | توضیحات تکمیلی              |
| `deadlineDate`    | تاریخ پایان                 |
| `deadlineTime`    | ساعت پایان                  |
| `status`          | وضعیت فراخوان               |
| `pdfFileUrl`      | فایل PDF فراخوان یا اطلاعیه |
| `createdBy`       | شناسه کاربر سازنده          |
| `createdAt`       | تاریخ ایجاد                 |
| `publishedAt`     | تاریخ انتشار                |
| `updatedAt`       | تاریخ آخرین ویرایش          |

### وضعیت‌های فراخوان

```text
draft
published
inactive
archived
```

---

## 3. Plan - طرح

طرحی که فناور در یک فراخوان ثبت می‌کند.

| فیلد                  | توضیح                           |
| --------------------- | ------------------------------- |
| `id`                  | شناسه یکتا                      |
| `trackingCode`        | کد رهگیری                       |
| `title`               | عنوان طرح                       |
| `summary`             | خلاصه طرح                       |
| `callId`              | شناسه فراخوان مربوط             |
| `innovatorId`         | شناسه فناور                     |
| `field`               | حوزه طرح                        |
| `proposalFileUrl`     | فایل پروپوزال                   |
| `status`              | وضعیت کلی طرح                   |
| `currentReviewStatus` | وضعیت بررسی در دبیرخانه         |
| `committeeFeedback`   | بازخورد دبیرخانه یا کمیته       |
| `finalStatus`         | وضعیت نهایی                     |
| `finalDecisionNote`   | توضیح تصمیم نهایی               |
| `resultsPublished`    | آیا نتیجه برای فناور منتشر شده؟ |
| `submittedAt`         | تاریخ ارسال                     |
| `updatedAt`           | تاریخ آخرین تغییر               |

### وضعیت‌های کلی طرح

```text
submitted
under_review
reviewed
accepted
weak_accepted
rejected
weak_rejected
needs_revision
```

### وضعیت بررسی در دبیرخانه

```text
pending
reviewed
```

### وضعیت نهایی

```text
accepted
weak_accepted
rejected
weak_rejected
needs_revision
none
```

---

## 4. Review - بازخورد داور

بازخوردی که داور برای یک طرح ثبت می‌کند.

| فیلد             | توضیح              |
| ---------------- | ------------------ |
| `id`             | شناسه یکتا         |
| `planId`         | شناسه طرح          |
| `reviewerId`     | شناسه داور         |
| `feedbackText`   | متن بازخورد        |
| `score`          | امتیاز داور        |
| `recommendation` | پیشنهاد داور       |
| `createdAt`      | تاریخ ثبت          |
| `updatedAt`      | تاریخ آخرین ویرایش |

### مقدارهای recommendation

```text
accept
weak_accept
reject
weak_reject
needs_revision
```

---

## 5. PlanFolder - فولدر طرح‌ها

برای فولدربندی طرح‌ها توسط داور یا دبیرخانه.

| فیلد         | توضیح                                      |
| ------------ | ------------------------------------------ |
| `id`         | شناسه یکتا                                 |
| `userId`     | کاربری که فولدر را ساخته یا استفاده می‌کند |
| `planId`     | شناسه طرح                                  |
| `folderType` | نوع فولدر                                  |
| `createdAt`  | تاریخ افزودن                               |

### مقدارهای folderType

```text
priority
needs_improvement
more_review
```

---

## 6. Task - وظیفه طرح قبول‌شده

وظیفه‌ای که دبیرخانه یا کمیته برای فناور در صفحه طرح قبول‌شده تعریف می‌کند.

| فیلد                    | توضیح                         |
| ----------------------- | ----------------------------- |
| `id`                    | شناسه یکتا                    |
| `planId`                | شناسه طرح                     |
| `createdBy`             | شناسه کاربر دبیرخانه یا کمیته |
| `title`                 | عنوان وظیفه                   |
| `managerMessage`        | پیام مدیر یا دبیرخانه         |
| `deadlineDate`          | تاریخ ددلاین                  |
| `deadlineTime`          | ساعت ددلاین                   |
| `status`                | وضعیت وظیفه                   |
| `innovatorResponseText` | پاسخ متنی فناور               |
| `innovatorFileUrl`      | فایل ارسالی فناور             |
| `managerFeedback`       | بازخورد مدیر روی پاسخ         |
| `createdAt`             | تاریخ ایجاد                   |
| `respondedAt`           | تاریخ پاسخ فناور              |
| `finishedAt`            | تاریخ پایان‌یافتن وظیفه       |
| `updatedAt`             | تاریخ آخرین تغییر             |

### وضعیت‌های وظیفه

```text
waiting_for_innovator_review
viewed_by_innovator
answered_by_innovator
needs_revision
finished
```

### معنی وضعیت‌ها

| وضعیت                          | معنی                     |
| ------------------------------ | ------------------------ |
| `waiting_for_innovator_review` | در انتظار بررسی فناور    |
| `viewed_by_innovator`          | مشاهده‌شده توسط فناور    |
| `answered_by_innovator`        | پاسخ داده‌شده توسط فناور |
| `needs_revision`               | نیازمند اصلاح            |
| `finished`                     | پایان‌یافته              |

---

## 7. BusinessPartnerProfile - پروفایل همکار تجاری

اطلاعات اختصاصی همکاران تجاری.

| فیلد                | توضیح                      |
| ------------------- | -------------------------- |
| `id`                | شناسه یکتا                 |
| `userId`            | شناسه کاربر                |
| `companyName`       | نام شرکت                   |
| `industry`          | صنعت یا حوزه فعالیت        |
| `cooperationFields` | حوزه‌های مورد علاقه همکاری |
| `website`           | وب‌سایت                    |
| `description`       | توضیح کوتاه                |
| `createdAt`         | تاریخ ایجاد                |
| `updatedAt`         | تاریخ آخرین تغییر          |

---

## 8. CommercialOpportunity - موقعیت تجاری

موقعیت‌هایی که همکار تجاری می‌تواند مشاهده و برای آن درخواست ثبت کند.

| فیلد                | توضیح             |
| ------------------- | ----------------- |
| `id`                | شناسه یکتا        |
| `title`             | عنوان موقعیت      |
| `summary`           | خلاصه موقعیت      |
| `field`             | حوزه              |
| `collaborationType` | نوع همکاری        |
| `status`            | وضعیت موقعیت      |
| `deadlineDate`      | تاریخ مهلت        |
| `createdBy`         | شناسه سازنده      |
| `createdAt`         | تاریخ ایجاد       |
| `updatedAt`         | تاریخ آخرین تغییر |

### وضعیت‌های موقعیت تجاری

```text
published
inactive
archived
```

---

## 9. CollaborationRequest - درخواست همکاری

درخواستی که همکار تجاری برای یک موقعیت ثبت می‌کند.

| فیلد                | توضیح              |
| ------------------- | ------------------ |
| `id`                | شناسه یکتا         |
| `opportunityId`     | شناسه موقعیت تجاری |
| `businessPartnerId` | شناسه همکار تجاری  |
| `message`           | پیام درخواست       |
| `status`            | وضعیت درخواست      |
| `adminReply`        | پاسخ دبیرخانه      |
| `createdAt`         | تاریخ ثبت          |
| `repliedAt`         | تاریخ پاسخ         |
| `updatedAt`         | تاریخ آخرین تغییر  |

### وضعیت‌های درخواست همکاری

```text
pending
seen
answered
accepted
rejected
```

---

## 10. InstructorProfile - پروفایل مدرس / رویدادگر

اطلاعات اختصاصی مدرسین و رویدادگرها.

| فیلد              | توضیح             |
| ----------------- | ----------------- |
| `id`              | شناسه یکتا        |
| `userId`          | شناسه کاربر       |
| `expertise`       | حوزه تخصص         |
| `bio`             | معرفی کوتاه       |
| `organization`    | سازمان یا مجموعه  |
| `experienceYears` | سابقه فعالیت      |
| `createdAt`       | تاریخ ایجاد       |
| `updatedAt`       | تاریخ آخرین تغییر |

---

## 11. Activity - دوره یا رویداد

دوره یا رویدادی که مدرس می‌سازد و برای بررسی ارسال می‌کند.

| فیلد                | توضیح                  |
| ------------------- | ---------------------- |
| `id`                | شناسه یکتا             |
| `type`              | نوع: دوره یا رویداد    |
| `title`             | عنوان                  |
| `summary`           | توضیح مختصر            |
| `description`       | توضیحات کامل           |
| `topic`             | موضوع                  |
| `capacity`          | ظرفیت                  |
| `startDate`         | تاریخ شروع             |
| `startTime`         | ساعت شروع              |
| `duration`          | مدت                    |
| `instructorId`      | شناسه مدرس             |
| `status`            | وضعیت                  |
| `rejectionFeedback` | بازخورد رد شدن         |
| `createdAt`         | تاریخ ایجاد            |
| `submittedAt`       | تاریخ ارسال برای بررسی |
| `publishedAt`       | تاریخ انتشار           |
| `updatedAt`         | تاریخ آخرین تغییر      |

### مقدارهای type

```text
course
event
```

### وضعیت‌های دوره یا رویداد

```text
draft
pending_review
published
rejected
```

### منطق وضعیت

- اگر مدرس ساخته ولی هنوز نفرستاده باشد: `draft`
- اگر برای بررسی فرستاده باشد: `pending_review`
- اگر دبیرخانه تأیید کند: `published`
- اگر دبیرخانه رد کند و بازخورد بدهد: `rejected`

---

## 12. ExecutionOrder - سفارش اجرا

سفارشی که دبیرخانه برای ساخت یک دوره یا رویداد ثبت می‌کند تا مدرسین آن را بپذیرند.

| فیلد           | توضیح                |
| -------------- | -------------------- |
| `id`           | شناسه یکتا           |
| `title`        | عنوان سفارش          |
| `summary`      | توضیح مختصر          |
| `topic`        | موضوع دوره یا رویداد |
| `activityType` | دوره یا رویداد       |
| `deadlineDate` | تاریخ ددلاین         |
| `deadlineTime` | ساعت ددلاین          |
| `status`       | وضعیت سفارش          |
| `acceptedBy`   | شناسه مدرس پذیرنده   |
| `createdBy`    | شناسه کاربر دبیرخانه |
| `createdAt`    | تاریخ ایجاد          |
| `acceptedAt`   | تاریخ پذیرش          |
| `updatedAt`    | تاریخ آخرین تغییر    |

### وضعیت‌های سفارش اجرا

```text
open
accepted
completed
cancelled
```

---

## 13. Message - پیام و اعلان

پیام‌های سامانه و اعلان‌هایی که برای کاربران نمایش داده می‌شوند.

| فیلد                | توضیح               |
| ------------------- | ------------------- |
| `id`                | شناسه یکتا          |
| `userId`            | گیرنده پیام         |
| `title`             | عنوان پیام          |
| `body`              | متن پیام            |
| `type`              | نوع پیام            |
| `isRead`            | خوانده‌شده یا نه    |
| `isImportant`       | مهم یا معمولی       |
| `relatedEntityType` | نوع موجودیت مرتبط   |
| `relatedEntityId`   | شناسه موجودیت مرتبط |
| `createdAt`         | تاریخ ایجاد         |

### نوع پیام

```text
system
call
plan
review
task
event
business
support
```

---

## 14. SupportTicket - تیکت پشتیبانی

درخواست‌های پشتیبانی کاربران.

| فیلد            | توضیح                 |
| --------------- | --------------------- |
| `id`            | شناسه یکتا            |
| `userId`        | شناسه کاربر ثبت‌کننده |
| `title`         | عنوان درخواست         |
| `message`       | متن درخواست           |
| `status`        | وضعیت                 |
| `supportReply`  | پاسخ پشتیبانی         |
| `seenBySupport` | آیا پشتیبان دیده است؟ |
| `createdAt`     | تاریخ ایجاد           |
| `repliedAt`     | تاریخ پاسخ            |
| `updatedAt`     | تاریخ آخرین تغییر     |

### وضعیت‌های تیکت

```text
pending
seen
in_progress
answered
closed
```

---

## 15. FileAsset - فایل‌ها

برای مدیریت فایل‌های آپلودشده مثل پروپوزال، PDF فراخوان، فایل پاسخ وظیفه و غیره.

| فیلد         | توضیح               |
| ------------ | ------------------- |
| `id`         | شناسه یکتا          |
| `ownerId`    | شناسه مالک فایل     |
| `entityType` | نوع موجودیت مرتبط   |
| `entityId`   | شناسه موجودیت مرتبط |
| `fileName`   | نام فایل            |
| `fileUrl`    | آدرس فایل           |
| `fileType`   | نوع فایل            |
| `fileSize`   | حجم فایل            |
| `uploadedAt` | تاریخ آپلود         |

### entityType

```text
call
plan
task
activity
support_ticket
commercial_opportunity
```

---

## 16. روابط اصلی بین داده‌ها

### کاربر و نقش

```text
User.role مشخص می‌کند کاربر وارد کدام داشبورد شود.
```

### فناور و طرح

```text
User(id) → Plan(innovatorId)
```

هر فناور می‌تواند چند طرح داشته باشد.

### فراخوان و طرح

```text
Call(id) → Plan(callId)
```

هر فراخوان می‌تواند چند طرح داشته باشد.

### طرح و بازخورد داور

```text
Plan(id) → Review(planId)
User(id) → Review(reviewerId)
```

هر طرح می‌تواند چند بازخورد از چند داور داشته باشد.

### طرح و وظیفه

```text
Plan(id) → Task(planId)
```

هر طرح قبول‌شده می‌تواند چند وظیفه داشته باشد.

### همکار تجاری و درخواست همکاری

```text
User(id) → CollaborationRequest(businessPartnerId)
CommercialOpportunity(id) → CollaborationRequest(opportunityId)
```

### مدرس و دوره/رویداد

```text
User(id) → Activity(instructorId)
```

### سفارش اجرا و مدرس

```text
ExecutionOrder(acceptedBy) → User(id)
```

---

## 17. نکات قابل اصلاح در آینده

- ممکن است دبیرخانه و کمیته راهبری در دیتابیس دو نقش جدا شوند.
- ممکن است برای هر طرح، چند فایل جداگانه ذخیره شود.
- ممکن است برای هر وظیفه، چند فایل پاسخ وجود داشته باشد.
- ممکن است بازخورد داور نیاز به فرم امتیازدهی دقیق‌تر داشته باشد.
- ممکن است فعالیت‌ها به دو جدول جدا یعنی Course و Event تقسیم شوند.
- ممکن است پیام‌ها و اعلان‌ها در آینده از هم جدا شوند.
