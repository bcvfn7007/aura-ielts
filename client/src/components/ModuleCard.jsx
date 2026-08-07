import React from 'react';
import { Headphones, BookOpen, FileEdit, Mic, ArrowRight } from 'lucide-react';
import { soundFx } from '../utils/audioSynth';

const MODULE_DATA = {
  listening: {
    title: 'Listening Module',
    icon: Headphones,
    color: '#00F0FF',
    bandAverage: '8.0 Avg',
    description: 'Master 4 sections with diverse accents, lectures, and multi-choice & completion tasks.',
    features: ['Real-time Audio Player', 'Speed Control (1x - 1.5x)', 'Accurate Band 9 Scoring']
  },
  reading: {
    title: 'Reading Module',
    icon: BookOpen,
    color: '#6C63FF',
    bandAverage: '7.5 Avg',
    description: 'Analyze academic & general passages with split-screen viewing and passage highlights.',
    features: ['Split-screen Passage View', 'Matching & Completion', 'Instant Solution Breakdown']
  },
  writing: {
    title: 'Writing Module',
    icon: FileEdit,
    color: '#FF4694',
    bandAverage: '7.0 Avg',
    description: 'Task 1 visual data analysis and Task 2 essay evaluation with structural guidance.',
    features: ['Lexical Resource Check', 'Task 1 & Task 2 Templates', 'Band Score Evaluator']
  },
  speaking: {
    title: 'Speaking Module',
    icon: Mic,
    color: '#FFB800',
    bandAverage: '7.5 Avg',
    description: 'Interactive cue cards, part 1-3 prompts, fluency tracking, and vocabulary booster.',
    features: ['Part 1, 2, 3 Prompts', 'Cue Card Simulator', 'Fluency & Pronunciation']
  }
};

export default function ModuleCard({ type, onSelect }) {
  const info = MODULE_DATA[type] || MODULE_DATA.listening;
  const Icon = info.icon;

  return (
    <div
      className="glass-card"
      onMouseEnter={() => soundFx.playHover()}
      style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={24} color={info.color} />
          </div>
          <span className="glass-pill" style={{ color: info.color }}>
            {info.bandAverage}
          </span>
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF', marginBottom: '10px' }}>
          {info.title}
        </h3>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
          {info.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {info.features.map((feat, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#D4D2E6' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: info.color }}></div>
              {feat}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => { soundFx.playClick(); onSelect(type); }}
        className="btn-secondary"
        style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <span>Practice {info.title.split(' ')[0]}</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
