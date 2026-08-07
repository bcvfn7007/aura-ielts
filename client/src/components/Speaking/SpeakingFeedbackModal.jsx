import React from 'react';
import { Award, Mic, ArrowLeft, RefreshCw, Sparkles, Volume2, CheckCircle2, MessageSquare } from 'lucide-react';

export default function SpeakingFeedbackModal({ result, onRetry, onCloseCatalog }) {
  if (!result || !result.aiEvaluation) return null;

  const { band_score, aiEvaluation } = result;

  const getBandColor = (band) => {
    if (band >= 8.0) return '#00F0FF';
    if (band >= 7.0) return '#6C63FF';
    if (band >= 6.0) return '#FFB800';
    return '#FF4694';
  };

  const bandColor = getBandColor(band_score);

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
        {/* Header Score Badge */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="glass-pill" style={{ marginBottom: '12px', borderColor: band_score === 0 ? 'rgba(255, 70, 148, 0.4)' : 'rgba(255, 184, 0, 0.4)', color: band_score === 0 ? '#FF4694' : '#FFB800' }}>
            <Mic size={14} /> {band_score === 0 ? '⚠️ No Audio Speech Detected' : 'AI Speaking Performance Assessment'}
          </span>

          <div style={{
            width: '94px',
            height: '94px',
            borderRadius: '50%',
            background: band_score === 0 ? 'rgba(255, 70, 148, 0.15)' : `rgba(${bandColor === '#00F0FF' ? '0, 240, 255' : '255, 184, 0'}, 0.15)`,
            border: `3px solid ${band_score === 0 ? '#FF4694' : bandColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '16px auto 16px',
            boxShadow: `0 0 30px ${band_score === 0 ? '#FF4694' : bandColor}60`
          }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.6rem', fontWeight: 800, color: '#FFF' }}>
              {band_score === 0 ? '0.0' : band_score}
            </span>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF' }}>
            {band_score === 0 ? 'No Speech Detected' : 'Speaking Evaluation Report'}
          </h2>

          <button
            onClick={() => {
              if (!('speechSynthesis' in window)) return;
              window.speechSynthesis.cancel();
              const textToSpeak = `Your overall Speaking score is Band ${band_score}. ${aiEvaluation.overall_feedback || ''}`;
              const utterance = new SpeechSynthesisUtterance(textToSpeak);
              utterance.lang = 'en-US';
              utterance.rate = 0.95;
              window.speechSynthesis.speak(utterance);
            }}
            className="btn-secondary"
            style={{ marginTop: '12px', fontSize: '0.85rem', padding: '6px 16px', background: 'rgba(0, 240, 255, 0.15)', borderColor: 'rgba(0, 240, 255, 0.4)', color: '#00F0FF' }}
          >
            🔊 AI Examiner: Read Feedback Out Loud
          </button>
        </div>

        {/* 4 Speaking Criteria */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { title: 'Fluency & Coherence', data: aiEvaluation.fluency_coherence, icon: MessageSquare, color: '#FFB800' },
            { title: 'Lexical Resource', data: aiEvaluation.lexical_resource, icon: Sparkles, color: '#6C63FF' },
            { title: 'Grammatical Range & Accuracy', data: aiEvaluation.grammar_accuracy, icon: CheckCircle2, color: '#00F0FF' },
            { title: 'Pronunciation & Intonation', data: aiEvaluation.pronunciation, icon: Volume2, color: '#FF4694' }
          ].map((item, idx) => {
            const Icon = item.icon;
            const score = item.data?.score || band_score;
            return (
              <div key={idx} style={{
                background: 'rgba(15, 14, 30, 0.75)',
                border: '1px solid var(--border-glass)',
                padding: '20px',
                borderRadius: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFF', fontSize: '0.95rem' }}>
                    <Icon size={18} color={item.color} /> {item.title}
                  </div>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: item.color,
                    background: `${item.color}15`,
                    padding: '2px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${item.color}40`
                  }}>
                    Band {score}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {item.data?.feedback || 'Natural speaking flow and distinct articulation.'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Overall Summary & Recommendations */}
        <div style={{ background: 'rgba(255, 184, 0, 0.08)', border: '1px solid rgba(255, 184, 0, 0.25)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
          <h4 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎙️ Examiner Delivery Feedback
          </h4>
          <p style={{ color: '#D5D3ED', fontSize: '0.92rem', marginBottom: '16px', lineHeight: 1.6 }}>
            {aiEvaluation.overall_feedback}
          </p>

          {aiEvaluation.recommendations && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {aiEvaluation.recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#E0DEFA' }}>
                  <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: '#FFB800', marginTop: '7px' }}></div>
                  {rec}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={onRetry} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            <RefreshCw size={16} /> Record Response Again
          </button>
          <button onClick={onCloseCatalog} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            <ArrowLeft size={16} /> Return to Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
