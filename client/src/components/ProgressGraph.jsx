import React from 'react';
import { soundFx } from '../utils/audioSynth';
import { TrendingUp, Zap, Target, Award } from 'lucide-react';

export default function ProgressGraph({ user }) {
  const targetBand = user?.target_band || 7.5;

  return (
    <section style={{ margin: '80px 0' }} className="reveal-section">
      <div style={{ marginBottom: '32px' }}>
        <div className="glass-pill" style={{ marginBottom: '12px' }}>
          <TrendingUp size={14} /> Performance Analytics
        </div>
        <h2 className="section-title">
          Band Score Progression Graph
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
          Continuous skill tracking from initial diagnostic evaluation to official target band.
        </p>
      </div>

      {/* SVG Spline Curve Container */}
      <div className="glass-card" style={{ padding: '36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Score Growth Trajectory</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, color: '#FFF' }}>
              Band 5.5 <span style={{ color: '#00F0FF' }}>➔</span> Band 8.5
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="glass-pill" style={{ borderColor: 'rgba(0, 240, 255, 0.3)', color: '#00F0FF' }}>
              <Zap size={14} /> Active Streak: 14 Days
            </div>
            <div className="glass-pill" style={{ borderColor: 'rgba(108, 99, 255, 0.3)', color: '#6C63FF' }}>
              <Target size={14} /> Target: Band {targetBand}
            </div>
          </div>
        </div>

        {/* Animated SVG Curve */}
        <div style={{ position: 'relative', width: '100%', height: '200px', marginTop: '20px' }}>
          <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6C63FF" />
                <stop offset="50%" stopColor="#00F0FF" />
                <stop offset="100%" stopColor="#FF4694" />
              </linearGradient>
            </defs>

            {/* Filled Area beneath curve */}
            <path
              d="M 50 160 Q 200 140, 350 100 T 650 40 T 750 20 L 750 190 L 50 190 Z"
              fill="url(#curveGradient)"
            />

            {/* Animated Spline Line */}
            <path
              d="M 50 160 Q 200 140, 350 100 T 650 40 T 750 20"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 0,
                animation: 'dashDraw 2s ease-out forwards'
              }}
            />

            {/* Point Markers */}
            {[
              { x: 50, y: 160, label: 'Band 5.5', date: 'Test #1' },
              { x: 230, y: 130, label: 'Band 6.5', date: 'Test #2' },
              { x: 410, y: 90, label: 'Band 7.0', date: 'Test #3' },
              { x: 590, y: 50, label: 'Band 7.5', date: 'Test #4' },
              { x: 750, y: 20, label: 'Band 8.5', date: 'Latest' }
            ].map((pt, i) => (
              <g key={i} onMouseEnter={() => soundFx.playHover()} style={{ cursor: 'pointer' }}>
                <circle cx={pt.x} cy={pt.y} r="6" fill="#080711" stroke="#00F0FF" strokeWidth="3" />
                <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="700" fontFamily="var(--font-heading)">
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Bottom Skill Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-glass)' }}>
          {[
            { name: 'Listening', band: '8.0', color: '#00F0FF' },
            { name: 'Reading', band: '7.5', color: '#6C63FF' },
            { name: 'Writing (Gemini AI)', band: '7.0', color: '#FF4694' },
            { name: 'Speaking (Web Audio)', band: '7.5', color: '#FFB800' }
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(12, 11, 24, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.name}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color, marginTop: '2px' }}>Band {s.band}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
