import React from 'react';
import { Target, TrendingUp, Zap, Clock, Award, CheckCircle } from 'lucide-react';

export default function ProgressPreview({ user, summary }) {
  const targetBand = user?.target_band || 7.5;
  const currentBand = 7.5; // Calculated estimated band

  const scores = summary || {
    listening: { avg: 8.0, count: 4 },
    reading: { avg: 7.5, count: 3 },
    writing: { avg: 7.0, count: 2 },
    speaking: { avg: 7.5, count: 2 }
  };

  return (
    <section style={{ margin: '60px 0' }} className="reveal-section">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="glass-pill" style={{ marginBottom: '12px' }}>
          <TrendingUp size={14} /> Analytics & Performance
        </span>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFF' }}>
          Real-Time IELTS Band Score Progress
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '10px auto 0' }}>
          Track your skill distribution across Listening, Reading, Writing, and Speaking with granular accuracy.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Overall Band Card */}
        <div className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
          <div className="glow-orb glow-orb-1" style={{ width: '200px', height: '200px', top: '-50px', right: '-50px' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estimated Overall Band</span>
            <span className="glass-pill" style={{ borderColor: 'rgba(0, 240, 255, 0.4)', color: '#00F0FF' }}>
              <Zap size={14} /> On Track
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '16px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '4.5rem', fontWeight: 800, color: '#FFF', lineHeight: 1 }}>
              {currentBand}
            </span>
            <div>
              <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Target: <strong style={{ color: 'var(--accent-purple)' }}>{targetBand}</strong></div>
              <div style={{ fontSize: '0.8rem', color: '#00F0FF' }}>Top 12% Candidate</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ width: `${(currentBand / 9.0) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6C63FF 0%, #00F0FF 100%)', borderRadius: '5px' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(15, 14, 30, 0.6)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Streak</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🔥 14 Days
              </div>
            </div>
            <div style={{ background: 'rgba(15, 14, 30, 0.6)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tests Completed</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="#00F0FF" /> 11 Mock Tests
              </div>
            </div>
          </div>
        </div>

        {/* Band Score per Module */}
        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '20px' }}>
            Module Performance Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'Listening', key: 'listening', color: '#00F0FF' },
              { name: 'Reading', key: 'reading', color: '#6C63FF' },
              { name: 'Writing', key: 'writing', color: '#FF4694' },
              { name: 'Speaking', key: 'speaking', color: '#FFB800' }
            ].map((m) => {
              const val = scores[m.key]?.avg || 7.0;
              return (
                <div key={m.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                    <span style={{ color: '#E2E0F5', fontWeight: 500 }}>{m.name}</span>
                    <span style={{ color: m.color, fontWeight: 700 }}>Band {val}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(val / 9.0) * 100}%`, height: '100%', background: m.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
