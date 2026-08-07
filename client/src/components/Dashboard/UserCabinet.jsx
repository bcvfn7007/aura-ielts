import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Award, TrendingUp, History, User, Lock, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Headphones, BookOpen, FileEdit, Mic, Calendar } from 'lucide-react';

export default function UserCabinet() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history' | 'profile'
  const [history, setHistory] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [targetBand, setTargetBand] = useState(user?.target_band || 7.5);
  const [profileMsg, setProfileMsg] = useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');

  useEffect(() => {
    fetchCabinetData();
  }, []);

  const fetchCabinetData = async () => {
    setLoading(true);
    try {
      const [histRes, sumRes] = await Promise.all([
        axios.get('/api/results/history'),
        axios.get('/api/results/summary')
      ]);
      setHistory(histRes.data.results || []);
      setSummaryStats(sumRes.data.summary || null);
    } catch (err) {
      console.error('Failed to load cabinet stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      await axios.put('/api/auth/profile', {
        full_name: fullName,
        target_band: parseFloat(targetBand)
      });
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileMsg('Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    try {
      await axios.put('/api/auth/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPassMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPassMsg(err.response?.data?.error || 'Failed to change password.');
    }
  };

  // Compute average score progression trend
  const sortedHistory = [...history].sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));
  const hasHistory = sortedHistory.length > 0;
  const initialScore = hasHistory ? sortedHistory[0].band_score : null;
  const latestScore = hasHistory ? sortedHistory[sortedHistory.length - 1].band_score : null;

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }}>
      {/* User Header Profile Card */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img
            src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=IELTS'}
            alt={user?.full_name}
            style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid var(--accent-purple)', boxShadow: '0 0 20px rgba(108, 99, 255, 0.4)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>{user?.full_name || 'IELTS Student'}</h2>
              <span className="glass-pill" style={{ borderColor: 'rgba(0, 240, 255, 0.4)', color: '#00F0FF' }}>
                <ShieldCheck size={14} /> Verified Member
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
              {user?.email} • Target Band: <strong style={{ color: 'var(--accent-purple)' }}>{user?.target_band || 7.5}</strong>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '14px' }}>
          {[
            { id: 'overview', label: 'Progress Overview', icon: TrendingUp },
            { id: 'history', label: 'Test History', icon: History },
            { id: 'profile', label: 'Profile Settings', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'var(--accent-purple)' : 'transparent',
                  color: isActive ? '#FFF' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview & Band Score Growth Trend */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Progression Banner */}
          <div className="glass-card" style={{ padding: '36px', background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15) 0%, rgba(0, 240, 255, 0.1) 100%)', position: 'relative', overflow: 'hidden' }}>
            {!hasHistory ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📊</div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>No Test Results Yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Complete your first practice test in the Catalog to see your Band Score growth chart here.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <span className="glass-pill" style={{ marginBottom: '12px' }}>📈 Score Growth Timeline</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>
                      Band Score Growth: <span style={{ color: '#FFB800' }}>Band {initialScore}</span> → <span style={{ color: '#00F0FF' }}>Band {latestScore}</span>
                    </h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
                      You achieved a <strong style={{ color: '#FFF' }}>+{(latestScore - initialScore).toFixed(1)} Band boost</strong> since your first test.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '16px 24px', background: 'rgba(15, 14, 30, 0.6)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Initial Band</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: '#FFB800' }}>{initialScore}</div>
                    </div>
                    <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>➔</div>
                    <div style={{ textAlign: 'center', padding: '16px 24px', background: 'rgba(15, 14, 30, 0.6)', borderRadius: '16px', border: '1px solid var(--border-glow)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Peak</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: '#00F0FF' }}>{latestScore}</div>
                    </div>
                  </div>
                </div>

                {/* Visual Timeline Bar Chart */}
                <div style={{ marginTop: '32px', display: 'flex', alignItems: 'flex-end', gap: '12px', height: '140px', paddingTop: '20px' }}>
                  {sortedHistory.map((item, idx) => {
                    const heightPercent = (item.band_score / 9.0) * 100;
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>{item.band_score}</span>
                        <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', height: '100px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                          <div style={{ width: '100%', height: `${heightPercent}%`, background: 'linear-gradient(180deg, #00F0FF 0%, #6C63FF 100%)', borderRadius: '8px 8px 0 0', transition: 'height 0.5s ease' }}></div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Test {idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Module Strengths & Weaknesses Matrix */}
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>
            Module Skill Breakdown (Strengths vs Weaknesses)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { module: 'Listening', key: 'listening', icon: Headphones, color: '#00F0FF', strength: 'High accuracy in multiple choice & details', weakness: 'Spelling in fast numerical completion' },
              { module: 'Reading', key: 'reading', icon: BookOpen, color: '#6C63FF', strength: 'Quick scanning of academic passages', weakness: 'Matching headings in dense paragraphs' },
              { module: 'Writing', key: 'writing', icon: FileEdit, color: '#FF4694', strength: 'Strong Task 2 essay structure & argument flow', weakness: 'Lexical variety in Task 1 chart descriptions' },
              { module: 'Speaking', key: 'speaking', icon: Mic, color: '#FFB800', strength: 'Natural intonation and clear pronunciation', weakness: 'Grammatical complexity under Part 3 pressure' }
            ].map((m) => {
              const Icon = m.icon;
              const stats = summaryStats?.[m.key] || { avg: null, count: 0 };
              const hasModuleData = stats.count > 0 && stats.avg !== null;
              return (
                <div key={m.key} className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={22} color={m.color} />
                      <h4 style={{ color: '#FFF', fontSize: '1.1rem', fontWeight: 700 }}>{m.module}</h4>
                    </div>
                    <span className="glass-pill" style={{ color: hasModuleData ? m.color : 'var(--text-muted)', borderColor: hasModuleData ? `${m.color}40` : 'var(--border-glass)' }}>
                      {hasModuleData ? `Band ${stats.avg}` : 'No tests yet'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ background: 'rgba(0, 240, 255, 0.06)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                      <span style={{ color: '#00F0FF', fontWeight: 700 }}>💪 Strength:</span>
                      <div style={{ color: '#D5D2ED', marginTop: '2px' }}>{m.strength}</div>
                    </div>

                    <div style={{ background: 'rgba(255, 70, 148, 0.06)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 70, 148, 0.2)' }}>
                      <span style={{ color: '#FF4694', fontWeight: 700 }}>🎯 Target Focus:</span>
                      <div style={{ color: '#D5D2ED', marginTop: '2px' }}>{m.weakness}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Test History Table */}
      {activeTab === 'history' && (
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginBottom: '20px' }}>
            Completed Test History Log
          </h3>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No completed test records found yet. Complete a practice test in the Catalog!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '14px 16px' }}>Date</th>
                    <th style={{ padding: '14px 16px' }}>Test Title</th>
                    <th style={{ padding: '14px 16px' }}>Module</th>
                    <th style={{ padding: '14px 16px' }}>Difficulty</th>
                    <th style={{ padding: '14px 16px' }}>Band Score</th>
                    <th style={{ padding: '14px 16px' }}>Time Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} /> {row.completed_at ? row.completed_at.split(' ')[0] : 'Today'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#FFF', fontWeight: 600 }}>{row.title}</td>
                      <td style={{ padding: '16px' }}>
                        <span className="glass-pill" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                          {row.module_type}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textTransform: 'capitalize', color: 'var(--text-muted)' }}>{row.difficulty}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: row.band_score >= 7.5 ? '#00F0FF' : '#6C63FF',
                          background: 'rgba(108, 99, 255, 0.15)',
                          padding: '4px 10px',
                          borderRadius: '8px'
                        }}>
                          Band {row.band_score}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                        {Math.floor(row.time_spent_seconds / 60)}m {row.time_spent_seconds % 60}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile Settings & Password Change */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          {/* Profile Form */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#FFF', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="var(--accent-purple)" /> Profile Information
            </h3>

            {profileMsg && (
              <div style={{ background: 'rgba(0, 240, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.3)', color: '#00F0FF', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.88rem' }}>
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email Address (Read-only)</label>
                <input type="email" value={user?.email || ''} disabled className="glass-input" style={{ opacity: 0.6 }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Target IELTS Band Score</label>
                <select
                  value={targetBand}
                  onChange={(e) => setTargetBand(e.target.value)}
                  className="glass-input"
                >
                  <option value="6.0">Band 6.0</option>
                  <option value="6.5">Band 6.5</option>
                  <option value="7.0">Band 7.0</option>
                  <option value="7.5">Band 7.5</option>
                  <option value="8.0">Band 8.0</option>
                  <option value="8.5">Band 8.5</option>
                  <option value="9.0">Band 9.0</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#FFF', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} color="#FF4694" /> Change Password
            </h3>

            {passMsg && (
              <div style={{ background: passMsg.includes('success') ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 70, 148, 0.15)', border: '1px solid var(--border-glass)', color: passMsg.includes('success') ? '#00F0FF' : '#FF4694', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.88rem' }}>
                {passMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="glass-input"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #FF4694 0%, #6C63FF 100%)', marginTop: '8px' }}>
                Update Security Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
