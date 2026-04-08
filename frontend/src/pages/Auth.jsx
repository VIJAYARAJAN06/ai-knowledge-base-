import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Icosahedron } from '@react-three/drei';
import { Eye, EyeOff, ArrowRight, Cpu, Shield, Sparkles, Bot } from 'lucide-react';

// ─── Minimal 3D Background ────────────────────────────────────────────────────
const FloatingShape = ({ position, color, speed }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * speed;
      ref.current.rotation.y = clock.getElapsedTime() * speed * 0.7;
    }
  });
  return (
    <Float speed={speed} floatIntensity={2} rotationIntensity={0.5}>
      <Icosahedron ref={ref} args={[0.5, 1]} position={position}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} wireframe transparent opacity={0.6} />
      </Icosahedron>
    </Float>
  );
};

const AuthScene = () => (
  <>
    <Stars radius={80} depth={50} count={2000} factor={3} fade speed={0.4} />
    <ambientLight intensity={0.2} />
    <pointLight position={[5, 5, 5]} intensity={2} color="#3b82f6" />
    <pointLight position={[-5, -5, 3]} intensity={1.5} color="#a855f7" />
    <FloatingShape position={[-3, 2, -2]} color="#3b82f6" speed={1.2} />
    <FloatingShape position={[3, -1.5, -2]} color="#a855f7" speed={0.9} />
    <FloatingShape position={[2, 2.5, -3]} color="#10b981" speed={1.5} />
    <FloatingShape position={[-2.5, -2, -2]} color="#f59e0b" speed={1.1} />
  </>
);

// ─── Input Field ─────────────────────────────────────────────────────────────
const InputField = ({ label, type = 'text', value, onChange, placeholder, icon }) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '0 14px', borderRadius: '12px', height: '50px',
        background: focused ? 'rgba(59,130,246,0.06)' : 'rgba(15,23,42,0.8)',
        border: focused ? '1.5px solid rgba(59,130,246,0.6)' : '1.5px solid rgba(255,255,255,0.07)',
        boxShadow: focused ? '0 0 20px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ color: focused ? '#60a5fa' : '#475569', flexShrink: 0, transition: 'color 0.2s' }}>{icon}</div>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#f1f5f9', fontSize: '0.92rem', fontFamily: 'Inter, sans-serif',
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPass(s => !s)}
            style={{ background: 'none', border: 'none', cursor: 'none', color: '#475569', padding: 0, display: 'flex' }}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Auth Page ────────────────────────────────────────────────────────────────
const Auth = () => {
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const cardRef  = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 60, rotateX: 12, scale: 0.93, transformPerspective: 1000 },
      { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.9, ease: 'power4.out', transformPerspective: 1000 }
    );
  }, []);

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload  = isLogin ? { email, password } : { email, password, name };

    try {
      const res  = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      login(data.user, data.token);
      gsap.to(cardRef.current, { opacity: 0, scale: 0.9, y: -40, duration: 0.4, ease: 'power3.in', onComplete: () => navigate('/dashboard') });
    } catch (err) {
      setError(err.message);
      gsap.fromTo(cardRef.current, { x: -8 }, { x: 8, repeat: 4, yoyo: true, duration: 0.08, ease: 'none', onComplete: () => gsap.set(cardRef.current, { x: 0 }) });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    gsap.to(cardRef.current, {
      opacity: 0, scale: 0.97, rotateX: -5,
      duration: 0.25, ease: 'power2.in',
      transformPerspective: 1000,
      onComplete: () => {
        setIsLogin(v => !v);
        setError('');
        gsap.to(cardRef.current, { opacity: 1, scale: 1, rotateX: 0, duration: 0.5, ease: 'power4.out', transformPerspective: 1000 });
      },
    });
  };

  const features = [
    { icon: <Bot size={16} />, text: 'Multi-Agent AI Pipeline' },
    { icon: <Shield size={16} />, text: 'JWT Secured Authentication' },
    { icon: <Sparkles size={16} />, text: 'Auto Knowledge Base Generation' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '6rem 1.5rem 2rem', position: 'relative', overflow: 'hidden',
      background: '#020617',
    }}>

      {/* 3D Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
          <AuthScene />
        </Canvas>
      </div>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(59,130,246,0.08) 0%, rgba(2,6,23,0.7) 70%)', pointerEvents: 'none' }} />

      {/* ── Layout (2 columns on large screens) ──────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '5rem', maxWidth: '960px', width: '100%' }}>

        {/* Left Info Panel (hidden on mobile) */}
        <div style={{ flex: 1, display: 'none', flexDirection: 'column', minWidth: 0 }}
          className="md-info-panel">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg,#3b82f6,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59,130,246,0.5)' }}>
              <Cpu size={18} color="white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.3rem' }}><span style={{ color: '#fff' }}>Agentic</span><span style={{ color: '#60a5fa' }}>AI</span></span>
          </Link>

          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', color: '#fff', marginBottom: '1.25rem' }}>
            Your AI-powered<br />
            <span style={{ backgroundImage: 'linear-gradient(135deg,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              knowledge engine.
            </span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>
            Transform raw support chats into structured knowledge base articles — instantly, automatically, intelligently.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.9rem 1.2rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', flexShrink: 0 }}>{f.icon}</div>
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Auth Card ────────────────────────────────────────────────────── */}
        <div ref={cardRef} style={{
          flex: '0 0 420px', maxWidth: '420px', width: '100%',
          padding: '2.5rem', borderRadius: '1.75rem',
          background: 'linear-gradient(145deg, rgba(30,41,59,0.65), rgba(15,23,42,0.95))',
          border: '1px solid rgba(255,255,255,0.09)',
          borderTop: '1px solid rgba(255,255,255,0.18)',
          backdropFilter: 'blur(32px)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>

          {/* Card Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div ref={titleRef} style={{ marginBottom: '0.5rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.75rem',
                padding: '4px 10px', borderRadius: '6px',
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                {isLogin ? 'Welcome Back' : 'Join For Free'}
              </div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </h1>
            </div>
            <p style={{ color: '#475569', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              {isLogin ? 'Access your AI knowledge base engine.' : 'Start generating articles in seconds.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '1rem' }}>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <InputField
                label="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              />
            )}
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            />

            <button
              type="submit"
              disabled={loading}
              className="premium-btn"
              style={{
                width: '100%', height: '52px', borderRadius: '12px',
                fontSize: '0.95rem', marginTop: '1.25rem',
                opacity: loading ? 0.7 : 1,
                gap: '8px', justifyContent: 'center',
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" stroke="white" strokeWidth="2" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity={0.3} />
                    <path d="M21 12a9 9 0 00-9-9" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ color: '#334155', fontSize: '0.78rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Switch Mode */}
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.88rem' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              style={{
                background: 'none', border: 'none', cursor: 'none', fontWeight: 700,
                color: '#60a5fa', fontSize: '0.88rem', padding: 0,
                transition: 'color 0.2s', fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#93c5fd'}
              onMouseLeave={e => e.currentTarget.style.color = '#60a5fa'}
            >
              {isLogin ? 'Sign Up Free' : 'Sign In'}
            </button>
          </p>

          {/* Back to home */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/" style={{ color: '#334155', fontSize: '0.78rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
              onMouseLeave={e => e.currentTarget.style.color = '#334155'}
            >
              ← Back to landing
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-info-panel { display: flex !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Auth;
