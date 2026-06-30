import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import universityLogo from "../../assets/logos/university-of-tehran-logo.svg";
import bannerImage from "../../assets/images/banner.png";
import { uploadImageFileToSiteMedia } from "../../services/mediaStorageService";
import {
  addInstructorActivity,
  getInstructorActivities,
} from "../../services/instructorActivityService";
import { savePublicActivityPreviewDraft } from "../../services/publicActivityService";
import {
  getActivityRegistrationStats,
  getActivityRegistrationsByActivityId,
} from "../../services/activityRegistrationService";
import {
  getActivityNoticeRecipientsCount,
  getActivityParticipantNotices,
  getBroadcastActivityNoticeRecipientsCount,
  sendActivityParticipantNotice,
} from "../../services/activityParticipantNoticeService";
import {
  addSupportTicket,
  deleteSupportTicket,
  getCurrentUserSupportTickets,
} from "../../services/supportService";
import {
  acceptExecutionOrder as acceptExecutionOrderInService,
  getInstructorExecutionOrders,
} from "../../services/executionOrderService";
import {
  deleteAllNotificationsForCurrentUser,
  deleteNotification,
  getNotificationsForCurrentUser,
  markAllNotificationsAsReadForCurrentUser,
  markNotificationAsRead,
} from "../../services/notificationService";

import {
  getCurrentDashboardProfile,
  saveCurrentDashboardProfile,
} from "../../services/userProfileService";

import "./InnovatorDashboardPage.css";
import "./InstructorDashboardPage.css";

const COURSE_PREVIEW_CSS =
  ':root { --color-white: #ffffff; --color-primary: #0a274f; --color-secondary: #00adea; --color-accent: #01d2c9; --color-warning: #f9bd31; --color-black: #111111; --color-muted: #6b7280; --container-padding: 65px; }\n* { box-sizing: border-box; }\nbody { margin: 0; font-family: IRANSans, Tahoma, Arial, sans-serif; direction: rtl; background: #ffffff; }\na { text-decoration: none; }\n.course-details-page {\n  --course-details-width: 1360px;\n\n  background-color: var(--color-white);\n}\n\n.course-details-page__container {\n  width: min(\n    calc(100% - (2 * var(--container-padding))),\n    var(--course-details-width)\n  );\n  margin-inline: auto;\n}\n\n/* Breadcrumb */\n\n.course-details__breadcrumb {\n  display: flex;\n  align-items: center;\n  gap: 9px;\n  margin-bottom: 30px;\n  color: #9198a2;\n  font-size: 12px;\n}\n\n.course-details__breadcrumb a {\n  color: inherit;\n  transition: color 180ms ease;\n}\n\n.course-details__breadcrumb a:hover {\n  color: var(--color-accent);\n}\n\n/* Hero */\n\n.course-details-hero {\n  position: relative;\n  padding: 46px 0 100px;\n  overflow: hidden;\n  background:\n    radial-gradient(\n      circle at 85% 15%,\n      rgba(0, 173, 234, 0.08),\n      transparent 30%\n    ),\n    var(--color-white);\n}\n\n.course-details-hero::after {\n  position: absolute;\n  right: -5%;\n  bottom: -105px;\n  width: 110%;\n  height: 170px;\n  content: "";\n  border-radius: 50% 50% 0 0;\n  background-color: #fafafa;\n}\n\n.course-details-hero__grid {\n  display: grid;\n  grid-template-columns:\n    minmax(0, 0.95fr)\n    minmax(0, 1.05fr);\n  grid-template-areas: "media content";\n  align-items: center;\n  gap: 76px;\n  direction: ltr;\n}\n\n.course-details-hero__media {\n  position: relative;\n  grid-area: media;\n  height: 440px;\n  overflow: hidden;\n  border-radius: 8px;\n  background-color: var(--color-primary);\n  box-shadow: 0 20px 55px rgba(26, 54, 93, 0.15);\n}\n\n.course-details-hero__media img {\n  width: 100%;\n  height: 100%;\n  display: block;\n  object-fit: cover;\n  transition:\n    filter 450ms ease,\n    transform 650ms ease;\n}\n\n.course-details-hero__media:hover img {\n  filter: brightness(0.82);\n  transform: scale(1.025);\n}\n\n.course-details-hero__badges {\n  position: absolute;\n  right: 20px;\n  bottom: 19px;\n  left: 20px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 15px;\n}\n\n.course-details-hero__badges span {\n  min-height: 31px;\n  display: inline-flex;\n  align-items: center;\n  padding: 5px 14px;\n  border-radius: 17px;\n  color: #26323d;\n  background-color: var(--color-warning);\n  font-size: 11px;\n  font-weight: 700;\n}\n\n.course-details-hero__badges span:last-child {\n  color: var(--color-white);\n  background-color: rgba(10, 39, 79, 0.84);\n  backdrop-filter: blur(8px);\n}\n\n.course-details-hero__content {\n  grid-area: content;\n  min-width: 0;\n  direction: rtl;\n}\n\n.course-details-hero__eyebrow,\n.course-content-section__eyebrow {\n  display: inline-flex;\n  align-items: center;\n  min-height: 30px;\n  margin-bottom: 15px;\n  padding: 4px 13px;\n  border-radius: 18px;\n  color: #078c86;\n  background-color: rgba(1, 210, 201, 0.11);\n  font-size: 12px;\n  font-weight: 700;\n}\n\n.course-details-hero__content h1 {\n  margin: 0 0 22px;\n  color: var(--color-black);\n  font-size: 38px;\n  font-weight: 900;\n  line-height: 1.65;\n}\n\n.course-details-hero__content p {\n  margin: 0 0 12px;\n  color: #4f5761;\n  font-size: 14px;\n  line-height: 2.25;\n}\n\n.course-details-hero__button {\n  width: 190px;\n  min-height: 49px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  margin-top: 28px;\n  color: var(--color-white);\n  background: linear-gradient(\n    135deg,\n    var(--color-accent),\n    var(--color-secondary)\n  );\n  font-size: 14px;\n  font-weight: 700;\n  box-shadow: 0 12px 26px rgba(0, 173, 234, 0.19);\n  transition:\n    box-shadow 200ms ease,\n    transform 200ms ease;\n}\n\n.course-details-hero__button:hover {\n  color: var(--color-white);\n  box-shadow: 0 16px 32px rgba(0, 173, 234, 0.27);\n  transform: translateY(-3px);\n}\n\n/* Metadata */\n\n.course-details-meta {\n  position: relative;\n  z-index: 2;\n  display: grid;\n  grid-template-columns: repeat(5, minmax(0, 1fr));\n  gap: 22px;\n  margin-top: 48px;\n}\n\n.course-details-meta__item {\n  min-height: 90px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 14px;\n  padding: 17px;\n  border: 1px solid #edf0f3;\n  border-radius: 13px;\n  background-color: #fafafa;\n  transition:\n    border-color 220ms ease,\n    box-shadow 220ms ease,\n    transform 220ms ease;\n}\n\n.course-details-meta__item:hover {\n  border-color: rgba(1, 210, 201, 0.35);\n  box-shadow: 0 12px 26px rgba(26, 54, 93, 0.08);\n  transform: translateY(-4px);\n}\n\n.course-details-meta__icon {\n  width: 46px;\n  height: 46px;\n  display: grid;\n  flex: 0 0 auto;\n  place-items: center;\n  border-radius: 12px;\n  color: var(--color-secondary);\n  background-color: rgba(0, 173, 234, 0.09);\n}\n\n.course-details-meta__icon svg {\n  width: 25px;\n  height: 25px;\n}\n\n.course-details-meta__item h2 {\n  margin: 0 0 5px;\n  color: var(--color-black);\n  font-size: 14px;\n  font-weight: 700;\n}\n\n.course-details-meta__item p {\n  margin: 0;\n  color: #737b85;\n  font-size: 12px;\n}\n\n/* Main content */\n\n.course-details-content {\n  padding: 65px 0 72px;\n  background-color: #fafafa;\n}\n\n.course-details-content__grid {\n  display: grid;\n  grid-template-columns: 375px minmax(0, 1fr);\n  grid-template-areas: "sidebar article";\n  align-items: start;\n  gap: 70px;\n  direction: ltr;\n}\n\n.course-details-sidebar {\n  grid-area: sidebar;\n  position: sticky;\n  top: 82px;\n  direction: rtl;\n}\n\n.course-registration-card {\n  padding: 30px;\n  border: 1px solid #edf0f3;\n  border-radius: 16px;\n  background-color: var(--color-white);\n  box-shadow: 0 16px 42px rgba(26, 54, 93, 0.09);\n}\n\n.course-registration-card__header {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-bottom: 21px;\n}\n\n.course-registration-card__header span {\n  min-height: 27px;\n  display: inline-flex;\n  align-items: center;\n  padding: 3px 12px;\n  border-radius: 14px;\n  color: #087d76;\n  background-color: rgba(1, 210, 201, 0.13);\n  font-size: 10px;\n  font-weight: 700;\n}\n\n.course-registration-card__header span:last-child {\n  color: #b77a00;\n  background-color: rgba(249, 189, 49, 0.17);\n}\n\n.course-registration-card h2 {\n  margin: 0 0 24px;\n  color: var(--color-black);\n  font-size: 22px;\n  font-weight: 900;\n  line-height: 1.7;\n}\n\n.course-registration-card__details {\n  margin: 0;\n  padding: 19px 0;\n  border-top: 1px solid #edf0f3;\n  border-bottom: 1px solid #edf0f3;\n}\n\n.course-registration-card__details div {\n  display: grid;\n  grid-template-columns: 105px minmax(0, 1fr);\n  gap: 8px;\n  margin-bottom: 12px;\n  color: #545c66;\n  font-size: 12px;\n  line-height: 1.9;\n}\n\n.course-registration-card__details div:last-child {\n  margin-bottom: 0;\n}\n\n.course-registration-card__details dt {\n  font-weight: 700;\n}\n\n.course-registration-card__details dd {\n  margin: 0;\n}\n\n.course-registration-card__audience {\n  padding: 19px 0 5px;\n}\n\n.course-registration-card__audience h3 {\n  margin: 0 0 13px;\n  color: var(--color-black);\n  font-size: 13px;\n}\n\n.course-registration-card__audience > div {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 9px 13px;\n}\n\n.course-registration-card__audience span {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  color: #505861;\n  font-size: 11px;\n}\n\n.course-registration-card__audience svg {\n  width: 16px;\n  height: 16px;\n  color: #31b889;\n}\n\n.course-registration-card__button {\n  min-height: 49px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-top: 23px;\n  color: var(--color-white);\n  background-color: var(--color-secondary);\n  font-size: 14px;\n  font-weight: 700;\n  transition:\n    background-color 200ms ease,\n    box-shadow 200ms ease,\n    transform 200ms ease;\n}\n\n.course-registration-card__button:hover {\n  color: var(--color-white);\n  background-color: var(--color-primary);\n  box-shadow: 0 11px 25px rgba(26, 54, 93, 0.17);\n  transform: translateY(-3px);\n}\n\n.course-details-share {\n  padding: 21px 5px 0;\n  text-align: center;\n}\n\n.course-details-share > span {\n  display: block;\n  margin-bottom: 14px;\n  color: #656d77;\n  font-size: 11px;\n}\n\n.course-details-share > div {\n  direction: ltr;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 15px;\n}\n\n.course-details-share a {\n  width: 25px;\n  height: 25px;\n  display: grid;\n  place-items: center;\n  opacity: 0.58;\n  transition:\n    opacity 180ms ease,\n    transform 180ms ease;\n}\n\n.course-details-share a:hover {\n  opacity: 1;\n  transform: translateY(-3px);\n}\n\n.course-details-share img {\n  width: 20px;\n  height: 20px;\n}\n\n/* Article column */\n\n.course-details-article {\n  grid-area: article;\n  min-width: 0;\n  direction: rtl;\n}\n\n.course-content-section {\n  margin-bottom: 67px;\n}\n\n.course-content-section:last-child {\n  margin-bottom: 0;\n}\n\n.course-content-section h2 {\n  margin: 0 0 21px;\n  color: var(--color-black);\n  font-size: 30px;\n  font-weight: 900;\n  line-height: 1.7;\n}\n\n.course-content-section > p {\n  margin: 0 0 13px;\n  color: #454d57;\n  font-size: 14px;\n  line-height: 2.35;\n  text-align: justify;\n}\n\n/* Outcomes */\n\n.course-learning-outcomes {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 15px;\n}\n\n.course-learning-outcome {\n  display: flex;\n  align-items: flex-start;\n  gap: 15px;\n  padding: 19px;\n  border: 1px solid #edf0f3;\n  border-radius: 12px;\n  background-color: var(--color-white);\n  transition:\n    border-color 200ms ease,\n    box-shadow 200ms ease,\n    transform 200ms ease;\n}\n\n.course-learning-outcome:hover {\n  border-color: rgba(1, 210, 201, 0.35);\n  box-shadow: 0 10px 25px rgba(26, 54, 93, 0.07);\n  transform: translateY(-3px);\n}\n\n.course-learning-outcome__icon {\n  width: 42px;\n  height: 42px;\n  display: grid;\n  flex: 0 0 auto;\n  place-items: center;\n  border-radius: 50%;\n  color: #27896e;\n  background-color: #d7f6eb;\n}\n\n.course-learning-outcome__icon--unavailable {\n  color: #a24d4d;\n  background-color: #f7dada;\n}\n\n.course-learning-outcome__icon svg {\n  width: 22px;\n  height: 22px;\n}\n\n.course-learning-outcome h3 {\n  margin: 0 0 7px;\n  color: var(--color-black);\n  font-size: 15px;\n  font-weight: 700;\n}\n\n.course-learning-outcome p {\n  margin: 0;\n  color: #777e88;\n  font-size: 11px;\n  line-height: 1.9;\n}\n\n/* Modules and FAQ */\n\n.course-module,\n.course-faq__item {\n  overflow: hidden;\n  border-bottom: 1px solid #dfe3e8;\n}\n\n.course-module > button,\n.course-faq__item > button {\n  width: 100%;\n  min-height: 65px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 25px;\n  padding: 12px 5px;\n  border: 0;\n  color: #242930;\n  background-color: transparent;\n  font-family: inherit;\n  font-size: 14px;\n  font-weight: 700;\n  text-align: right;\n}\n\n.course-module > button i,\n.course-faq__item > button i {\n  width: 33px;\n  height: 33px;\n  display: grid;\n  flex: 0 0 auto;\n  place-items: center;\n  border-radius: 50%;\n  color: var(--color-primary);\n  background-color: rgba(26, 54, 93, 0.06);\n  font-family: Arial, sans-serif;\n  font-size: 21px;\n  font-style: normal;\n}\n\n.course-module__content,\n.course-faq__answer {\n  max-height: 0;\n  overflow: hidden;\n  opacity: 0;\n  transition:\n    max-height 450ms ease,\n    opacity 300ms ease,\n    padding 350ms ease;\n}\n\n.course-module--open .course-module__content,\n.course-faq__item--open .course-faq__answer {\n  max-height: 250px;\n  padding: 0 5px 22px;\n  opacity: 1;\n}\n\n.course-module__content p,\n.course-faq__answer p {\n  margin: 0;\n  color: #646c76;\n  font-size: 13px;\n  line-height: 2.15;\n}\n\n/* Instructors */\n\n.course-instructors {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 20px;\n}\n\n.course-instructor {\n  display: flex;\n  align-items: center;\n  gap: 17px;\n  padding: 22px;\n  border: 1px solid #edf0f3;\n  border-radius: 14px;\n  background-color: var(--color-white);\n}\n\n.course-instructor__avatar {\n  width: 68px;\n  height: 68px;\n  display: grid;\n  flex: 0 0 auto;\n  place-items: center;\n  border-radius: 50%;\n  color: var(--color-white);\n  background: linear-gradient(\n    135deg,\n    var(--color-secondary),\n    var(--color-accent)\n  );\n  font-size: 17px;\n  font-weight: 700;\n}\n\n.course-instructor h3 {\n  margin: 0 0 6px;\n  color: var(--color-black);\n  font-size: 16px;\n}\n\n.course-instructor p {\n  margin: 0;\n  color: #7a828c;\n  font-size: 12px;\n  line-height: 1.9;\n}\n\n/* Benefits */\n\n.course-benefits {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 18px;\n}\n\n.course-benefit {\n  padding: 23px 19px;\n  border: 1px solid #edf0f3;\n  border-radius: 14px;\n  text-align: center;\n  background-color: var(--color-white);\n  transition:\n    box-shadow 200ms ease,\n    transform 200ms ease;\n}\n\n.course-benefit:hover {\n  box-shadow: 0 12px 27px rgba(26, 54, 93, 0.08);\n  transform: translateY(-5px);\n}\n\n.course-benefit > span {\n  width: 48px;\n  height: 48px;\n  display: grid;\n  margin: 0 auto 15px;\n  place-items: center;\n  border-radius: 14px;\n  color: var(--color-secondary);\n  background-color: rgba(0, 173, 234, 0.09);\n}\n\n.course-benefit svg {\n  width: 24px;\n  height: 24px;\n}\n\n.course-benefit h3 {\n  margin: 0 0 9px;\n  color: var(--color-black);\n  font-size: 14px;\n}\n\n.course-benefit p {\n  margin: 0;\n  color: #7a828c;\n  font-size: 11px;\n  line-height: 1.9;\n}\n\n/* Related courses */\n\n.course-related-section {\n  padding: 60px 0 35px;\n  background-color: var(--color-white);\n}\n\n.activity-card {\n  min-width: 0;\n  overflow: hidden;\n  border: 1px solid #d9dde2;\n  background-color: var(--color-white);\n  transition:\n    border-color 220ms ease,\n    box-shadow 220ms ease,\n    transform 220ms ease;\n}\n\n.activity-card:hover {\n  border-color: #c6cdd5;\n  box-shadow: 0 13px 30px rgba(26, 54, 93, 0.1);\n  transform: translateY(-5px);\n}\n\n.activity-card__media {\n  height: 220px;\n  display: block;\n  overflow: hidden;\n  background-color: var(--color-primary);\n}\n\n.activity-card__image {\n  width: 100%;\n  height: 100%;\n  display: block;\n  object-fit: cover;\n  transition:\n    filter 350ms ease,\n    transform 500ms ease;\n}\n\n.activity-card:hover .activity-card__image {\n  filter: brightness(0.75);\n  transform: scale(1.035);\n}\n\n.activity-card__content {\n  padding: 20px 20px 22px;\n}\n\n.activity-card__title {\n  min-height: 62px;\n  display: block;\n  margin-bottom: 15px;\n  color: var(--color-black);\n  font-size: 18px;\n  font-weight: 700;\n  line-height: 1.8;\n  transition:\n    color 200ms ease,\n    transform 200ms ease;\n}\n\n.activity-card__title:hover {\n  color: var(--color-accent);\n  transform: translateX(-3px);\n}\n\n.activity-card__details {\n  min-height: 107px;\n  margin: 0 0 19px;\n}\n\n.activity-card__details div {\n  display: flex;\n  align-items: flex-start;\n  gap: 7px;\n  margin-bottom: 7px;\n  color: #848b95;\n  font-size: 13px;\n  line-height: 1.8;\n}\n\n.activity-card__details dt {\n  flex: 0 0 auto;\n  font-weight: 500;\n}\n\n.activity-card__details dd {\n  min-width: 0;\n  margin: 0;\n}\n\n.activity-card__button {\n  min-height: 46px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 9px 15px;\n  color: var(--color-white);\n  background-color: var(--color-primary);\n  font-size: 13px;\n  font-weight: 500;\n  transition:\n    background-color 190ms ease,\n    transform 190ms ease;\n}\n\n.activity-card__button:hover {\n  color: var(--color-white);\n  background-color: var(--color-secondary);\n  transform: translateY(-2px);\n}\n\n.activity-carousel {\n  margin-bottom: 70px;\n}\n\n.activity-carousel:last-child {\n  margin-bottom: 0;\n}\n\n.activity-carousel__heading {\n  display: grid;\n  grid-template-columns: auto 1fr auto;\n  align-items: center;\n  gap: 23px;\n  margin-bottom: 29px;\n}\n\n.activity-carousel__heading h2 {\n  margin: 0;\n  color: var(--color-black);\n  font-size: 29px;\n  font-weight: 900;\n  line-height: 1.6;\n  white-space: nowrap;\n}\n\n.activity-carousel__line {\n  height: 1px;\n  background-color: #edf0f3;\n}\n\n.activity-carousel__dots {\n  direction: ltr;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.activity-carousel__dot {\n  width: 9px;\n  height: 9px;\n  padding: 0;\n  border: 0;\n  border-radius: 50%;\n  background-color: #d6d9dd;\n  transition:\n    width 200ms ease,\n    height 200ms ease,\n    background-color 200ms ease,\n    transform 200ms ease;\n}\n\n.activity-carousel__dot:hover {\n  background-color: #aeb5bc;\n  transform: scale(1.2);\n}\n\n.activity-carousel__dot--active {\n  width: 13px;\n  height: 13px;\n  background-color: var(--color-accent);\n}\n\n.activity-carousel__viewport {\n  width: 100%;\n  overflow: hidden;\n}\n\n.activity-carousel__track {\n  display: flex;\n  align-items: stretch;\n  direction: ltr;\n  will-change: transform;\n  transition: transform 850ms cubic-bezier(0.22, 1, 0.36, 1);\n}\n\n.activity-carousel__page {\n  width: 100%;\n  flex: 0 0 100%;\n  display: grid;\n  grid-template-columns: repeat(4, minmax(0, 1fr));\n  gap: 27px;\n  padding: 5px 0 12px;\n  direction: rtl;\n}\n\n.activity-carousel__footer {\n  display: flex;\n  justify-content: flex-start;\n  margin-top: 28px;\n  direction: ltr;\n}\n\n.activity-carousel__view-all {\n  width: 175px;\n  min-height: 46px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 13px;\n  border: 1px solid #cbd1d8;\n  color: var(--color-muted);\n  background-color: var(--color-white);\n  font-size: 14px;\n  direction: rtl;\n  transition:\n    color 200ms ease,\n    border-color 200ms ease,\n    background-color 200ms ease,\n    box-shadow 200ms ease,\n    transform 200ms ease;\n}\n\n.activity-carousel__view-all:hover {\n  color: var(--color-white);\n  border-color: var(--color-primary);\n  background-color: var(--color-primary);\n  box-shadow: 0 9px 22px rgba(26, 54, 93, 0.16);\n  transform: translateY(-3px);\n}\n\n.activity-carousel__view-all span {\n  transition: transform 200ms ease;\n}\n\n.activity-carousel__view-all:hover span {\n  transform: translateX(-4px);\n}\n\n.activity-carousel__controls {\n  direction: ltr;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.activity-carousel__arrow {\n  width: 42px;\n  height: 42px;\n  display: grid;\n  flex: 0 0 auto;\n  place-items: center;\n  padding: 0;\n  border: 1px solid #d3d9e0;\n  border-radius: 50%;\n  color: var(--color-primary);\n  background-color: var(--color-white);\n  transition:\n    color 180ms ease,\n    border-color 180ms ease,\n    background-color 180ms ease,\n    box-shadow 180ms ease,\n    transform 180ms ease;\n}\n\n.activity-carousel__arrow:hover {\n  color: var(--color-white);\n  border-color: var(--color-primary);\n  background-color: var(--color-primary);\n  box-shadow: 0 8px 20px rgba(26, 54, 93, 0.15);\n  transform: translateY(-2px);\n}\n\n.activity-carousel__arrow-icon {\n  width: 19px;\n  height: 19px;\n}\n\n.activity-carousel__arrow-icon--previous {\n  transform: rotate(180deg);\n}\n\n.preview-activity-carousel__page { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n.expandable-article-preview { padding: 58px 0 70px; background:#fafafa; }\n.expandable-article-preview__box { padding: 30px; border:1px solid #edf0f3; border-radius:18px; background:#fff; }\n.expandable-article-preview__box h2 { margin:0 0 18px; color:#111; font-size:28px; font-weight:900; }\n.expandable-article-preview__box p { margin:0 0 12px; color:#454d57; font-size:14px; line-height:2.35; text-align:justify; }\n';

