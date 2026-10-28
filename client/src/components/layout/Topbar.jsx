import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ExternalLink, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

/**
 * Bright blue top utility bar for the Enterprise Management Application (#0788F9)
 * @param {Object} props
 * @param {Function} props.onToggleSidebar
 * @param {boolean} props.sidebarCollapsed
 */
export default function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Directs to projects or leads with query
      navigate(`/admin/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Senior Broker & Admin';
      case 'agent': return 'Licensed Real Estate Agent';
      case 'customer': return 'Verified Customer';
      default: return 'User';
    }
  };

  return (
    <header className="enterprise-topbar">
      <div className="enterprise-topbar__left">
        <button
          type="button"
          className="enterprise-topbar__icon-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          title="Toggle Sidebar"
        >
          <Menu size={18} />
        </button>

        <form onSubmit={handleGlobalSearch} className="enterprise-topbar__search">
          <Search size={14} className="enterprise-topbar__search-icon" />
          <input
            type="text"
            className="enterprise-topbar__search-input"
            placeholder="Search projects, leads, units, or IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="enterprise-topbar__right">
        <Link
          to="/marketplace"
          className="enterprise-topbar__link-btn"
          title="Switch to Customer Property Marketplace"
        >
          <ExternalLink size={14} />
          <span>Customer Portal</span>
        </Link>

        <div className="enterprise-topbar__divider" />

        <button
          type="button"
          className="enterprise-topbar__icon-btn"
          title="System Notifications"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="enterprise-topbar__badge-dot" />
        </button>

        <div className="enterprise-topbar__user">
          <div className="enterprise-topbar__avatar">
            <User size={15} />
          </div>
          <div className="enterprise-topbar__user-info">
            <span className="enterprise-topbar__user-name">{user?.name || 'Vikram Malhotra'}</span>
            <span className="enterprise-topbar__user-role">{getRoleLabel(user?.role)}</span>
          </div>
        </div>

        <button
          type="button"
          className="enterprise-topbar__icon-btn"
          title="Sign Out"
          aria-label="Sign Out"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
