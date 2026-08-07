import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { soundFx } from '../utils/audioSynth';
import { Headphones, BookOpen, FileEdit, Mic, Clock, HelpCircle, Play, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function TestCatalog({ onSelectTest }) {
  const [tests, setTests] = useState([]);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const carouselRef = useRef(null);

  useEffect(() => {
    fetchTests();
  }, [moduleFilter, difficultyFilter, topicFilter]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/tests', {
        params: {
          module_type: moduleFilter,
          difficulty: difficultyFilter,
          topic: topicFilter
        }
      });
      setTests(response.data.tests || []);
    } catch (err) {
      console.error('Failed to load test catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollCarousel = (direction) => {
    soundFx.playClick();
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getModuleIcon = (mod) => {
    switch (mod) {
      case 'listening': return Headphones;
      case 'reading': return BookOpen;
      case 'writing': return FileEdit;
      case 'speaking': return Mic;
      default: return BookOpen;
    }
  };

  const getModuleColor = (mod) => {
    switch (mod) {
      case 'listening': return '#00F0FF';
      case 'reading': return '#6C63FF';
      case 'writing': return '#FF4694';
      case 'speaking': return '#FFB800';
      default: return '#6C63FF';
    }
  };

  return (
    <section style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '28px' }}>
        <div className="glass-pill" style={{ alignSelf: 'flex-start' }}>
          <Sparkles size={14} /> Official Exam Simulator Catalog
        </div>
        <h2 className="section-title">
          Practice Test Library
        </h2>
      </div>

      {/* Featured Horizontal Scroll Carousel */}
      <div style={{ marginBottom: '40px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Featured Practice Sets (Swipe / Scroll)</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => scrollCarousel('left')}
              className="btn-secondary"
              style={{ padding: '8px 12px', borderRadius: '10px' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="btn-secondary"
              style={{ padding: '8px 12px', borderRadius: '10px' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Track */}
        <div
          ref={carouselRef}
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: '12px'
          }}
        >
          {tests.slice(0, 5).map((test) => {
            const Icon = getModuleIcon(test.module_type);
            const modColor = getModuleColor(test.module_type);
            return (
              <div
                key={`carousel_${test.id}`}
                className="glass-card"
                onMouseEnter={() => soundFx.playHover()}
                style={{
                  minWidth: '320px',
                  scrollSnapAlign: 'start',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span className="glass-pill" style={{ color: modColor }}>
                      <Icon size={14} /> {test.module_type.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {test.difficulty}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginBottom: '10px' }}>
                    {test.title}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onSelectTest(test.id, test.module_type);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                >
                  <Play size={14} /> Launch Practice
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'listening', label: 'Listening', icon: Headphones },
            { id: 'reading', label: 'Reading', icon: BookOpen },
            { id: 'writing', label: 'Writing', icon: FileEdit },
            { id: 'speaking', label: 'Speaking', icon: Mic }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = moduleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setModuleFilter(tab.id);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isActive ? '#FFF' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {Icon && <Icon size={15} />}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="glass-input"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading test catalog...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {tests.map((test) => {
            const Icon = getModuleIcon(test.module_type);
            const modColor = getModuleColor(test.module_type);

            return (
              <div
                key={test.id}
                className="glass-card"
                onMouseEnter={() => soundFx.playHover()}
                style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span className="glass-pill" style={{ color: modColor }}>
                      <Icon size={14} />
                      {test.module_type.toUpperCase()}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {test.difficulty}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF', marginBottom: '12px' }}>
                    {test.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={15} /> {test.duration_minutes} mins
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <HelpCircle size={15} /> {test.total_questions} {test.module_type === 'writing' ? 'Task' : 'Questions'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    onSelectTest(test.id, test.module_type);
                  }}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Play size={15} /> Start {test.module_type.charAt(0).toUpperCase() + test.module_type.slice(1)} Test
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
