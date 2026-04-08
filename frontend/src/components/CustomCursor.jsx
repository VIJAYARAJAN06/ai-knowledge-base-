import React, { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const trailsRef = useRef([]);
  const pos      = useRef({ x: -100, y: -100 });
  const ring     = useRef({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const raf = useRef(null);

  // Trail particles
  const TRAIL_COUNT = 8;
  const trails = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 })));

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';

    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const down  = () => setClicked(true);
    const up    = () => setClicked(false);

    const enterInteractive = (e) => {
      if (e.target.closest('a, button, input, textarea, [role="button"]')) {
        setHovered(true);
      }
    };
    const leaveInteractive = (e) => {
      if (e.target.closest('a, button, input, textarea, [role="button"]')) {
        setHovered(false);
      }
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    document.addEventListener('mouseover', enterInteractive);
    document.addEventListener('mouseout', leaveInteractive);

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      // Dot snaps to mouse
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 5}px, ${pos.current.y - 5}px)`;
      }

      // Ring lags behind with lerp
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`;
      }

      // Trail: each follows the previous
      trails.current[0] = { x: lerp(trails.current[0].x, pos.current.x, 0.3), y: lerp(trails.current[0].y, pos.current.y, 0.3) };
      for (let i = 1; i < TRAIL_COUNT; i++) {
        trails.current[i] = {
          x: lerp(trails.current[i].x, trails.current[i - 1].x, 0.5),
          y: lerp(trails.current[i].y, trails.current[i - 1].y, 0.5),
        };
      }

      trailsRef.current.forEach((el, i) => {
        if (el) {
          const size = 6 - i * 0.55;
          const opacity = 0.6 - i * 0.07;
          el.style.transform = `translate(${trails.current[i].x - size / 2}px, ${trails.current[i].y - size / 2}px)`;
          el.style.opacity = opacity;
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
        }
      });

      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      document.removeEventListener('mouseover', enterInteractive);
      document.removeEventListener('mouseout', leaveInteractive);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const baseStyle = {
    position: 'fixed',
    top: 0, left: 0,
    pointerEvents: 'none',
    zIndex: 99999,
    borderRadius: '50%',
    transition: 'width 0.2s, height 0.2s, background 0.2s, box-shadow 0.2s',
    willChange: 'transform',
  };

  return (
    <>
      {/* Outer Ring */}
      <div
        ref={ringRef}
        style={{
          ...baseStyle,
          width: hovered ? '55px' : clicked ? '30px' : '40px',
          height: hovered ? '55px' : clicked ? '30px' : '40px',
          background: 'transparent',
          border: hovered
            ? '2px solid #10b981'
            : '1.5px solid rgba(99,179,246,0.7)',
          boxShadow: hovered
            ? '0 0 20px rgba(16,185,129,0.6)'
            : '0 0 10px rgba(59,130,246,0.4)',
          mixBlendMode: 'normal',
        }}
      />

      {/* Center Dot */}
      <div
        ref={dotRef}
        style={{
          ...baseStyle,
          width: hovered ? '8px' : clicked ? '14px' : '10px',
          height: hovered ? '8px' : clicked ? '14px' : '10px',
          background: hovered ? '#10b981' : '#60a5fa',
          boxShadow: hovered
            ? '0 0 15px rgba(16,185,129,0.9), 0 0 30px rgba(16,185,129,0.4)'
            : '0 0 12px rgba(96,165,250,0.9), 0 0 25px rgba(59,130,246,0.5)',
        }}
      />

      {/* Glow Trail */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={el => (trailsRef.current[i] = el)}
          style={{
            ...baseStyle,
            background: i < 3 ? '#60a5fa' : i < 6 ? '#818cf8' : '#a855f7',
            boxShadow: `0 0 6px ${i < 3 ? '#60a5fa' : i < 6 ? '#818cf8' : '#a855f7'}`,
          }}
        />
      ))}
    </>
  );
};

export default CustomCursor;
