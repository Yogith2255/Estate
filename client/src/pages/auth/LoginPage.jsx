import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import './LoginPage.css';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) { setError('Email is required.'); return; }
    if (!form.password)      { setError('Password is required.'); return; }

    setLoading(true);
    const result = await signIn(form.email, form.password, form.rememberMe);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Navigate to where they tried to go, or their role's home
    const from = location.state?.from?.pathname;
    const roleHome = authService.getHomeRoute(result.user.role);
    navigate(from || roleHome, { replace: true });
  };

  const fillDemo = (cred) => {
    setForm((prev) => ({ ...prev, email: cred.email, password: cred.password }));
    setDemoOpen(false);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">

        {/* Brand */}
        <div className="auth-page__brand">
          <span className="auth-page__brand-icon">
            <Building2 size={22} />
          </span>
          <span className="auth-page__brand-name">
            Estate<span className="auth-page__brand-accent">Hub</span>
          </span>
        </div>

        <h1 className="auth-page__heading">Welcome back</h1>
        <p className="auth-page__subheading">
          Sign in to access your portal
        </p>

        {/* Demo credentials panel */}
        <div className="auth-demo-panel">
          <button
            type="button"
            className="auth-demo-panel__toggle"
            onClick={() => setDemoOpen((p) => !p)}
          >
            <Info size={13} />
            <span>Demo credentials</span>
            <span className="auth-demo-panel__chevron">{demoOpen ? '▲' : '▼'}</span>
          </button>
          {demoOpen && (
            <div className="auth-demo-panel__body">
              {authService.demoCredentials.map((c) => (
                <button
                  key={c.role}
                  type="button"
                  className="auth-demo-cred"
                  onClick={() => fillDemo(c)}
                >
                  <span className="auth-demo-cred__role">{c.role}</span>
                  <span className="auth-demo-cred__email">{c.email}</span>
                  <span className="auth-demo-cred__action">Use →</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="auth-error" role="alert">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="login-email" className="auth-label">Email</label>
            <div className="auth-input-wrap">
              <Mail size={15} className="auth-input-icon" />
              <input
                id="login-email"
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

          {/* Password */}
          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="login-password" className="auth-label">Password</label>
              <button type="button" className="auth-forgot-link">Forgot password?</button>
            </div>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="auth-input auth-input--with-toggle"
                placeholder="••••••••"
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
          </div>

          {/* Remember me */}
          <label className="auth-checkbox">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
            />
            <span>Remember me</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-page__footer">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-page__footer-link">Create account</Link>
        </p>
      </div>
    </div>
  );
}
