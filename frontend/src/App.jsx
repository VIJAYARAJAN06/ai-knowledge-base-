import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import KnowledgeBase from './pages/KnowledgeBase';
import { LogOut, BookOpen, LayoutDashboard, Cpu } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(state => state.token);
  if (!token) return <Navigate to="/auth" />;
  return children;
};

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[calc(100%-3rem)] max-w-5xl"
    >
      <div
        className="flex items-center justify-between px-6 h-14 rounded-2xl transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(2, 6, 23, 0.85)' : 'rgba(15, 23, 42, 0.5)',
          border: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          boxShadow: scrolled ? '0 20px 40px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
            <Cpu size={16} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            Agentic<span className="text-blue-400">AI</span>
          </span>
        </Link>

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { path: '/knowledge', label: 'Library', icon: <BookOpen size={15} /> },
            ...(user ? [{ path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> }] : []),
          ].map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: isActive(path) ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: isActive(path) ? '#60a5fa' : '#94a3b8',
                border: isActive(path) ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive(path)) e.currentTarget.style.color = '#e2e8f0'; }}
              onMouseLeave={e => { if (!isActive(path)) e.currentTarget.style.color = '#94a3b8'; }}
            >
              {icon} {label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-slate-300 font-medium">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="premium-btn px-5 py-2 rounded-xl text-sm font-bold text-white"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans" style={{ background: '#020617' }}>
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
