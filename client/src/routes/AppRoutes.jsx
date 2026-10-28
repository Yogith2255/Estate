import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import { ProtectedRoute, RoleRoute, PublicOnlyRoute } from './ProtectedRoute';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Public & Customer Marketplace Pages
import HomePage from '../pages/public/HomePage';
import ListingPage from '../pages/public/ListingPage';
import PropertyDetailsPage from '../pages/public/PropertyDetailsPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import SavedHomesPage from '../pages/customer/SavedHomesPage';

// Agent Pages
import AgentDashboard from '../pages/agent/AgentDashboard';
import AddListingPage from '../pages/agent/AddListingPage';

// Admin Enterprise Management Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProjectsPage from '../pages/admin/ProjectsPage';
import LeadsPage from '../pages/admin/LeadsPage';
import PropertiesManagementPage from '../pages/admin/PropertiesManagementPage';
import OperationsModulePage from '../pages/admin/OperationsModulePage';

function LegacyPropertyRedirect() {
  const { id } = useParams();
  return <Navigate to={`/marketplace/properties/${id}`} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root Entry: Unauthenticated -> /login; Authenticated -> role home */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <Navigate to="/login" replace />
          </PublicOnlyRoute>
        }
      />

      {/* Public-only Auth Pages (Redirect to role portal if already logged in) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Customer Property Marketplace (Protected: requires authentication) */}
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <RootLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="properties" element={<ListingPage />} />
        <Route path="properties/:id" element={<PropertyDetailsPage />} />
        <Route path="customer/saved" element={<SavedHomesPage />} />
      </Route>

      {/* Direct / legacy navigation redirects to /marketplace */}
      <Route path="/properties" element={<Navigate to="/marketplace/properties" replace />} />
      <Route path="/properties/:id" element={<LegacyPropertyRedirect />} />
      <Route path="/customer/saved" element={<Navigate to="/marketplace/customer/saved" replace />} />

      {/* Enterprise Management Console (Admin only) */}
      <Route
        path="/admin"
        element={
          <RoleRoute roles={['admin']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="properties" element={<PropertiesManagementPage />} />
        <Route path="inventory" element={<OperationsModulePage moduleType="inventory" />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="customers" element={<OperationsModulePage moduleType="customers" />} />
        <Route path="enquiries" element={<OperationsModulePage moduleType="enquiries" />} />
        <Route path="site-visits" element={<OperationsModulePage moduleType="site-visits" />} />
        <Route path="bookings" element={<OperationsModulePage moduleType="bookings" />} />
        <Route path="follow-ups" element={<OperationsModulePage moduleType="follow-ups" />} />
        <Route path="users" element={<OperationsModulePage moduleType="users" />} />
        <Route path="settings" element={<OperationsModulePage moduleType="settings" />} />
      </Route>

      {/* Agent Operations Portal (Agent and Admin) */}
      <Route
        path="/agent"
        element={
          <RoleRoute roles={['agent', 'admin']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/agent/listings" replace />} />
        <Route path="listings" element={<AgentDashboard />} />
        <Route path="new-listing" element={<AddListingPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
