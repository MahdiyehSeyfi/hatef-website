import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import ScrollManager from "./ScrollManager";
import ProtectedRoute from "./ProtectedRoute";
import AuthSessionGuard from "./AuthSessionGuard";
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

import TechnologyGuidancePage from "../pages/services/TechnologyGuidancePage";
import ConsultingPage from "../pages/services/ConsultingPage";
import CommercializationRoadmapPage from "../pages/services/CommercializationRoadmapPage";

import GuideEligibilityPage from "../pages/research/GuideEligibilityPage";
import ReviewEvaluationPage from "../pages/research/ReviewEvaluationPage";
import CallsPage from "../pages/research/CallsPage";
import CurrentFieldsPage from "../pages/research/CurrentFieldsPage";
import CallDetailsPage from "../pages/research/CallDetailsPage";

import CollaborationOpportunitiesPage from "../pages/business/CollaborationOpportunitiesPage";
import CollaborationProjectDetailsPage from "../pages/business/CollaborationProjectDetailsPage";
import SuccessfulProjectsPage from "../pages/business/SuccessfulProjectsPage";
import BusinessCollaborationPage from "../pages/business/BusinessCollaborationPage";

import AuthPage from "../pages/auth/AuthPage";
import InnovatorDashboardPage from "../pages/dashboard/InnovatorDashboardPage";
import BusinessDashboardPage from "../pages/dashboard/BusinessDashboardPage";
import ReviewerDashboardPage from "../pages/dashboard/ReviewerDashboardPage";
import InstructorDashboardPage from "../pages/dashboard/InstructorDashboardPage";
import CommitteeSecretariatDashboardPage from "../pages/dashboard/CommitteeSecretariatDashboardPage";

import { USER_ROLES } from "../constants/roles";

function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <AuthSessionGuard />
      <Routes>
        <Route path="auth" element={<AuthPage />} />

        <Route
          path="dashboard/innovator"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.INNOVATOR]}>
              <InnovatorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="dashboard/business"
          element={<Navigate to="/dashboard/business-collaboration" replace />}
        />

        <Route
          path="dashboard/business-collaboration"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.BUSINESS_PARTNER]}>
              <BusinessDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="dashboard/reviewer"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.REVIEWER]}>
              <ReviewerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="dashboard/instructor"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.INSTRUCTOR]}>
              <InstructorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="dashboard/committee-secretariat"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.COMMITTEE]}>
              <CommitteeSecretariatDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route element={<MainLayout />}>
          <Route
            path="business/collaboration"
            element={<BusinessCollaborationPage />}
          />
          <Route
            path="business/successful-projects"
            element={<SuccessfulProjectsPage />}
          />
          <Route
            path="business/opportunities/:projectId"
            element={<CollaborationProjectDetailsPage />}
          />
          <Route
            path="business/opportunities"
            element={<CollaborationOpportunitiesPage />}
          />

          <Route
            path="research-support/calls/:callId"
            element={<CallDetailsPage />}
          />
          <Route
            path="research-support/current-fields"
            element={<CurrentFieldsPage />}
          />
          <Route path="research-support/calls" element={<CallsPage />} />
          <Route
            path="research-support/guide-eligibility"
            element={<GuideEligibilityPage />}
          />
          <Route
            path="research-support/review-evaluation"
            element={<ReviewEvaluationPage />}
          />

          <Route
            path="services/commercialization-roadmap"
            element={<CommercializationRoadmapPage />}
          />
          <Route
            path="services"
            element={<Navigate to="/services/technology-guidance" replace />}
          />
          <Route
            path="services/technology-guidance"
            element={<TechnologyGuidancePage />}
          />
          <Route path="services/consulting" element={<ConsultingPage />} />

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
