import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import PageTransition from './components/PageTransition';
import CustomCursor from './components/CustomCursor';
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
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed', top: '14px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 3rem)', maxWidth: '1000px',
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: '56px', borderRadius: '1.25rem',
        background: scrolled ? 'rgba(2, 6, 23, 0.92)' : 'rgba(15, 23, 42, 0.45)',
        border: scrolled ? '1px solid rgba(255,255,255,0.13)' : '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(28px)',
        boxShadow: scrolled ? '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s ease',
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            <Cpu size={16} color="white" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#fff' }}>Agentic</span>
            <span style={{ color: '#60a5fa' }}>AI</span>
          </span>
        </Link>

        {/* Nav Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { path: '/knowledge', label: 'Library', icon: <BookOpen size={14} /> },
            ...(user ? [{ path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> }] : []),
          ].map(({ path, label, icon }) => (
            <Link key={path} to={path} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '10px',
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
              background: isActive(path) ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: isActive(path) ? '#93c5fd' : '#94a3b8',
              border: isActive(path) ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (!isActive(path)) { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}}
            onMouseLeave={e => { if (!isActive(path)) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}}
            >
              {icon} {label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 12px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, color: '#fff',
                }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.83rem', color: '#cbd5e1', fontWeight: 600 }}>{user.name}</span>
              </div>
              <button onClick={logout} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 10px', borderRadius: '8px', border: 'none',
                background: 'rgba(239,68,68,0.08)', color: '#f87171',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="premium-btn" style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '0.85rem', textDecoration: 'none' }}>
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/"          element={<Landing />} />
        <Route path="/auth"      element={<Auth />} />
        <Route path="/knowledge" element={<KnowledgeBase />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </PageTransition>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#020617', fontFamily: 'Inter, sans-serif' }}>
        <CustomCursor />
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
