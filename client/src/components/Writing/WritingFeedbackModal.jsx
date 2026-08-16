import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, Sparkles, BookOpen, Layers, Type, Check } from 'lucide-react';

export default function WritingFeedbackModal({ result, onRetry, onCloseCatalog }) {
  if (!result || !result.aiEvaluation) return null;

  const { band_score, word_count, aiEvaluation } = result;

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
        {/* Header Band Score Badge */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="glass-pill" style={{ marginBottom: '12px' }}>
            <Sparkles size={14} /> AI Assessment ({result.engineUsed || 'Claude 3.5 Sonnet'})
          </span>

          <div style={{
            width: '94px',
            height: '94px',
            borderRadius: '50%',
            background: `rgba(${bandColor === '#00F0FF' ? '0, 240, 255' : '108, 99, 255'}, 0.15)`,
            border: `3px solid ${bandColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '16px auto 16px',
            boxShadow: `0 0 30px ${bandColor}60`
          }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.6rem', fontWeight: 800, color: '#FFF' }}>
              {band_score}
            </span>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF' }}>
            Writing Evaluation Report
          </h2>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Essay Word Count: <strong style={{ color: '#00F0FF' }}>{word_count} words</strong>
          </div>
        </div>

        {/* 4 IELTS Criteria Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { title: 'Task Achievement / Response', data: aiEvaluation.task_achievement, icon: CheckCircle2, color: '#00F0FF' },
            { title: 'Coherence & Cohesion', data: aiEvaluation.coherence_cohesion, icon: Layers, color: '#6C63FF' },
            { title: 'Lexical Resource', data: aiEvaluation.lexical_resource, icon: Type, color: '#FF4694' },
            { title: 'Grammatical Range & Accuracy', data: aiEvaluation.grammar_accuracy, icon: BookOpen, color: '#FFB800' }
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
                  {item.data?.feedback || 'Good structural development and task adherence.'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Error Corrections Breakdown (Quotes from User Text) */}
        {aiEvaluation.error_corrections && aiEvaluation.error_corrections.length > 0 && (
          <div style={{ background: 'rgba(255, 70, 148, 0.08)', border: '1px solid rgba(255, 70, 148, 0.25)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
            <h4 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✍️ Specific Sentence Corrections & Quote Improvements
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aiEvaluation.error_corrections.map((corr, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.86rem', color: '#FF4694', textDecoration: 'line-through' }}>
                    "{corr.original_quote}"
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#00F0FF', fontWeight: 600, marginTop: '4px' }}>
                    ✓ Recommended: "{corr.corrected}"
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {corr.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Summary & Recommendations */}
        <div style={{ background: 'rgba(108, 99, 255, 0.08)', border: '1px solid rgba(108, 99, 255, 0.25)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
          <h4 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💡 Overall Assessment & Key Recommendations
          </h4>
          <p style={{ color: '#D5D3ED', fontSize: '0.92rem', marginBottom: '16px', lineHeight: 1.6 }}>
            {aiEvaluation.overall_feedback}
          </p>

          {aiEvaluation.recommendations && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {aiEvaluation.recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#E0DEFA' }}>
                  <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: '#00F0FF', marginTop: '7px' }}></div>
                  {rec}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={onRetry} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            <RefreshCw size={16} /> Rewrite Essay
          </button>
          <button onClick={onCloseCatalog} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            <ArrowLeft size={16} /> Return to Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