const EVENT_PREVIEW_CSS =
  ':root { --color-white: #ffffff; --color-primary: #0a274f; --color-secondary: #00adea; --color-accent: #01d2c9; --color-warning: #f9bd31; --color-black: #111111; --color-muted: #6b7280; --container-padding: 65px; }\n* { box-sizing: border-box; }\nbody { margin: 0; font-family: IRANSans, Tahoma, Arial, sans-serif; direction: rtl; background: #ffffff; }\na { text-decoration: none; }\n.event-details-page {\n  --event-details-width: 1360px;\n\n  background-color: var(--color-white);\n}\n\n.event-details-page__container {\n  width: min(\n    calc(100% - (2 * var(--container-padding))),\n    var(--event-details-width)\n  );\n  margin-inline: auto;\n}\n\n/* Breadcrumb */\n\n.event-details__breadcrumb {\n  display: flex;\n  align-items: center;\n  gap: 9px;\n  margin-bottom: 30px;\n  color: #9198a2;\n  font-size: 12px;\n}\n\n.event-details__breadcrumb a {\n  color: inherit;\n  transition: color 180ms ease;\n}\n\n.event-details__breadcrumb a:hover {\n  color: var(--color-accent);\n}\n\n/* Hero */\n\n.event-details-hero {\n  position: relative;\n  padding: 46px 0 100px;\n  overflow: hidden;\n  background:\n    radial-gradient(\n      circle at 85% 15%,\n      rgba(1, 210, 201, 0.09),\n      transparent 32%\n    ),\n    var(--color-white);\n}\n\n.event-details-hero::after {\n  position: absolute;\n  right: -5%;\n  bottom: -105px;\n  width: 110%;\n  height: 170px;\n  content: "";\n  border-radius: 50% 50% 0 0;\n  background-color: #fafafa;\n}\n\n.event-details-hero__grid {\n  display: grid;\n  grid-template-columns:\n    minmax(0, 0.95fr)\n    minmax(0, 1.05fr);\n  grid-template-areas: "media content";\n  align-items: center;\n  gap: 76px;\n  direction: ltr;\n}\n\n.event-details-hero__media {\n  position: relative;\n  grid-area: media;\n  height: 440px;\n  overflow: hidden;\n  border-radius: 10px;\n  background-color: var(--color-primary);\n  box-shadow: 0 20px 55px rgba(26, 54, 93, 0.15);\n}\n\n.event-details-hero__media img {\n  width: 100%;\n  height: 100%;\n  display: block;\n  object-fit: cover;\n  transition:\n    filter 450ms ease,\n    transform 650ms ease;\n}\n\n.event-details-hero__media:hover img {\n  filter: brightness(0.82);\n  transform: scale(1.025);\n}\n\n.event-details-hero__badges {\n  position: absolute;\n  right: 20px;\n  bottom: 19px;\n  left: 20px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 15px;\n}\n\n.event-details-hero__badges span {\n  min-height: 31px;\n  display: inline-flex;\n  align-items: center;\n  padding: 5px 14px;\n  border-radius: 17px;\n  color: #26323d;\n  background-color: var(--color-warning);\n  font-size: 11px;\n  font-weight: 700;\n}\n\n.event-details-hero__badges span:last-child {\n  color: var(--color-white);\n  background-color: rgba(10, 39, 79, 0.84);\n  backdrop-filter: blur(8px);\n}\n\n.event-details-hero__content {\n  grid-area: content;\n  min-width: 0;\n  direction: rtl;\n}\n\n.event-details-hero__eyebrow,\n.event-content-section__eyebrow {\n  min-height: 30px;\n  display: inline-flex;\n  align-items: center;\n  margin-bottom: 15px;\n  padding: 4px 13px;\n  border-radius: 18px;\n  color: #078c86;\n  background-color: rgba(1, 210, 201, 0.11);\n  font-size: 12px;\n  font-weight: 700;\n}\n\n.event-details-hero__content h1 {\n  margin: 0 0 22px;\n  color: var(--color-black);\n  font-size: 38px;\n  font-weight: 900;\n  line-height: 1.65;\n}\n\n.event-details-hero__content p {\n  margin: 0 0 12px;\n  color: #4f5761;\n  font-size: 14px;\n  line-height: 2.25;\n}\n\n.event-details-hero__button {\n  width: 205px;\n  min-height: 49px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  margin-top: 28px;\n  color: var(--color-white);\n  background: linear-gradient(\n    135deg,\n    var(--color-accent),\n    var(--color-secondary)\n  );\n  font-size: 14px;\n  font-weight: 700;\n  box-shadow: 0 12px 26px rgba(0, 173, 234, 0.19);\n  transition:\n    box-shadow 200ms ease,\n    transform 200ms ease;\n}\n\n.event-details-hero__button:hover {\n  color: var(--color-white);\n  box-shadow: 0 16px 32px rgba(0, 173, 234, 0.27);\n  transform: translateY(-3px);\n}\n\n/* Meta cards */\n\n.event-details-meta {\n  position: relative;\n  z-index: 2;\n  display: grid;\n  grid-template-columns: repeat(5, minmax(0, 1fr));\n  gap: 22px;\n  margin-top: 48px;\n}\n\n.event-details-meta__item {\n  min-height: 90px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 14px;\n  padding: 17px;\n  border: 1px solid #edf0f3;\n  border-radius: 13px;\n  background-color: #fafafa;\n  transition:\n    border-color 220ms ease,\n    box-shadow 220ms ease,\n    transform 220ms ease;\n}\n\n.event-details-meta__item:hover {\n  border-color: rgba(1, 210, 201, 0.35);\n  box-shadow: 0 12px 26px rgba(26, 54, 93, 0.08);\n  transform: translateY(-4px);\n}\n\n.event-details-meta__icon {\n  width: 46px;\n  height: 46px;\n  display: grid;\n  flex: 0 0 auto;\n  place-items: center;\n  border-radius: 12px;\n  color: #0aa69d;\n  background-color: rgba(1, 210, 201, 0.1);\n}\n\n.event-details-meta__icon svg {\n  width: 25px;\n  height: 25px;\n}\n\n.event-details-meta__item h2 {\n  margin: 0 0 5px;\n  color: var(--color-black);\n  font-size: 14px;\n  font-weight: 700;\n}\n\n.event-details-meta__item p {\n  margin: 0;\n  color: #737b85;\n  font-size: 12px;\n}\n\n/* Main */\n\n.event-details-content {\n  padding: 65px 0 72px;\n  background-color: #fafafa;\n}\n\n.event-details-content__grid {\n  display: grid;\n  grid-template-columns: 375px minmax(0, 1fr);\n  grid-template-areas: "sidebar article";\n  align-items: start;\n  gap: 70px;\n  direction: ltr;\n}\n\n/* Sticky CTA */\n\n.event-details-sidebar {\n  grid-area: sidebar;\n  position: sticky;\n  top: 125px;\n  direction: rtl;\n}\n\n.event-registration-card {\n  padding: 30px;\n  border: 1px solid #edf0f3;\n  border-radius: 17px;\n  background: linear-gradient(\n    145deg,\n    rgba(255, 255, 255, 0.98),\n    rgba(249, 253, 253, 0.98)\n  );\n  box-shadow: 0 16px 42px rgba(26, 54, 93, 0.09);\n}\n\n.event-registration-card__header {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-bottom: 21px;\n}\n\n.event-registration-card__header span {\n  min-height: 27px;\n  display: inline-flex;\n  align-items: center;\n  padding: 3px 12px;\n  border-radius: 14px;\n  color: #087d76;\n  background-color: rgba(1, 210, 201, 0.13);\n  font-size: 10px;\n  font-weight: 700;\n}\n\n.event-registration-card__header span:last-child {\n  color: #b77a00;\n  background-color: rgba(249, 189, 49, 0.17);\n}\n\n.event-registration-card h2 {\n  margin: 0 0 24px;\n  color: var(--color-black);\n  font-size: 22px;\n  font-weight: 900;\n  line-height: 1.7;\n}\n\n.event-registration-card__details {\n  margin: 0;\n  padding: 19px 0;\n  border-top: 1px solid #edf0f3;\n  border-bottom: 1px solid #edf0f3;\n}\n\n.event-registration-card__details div {\n  display: grid;\n  grid-template-columns: 105px minmax(0, 1fr);\n  gap: 8px;\n  margin-bottom: 12px;\n  color: #545c66;\n  font-size: 12px;\n  line-height: 1.9;\n}\n\n.event-registration-card__details div:last-child {\n  margin-bottom: 0;\n}\n\n.event-registration-card__details dt {\n  font-weight: 700;\n}\n\n.event-registration-card__details dd {\n  margin: 0;\n}\n\n.event-registration-card__audience {\n  padding: 19px 0 5px;\n}\n\n.event-registration-card__audience h3 {\n  margin: 0 0 13px;\n  color: var(--color-black);\n  font-size: 13px;\n}\n\n.event-registration-card__audience > div {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 9px 13px;\n}\n\n.event-registration-card__audience span {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  color: #505861;\n  font-size: 11px;\n}\n\n.event-registration-card__audience svg {\n  width: 16px;\n  height: 16px;\n  color: #31b889;\n}\n\n.event-registration-card__button {\n  min-height: 49px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-top: 23px;\n  color: var(--color-white);\n  background: linear-gradient(\n    135deg,\n    var(--color-secondary),\n    var(--color-accent)\n  );\n  font-size: 14px;\n  font-weight: 700;\n  transition:\n    box-shadow 200ms ease,\n    transform 200ms ease;\n}\n\n.event-registration-card__button:hover {\n  color: var(--color-white);\n  box-shadow: 0 11px 25px rgba(0, 173, 234, 0.21);\n  transform: translateY(-3px);\n}\n\n.event-details-share {\n  padding: 21px 5px 0;\n  text-align: center;\n}\n\n.event-details-share > span {\n  display: block;\n  margin-bottom: 14px;\n  color: #656d77;\n  font-size: 11px;\n}\n\n.event-details-share > div {\n  direction: ltr;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 15px;\n}\n\n.event-details-share a {\n  width: 25px;\n  height: 25px;\n  display: grid;\n  place-items: center;\n  opacity: 0.58;\n  transition:\n    opacity 180ms ease,\n    transform 180ms ease;\n}\n\n.event-details-share a:hover {\n  opacity: 1;\n  transform: translateY(-3px);\n}\n\n.event-details-share img {\n  width: 20px;\n  height: 20px;\n}\n\n/* Main article */\n\n.event-details-article {\n  grid-area: article;\n  min-width: 0;\n  direction: rtl;\n}\n\n.event-content-section {\n  margin-bottom: 67px;\n}\n\n.event-content-section:last-child {\n  margin-bottom: 0;\n}\n\n.event-content-section h2 {\n  margin: 0 0 21px;\n  color: var(--color-black);\n  font-size: 30px;\n  font-weight: 900;\n  line-height: 1.7;\n}\n\n.event-content-section > p {\n  margin: 0 0 13px;\n  color: #454d57;\n  font-size: 14px;\n  line-height: 2.35;\n  text-align: justify;\n}\n\n/* Highlights */\n\n.event-highlights {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 15px;\n}\n\n.event-highlight {\n  display: flex;\n  align-items: flex-start;\n  gap: 15px;\n  padding: 20px;\n  border: 1px solid #edf0f3;\n  border-radius: 13px;\n  background-color: var(--color-white);\n  transition:\n    border-color 200ms ease,\n    box-shadow 200ms ease,\n    transform 200ms ease;\n}\n\n.event-highlight:hover {\n  border-color: rgba(1, 210, 201, 0.35);\n  box-shadow: 0 10px 25px rgba(26, 54, 93, 0.07);\n  transform: translateY(-3px);\n}\n\n.event-highlight > span {\n  width: 43px;\n  height: 43px;\n  display: grid;\n  flex: 0 0 auto;\n  place-items: center;\n  border-radius: 50%;\n  color: #27896e;\n  background-color: #d7f6eb;\n}\n\n.event-highlight svg {\n  width: 22px;\n  height: 22px;\n}\n\n.event-highlight h3 {\n  margin: 0 0 7px;\n  color: var(--color-black);\n  font-size: 15px;\n  font-weight: 700;\n}\n\n.event-highlight p {\n  margin: 0;\n  color: #777e88;\n  font-size: 11px;\n  line-height: 1.9;\n}\n\n/* Agenda */\n\n.event-agenda {\n  position: relative;\n  padding-right: 90px;\n}\n\n.event-agenda::before {\n  position: absolute;\n  top: 11px;\n  right: 66px;\n  bottom: 18px;\n  width: 2px;\n  content: "";\n  background: linear-gradient(\n    to bottom,\n    var(--color-accent),\n    rgba(1, 210, 201, 0.12)\n  );\n}\n\n.event-agenda__item {\n  position: relative;\n  min-height: 95px;\n  display: grid;\n  grid-template-columns: 70px 18px minmax(0, 1fr);\n  gap: 18px;\n  align-items: start;\n  margin-bottom: 15px;\n}\n\n.event-agenda__item time {\n  color: var(--color-primary);\n  font-size: 14px;\n  font-weight: 700;\n  direction: ltr;\n}\n\n.event-agenda__marker {\n  position: relative;\n  z-index: 2;\n  width: 14px;\n  height: 14px;\n  margin-top: 3px;\n  border: 4px solid #d2faf7;\n  border-radius: 50%;\n  background-color: var(--color-accent);\n  box-shadow: 0 0 0 4px var(--color-white);\n}\n\n.event-agenda__item > div {\n  padding: 0 0 21px;\n  border-bottom: 1px solid #e7ebef;\n}\n\n.event-agenda__item:last-child > div {\n  border-bottom: 0;\n}\n\n.event-agenda h3 {\n  margin: 0 0 7px;\n  color: var(--color-black);\n  font-size: 15px;\n}\n\n.event-agenda p {\n  margin: 0;\n  color: #727a84;\n  font-size: 12px;\n  line-height: 2;\n}\n\n/* Speakers */\n\n.event-speakers {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 18px;\n}\n\n.event-speaker {\n  padding: 24px 18px;\n  border: 1px solid #edf0f3;\n  border-radius: 15px;\n  text-align: center;\n  background-color: var(--color-white);\n  transition:\n    box-shadow 220ms ease,\n    transform 220ms ease;\n}\n\n.event-speaker:hover {\n  box-shadow: 0 13px 30px rgba(26, 54, 93, 0.09);\n  transform: translateY(-5px);\n}\n\n.event-speaker__avatar {\n  width: 82px;\n  height: 82px;\n  display: grid;\n  margin: 0 auto 16px;\n  place-items: center;\n  border: 5px solid rgba(1, 210, 201, 0.13);\n  border-radius: 50%;\n  color: var(--color-white);\n  background: linear-gradient(\n    135deg,\n    var(--color-primary),\n    var(--color-secondary)\n  );\n  font-size: 19px;\n  font-weight: 700;\n}\n\n.event-speaker h3 {\n  margin: 0 0 7px;\n  color: var(--color-black);\n  font-size: 16px;\n}\n\n.event-speaker p {\n  margin: 0 0 4px;\n  color: #555d67;\n  font-size: 12px;\n}\n\n.event-speaker div > span {\n  display: block;\n  margin-bottom: 12px;\n  color: #8a919a;\n  font-size: 10px;\n}\n\n.event-speaker a {\n  color: var(--color-accent);\n  font-size: 11px;\n  font-weight: 700;\n  transition: color 180ms ease;\n}\n\n.event-speaker a:hover {\n  color: var(--color-primary);\n}\n\n/* FAQ */\n\n.event-faq__item {\n  overflow: hidden;\n  border-bottom: 1px solid #dfe3e8;\n}\n\n.event-faq__item > button {\n  width: 100%;\n  min-height: 66px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 25px;\n  padding: 12px 5px;\n  border: 0;\n  color: #242930;\n  background-color: transparent;\n  font-family: inherit;\n  font-size: 14px;\n  font-weight: 700;\n  text-align: right;\n}\n\n.event-faq__item > button i {\n  width: 33px;\n  height: 33px;\n  display: grid;\n  flex: 0 0 auto;\n  place-items: center;\n  border-radius: 50%;\n  color: var(--color-primary);\n  background-color: rgba(26, 54, 93, 0.06);\n  font-family: Arial, sans-serif;\n  font-size: 21px;\n  font-style: normal;\n}\n\n.event-faq__answer {\n  max-height: 0;\n  overflow: hidden;\n  opacity: 0;\n  transition:\n    max-height 450ms ease,\n    opacity 300ms ease,\n    padding 350ms ease;\n}\n\n.event-faq__item--open .event-faq__answer {\n  max-height: 250px;\n  padding: 0 5px 22px;\n  opacity: 1;\n}\n\n.event-faq__answer p {\n  margin: 0;\n  color: #646c76;\n  font-size: 13px;\n  line-height: 2.15;\n}\n\n/* Related */\n\n.event-related-section {\n  padding: 60px 0 25px;\n  background-color: var(--color-white);\n}\n\n.event-related-section--courses {\n  padding-top: 25px;\n  background-color: #fafafa;\n}\n\n.activity-card {\n  min-width: 0;\n  overflow: hidden;\n  border: 1px solid #d9dde2;\n  background-color: var(--color-white);\n  transition:\n    border-color 220ms ease,\n    box-shadow 220ms ease,\n    transform 220ms ease;\n}\n\n.activity-card:hover {\n  border-color: #c6cdd5;\n  box-shadow: 0 13px 30px rgba(26, 54, 93, 0.1);\n  transform: translateY(-5px);\n}\n\n.activity-card__media {\n  height: 220px;\n  display: block;\n  overflow: hidden;\n  background-color: var(--color-primary);\n}\n\n.activity-card__image {\n  width: 100%;\n  height: 100%;\n  display: block;\n  object-fit: cover;\n  transition:\n    filter 350ms ease,\n    transform 500ms ease;\n}\n\n.activity-card:hover .activity-card__image {\n  filter: brightness(0.75);\n  transform: scale(1.035);\n}\n\n.activity-card__content {\n  padding: 20px 20px 22px;\n}\n\n.activity-card__title {\n  min-height: 62px;\n  display: block;\n  margin-bottom: 15px;\n  color: var(--color-black);\n  font-size: 18px;\n  font-weight: 700;\n  line-height: 1.8;\n  transition:\n    color 200ms ease,\n    transform 200ms ease;\n}\n\n.activity-card__title:hover {\n  color: var(--color-accent);\n  transform: translateX(-3px);\n}\n\n.activity-card__details {\n  min-height: 107px;\n  margin: 0 0 19px;\n}\n\n.activity-card__details div {\n  display: flex;\n  align-items: flex-start;\n  gap: 7px;\n  margin-bottom: 7px;\n  color: #848b95;\n  font-size: 13px;\n  line-height: 1.8;\n}\n\n.activity-card__details dt {\n  flex: 0 0 auto;\n  font-weight: 500;\n}\n\n.activity-card__details dd {\n  min-width: 0;\n  margin: 0;\n}\n\n.activity-card__button {\n  min-height: 46px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 9px 15px;\n  color: var(--color-white);\n  background-color: var(--color-primary);\n  font-size: 13px;\n  font-weight: 500;\n  transition:\n    background-color 190ms ease,\n    transform 190ms ease;\n}\n\n.activity-card__button:hover {\n  color: var(--color-white);\n  background-color: var(--color-secondary);\n  transform: translateY(-2px);\n}\n\n.activity-carousel {\n  margin-bottom: 70px;\n}\n\n.activity-carousel:last-child {\n  margin-bottom: 0;\n}\n\n.activity-carousel__heading {\n  display: grid;\n  grid-template-columns: auto 1fr auto;\n  align-items: center;\n  gap: 23px;\n  margin-bottom: 29px;\n}\n\n.activity-carousel__heading h2 {\n  margin: 0;\n  color: var(--color-black);\n  font-size: 29px;\n  font-weight: 900;\n  line-height: 1.6;\n  white-space: nowrap;\n}\n\n.activity-carousel__line {\n  height: 1px;\n  background-color: #edf0f3;\n}\n\n.activity-carousel__dots {\n  direction: ltr;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.activity-carousel__dot {\n  width: 9px;\n  height: 9px;\n  padding: 0;\n  border: 0;\n  border-radius: 50%;\n  background-color: #d6d9dd;\n  transition:\n    width 200ms ease,\n    height 200ms ease,\n    background-color 200ms ease,\n    transform 200ms ease;\n}\n\n.activity-carousel__dot:hover {\n  background-color: #aeb5bc;\n  transform: scale(1.2);\n}\n\n.activity-carousel__dot--active {\n  width: 13px;\n  height: 13px;\n  background-color: var(--color-accent);\n}\n\n.activity-carousel__viewport {\n  width: 100%;\n  overflow: hidden;\n}\n\n.activity-carousel__track {\n  display: flex;\n  align-items: stretch;\n  direction: ltr;\n  will-change: transform;\n  transition: transform 850ms cubic-bezier(0.22, 1, 0.36, 1);\n}\n\n.activity-carousel__page {\n  width: 100%;\n  flex: 0 0 100%;\n  display: grid;\n  grid-template-columns: repeat(4, minmax(0, 1fr));\n  gap: 27px;\n  padding: 5px 0 12px;\n  direction: rtl;\n}\n\n.activity-carousel__footer {\n  display: flex;\n  justify-content: flex-start;\n  margin-top: 28px;\n  direction: ltr;\n}\n\n.activity-carousel__view-all {\n  width: 175px;\n  min-height: 46px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 13px;\n  border: 1px solid #cbd1d8;\n  color: var(--color-muted);\n  background-color: var(--color-white);\n  font-size: 14px;\n  direction: rtl;\n  transition:\n    color 200ms ease,\n    border-color 200ms ease,\n    background-color 200ms ease,\n    box-shadow 200ms ease,\n    transform 200ms ease;\n}\n\n.activity-carousel__view-all:hover {\n  color: var(--color-white);\n  border-color: var(--color-primary);\n  background-color: var(--color-primary);\n  box-shadow: 0 9px 22px rgba(26, 54, 93, 0.16);\n  transform: translateY(-3px);\n}\n\n.activity-carousel__view-all span {\n  transition: transform 200ms ease;\n}\n\n.activity-carousel__view-all:hover span {\n  transform: translateX(-4px);\n}\n\n.activity-carousel__controls {\n  direction: ltr;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.activity-carousel__arrow {\n  width: 42px;\n  height: 42px;\n  display: grid;\n  flex: 0 0 auto;\n  place-items: center;\n  padding: 0;\n  border: 1px solid #d3d9e0;\n  border-radius: 50%;\n  color: var(--color-primary);\n  background-color: var(--color-white);\n  transition:\n    color 180ms ease,\n    border-color 180ms ease,\n    background-color 180ms ease,\n    box-shadow 180ms ease,\n    transform 180ms ease;\n}\n\n.activity-carousel__arrow:hover {\n  color: var(--color-white);\n  border-color: var(--color-primary);\n  background-color: var(--color-primary);\n  box-shadow: 0 8px 20px rgba(26, 54, 93, 0.15);\n  transform: translateY(-2px);\n}\n\n.activity-carousel__arrow-icon {\n  width: 19px;\n  height: 19px;\n}\n\n.activity-carousel__arrow-icon--previous {\n  transform: rotate(180deg);\n}\n\n.preview-activity-carousel__page { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n.expandable-article-preview { padding: 58px 0 70px; background:#fafafa; }\n.expandable-article-preview__box { padding: 30px; border:1px solid #edf0f3; border-radius:18px; background:#fff; }\n.expandable-article-preview__box h2 { margin:0 0 18px; color:#111; font-size:28px; font-weight:900; }\n.expandable-article-preview__box p { margin:0 0 12px; color:#454d57; font-size:14px; line-height:2.35; text-align:justify; }\n.event-details-sidebar, .course-details-sidebar { top: 82px !important; }\n';

const NAV_ITEMS = [
  { id: "dashboard", label: "داشبورد", icon: "🏠" },
  {
    id: "activities",
    label: "دوره‌ها و رویدادها",
    icon: "🎓",
    subItems: [
      { id: "create-new", label: "ساخت جدید" },
      { id: "courses", label: "دوره‌ها" },
      { id: "events", label: "رویدادها" },
    ],
  },
  {
    id: "execution-orders",
    label: "سفارش‌های اجرا",
    icon: "📋",
    subItems: [
      { id: "accepted-orders", label: "سفارش‌های قبول شده" },
      { id: "new-orders", label: "سفارش‌های جدید" },
      { id: "orders-history", label: "تاریخچه سفارش‌ها" },
    ],
  },
  {
    id: "participants",
    label: "اطلاع‌رسانی به شرکت‌کنندگان",
    icon: "📣",
    subItems: [
      { id: "broadcast", label: "اطلاع‌رسانی همگانی" },
      { id: "targeted", label: "اطلاع‌رسانی موردی" },
    ],
  },
  { id: "requests", label: "درخواست‌ها و پشتیبانی", icon: "🗂" },
  { id: "messages", label: "پیام‌ها و اعلانات", icon: "🔔" },
  { id: "faq", label: "سوالات متداول", icon: "❓" },
];

const SECTION_DATA = {
  dashboard: { title: "داشبورد" },
  activities: { title: "دوره‌ها و رویدادها" },
  "activity-management": { title: "مدیریت شرکت‌کنندگان" },
  "execution-orders": { title: "سفارش‌های اجرا" },
  participants: { title: "اطلاع‌رسانی به شرکت‌کنندگان" },
  requests: { title: "درخواست‌ها و پشتیبانی" },
  messages: { title: "پیام‌ها و اعلانات" },
  faq: { title: "سوالات متداول" },
  profile: { title: "پروفایل" },
  "edit-profile": { title: "ویرایش پروفایل" },
};

