import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, UserCircle, LogIn, LogOut, Shield } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    signOut();
    closeMobileMenu();
    navigate('/login');
  };

  const isHomeActive = location.pathname === '/marketplace' || location.pathname === '/';
  const isExploreActive = location.pathname.includes('/properties') && !location.search;
  const isBuyActive = location.pathname.includes('/properties') && location.search.includes('type=sale');
  const isRentActive = location.pathname.includes('/properties') && location.search.includes('type=rent');

  return (
    <header className="marketplace-navbar">
      <div className="container marketplace-navbar__container">
        {/* EstateHub Brand Logo */}
        <Link to="/marketplace" className="marketplace-navbar__logo" onClick={closeMobileMenu}>
          <span className="marketplace-navbar__logo-icon">
            <Building2 size={20} />
          </span>
          <span className="marketplace-navbar__logo-text">
            Estate<span className="marketplace-navbar__logo-accent">Hub</span>
          </span>
        </Link>

        {/* Center Links */}
        <nav className="marketplace-navbar__nav">
          <Link
            to="/marketplace"
            className={`marketplace-navbar__link ${isHomeActive ? 'marketplace-navbar__link--active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/marketplace/properties"
            className={`marketplace-navbar__link ${isExploreActive ? 'marketplace-navbar__link--active' : ''}`}
          >
            Properties
          </Link>
          <Link
            to="/marketplace/properties?type=sale"
            className={`marketplace-navbar__link ${isBuyActive ? 'marketplace-navbar__link--active' : ''}`}
          >
            Buy
          </Link>
          <Link
            to="/marketplace/properties?type=rent"
            className={`marketplace-navbar__link ${isRentActive ? 'marketplace-navbar__link--active' : ''}`}
          >
            Rent
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin/projects"
              className="marketplace-navbar__link"
            >
              Projects
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="marketplace-navbar__actions">
          <Link to="/marketplace/customer/saved" className="marketplace-navbar__saved-link" title="Saved Properties">
            <UserCircle size={18} />
            <span className="marketplace-navbar__saved-label">Saved</span>
          </Link>

          {isAuthenticated ? (
            <>
              <div className="marketplace-navbar__user-badge">
                <span className="marketplace-navbar__user-name">{user?.name}</span>
                <span className="marketplace-navbar__user-role">{user?.role}</span>
              </div>

              {user?.role === 'admin' && (
                <Button
                  as={Link}
                  to="/admin"
                  variant="primary"
                  size="sm"
                  icon={Shield}
                  className="marketplace-navbar__portal-btn"
                >
                  Enterprise
                </Button>
              )}

              {user?.role === 'agent' && (
                <Button
                  as={Link}
                  to="/agent/listings"
                  variant="primary"
                  size="sm"
                  icon={Shield}
                  className="marketplace-navbar__portal-btn"
                >
                  Agent Portal
                </Button>
              )}

              <button
                type="button"
                className="marketplace-navbar__auth-btn"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="marketplace-navbar__auth-btn">
                <LogIn size={15} />
                <span>Login</span>
              </Link>
              <Button
                as={Link}
                to="/register"
                variant="primary"
                size="sm"
              >
                Sign Up
              </Button>
            </>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="marketplace-navbar__mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="marketplace-navbar__mobile-drawer">
          <div className="container marketplace-navbar__mobile-drawer-inner">
            <Link to="/marketplace" className="marketplace-navbar__mobile-link" onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/marketplace/properties" className="marketplace-navbar__mobile-link" onClick={closeMobileMenu}>
              Browse Properties
            </Link>
            <Link to="/marketplace/properties?type=sale" className="marketplace-navbar__mobile-link" onClick={closeMobileMenu}>
              Buy Homes
            </Link>
            <Link to="/marketplace/properties?type=rent" className="marketplace-navbar__mobile-link" onClick={closeMobileMenu}>
              Rental Units
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin/projects" className="marketplace-navbar__mobile-link" onClick={closeMobileMenu}>
                Verified Projects
              </Link>
            )}
            <div className="marketplace-navbar__mobile-divider" />
            <Link to="/marketplace/customer/saved" className="marketplace-navbar__mobile-link" onClick={closeMobileMenu}>
              Saved Homes
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="marketplace-navbar__mobile-link text-primary" onClick={closeMobileMenu}>
                Enterprise Management Console
              </Link>
            )}
            {user?.role === 'agent' && (
              <Link to="/agent/listings" className="marketplace-navbar__mobile-link text-primary" onClick={closeMobileMenu}>
                Agent Operations Console
              </Link>
            )}
            <div style={{ marginTop: '8px' }}>
              {isAuthenticated ? (
                <Button
                  variant="secondary"
                  size="md"
                  style={{ width: '100%' }}
                  onClick={handleLogout}
                >
                  Sign Out ({user?.name})
                </Button>
              ) : (
                <Button
                  as={Link}
                  to="/login"
                  variant="primary"
                  size="md"
                  style={{ width: '100%' }}
                  onClick={closeMobileMenu}
                >
                  Sign In / Register
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
