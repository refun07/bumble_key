import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './components/layout/AdminLayout';

import HostLayout from './components/layout/HostLayout';

// Lazy load admin pages to improve performance and isolate errors
const PartnerList = React.lazy(() => import('./pages/admin/PartnerList'));
const HostList = React.lazy(() => import('./pages/admin/HostList'));
const BoxList = React.lazy(() => import('./pages/admin/BoxList'));
const NfcFobList = React.lazy(() => import('./pages/admin/NfcFobList'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const Landing = React.lazy(() => import('./pages/Landing'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const HostDashboard = React.lazy(() => import('./pages/host/HostDashboard'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const HostDetails = React.lazy(() => import('./pages/admin/HostDetails'));
const HostKeyDetailsAdmin = React.lazy(() => import('./pages/admin/HostKeyDetails'));
const ActivityLog = React.lazy(() => import('./pages/admin/ActivityLog'));
const Accounts = React.lazy(() => import('./pages/admin/Accounts'));
const Reports = React.lazy(() => import('./pages/admin/Reports'));
import HostKeyList from './pages/host/HostKeyList';
import KeyRegistration from './pages/host/KeyRegistration';
import HostKeyDetailsHost from './pages/host/HostKeyDetails';
import CollectionCodeView from './pages/host/CollectionCodeView';
import GuestPickupView from './pages/guest/GuestPickupView';
import ViewCodes from './pages/host/ViewCodes';
import HostSignup from './pages/auth/HostSignup';
import BumbleHiveMap from './pages/host/BumbleHiveMap';
import SubscriptionPlans from './pages/host/SubscriptionPlans';
import BumbleHivePoints from './pages/host/BumbleHivePoints';
import Integration from './pages/host/Integration';
import HostSettings from './pages/host/HostSettings';
import LandingLayout from './components/layout/LandingLayout';
import About from './pages/About';
import Influencers from './pages/Influencers';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import { useAuth } from './store/auth';
import CookieConsent from './components/common/CookieConsent';
import ToastContainer from './components/common/ToastContainer';
import Locations from './pages/Locations';
import AppLoader from './components/common/AppLoader';

// Smart Dashboard Redirect
const DashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === 'host') {
    return <Navigate to="/host/dashboard" replace />;
  }

  return <div className="p-8">Dashboard for role: {user?.role}</div>;
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  const { initializeAuth, isAuthenticated, isLoading, user } = useAuth();

  React.useEffect(() => {
    console.log('App: Initial mount, initializing auth...');
    initializeAuth();
  }, [initializeAuth]);

  console.log('App: Rendering, state:', { isAuthenticated, isLoading, user });

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<React.Suspense fallback={<AppLoader/>}><Login /></React.Suspense>} />
        <Route path="/register" element={<React.Suspense fallback={<AppLoader/>}><Register /></React.Suspense>} />
        <Route path="/host/signup" element={<HostSignup />} />
        <Route path="/guest/pickup/:id" element={<GuestPickupView />} />

        {/* Landing Pages */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <React.Suspense fallback={<AppLoader/>}><Landing /></React.Suspense>} />
          <Route path="/about" element={<About />} />
          <Route path="/influencers" element={<Influencers />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/landing" element={<Landing />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<React.Suspense fallback={<AppLoader/>}><AdminDashboard /></React.Suspense>} />
          <Route path="boxes" element={<React.Suspense fallback={<AppLoader/>}><BoxList /></React.Suspense>} />
          <Route path="nfc-fobs" element={<React.Suspense fallback={<AppLoader/>}><NfcFobList /></React.Suspense>} />
          <Route path="partners" element={<React.Suspense fallback={<AppLoader/>}><PartnerList /></React.Suspense>} />
          <Route path="hosts" element={<React.Suspense fallback={<AppLoader/>}><HostList /></React.Suspense>} />
          <Route path="hosts/:id" element={<React.Suspense fallback={<AppLoader/>}><HostDetails /></React.Suspense>} />
          <Route path="hosts/:id/keys/:keyId" element={<React.Suspense fallback={<AppLoader/>}><HostKeyDetailsAdmin /></React.Suspense>} />
          <Route path="activity-log" element={<React.Suspense fallback={<AppLoader/>}><ActivityLog /></React.Suspense>} />
          <Route path="accounts" element={<React.Suspense fallback={<AppLoader/>}><Accounts /></React.Suspense>} />
          <Route path="reports" element={<React.Suspense fallback={<AppLoader/>}><Reports /></React.Suspense>} />
          <Route path="settings" element={<React.Suspense fallback={<AppLoader/>}><AdminSettings /></React.Suspense>} />
          <Route path="*" element={<div className="text-xl">Page under construction</div>} />
        </Route>

        {/* Host Routes */}
        <Route
          path="/host"
          element={
            <ProtectedRoute>
              <HostLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<React.Suspense fallback={<AppLoader/>}><HostDashboard /></React.Suspense>} />
          <Route path="keys" element={<HostKeyList />} />
          <Route path="keys/new" element={<KeyRegistration />} />
          <Route path="keys/:id" element={<HostKeyDetailsHost />} />
          <Route path="keys/:id/collection" element={<CollectionCodeView />} />
          <Route path="keys/:id/codes" element={<ViewCodes />} />
          <Route path="map" element={<BumbleHiveMap />} />
          <Route path="plans" element={<SubscriptionPlans />} />
          <Route path="integration" element={<Integration />} />
          <Route path="settings" element={<HostSettings />} />
          <Route path="points" element={<BumbleHivePoints />} />
          <Route path="*" element={<div className="text-xl">Page under construction</div>} />
        </Route>
      </Routes>
      <CookieConsent />
      <ToastContainer />
    </Router>
  );
}

export default App;
