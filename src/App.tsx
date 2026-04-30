import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/pages/Login';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import CoursesPage from '@/pages/Courses';
import TestsPage from '@/pages/Tests';
import ArticlesNotificationsPage from '@/pages/Articles';
import UsersPage from '@/pages/Users';
import HomeScreen from '@/pages/HomeScreen';
import HomeCategories from '@/pages/HomeCategories';
import QOTDPage from '@/pages/QOTD';
import TestSeriesPage from '@/pages/TestSeries';
import JobsTestimonialsPage from '@/pages/JobsTestimonials';
import { Toaster } from '@/components/ui/toaster';

import ErrorBoundary from '@/components/ErrorBoundary';

import { ThemeProvider } from '@/contexts/ThemeContext';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="home-screen" element={<HomeScreen />} />
              <Route path="home-categories" element={<HomeCategories />} />
              <Route path="qotd" element={<QOTDPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="tests" element={<TestsPage />} />
              <Route path="test-series" element={<TestSeriesPage />} />
              <Route path="jobs" element={<JobsTestimonialsPage />} />
              <Route path="articles" element={<ArticlesNotificationsPage />} />
              <Route path="notifications" element={<ArticlesNotificationsPage />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
