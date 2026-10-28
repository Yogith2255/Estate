import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Building,
  Home,
  Layers,
  UserCheck,
  Users,
  MessageSquare,
  CalendarCheck,
  BookmarkCheck,
  Clock,
  Shield,
  Settings,
  PlusCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './EnterpriseSidebar.css';

/**
 * Enterprise Dark Navy Sidebar (#0D2A45)
 * @param {Object} props
 * @param {boolean} props.collapsed
 * @param {boolean} props.mobileOpen
 * @param {Function} props.onCloseMobile
 */
export default function EnterpriseSidebar({ collapsed, mobileOpen, onCloseMobile }) {
  const { user } = useAuth();

  const adminSections = [
    {
      group: 'MAIN',
      items: [
        { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
      ],
    },
    {
      group: 'PROPERTY MANAGEMENT',
      items: [
        { label: 'Projects', to: '/admin/projects', icon: Building },
        { label: 'Properties', to: '/admin/properties', icon: Home },
        { label: 'Inventory', to: '/admin/inventory', icon: Layers },
      ],
    },
    {
      group: 'CUSTOMER MANAGEMENT',
      items: [
        { label: 'Leads', to: '/admin/leads', icon: UserCheck },
        { label: 'Customers', to: '/admin/customers', icon: Users },
        { label: 'Enquiries', to: '/admin/enquiries', icon: MessageSquare },
      ],
    },
    {
      group: 'SALES OPERATIONS',
      items: [
        { label: 'Site Visits', to: '/admin/site-visits', icon: CalendarCheck },
        { label: 'Bookings', to: '/admin/bookings', icon: BookmarkCheck },
        { label: 'Follow-ups', to: '/admin/follow-ups', icon: Clock },
      ],
    },
    {
      group: 'ADMINISTRATION',
      items: [
        { label: 'Users', to: '/admin/users', icon: Shield },
        { label: 'Settings', to: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const agentSections = [
    {
      group: 'AGENT OPERATIONS',
      items: [
        { label: 'My Listings', to: '/agent/listings', icon: LayoutDashboard },
        { label: 'Add Property', to: '/agent/new-listing', icon: PlusCircle },
      ],
    },
    {
      group: 'MARKETPLACE',
      items: [
        { label: 'Customer Portal', to: '/marketplace', icon: Building2 },
      ],
    },
  ];

  const navSections = user?.role === 'agent' ? agentSections : adminSections;
  const brandLink = user?.role === 'agent' ? '/agent/listings' : '/admin';

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`enterprise-sidebar ${collapsed ? 'enterprise-sidebar--collapsed' : ''} ${mobileOpen ? 'enterprise-sidebar--mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="enterprise-sidebar__brand">
          <Link to={brandLink} className="enterprise-sidebar__logo" onClick={onCloseMobile}>
            <span className="enterprise-sidebar__logo-icon">
              <Building2 size={18} />
            </span>
            {!collapsed && (
              <span className="enterprise-sidebar__logo-text">
                Estate<span className="enterprise-sidebar__logo-accent">Hub</span>
              </span>
            )}
          </Link>
          {mobileOpen && (
            <button
              type="button"
              className="enterprise-sidebar__mobile-close"
              onClick={onCloseMobile}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="enterprise-sidebar__nav">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="enterprise-sidebar__section">
              {!collapsed && (
                <div className="enterprise-sidebar__group-title">
                  {sec.group}
                </div>
              )}
              <div className="enterprise-sidebar__group-items">
                {sec.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `enterprise-sidebar__link ${isActive ? 'enterprise-sidebar__link--active' : ''}`
                      }
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={16} className="enterprise-sidebar__link-icon" />
                      {!collapsed && (
                        <span className="enterprise-sidebar__link-text">{item.label}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
