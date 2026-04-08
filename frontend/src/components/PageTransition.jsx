import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

const PageTransition = ({ children }) => {
  const el = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.current,
        {
          opacity: 0,
          y: 50,
          rotateX: 8,
          scale: 0.96,
          filter: 'blur(6px)',
          transformPerspective: 1200,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.75,
          ease: 'power4.out',
          transformPerspective: 1200,
        }
      );
    }, el);
    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div
      ref={el}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
      className="flex-1 flex flex-col"
    >
      {children}
    </div>
  );
};

export default PageTransition;
