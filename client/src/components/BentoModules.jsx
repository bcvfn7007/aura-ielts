import React, { useState } from 'react';
import { soundFx } from '../utils/audioSynth';
import { Headphones, BookOpen, FileEdit, Mic, Play, Pause, ArrowRight, Sparkles } from 'lucide-react';

export default function BentoModules({ onSelectModule }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (opt) => {
    soundFx.playClick();
    setSelectedOption(opt);
  };

  return (
    <section style={{ margin: '80px 0' }} className="reveal-section">
      <div style={{ marginBottom: '36px' }}>
        <div className="glass-pill" style={{ marginBottom: '12px' }}>
          <Sparkles size={14} /> Asymmetric Practice Modules
        </div>
        <h2 className="section-title">
          4 Targeted Practice Simulators
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '520px' }}>
          Interactive exam formats engineered specifically for official IELTS score optimization.
        </p>
      </div>

      {/* Asymmetric Bento Grid - responsive: stacks to 1 column on mobile, 12-col on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '24px'
      }} className="bento-grid">
        {/* BENTO CARD 1 (HERO): Listening Simulator */}
        <div
          className="glass-card"
          onMouseEnter={() => soundFx.playHover()}
          style={{
            gridColumn: 'span 7',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '390px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(0, 240, 255, 0.12)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Headphones size={24} color="#00F0FF" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ color: '#FFF', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2 }}>Listening Simulator</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>Real-Time Audio & Multi-Format Questions</span>
                </div>
              </div>
              <span className="glass-pill" style={{ color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)', flexShrink: 0 }}>Live Preview</span>
            </div>

            {/* Embedded Mini Player & Question */}
            <div style={{ background: 'rgba(12, 11, 24, 0.75)', border: '1px solid var(--border-glass)', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsPlayingAudio(!isPlayingAudio);
                  }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#00F0FF',
                    border: 'none',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {isPlayingAudio ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: '#00F0FF', fontWeight: 600 }}>Audio Track #1 - Deep Sea Research</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', height: '24px' }}>
                    {[40, 75, 30, 90, 60, 100, 45, 80, 50, 95, 35, 70, 85, 40].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: isPlayingAudio ? `${Math.sin(i + Date.now() / 200) * 12 + 14}px` : `${h / 4.5}px`,
                          background: isPlayingAudio ? '#00F0FF' : 'rgba(255,255,255,0.2)',
                          borderRadius: '2px',
                          transition: 'height 0.15s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#FFF', fontWeight: 600, marginBottom: '12px', lineHeight: 1.4 }}>
                Q1: What frequency range do blue whales use for long-distance communication?
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['10 - 40 Hz', '100 - 500 Hz', '1 - 5 kHz', '20 kHz'].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: selectedOption === opt ? '1px solid #00F0FF' : '1px solid var(--border-glass)',
                      background: selectedOption === opt ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                      color: selectedOption === opt ? '#00F0FF' : 'var(--text-muted)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{opt}</span>
                    {selectedOption === opt && <span style={{ color: '#00F0FF', fontWeight: 800 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onSelectModule('listening'); }}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Open Listening Practice</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* BENTO CARD 2: Reading Simulator */}
        <div
          className="glass-card"
          onMouseEnter={() => soundFx.playHover()}
          style={{
            gridColumn: 'span 5',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '390px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(108, 99, 255, 0.12)',
                border: '1px solid rgba(108, 99, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BookOpen size={24} color="#6C63FF" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ color: '#FFF', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2 }}>Reading Simulator</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>Split-Screen Passage & Questions</span>
              </div>
            </div>

            <div style={{ background: 'rgba(12, 11, 24, 0.75)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              <div style={{ color: '#6C63FF', fontWeight: 700, marginBottom: '6px' }}>Passage 1 Excerpt:</div>
              "Artificial Intelligence is transforming archaeology by enabling researchers to process remote sensing data..."
              <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(108, 99, 255, 0.12)', borderRadius: '8px', color: '#FFF', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📌 Question 1: Matching Headings</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onSelectModule('reading'); }}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Open Reading Practice</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* BENTO CARD 3: Writing & Gemini AI */}
        <div
          className="glass-card"
          onMouseEnter={() => soundFx.playHover()}
          style={{
            gridColumn: 'span 6',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '260px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(255, 70, 148, 0.12)',
                border: '1px solid rgba(255, 70, 148, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileEdit size={24} color="#FF4694" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ color: '#FFF', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2 }}>Writing & Gemini AI</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>Task 1 & Task 2 Evaluator</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
              Live word counter (150/250 words) with Gemini AI scoring across Task Achievement, Coherence, Vocabulary, and Grammar.
            </p>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onSelectModule('writing'); }}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Open Writing Practice</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* BENTO CARD 4: Speaking & Voice Recorder */}
        <div
          className="glass-card"
          onMouseEnter={() => soundFx.playHover()}
          style={{
            gridColumn: 'span 6',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '260px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(255, 184, 0, 0.12)',
                border: '1px solid rgba(255, 184, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Mic size={24} color="#FFB800" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ color: '#FFF', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2 }}>Speaking & Voice Recorder</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>Web Audio Mic & Cue Card Timer</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
              Browser microphone voice recording for Parts 1, 2, 3 with 1-minute prep timer, audio playback, and AI fluency feedback.
            </p>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onSelectModule('speaking'); }}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Open Speaking Practice</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
