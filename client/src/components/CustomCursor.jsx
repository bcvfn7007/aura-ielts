import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      const isClickable = target.closest('button, a, input, select, textarea, .glass-card, [role="button"]');
      setIsHovered(!!isClickable);
    };

    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = Math.round((winScroll / (height || 1)) * 100);
      setScrollPercent(scrolled);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: pos.y,
        left: pos.x,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), width 0.2s ease, height 0.2s ease'
      }}
    >
      <div style={{
        width: isHovered ? '46px' : '34px',
        height: isHovered ? '46px' : '34px',
        borderRadius: '50%',
        border: '1.5px solid rgba(108, 99, 255, 0.7)',
        background: isHovered ? 'rgba(108, 99, 255, 0.15)' : 'rgba(11, 10, 22, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isHovered ? '0 0 15px rgba(108, 99, 255, 0.4)' : 'none',
        transition: 'all 0.15s ease'
      }}>
        <span style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
          color: '#00F0FF',
          letterSpacing: '-0.02em'
        }}>
          {scrollPercent}%
        </span>
      </div>
    </div>
  );
}
