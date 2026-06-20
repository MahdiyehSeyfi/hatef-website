import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import MainLayout from "../layouts/MainLayout";

import HomePage from "../pages/HomePage";
import AboutPage from "../pages/about/AboutPage";
import ContactPage from "../pages/contact/ContactPage";

import NewsPage from "../pages/news/NewsPage";
import NewsDetailsPage from "../pages/news/NewsDetailsPage";

import DocumentsPage from "../pages/documents/DocumentsPage";

import ActivitiesPage from "../pages/activities/ActivitiesPage";
import CourseDetailsPage from "../pages/activities/CourseDetailsPage";
import EventDetailsPage from "../pages/activities/EventDetailsPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />

          <Route path="about" element={<AboutPage />} />

          <Route path="contact" element={<ContactPage />} />

          <Route path="news" element={<NewsPage />} />

          <Route path="news/:newsId" element={<NewsDetailsPage />} />

          <Route
            path="documents"
            element={<Navigate to="/documents/forms" replace />}
          />

          <Route path="documents/:category" element={<DocumentsPage />} />

          <Route
            path="events"
            element={
              <ActivitiesPage key="combined-activities-page" mode="combined" />
            }
          />

          <Route
            path="events/all"
            element={<ActivitiesPage key="events-only-page" mode="events" />}
          />

          <Route path="events/:eventId" element={<EventDetailsPage />} />

          <Route
            path="courses"
            element={<Navigate to="/courses/all" replace />}
          />

          <Route
            path="courses/all"
            element={<ActivitiesPage key="courses-only-page" mode="courses" />}
          />

          <Route path="courses/:courseId" element={<CourseDetailsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