const SECONDARY_STATUSES = [
  "در حال ثبت نام",
  "اتمام ظرفیت",
  "پایان ثبت نام",
  "در حال برگزاری",
  "برگزار شده",
  "لغو شده",
];

const EMPTY_OUTCOME = { title: "", description: "" };
const EMPTY_MODULE = { title: "", description: "" };
const EMPTY_INSTRUCTOR = { name: "", role: "" };
const EMPTY_BENEFIT = { title: "", description: "" };
const EMPTY_FAQ = { question: "", answer: "" };
const EMPTY_AUDIENCE = { title: "" };
const EMPTY_AGENDA = { time: "", title: "", description: "" };

const DEFAULT_COURSE_FORM = {
  title: "دوره تخصصی مدیریت سبز و توسعه پایدار",
  summary:
    "این دوره با هدف توسعه مهارت‌های کاربردی در حوزه مدیریت فناوری، توسعه پایدار و تجاری‌سازی دستاوردهای دانشگاهی طراحی شده است.\nشرکت‌کنندگان در طول دوره با تمرین‌های عملی، مطالعات موردی و پروژه‌های واقعی آشنا خواهند شد.",
  image: bannerImage,
  startDate: "1404/02/06",
  startTime: "20:00",
  endDate: "1404/03/17",
  endTime: "",
  registrationDate: "1404/01/20",
  registrationTime: "",
  duration: "۶ هفته",
  format: "حضوری",
  level: "پیشرفته",
  capacity: "20",
  introTitle: "محورهای پژوهشی سال جاری",
  introText:
    "این دوره بر موضوعات کاربردی مدیریت سبز، بهینه‌سازی منابع، توسعه فناوری‌های دوستدار محیط زیست و طراحی راهکارهای قابل اجرا تمرکز دارد.\nشرکت‌کنندگان می‌آموزند چگونه یک مسئله واقعی را تحلیل کرده و برای آن برنامه‌ای مرحله‌بندی‌شده، قابل سنجش و اجرایی تدوین کنند.",
  mainInstructorName: "مهدیه سیفی",
  location: "دانشگاه تهران، دانشکده مدیریت",
  audiences: [
    { title: "مدیران" },
    { title: "پژوهشگران" },
    { title: "دانشجویان" },
  ],
  outcomes: [
    {
      title: "طراحی برنامه مدیریت سبز",
      description:
        "توانایی طراحی یک برنامه اجرایی برای کاهش مصرف منابع و افزایش بهره‌وری.",
    },
    {
      title: "تحلیل شاخص‌های زیست‌محیطی",
      description: "آشنایی با روش‌های تحلیل داده‌های محیطی و شاخص‌های پایداری.",
    },
    {
      title: "مدیریت پروژه‌های فناورانه",
      description: "یادگیری برنامه‌ریزی، کنترل و ارزیابی پروژه‌های فناورانه.",
    },
    {
      title: "تدوین مدل اجرایی",
      description: "تبدیل یافته‌های آموزشی به یک مدل عملیاتی و قابل اجرا.",
    },
  ],
  modules: [
    {
      title: "بخش اول: مبانی و اصول مدیریت سبز",
      description:
        "در این بخش، مفاهیم پایه توسعه پایدار، مدیریت منابع، کاهش مصرف انرژی و نقش سازمان‌ها در حفاظت از محیط زیست بررسی می‌شود.",
    },
    {
      title: "بخش دوم: طراحی و ارزیابی برنامه اجرایی",
      description:
        "شرکت‌کنندگان با تدوین شاخص‌ها، تعیین اهداف قابل اندازه‌گیری، طراحی برنامه عملیاتی و روش‌های ارزیابی عملکرد آشنا می‌شوند.",
    },
    {
      title: "بخش سوم: پروژه پایانی و ارائه",
      description:
        "در پایان دوره، هر شرکت‌کننده یک پروژه کاربردی متناسب با نیاز سازمان یا مجموعه خود طراحی و ارائه خواهد کرد.",
    },
    {
      title: "بخش چهارم: جمع‌بندی و مسیر اجرا",
      description:
        "در این بخش، مسیر پیاده‌سازی آموخته‌ها و تبدیل خروجی دوره به برنامه اجرایی مرور می‌شود.",
    },
  ],
  instructors: [
    { name: "مهدیه سیفی", role: "مدرس مدیریت فناوری و توسعه پایدار" },
    { name: "علی رضایی", role: "مشاور تجاری‌سازی و مدیریت پروژه" },
  ],
  benefits: [
    {
      title: "محتوای کاربردی",
      description:
        "مطالب دوره براساس نیازهای واقعی محیط‌های دانشگاهی و صنعتی طراحی شده‌اند.",
    },
    {
      title: "مدرس متخصص",
      description:
        "آموزش توسط مدرسان دارای تجربه دانشگاهی و اجرایی ارائه می‌شود.",
    },
    {
      title: "پروژه عملی",
      description: "در طول دوره یک پروژه واقعی و قابل استفاده تدوین می‌کنید.",
    },
  ],
  faqs: [
    {
      question: "آیا برای شرکت در دوره پیش‌نیاز خاصی وجود دارد؟",
      answer:
        "آشنایی اولیه با مدیریت و مفاهیم توسعه پایدار مفید است، اما الزامی نیست.",
    },
    {
      question: "آیا جلسات دوره ضبط می‌شوند؟",
      answer:
        "دسترسی به فایل جلسات براساس شرایط ثبت‌نام و قوانین برگزاری دوره تعیین می‌شود.",
    },
    {
      question: "گواهی دوره چگونه صادر می‌شود؟",
      answer:
        "شرکت منظم در جلسات و تحویل پروژه پایانی برای دریافت گواهی الزامی است.",
    },
  ],
};

const DEFAULT_EVENT_FORM = {
  title: "رویداد تخصصی ارتباط دانشگاه و صنعت",
  summary:
    "این رویداد با هدف ایجاد ارتباط میان پژوهشگران، صاحبان ایده، مدیران فناوری و فعالان صنعت برگزار می‌شود.\nشرکت‌کنندگان می‌توانند با تازه‌ترین دستاوردهای پژوهشی آشنا شوند و فرصت‌های همکاری جدیدی ایجاد کنند.",
  image: bannerImage,
  eventDate: "1404/02/06",
  startTime: "08:30",
  endTime: "17:00",
  duration: "یک روز",
  format: "حضوری",
  capacity: "120",
  organizer: "برنامه هاتف دانشگاه تهران",
  location: "دانشگاه تهران، سالن همایش‌های مرکزی",
  secretaryName: "مهدیه سیفی",
  introTitle: "محورهای پژوهشی سال جاری",
  introText:
    "این رویداد بر توسعه فناوری‌های نوآورانه، تجاری‌سازی دستاوردهای دانشگاهی و ایجاد همکاری میان پژوهشگران و صنعت تمرکز دارد.\nشرکت‌کنندگان می‌توانند طرح‌ها و توانمندی‌های خود را معرفی کرده و از تجربه مدیران، متخصصان و سرمایه‌گذاران بهره‌مند شوند.",
  audiences: [
    { title: "پژوهشگران" },
    { title: "دانشجویان" },
    { title: "مدیران" },
  ],
  highlights: [
    {
      title: "ارائه تجربه‌های موفق",
      description:
        "آشنایی با تجربه‌های واقعی پژوهشگران، مدیران و مجموعه‌های فناور.",
    },
    {
      title: "ارتباط با متخصصان",
      description:
        "فرصتی برای ارتباط مستقیم با سخنرانان، پژوهشگران و فعالان صنعت.",
    },
    {
      title: "شبکه‌سازی حرفه‌ای",
      description:
        "ایجاد ارتباط میان دانشگاه، شرکت‌های دانش‌بنیان و سرمایه‌گذاران.",
    },
    {
      title: "دسترسی به محتوای تخصصی",
      description:
        "دریافت محتوای علمی و کاربردی متناسب با نیازهای حوزه فناوری.",
    },
  ],
  agenda: [
    {
      time: "08:30",
      title: "پذیرش و ثبت‌نام شرکت‌کنندگان",
      description: "تحویل کارت ورود، بسته رویداد و راهنمای حضور در برنامه‌ها.",
    },
    {
      time: "09:00",
      title: "افتتاحیه و معرفی برنامه هاتف",
      description: "معرفی اهداف رویداد، محورهای اصلی و فرصت‌های همکاری.",
    },
    {
      time: "10:30",
      title: "پنل تخصصی دانشگاه و صنعت",
      description: "گفت‌وگوی مدیران و پژوهشگران درباره تجاری‌سازی فناوری.",
    },
    {
      time: "13:30",
      title: "ارائه دستاوردها و شبکه‌سازی",
      description:
        "معرفی پروژه‌ها، مذاکره با مجموعه‌ها و شکل‌گیری همکاری‌های جدید.",
    },
  ],
  speakers: [
    { name: "مهدیه سیفی", role: "عضو کمیته راهبری هاتف" },
    { name: "علی رضایی", role: "مدیر توسعه فناوری" },
    { name: "سارا احمدی", role: "پژوهشگر و مدیر پروژه" },
  ],
  faqs: [
    {
      question: "شرکت در رویداد برای چه افرادی مناسب است؟",
      answer:
        "پژوهشگران، دانشجویان، مدیران، صاحبان ایده، شرکت‌های دانش‌بنیان و فعالان حوزه فناوری می‌توانند در رویداد شرکت کنند.",
    },
    {
      question: "آیا شرکت در رویداد نیازمند ثبت‌نام قبلی است؟",
      answer:
        "بله، به‌دلیل محدودیت ظرفیت، ثبت‌نام اولیه از طریق سامانه ضروری است.",
    },
    {
      question: "آیا برای شرکت‌کنندگان گواهی صادر می‌شود؟",
      answer:
        "برای افرادی که حضور کامل و تأییدشده در برنامه داشته باشند، گواهی حضور صادر خواهد شد.",
    },
  ],
};

const INITIAL_ACTIVITIES = [
  {
    id: "course-1405-001",
    type: "course",
    status: "منتشر شده",
    secondaryStatus: "در حال ثبت نام",
    createdAt: "۱۴۰۵/۰۳/۰۲ - ساعت ۱۰:۲۰",
    statusFeedback: "",
    ...DEFAULT_COURSE_FORM,
    title: "دوره تخصصی مدیریت سبز و توسعه پایدار",
    startDate: "1405/05/05",
    endDate: "1405/06/16",
    registrationDate: "1405/04/20",
  },
  {
    id: "course-1405-002",
    type: "course",
    status: "رد شده",
    secondaryStatus: "",
    createdAt: "۱۴۰۵/۰۲/۲۰ - ساعت ۱۲:۱۰",
    statusFeedback:
      "اطلاعات مدرس و سرفصل‌های دوره کافی نیست. لطفاً نسخه جدیدی بسازید.",
    ...DEFAULT_COURSE_FORM,
    title: "دوره مقدماتی تجاری‌سازی فناوری",
    summary:
      "این دوره به دلیل ناقص بودن برخی اطلاعات برای انتشار تایید نشده است.",
    startDate: "1405/03/30",
    endDate: "1405/04/24",
    registrationDate: "1405/03/15",
  },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    title: "سفارش اجرای جدید برای شما ثبت شد.",
    category: "پیام سامانه",
    time: "امروز",
    sentAt: "1405/03/28 - ساعت 09:15",
    isRead: false,
    isImportant: true,
    body: "یک سفارش اجرای جدید برای طراحی یا برگزاری برنامه آموزشی در پنل شما ثبت شده است. برای بررسی، به بخش سفارش‌های اجرا مراجعه کنید.",
  },
  {
    id: 2,
    title: "وضعیت یکی از دوره‌ها به منتشر شده تغییر کرد.",
    category: "اطلاعیه انتشار",
    time: "دیروز",
    sentAt: "1405/03/27 - ساعت 14:20",
    isRead: false,
    isImportant: false,
    body: "دوره شما پس از بررسی دبیرخانه منتشر شده و اکنون امکان مشاهده مدیریت ثبت‌نام‌کنندگان برای آن فعال است.",
  },
  {
    id: 3,
    title: "یادآوری شروع رویداد تخصصی",
    category: "یادآوری",
    time: "۳ روز پیش",
    sentAt: "1405/03/25 - ساعت 11:00",
    isRead: true,
    isImportant: false,
    body: "رویداد تخصصی ارتباط دانشگاه و صنعت طبق برنامه اعلام‌شده برگزار خواهد شد. لطفاً اطلاعات شرکت‌کنندگان را بررسی کنید.",
  },
];

const INITIAL_SUPPORT_REQUESTS = [
  {
    id: 1,
    title: "درخواست بررسی وضعیت انتشار دوره",
    message:
      "دوره‌ای که ثبت کرده‌ام هنوز در انتظار تایید است. لطفاً وضعیت بررسی را اعلام کنید.",
    sentAt: "1405/03/20 - ساعت 10:30",
    status: "پاسخ داده شده",
    seenBySupport: true,
    supportReply:
      "درخواست شما بررسی شد. نتیجه پس از تکمیل بررسی دبیرخانه اعلام می‌شود.",
    repliedAt: "1405/03/21 - ساعت 09:10",
  },
  {
    id: 2,
    title: "مشکل در پیش‌نمایش رویداد",
    message:
      "در هنگام باز کردن پیش‌نمایش رویداد، بخشی از اطلاعات نمایش داده نمی‌شود.",
    sentAt: "1405/03/22 - ساعت 14:15",
    status: "در انتظار پیگیری",
    seenBySupport: false,
    supportReply: "",
    repliedAt: "",
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: "ساخت دوره",
    question: "بعد از ثبت نهایی دوره چه اتفاقی می‌افتد؟",
    answer:
      "دوره برای دبیرخانه ارسال می‌شود و پس از تایید نهایی در بخش دوره‌ها منتشر خواهد شد.",
  },
  {
    id: 2,
    category: "ساخت رویداد",
    question: "آیا بعد از ثبت نهایی امکان ویرایش رویداد وجود دارد؟",
    answer:
      "خیر. بعد از ثبت نهایی، رویداد فقط برای بررسی ارسال می‌شود و در صورت رد شدن باید نسخه جدیدی ساخته شود.",
  },
  {
    id: 3,
    category: "مدیریت",
    question: "چه زمانی دکمه مدیریت فعال می‌شود؟",
    answer:
      "دکمه مدیریت فقط برای دوره‌ها و رویدادهایی فعال است که وضعیت اصلی آن‌ها منتشر شده باشد.",
  },
  {
    id: 4,
    category: "اطلاع‌رسانی",
    question: "اطلاع‌رسانی همگانی برای چه افرادی ارسال می‌شود؟",
    answer:
      "این پیام برای شرکت‌کنندگانی ارسال می‌شود که در دوره‌های فعال شما ثبت‌نام کرده‌اند یا در حال گذراندن دوره هستند.",
  },
  {
    id: 5,
    category: "پشتیبانی",
    question: "چه زمانی می‌توانم تیکت پشتیبانی را حذف کنم؟",
    answer:
      "تا زمانی که تیکت توسط پشتیبان مشاهده نشده باشد، امکان حذف آن وجود دارد.",
  },
];

const INITIAL_INSTRUCTOR_PROFILE = {
  firstName: "مهدیه",
  lastName: "رضایی",
  mobile: "۰۹۱۲۱۲۳۴۵۶۷",
  email: "instructor@hatef.ir",
  level: "مدرس/رویدادگر",
  memberSince: "۱۴۰۴",
  membershipDuration: "۱ سال",
  avatarLetter: "م",
  avatarPreview: "",
};

const INITIAL_PARTICIPANT_NOTIFICATIONS = [
  {
    id: "notice-1405-001",
    mode: "broadcast",
    title: "یادآوری شروع دوره مدیریت سبز",
    message:
      "جلسه افتتاحیه دوره طبق برنامه اعلام‌شده برگزار می‌شود. لطفاً ۱۵ دقیقه قبل از شروع در سامانه حاضر باشید.",
    target: "همه شرکت‌کنندگان دوره‌های فعال",
    sentAt: "1405/03/20 - ساعت 10:30",
    recipients: 42,
  },
  {
    id: "notice-1405-002",
    mode: "targeted",
    title: "ارسال فایل راهنمای رویداد",
    message:
      "فایل راهنمای حضور و برنامه زمانی رویداد در اختیار ثبت‌نام‌کنندگان قرار گرفت.",
    target: "رویداد تخصصی ارتباط دانشگاه و صنعت",
    sentAt: "1405/03/18 - ساعت 15:15",
    recipients: 28,
  },
];

const INITIAL_EXECUTION_ORDERS = [
  {
    id: "order-1405-001",
    status: "جدید",
    title: "طراحی دوره مدیریت سبز برای مدیران شهری",
    description:
      "مدیر سامانه درخواست کرده است یک دوره کاربردی درباره مدیریت سبز، کاهش مصرف منابع و طراحی برنامه اجرایی برای مدیران شهری آماده شود.",
    subject: "دوره آموزشی",
    category: "مدیریت سبز و توسعه پایدار",
    deadline: "1405/04/20",
    createdAt: "1405/03/28",
  },
  {
    id: "order-1405-002",
    status: "جدید",
    title: "برگزاری رویداد معرفی فرصت‌های همکاری صنعت و دانشگاه",
    description:
      "یک رویداد نیم‌روزه با تمرکز بر معرفی پروژه‌های آماده همکاری و شبکه‌سازی میان پژوهشگران و صنایع هدف طراحی و آماده شود.",
    subject: "رویداد تخصصی",
    category: "همکاری دانشگاه و صنعت",
    deadline: "1405/04/05",
    createdAt: "1405/03/24",
  },
  {
    id: "order-1405-003",
    status: "قبول شده",
    title: "آماده‌سازی کارگاه کوتاه تجاری‌سازی فناوری",
    description:
      "این سفارش برای تدوین یک کارگاه کوتاه درباره مسیر ورود ایده‌های فناورانه به بازار ثبت شده و توسط مدرس پذیرفته شده است.",
    subject: "دوره آموزشی",
    category: "تجاری‌سازی فناوری",
    deadline: "1405/03/30",
    createdAt: "1405/03/10",
    acceptedAt: "1405/03/12 - ساعت 11:20",
  },
  {
    id: "order-1404-011",
    status: "تکمیل شده",
    title: "اجرای رویداد آشنایی با برنامه هاتف",
    description:
      "درخواست اجرای یک رویداد معرفی برنامه هاتف برای پژوهشگران و شرکت‌های فناور که در دوره قبلی انجام و آرشیو شده است.",
    subject: "رویداد تخصصی",
    category: "معرفی برنامه هاتف",
    deadline: "1404/12/15",
    createdAt: "1404/11/20",
    acceptedAt: "1404/11/22 - ساعت 09:40",
    completedAt: "1404/12/20",
  },
];

const WIZARD_STEPS = [
  { id: "basic", title: "اطلاعات اصلی" },
  { id: "schedule", title: "زمان و برگزاری" },
  { id: "intro", title: "معرفی و سایدبار" },
  { id: "content", title: "محتوای آموزشی" },
  { id: "team", title: "تیم و مزایا" },
  { id: "review", title: "مرور نهایی" },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 21a2 2 0 0 0 4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ isOpen }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={isOpen ? "innovator-dashboard__chevron--open" : ""}
    >
      <path
        d="m8 10 4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m6 12.5 4 4L18 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7.5V12l3 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M7 3v4M17 3v4M3.5 9h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="9"
        r="2.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function LevelIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 19V13M12 19V9M19 19V5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="9"
        cy="8"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 19c.3-4 2.2-6 5.5-6s5.2 2 5.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15 6.2a2.7 2.7 0 0 1 0 5.2M16.5 13.3c2.5.5 3.8 2.4 4 5.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DashboardDateTime() {
  const [dateTime, setDateTime] = useState(() => new Date());
  useState(() => {
    const timer = window.setInterval(() => setDateTime(new Date()), 60_000);
    return () => window.clearInterval(timer);
  });

  return (
    <p>
      {dateTime.toLocaleDateString("fa-IR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </p>
  );
}

function toPersianNumber(value) {
  return String(value ?? "").replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);
}

function displayDate(date) {
  if (!date) return "تعیین نشده";
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return toPersianNumber(date);
  return toPersianNumber(`${year}/${month}/${day}`);
}

function displayTime(time) {
  return time ? toPersianNumber(time) : "";
}

function combineDateTime(date, time) {
  const visibleDate = displayDate(date);
  const visibleTime = displayTime(time);
  return visibleTime ? `${visibleDate}، ساعت ${visibleTime}` : visibleDate;
}

function normalizeDigits(value) {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  return String(value || "")
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));
}

function isPersianDateFormat(value) {
  return /^\d{4}\/\d{2}\/\d{2}$/.test(normalizeDigits(value));
}

