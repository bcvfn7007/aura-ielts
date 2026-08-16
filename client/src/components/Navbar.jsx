import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, LogIn, LogOut, BookOpen, User } from 'lucide-react';

export default function Navbar({ onOpenAuth, activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6C63FF 0%, #00F0FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(108, 99, 255, 0.5)'
          }}>
            <Award size={24} color="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>
              Band<span style={{ color: 'var(--accent-purple)' }}>Up</span>
            </span>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              AI IELTS Platform
            </div>
          </div>
        </div>

        {/* Center Navigation Links */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: activeTab === 'home' ? 'rgba(108, 99, 255, 0.2)' : 'transparent',
              border: activeTab === 'home' ? '1px solid rgba(108, 99, 255, 0.4)' : '1px solid transparent',
              color: activeTab === 'home' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: activeTab === 'catalog' ? 'rgba(108, 99, 255, 0.2)' : 'transparent',
              border: activeTab === 'catalog' ? '1px solid rgba(108, 99, 255, 0.4)' : '1px solid transparent',
              color: activeTab === 'catalog' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <BookOpen size={16} /> Practice Catalog
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('cabinet')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: activeTab === 'cabinet' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                border: activeTab === 'cabinet' ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                color: activeTab === 'cabinet' ? '#00F0FF' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <User size={16} /> Personal Cabinet
            </button>
          )}
        </div>

        {/* Right Auth / Profile Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="glass-pill" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('cabinet')}>
                <Award size={14} /> Target Band {user.target_band || 7.5}
              </div>
              <div onClick={() => setActiveTab('cabinet')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <img
                  src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=IELTS'}
                  alt={user.full_name}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--accent-purple)' }}
                />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFF' }}>{user.full_name}</span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'rgba(255, 70, 148, 0.15)',
                  border: '1px solid rgba(255, 70, 148, 0.3)',
                  color: '#FF4694',
                  padding: '8px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-primary">
              <LogIn size={16} /> Sign In / Register
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
