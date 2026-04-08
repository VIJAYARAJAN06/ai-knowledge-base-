import React, { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { Bot, ArrowRight, Zap, Combine, Brain, ShieldCheck, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, MeshDistortMaterial, Torus, Icosahedron, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// ─── 3D Neural Network Scene ─────────────────────────────────────────────────
const NeuralNode = ({ position, color, speed, scale }) => {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * speed * 0.5;
      meshRef.current.rotation.z = clock.getElapsedTime() * speed * 0.3;
    }
  });
  return (
    <Float speed={speed} rotationIntensity={0.8} floatIntensity={1.5}>
      <Icosahedron ref={meshRef} args={[scale, 1]} position={position}>
        <meshStandardMaterial
          color={color}
          wireframe
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
        />
      </Icosahedron>
    </Float>
  );
};

const CoreOrb = () => {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });
  return (
    <group>
      <Sphere ref={meshRef} args={[1.8, 128, 128]}>
        <MeshDistortMaterial
          color="#1d4ed8"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          distort={0.5}
          speed={2}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>
      <Torus args={[2.5, 0.04, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} />
      </Torus>
      <Torus args={[3.1, 0.025, 16, 100]} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <meshBasicMaterial color="#34d399" transparent opacity={0.2} />
      </Torus>
    </group>
  );
};

const NeuralScene = () => (
  <>
    <Stars radius={80} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />
    <ambientLight intensity={0.2} />
    <pointLight position={[10, 10, 10]} intensity={2} color="#3b82f6" />
    <pointLight position={[-10, -10, -10]} intensity={1} color="#10b981" />
    <pointLight position={[0, 0, 5]} intensity={1.5} color="#a855f7" />
    <CoreOrb />
    <NeuralNode position={[-4, 2, -2]} color="#3b82f6" speed={1.5} scale={0.4} />
    <NeuralNode position={[4, -1.5, -1]} color="#10b981" speed={1.2} scale={0.35} />
    <NeuralNode position={[3, 2.5, -3]} color="#a855f7" speed={1.8} scale={0.3} />
    <NeuralNode position={[-3.5, -2, -2]} color="#f59e0b" speed={1.0} scale={0.45} />
    <NeuralNode position={[0, 3.5, -2]} color="#ec4899" speed={2.0} scale={0.25} />
    <NeuralNode position={[-1, -3.5, -1]} color="#06b6d4" speed={1.3} scale={0.38} />
    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.4} enablePan={false} />
  </>
);

// ─── Stats Counter ─────────────────────────────────────────────────────────────
const stats = [
  { value: '5', label: 'AI Agents', suffix: '+' },
  { value: '100', label: 'Free Forever', suffix: '%' },
  { value: '<1', label: 'Sec Generation', suffix: 's' },
  { value: '∞', label: 'Articles', suffix: '' },
];

// ─── Features ──────────────────────────────────────────────────────────────────
const features = [
  {
    icon: <Brain size={26} />,
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(99,102,241,0.4)',
    title: 'Intent Analyzer',
    desc: 'Deep NLP extraction of user pain points, tone, and root cause classification from raw support transcripts.',
  },
  {
    icon: <Bot size={26} />,
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.4)',
    title: 'Article Generator',
    desc: 'LLM-orchestrated drafting of perfectly structured documentation with title, solution, and steps.',
  },
  {
    icon: <Layers size={26} />,
    color: 'from-purple-500 to-fuchsia-600',
    glow: 'rgba(168,85,247,0.4)',
    title: 'Auto Categorizer',
    desc: 'Automatically tags and assigns categories to every generated article, keeping the knowledge base organized.',
  },
  {
    icon: <ShieldCheck size={26} />,
    color: 'from-orange-500 to-rose-600',
    glow: 'rgba(249,115,22,0.4)',
    title: 'Duplicate Shield',
    desc: 'Semantic similarity detection to find duplicate articles and intelligently merge or update them.',
  },
  {
    icon: <Zap size={26} />,
    color: 'from-yellow-400 to-orange-500',
    glow: 'rgba(234,179,8,0.4)',
    title: 'Decision Agent',
    desc: 'The orchestrator AI that decides in real-time whether to create, update, or merge — fully autonomous.',
  },
  {
    icon: <Combine size={26} />,
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.4)',
    title: 'Live Agent Graph',
    desc: 'Watch each agent light up and complete in real-time through an interactive React Flow visualization.',
  },
];

// ─── Landing Component ─────────────────────────────────────────────────────────
const Landing = () => {
  const badgeRef = useRef(null);
  const h1Ref = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo(badgeRef.current, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 })
      .fromTo(h1Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, '-=0.4')
      .fromTo(subRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .fromTo(statsRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, '-=0.3')
      .fromTo(featuresRef.current.children, { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.7 }, '-=0.2');
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      {/* ─── 3D Fullscreen Canvas ──────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10 opacity-60 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <NeuralScene />
        </Canvas>
      </div>

      {/* Gradient Overlay to blend 3D with background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950 pointer-events-none" />

      {/* ─── HERO SECTION ───────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24">
        <div ref={badgeRef} className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md"
          style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)' }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-blue-300 tracking-wide">Multi-Agent AI · 100% Free · Open Source</span>
        </div>

        <h1 ref={h1Ref} className="text-7xl md:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.9] text-white max-w-5xl mx-auto mb-8">
          Support Chats
          <br />
          <span style={{
            backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #34d399 40%, #a78bfa 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Into Knowledge.
          </span>
        </h1>

        <p ref={subRef} className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Watch five specialized AI agents collaborate in real-time — analyzing intent, detecting duplicates, generating structured documentation, and building your intelligent support library autonomously.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/dashboard"
            className="premium-btn group flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300"
          >
            Launch AI Dashboard
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="https://github.com/VIJAYARAJAN06"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            View on GitHub
          </a>
        </div>

        {/* Stats row */}
        <div ref={statsRef} className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl w-full">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-4xl font-black text-white">{stat.value}<span className="text-blue-400">{stat.suffix}</span></div>
              <div className="text-sm font-medium text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES GRID ──────────────────────────────────────────────────── */}
      <section className="px-6 py-32 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400 mb-4">Agents Architecture</div>
          <h2 className="text-5xl font-black text-white tracking-tight">Every agent. One goal.</h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">Five purpose-built AI agents that work in concert to transform noise into structured knowledge instantly.</p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-2xl transition-all duration-500 cursor-default"
              style={{
                background: 'linear-gradient(145deg, rgba(30,41,59,0.6), rgba(15,23,42,0.9))',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 0 40px ${f.glow}`;
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────────────────────────────── */}
      <section className="px-6 pb-32 max-w-4xl mx-auto text-center">
        <div className="p-12 rounded-3xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(16,185,129,0.1))', border: '1px solid rgba(59,130,246,0.3)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-emerald-600/10 pointer-events-none" />
          <h2 className="text-5xl font-black text-white mb-6 relative">Ready to Transform<br />Your Support Workflow?</h2>
          <p className="text-slate-400 text-lg mb-10 relative">Sign up free and start auto-generating your knowledge base in under 60 seconds.</p>
          <Link to="/auth" className="premium-btn inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white text-lg font-bold transition-all">
            Get Started — It's Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
