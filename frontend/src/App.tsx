import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HuntDetail = lazy(() => import('./pages/HuntDetail'));
const NewHunt = lazy(() => import('./pages/NewHunt'));
const Dogs = lazy(() => import('./pages/Dogs'));
const Settings = lazy(() => import('./pages/Settings'));
const DogStatistics = lazy(() => import('./pages/DogStatistics'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PublicHuntView = lazy(() => import('./pages/PublicHuntView'));

function App() {
  // For demo purposes, we'll assume user is logged in
  const isAuthenticated = true;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/share/:shareId" element={<PublicHuntView />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="hunt/new" element={<NewHunt />} />
          <Route path="hunt/:id" element={<HuntDetail />} />
          <Route path="dogs" element={<Dogs />} />
          <Route path="statistics" element={<DogStatistics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
