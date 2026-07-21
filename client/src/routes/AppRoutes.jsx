import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import ReviewPage from "../pages/ReviewPage";
import ResumePage from "../pages/ResumePage";
import ATSPage from "../pages/ATSPage";
import Login from "../pages/Login";
import Admin from "../pages/Admin";
import OAuthSuccess from "../pages/OAuthSuccess";
import InterviewPage from "../pages/InterviewPage";
import CodingPage from "../pages/CodingPage";
import SkillGapPage from "../pages/SkillGapPage";
import JobSearchPage from "../pages/JobSearchPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <ResumePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/review/:resumeId"
        element={
          <ProtectedRoute>
            <ReviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ats"
        element={
          <ProtectedRoute>
            <ATSPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <Admin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <InterviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coding"
        element={
          <ProtectedRoute>
            <CodingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/skills"
        element={
          <ProtectedRoute>
            <SkillGapPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <JobSearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/oauth-success"
        element={<OAuthSuccess />}
      />

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />

    </Routes>
  );
}