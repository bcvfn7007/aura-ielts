import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AudioPlayer from './AudioPlayer';
import TestResultModal from './TestResultModal';
import { soundFx } from '../../utils/audioSynth';
import { Clock, ArrowLeft, Send, Headphones, BookOpen, Bookmark, Maximize, Minimize, Eye, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function TestTakingView({ testId, onExit }) {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [revealedHints, setRevealedHints] = useState({}); // For Study Mode instant hints

  const [mode, setMode] = useState('exam'); // 'exam' | 'study'
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [confirmSubmitModalOpen, setConfirmSubmitModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const questionRefs = useRef({});

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  // Countdown Timer Hook
  useEffect(() => {
    if (timeLeft <= 0 || evaluationResult || mode === 'study') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeFinalSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, evaluationResult, mode]);

  const fetchTestDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/tests/${testId}`);
      const data = response.data.test;
      setTestData(data);
      setTimeLeft((data.duration_minutes || 20) * 60);
    } catch (err) {
      console.error('Failed to load test detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    soundFx.playClick();
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const toggleFlagQuestion = (questionId) => {
    soundFx.playClick();
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const toggleRevealHint = (questionId) => {
    soundFx.playClick();
    setRevealedHints((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const toggleFullscreenMode = () => {
    soundFx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const scrollToQuestion = (questionId) => {
    soundFx.playClick();
    const elem = document.getElementById(`q_card_${questionId}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleInitialSubmitClick = () => {
    soundFx.playClick();
    const totalQ = testData.questions?.length || 0;
    const answeredCount = Object.keys(userAnswers).filter((k) => userAnswers[k]?.trim()).length;

    if (answeredCount < totalQ || Object.values(flaggedQuestions).some(Boolean)) {
      setConfirmSubmitModalOpen(true);
    } else {
      executeFinalSubmission();
    }
  };

  const executeFinalSubmission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setConfirmSubmitModalOpen(false);

    const timeSpent = (testData.duration_minutes * 60) - timeLeft;

    try {
      const response = await axios.post('/api/results/submit', {
        test_id: testId,
        user_answers: userAnswers,
        time_spent_seconds: timeSpent
      });

      setEvaluationResult(response.data);
    } catch (err) {
      console.error('Failed to submit test:', err);
      alert('Error submitting answers. Please check network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading test environment...
      </div>
    );
  }

  if (!testData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        Test not found. <button onClick={onExit} className="btn-secondary">Return</button>
      </div>
    );
  }

  const isListening = testData.module_type === 'listening';
  const questions = testData.questions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).filter((k) => userAnswers[k]?.trim()).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-main)', paddingBottom: '100px' }}>
      {/* Sticky Top Header */}
      <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px 28px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={onExit} className="btn-secondary" style={{ padding: '8px 14px' }}>
              <ArrowLeft size={16} /> Exit
            </button>
            <div>
              <span className="glass-pill" style={{ fontSize: '0.75rem', padding: '2px 10px' }}>
                {isListening ? <Headphones size={12} /> : <BookOpen size={12} />} {testData.module_type.toUpperCase()}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>
                {testData.title}
              </h3>
            </div>
          </div>

          {/* Mode Switcher & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Mode Switcher */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
              <button
                onClick={() => setMode('exam')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: mode === 'exam' ? 'var(--accent-purple)' : 'transparent',
                  color: mode === 'exam' ? '#FFF' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Exam Mode
              </button>
              <button
                onClick={() => setMode('study')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: mode === 'study' ? '#00F0FF' : 'transparent',
                  color: mode === 'study' ? '#000' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Study Mode
              </button>
            </div>

            {/* Timer */}
            {mode === 'exam' && (
              <div className="glass-pill" style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: timeLeft < 300 ? '#FF4694' : '#6C63FF'
              }}>
                <Clock size={18} /> {formatTimer(timeLeft)}
              </div>
            )}

            {/* Fullscreen Toggle */}
            <button onClick={toggleFullscreenMode} className="btn-secondary" style={{ padding: '8px 12px' }} title="Toggle Fullscreen">
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>

            {/* Submit */}
            <button
              onClick={handleInitialSubmitClick}
              disabled={isSubmitting}
              className="btn-primary"
            >
              <Send size={16} /> {isSubmitting ? 'Evaluating...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 24px' }}>
        {isListening && (
          <div style={{ marginBottom: '24px' }}>
            <AudioPlayer audioUrl={testData.audio_url} />
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: !isListening && testData.passage_text ? '1fr 1fr' : '1fr',
          gap: '28px',
          alignItems: 'start'
        }}>
          {/* Passage Column */}
          {!isListening && testData.passage_text && (
            <div className="glass-card" style={{
              padding: '32px',
              maxHeight: 'calc(100vh - 180px)',
              overflowY: 'auto',
              background: 'rgba(12, 11, 24, 0.85)'
            }}>
              <h4 style={{ fontSize: '1.2rem', color: '#6C63FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} /> Reading Passage
              </h4>
              <div style={{ fontSize: '0.96rem', lineHeight: 1.8, color: '#E0DEFA', whiteSpace: 'pre-line' }}>
                {testData.passage_text}
              </div>
            </div>
          )}

          {/* Questions Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {questions.map((q) => {
              const isFlagged = flaggedQuestions[q.id];
              const isAnswered = !!userAnswers[q.id]?.trim();
              const isHintRevealed = revealedHints[q.id];

              return (
                <div
                  key={q.id}
                  id={`q_card_${q.id}`}
                  className="glass-card"
                  style={{
                    padding: '28px',
                    borderColor: isFlagged ? '#FFB800' : isAnswered ? 'rgba(0, 240, 255, 0.3)' : 'var(--border-glass)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="glass-pill" style={{ color: '#00F0FF' }}>
                        Question {q.question_number}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {q.question_type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Bookmark / Flag Toggle */}
                    <button
                      onClick={() => toggleFlagQuestion(q.id)}
                      style={{
                        background: isFlagged ? 'rgba(255, 184, 0, 0.2)' : 'transparent',
                        border: isFlagged ? '1px solid #FFB800' : '1px solid var(--border-glass)',
                        color: isFlagged ? '#FFB800' : 'var(--text-muted)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem'
                      }}
                    >
                      <Bookmark size={14} fill={isFlagged ? '#FFB800' : 'none'} />
                      {isFlagged ? 'Flagged' : 'Flag for Review'}
                    </button>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', color: '#FFF', fontWeight: 600, marginBottom: '20px', lineHeight: 1.5 }}>
                    {q.text}
                  </h4>

                  {/* Question Renderers */}
                  {q.question_type === 'true_false_not_given' && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => {
                        const isSelected = userAnswers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => handleAnswerChange(q.id, opt)}
                            style={{
                              flex: 1,
                              padding: '12px',
                              borderRadius: '10px',
                              border: isSelected ? '1px solid #00F0FF' : '1px solid var(--border-glass)',
                              background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                              color: isSelected ? '#00F0FF' : 'var(--text-muted)',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.question_type === 'multiple_choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {q.options && q.options.map((opt, idx) => {
                        const isSelected = userAnswers[q.id] === opt;
                        return (
                          <label
                            key={idx}
                            onClick={() => handleAnswerChange(q.id, opt)}
                            style={{
                              padding: '14px 18px',
                              borderRadius: '12px',
                              border: isSelected ? '1px solid #6C63FF' : '1px solid var(--border-glass)',
                              background: isSelected ? 'rgba(108, 99, 255, 0.2)' : 'rgba(255,255,255,0.02)',
                              color: isSelected ? '#FFF' : 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                          >
                            <input type="radio" name={`q_${q.id}`} checked={isSelected} onChange={() => {}} style={{ accentColor: '#6C63FF' }} />
                            <span style={{ fontSize: '0.94rem' }}>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {(q.question_type === 'form_completion' || q.question_type === 'sentence_completion') && (
                    <div>
                      <input
                        type="text"
                        placeholder="Type exact answer (e.g. October, 200, 5)..."
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="glass-input"
                      />
                    </div>
                  )}

                  {q.question_type === 'matching' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {q.options && q.options.map((opt, idx) => (
                        <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.88rem', color: '#D5D2ED' }}>
                          {opt}
                        </div>
                      ))}
                      <input
                        type="text"
                        placeholder="Select or type heading choice (e.g. ii. Psychological drivers)..."
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="glass-input"
                        style={{ marginTop: '6px' }}
                      />
                    </div>
                  )}

                  {/* Study Mode Hint Expander */}
                  {mode === 'study' && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-glass)' }}>
                      <button
                        onClick={() => toggleRevealHint(q.id)}
                        style={{
                          background: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          color: '#00F0FF',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Eye size={14} /> {isHintRevealed ? 'Hide Answer Explanation' : 'Check Answer & Hint'}
                      </button>

                      {isHintRevealed && (
                        <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '14px', borderRadius: '10px', marginTop: '10px', fontSize: '0.85rem' }}>
                          <div style={{ color: '#00F0FF', fontWeight: 700 }}>Correct Answer: {q.correct_answer}</div>
                          <div style={{ color: '#D5D2ED', marginTop: '4px' }}>💡 {q.explanation}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Official CD-IELTS Sticky Bottom Question Navigator Bar */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(8, 7, 17, 0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-glass)',
        padding: '12px 24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Questions Navigator ({answeredCount}/{totalQuestions} Answered):
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {questions.map((q) => {
              const isAnswered = !!userAnswers[q.id]?.trim();
              const isFlagged = flaggedQuestions[q.id];

              return (
                <button
                  key={q.id}
                  onClick={() => scrollToQuestion(q.id)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: isFlagged ? '1.5px solid #FFB800' : isAnswered ? '1px solid #00F0FF' : '1px solid var(--border-glass)',
                    background: isAnswered ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: isAnswered ? '#FFF' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {q.question_number}
                  {isFlagged && (
                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderRadius: '50%', background: '#FFB800' }} />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', background: 'rgba(0, 240, 255, 0.4)', borderRadius: '2px' }} /> Answered
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', background: '#FFB800', borderRadius: '2px' }} /> Flagged
            </span>
          </div>
        </div>
      </footer>

      {/* Submission Guard Confirmation Modal */}
      {confirmSubmitModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2000,
          background: 'rgba(5, 4, 12, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '32px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#FFB800" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
              Confirm Test Submission
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
              You have <strong style={{ color: '#00F0FF' }}>{totalQuestions - answeredCount} unanswered</strong> questions and <strong style={{ color: '#FFB800' }}>{Object.values(flaggedQuestions).filter(Boolean).length} flagged</strong> questions remaining.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmSubmitModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Review Questions
              </button>
              <button onClick={executeFinalSubmission} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Result Evaluation Modal */}
      {evaluationResult && (
        <TestResultModal
          result={evaluationResult}
          onRetry={() => {
            setEvaluationResult(null);
            setUserAnswers({});
            setFlaggedQuestions({});
            setTimeLeft((testData.duration_minutes || 20) * 60);
          }}
          onCloseCatalog={onExit}
        />
      )}
    </div>
  );
}
