import React, { useState } from 'react';
import { Headphones, BookOpen, FileEdit, Mic, Clock, Flag, CheckCircle2, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function Hero3D() {
  const [activeTab, setActiveTab] = useState('writing');
  const [selectedAnswer, setSelectedAnswer] = useState('B');

  return (
    <div className="glass-card" style={{
      width: '100%',
      padding: '28px',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(145deg, rgba(18, 17, 34, 0.85) 0%, rgba(12, 11, 24, 0.95) 100%)',
      border: '1px solid rgba(108, 99, 255, 0.3)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(108, 99, 255, 0.15)'
    }}>
      {/* Top Header Mockup */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#00F0FF',
            boxShadow: '0 0 10px #00F0FF'
          }}></div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>
            CD-IELTS Official Simulator
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="glass-pill" style={{ fontSize: '0.75rem', color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)' }}>
            <Clock size={12} /> 00:58:24
          </span>
          <span className="glass-pill" style={{ fontSize: '0.75rem', color: '#FFB800', borderColor: 'rgba(255, 184, 0, 0.3)' }}>
            Exam Mode
          </span>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px' }}>
        {[
          { id: 'listening', label: 'Listening', icon: Headphones, color: '#00F0FF' },
          { id: 'reading', label: 'Reading', icon: BookOpen, color: '#6C63FF' },
          { id: 'writing', label: 'Writing AI', icon: FileEdit, color: '#FF4694' },
          { id: 'speaking', label: 'Speaking', icon: Mic, color: '#FFB800' }
        ].map((m) => {
          const Icon = m.icon;
          const isActive = activeTab === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              style={{
                flex: 1,
                padding: '8px 6px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? m.color : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={14} /> {m.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Preview based on selected tab */}
      {activeTab === 'writing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'rgba(255, 70, 148, 0.08)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 70, 148, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#FF4694', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} /> Gemini 2.5 AI Evaluation Result
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFF', background: '#FF4694', padding: '2px 8px', borderRadius: '6px' }}>
                Band 7.5
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#E0DEFA', lineHeight: 1.5 }}>
              "Strong Task Achievement with clear paragraphing and varied academic connectors. Minor vocabulary collocations can be refined for Band 8.0."
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Task Achievement</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#00F0FF', marginTop: '2px' }}>Band 7.5</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Coherence & Cohesion</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#6C63FF', marginTop: '2px' }}>Band 7.0</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'listening' && (
        <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          <div style={{ fontSize: '0.8rem', color: '#00F0FF', fontWeight: 700, marginBottom: '8px' }}>
            Audio Track #1 — Section 1 Form Completion
          </div>
          <div style={{ fontSize: '0.84rem', color: '#FFF', fontWeight: 600, marginBottom: '10px' }}>
            Q1: Customer Surname: <span style={{ color: '#00F0FF', borderBottom: '1px dashed #00F0FF', padding: '0 6px' }}>Jenkins</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ✓ Real-time transcript answer highlighting enabled in review mode.
          </div>
        </div>
      )}

      {activeTab === 'reading' && (
        <div style={{ background: 'rgba(108, 99, 255, 0.08)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(108, 99, 255, 0.2)' }}>
          <div style={{ fontSize: '0.8rem', color: '#6C63FF', fontWeight: 700, marginBottom: '8px' }}>
            Split-Screen Academic Passage 1
          </div>
          <div style={{ fontSize: '0.82rem', color: '#E0DEFA', lineHeight: 1.5, marginBottom: '10px' }}>
            "Artificial Intelligence is transforming archaeology by processing satellite imagery..."
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', background: 'rgba(108, 99, 255, 0.2)', color: '#6C63FF', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Matching Headings
            </span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(0, 240, 255, 0.2)', color: '#00F0FF', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
              True / False / Not Given
            </span>
          </div>
        </div>
      )}

      {activeTab === 'speaking' && (
        <div style={{ background: 'rgba(255, 184, 0, 0.08)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 184, 0, 0.2)' }}>
          <div style={{ fontSize: '0.8rem', color: '#FFB800', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mic size={14} /> Web Audio Mic & Speech-to-Text
          </div>
          <div style={{ fontSize: '0.82rem', color: '#E0DEFA', lineHeight: 1.5 }}>
            Real-time live speech recognition captures your response and sends it to Gemini AI for Fluency, Pronunciation & Grammar band scoring.
          </div>
        </div>
      )}

      {/* Navigator Q1 - Q10 Bar Mockup */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Question Navigator (Q1 - Q10)</span>
          <span style={{ fontSize: '0.72rem', color: '#00F0FF' }}>8 / 10 Answered</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isAnswered = num <= 8;
            const isFlagged = num === 4;
            return (
              <div
                key={num}
                style={{
                  height: '28px',
                  borderRadius: '6px',
                  background: isFlagged
                    ? 'rgba(255, 184, 0, 0.25)'
                    : isAnswered
                    ? 'rgba(0, 240, 255, 0.2)'
                    : 'rgba(255,255,255,0.04)',
                  border: isFlagged
                    ? '1px solid #FFB800'
                    : isAnswered
                    ? '1px solid rgba(0, 240, 255, 0.4)'
                    : '1px solid var(--border-glass)',
                  color: isFlagged ? '#FFB800' : isAnswered ? '#00F0FF' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
