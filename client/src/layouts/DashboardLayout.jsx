import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import EnterpriseSidebar from '../components/layout/EnterpriseSidebar';
import './DashboardLayout.css';

/**
 * Enterprise Management Application Layout
 * Replaces old layout with Dark Navy Sidebar, Bright Blue Topbar, and Light Grey Workspace
 */
export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    // If mobile width, toggle drawer; else toggle collapse state
    if (window.innerWidth <= 860) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="enterprise-layout">
      {/* Dark Navy Sidebar */}
      <EnterpriseSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Column */}
      <div className="enterprise-layout__main">
        {/* Bright Blue Topbar */}
        <Topbar
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Light Grey Workspace (#F5F7FA) */}
        <main className="enterprise-layout__workspace">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
