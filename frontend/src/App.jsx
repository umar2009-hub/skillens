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
import { Quiz } from '@/pages/Quiz';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';

function App() {
  useTheme(); // Initialize theme
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path={ROUTES.HOME} element={<Landing />} />
        </Route>

        <Route element={<AuthLayout />}>
          {/* <Route path={ROUTES.LOGIN} element={<Login />} /> */}
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.UPLOAD} element={<Upload />} />
            <Route path={ROUTES.MENTOR} element={<AIMentor />} />
            <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
            <Route path={ROUTES.QUIZ} element={<Quiz />} />
            <Route path={ROUTES.SETTINGS} element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App;
