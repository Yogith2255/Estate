import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import './LoginPage.css'; // Reuse shared auth styles
import './RegisterPage.css';


const ROLE_OPTIONS = [
  {
    value: 'customer',
    label: 'Customer',
    description: 'Browse, save, and enquire about properties.',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Create an organisation and manage its properties and projects.',
  },
];


function validateForm(form) {
  if (!form.name.trim()) return 'Full name is required.';
  if (!form.email.trim()) return 'Email address is required.';
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(form.email)) return 'Please enter a valid email address.';
  if (!form.password) return 'Password is required.';
  if (form.password.length < 6) return 'Password must be at least 6 characters.';
  if (form.password !== form.confirmPassword) return 'Passwords do not match.';
  if (!form.terms) return 'You must accept the terms to continue.';
  if (form.role === 'admin' && !form.organisationName.trim()) {
    return 'Organisation name is required for admin registration.';
  }
  return null;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    organisationName: '',
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm(form);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    const result = await register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: form.role,
      organisationName: form.organisationName,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate(authService.getHomeRoute(result.user.role), { replace: true });
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', level: 1 };
    if (p.length < 8 || !/\d/.test(p)) return { label: 'Weak', level: 2 };
    if (/[A-Z]/.test(p) && /\d/.test(p) && p.length >= 8) return { label: 'Strong', level: 4 };
    return { label: 'Fair', level: 3 };
  })();

  return (
    <div className="auth-page">
      <div className="auth-page__card auth-page__card--wide">

        {/* Brand */}
        <div className="auth-page__brand">
          <span className="auth-page__brand-icon">
            <Building2 size={22} />
          </span>
          <span className="auth-page__brand-name">
            Estate<span className="auth-page__brand-accent">Hub</span>
          </span>
        </div>

        <h1 className="auth-page__heading">Create an account</h1>
        <p className="auth-page__subheading">
          Join EstateHub to explore properties and projects.
        </p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="auth-error" role="alert">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector */}
          <div className="auth-field">
            <label className="auth-label">Account Type</label>
            <div className="auth-role-grid">
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`auth-role-card ${form.role === opt.value ? 'auth-role-card--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={form.role === opt.value}
                    onChange={handleChange}
                    className="auth-role-card__input"
                  />
                  <span className="auth-role-card__label">
                    {opt.label}
                  </span>
                  <span className="auth-role-card__desc">{opt.description}</span>
                </label>
              ))}
            </div>
          </div>
          {form.role === 'admin' && (
            <div className="auth-field">
              <label htmlFor="reg-organisation" className="auth-label">
                Organisation Name
              </label>
              <div className="auth-input-wrap">
                <Building2 size={15} className="auth-input-icon" />
                <input
                  id="reg-organisation"
                  name="organisationName"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Sunrise Properties"
                  value={form.organisationName}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}



          {/* Name */}
          <div className="auth-field">
            <label htmlFor="reg-name" className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <User size={15} className="auth-input-icon" />
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                className="auth-input"
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="reg-email" className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={15} className="auth-input-icon" />
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                className="auth-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="auth-field">
            <label htmlFor="reg-phone" className="auth-label">
              Phone <span className="auth-label-optional">(optional)</span>
            </label>
            <div className="auth-input-wrap">
              <Phone size={15} className="auth-input-icon" />
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="auth-input"
                placeholder="+91 98451 12345"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="reg-password" className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="auth-input auth-input--with-toggle"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordStrength && (
              <div className="auth-strength">
                <div className="auth-strength__bars">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`auth-strength__bar ${passwordStrength.level >= n ? `auth-strength__bar--level-${passwordStrength.level}` : ''}`}
                    />
                  ))}
                </div>
                <span className={`auth-strength__label auth-strength__label--level-${passwordStrength.level}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label htmlFor="reg-confirm" className="auth-label">Confirm Password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input
                id="reg-confirm"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                className="auth-input auth-input--with-toggle"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="auth-checkbox">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
            />
            <span>
              I agree to the{' '}
              <button type="button" className="auth-forgot-link">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="auth-forgot-link">Privacy Policy</button>
            </span>
          </label>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-page__footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-page__footer-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
