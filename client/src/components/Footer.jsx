import React from 'react';
import { Award, Github, Twitter, Globe, ShieldAlert } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="glass-nav" style={{ marginTop: '100px', padding: '60px 24px 30px', borderTop: '1px solid var(--border-glass)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6C63FF 0%, #00F0FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={20} color="#FFF" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: '#FFF' }}>
              Aura<span style={{ color: 'var(--accent-purple)' }}>IELTS</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Next-generation IELTS preparation suite offering original practice materials in standard exam formats across Listening, Reading, Writing (Gemini AI), and Speaking.
          </p>
        </div>

        {/* Modules */}
        <div>
          <h4 style={{ color: '#FFF', fontSize: '1rem', marginBottom: '16px' }}>Practice Modules</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <li onClick={() => onNavigate('catalog')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Listening Simulator</li>
            <li onClick={() => onNavigate('catalog')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Reading Split-Screen</li>
            <li onClick={() => onNavigate('catalog')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Writing Evaluation</li>
            <li onClick={() => onNavigate('catalog')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Speaking Cue Cards</li>
          </ul>
        </div>

        {/* System info */}
        <div>
          <h4 style={{ color: '#FFF', fontSize: '1rem', marginBottom: '16px' }}>Features</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <li>CD-IELTS Question Navigator</li>
            <li>Answer-Highlighted Transcripts</li>
            <li>Study & Exam Simulator Modes</li>
            <li>Web Audio Sound Effects</li>
          </ul>
        </div>
      </div>

      {/* Trademark Legal Disclaimer */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto 20px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '1px solid var(--border-glass)',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <ShieldAlert size={18} color="var(--accent-purple)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#FFF' }}>Legal Trademark Disclaimer:</strong> IELTS® is a registered trademark of Cambridge University Press & Assessment, the British Council, and IDP Education Australia. This platform provides 100% original practice materials formatted according to standard specifications for educational purposes and is not affiliated with, endorsed, or approved by official trademark holders.
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div>© 2026 AuraIELTS Prep Engine. Designed for score optimization.</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Github size={18} style={{ cursor: 'pointer' }} />
          <Twitter size={18} style={{ cursor: 'pointer' }} />
          <Globe size={18} style={{ cursor: 'pointer' }} />
        </div>
      </div>
    </footer>
  );
}
