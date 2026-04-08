import React, { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { Bot, ArrowRight, Zap, Combine, Brain, ShieldCheck, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial, Torus, Icosahedron, Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ─── 3D Floating Agent Node ──────────────────────────────────────────────────
const AgentNode = ({ position, color, speed = 1.2, size = 0.35 }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.getElapsedTime() * speed * 0.4;
    ref.current.rotation.z = clock.getElapsedTime() * speed * 0.3;
  });
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={2}>
      <Icosahedron ref={ref} args={[size, 1]} position={position}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          wireframe
          transparent
          opacity={0.85}
        />
      </Icosahedron>
    </Float>
  );
};

// ─── Central Core Orb ────────────────────────────────────────────────────────
const CoreOrb = () => {
  const ref = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) ref.current.rotation.y = t * 0.12;
    if (ring1.current) { ring1.current.rotation.z = t * 0.4; }
    if (ring2.current) { ring2.current.rotation.x = t * 0.25; ring2.current.rotation.z = t * 0.15; }
    if (ring3.current) { ring3.current.rotation.y = t * 0.3; ring3.current.rotation.x = -t * 0.2; }
  });

  return (
    <group>
      {/* Core Sphere */}
      <mesh ref={ref}>
        <sphereGeometry args={[1.6, 128, 128]} />
        <MeshDistortMaterial
          color="#1e40af"
          emissive="#3b82f6"
          emissiveIntensity={0.6}
          distort={0.45}
          speed={2}
          roughness={0.05}
          metalness={0.95}
        />
      </mesh>
      {/* Orbital Rings */}
      <Torus ref={ring1} args={[2.5, 0.025, 16, 200]}>
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.4} />
      </Torus>
      <Torus ref={ring2} args={[3.2, 0.018, 16, 200]} rotation={[1.2, 0.5, 0]}>
        <meshBasicMaterial color="#34d399" transparent opacity={0.3} />
      </Torus>
      <Torus ref={ring3} args={[3.9, 0.012, 16, 200]} rotation={[0.5, 1.1, 0.8]}>
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.25} />
      </Torus>
      {/* Sparkles around orb */}
      <Sparkles count={80} scale={8} size={1.5} speed={0.4} color="#60a5fa" opacity={0.7} />
    </group>
  );
};

// ─── Mouse Parallax Camera ────────────────────────────────────────────────────
const ParallaxCamera = () => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current.y * 1.0 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// ─── Full 3D Scene ────────────────────────────────────────────────────────────
const Scene = () => (
  <>
    <Stars radius={100} depth={60} count={4000} factor={4} saturation={0.3} fade speed={0.6} />
    <ambientLight intensity={0.15} />
    <pointLight position={[8, 8, 8]}   intensity={3} color="#3b82f6" />
    <pointLight position={[-8, -8, -6]} intensity={2} color="#10b981" />
    <pointLight position={[0, 0, 6]}   intensity={2} color="#a855f7" />
    <CoreOrb />
    <AgentNode position={[-4.5, 2.2, -1.5]} color="#3b82f6" speed={1.4} size={0.42} />
    <AgentNode position={[4.5, -1.8, -1.0]} color="#10b981" speed={1.1} size={0.38} />
    <AgentNode position={[3.5,  2.8, -2.5]} color="#a855f7" speed={1.7} size={0.32} />
    <AgentNode position={[-4.0, -2.5, -2.0]} color="#f59e0b" speed={0.9} size={0.45} />
    <AgentNode position={[0.5,  4.0, -1.5]} color="#ec4899" speed={2.0} size={0.28} />
    <AgentNode position={[-2.0, -4.0, -1.0]} color="#06b6d4" speed={1.3} size={0.36} />
    <ParallaxCamera />
  </>
);

// ─── Features Data ────────────────────────────────────────────────────────────
const features = [
  { icon: <Brain size={24} />, color: 'from-blue-500 to-indigo-600', glow: '#3b82f6', title: 'Intent Analyzer', desc: 'Deep NLP extraction of user pain points, tone, and root cause classification.' },
  { icon: <Bot size={24} />, color: 'from-emerald-500 to-teal-600', glow: '#10b981', title: 'Article Generator', desc: 'LLM-orchestrated draft of structured documentation with title, solution, and steps.' },
  { icon: <Layers size={24} />, color: 'from-purple-500 to-fuchsia-600', glow: '#a855f7', title: 'Auto Categorizer', desc: 'Auto-tags and assigns categories to every article, keeping the knowledge base clean.' },
  { icon: <ShieldCheck size={24} />, color: 'from-orange-500 to-rose-600', glow: '#f97316', title: 'Duplicate Shield', desc: 'Semantic similarity detection to find and intelligently merge duplicate articles.' },
  { icon: <Zap size={24} />, color: 'from-yellow-400 to-orange-500', glow: '#eab308', title: 'Decision Agent', desc: 'Orchestrator AI that decides in real-time whether to create, update, or merge.' },
  { icon: <Combine size={24} />, color: 'from-cyan-500 to-blue-600', glow: '#06b6d4', title: 'Live Agent Graph', desc: 'Watch each agent light up and complete in real-time through an interactive visualization.' },
];

