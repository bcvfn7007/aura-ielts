import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetBand, setTargetBand] = useState('7.5');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, fullName, parseFloat(targetBand));
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      background: 'rgba(5, 4, 12, 0.82)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', marginBottom: '28px' }}>
          <button
            onClick={() => { setIsRegister(false); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: !isRegister ? 'var(--accent-purple)' : 'transparent',
              color: !isRegister ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: isRegister ? 'var(--accent-purple)' : 'transparent',
              color: isRegister ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', marginBottom: '8px', textAlign: 'center' }}>
          {isRegister ? 'Start Your IELTS Journey' : 'Welcome Back'}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px' }}>
          {isRegister ? 'Create an account to track your progress & save results.' : 'Sign in to access your practice history and tests.'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(255, 70, 148, 0.15)',
            border: '1px solid rgba(255, 70, 148, 0.4)',
            color: '#FF4694',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Target Band Score: <strong style={{ color: 'var(--accent-purple)' }}>{targetBand}</strong>
              </label>
              <select
                value={targetBand}
                onChange={(e) => setTargetBand(e.target.value)}
                className="glass-input"
              >
                <option value="6.0">Band 6.0</option>
                <option value="6.5">Band 6.5</option>
                <option value="7.0">Band 7.0</option>
                <option value="7.5">Band 7.5 (Recommended)</option>
                <option value="8.0">Band 8.0</option>
                <option value="8.5">Band 8.5</option>
                <option value="9.0">Band 9.0 (Expert)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Free Account' : 'Sign In Now'}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