function isPersianTimeFormat(value) {
  if (!value) return true;
  const normalized = normalizeDigits(value);
  if (!/^\d{1,2}:\d{2}$/.test(normalized)) return false;
  const [hour, minute] = normalized.split(":").map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function createInitials(name) {
  const parts = String(name || "مدرس")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0])
      .join(" ") || "م"
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function paragraphHtml(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function iconSvg(type) {
  const icons = {
    clock: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"></circle><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path></svg>`,
    calendar: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"></rect><path d="M7 3v4M17 3v4M3.5 9h17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path></svg>`,
    location: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="1.7"></path><circle cx="12" cy="9" r="2.3" fill="none" stroke="currentColor" stroke-width="1.7"></circle></svg>`,
    level: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V13M12 19V9M19 19V5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"></path></svg>`,
    users: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.7"></circle><path d="M3.5 19c.3-4 2.2-6 5.5-6s5.2 2 5.5 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path><path d="M15 6.2a2.7 2.7 0 0 1 0 5.2M16.5 13.3c2.5.5 3.8 2.4 4 5.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path></svg>`,
    presentation: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"></rect><path d="M8 20l4-4 4 4M12 16v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12.5 4 4L18 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
  };
  return icons[type] || icons.check;
}

function makeCoursePreviewDocument(course) {
  const image = course.image || bannerImage;
  const summaryLines = String(course.summary || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const heroParagraphOne =
    summaryLines[0] || "توضیحات خلاصه دوره هنوز وارد نشده است.";
  const heroParagraphTwo =
    summaryLines[1] ||
    "شرکت‌کنندگان در طول دوره با تمرین‌های عملی و محتوای کاربردی همراه خواهند شد.";
  const capacityLabel = course.capacity
    ? `${toPersianNumber(course.capacity)} نفر`
    : "تعیین نشده";
  const courseMeta = [
    { title: "مدت دوره", value: course.duration, icon: "clock" },
    {
      title: "تاریخ برگزاری",
      value: displayDate(course.startDate),
      icon: "calendar",
    },
    { title: "نوع برگزاری", value: course.format, icon: "location" },
    { title: "سطح دوره", value: course.level, icon: "level" },
    { title: "ظرفیت دوره", value: capacityLabel, icon: "users" },
  ];
  const relatedItems = [
    {
      title: "دوره مدیریت پروژه‌های فناورانه",
      instructor: course.mainInstructorName,
      organizer: "برنامه هاتف",
    },
    {
      title: "دوره تجاری‌سازی دستاوردهای پژوهشی",
      instructor: "علی رضایی",
      organizer: "مرکز نوآوری دانشگاه تهران",
    },
    {
      title: "دوره مهارت‌های توسعه محصول",
      instructor: "سارا احمدی",
      organizer: "دانشگاه تهران",
    },
    {
      title: "دوره تحلیل بازار فناوری",
      instructor: "مهدیه سیفی",
      organizer: "برنامه هاتف",
    },
  ];

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(course.title || "پیش‌نمایش دوره")}</title>
  <style>${COURSE_PREVIEW_CSS}</style>
</head>
<body>
  <div class="course-details-page">
    <section class="course-details-hero">
      <div class="course-details-page__container">
        <nav class="course-details__breadcrumb" aria-label="مسیر صفحه">
          <a href="#">صفحه اصلی</a><span>/</span><a href="#">دوره‌های توانمندسازی</a><span>/</span><span>${escapeHtml(course.title)}</span>
        </nav>
        <div class="course-details-hero__grid">
          <div class="course-details-hero__media">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(course.title)}" />
            <div class="course-details-hero__badges">
              <span>در حال ثبت‌نام</span>
              <span>${escapeHtml(displayDate(course.startDate))}</span>
            </div>
          </div>
          <div class="course-details-hero__content">
            <span class="course-details-hero__eyebrow">دوره تخصصی هاتف</span>
            <h1>${escapeHtml(course.title || "عنوان دوره")}</h1>
            <p>${escapeHtml(heroParagraphOne)}</p>
            <p>${escapeHtml(heroParagraphTwo)}</p>
            <a href="#course-registration" class="course-details-hero__button">شرکت در این دوره</a>
          </div>
        </div>
        <div class="course-details-meta">
          ${courseMeta.map((item) => `<article class="course-details-meta__item"><span class="course-details-meta__icon">${iconSvg(item.icon)}</span><div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.value || "تعیین نشده")}</p></div></article>`).join("")}
        </div>
      </div>
    </section>
    <section class="course-details-content">
      <div class="course-details-page__container">
        <div class="course-details-content__grid">
          <aside class="course-details-sidebar">
            <div class="course-registration-card" id="course-registration">
              <div class="course-registration-card__header"><span>در حال ثبت‌نام</span><span>ظرفیت محدود</span></div>
              <h2>${escapeHtml(course.title || "عنوان دوره")}</h2>
              <dl class="course-registration-card__details">
                <div><dt>مدرس دوره:</dt><dd>${escapeHtml(course.mainInstructorName || "تعیین نشده")}</dd></div>
                <div><dt>مدت دوره:</dt><dd>${escapeHtml(course.duration || "تعیین نشده")}</dd></div>
                <div><dt>سطح دوره:</dt><dd>${escapeHtml(course.level || "تعیین نشده")}</dd></div>
                <div><dt>تاریخ ثبت‌نام:</dt><dd>${escapeHtml(combineDateTime(course.registrationDate, course.registrationTime))}</dd></div>
                <div><dt>زمان برگزاری:</dt><dd>${escapeHtml(`${combineDateTime(course.startDate, course.startTime)} تا ${combineDateTime(course.endDate, course.endTime)}`)}</dd></div>
                <div><dt>محل برگزاری:</dt><dd>${escapeHtml(course.location || "تعیین نشده")}</dd></div>
              </dl>
              <div class="course-registration-card__audience"><h3>مناسب برای:</h3><div>${course.audiences.map((audience) => `<span>${iconSvg("check")}${escapeHtml(audience.title || "مخاطب")}</span>`).join("")}</div></div>
              <a href="#register-form" class="course-registration-card__button">شرکت در این دوره</a>
            </div>
          </aside>
          <main class="course-details-article">
            <section class="course-content-section"><span class="course-content-section__eyebrow">معرفی دوره</span><h2>${escapeHtml(course.introTitle || "معرفی دوره")}</h2>${paragraphHtml(course.introText)}</section>
            <section class="course-content-section"><span class="course-content-section__eyebrow">دستاوردهای آموزشی</span><h2>در این دوره چه می‌آموزید؟</h2><div class="course-learning-outcomes">${course.outcomes.map((outcome) => `<article class="course-learning-outcome"><span class="course-learning-outcome__icon">${iconSvg("check")}</span><div><h3>${escapeHtml(outcome.title || "دستاورد آموزشی")}</h3><p>${escapeHtml(outcome.description || "توضیح کوتاه")}</p></div></article>`).join("")}</div></section>
            <section class="course-content-section"><span class="course-content-section__eyebrow">برنامه آموزشی</span><h2>سرفصل‌های دوره</h2><div class="course-modules">${course.modules.map((module, index) => `<article class="course-module ${index === 0 ? "course-module--open" : ""}"><button type="button" aria-expanded="${index === 0 ? "true" : "false"}"><span>${escapeHtml(module.title || "سرفصل دوره")}</span><i aria-hidden="true">${index === 0 ? "−" : "+"}</i></button><div class="course-module__content"><p>${escapeHtml(module.description || "توضیحات سرفصل")}</p></div></article>`).join("")}</div></section>
            <section class="course-content-section"><span class="course-content-section__eyebrow">تیم آموزشی</span><h2>مدرسان دوره</h2><div class="course-instructors">${course.instructors.map((instructor) => `<article class="course-instructor"><span class="course-instructor__avatar">${escapeHtml(createInitials(instructor.name))}</span><div><h3>${escapeHtml(instructor.name || "نام مدرس")}</h3><p>${escapeHtml(instructor.role || "سمت مدرس")}</p></div></article>`).join("")}</div></section>
            <section class="course-content-section"><span class="course-content-section__eyebrow">مزایای شرکت</span><h2>چرا در این دوره شرکت کنیم؟</h2><div class="course-benefits">${course.benefits.map((benefit) => `<article class="course-benefit"><span>${iconSvg("check")}</span><h3>${escapeHtml(benefit.title || "مزیت دوره")}</h3><p>${escapeHtml(benefit.description || "توضیح کوتاه")}</p></article>`).join("")}</div></section>
            <section class="course-content-section"><span class="course-content-section__eyebrow">پرسش‌های متداول</span><h2>سؤالات متداول دوره</h2><div class="course-faq">${course.faqs.map((faq, index) => `<article class="course-faq__item ${index === 0 ? "course-faq__item--open" : ""}"><button type="button" aria-expanded="${index === 0 ? "true" : "false"}"><span>${escapeHtml(faq.question || "سوال متداول")}</span><i aria-hidden="true">${index === 0 ? "−" : "+"}</i></button><div class="course-faq__answer"><p>${escapeHtml(faq.answer || "پاسخ سوال")}</p></div></article>`).join("")}</div></section>
          </main>
        </div>
      </div>
    </section>
    <section class="course-related-section"><div class="course-details-page__container"><section class="activity-carousel"><header class="activity-carousel__heading"><h2>دیگر دوره‌های هاتف</h2><span class="activity-carousel__line"></span><div class="activity-carousel__controls"></div></header><div class="activity-carousel__viewport"><div class="activity-carousel__track"><div class="activity-carousel__page">${relatedItems.map((item, index) => `<article class="activity-card"><a href="#" class="activity-card__media"><img class="activity-card__image" src="${escapeHtml(image)}" alt="${escapeHtml(item.title)}" /></a><div class="activity-card__content"><a href="#" class="activity-card__title">${escapeHtml(item.title)}</a><dl class="activity-card__details"><div><dt>شروع از:</dt><dd>${escapeHtml(displayDate(course.startDate))}</dd></div><div><dt>مدرس:</dt><dd>${escapeHtml(item.instructor)}</dd></div><div><dt>برگزارکننده:</dt><dd>${escapeHtml(item.organizer)}</dd></div></dl><a href="#" class="activity-card__button">${index === 0 ? "ثبت‌نام در دوره" : "اطلاعات بیشتر"}</a></div></article>`).join("")}</div></div></div><div class="activity-carousel__footer"><a href="#" class="activity-carousel__view-all">مشاهده همه<span aria-hidden="true">←</span></a></div></section></div></section>
    <section class="expandable-article-preview"><div class="course-details-page__container"><div class="expandable-article-preview__box"><h2>درباره دوره‌های توانمندسازی هاتف</h2><p>توانمندسازی پژوهشگران و فعالان فناوری یکی از مهم‌ترین مسیرهای توسعه اقتصاد دانش‌بنیان است. دوره‌های هاتف با تمرکز بر مهارت‌های کاربردی، مدیریت فناوری و ارتباط دانشگاه و صنعت طراحی شده‌اند.</p><p>محتوای دوره‌ها با همکاری مدرسان دانشگاهی، مدیران اجرایی و متخصصان صنایع تدوین می‌شود و متناسب با تغییرات فناوری به‌روزرسانی خواهد شد.</p></div></div></section>
  </div>
  <script>
    document.querySelectorAll('.course-module > button').forEach(function(button) {
      button.addEventListener('click', function() {
        var item = button.closest('.course-module');
        var isOpen = item.classList.contains('course-module--open');
        item.classList.toggle('course-module--open', !isOpen);
        button.setAttribute('aria-expanded', String(!isOpen));
        var icon = button.querySelector('i');
        if (icon) icon.textContent = isOpen ? '+' : '−';
      });
    });
    document.querySelectorAll('.course-faq__item > button').forEach(function(button) {
      button.addEventListener('click', function() {
        var item = button.closest('.course-faq__item');
        var isOpen = item.classList.contains('course-faq__item--open');
        item.classList.toggle('course-faq__item--open', !isOpen);
        button.setAttribute('aria-expanded', String(!isOpen));
        var icon = button.querySelector('i');
        if (icon) icon.textContent = isOpen ? '+' : '−';
      });
    });
  </script>
</body>
</html>`;
}

function openCoursePreview(course) {
  const previewCourse = savePublicActivityPreviewDraft({
    ...course,
    type: "course",
    status: course.status || "در انتظار تایید",
  });

  const previewPath = `/courses/${previewCourse.id}?preview=committee`;
  const previewWindow = window.open(
    previewPath,
    "_blank",
    "noopener,noreferrer",
  );

  if (!previewWindow) {
    window.alert(
      "برای مشاهده پیش‌نمایش، اجازه باز شدن پنجره جدید را فعال کنید.",
    );
  }
}

function makeEventPreviewDocument(eventItem) {
  const image = eventItem.image || bannerImage;
  const summaryLines = String(eventItem.summary || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const heroParagraphOne =
    summaryLines[0] || "توضیحات خلاصه رویداد هنوز وارد نشده است.";
  const heroParagraphTwo =
    summaryLines[1] ||
    "شرکت‌کنندگان می‌توانند با تازه‌ترین دستاوردهای پژوهشی آشنا شوند و فرصت‌های همکاری جدیدی ایجاد کنند.";
  const statusLabel = getEventStatusLabel(
    eventItem.secondaryStatus || eventItem.status,
  );
  const actionLabel = getEventActionLabel(
    eventItem.secondaryStatus || eventItem.status,
  );
  const capacityLabel = eventItem.capacity
    ? `${toPersianNumber(eventItem.capacity)} نفر`
    : "تعیین نشده";
  const eventMeta = [
    { title: "مدت رویداد", value: eventItem.duration, icon: "clock" },
    {
      title: "تاریخ برگزاری",
      value: displayDate(eventItem.eventDate || eventItem.startDate),
      icon: "calendar",
    },
    { title: "نوع برگزاری", value: eventItem.format, icon: "presentation" },
    { title: "محل برگزاری", value: eventItem.location, icon: "location" },
    { title: "ظرفیت رویداد", value: capacityLabel, icon: "users" },
  ];
  const relatedEvents = [
    {
      title: "رویداد تخصصی توسعه فناوری",
      instructor: eventItem.secretaryName,
      organizer: eventItem.organizer,
    },
    {
      title: "همایش ارتباط دانشگاه و صنعت",
      instructor: "علی رضایی",
      organizer: "مرکز نوآوری دانشگاه تهران",
    },
    {
      title: "نشست تجاری‌سازی دستاوردها",
      instructor: "سارا احمدی",
      organizer: "برنامه هاتف",
    },
    {
      title: "رویداد شبکه‌سازی فناورانه",
      instructor: "مهدیه سیفی",
      organizer: "دانشگاه تهران",
    },
  ];
  const relatedCourses = [
    {
      title: "دوره مدیریت پروژه‌های فناورانه",
      instructor: "مهدیه سیفی",
      organizer: "برنامه هاتف",
    },
    {
      title: "دوره مهارت‌های توسعه محصول",
      instructor: "علی رضایی",
      organizer: "مرکز نوآوری دانشگاه تهران",
    },
    {
      title: "دوره تجاری‌سازی فناوری",
      instructor: "سارا احمدی",
      organizer: "دانشگاه تهران",
    },
    {
      title: "دوره تحلیل بازار فناوری",
      instructor: "مهدیه سیفی",
      organizer: "برنامه هاتف",
    },
  ];
  const timeRange = `${displayTime(eventItem.startTime) || "--:--"} تا ${displayTime(eventItem.endTime) || "--:--"}`;

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(eventItem.title || "پیش‌نمایش رویداد")}</title>
  <style>${EVENT_PREVIEW_CSS}</style>
</head>
<body>
  <div class="event-details-page">
    <section class="event-details-hero">
      <div class="event-details-page__container">
        <nav class="event-details__breadcrumb" aria-label="مسیر صفحه"><a href="#">صفحه اصلی</a><span>/</span><a href="#">رویدادهای هاتف</a><span>/</span><span>${escapeHtml(eventItem.title)}</span></nav>
        <div class="event-details-hero__grid">
          <div class="event-details-hero__media"><img src="${escapeHtml(image)}" alt="${escapeHtml(eventItem.title)}" /><div class="event-details-hero__badges"><span>${escapeHtml(statusLabel)}</span><span>${escapeHtml(displayDate(eventItem.eventDate || eventItem.startDate))}</span></div></div>
          <div class="event-details-hero__content"><span class="event-details-hero__eyebrow">رویداد تخصصی هاتف</span><h1>${escapeHtml(eventItem.title || "عنوان رویداد")}</h1><p>${escapeHtml(heroParagraphOne)}</p><p>${escapeHtml(heroParagraphTwo)}</p><a href="#event-registration" class="event-details-hero__button">${escapeHtml(actionLabel)}</a></div>
        </div>
        <div class="event-details-meta">${eventMeta.map((item) => `<article class="event-details-meta__item"><span class="event-details-meta__icon">${iconSvg(item.icon)}</span><div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.value || "تعیین نشده")}</p></div></article>`).join("")}</div>
      </div>
    </section>
    <section class="event-details-content">
      <div class="event-details-page__container">
        <div class="event-details-content__grid">
          <aside class="event-details-sidebar">
            <div class="event-registration-card" id="event-registration">
              <div class="event-registration-card__header"><span>${escapeHtml(statusLabel)}</span><span>ظرفیت محدود</span></div>
              <h2>${escapeHtml(eventItem.title || "عنوان رویداد")}</h2>
              <dl class="event-registration-card__details">
                <div><dt>دبیر رویداد:</dt><dd>${escapeHtml(eventItem.secretaryName || "تعیین نشده")}</dd></div>
                <div><dt>برگزارکننده:</dt><dd>${escapeHtml(eventItem.organizer || "تعیین نشده")}</dd></div>
                <div><dt>تاریخ برگزاری:</dt><dd>${escapeHtml(displayDate(eventItem.eventDate || eventItem.startDate))}</dd></div>
                <div><dt>ساعت برگزاری:</dt><dd>${escapeHtml(timeRange)}</dd></div>
                <div><dt>نوع برگزاری:</dt><dd>${escapeHtml(eventItem.format || "تعیین نشده")}</dd></div>
                <div><dt>محل برگزاری:</dt><dd>${escapeHtml(eventItem.location || "تعیین نشده")}</dd></div>
              </dl>
              <div class="event-registration-card__audience"><h3>مناسب برای:</h3><div>${eventItem.audiences.map((audience) => `<span>${iconSvg("check")}${escapeHtml(audience.title || "مخاطب")}</span>`).join("")}</div></div>
              <a href="#registration-form" class="event-registration-card__button">${escapeHtml(actionLabel)}</a>
            </div>
          </aside>
          <main class="event-details-article">
            <section class="event-content-section"><span class="event-content-section__eyebrow">معرفی رویداد</span><h2>${escapeHtml(eventItem.introTitle || "معرفی رویداد")}</h2>${paragraphHtml(eventItem.introText)}</section>
            <section class="event-content-section"><span class="event-content-section__eyebrow">مزایای حضور</span><h2>چرا در این رویداد شرکت کنیم؟</h2><div class="event-highlights">${eventItem.highlights.map((highlight) => `<article class="event-highlight"><span>${iconSvg("check")}</span><div><h3>${escapeHtml(highlight.title || "مزیت حضور")}</h3><p>${escapeHtml(highlight.description || "توضیح کوتاه")}</p></div></article>`).join("")}</div></section>
            <section class="event-content-section"><span class="event-content-section__eyebrow">برنامه رویداد</span><h2>جدول زمان‌بندی برنامه‌ها</h2><div class="event-agenda">${eventItem.agenda.map((agenda) => `<article class="event-agenda__item"><time>${escapeHtml(displayTime(agenda.time) || "--:--")}</time><span class="event-agenda__marker"></span><div><h3>${escapeHtml(agenda.title || "عنوان برنامه")}</h3><p>${escapeHtml(agenda.description || "توضیح کوتاه برنامه")}</p></div></article>`).join("")}</div></section>
            <section class="event-content-section"><span class="event-content-section__eyebrow">تیم علمی رویداد</span><h2>سخنرانان و اعضای پنل</h2><div class="event-speakers">${eventItem.speakers.map((speaker) => `<article class="event-speaker"><span class="event-speaker__avatar">${escapeHtml(createInitials(speaker.name))}</span><div><h3>${escapeHtml(speaker.name || "نام سخنران")}</h3><p>${escapeHtml(speaker.role || "سمت")}</p><span>${escapeHtml(eventItem.organizer || "برنامه هاتف")}</span><a href="#speaker-profile">مشاهده صفحه در دانشگاه</a></div></article>`).join("")}</div></section>
            <section class="event-content-section"><span class="event-content-section__eyebrow">راهنمای حضور</span><h2>پرسش‌های متداول رویداد</h2><div class="event-faq">${eventItem.faqs.map((faq, index) => `<article class="event-faq__item ${index === 0 ? "event-faq__item--open" : ""}"><button type="button" aria-expanded="${index === 0 ? "true" : "false"}"><span>${escapeHtml(faq.question || "سوال متداول")}</span><i aria-hidden="true">${index === 0 ? "−" : "+"}</i></button><div class="event-faq__answer"><p>${escapeHtml(faq.answer || "پاسخ سوال")}</p></div></article>`).join("")}</div></section>
          </main>
        </div>
      </div>
    </section>
    <section class="event-related-section"><div class="event-details-page__container"><section class="activity-carousel"><header class="activity-carousel__heading"><h2>رویدادهای دیگر</h2><span class="activity-carousel__line"></span><div class="activity-carousel__controls"></div></header><div class="activity-carousel__viewport"><div class="activity-carousel__track"><div class="activity-carousel__page">${relatedEvents.map((item) => `<article class="activity-card"><a href="#" class="activity-card__media"><img class="activity-card__image" src="${escapeHtml(image)}" alt="${escapeHtml(item.title)}" /></a><div class="activity-card__content"><a href="#" class="activity-card__title">${escapeHtml(item.title)}</a><dl class="activity-card__details"><div><dt>شروع از:</dt><dd>${escapeHtml(displayDate(eventItem.eventDate || eventItem.startDate))}</dd></div><div><dt>دبیر:</dt><dd>${escapeHtml(item.instructor)}</dd></div><div><dt>برگزارکننده:</dt><dd>${escapeHtml(item.organizer)}</dd></div></dl><a href="#" class="activity-card__button">اطلاعات بیشتر</a></div></article>`).join("")}</div></div></div><div class="activity-carousel__footer"><a href="#" class="activity-carousel__view-all">مشاهده همه رویدادها<span aria-hidden="true">←</span></a></div></section></div></section>
    <section class="event-related-section event-related-section--courses"><div class="event-details-page__container"><section class="activity-carousel"><header class="activity-carousel__heading"><h2>دیگر دوره‌های هاتف</h2><span class="activity-carousel__line"></span><div class="activity-carousel__controls"></div></header><div class="activity-carousel__viewport"><div class="activity-carousel__track"><div class="activity-carousel__page">${relatedCourses.map((item) => `<article class="activity-card"><a href="#" class="activity-card__media"><img class="activity-card__image" src="${escapeHtml(image)}" alt="${escapeHtml(item.title)}" /></a><div class="activity-card__content"><a href="#" class="activity-card__title">${escapeHtml(item.title)}</a><dl class="activity-card__details"><div><dt>شروع از:</dt><dd>${escapeHtml(displayDate(eventItem.eventDate || eventItem.startDate))}</dd></div><div><dt>مدرس:</dt><dd>${escapeHtml(item.instructor)}</dd></div><div><dt>برگزارکننده:</dt><dd>${escapeHtml(item.organizer)}</dd></div></dl><a href="#" class="activity-card__button">اطلاعات بیشتر</a></div></article>`).join("")}</div></div></div><div class="activity-carousel__footer"><a href="#" class="activity-carousel__view-all">مشاهده همه دوره‌ها<span aria-hidden="true">←</span></a></div></section></div></section>
    <section class="expandable-article-preview"><div class="event-details-page__container"><div class="expandable-article-preview__box"><h2>درباره رویدادهای تخصصی هاتف</h2><p>رویدادهای برنامه هاتف بستری برای معرفی توانمندی‌های علمی، پژوهشی و فناورانه دانشگاه و ایجاد ارتباط مؤثر با صنعت فراهم می‌کنند.</p><p>هدف اصلی این برنامه‌ها تسهیل همکاری‌های مشترک، توسعه محصولات فناورانه و تبدیل یافته‌های دانشگاهی به راهکارهای قابل استفاده در جامعه و صنعت است.</p></div></div></section>
  </div>
  <script>
    document.querySelectorAll('.event-faq__item > button').forEach(function(button) {
      button.addEventListener('click', function() {
        var item = button.closest('.event-faq__item');
        var isOpen = item.classList.contains('event-faq__item--open');
        item.classList.toggle('event-faq__item--open', !isOpen);
        button.setAttribute('aria-expanded', String(!isOpen));
        var icon = button.querySelector('i');
        if (icon) icon.textContent = isOpen ? '+' : '−';
      });
    });
  </script>
</body>
</html>`;
}

function openEventPreview(eventItem) {
  const previewEvent = savePublicActivityPreviewDraft({
    ...eventItem,
    type: "event",
    status: eventItem.status || "در انتظار تایید",
  });

  const previewPath = `/events/${previewEvent.id}?preview=committee`;
  const previewWindow = window.open(
    previewPath,
    "_blank",
    "noopener,noreferrer",
  );

  if (!previewWindow) {
    window.alert(
      "برای مشاهده پیش‌نمایش، اجازه باز شدن پنجره جدید را فعال کنید.",
    );
  }
}

function getCurrentPersianDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = now.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} - ساعت ${time}`;
}

function getStatusClass(status) {
  if (status === "منتشر شده") return "published";
  if (status === "رد شده") return "rejected";
  return "pending";
}

function isDateInRange(item, from, to) {
  if (!item.startDate) return true;
  if (from && item.startDate < from) return false;
  if (to && item.startDate > to) return false;
  return true;
}

function Field({ label, required, children, error, hint, className = "" }) {
  return (
    <label className={`instructor-create__field ${className}`}>
      <span>
        {label}
        {required && <b>*</b>}
      </span>
      {children}
      {hint && <small className="instructor-create__hint">{hint}</small>}
      {error && <small className="instructor-create__error">{error}</small>}
    </label>
  );
}

function SectionBlock({ title, description, children, action }) {
  return (
    <section className="course-builder-section">
      <header className="course-builder-section__head">
        <div>
          <h4>{title}</h4>
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function CreateCoursePanel({ onSubmitActivity }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [highestStep, setHighestStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_COURSE_FORM);
  const [errors, setErrors] = useState({});

  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const updateListItem = (listName, index, fieldName, value) => {
    setForm((current) => ({
      ...current,
      [listName]: current[listName].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [fieldName]: value } : item,
      ),
    }));
  };

  const addListItem = (listName, emptyItem, maxCount) => {
    setForm((current) => {
      if (current[listName].length >= maxCount) return current;
      return {
        ...current,
        [listName]: [...current[listName], { ...emptyItem }],
      };
    });
  };

  const removeListItem = (listName, index, minCount = 1) => {
    setForm((current) => {
      if (current[listName].length <= minCount) return current;
      return {
        ...current,
        [listName]: current[listName].filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      };
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const uploadedImage = await uploadImageFileToSiteMedia(file, {
        folder: "activities/courses",
        prefix: "course",
        maxWidth: 1600,
        maxHeight: 1100,
        quality: 0.78,
      });
      updateField("image", uploadedImage.url || bannerImage);
    } catch (error) {
      window.alert(error?.message || "بارگذاری تصویر دوره انجام نشد.");
    }
  };

  const buildCoursePayload = () => ({
    ...form,
    id: `course-${Date.now()}`,
    type: "course",
    status: "در انتظار تایید",
    secondaryStatus: "",
    statusFeedback: "",
    createdAt: getCurrentPersianDateTime(),
  });

  const validateStep = (targetStep = stepIndex) => {
    const nextErrors = {};
    const check = (condition, key, message) => {
      if (!condition) nextErrors[key] = message;
    };

    if (targetStep === 0) {
      check(form.title.trim().length > 0, "title", "عنوان دوره الزامی است.");
      check(
        form.title.trim().length <= 90,
        "title",
        "عنوان باید کوتاه و حداکثر ۹۰ کاراکتر باشد.",
      );
      check(
        form.summary.trim().length > 0,
        "summary",
        "توضیحات خلاصه الزامی است.",
      );
    }

    if (targetStep === 1) {
      check(Boolean(form.startDate), "startDate", "تاریخ برگزاری الزامی است.");
      check(
        !form.startDate || isPersianDateFormat(form.startDate),
        "startDate",
        "فرمت تاریخ باید مثل 1404/02/06 باشد.",
      );
      check(Boolean(form.endDate), "endDate", "تاریخ پایان الزامی است.");
      check(
        !form.endDate || isPersianDateFormat(form.endDate),
        "endDate",
        "فرمت تاریخ باید مثل 1404/02/06 باشد.",
      );
      check(
        Boolean(form.registrationDate),
        "registrationDate",
        "تاریخ ثبت‌نام الزامی است.",
      );
      check(
        !form.registrationDate || isPersianDateFormat(form.registrationDate),
        "registrationDate",
        "فرمت تاریخ باید مثل 1404/02/06 باشد.",
      );
      check(
        isPersianTimeFormat(form.startTime),
        "startTime",
        "فرمت ساعت باید مثل 20:00 باشد.",
      );
      check(
        isPersianTimeFormat(form.endTime),
        "endTime",
        "فرمت ساعت باید مثل 20:00 باشد.",
      );
      check(
        isPersianTimeFormat(form.registrationTime),
        "registrationTime",
        "فرمت ساعت باید مثل 20:00 باشد.",
      );
      check(
        form.duration.trim().length > 0,
        "duration",
        "مدت برگزاری الزامی است.",
      );
      check(
        form.capacity && Number(normalizeDigits(form.capacity)) > 0,
        "capacity",
        "ظرفیت باید عددی بزرگ‌تر از صفر باشد.",
      );
    }

    if (targetStep === 2) {
      check(
        form.introText.trim().length > 0,
        "introText",
        "متن معرفی دوره الزامی است.",
      );
      check(
        form.mainInstructorName.trim().length > 0,
        "mainInstructorName",
        "نام مدرس دوره الزامی است.",
      );
      check(
        form.location.trim().length > 0,
        "location",
        "محل برگزاری الزامی است.",
      );
      check(
        form.audiences.some((item) => item.title.trim()),
        "audiences",
        "حداقل یک مخاطب هدف وارد کنید.",
      );
    }

    if (targetStep === 3) {
      check(
        form.outcomes.every(
          (item) => item.title.trim() && item.description.trim(),
        ),
        "outcomes",
        "برای همه دستاوردها تیتر و توضیح وارد کنید.",
      );
      check(
        form.modules.every(
          (item) => item.title.trim() && item.description.trim(),
        ),
        "modules",
        "برای همه سرفصل‌ها عنوان و توضیح وارد کنید.",
      );
    }

    if (targetStep === 4) {
      check(
        form.instructors.every((item) => item.name.trim() && item.role.trim()),
        "instructors",
        "برای همه مدرسان نام و سمت وارد کنید.",
      );
      check(
        form.benefits.every(
          (item) => item.title.trim() && item.description.trim(),
        ),
        "benefits",
        "برای همه مزایا تیتر و توضیح وارد کنید.",
      );
      check(
        form.faqs.every((item) => item.question.trim() && item.answer.trim()),
        "faqs",
        "برای همه سوالات، سوال و پاسخ را وارد کنید.",
      );
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateAll = () => {
    for (let index = 0; index < WIZARD_STEPS.length - 1; index += 1) {
      if (!validateStep(index)) {
        setStepIndex(index);
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStepIndex((current) => {
      const next = Math.min(current + 1, WIZARD_STEPS.length - 1);
      setHighestStep((highest) => Math.max(highest, next));
      return next;
    });
  };

  const goToStep = (index) => {
    if (index <= highestStep) setStepIndex(index);
  };

  const submitCourse = () => {
    if (!validateAll()) return;
    const isConfirmed = window.confirm(
      "این دوره برای تایید به دبیرخانه ارسال خواهد شد و بعد از تایید نهایی منتشر می‌شود. آیا از صحت همه اطلاعات و ثبت نهایی اطمینان دارید؟",
    );
    if (!isConfirmed) return;

    onSubmitActivity(buildCoursePayload());
  };

  const previewPayload = buildCoursePayload();

  return (
    <section className="instructor-create instructor-course-builder">
      <div className="instructor-create__panel">
        <header className="instructor-create__header instructor-create__header--stacked">
          <div>
            <span>ساخت دوره جدید</span>
            <h3>فرم مرحله‌ای ساخت دوره</h3>
            <p>
              اطلاعات این فرم مطابق صفحه جزئیات دوره طراحی شده است؛ تاریخ‌ها با
              فرمت شمسی مثل 1404/02/06 ثبت می‌شوند و پیش‌نمایش فقط در مرحله آخر
              فعال است.
            </p>
          </div>

          {isLastStep && (
            <div className="instructor-create__top-actions">
              <button
                type="button"
                onClick={() => openCoursePreview(previewPayload)}
              >
                پیش‌نمایش دوره
              </button>
            </div>
          )}
        </header>

        <div className="instructor-create__steps">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = index === stepIndex;
            const isLocked = index > highestStep;
            return (
              <button
                key={step.id}
                type="button"
                disabled={isLocked}
                onClick={() => goToStep(index)}
                className={`${isActive ? "instructor-create__step--active" : ""} ${isLocked ? "instructor-create__step--locked" : ""}`}
              >
                <span>{toPersianNumber(index + 1)}</span>
                {step.title}
              </button>
            );
          })}
        </div>

        {stepIndex === 0 && (
          <div className="instructor-create__form-grid">
            <Field
              label="عنوان دوره"
              required
              error={errors.title}
              hint="متن کوتاه؛ حداکثر ۹۰ کاراکتر"
              className="instructor-create__field--full"
            >
              <input
                value={form.title}
                maxLength={90}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </Field>

            <Field
              label="توضیحات خلاصه"
              required
              error={errors.summary}
              hint="این متن در بخش hero صفحه دوره نمایش داده می‌شود."
              className="instructor-create__field--full"
            >
              <textarea
                value={form.summary}
                onChange={(event) => updateField("summary", event.target.value)}
              />
            </Field>

            <Field
              label="عکس نمادین دوره"
              hint="می‌توانید فایل آپلود کنید یا همان banner پیش‌فرض را نگه دارید."
              className="instructor-create__field--full"
            >
              <div className="course-builder-image-field">
                <img src={form.image || bannerImage} alt="پیش‌نمایش عکس دوره" />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <input
                    value={form.image === bannerImage ? "" : form.image}
                    placeholder="یا لینک تصویر را وارد کنید"
                    onChange={(event) =>
                      updateField("image", event.target.value || bannerImage)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => updateField("image", bannerImage)}
                  >
                    استفاده از بنر پیش‌فرض
                  </button>
                </div>
              </div>
            </Field>
          </div>
        )}

        {stepIndex === 1 && (
          <div className="instructor-create__form-grid">
            <Field
              label="تاریخ برگزاری"
              required
              error={errors.startDate}
              hint="فرمت نمونه: 1404/02/06"
            >
              <input
                inputMode="numeric"
                dir="ltr"
                placeholder="1404/02/06"
                value={form.startDate}
                onChange={(event) =>
                  updateField("startDate", event.target.value)
                }
              />
            </Field>
            <Field label="ساعت شروع (اختیاری)" error={errors.startTime}>
              <input
                inputMode="numeric"
                dir="ltr"
                placeholder="20:00"
                value={form.startTime}
                onChange={(event) =>
                  updateField("startTime", event.target.value)
                }
              />
            </Field>
            <Field
              label="تاریخ پایان"
              required
              error={errors.endDate}
              hint="فرمت نمونه: 1404/02/06"
            >
              <input
                inputMode="numeric"
                dir="ltr"
                placeholder="1404/03/17"
                value={form.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
              />
            </Field>
            <Field label="ساعت پایان (اختیاری)" error={errors.endTime}>
              <input
                inputMode="numeric"
                dir="ltr"
                placeholder="20:00"
                value={form.endTime}
                onChange={(event) => updateField("endTime", event.target.value)}
              />
            </Field>
            <Field
              label="تاریخ ثبت‌نام"
              required
              error={errors.registrationDate}
              hint="فرمت نمونه: 1404/01/20"
            >
              <input
                inputMode="numeric"
                dir="ltr"
                placeholder="1404/01/20"
                value={form.registrationDate}
                onChange={(event) =>
                  updateField("registrationDate", event.target.value)
                }
              />
            </Field>
            <Field
              label="ساعت ثبت‌نام (اختیاری)"
              error={errors.registrationTime}
            >
              <input
                inputMode="numeric"
                dir="ltr"
                placeholder="20:00"
                value={form.registrationTime}
                onChange={(event) =>
                  updateField("registrationTime", event.target.value)
                }
              />
            </Field>
            <Field
              label="مدت برگزاری"
              required
              error={errors.duration}
              hint="متن کوتاه؛ مثل ۶ هفته یا ۱۲۰ ساعت"
            >
              <input
                value={form.duration}
                onChange={(event) =>
                  updateField("duration", event.target.value)
                }
              />
            </Field>
            <Field label="نوع برگزاری">
              <select
                value={form.format}
                onChange={(event) => updateField("format", event.target.value)}
              >
                <option>حضوری</option>
                <option>مجازی</option>
                <option>ترکیبی</option>
              </select>
            </Field>
            <Field label="سطح دوره">
              <select
                value={form.level}
                onChange={(event) => updateField("level", event.target.value)}
              >
                <option>مقدماتی</option>
                <option>متوسط</option>
                <option>پیشرفته</option>
                <option>عمومی تخصصی</option>
              </select>
            </Field>
            <Field
              label="ظرفیت دوره"
              required
              error={errors.capacity}
              hint="واحد ظرفیت در خروجی نفر است."
            >
              <div className="course-builder-number-field">
                <input
                  inputMode="numeric"
                  dir="ltr"
                  value={form.capacity}
                  onChange={(event) =>
                    updateField("capacity", event.target.value)
                  }
                />
                <span>نفر</span>
              </div>
            </Field>
          </div>
        )}

        {stepIndex === 2 && (
          <div className="instructor-create__form-grid">
            <Field
              label="عنوان بخش معرفی دوره"
              className="instructor-create__field--full"
            >
              <input
                value={form.introTitle}
                onChange={(event) =>
                  updateField("introTitle", event.target.value)
                }
              />
            </Field>
            <Field
              label="متن معرفی دوره"
              required
              error={errors.introText}
              className="instructor-create__field--full"
            >
              <textarea
                value={form.introText}
                onChange={(event) =>
                  updateField("introText", event.target.value)
                }
              />
            </Field>
            <Field label="مدرس دوره" required error={errors.mainInstructorName}>
              <input
                value={form.mainInstructorName}
                onChange={(event) =>
                  updateField("mainInstructorName", event.target.value)
                }
              />
            </Field>
            <Field label="محل برگزاری" required error={errors.location}>
              <input
                value={form.location}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
              />
            </Field>
            <div className="instructor-create__field instructor-create__field--full">
              <span>مناسب برای</span>
              {errors.audiences && (
                <small className="instructor-create__error">
                  {errors.audiences}
                </small>
              )}
              <div className="course-builder-repeat-list course-builder-repeat-list--compact">
                {form.audiences.map((audience, index) => (
                  <div
                    className="course-builder-repeat-item"
                    key={`audience-${index}`}
                  >
                    <input
                      value={audience.title}
                      onChange={(event) =>
                        updateListItem(
                          "audiences",
                          index,
                          "title",
                          event.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem("audiences", index, 1)}
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="course-builder-add-button"
                disabled={form.audiences.length >= 6}
                onClick={() => addListItem("audiences", EMPTY_AUDIENCE, 6)}
              >
                + افزودن مخاطب
              </button>
            </div>
          </div>
        )}

        {stepIndex === 3 && (
          <div className="course-builder-two-sections">
            <RepeatSection
              title="دستاوردهای آموزشی"
              description="در حالت پیش‌فرض ۴ مورد فعال است و تا ۶ مورد می‌توانید اضافه کنید."
              error={errors.outcomes}
              items={form.outcomes}
              fields={[
                { name: "title", label: "تیتر" },
                { name: "description", label: "توضیح کوتاه" },
              ]}
              maxCount={6}
              minCount={1}
              emptyItem={EMPTY_OUTCOME}
              listName="outcomes"
              onUpdate={updateListItem}
              onAdd={addListItem}
              onRemove={removeListItem}
            />
            <RepeatSection
              title="برنامه آموزشی و سرفصل‌های دوره"
              description="این بخش در پیش‌نمایش به صورت بازشونده نمایش داده می‌شود. تا ۲۰ مورد قابل اضافه کردن است."
              error={errors.modules}
              items={form.modules}
              fields={[
                { name: "title", label: "عنوان باکس" },
                { name: "description", label: "توضیح" },
              ]}
              maxCount={20}
              minCount={1}
              emptyItem={EMPTY_MODULE}
              listName="modules"
              onUpdate={updateListItem}
              onAdd={addListItem}
              onRemove={removeListItem}
            />
          </div>
        )}

        {stepIndex === 4 && (
          <div className="course-builder-two-sections">
            <RepeatSection
              title="تیم آموزشی و مدرسان دوره"
              description="در حالت پیش‌فرض ۲ مورد وجود دارد و تا ۸ مدرس قابل ثبت است."
              error={errors.instructors}
              items={form.instructors}
              fields={[
                { name: "name", label: "نام" },
                { name: "role", label: "سمت" },
              ]}
              maxCount={8}
              minCount={1}
              emptyItem={EMPTY_INSTRUCTOR}
              listName="instructors"
              onUpdate={updateListItem}
              onAdd={addListItem}
              onRemove={removeListItem}
            />
            <RepeatSection
              title="مزایای شرکت"
              description="۳ مورد پیش‌فرض دارد و تا ۶ مورد قابل اضافه کردن است."
              error={errors.benefits}
              items={form.benefits}
              fields={[
                { name: "title", label: "تیتر کوتاه" },
                { name: "description", label: "توضیح کوتاه" },
              ]}
              maxCount={6}
              minCount={1}
              emptyItem={EMPTY_BENEFIT}
              listName="benefits"
              onUpdate={updateListItem}
              onAdd={addListItem}
              onRemove={removeListItem}
            />
            <RepeatSection
              title="سؤالات متداول دوره"
              description="این بخش مانند سرفصل‌ها بازشونده است. ۳ مورد پیش‌فرض دارد و تا ۱۰ مورد قابل اضافه کردن است."
              error={errors.faqs}
              items={form.faqs}
              fields={[
                { name: "question", label: "سؤال" },
                { name: "answer", label: "پاسخ" },
              ]}
              maxCount={10}
              minCount={1}
              emptyItem={EMPTY_FAQ}
              listName="faqs"
              onUpdate={updateListItem}
              onAdd={addListItem}
              onRemove={removeListItem}
            />
          </div>
        )}

        {stepIndex === 5 && (
          <div className="instructor-create__review">
            <article className="instructor-create__review-card">
              <img src={form.image || bannerImage} alt={form.title} />
              <div>
                <span>مرور نهایی دوره</span>
                <h4>{form.title || "عنوان دوره"}</h4>
                <p>{form.summary || "توضیحات خلاصه دوره"}</p>
                <ul>
                  <li>
                    تاریخ برگزاری:{" "}
                    {combineDateTime(form.startDate, form.startTime)}
                  </li>
                  <li>
                    تاریخ پایان: {combineDateTime(form.endDate, form.endTime)}
                  </li>
                  <li>
                    تاریخ ثبت‌نام:{" "}
                    {combineDateTime(
                      form.registrationDate,
                      form.registrationTime,
                    )}
                  </li>
                  <li>
                    ظرفیت:{" "}
                    {form.capacity
                      ? `${toPersianNumber(form.capacity)} نفر`
                      : "تعیین نشده"}
                  </li>
                  <li>مدرس دوره: {form.mainInstructorName || "تعیین نشده"}</li>
                </ul>
              </div>
            </article>
            <div className="instructor-create__notice">
              این دوره برای تایید به دبیرخانه ارسال خواهد شد و بعد از تایید
              نهایی منتشر می‌شود.
            </div>
          </div>
        )}

        <div className="instructor-create__actions">
          <button
            type="button"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
          >
            مرحله قبل
          </button>

          {!isLastStep && (
            <button type="button" onClick={goNext}>
              مرحله بعد
            </button>
          )}

          {isLastStep && (
            <button type="button" onClick={submitCourse}>
              ثبت نهایی دوره
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function CreateEventPanel({ onSubmitActivity }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [highestStep, setHighestStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_EVENT_FORM);
  const [errors, setErrors] = useState({});

  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const updateListItem = (listName, index, fieldName, value) => {
    setForm((current) => ({
      ...current,
      [listName]: current[listName].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [fieldName]: value } : item,
      ),
    }));
  };

  const addListItem = (listName, emptyItem, maxCount) => {
    setForm((current) => {
      if (current[listName].length >= maxCount) return current;
      return {
        ...current,
        [listName]: [...current[listName], { ...emptyItem }],
      };
    });
  };

  const removeListItem = (listName, index, minCount = 1) => {
    setForm((current) => {
      if (current[listName].length <= minCount) return current;
      return {
        ...current,
        [listName]: current[listName].filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      };
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const uploadedImage = await uploadImageFileToSiteMedia(file, {
        folder: "activities/events",
        prefix: "event",
        maxWidth: 1600,
        maxHeight: 1100,
        quality: 0.78,
      });
      updateField("image", uploadedImage.url || bannerImage);
    } catch (error) {
      window.alert(error?.message || "بارگذاری تصویر رویداد انجام نشد.");
    }
  };

  const buildEventPayload = () => ({
    ...form,
    id: `event-${Date.now()}`,
    type: "event",
    status: "در انتظار تایید",
    secondaryStatus: "",
    statusFeedback: "",
    startDate: form.eventDate,
    endDate: form.eventDate,
    createdAt: getCurrentPersianDateTime(),
  });

  const validateStep = (targetStep = stepIndex) => {
    const nextErrors = {};
    const check = (condition, key, message) => {
      if (!condition) nextErrors[key] = message;
    };

    if (targetStep === 0) {
      check(form.title.trim().length > 0, "title", "عنوان رویداد الزامی است.");
      check(
        form.title.trim().length <= 90,
        "title",
        "عنوان باید کوتاه و حداکثر ۹۰ کاراکتر باشد.",
      );
      check(
        form.summary.trim().length > 0,
        "summary",
        "توضیحات خلاصه الزامی است.",
      );
    }

    if (targetStep === 1) {
      check(Boolean(form.eventDate), "eventDate", "تاریخ برگزاری الزامی است.");
      check(
        !form.eventDate || isPersianDateFormat(form.eventDate),
        "eventDate",
        "فرمت تاریخ باید مثل 1404/02/06 باشد.",
      );
      check(
        Boolean(form.startTime),
        "startTime",
        "ساعت شروع رویداد الزامی است.",
      );
      check(Boolean(form.endTime), "endTime", "ساعت پایان رویداد الزامی است.");
      check(
        isPersianTimeFormat(form.startTime),
        "startTime",
        "فرمت ساعت باید مثل 20:00 باشد.",
      );
      check(
        isPersianTimeFormat(form.endTime),
        "endTime",
        "فرمت ساعت باید مثل 20:00 باشد.",
      );
      check(
        form.duration.trim().length > 0,
        "duration",
        "مدت رویداد الزامی است.",
      );
      check(
        form.capacity && Number(normalizeDigits(form.capacity)) > 0,
        "capacity",
        "ظرفیت باید عددی بزرگ‌تر از صفر باشد.",
      );
      check(
        form.organizer.trim().length > 0,
        "organizer",
        "برگزارکننده الزامی است.",
      );
      check(
        form.location.trim().length > 0,
        "location",
        "محل برگزاری الزامی است.",
      );
    }

    if (targetStep === 2) {
      check(
        form.introText.trim().length > 0,
        "introText",
        "متن معرفی رویداد الزامی است.",
      );
      check(
        form.secretaryName.trim().length > 0,
        "secretaryName",
        "نام دبیر رویداد الزامی است.",
      );
      check(
        form.audiences.some((item) => item.title.trim()),
        "audiences",
        "حداقل یک مخاطب هدف وارد کنید.",
      );
    }

    if (targetStep === 3) {
      check(
        form.highlights.every(
          (item) => item.title.trim() && item.description.trim(),
        ),
        "highlights",
        "برای همه مزایای حضور تیتر و توضیح وارد کنید.",
      );
      check(
        form.agenda.every(
          (item) =>
            item.time.trim() &&
            isPersianTimeFormat(item.time) &&
            item.title.trim() &&
            item.description.trim(),
        ),
        "agenda",
        "برای همه برنامه‌ها ساعت، عنوان و توضیح معتبر وارد کنید.",
      );
    }

    if (targetStep === 4) {
      check(
        form.speakers.every((item) => item.name.trim() && item.role.trim()),
        "speakers",
        "برای همه سخنرانان نام و سمت وارد کنید.",
      );
      check(
        form.faqs.every((item) => item.question.trim() && item.answer.trim()),
        "faqs",
        "برای همه سوالات، سوال و پاسخ را وارد کنید.",
      );
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateAll = () => {
    for (let index = 0; index < WIZARD_STEPS.length - 1; index += 1) {
      if (!validateStep(index)) {
        setStepIndex(index);
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStepIndex((current) => {
      const next = Math.min(current + 1, WIZARD_STEPS.length - 1);
      setHighestStep((highest) => Math.max(highest, next));
      return next;
    });
  };

  const goToStep = (index) => {
    if (index <= highestStep) setStepIndex(index);
  };

  const submitEvent = () => {
    if (!validateAll()) return;
    const isConfirmed = window.confirm(
      "این رویداد برای تایید به دبیرخانه ارسال خواهد شد و بعد از تایید نهایی منتشر می‌شود. آیا از صحت همه اطلاعات و ثبت نهایی اطمینان دارید؟",
    );
    if (!isConfirmed) return;

    onSubmitActivity(buildEventPayload());
  };

  const previewPayload = buildEventPayload();

  return (
    <section className="instructor-create instructor-course-builder instructor-event-builder">
      <div className="instructor-create__panel">
        <header className="instructor-create__header instructor-create__header--stacked">
          <div>
            <span>ساخت رویداد جدید</span>
            <h3>فرم مرحله‌ای ساخت رویداد</h3>
            <p>
              اطلاعات این فرم مطابق صفحه جزئیات رویداد طراحی شده است؛ تاریخ‌ها
              با فرمت شمسی و ساعت‌ها با فرمت ۲۴ ساعته ثبت می‌شوند.
            </p>
          </div>
          {isLastStep && (
            <div className="instructor-create__top-actions">
              <button
                type="button"
                onClick={() => openEventPreview(previewPayload)}
              >
                پیش‌نمایش رویداد
              </button>
            </div>
          )}
        </header>

        <div className="instructor-create__steps">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = index === stepIndex;
            const isLocked = index > highestStep;
            return (
              <button
                key={step.id}
                type="button"
                disabled={isLocked}
                onClick={() => goToStep(index)}
                className={`${isActive ? "instructor-create__step--active" : ""} ${isLocked ? "instructor-create__step--locked" : ""}`}
              >
                <span>{toPersianNumber(index + 1)}</span>
                {step.title}
              </button>
            );
          })}
        </div>

        {stepIndex === 0 && (
          <div className="instructor-create__form-grid">
            <Field
              label="عنوان رویداد"
              required
              error={errors.title}
              hint="متن کوتاه؛ حداکثر ۹۰ کاراکتر"
              className="instructor-create__field--full"
            >
              <input
                value={form.title}
                maxLength={90}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </Field>
            <Field
              label="توضیحات خلاصه"
              required
              error={errors.summary}
              hint="این متن در بخش hero صفحه رویداد نمایش داده می‌شود."
              className="instructor-create__field--full"
            >
              <textarea
                value={form.summary}
                onChange={(event) => updateField("summary", event.target.value)}
              />
            </Field>
            <Field
              label="عکس نمادین رویداد"
              hint="می‌توانید فایل آپلود کنید یا همان banner پیش‌فرض را نگه دارید."
              className="instructor-create__field--full"
            >
              <div className="course-builder-image-field">
                <img
                  src={form.image || bannerImage}
                  alt="پیش‌نمایش عکس رویداد"
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <input
                    value={form.image === bannerImage ? "" : form.image}
                    placeholder="یا لینک تصویر را وارد کنید"
                    onChange={(event) =>
                      updateField("image", event.target.value || bannerImage)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => updateField("image", bannerImage)}
                  >
                    استفاده از بنر پیش‌فرض
                  </button>
                </div>
              </div>
            </Field>
          </div>
        )}

        {stepIndex === 1 && (
          <div className="instructor-create__form-grid">
            <Field
              label="تاریخ برگزاری"
              required
              error={errors.eventDate}
              hint="فرمت نمونه: 1404/02/06"
            >
              <input
                inputMode="numeric"
                dir="ltr"
                placeholder="1404/02/06"
                value={form.eventDate}
                onChange={(event) =>
                  updateField("eventDate", event.target.value)
                }
              />
            </Field>
            <Field label="ساعت شروع" required error={errors.startTime}>
              <input
                inputMode="numeric"
                dir="ltr"
                placeholder="08:30"
                value={form.startTime}
                onChange={(event) =>
                  updateField("startTime", event.target.value)
                }
              />
            </Field>
            <Field label="ساعت پایان" required error={errors.endTime}>
              <input
                inputMode="numeric"
                dir="ltr"
                placeholder="17:00"
                value={form.endTime}
                onChange={(event) => updateField("endTime", event.target.value)}
              />
            </Field>
            <Field
              label="مدت رویداد"
              required
              error={errors.duration}
              hint="متن کوتاه؛ مثل یک روز یا ۸ ساعت"
            >
              <input
                value={form.duration}
                onChange={(event) =>
                  updateField("duration", event.target.value)
                }
              />
            </Field>
            <Field label="نوع برگزاری">
              <select
                value={form.format}
                onChange={(event) => updateField("format", event.target.value)}
              >
                <option>حضوری</option>
                <option>مجازی</option>
                <option>ترکیبی</option>
              </select>
            </Field>
            <Field
              label="ظرفیت رویداد"
              required
              error={errors.capacity}
              hint="واحد ظرفیت در خروجی نفر است."
            >
              <div className="course-builder-number-field">
                <input
                  inputMode="numeric"
                  dir="ltr"
                  value={form.capacity}
                  onChange={(event) =>
                    updateField("capacity", event.target.value)
                  }
                />
                <span>نفر</span>
              </div>
            </Field>
            <Field label="برگزارکننده" required error={errors.organizer}>
              <input
                value={form.organizer}
                onChange={(event) =>
                  updateField("organizer", event.target.value)
                }
              />
            </Field>
            <Field label="محل برگزاری" required error={errors.location}>
              <input
                value={form.location}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
              />
            </Field>
          </div>
        )}

        {stepIndex === 2 && (
          <div className="instructor-create__form-grid">
            <Field
              label="عنوان بخش معرفی رویداد"
              className="instructor-create__field--full"
            >
              <input
                value={form.introTitle}
                onChange={(event) =>
                  updateField("introTitle", event.target.value)
                }
              />
            </Field>
            <Field
              label="متن معرفی رویداد"
              required
              error={errors.introText}
              className="instructor-create__field--full"
            >
              <textarea
                value={form.introText}
                onChange={(event) =>
                  updateField("introText", event.target.value)
                }
              />
            </Field>
            <Field label="دبیر رویداد" required error={errors.secretaryName}>
              <input
                value={form.secretaryName}
                onChange={(event) =>
                  updateField("secretaryName", event.target.value)
                }
              />
            </Field>
            <div className="instructor-create__field instructor-create__field--full">
              <span>مناسب برای</span>
              {errors.audiences && (
                <small className="instructor-create__error">
                  {errors.audiences}
                </small>
              )}
              <div className="course-builder-repeat-list course-builder-repeat-list--compact">
                {form.audiences.map((audience, index) => (
                  <div
                    className="course-builder-repeat-item"
                    key={`event-audience-${index}`}
                  >
                    <input
                      value={audience.title}
                      onChange={(event) =>
                        updateListItem(
                          "audiences",
                          index,
                          "title",
                          event.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem("audiences", index, 1)}
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="course-builder-add-button"
                disabled={form.audiences.length >= 6}
                onClick={() => addListItem("audiences", EMPTY_AUDIENCE, 6)}
              >
                + افزودن مخاطب
              </button>
            </div>
          </div>
        )}

        {stepIndex === 3 && (
          <div className="course-builder-two-sections">
            <RepeatSection
              title="مزایای حضور در رویداد"
              description="در حالت پیش‌فرض ۴ مورد فعال است و تا ۶ مورد می‌توانید اضافه کنید."
              error={errors.highlights}
              items={form.highlights}
              fields={[
                { name: "title", label: "تیتر" },
                { name: "description", label: "توضیح کوتاه" },
              ]}
              maxCount={6}
              minCount={1}
              emptyItem={EMPTY_BENEFIT}
              listName="highlights"
              onUpdate={updateListItem}
              onAdd={addListItem}
              onRemove={removeListItem}
            />
            <RepeatSection
              title="جدول زمان‌بندی برنامه‌ها"
              description="برای هر برنامه ساعت، عنوان و توضیح وارد کنید. این بخش در صفحه رویداد به صورت تایم‌لاین نمایش داده می‌شود."
              error={errors.agenda}
              items={form.agenda}
              fields={[
                { name: "time", label: "ساعت", type: "time" },
                { name: "title", label: "عنوان کوتاه" },
                { name: "description", label: "توضیح کوتاه" },
              ]}
              maxCount={20}
              minCount={1}
              emptyItem={EMPTY_AGENDA}
              listName="agenda"
              onUpdate={updateListItem}
              onAdd={addListItem}
              onRemove={removeListItem}
            />
          </div>
        )}

        {stepIndex === 4 && (
          <div className="course-builder-two-sections">
            <RepeatSection
              title="سخنرانان و اعضای پنل"
              description="در حالت پیش‌فرض ۳ مورد وجود دارد و تا ۸ نفر قابل ثبت است."
              error={errors.speakers}
              items={form.speakers}
              fields={[
                { name: "name", label: "نام" },
                { name: "role", label: "سمت" },
              ]}
              maxCount={8}
              minCount={1}
              emptyItem={EMPTY_INSTRUCTOR}
              listName="speakers"
              onUpdate={updateListItem}
              onAdd={addListItem}
              onRemove={removeListItem}
            />
            <RepeatSection
              title="پرسش‌های متداول رویداد"
              description="این بخش بازشونده است. ۳ مورد پیش‌فرض دارد و تا ۱۰ مورد قابل اضافه کردن است."
              error={errors.faqs}
              items={form.faqs}
              fields={[
                { name: "question", label: "سؤال" },
                { name: "answer", label: "پاسخ" },
              ]}
              maxCount={10}
              minCount={1}
              emptyItem={EMPTY_FAQ}
              listName="faqs"
              onUpdate={updateListItem}
              onAdd={addListItem}
              onRemove={removeListItem}
            />
          </div>
        )}

        {stepIndex === 5 && (
          <div className="instructor-create__review">
            <article className="instructor-create__review-card">
              <img src={form.image || bannerImage} alt={form.title} />
              <div>
                <span>مرور نهایی رویداد</span>
                <h4>{form.title || "عنوان رویداد"}</h4>
                <p>{form.summary || "توضیحات خلاصه رویداد"}</p>
                <ul>
                  <li>تاریخ برگزاری: {displayDate(form.eventDate)}</li>
                  <li>
                    ساعت برگزاری: {displayTime(form.startTime)} تا{" "}
                    {displayTime(form.endTime)}
                  </li>
                  <li>
                    ظرفیت:{" "}
                    {form.capacity
                      ? `${toPersianNumber(form.capacity)} نفر`
                      : "تعیین نشده"}
                  </li>
                  <li>دبیر رویداد: {form.secretaryName || "تعیین نشده"}</li>
                  <li>برگزارکننده: {form.organizer || "تعیین نشده"}</li>
                </ul>
              </div>
            </article>
            <div className="instructor-create__notice">
              این رویداد برای تایید به دبیرخانه ارسال خواهد شد و بعد از تایید
              نهایی منتشر می‌شود.
            </div>
          </div>
        )}

        <div className="instructor-create__actions">
          <button
            type="button"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
          >
            مرحله قبل
          </button>
          {!isLastStep && (
            <button type="button" onClick={goNext}>
              مرحله بعد
            </button>
          )}
          {isLastStep && (
            <button type="button" onClick={submitEvent}>
              ثبت نهایی رویداد
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function CreateNewPanel({ onSubmitActivity }) {
  const [selectedType, setSelectedType] = useState("");
  const [builderType, setBuilderType] = useState("");

  if (builderType === "course") {
    return <CreateCoursePanel onSubmitActivity={onSubmitActivity} />;
  }

  if (builderType === "event") {
    return <CreateEventPanel onSubmitActivity={onSubmitActivity} />;
  }

  return (
    <section className="instructor-create instructor-create-choice">
      <div className="instructor-create__panel">
        <header className="instructor-create__header instructor-create__header--stacked">
          <div>
            <span>ساخت جدید</span>
            <h3>نوع محتوایی را که می‌خواهید بسازید انتخاب کنید</h3>
            <p>
              ابتدا مشخص کنید محتوای جدید دوره است یا رویداد؛ سپس با دکمه مرحله
              بعد وارد فرم مرحله‌ای می‌شوید.
            </p>
          </div>
        </header>

        <div className="instructor-create-choice__grid">
          <button
            type="button"
            className={
              selectedType === "course"
                ? "instructor-create-choice__card instructor-create-choice__card--active"
                : "instructor-create-choice__card"
            }
            onClick={() => setSelectedType("course")}
          >
            <span>🎓</span>
            <strong>ساخت دوره جدید</strong>
            <small>
              ثبت دوره آموزشی، سرفصل‌ها، مدرسان، مزایا و سوالات متداول
            </small>
          </button>

          <button
            type="button"
            className={
              selectedType === "event"
                ? "instructor-create-choice__card instructor-create-choice__card--active"
                : "instructor-create-choice__card"
            }
            onClick={() => setSelectedType("event")}
          >
            <span>📅</span>
            <strong>ساخت رویداد جدید</strong>
            <small>
              ثبت رویداد، زمان‌بندی، سخنرانان، مزایا و پرسش‌های متداول
            </small>
          </button>
        </div>

        <div className="instructor-create__actions instructor-create__actions--start">
          <button
            type="button"
            disabled={!selectedType}
            onClick={() => setBuilderType(selectedType)}
          >
            مرحله بعد
          </button>
        </div>
      </div>
    </section>
  );
}

function RepeatSection({
  title,
  description,
  error,
  items,
  fields,
  maxCount,
  minCount,
  emptyItem,
  listName,
  onUpdate,
  onAdd,
  onRemove,
}) {
  return (
    <SectionBlock
      title={title}
      description={description}
      action={
        <button
          type="button"
          className="course-builder-add-button"
          disabled={items.length >= maxCount}
          onClick={() => onAdd(listName, emptyItem, maxCount)}
        >
          + افزودن
        </button>
      }
    >
      {error && (
        <small className="instructor-create__error instructor-create__error--block">
          {error}
        </small>
      )}
      <div className="course-builder-repeat-list">
        {items.map((item, index) => (
          <article
            className="course-builder-repeat-card"
            key={`${listName}-${index}`}
          >
            <header>
              <strong>{toPersianNumber(index + 1)}</strong>
              <button
                type="button"
                disabled={items.length <= minCount}
                onClick={() => onRemove(listName, index, minCount)}
              >
                حذف
              </button>
            </header>
            <div className="course-builder-repeat-card__grid">
              {fields.map((field) => (
                <label key={field.name}>
                  <span>{field.label}</span>
                  {field.name === "description" || field.name === "answer" ? (
                    <textarea
                      value={item[field.name]}
                      onChange={(event) =>
                        onUpdate(
                          listName,
                          index,
                          field.name,
                          event.target.value,
                        )
                      }
                    />
                  ) : field.type === "time" ? (
                    <input
                      inputMode="numeric"
                      dir="ltr"
                      placeholder="08:30"
                      value={item[field.name]}
                      onChange={(event) =>
                        onUpdate(
                          listName,
                          index,
                          field.name,
                          event.target.value,
                        )
                      }
                    />
                  ) : (
                    <input
                      value={item[field.name]}
                      onChange={(event) =>
                        onUpdate(
                          listName,
                          index,
                          field.name,
                          event.target.value,
                        )
                      }
                    />
                  )}
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SectionBlock>
  );
}

function CompactProgramList({ title, subtitle, items, emptyText, typeLabel }) {
  return (
    <div className="instructor-dashboard__panel-card instructor-dashboard__compact-panel">
      <div className="instructor-dashboard__panel-head">
        <div>
          <span>{typeLabel}</span>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="instructor-dashboard__compact-programs">
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>
                  {displayDate(item.startDate || item.eventDate)} /{" "}
                  {item.secondaryStatus}
                </span>
              </div>
              <small>{toPersianNumber(item.capacity || "۰")} نفر</small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="instructor-dashboard__empty-text">{emptyText}</p>
      )}
    </div>
  );
}

function DashboardWorkbench({ activities, onCreateCourse }) {
  const pendingCount = activities.filter(
    (item) => item.status === "در انتظار تایید",
  ).length;
  const activeCount = activities.filter(
    (item) =>
      item.status === "منتشر شده" &&
      ["در حال ثبت نام", "در حال برگزاری"].includes(item.secondaryStatus),
  ).length;

  const workItems = [
    {
      title: "ساخت برنامه جدید",
      meta: "شروع ساخت دوره یا رویداد جدید",
      action: "شروع ساخت",
      onClick: onCreateCourse,
    },
    {
      title: "پیگیری تایید دبیرخانه",
      meta: `${toPersianNumber(pendingCount)} برنامه در انتظار تایید است`,
      action: "مشاهده وضعیت",
      onClick: null,
    },
    {
      title: "بررسی برنامه‌های فعال",
      meta: `${toPersianNumber(activeCount)} برنامه فعال برای مدیریت دارید`,
      action: "مرور سریع",
      onClick: null,
    },
  ];

  return (
    <div className="instructor-dashboard__panel-card instructor-dashboard__workbench">
      <div className="instructor-dashboard__panel-head">
        <div>
          <span>میزکار</span>
          <h3>کارهای سریع مدرس/رویدادگر</h3>
          <p>دسترسی سریع به کارهایی که بیشتر در این نقش انجام می‌دهید.</p>
        </div>
      </div>

      <div className="instructor-dashboard__workbench-list">
        {workItems.map((item) => (
          <article key={item.title}>
            <div>
              <h4>{item.title}</h4>
              <p>{item.meta}</p>
            </div>
            <button
              type="button"
              onClick={item.onClick || undefined}
              disabled={!item.onClick}
            >
              {item.action}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function DashboardCalendar({ activities }) {
  const reminders = activities
    .filter((item) => item.status === "منتشر شده")
    .slice(0, 4)
    .map((item, index) => ({
      id: item.id,
      title: item.title,
      date: item.startDate || item.eventDate || "1405/04/01",
      time: item.startTime || item.eventStartTime || "10:00",
      type: index % 2 === 0 ? "شروع" : "ثبت‌نام",
    }));

  return (
    <div className="instructor-dashboard__panel-card instructor-dashboard__calendar">
      <div className="instructor-dashboard__panel-head">
        <div>
          <span>تقویم</span>
          <h3>زمان‌بندی‌های نزدیک</h3>
        </div>
      </div>

      {reminders.length > 0 ? (
        <ul className="instructor-dashboard__calendar-list">
          {reminders.map((item) => (
            <li key={item.id}>
              <span>{item.type}</span>
              <div>
                <strong>{item.title}</strong>
                <small>
                  {displayDate(item.date)} - ساعت {displayTime(item.time)}
                </small>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="instructor-dashboard__empty-text">
          رویداد زمانی نزدیک ثبت نشده است.
        </p>
      )}
    </div>
  );
}

function DashboardPanel({ activities, onCreateCourse }) {
  const currentCourses = activities.filter(
    (item) =>
      item.type === "course" &&
      item.status === "منتشر شده" &&
      ["در حال ثبت نام", "در حال برگزاری"].includes(item.secondaryStatus),
  );
  const currentEvents = activities.filter(
    (item) =>
      item.type === "event" &&
      item.status === "منتشر شده" &&
      ["در حال ثبت نام", "در حال برگزاری"].includes(item.secondaryStatus),
  );
  const completedCourses = activities.filter(
    (item) => item.type === "course" && item.secondaryStatus === "برگزار شده",
  ).length;
  const completedEvents = activities.filter(
    (item) => item.type === "event" && item.secondaryStatus === "برگزار شده",
  ).length;
  const publishedActivities = activities.filter(
    (item) => item.status === "منتشر شده",
  ).length;
  const registrations = activities.reduce((total, activity) => {
    if (activity.status !== "منتشر شده") {
      return total;
    }

    return total + getActivityRegistrationStats(activity).total;
  }, 0);

  const stats = [
    {
      label: "ثبت‌نامی‌ها",
      value: registrations,
      hint: "مجموع ثبت‌نام‌کنندگان برنامه‌های منتشرشده",
    },
    {
      label: "دوره‌های برگزارشده",
      value: completedCourses,
      hint: "دوره‌هایی که وضعیت برگزار شده دارند",
    },
    {
      label: "رویدادهای برگزارشده",
      value: completedEvents,
      hint: "رویدادهایی که وضعیت برگزار شده دارند",
    },
    {
      label: "برنامه‌های منتشرشده",
      value: publishedActivities,
      hint: "دوره‌ها و رویدادهای منتشرشده",
    },
  ];

  return (
    <section className="instructor-dashboard__dashboard">
      <div className="reviewer-dashboard__stats-grid">
        {stats.map((item) => (
          <article className="reviewer-dashboard__stat-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{toPersianNumber(item.value)}</strong>
            <p>{item.hint}</p>
          </article>
        ))}
      </div>

      <div className="instructor-dashboard__home-layout">
        <div className="instructor-dashboard__home-left">
          <CompactProgramList
            title="دوره‌های جاری"
            subtitle="دوره‌هایی که اکنون ثبت‌نام فعال دارند یا در حال برگزاری‌اند."
            items={currentCourses}
            emptyText="دوره جاری فعالی وجود ندارد."
            typeLabel="دوره‌ها"
          />
          <CompactProgramList
            title="رویدادهای جاری"
            subtitle="رویدادهایی که اکنون ثبت‌نام فعال دارند یا در حال برگزاری‌اند."
            items={currentEvents}
            emptyText="رویداد جاری فعالی وجود ندارد."
            typeLabel="رویدادها"
          />
        </div>

        <div className="instructor-dashboard__home-right">
          <DashboardWorkbench
            activities={activities}
            onCreateCourse={onCreateCourse}
          />
          <DashboardCalendar activities={activities} />
        </div>
      </div>
    </section>
  );
}

function ActivitiesListPanel({ type, activities, onManageActivity }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [draftFromDate, setDraftFromDate] = useState("");
  const [draftToDate, setDraftToDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const list = activities
    .filter((item) => item.type === type)
    .filter((item) =>
      statusFilter === "all" ? true : item.status === statusFilter,
    )
    .filter((item) => isDateInRange(item, fromDate, toDate));

  const typeLabel = type === "course" ? "دوره" : "رویداد";
  const dateFilterLabel =
    fromDate || toDate
      ? `${fromDate || "شروع"} تا ${toDate || "پایان"}`
      : "بازه تاریخ برگزاری";

  const applyDateFilter = () => {
    setFromDate(draftFromDate.trim());
    setToDate(draftToDate.trim());
    setIsDatePickerOpen(false);
  };

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setDraftFromDate("");
    setDraftToDate("");
    setIsDatePickerOpen(false);
  };

  return (
    <section className="instructor-activities">
      <div className="instructor-dashboard__panel-card">
        <div className="instructor-dashboard__panel-head">
          <div>
            <span>{typeLabel}‌ها</span>
            <h3>لیست {typeLabel}‌های ثبت‌شده</h3>
            <p>
              موارد در انتظار تایید فقط قابل مشاهده و پیش‌نمایش هستند. مدیریت
              بعد از انتشار فعال می‌شود.
            </p>
          </div>
        </div>
        <div className="instructor-activity-filters">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">همه</option>
            <option value="در انتظار تایید">در انتظار بررسی</option>
            <option value="منتشر شده">منتشر شده</option>
            <option value="رد شده">رد شده</option>
          </select>

          <div className="instructor-date-filter">
            <button
              type="button"
              className={
                fromDate || toDate
                  ? "instructor-date-filter__trigger instructor-date-filter__trigger--active"
                  : "instructor-date-filter__trigger"
              }
              onClick={() => setIsDatePickerOpen((current) => !current)}
            >
              <span>📅</span>
              {dateFilterLabel}
            </button>
            {isDatePickerOpen && (
              <div className="instructor-date-filter__popover">
                <label>
                  <span>از تاریخ</span>
                  <input
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="1404/02/06"
                    value={draftFromDate}
                    onChange={(event) => setDraftFromDate(event.target.value)}
                  />
                </label>
                <label>
                  <span>تا تاریخ</span>
                  <input
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="1404/03/17"
                    value={draftToDate}
                    onChange={(event) => setDraftToDate(event.target.value)}
                  />
                </label>
                <button type="button" onClick={applyDateFilter}>
                  اعمال فیلتر
                </button>
              </div>
            )}
          </div>

          {(fromDate || toDate) && (
            <button
              type="button"
              className="instructor-date-filter__clear"
              onClick={clearDateFilter}
            >
              ✕ حذف فیلتر تاریخ
            </button>
          )}
        </div>
        {list.length > 0 ? (
          <div className="instructor-activities__grid">
            {list.map((item) => (
              <ActivityCard
                key={item.id}
                item={item}
                typeLabel={typeLabel}
                onManageActivity={onManageActivity}
              />
            ))}
          </div>
        ) : (
          <p className="instructor-dashboard__empty-text">
            موردی مطابق فیلترها پیدا نشد.
          </p>
        )}
      </div>
    </section>
  );
}

function ActivityCard({ item, typeLabel, onManageActivity }) {
  const canManage = item.status === "منتشر شده";
  const registrationStats = getActivityRegistrationStats(item);
  return (
    <article
      className={`instructor-activity-card instructor-activity-card--${getStatusClass(item.status)}`}
    >
      <div className="instructor-activity-card__media">
        <img src={item.image || bannerImage} alt={item.title} />
        <span>{item.status}</span>
      </div>
      <div className="instructor-activity-card__body">
        <div className="instructor-activity-card__head">
          <span>{typeLabel}</span>
          <button
            type="button"
            className="instructor-activity-card__preview"
            onClick={() =>
              item.type === "event"
                ? openEventPreview(item)
                : openCoursePreview(item)
            }
            title="پیش‌نمایش"
            aria-label="پیش‌نمایش"
          >
            <EyeIcon />
          </button>
        </div>
        <h4>{item.title}</h4>
        <p>{item.summary}</p>
        <div className="instructor-activity-card__meta">
          <span>شروع: {displayDate(item.startDate || item.eventDate)}</span>
          <span>
            ظرفیت:{" "}
            {item.capacity
              ? `${toPersianNumber(item.capacity)} نفر`
              : "تعیین نشده"}
          </span>
          {item.status === "منتشر شده" && (
            <span>ثبت‌نام: {toPersianNumber(registrationStats.total)} نفر</span>
          )}
          {item.status === "منتشر شده" && item.secondaryStatus && (
            <span>وضعیت: {item.secondaryStatus}</span>
          )}
        </div>
        {item.status === "رد شده" && item.statusFeedback && (
          <div className="instructor-activity-card__feedback">
            <strong>علت رد شدن:</strong>
            <p>{item.statusFeedback}</p>
          </div>
        )}
        <button
          type="button"
          className="instructor-activity-card__manage"
          disabled={!canManage}
          onClick={() => canManage && onManageActivity(item)}
          title={
            canManage
              ? `مشاهده مدیریت ${typeLabel}`
              : "مدیریت بعد از انتشار فعال می‌شود"
          }
        >
          {canManage ? `مدیریت ${typeLabel}` : "مدیریت غیرفعال"}
        </button>
      </div>
    </article>
  );
}

const SAMPLE_PARTICIPANTS = [
  {
    id: 1,
    name: "سارا احمدی",
    email: "sara.ahmadi@example.com",
    mobile: "09121234567",
    level: "فناور",
    registeredAt: "1404/02/21 - ساعت 10:20",
  },
  {
    id: 2,
    name: "علی رضایی",
    email: "ali.rezaei@example.com",
    mobile: "09127654321",
    level: "همکار تجاری",
    registeredAt: "1404/02/22 - ساعت 12:35",
  },
  {
    id: 3,
    name: "مهدیه سیفی",
    email: "mahdiyeh.seyfi@example.com",
    mobile: "09124567890",
    level: "مدرس",
    registeredAt: "1404/02/23 - ساعت 09:15",
  },
  {
    id: 4,
    name: "حسین کریمی",
    email: "hossein.karimi@example.com",
    mobile: "09129876543",
    level: "پژوهشگر",
    registeredAt: "1404/02/24 - ساعت 16:00",
  },
  {
    id: 5,
    name: "الهام محمدی",
    email: "elham.mohammadi@example.com",
    mobile: "09125554433",
    level: "دانشجو",
    registeredAt: "1404/02/25 - ساعت 11:45",
  },
  {
    id: 6,
    name: "نیما کاظمی",
    email: "nima.kazemi@example.com",
    mobile: "09126667788",
    level: "مدیر",
    registeredAt: "1404/02/26 - ساعت 14:30",
  },
];

function ActivityManagementPanel({ activity, onBack }) {
  if (!activity) {
    return (
      <PlaceholderPanel
        title="مدیریت"
        description="هیچ موردی برای مدیریت انتخاب نشده است."
      />
    );
  }

  const registrationStats = getActivityRegistrationStats(activity);
  const participants = getActivityRegistrationsByActivityId(activity.id);
  const capacity = registrationStats.capacity;
  const remainingCapacity = registrationStats.remaining ?? 0;
  const typeLabel = activity.type === "event" ? "رویداد" : "دوره";

  return (
    <section className="instructor-management">
      <div className="instructor-dashboard__panel-card">
        <div className="instructor-dashboard__panel-head">
          <div>
            <span>مدیریت {typeLabel}</span>
            <h3>{activity.title}</h3>
            <p>
              این بخش فقط برای مشاهده ثبت‌نام‌کنندگان و ظرفیت باقی‌مانده طراحی
              شده است.
            </p>
          </div>
          <button
            type="button"
            className="instructor-create__action--neutral"
            onClick={onBack}
          >
            بازگشت
          </button>
        </div>

        <div className="instructor-management__stats">
          <article>
            <span>ثبت‌نام‌شده</span>
            <strong>{toPersianNumber(registrationStats.total)}</strong>
            <p>تعداد افراد ثبت‌نام‌کرده</p>
          </article>
          <article>
            <span>ظرفیت باقی‌مانده</span>
            <strong>{toPersianNumber(remainingCapacity)}</strong>
            <p>از {capacity ? toPersianNumber(capacity) : "ظرفیت نامحدود"}</p>
          </article>
          <article>
            <span>وضعیت اجرا</span>
            <strong>{activity.secondaryStatus || "منتشر شده"}</strong>
            <p>وضعیت فعلی {typeLabel}</p>
          </article>
        </div>

        <div className="instructor-management__table-wrap">
          <table className="instructor-management__table">
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام</th>
                <th>ایمیل</th>
                <th>شماره موبایل</th>
                <th>سطح کاربری</th>
                <th>زمان ثبت‌نام</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((person, index) => (
                <tr key={person.id}>
                  <td>
                    <span className="instructor-management__row-number">
                      {toPersianNumber(index + 1)}
                    </span>
                  </td>
                  <td>{person.fullName}</td>
                  <td dir="ltr">{person.email || "ثبت نشده"}</td>
                  <td dir="ltr">{person.mobile || "ثبت نشده"}</td>
                  <td>{person.roleLabel || "کاربر عمومی"}</td>
                  <td>{person.registeredAt}</td>
                </tr>
              ))}
              {participants.length === 0 && (
                <tr>
                  <td colSpan="6">
                    هنوز ثبت‌نامی برای این برنامه انجام نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function OrderCard({ order, onAcceptOrder }) {
  const canAccept =
    order.status === "جدید" || order.status === "در انتظار پذیرش";
  const orderDescription =
    order.description || order.summary || "توضیحی برای این سفارش ثبت نشده است.";
  const orderCategory = order.category || order.subject || "سفارش اجرا";
  const orderDeadline =
    order.deadline ||
    `${order.deadlineDate || "بدون تاریخ"}${order.deadlineTime ? ` - ساعت ${order.deadlineTime}` : ""}`;

  return (
    <article
      className={`instructor-order-card instructor-order-card--${canAccept ? "new" : order.status === "قبول شده" ? "accepted" : "archived"}`}
    >
      <div className="instructor-order-card__main">
        <div className="instructor-order-card__topline">
          <span>{order.subject}</span>
          <small>{order.status}</small>
        </div>
        <h4>{order.title}</h4>
        <p>{orderDescription}</p>
        <div className="instructor-order-card__meta">
          <span>موضوع: {orderCategory}</span>
          <span>مهلت: {orderDeadline}</span>
          <span>ثبت سفارش: {order.createdAt}</span>
          {order.acceptedAt && <span>زمان پذیرش: {order.acceptedAt}</span>}
          {order.completedAt && <span>تاریخ تکمیل: {order.completedAt}</span>}
        </div>
      </div>
      {canAccept ? (
        <button type="button" onClick={() => onAcceptOrder(order.id)}>
          قبول این سفارش
        </button>
      ) : (
        <button type="button" disabled>
          {order.status === "قبول شده" ? "قبول شده" : "آرشیو شده"}
        </button>
      )}
    </article>
  );
}

function ExecutionOrdersPanel({ mode, orders, onAcceptOrder }) {
  const filteredOrders = orders.filter((order) => {
    if (mode === "accepted-orders") return order.status === "قبول شده";
    if (mode === "new-orders")
      return order.status === "جدید" || order.status === "در انتظار پذیرش";
    return true;
  });

  const panelInfo = {
    "accepted-orders": {
      eyebrow: "سفارش‌های پذیرفته‌شده",
      title: "سفارش‌های قبول شده",
      description:
        "سفارش‌هایی که پذیرفته‌اید اینجا نمایش داده می‌شوند تا بعداً برای ساخت دوره یا رویداد از آن‌ها استفاده کنید.",
      empty: "هنوز سفارشی را قبول نکرده‌اید.",
    },
    "new-orders": {
      eyebrow: "سفارش‌های جدید مدیر",
      title: "سفارش‌های اجرای جدید",
      description:
        "مدیر می‌تواند سفارش ساخت یک دوره یا رویداد را ثبت کند. شما می‌توانید سفارش را بررسی و قبول کنید.",
      empty: "سفارش جدیدی برای شما ثبت نشده است.",
    },
    "orders-history": {
      eyebrow: "تاریخچه سفارش‌ها",
      title: "همه سفارش‌های اجرا",
      description:
        "در این بخش همه سفارش‌های جدید، پذیرفته‌شده و آرشیوشده به‌صورت فقط مشاهده نمایش داده می‌شوند.",
      empty: "تاریخچه‌ای برای سفارش‌ها وجود ندارد.",
    },
  }[mode] || {
    eyebrow: "سفارش‌های اجرا",
    title: "سفارش‌های اجرا",
    description: "لیست سفارش‌های اجرای دوره و رویداد.",
    empty: "سفارشی برای نمایش وجود ندارد.",
  };

  return (
    <section className="instructor-orders">
      <div className="instructor-dashboard__panel-card">
        <div className="instructor-dashboard__panel-head">
          <div>
            <span>{panelInfo.eyebrow}</span>
            <h3>{panelInfo.title}</h3>
            <p>{panelInfo.description}</p>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="instructor-orders__list">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAcceptOrder={onAcceptOrder}
              />
            ))}
          </div>
        ) : (
          <p className="instructor-dashboard__empty-text">{panelInfo.empty}</p>
        )}
      </div>
    </section>
  );
}

function ParticipantNotificationsPanel({ mode, activities }) {
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [noticeStatus, setNoticeStatus] = useState("");
  const [sentNotices, setSentNotices] = useState(() =>
    getActivityParticipantNotices(),
  );

  const isBroadcast = mode !== "targeted";
  const selectableActivities = activities.filter(
    (item) => item.status === "منتشر شده",
  );
  const selectedActivity = selectableActivities.find(
    (item) => item.id === selectedActivityId,
  );

  const recipientsCount = isBroadcast
    ? getBroadcastActivityNoticeRecipientsCount(selectableActivities)
    : getActivityNoticeRecipientsCount(selectedActivity);

  const sendNotice = (event) => {
    event.preventDefault();

    if (!noticeTitle.trim() || !noticeText.trim()) return;
    if (!isBroadcast && !selectedActivity) return;

    const result = sendActivityParticipantNotice({
      mode: isBroadcast ? "broadcast" : "targeted",
      activity: selectedActivity,
      activities: selectableActivities,
      title: noticeTitle.trim(),
      message: noticeText.trim(),
    });

    if (!result.success) {
      const messageMap = {
        missing_content: "تیتر و متن پیام را کامل وارد کنید.",
        missing_activity:
          "برای ارسال اطلاع‌رسانی، ابتدا یک برنامه منتشرشده انتخاب کنید.",
        no_recipients:
          "برای این برنامه هنوز ثبت‌نامی انجام نشده و پیامی ارسال نشد.",
      };

      setNoticeStatus(
        messageMap[result.reason] || "امکان ارسال اطلاع‌رسانی وجود ندارد.",
      );
      return;
    }

    setSentNotices(getActivityParticipantNotices());
    setNoticeTitle("");
    setNoticeText("");
    setSelectedActivityId("");
    setNoticeStatus(
      `پیام با موفقیت برای ${toPersianNumber(result.recipients.length)} نفر ارسال شد.`,
    );
  };

  const filteredNotifications = sentNotices.filter((notice) =>
    isBroadcast ? notice.mode === "broadcast" : notice.mode === "targeted",
  );

  return (
    <section className="instructor-notices">
      <div className="instructor-dashboard__panel-card">
        <div className="instructor-dashboard__panel-head">
          <div>
            <span>
              {isBroadcast ? "اطلاع‌رسانی همگانی" : "اطلاع‌رسانی موردی"}
            </span>
            <h3>اطلاع‌رسانی جدید</h3>
            <p>
              {isBroadcast
                ? "پیام برای همه کاربران ثبت‌نام‌شده در دوره‌ها و رویدادهای منتشرشده شما ارسال می‌شود."
                : "ابتدا یک دوره یا رویداد منتشرشده را انتخاب کنید؛ پیام فقط برای ثبت‌نام‌کنندگان همان برنامه ارسال می‌شود."}
            </p>
          </div>
        </div>

        <form className="instructor-notices__form" onSubmit={sendNotice}>
          {!isBroadcast && (
            <label>
              <span>انتخاب دوره یا رویداد</span>
              <select
                value={selectedActivityId}
                onChange={(event) => {
                  setSelectedActivityId(event.target.value);
                  setNoticeStatus("");
                }}
              >
                <option value="">انتخاب کنید</option>
                {selectableActivities.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.type === "event" ? "رویداد" : "دوره"} - {item.title}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            <span>تیتر پیام</span>
            <input
              value={noticeTitle}
              onChange={(event) => {
                setNoticeTitle(event.target.value);
                setNoticeStatus("");
              }}
              placeholder="مثلاً یادآوری جلسه بعد"
            />
          </label>

          <label className="instructor-notices__textarea">
            <span>متن پیام</span>
            <textarea
              value={noticeText}
              onChange={(event) => {
                setNoticeText(event.target.value);
                setNoticeStatus("");
              }}
              placeholder="متن اطلاع‌رسانی را وارد کنید..."
            />
          </label>

          <div className="instructor-notices__summary">
            <span>گیرندگان: {toPersianNumber(recipientsCount)} نفر</span>
            <button
              type="submit"
              disabled={
                !noticeTitle.trim() ||
                !noticeText.trim() ||
                (!isBroadcast && !selectedActivity) ||
                recipientsCount === 0
              }
            >
              ارسال پیام
            </button>
          </div>

          {noticeStatus && (
            <p className="instructor-dashboard__empty-text">{noticeStatus}</p>
          )}
        </form>
      </div>

      <div className="instructor-dashboard__panel-card">
        <div className="instructor-dashboard__panel-head">
          <div>
            <span>پیام‌های قبلی</span>
            <h3>لیست اطلاع‌رسانی‌های ارسال‌شده</h3>
          </div>
        </div>

        {filteredNotifications.length > 0 ? (
          <div className="instructor-notices__list">
            {filteredNotifications.map((notice) => (
              <article key={notice.id}>
                <div>
                  <span>{notice.target}</span>
                  <h4>{notice.title}</h4>
                  <p>{notice.message}</p>
                </div>
                <aside>
                  <strong>{toPersianNumber(notice.recipients)} نفر</strong>
                  <small>{notice.sentAt}</small>
                </aside>
              </article>
            ))}
          </div>
        ) : (
          <p className="instructor-dashboard__empty-text">
            هنوز پیامی ارسال نشده است.
          </p>
        )}
      </div>
    </section>
  );
}

function MessagesPanel({ onOpenTarget = () => {} }) {
  const [messages, setMessages] = useState(() =>
    getNotificationsForCurrentUser(),
  );
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setMessages(getNotificationsForCurrentUser());
  }, []);

  const refreshMessages = () => setMessages(getNotificationsForCurrentUser());

  const getMessageBucket = (message) => {
    const sourceType = String(message.sourceType || "");
    const category = String(message.category || "");

    if (sourceType === "support-ticket" || category.includes("پشتیبانی")) {
      return "support";
    }

    if (sourceType === "execution-order" || category.includes("سفارش")) {
      return "orders";
    }

    if (
      sourceType === "activity-participant-notice" ||
      sourceType === "activity-registration" ||
      sourceType === "instructor-activity" ||
      category.includes("دوره") ||
      category.includes("رویداد")
    ) {
      return "activities";
    }

    return "system";
  };

  const getMessageIcon = (message) => {
    const bucket = getMessageBucket(message);

    if (bucket === "support") return "🎧";
    if (bucket === "orders") return "📌";
    if (bucket === "activities") return "🎓";
    return "🔔";
  };

  const getMessageTargetLabel = (message) => {
    const bucket = getMessageBucket(message);

    if (bucket === "support") return "رفتن به درخواست‌ها و پشتیبانی";
    if (bucket === "orders") return "رفتن به سفارش‌های اجرا";
    if (bucket === "activities") return "رفتن به دوره‌ها و رویدادها";
    return "مشاهده در مرکز پیام";
  };

  const selectedMessage = messages.find(
    (message) => message.id === selectedMessageId,
  );

  const unreadCount = messages.filter((message) => !message.isRead).length;
  const importantCount = messages.filter(
    (message) => message.isImportant,
  ).length;
  const supportCount = messages.filter(
    (message) => getMessageBucket(message) === "support",
  ).length;
  const activityCount = messages.filter(
    (message) => getMessageBucket(message) === "activities",
  ).length;
  const orderCount = messages.filter(
    (message) => getMessageBucket(message) === "orders",
  ).length;

  const filteredMessages = messages.filter((message) => {
    if (filter === "unread") return !message.isRead;
    if (filter === "important") return message.isImportant;
    if (filter === "support") return getMessageBucket(message) === "support";
    if (filter === "activities")
      return getMessageBucket(message) === "activities";
    if (filter === "orders") return getMessageBucket(message) === "orders";
    return true;
  });

  const openMessage = (messageId) => {
    markNotificationAsRead(messageId);
    setMessages(getNotificationsForCurrentUser());
    setSelectedMessageId(messageId);
  };

  const closeMessage = () => setSelectedMessageId(null);

  const markAllAsRead = () => {
    setMessages(markAllNotificationsAsReadForCurrentUser());
  };

  const deleteMessage = (messageId) => {
    deleteNotification(messageId);
    setMessages(getNotificationsForCurrentUser());
    if (selectedMessageId === messageId) setSelectedMessageId(null);
  };

  const deleteAllMessages = () => {
    const confirmed = window.confirm("آیا از حذف همه پیام‌ها مطمئن هستید؟");
    if (!confirmed) return;
    deleteAllNotificationsForCurrentUser();
    setMessages([]);
    setSelectedMessageId(null);
  };

  const openMessageTarget = (message) => {
    markNotificationAsRead(message.id);
    refreshMessages();
    onOpenTarget(message);
  };

  if (selectedMessage) {
    return (
      <section className="messages-panel">
        <div className="messages-panel__panel">
          <div className="messages-panel__panel-header">
            <div>
              <span>{selectedMessage.category}</span>
              <h3>{selectedMessage.title}</h3>
              <p>{selectedMessage.sentAt}</p>
            </div>

            <button
              type="button"
              className="messages-panel__back-button"
              onClick={closeMessage}
            >
              بازگشت به پیام‌ها
            </button>
          </div>

          <article className="messages-panel__detail-card">
            <div className="messages-panel__title-row">
              <span aria-hidden="true">{getMessageIcon(selectedMessage)}</span>
              {selectedMessage.isImportant && (
                <span className="messages-panel__important-badge">مهم</span>
              )}
              <span className="messages-panel__filter-count">
                {selectedMessage.isRead ? "خوانده‌شده" : "جدید"}
              </span>
            </div>
            <p>{selectedMessage.body}</p>
            <div className="messages-panel__card-actions">
              <button
                type="button"
                onClick={() => openMessageTarget(selectedMessage)}
              >
                {getMessageTargetLabel(selectedMessage)}
              </button>
              <button
                type="button"
                className="messages-panel__remove-message"
                onClick={() => deleteMessage(selectedMessage.id)}
                aria-label={`حذف پیام ${selectedMessage.title}`}
                title="حذف پیام"
              >
                ×
              </button>
            </div>
          </article>
        </div>
      </section>
    );
  }

  const filterItems = [
    { id: "all", label: "همه پیام‌ها", count: messages.length },
    { id: "unread", label: "خوانده‌نشده", count: unreadCount },
    { id: "important", label: "مهم", count: importantCount },
    { id: "activities", label: "دوره‌ها و رویدادها", count: activityCount },
    { id: "orders", label: "سفارش‌های اجرا", count: orderCount },
    { id: "support", label: "پشتیبانی", count: supportCount },
  ];

  return (
    <section className="messages-panel">
      <div className="messages-panel__panel">
        <div className="messages-panel__panel-header">
          <div>
            <span>پیام‌ها و اعلانات</span>
            <h3>مرکز پیام‌های مدرس</h3>
            <p>
              اعلان‌های مربوط به دوره‌ها، رویدادها، ثبت‌نام‌کنندگان، سفارش‌های
              اجرا و درخواست‌های پشتیبانی در این بخش مدیریت می‌شوند.
            </p>
          </div>

          <div className="messages-panel__header-actions">
            <button type="button" onClick={refreshMessages}>
              به‌روزرسانی
            </button>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              خواندن همه
            </button>
            <button
              type="button"
              className="messages-panel__delete-all-button"
              onClick={deleteAllMessages}
              aria-label="حذف همه پیام‌ها"
              title="حذف همه پیام‌ها"
              disabled={messages.length === 0}
            >
              🗑
            </button>
          </div>
        </div>

        <div className="messages-panel__filters">
          {filterItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                filter === item.id ? "messages-panel__filter--active" : ""
              }
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <span className="messages-panel__filter-count">
                {toPersianNumber(item.count)}
              </span>
            </button>
          ))}
        </div>

        <div className="messages-panel__list">
          {filteredMessages.map((message) => (
            <article
              className={`messages-panel__card ${message.isRead ? "messages-panel__card--read" : ""}`}
              key={message.id}
            >
              <div className="messages-panel__card-main">
                <div className="messages-panel__title-row">
                  <span aria-hidden="true">{getMessageIcon(message)}</span>
                  <h4>{message.title}</h4>
                  {!message.isRead && (
                    <span className="messages-panel__unread-badge">جدید</span>
                  )}
                  {message.isImportant && (
                    <span className="messages-panel__important-badge">مهم</span>
                  )}
                </div>
                <div className="messages-panel__meta">
                  <span>{message.category}</span>
                  <span>{message.sentAt}</span>
                </div>
              </div>

              <div className="messages-panel__card-actions">
                <button type="button" onClick={() => openMessage(message.id)}>
                  مشاهده
                </button>
                <button
                  type="button"
                  onClick={() => openMessageTarget(message)}
                >
                  بخش مربوطه
                </button>
                <button
                  type="button"
                  className="messages-panel__remove-message"
                  onClick={() => deleteMessage(message.id)}
                  aria-label={`حذف پیام ${message.title}`}
                  title="حذف پیام"
                >
                  ×
                </button>
              </div>
            </article>
          ))}

          {filteredMessages.length === 0 && (
            <div className="messages-panel__empty">
              پیامی برای این فیلتر وجود ندارد.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FaqPanel() {
  const categories = [
    "همه",
    ...new Set(FAQ_ITEMS.map((item) => item.category)),
  ];
  const [activeCategory, setActiveCategory] = useState("همه");
  const [searchTerm, setSearchTerm] = useState("");
  const [openQuestionId, setOpenQuestionId] = useState(
    FAQ_ITEMS[0]?.id || null,
  );

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "همه" || item.category === activeCategory;
    const matchesSearch =
      item.question.includes(searchTerm) || item.answer.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const toggleQuestion = (questionId) => {
    setOpenQuestionId((currentId) =>
      currentId === questionId ? null : questionId,
    );
  };

  return (
    <section className="faq-panel">
      <div className="faq-panel__panel">
        <div className="faq-panel__panel-header">
          <div>
            <span>سوالات متداول</span>
            <h3>راهنمای سریع استفاده از داشبورد</h3>
            <p>
              پاسخ سوالات پرتکرار درباره ساخت دوره، ساخت رویداد، سفارش‌ها،
              اطلاع‌رسانی و پشتیبانی.
            </p>
          </div>
        </div>

        <div className="faq-panel__tools">
          <label>
            <span>جست‌وجو در سوالات</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="عبارت موردنظر را وارد کنید..."
            />
          </label>

          <div className="faq-panel__categories">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  activeCategory === category
                    ? "faq-panel__category--active"
                    : ""
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="faq-panel__list">
          {filteredItems.map((item) => {
            const isOpen = openQuestionId === item.id;
            return (
              <article
                className={`faq-panel__item ${isOpen ? "faq-panel__item--open" : ""}`}
                key={item.id}
              >
                <button type="button" onClick={() => toggleQuestion(item.id)}>
                  <span>{item.category}</span>
                  <strong>{item.question}</strong>
                  <i>{isOpen ? "−" : "+"}</i>
                </button>
                {isOpen && <p>{item.answer}</p>}
              </article>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="faq-panel__empty">
              سوالی با این عبارت یا دسته‌بندی پیدا نشد.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RequestsPanel() {
  const [requests, setRequests] = useState(() =>
    getCurrentUserSupportTickets("مدرس"),
  );
  const [mode, setMode] = useState("list");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const refreshRequests = () => {
    setRequests(getCurrentUserSupportTickets("مدرس"));
  };

  useEffect(() => {
    refreshRequests();
  }, []);

  const selectedRequest = requests.find(
    (request) => String(request.id) === String(selectedRequestId),
  );

  const openNewRequest = () => {
    refreshRequests();
    setMode("new");
    setSelectedRequestId(null);
    setRequestTitle("");
    setRequestMessage("");
  };

  const openList = () => {
    refreshRequests();
    setMode("list");
    setSelectedRequestId(null);
    setRequestTitle("");
    setRequestMessage("");
  };

  const openRequest = (requestId) => {
    refreshRequests();
    setSelectedRequestId(requestId);
    setMode("view");
  };

  const deleteRequest = (requestId) => {
    const targetRequest = requests.find(
      (request) => String(request.id) === String(requestId),
    );

    if (!targetRequest || targetRequest.seenBySupport) return;

    const confirmed = window.confirm("آیا از حذف این درخواست مطمئن هستید؟");
    if (!confirmed) return;

    deleteSupportTicket(requestId);
    refreshRequests();

    if (String(selectedRequestId) === String(requestId)) {
      openList();
    }
  };

  const submitRequest = (event) => {
    event.preventDefault();
    if (!requestMessage.trim()) return;

    addSupportTicket(
      {
        title: requestTitle.trim() || "درخواست جدید مدرس",
        message: requestMessage.trim(),
      },
      "مدرس",
    );

    openList();
  };

  if (mode === "new") {
    return (
      <section className="support-requests">
        <div className="support-requests__panel">
          <div className="support-requests__panel-header">
            <div>
              <span>درخواست جدید</span>
              <h3>ثبت درخواست پشتیبانی</h3>
              <p>
                درخواست شما برای دبیرخانه ثبت می‌شود و پس از مشاهده توسط
                پشتیبان، امکان حذف آن وجود نخواهد داشت.
              </p>
            </div>
            <button
              type="button"
              className="support-requests__neutral-button"
              onClick={openList}
            >
              بازگشت به درخواست‌ها
            </button>
          </div>

          <form className="support-requests__form" onSubmit={submitRequest}>
            <label>
              <span>عنوان درخواست</span>
              <input
                type="text"
                value={requestTitle}
                onChange={(event) => setRequestTitle(event.target.value)}
                placeholder="مثلاً مشکل در نمایش ثبت‌نام‌کنندگان"
              />
            </label>
            <label>
              <span>متن درخواست</span>
              <textarea
                value={requestMessage}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="متن درخواست خود را وارد کنید..."
              />
            </label>
            <div className="support-requests__form-actions">
              <button
                type="button"
                className="support-requests__neutral-button"
                onClick={openList}
              >
                انصراف
              </button>
              <button type="submit" disabled={!requestMessage.trim()}>
                ثبت درخواست
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  if (mode === "view" && selectedRequest) {
    const canDelete = !selectedRequest.seenBySupport;
    const hasReply = Boolean(
      selectedRequest.supportReply || selectedRequest.reply,
    );

    return (
      <section className="support-requests">
        <div className="support-requests__panel">
          <div className="support-requests__panel-header">
            <div>
              <span>جزئیات درخواست</span>
              <h3>{selectedRequest.title}</h3>
              <p>{selectedRequest.sentAt}</p>
            </div>
            <button
              type="button"
              className="support-requests__neutral-button"
              onClick={openList}
            >
              بازگشت به درخواست‌ها
            </button>
          </div>

          <article className="support-requests__detail-card">
            <div className="support-requests__status-row">
              <span>{selectedRequest.status}</span>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => deleteRequest(selectedRequest.id)}
                >
                  حذف درخواست
                </button>
              )}
            </div>
            <p>{selectedRequest.message}</p>
            {hasReply ? (
              <div className="support-requests__reply-box">
                <strong>پاسخ پشتیبانی</strong>
                <p>{selectedRequest.supportReply || selectedRequest.reply}</p>
                <small>{selectedRequest.repliedAt}</small>
              </div>
            ) : (
              <div className="support-requests__reply-box support-requests__reply-box--empty">
                هنوز پاسخی برای این درخواست ثبت نشده است.
              </div>
            )}
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="support-requests">
      <div className="support-requests__panel">
        <div className="support-requests__panel-header">
          <div>
            <span>درخواست‌ها و پشتیبانی</span>
            <h3>تیکت‌های پشتیبانی</h3>
            <p>
              درخواست‌های پشتیبانی خود را ثبت و پاسخ‌های دبیرخانه را پیگیری
              کنید.
            </p>
          </div>
          <button type="button" onClick={openNewRequest}>
            ثبت درخواست جدید
          </button>
        </div>

        <div className="support-requests__list">
          {requests.length === 0 ? (
            <div className="support-requests__reply-box support-requests__reply-box--empty">
              هنوز درخواستی از طرف شما ثبت نشده است.
            </div>
          ) : (
            requests.map((request) => (
              <article
                className="support-requests__request-card"
                key={request.id}
              >
                <div>
                  <span>{request.status}</span>
                  <h4>{request.title}</h4>
                  <p>{request.message}</p>
                  <small>{request.sentAt}</small>
                </div>
                <div className="support-requests__actions">
                  <button type="button" onClick={() => openRequest(request.id)}>
                    مشاهده
                  </button>
                  {!request.seenBySupport && (
                    <button
                      type="button"
                      onClick={() => deleteRequest(request.id)}
                    >
                      حذف
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ProfileAvatar({ profile, size = "normal" }) {
  return profile.avatarPreview ? (
    <img
      className={`profile-panel__avatar profile-panel__avatar--${size}`}
      src={profile.avatarPreview}
      alt={`${profile.firstName} ${profile.lastName}`}
    />
  ) : (
    <span className={`profile-panel__avatar profile-panel__avatar--${size}`}>
      {profile.avatarLetter || profile.firstName?.[0] || "م"}
    </span>
  );
}

function ProfilePanel({ profile, onEdit }) {
  return (
    <section className="profile-panel">
      <div className="profile-panel__card profile-panel__hero-card">
        <ProfileAvatar profile={profile} size="large" />
        <div>
          <span>پروفایل کاربری</span>
          <h3>
            {profile.fullName ||
              `${profile.firstName || ""} ${profile.lastName || ""}`.trim()}
          </h3>
          <p>{profile.level}</p>
        </div>
        <button type="button" onClick={onEdit}>
          ویرایش پروفایل
        </button>
      </div>

      <div className="profile-panel__info-grid">
        <article>
          <span>نام و نام خانوادگی</span>
          <strong>
            {profile.fullName ||
              `${profile.firstName || ""} ${profile.lastName || ""}`.trim()}
          </strong>
        </article>
        <article>
          <span>شماره موبایل</span>
          <strong>{profile.mobile}</strong>
        </article>
        <article>
          <span>ایمیل</span>
          <strong>{profile.email}</strong>
        </article>
        <article>
          <span>سطح کاربری</span>
          <strong>{profile.level}</strong>
        </article>
        <article>
          <span>سابقه عضویت</span>
          <strong>
            عضو از سال {profile.memberSince} - به مدت{" "}
            {profile.membershipDuration}
          </strong>
        </article>
      </div>
    </section>
  );
}

function ProfileEditPanel({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState(profile);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const updateField = (field, value) =>
    setFormData((current) => ({ ...current, [field]: value }));
  const updatePasswordField = (field, value) =>
    setPasswordData((current) => ({ ...current, [field]: value }));

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateField("avatarPreview", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (
      passwordData.newPassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setMessage("رمز عبور جدید و تکرار آن یکسان نیست.");
      return;
    }
    const nextProfile = {
      ...formData,
      fullName:
        formData.fullName ||
        `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
      avatarLetter:
        formData.firstName?.[0] ||
        formData.fullName?.[0] ||
        profile.avatarLetter ||
        "م",
    };
    try {
      const savedProfile = onSave(nextProfile, passwordData);
      setFormData(savedProfile || nextProfile);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage(
        passwordData.newPassword
          ? "اطلاعات پروفایل و رمز عبور با موفقیت ذخیره شد."
          : "تغییرات پروفایل با موفقیت ذخیره شد.",
      );
    } catch (error) {
      setMessage(error?.message || "ذخیره تغییرات با خطا روبه‌رو شد.");
    }
  };

  return (
    <section className="profile-panel">
      <form className="profile-panel__edit-card" onSubmit={handleSubmit}>
        <div className="profile-panel__edit-header">
          <div>
            <span>ویرایش پروفایل</span>
            <h3>اطلاعات کاربری و رمز عبور</h3>
          </div>
          <button type="button" onClick={onCancel}>
            بازگشت به پروفایل
          </button>
        </div>

        <div className="profile-panel__avatar-edit">
          <ProfileAvatar profile={formData} size="large" />
          <label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
            تغییر تصویر پروفایل
          </label>
        </div>

        <div className="profile-panel__form-grid">
          <label>
            <span>نام</span>
            <input
              type="text"
              value={formData.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
          </label>
          <label>
            <span>نام خانوادگی</span>
            <input
              type="text"
              value={formData.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />
          </label>
          <label>
            <span>شماره موبایل</span>
            <input
              type="text"
              value={formData.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
            />
          </label>
          <label>
            <span>ایمیل</span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>
        </div>

        <div className="profile-panel__password-box">
          <div>
            <span>تغییر رمز عبور</span>
            <p>در صورت نیاز، رمز فعلی و رمز جدید را وارد کنید.</p>
          </div>
          <div className="profile-panel__form-grid">
            <label>
              <span>رمز عبور فعلی</span>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(event) =>
                  updatePasswordField("currentPassword", event.target.value)
                }
              />
            </label>
            <label>
              <span>رمز عبور جدید</span>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(event) =>
                  updatePasswordField("newPassword", event.target.value)
                }
              />
            </label>
            <label>
              <span>تکرار رمز عبور جدید</span>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(event) =>
                  updatePasswordField("confirmPassword", event.target.value)
                }
              />
            </label>
          </div>
        </div>

        <div className="profile-panel__form-actions">
          <button type="button" onClick={onCancel}>
            انصراف
          </button>
          <button type="submit">ذخیره تغییرات</button>
        </div>
        {message && <p className="profile-panel__message">{message}</p>}
      </form>
    </section>
  );
}