// ─── Landing Page ─────────────────────────────────────────────────────────────
const Landing = () => {
  const badgeRef    = useRef(null);
  const headingRef  = useRef(null);
  const subRef      = useRef(null);
  const ctaRef      = useRef(null);
  const statsRef    = useRef(null);
  const featRef     = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo(badgeRef.current,   { opacity: 0, y: 25, scale: 0.85 }, { opacity: 1, y: 0, scale: 1,   duration: 0.8 })
      .fromTo(headingRef.current, { opacity: 0, y: 60 },               { opacity: 1, y: 0,              duration: 1.1 }, '-=0.5')
      .fromTo(subRef.current,     { opacity: 0, y: 30 },               { opacity: 1, y: 0,              duration: 0.8 }, '-=0.6')
      .fromTo(ctaRef.current,     { opacity: 0, y: 20 },               { opacity: 1, y: 0,              duration: 0.7 }, '-=0.5')
      .fromTo(statsRef.current.children, { opacity: 0, y: 20 },        { opacity: 1, y: 0, stagger: 0.1,duration: 0.6 }, '-=0.3');

    // Feature cards stagger
    if (featRef.current) {
      gsap.fromTo(
        featRef.current.children,
        { opacity: 0, y: 60, rotateX: 15, transformPerspective: 800 },
        {
          opacity: 1, y: 0, rotateX: 0,
          stagger: 0.1, duration: 0.8,
          ease: 'power4.out',
          scrollTrigger: { trigger: featRef.current, start: 'top 85%' },
          delay: 0.3,
        }
      );
    }
  }, []);

  return (
    <div style={{ background: '#020617', minHeight: '100vh', overflow: 'hidden' }}>

      {/* ── FULL 3D CANVAS ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(30,64,175,0.25) 0%, rgba(2,6,23,0) 70%)',
      }}>
        <Canvas
          camera={{ position: [0, 0, 9], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Scene />
        </Canvas>
      </div>

      {/* Gradient Fade at bottom */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '40vh', zIndex: 1,
        background: 'linear-gradient(to top, #020617 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── HERO SECTION ───────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '7rem 1.5rem 4rem' }}>

        <div ref={badgeRef} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', borderRadius: '999px', marginBottom: '2rem',
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.35)',
          backdropFilter: 'blur(10px)', opacity: 0,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.05em' }}>MULTI-AGENT AI · 100% FREE · OPEN SOURCE</span>
        </div>

        <h1 ref={headingRef} style={{
          textAlign: 'center', fontWeight: 900, lineHeight: 0.92,
          letterSpacing: '-0.04em', marginBottom: '1.5rem',
          fontSize: 'clamp(3.5rem, 10vw, 8rem)',
          opacity: 0,
        }}>
          <span style={{ color: '#fff', display: 'block' }}>Support Chats,</span>
          <span style={{
            display: 'block',
            backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #34d399 45%, #c084fc 90%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Into Knowledge.</span>
        </h1>

        <p ref={subRef} style={{
          textAlign: 'center', maxWidth: '680px', marginBottom: '2.5rem',
          fontSize: '1.15rem', lineHeight: 1.7, color: '#94a3b8', opacity: 0,
        }}>
          Five specialized AI agents collaborate in real-time — analyzing intent, detecting duplicates, generating structured documentation, and building your intelligent support library autonomously.
        </p>

        <div ref={ctaRef} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', opacity: 0 }}>
          <Link to="/dashboard" className="premium-btn pulse-glow" style={{ padding: '1rem 2.2rem', borderRadius: '1rem', fontSize: '1rem', gap: '10px' }}>
            Launch AI Dashboard <ArrowRight size={20} />
          </Link>
          <a href="https://github.com/VIJAYARAJAN06" target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '1rem 2rem', borderRadius: '1rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.13)',
            backdropFilter: 'blur(10px)', color: '#e2e8f0',
            fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            View on GitHub
          </a>
        </div>

        {/* Stats */}
        <div ref={statsRef} style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
          marginTop: '5rem', maxWidth: '700px', width: '100%',
        }}>
          {[
            { v: '5+', l: 'AI Agents' },
            { v: '100%', l: 'Free Forever' },
            { v: '<1s', l: 'Generation' },
            { v: '∞', l: 'Articles' },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '1.2rem 0.8rem', borderRadius: '1rem',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(10px)', opacity: 0,
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{s.v}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES SECTION ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '6rem 1.5rem 8rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.3em', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Multi-Agent Architecture
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Every agent. One goal.
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            Five purpose-built AI agents working in concert to transform support noise into structured knowledge.
          </p>
        </div>

        <div ref={featRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="card-3d"
              style={{
                padding: '2rem', borderRadius: '1.25rem',
                background: 'linear-gradient(145deg, rgba(30,41,59,0.6), rgba(15,23,42,0.9))',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                cursor: 'default', opacity: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 0 40px ${f.glow}50, 0 20px 40px rgba(0,0,0,0.4)`;
                e.currentTarget.style.borderColor = `${f.glow}40`;
                e.currentTarget.style.transform = 'translateY(-6px) rotateX(3deg) rotateY(-3deg)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', marginBottom: '1.25rem',
                background: `linear-gradient(135deg, ${f.color.includes('blue') ? '#3b82f6' : f.color.includes('emerald') ? '#10b981' : f.color.includes('purple') ? '#a855f7' : f.color.includes('orange') ? '#f97316' : f.color.includes('yellow') ? '#eab308' : '#06b6d4'}, transparent)`,
                backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                boxShadow: `0 4px 15px ${f.glow}40`,
              }} className={`bg-gradient-to-br ${f.color}`}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.6rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 1.5rem 10rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          padding: '4rem 3rem', borderRadius: '2rem', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(16,185,129,0.1))',
          border: '1px solid rgba(59,130,246,0.25)',
          backdropFilter: 'blur(20px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(59,130,246,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '1rem', position: 'relative' }}>
            Ready to Transform Your Support Workflow?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem', position: 'relative' }}>
            Sign up free and start auto-generating your knowledge base in under 60 seconds.
          </p>
          <Link to="/auth" className="premium-btn" style={{ padding: '1rem 2.5rem', borderRadius: '1rem', fontSize: '1.05rem', gap: '10px' }}>
            Get Started — It's Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
