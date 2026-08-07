import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RefreshCw, ArrowLeft, Headphones, BookOpen, Eye } from 'lucide-react';

export default function TestResultModal({ result, onRetry, onCloseCatalog }) {
  const [showTranscript, setShowTranscript] = useState(false);

  if (!result) return null;

  const { band_score, raw_score, total_questions, percentage, breakdown, transcript_text, passage_text } = result;

  const getBandColor = (band) => {
    if (band >= 8.0) return '#00F0FF';
    if (band >= 7.0) return '#6C63FF';
    if (band >= 6.0) return '#FFB800';
    return '#FF4694';
  };

  const bandColor = getBandColor(band_score);
  const scriptOrPassage = transcript_text || passage_text;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
      background: 'rgba(5, 4, 12, 0.92)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '36px',
        position: 'relative'
      }}>
        {/* Header Band Score Badge */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: `rgba(${bandColor === '#00F0FF' ? '0, 240, 255' : '108, 99, 255'}, 0.15)`,
            border: `3px solid ${bandColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 0 30px ${bandColor}60`
          }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: '#FFF' }}>
              {band_score}
            </span>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF' }}>
            Official IELTS Band Result
          </h2>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Raw Score: <strong style={{ color: '#FFF' }}>{raw_score} / {total_questions}</strong> Correct ({percentage}%)
          </div>

          {/* Toggle Transcript / Passage Button (mini-ielts style feature) */}
          {scriptOrPassage && (
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="btn-secondary"
              style={{ marginTop: '16px', fontSize: '0.85rem', borderColor: 'rgba(0, 240, 255, 0.4)', color: '#00F0FF' }}
            >
              <Eye size={15} /> {showTranscript ? 'Hide Audio Script / Passage' : 'View Full Audio Script & Answer Highlights'}
            </button>
          )}
        </div>

        {/* Audio Transcript / Reading Passage View with Highlights */}
        {showTranscript && scriptOrPassage && (
          <div style={{
            background: 'rgba(12, 11, 24, 0.9)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '32px',
            maxHeight: '260px',
            overflowY: 'auto'
          }}>
            <h4 style={{ fontSize: '1rem', color: '#00F0FF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Headphones size={18} /> Full Audio Transcript & Script
            </h4>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#E0DEFA', whiteSpace: 'pre-line' }}>
              {scriptOrPassage}
            </div>
          </div>
        )}

        {/* Question Breakdown */}
        <h3 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '16px' }}>
          Question Breakdown & Location Explanations
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {breakdown && breakdown.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: item.is_correct ? 'rgba(0, 240, 255, 0.04)' : 'rgba(255, 70, 148, 0.04)',
                border: `1px solid ${item.is_correct ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 70, 148, 0.2)'}`,
                padding: '16px',
                borderRadius: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.is_correct ? <CheckCircle2 size={20} color="#00F0FF" /> : <XCircle size={20} color="#FF4694" />}
                  <span style={{ fontWeight: 700, color: '#FFF', fontSize: '0.95rem' }}>
                    Q{item.question_number}. {item.text}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: item.is_correct ? '#00F0FF' : '#FF4694',
                  background: item.is_correct ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 70, 148, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {item.is_correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', display: 'flex', gap: '24px', margin: '8px 0', color: 'var(--text-muted)' }}>
                <div>Your Answer: <strong style={{ color: item.is_correct ? '#00F0FF' : '#FF4694' }}>{item.user_answer || '(No answer)'}</strong></div>
                <div>Correct Answer: <strong style={{ color: '#00F0FF' }}>{item.correct_answer}</strong></div>
              </div>

              {item.explanation && (
                <div style={{ fontSize: '0.82rem', color: '#B3B0D2', marginTop: '6px', borderTop: '1px dashed var(--border-glass)', paddingTop: '6px' }}>
                  💡 <strong>Explanation:</strong> {item.explanation}
                </div>
              )}

              {item.answer_location && (
                <div style={{ fontSize: '0.8rem', color: '#00F0FF', marginTop: '4px', fontStyle: 'italic' }}>
                  📍 <strong>Transcript Location:</strong> "{item.answer_location}"
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={onRetry} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            <RefreshCw size={16} /> Retry Test
          </button>
          <button onClick={onCloseCatalog} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            <ArrowLeft size={16} /> Return to Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
