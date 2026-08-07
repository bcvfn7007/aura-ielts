import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero3D from './components/Hero3D';
import BentoModules from './components/BentoModules';
import ProgressGraph from './components/ProgressGraph';
import Testimonials from './components/Testimonials';
import TestCatalog from './components/TestCatalog';
import TestTakingView from './components/TestPlayer/TestTakingView';
import WritingTaskView from './components/Writing/WritingTaskView';
import SpeakingSimulator from './components/Speaking/SpeakingSimulator';
import UserCabinet from './components/Dashboard/UserCabinet';
import AuthModal from './components/AuthModal';
import CustomCursor from './components/CustomCursor';
import Footer from './components/Footer';
import { initLenis } from './utils/lenis';
import { soundFx } from './utils/audioSynth';
import { Sparkles, Play, Award, Headphones, BookOpen, FileEdit, Mic, ShieldCheck, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'catalog' | 'cabinet' | 'test' | 'writing' | 'speaking'
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeModuleType, setActiveModuleType] = useState('listening');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const lenis = initLenis();

    gsap.fromTo(
      '.hero-text-content',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
    );

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleStartTest = (testId, moduleType) => {
    soundFx.playClick();
    setActiveTestId(testId);
    setActiveModuleType(moduleType);

    if (moduleType === 'writing') {
      setActiveTab('writing');
    } else if (moduleType === 'speaking') {
      setActiveTab('speaking');
    } else {
      setActiveTab('test');
    }
  };

  const handleSelectModuleFromCard = (type) => {
    soundFx.playClick();
    setActiveTab('catalog');
  };

  if (activeTab === 'test' && activeTestId) {
    return (
      <TestTakingView
        testId={activeTestId}
        onExit={() => {
          setActiveTestId(null);
          setActiveTab('catalog');
        }}
      />
    );
  }

  if (activeTab === 'writing' && activeTestId) {
    return (
      <WritingTaskView
        testId={activeTestId}
        onExit={() => {
          setActiveTestId(null);
          setActiveTab('catalog');
        }}
      />
    );
  }

  if (activeTab === 'speaking' && activeTestId) {
    return (
      <SpeakingSimulator
        testId={activeTestId}
        onExit={() => {
          setActiveTestId(null);
          setActiveTab('catalog');
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Custom Progress Cursor */}
      <CustomCursor />

      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>

      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === 'home' && (
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          {/* Hero Section */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            padding: '70px 0 90px'
          }}>
            <div className="hero-text-content">
              <div className="glass-pill" style={{ marginBottom: '24px' }}>
                <Sparkles size={14} /> Full 4-Module IELTS Preparation Platform
              </div>

              {/* Display Title */}
              <h1 className="display-title" style={{ marginBottom: '24px' }}>
                Pass IELTS with <br />
                <span style={{
                  background: 'linear-gradient(135deg, #6C63FF 0%, #00F0FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  AI Scoring & CD-Simulation
                </span>
              </h1>

              <p style={{
                color: 'var(--text-muted)',
                fontSize: '1.1rem',
                lineHeight: 1.7,
                marginBottom: '36px',
                maxWidth: '520px'
              }}>
                Practice Listening, Reading split-screen, Writing with Gemini AI evaluation, and Speaking voice analysis in official Computer-Delivered format.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab('catalog');
                  }}
                  onMouseEnter={() => soundFx.playHover()}
                  className="btn-primary"
                  style={{ fontSize: '1rem', padding: '14px 32px' }}
                >
                  <Play size={18} /> Open Practice Catalog
                </button>
                {!user ? (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setAuthModalOpen(true);
                    }}
                    onMouseEnter={() => soundFx.playHover()}
                    className="btn-secondary"
                    style={{ fontSize: '1rem', padding: '14px 28px' }}
                  >
                    Create Free Account
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setActiveTab('cabinet');
                    }}
                    onMouseEnter={() => soundFx.playHover()}
                    className="btn-secondary"
                    style={{ fontSize: '1rem', padding: '14px 28px' }}
                  >
                    Personal Cabinet
                  </button>
                )}
              </div>

              {/* Honest Platform Capabilities (No fake stats) */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '48px', paddingTop: '28px', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={16} color="#00F0FF" /> 4 Official IELTS Formats
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={16} color="#6C63FF" /> Gemini 2.5 AI Analysis
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={16} color="#FFB800" /> Web Audio Recorder
                </div>
              </div>
            </div>

            {/* 3D Scene */}
            <div style={{ width: '100%', height: '480px', position: 'relative' }}>
              <Hero3D />
            </div>
          </section>

          {/* Asymmetric 4-Module Bento Grid */}
          <BentoModules onSelectModule={handleSelectModuleFromCard} />

          {/* Band Score Progression Spline Graph */}
          <ProgressGraph user={user} />

          {/* Testimonials */}
          <Testimonials />
        </main>
      )}

      {activeTab === 'catalog' && (
        <TestCatalog onSelectTest={handleStartTest} />
      )}

      {activeTab === 'cabinet' && (
        <UserCabinet />
      )}

      <Footer onNavigate={setActiveTab} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
