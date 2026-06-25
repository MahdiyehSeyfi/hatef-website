import { REVIEW_RECOMMENDATION } from "../constants/statuses";

export const MOCK_REVIEWS = [
  {
    id: "review-ai-assistant-1",
    planId: "plan-ai-assistant",
    reviewerId: "user-reviewer-1",
    feedbackText:
      "ایده طرح کاربردی است، اما لازم است معماری فنی، مدل داده و مسیر پیاده‌سازی دقیق‌تر شود.",
    score: 78,
    recommendation: REVIEW_RECOMMENDATION.NEEDS_REVISION,
    createdAt: "1405/03/21",
    updatedAt: "1405/03/21",
  },
  {
    id: "review-energy-monitoring-1",
    planId: "plan-energy-monitoring",
    reviewerId: "user-reviewer-1",
    feedbackText:
      "طرح از نظر فنی قابل قبول است. پیشنهاد می‌شود بخش تحلیل اقتصادی و مدل درآمدی تقویت شود.",
    score: 82,
    recommendation: REVIEW_RECOMMENDATION.WEAK_ACCEPT,
    createdAt: "1405/03/24",
    updatedAt: "1405/03/24",
  },
  {
    id: "review-marketplace-1",
    planId: "plan-marketplace",
    reviewerId: "user-reviewer-1",
    feedbackText:
      "طرح از نظر مسئله، بازار هدف و ظرفیت تجاری مناسب است و قابلیت ورود به مرحله بعد را دارد.",
    score: 90,
    recommendation: REVIEW_RECOMMENDATION.ACCEPT,
    createdAt: "1405/03/26",
    updatedAt: "1405/03/26",
  },
];
