import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff, LogIn, MapPin, Users, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Live Server Time simulation matching "20 Mar 2026, 09:46:40 IST" format
  const [serverTime, setServerTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format: 20 Mar 2026, 09:46:40 IST
      const day = now.getDate().toString().padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      setServerTime(`${day} ${month} ${year}, ${hours}:${minutes}:${seconds} IST`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your username or email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const result = login(email, password, rememberMe);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="oil-login-root">
      {/* Fixed Full-Screen Background Image & Overlay */}
      <div className="oil-login-bg" />
      <div className="oil-login-overlay" />

      {/* Top Left Branding Header */}
      <header className="oil-branding-header">
        <div className="max-w-7xl mx-auto">
          <div className="oil-branding-container">
            {/* Ashoka Emblem Vector Graphic */}
            <div className="w-9 h-11 flex flex-col items-center justify-center shrink-0">
              <svg viewBox="0 0 100 120" className="w-full h-full text-amber-800" fill="currentColor">
                {/* Base Pillar */}
                <rect x="25" y="95" width="50" height="8" rx="2" fill="#78350f" />
                <rect x="20" y="104" width="60" height="6" rx="1" fill="#451a03" />
                {/* Dharma Chakra Wheel */}
                <circle cx="50" cy="85" r="8" fill="none" stroke="#78350f" strokeWidth="2" />
                <circle cx="50" cy="85" r="2" fill="#78350f" />
                {/* Three Lions Silhouette */}
                <path d="M35,80 C30,70 25,55 30,40 C35,30 45,25 50,30 C55,25 65,30 70,40 C75,55 70,70 65,80 Z" fill="#78350f" />
                <path d="M42,25 C45,15 55,15 58,25 C50,22 45,22 42,25 Z" fill="#92400e" />
                {/* Left Lion Head */}
                <circle cx="35" cy="35" r="8" fill="#78350f" />
                {/* Right Lion Head */}
                <circle cx="65" cy="35" r="8" fill="#78350f" />
                {/* Center Lion Head */}
                <circle cx="50" cy="30" r="10" fill="#92400e" />
              </svg>
            </div>

            {/* Oil India Red Logo Badge */}
            <div className="w-9 h-9 rounded-full bg-[#a71d2a] flex items-center justify-center text-white shrink-0 shadow-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2C9.5 6 6 9.5 6 13a6 6 0 0 0 12 0c0-3.5-3.5-7-6-11zm0 15a4 4 0 0 1-4-4c0-2.1 2.3-4.9 4-7.1 1.7 2.2 4 5 4 7.1a4 4 0 0 1-4 4z" />
              </svg>
            </div>

            {/* Text Branding */}
            <div className="flex flex-col justify-center">
              <span className="oil-branding-text-hindi">ऑयल इंडिया लिमिटेड</span>
              <span className="oil-branding-text-english">Oil India Limited</span>
              <span className="oil-branding-subtext">(A Maharatna Company)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Center / Left Area */}
      <main className="oil-login-main-container">
        <div className="oil-login-card">
          {/* Circular Red Lock Badge */}
          <div className="w-12 h-12 rounded-full border-2 border-[#a71d2a] flex items-center justify-center mx-auto mb-3 bg-red-50/60">
            <Lock className="w-6 h-6 text-[#a71d2a]" />
          </div>

          {/* Title & Subtitle */}
          <h2 className="oil-login-card-title">
            BAGHEWALA <span className="oil-login-card-accent">DIGITAL TWIN</span>
          </h2>
          <p className="oil-login-card-subtitle">
            Heavy-Oil Field Simulation &amp; Decision Support
          </p>

          {/* Divider Line */}
          <div className="oil-login-divider-line" />

          {/* Inline Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-[#a71d2a] text-xs font-semibold px-3 py-2 rounded-lg mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Username / Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username / Email"
                className="oil-login-input"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="oil-login-input oil-login-input-has-toggle"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#a71d2a] focus:ring-[#a71d2a] w-3.5 h-3.5 cursor-pointer"
                />
                <span>Remember Me</span>
              </label>
              <button
                type="button"
                className="text-[#a71d2a] hover:underline font-semibold cursor-pointer"
                onClick={() => alert('For demo access, please use admin@gmail.com / admin123')}
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary Login Button */}
            <button type="submit" className="oil-login-btn-primary">
              <LogIn className="w-4 h-4" />
              <span>LOGIN TO PORTAL</span>
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Information Footer Bar */}
      <footer className="oil-footer-wrapper">
        <div className="oil-login-footer-bar">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            {/* Box 1: Location */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/70 flex items-center justify-center text-slate-300 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="oil-footer-item-title">Baghewala Field</div>
                <div className="oil-footer-item-subtitle">Bikaner, Rajasthan, India</div>
              </div>
            </div>

            {/* Box 2: System Status */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/70 flex items-center justify-center text-slate-300 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="oil-footer-item-title">System Status</div>
                <div className="oil-footer-item-status">All Systems Operational</div>
              </div>
            </div>

            {/* Box 3: Server Time */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/70 flex items-center justify-center text-slate-300 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="oil-footer-item-title">Server Time</div>
                <div className="oil-footer-item-subtitle font-mono">{serverTime || '20 Mar 2026, 09:46:40 IST'}</div>
              </div>
            </div>

            {/* Box 4: Connection */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/70 flex items-center justify-center text-slate-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="oil-footer-item-title">Connection</div>
                <div className="oil-footer-item-status">Secure Encrypted</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-footer Copyright */}
        <div className="oil-login-footer-copyright">
          &copy; 2026 Oil India Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
