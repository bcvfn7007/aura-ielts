import React from 'react';
import { Star, Quote, Award } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Elena Rostova',
    role: 'Admitted to Oxford University',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    target: '7.0 Target',
    achieved: 'Band 8.5',
    comment: 'The Listening audio speed control and split-screen Reading test environment made real exam day feel surprisingly easy!',
    rating: 5
  },
  {
    name: 'Alexander Novak',
    role: 'Express Entry PR Applicant',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    target: '7.5 Target',
    achieved: 'Band 8.0',
    comment: 'The automatic sentence completion scoring algorithm saved me hours. Instant feedback on exact grammar errors!',
    rating: 5
  },
  {
    name: 'Sophia Chen',
    role: 'Medical Residency Scholar',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    target: '7.0 Target',
    achieved: 'Band 8.5',
    comment: 'Gorgeous dark glassmorphism design that didn’t strain my eyes during 3-hour study sessions. Passed on my first try!',
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section style={{ margin: '80px 0' }} className="reveal-section">
      <div style={{ textAlign: 'center', marginBottom: '44px' }}>
        <span className="glass-pill" style={{ marginBottom: '12px' }}>
          <Award size={14} /> Proven Success
        </span>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFF' }}>
          Loved by High-Scoring Students
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '10px auto 0' }}>
          Join thousands of candidates who reached Band 7.5+ using our targeted IELTS engines.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {REVIEWS.map((rev, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#FFB800" color="#FFB800" />
                  ))}
                </div>
                <div className="glass-pill" style={{ background: 'rgba(0, 240, 255, 0.12)', color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)' }}>
                  {rev.achieved}
                </div>
              </div>

              <p style={{ color: '#D5D3E8', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.6 }}>
                "{rev.comment}"
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
              <img
                src={rev.avatar}
                alt={rev.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }}
              />
              <div>
                <h4 style={{ color: '#FFF', fontSize: '1rem', fontWeight: 700 }}>{rev.name}</h4>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{rev.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