function PlaceholderPanel({ title, description }) {
  return (
    <section className="instructor-placeholder">
      <div className="instructor-dashboard__panel-card">
        <div className="instructor-dashboard__panel-head">
          <div>
            <span>در حال آماده‌سازی</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
        <div className="instructor-placeholder__box">
          طراحی جزئیات این بخش در مرحله بعدی انجام می‌شود.
        </div>
      </div>
    </section>
  );
}

function InstructorDashboardPage() {
  const navigate = useNavigate();
  const notificationMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [activities, setActivities] = useState(() =>
    getInstructorActivities(INITIAL_ACTIVITIES),
  );
  const [activeSection, setActiveSection] = useState("activities");
  const [activeSubItem, setActiveSubItem] = useState("create-new");
  const [openMenuId, setOpenMenuId] = useState("activities");
  const [contentResetKey, setContentResetKey] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [recentMessages, setRecentMessages] = useState(() =>
    getNotificationsForCurrentUser().slice(0, 5),
  );
  const [successNotice, setSuccessNotice] = useState("");
  const [executionOrders, setExecutionOrders] = useState(() =>
    getInstructorExecutionOrders(INITIAL_EXECUTION_ORDERS),
  );
  const [participantNotifications, setParticipantNotifications] = useState(
    INITIAL_PARTICIPANT_NOTIFICATIONS,
  );
  const [managedActivity, setManagedActivity] = useState(null);
  const [userProfile, setUserProfile] = useState(() =>
    getCurrentDashboardProfile(INITIAL_INSTRUCTOR_PROFILE),
  );

  const saveUserProfile = (nextProfile, passwordData = {}) => {
    const savedProfile = saveCurrentDashboardProfile(
      nextProfile,
      INITIAL_INSTRUCTOR_PROFILE,
    );
    setUserProfile(savedProfile);
    return savedProfile;
  };

  const currentSection = useMemo(
    () => SECTION_DATA[activeSection] || SECTION_DATA.dashboard,
    [activeSection],
  );
  const unreadMessagesCount = recentMessages.filter(
    (item) => !item.isRead,
  ).length;
  const resetCurrentContent = () =>
    setContentResetKey((current) => current + 1);
  const handleLogout = () => navigate("/auth");

  useEffect(() => {
    if (!successNotice) return undefined;
    const timer = window.setTimeout(() => setSuccessNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [successNotice]);

  useEffect(() => {
    setRecentMessages(getNotificationsForCurrentUser().slice(0, 5));
  }, []);

  useEffect(() => {
    if (activeSection === "execution-orders" || activeSection === "dashboard") {
      setExecutionOrders(
        getInstructorExecutionOrders(INITIAL_EXECUTION_ORDERS),
      );
    }
  }, [activeSection]);

  useEffect(() => {
    if (!isNotificationOpen && !isProfileMenuOpen) return undefined;

    const handleOutsideClick = (event) => {
      const target = event.target;
      const clickedInsideNotifications =
        notificationMenuRef.current?.contains(target);
      const clickedInsideProfile = profileMenuRef.current?.contains(target);

      if (!clickedInsideNotifications) {
        setIsNotificationOpen(false);
      }

      if (!clickedInsideProfile) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isNotificationOpen, isProfileMenuOpen]);

  const handleNavClick = (item) => {
    setManagedActivity(null);
    const hasSubItems = Boolean(item.subItems?.length);
    setActiveSection(item.id);
    resetCurrentContent();
    if (!hasSubItems) {
      setOpenMenuId("");
      setActiveSubItem("");
      return;
    }
    setOpenMenuId(openMenuId === item.id ? "" : item.id);
    setActiveSubItem(item.subItems[0].id);
  };

  const handleSubNavClick = (parentId, subItemId) => {
    setManagedActivity(null);
    setActiveSection(parentId);
    setActiveSubItem(subItemId);
    setOpenMenuId(parentId);
    resetCurrentContent();
  };

  const refreshRecentMessages = () => {
    setRecentMessages(getNotificationsForCurrentUser().slice(0, 5));
  };

  const markMessageAsRead = (messageId, event) => {
    event?.stopPropagation();
    markNotificationAsRead(messageId);
    refreshRecentMessages();
  };

  const markAllRecentMessagesAsRead = (event) => {
    event?.stopPropagation();
    markAllNotificationsAsReadForCurrentUser();
    refreshRecentMessages();
  };

  const openMessagesCenter = (event) => {
    event?.stopPropagation();
    setIsNotificationOpen(false);
    setActiveSection("messages");
    setActiveSubItem("");
    setOpenMenuId("");
    resetCurrentContent();
  };

  const openNotificationTarget = (message) => {
    markNotificationAsRead(message.id);
    refreshRecentMessages();
    setIsNotificationOpen(false);

    if (message.sourceType === "support-ticket") {
      setActiveSection("requests");
      setActiveSubItem("");
      setOpenMenuId("");
      resetCurrentContent();
      return;
    }

    if (message.sourceType === "execution-order") {
      setActiveSection("execution-orders");
      setActiveSubItem("new-orders");
      setOpenMenuId("execution-orders");
      resetCurrentContent();
      return;
    }

    if (
      message.sourceType === "activity-participant-notice" ||
      message.sourceType === "activity-registration" ||
      message.sourceType === "instructor-activity"
    ) {
      setActiveSection("activities");
      setActiveSubItem("courses");
      setOpenMenuId("activities");
      resetCurrentContent();
      return;
    }

    setActiveSection("messages");
    setActiveSubItem("");
    setOpenMenuId("");
    resetCurrentContent();
  };

  const onSubmitActivity = (activity) => {
    const savedActivity = addInstructorActivity(activity);

    setActivities(getInstructorActivities());
    setSuccessNotice(
      `${savedActivity.type === "event" ? "رویداد" : "دوره"} با موفقیت ثبت شد و برای بررسی دبیرخانه ارسال شد.`,
    );
    setActiveSection("activities");
    setActiveSubItem("create-new");
    setOpenMenuId("activities");
    resetCurrentContent();
  };

  const acceptExecutionOrder = (orderId) => {
    const confirmed = window.confirm(
      "بعد از قبول کردن این سفارش، امکان لغو آن وجود ندارد. آیا مطمئن هستید؟",
    );

    if (!confirmed) return;

    const acceptedOrder = acceptExecutionOrderInService(orderId);

    if (!acceptedOrder) {
      setSuccessNotice("سفارش موردنظر پیدا نشد یا قبلاً تغییر وضعیت داده است.");
      setExecutionOrders(
        getInstructorExecutionOrders(INITIAL_EXECUTION_ORDERS),
      );
      return;
    }

    setExecutionOrders(getInstructorExecutionOrders(INITIAL_EXECUTION_ORDERS));
    setSuccessNotice(
      "سفارش اجرا با موفقیت قبول شد و به سفارش‌های قبول شده منتقل شد.",
    );
    setActiveSection("execution-orders");
    setActiveSubItem("accepted-orders");
    setOpenMenuId("execution-orders");
    resetCurrentContent();
  };

  const openActivityManagement = (activity) => {
    setManagedActivity(activity);
    setActiveSection("activity-management");
    setActiveSubItem("");
    setOpenMenuId("activities");
    resetCurrentContent();
  };

  const openCreateCourse = () => {
    setActiveSection("activities");
    setActiveSubItem("create-new");
    setOpenMenuId("activities");
    resetCurrentContent();
  };

  const renderContent = () => {
    if (activeSection === "dashboard")
      return (
        <DashboardPanel
          key={`dashboard-${contentResetKey}`}
          activities={activities}
          onCreateCourse={openCreateCourse}
        />
      );
    if (activeSection === "activities" && activeSubItem === "create-new")
      return (
        <CreateNewPanel
          key={`create-${contentResetKey}`}
          onSubmitActivity={onSubmitActivity}
        />
      );
    if (activeSection === "activities" && activeSubItem === "courses")
      return (
        <ActivitiesListPanel
          key={`courses-${contentResetKey}`}
          type="course"
          activities={activities}
          onManageActivity={openActivityManagement}
        />
      );
    if (activeSection === "activities" && activeSubItem === "events")
      return (
        <ActivitiesListPanel
          key={`events-${contentResetKey}`}
          type="event"
          activities={activities}
          onManageActivity={openActivityManagement}
        />
      );
    if (activeSection === "execution-orders")
      return (
        <ExecutionOrdersPanel
          key={`orders-${activeSubItem}-${contentResetKey}`}
          mode={activeSubItem || "accepted-orders"}
          orders={executionOrders}
          onAcceptOrder={acceptExecutionOrder}
        />
      );
    if (activeSection === "participants")
      return (
        <ParticipantNotificationsPanel
          key={`participants-${activeSubItem}-${contentResetKey}`}
          mode={activeSubItem || "broadcast"}
          activities={activities}
          notifications={participantNotifications}
          setNotifications={setParticipantNotifications}
        />
      );
    if (activeSection === "activity-management")
      return (
        <ActivityManagementPanel
          key={`activity-management-${managedActivity?.id || contentResetKey}`}
          activity={managedActivity}
          onBack={() => {
            setActiveSection("activities");
            setActiveSubItem(
              managedActivity?.type === "event" ? "events" : "courses",
            );
            setOpenMenuId("activities");
          }}
        />
      );
    if (activeSection === "messages")
      return (
        <MessagesPanel
          key={`messages-${contentResetKey}`}
          onOpenTarget={openNotificationTarget}
        />
      );
    if (activeSection === "requests")
      return <RequestsPanel key={`requests-${contentResetKey}`} />;
    if (activeSection === "faq")
      return <FaqPanel key={`faq-${contentResetKey}`} />;
    if (activeSection === "profile")
      return (
        <ProfilePanel
          key={`profile-${contentResetKey}`}
          profile={userProfile}
          onEdit={() => setActiveSection("edit-profile")}
        />
      );
    if (activeSection === "edit-profile")
      return (
        <ProfileEditPanel
          key={`edit-profile-${contentResetKey}`}
          profile={userProfile}
          onSave={saveUserProfile}
          onCancel={() => setActiveSection("profile")}
        />
      );
    return (
      <PlaceholderPanel
        key={`placeholder-${contentResetKey}`}
        title={currentSection.title}
        description="جزئیات این بخش در مرحله بعدی طراحی خواهد شد."
      />
    );
  };

  return (
    <main
      className={`innovator-dashboard instructor-dashboard ${isSidebarCollapsed ? "innovator-dashboard--collapsed" : ""}`}
    >
      <aside className="innovator-dashboard__sidebar">
        <div className="innovator-dashboard__sidebar-top">
          <div className="innovator-dashboard__sidebar-head">
            <button
              type="button"
              className="innovator-dashboard__menu-button"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              aria-label="باز و بسته کردن منوی داشبورد"
            >
              <MenuIcon />
            </button>
            <Link to="/" className="innovator-dashboard__brand">
              <img src={universityLogo} alt="لوگوی دانشگاه تهران" />
              <div className="innovator-dashboard__brand-text">
                <strong>هاتف</strong>
              </div>
            </Link>
          </div>
          <nav className="innovator-dashboard__nav">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const hasSubItems = Boolean(item.subItems?.length);
              const isOpen = openMenuId === item.id;
              return (
                <div className="innovator-dashboard__nav-group" key={item.id}>
                  <button
                    type="button"
                    className={`innovator-dashboard__nav-item ${isActive ? "innovator-dashboard__nav-item--active" : ""}`}
                    onClick={() => handleNavClick(item)}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span className="innovator-dashboard__nav-icon">
                      {item.icon}
                    </span>
                    <span className="innovator-dashboard__nav-text">
                      {item.label}
                    </span>
                    {hasSubItems && !isSidebarCollapsed && (
                      <span className="innovator-dashboard__nav-chevron">
                        <ChevronIcon isOpen={isOpen} />
                      </span>
                    )}
                  </button>
                  {hasSubItems && !isSidebarCollapsed && (
                    <div
                      className={`innovator-dashboard__subnav ${isOpen ? "innovator-dashboard__subnav--open" : ""}`}
                    >
                      {item.subItems.map((subItem) => (
                        <button
                          type="button"
                          key={subItem.id}
                          className={`innovator-dashboard__subnav-item ${activeSubItem === subItem.id ? "innovator-dashboard__subnav-item--active" : ""}`}
                          onClick={() => handleSubNavClick(item.id, subItem.id)}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
      <section className="innovator-dashboard__main">
        <header className="innovator-dashboard__topbar">
          <div className="innovator-dashboard__topbar-title">
            <DashboardDateTime />
            <h1>{currentSection?.title || "داشبورد"}</h1>
          </div>
          <div className="innovator-dashboard__topbar-actions">
            <div
              className="innovator-dashboard__notification-menu"
              ref={notificationMenuRef}
            >
              <button
                type="button"
                className="innovator-dashboard__notification-trigger"
                onClick={() => {
                  refreshRecentMessages();
                  setIsNotificationOpen((current) => !current);
                  setIsProfileMenuOpen(false);
                }}
                aria-label="نمایش پیام‌های اخیر"
              >
                <BellIcon />
                {unreadMessagesCount > 0 && <span>{unreadMessagesCount}</span>}
              </button>
              {isNotificationOpen && (
                <div className="innovator-dashboard__notification-dropdown">
                  <div className="innovator-dashboard__notification-header">
                    <strong>پیام‌های اخیر</strong>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={openMessagesCenter}
                        title="رفتن به پیام‌ها و اعلانات"
                        style={{
                          width: "30px",
                          height: "30px",
                          border: "0",
                          borderRadius: "999px",
                          background: "#e8f8ff",
                          cursor: "pointer",
                        }}
                      >
                        📨
                      </button>
                      <button
                        type="button"
                        onClick={markAllRecentMessagesAsRead}
                        disabled={unreadMessagesCount === 0}
                        style={{
                          height: "30px",
                          border: "0",
                          borderRadius: "999px",
                          padding: "0 10px",
                          color: unreadMessagesCount ? "#0e7ca8" : "#64748b",
                          background: unreadMessagesCount
                            ? "#e8f8ff"
                            : "#e9edf2",
                          fontFamily: "inherit",
                          fontSize: "10px",
                          fontWeight: 900,
                          cursor: unreadMessagesCount ? "pointer" : "default",
                        }}
                      >
                        خواندن همه
                      </button>
                    </div>
                    <small>
                      {toPersianNumber(unreadMessagesCount)} خوانده‌نشده
                    </small>
                  </div>
                  <div className="innovator-dashboard__notification-list">
                    {recentMessages.length > 0 ? (
                      recentMessages.map((message) => (
                        <article
                          key={message.id}
                          className={`innovator-dashboard__notification-item ${
                            message.isRead
                              ? "innovator-dashboard__notification-item--read"
                              : ""
                          }`}
                          onClick={() => openNotificationTarget(message)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              openNotificationTarget(message);
                            }
                          }}
                          style={{
                            cursor: "pointer",
                            border: message.isRead
                              ? "1px solid #bbf7d0"
                              : "1px solid transparent",
                            background: message.isRead ? "#f0fdf4" : undefined,
                            opacity: message.isRead ? 1 : undefined,
                          }}
                        >
                          <div>
                            <h4>{message.title}</h4>
                            <p>{message.sentAt || message.time}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(event) =>
                              markMessageAsRead(message.id, event)
                            }
                            disabled={message.isRead}
                            style={
                              message.isRead
                                ? { color: "#166534", background: "#dcfce7" }
                                : undefined
                            }
                          >
                            {message.isRead ? "خوانده شد" : "خواندن"}
                          </button>
                        </article>
                      ))
                    ) : (
                      <article className="innovator-dashboard__notification-item">
                        <div>
                          <h4>اعلان جدیدی ندارید</h4>
                          <p>همه چیز خوانده شده است.</p>
                        </div>
                      </article>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              className="innovator-dashboard__profile-menu"
              ref={profileMenuRef}
            >
              <button
                type="button"
                className="innovator-dashboard__profile-trigger"
                onClick={() => {
                  setIsProfileMenuOpen((current) => !current);
                  setIsNotificationOpen(false);
                }}
                aria-expanded={isProfileMenuOpen}
              >
                <span className="innovator-dashboard__profile-text">
                  <strong>
                    {userProfile.fullName ||
                      `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim()}
                  </strong>
                  <small>نوع کاربر: {userProfile.level}</small>
                </span>
                {userProfile.avatarPreview ? (
                  <img
                    className="innovator-dashboard__top-avatar"
                    src={userProfile.avatarPreview}
                    alt={userProfile.fullName || "پروفایل کاربر"}
                  />
                ) : (
                  <span className="innovator-dashboard__top-avatar">
                    {userProfile.avatarLetter ||
                      userProfile.firstName?.[0] ||
                      userProfile.fullName?.[0] ||
                      "م"}
                  </span>
                )}
                <span className="innovator-dashboard__profile-caret">▾</span>
              </button>
              {isProfileMenuOpen && (
                <div className="innovator-dashboard__profile-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("profile");
                      setIsProfileMenuOpen(false);
                      resetCurrentContent();
                    }}
                  >
                    پروفایل
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("edit-profile");
                      setIsProfileMenuOpen(false);
                      resetCurrentContent();
                    }}
                  >
                    ویرایش پروفایل
                  </button>
                  <button
                    type="button"
                    className="innovator-dashboard__profile-logout"
                    onClick={handleLogout}
                  >
                    خروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {successNotice &&
          activeSection === "activities" &&
          activeSubItem === "create-new" && (
            <div className="instructor-create__success instructor-create__success--top">
              {successNotice}
            </div>
          )}
        {renderContent()}
      </section>
    </main>
  );
}

export default InstructorDashboardPage;
