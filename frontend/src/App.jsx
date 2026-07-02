import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { useTheme } from '@/hooks/useTheme';

import { LandingLayout } from '@/layouts/LandingLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicRoute } from '@/routes/PublicRoute';

import { Landing } from '@/pages/Landing';
import { Dashboard } from '@/pages/Dashboard';
import { Upload } from '@/pages/Upload';
import { AIMentor } from '@/pages/AIMentor';
import { Analytics } from '@/pages/Analytics';
import { RevisionPlanner } from '@/pages/RevisionPlanner';
import { Quiz } from '@/pages/Quiz';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { DocumentDetail } from '@/pages/DocumentDetail';
import { DocumentsList } from '@/pages/DocumentsList';

import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  useTheme(); // Initialize theme
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path={ROUTES.HOME} element={<Landing />} />
        </Route>

        {/* Public Routes for Authentication */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.UPLOAD} element={<Upload />} />
            <Route path={ROUTES.MENTOR} element={<AIMentor />} />
            <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
            <Route path={ROUTES.REVISION} element={<RevisionPlanner />} />
            <Route path={ROUTES.QUIZ} element={<Quiz />} />
            <Route path={ROUTES.SETTINGS} element={<Settings />} />
            <Route path={ROUTES.DOCUMENTS} element={<DocumentsList />} />
            <Route path={ROUTES.DOCUMENT} element={<DocumentDetail />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App;
