import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WritingFeedbackModal from './WritingFeedbackModal';
import { Clock, ArrowLeft, Send, FileEdit, CheckCircle, Sparkles } from 'lucide-react';

export default function WritingTaskView({ testId, onExit }) {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [essayText, setEssayText] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [underlengthWarning, setUnderlengthWarning] = useState(false);

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  useEffect(() => {
    if (timeLeft <= 0 || evaluationResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, evaluationResult]);

  const fetchTestDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/tests/${testId}`);
      const data = response.data.test;
      setTestData(data);
      setTimeLeft((data.duration_minutes || 40) * 60);
    } catch (err) {
      console.error('Failed to load writing test detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  const isTask1 = testData?.title?.toLowerCase().includes('task 1');
  const targetWords = isTask1 ? 150 : 250;

  const handleSubmitEssay = async () => {
    if (!essayText.trim() || isSubmitting) return;

    // Warn if below IELTS minimum word count (penalty applies in official exam)
    if (wordCount < targetWords && !underlengthWarning) {
      setUnderlengthWarning(true);
      return;
    }
    setUnderlengthWarning(false);
    setIsSubmitting(true);

    const timeSpent = (testData.duration_minutes * 60) - timeLeft;

    try {
      const response = await axios.post('/api/results/submit-writing', {
        test_id: testId,
        task_type: isTask1 ? 'task1' : 'task2',
        prompt_text: testData.passage_text,
        essay_text: essayText,
        time_spent_seconds: timeSpent
      });

      setEvaluationResult(response.data);
    } catch (err) {
      console.error('Failed to submit essay:', err);
      alert('Error evaluating essay with Gemini AI. Please try again.');
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
        Loading Writing task simulator...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      {/* Sticky Header */}
      <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px 28px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={onExit} className="btn-secondary" style={{ padding: '8px 14px' }}>
              <ArrowLeft size={16} /> Exit
            </button>
            <div>
              <span className="glass-pill" style={{ fontSize: '0.75rem', borderColor: 'rgba(255, 70, 148, 0.4)', color: '#FF4694' }}>
                <FileEdit size={12} /> {isTask1 ? 'WRITING TASK 1' : 'WRITING TASK 2'}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>
                {testData.title}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Live Word Count Indicator */}
            <div className="glass-pill" style={{
              fontSize: '0.9rem',
              borderColor: wordCount >= targetWords ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 184, 0, 0.4)',
              color: wordCount >= targetWords ? '#00F0FF' : '#FFB800'
            }}>
              Word Count: <strong style={{ color: '#FFF' }}>{wordCount}</strong> / {targetWords} min
            </div>

            {/* Timer */}
            <div className="glass-pill" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6C63FF' }}>
              <Clock size={18} /> {formatTimer(timeLeft)}
            </div>

            <button
              onClick={handleSubmitEssay}
              disabled={isSubmitting || wordCount === 0}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #FF4694 0%, #6C63FF 100%)', boxShadow: '0 0 20px rgba(255, 70, 148, 0.4)' }}
            >
              <Sparkles size={16} /> {isSubmitting ? 'Evaluating AI...' : 'Submit for AI Assessment'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <main style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        {/* Left Column: Task Prompt */}
        <div className="glass-card" style={{ padding: '32px', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
          <h4 style={{ fontSize: '1.2rem', color: '#FF4694', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileEdit size={20} /> Official Writing Prompt
          </h4>
          <div style={{ fontSize: '1rem', lineHeight: 1.8, color: '#E0DEFA', whiteSpace: 'pre-line' }}>
            {testData.passage_text}
          </div>
        </div>

        {/* Right Column: Essay Composition Area */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 600, color: '#FFF', fontSize: '0.95rem' }}>Your Essay Response</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {wordCount >= targetWords ? '✓ Target word count reached' : `Need ${targetWords - wordCount} more words`}
            </span>
          </div>

          <textarea
            placeholder="Type your essay response here. Organize into intro, body paragraphs, and conclusion..."
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            className="glass-input"
            style={{
              flex: 1,
              resize: 'none',
              lineHeight: 1.7,
              fontSize: '1rem',
              padding: '20px',
              fontFamily: 'var(--font-body)'
            }}
          />
        </div>
      </main>

      {/* Underlength Word Count Penalty Warning Modal */}
      {underlengthWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
          background: 'rgba(5, 4, 12, 0.88)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '100%', padding: '36px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFB800', marginBottom: '12px' }}>
              IELTS Underlength Penalty
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '24px' }}>
              Your essay is <strong style={{ color: '#FF4694' }}>{wordCount} words</strong>, below the official minimum of{' '}
              <strong style={{ color: '#FFF' }}>{targetWords} words</strong> for {isTask1 ? 'Task 1' : 'Task 2'}.<br /><br />
              In the official IELTS exam, submitting below the word limit results in a <strong style={{ color: '#FF4694' }}>band score penalty</strong>. Do you want to submit anyway?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setUnderlengthWarning(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Keep Writing
              </button>
              <button onClick={handleSubmitEssay} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #FF4694 0%, #6C63FF 100%)' }}>
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Evaluation Result Modal */}
      {evaluationResult && (
        <WritingFeedbackModal
          result={evaluationResult}
          onRetry={() => {
            setEvaluationResult(null);
            setEssayText('');
            setTimeLeft((testData.duration_minutes || 40) * 60);
          }}
          onCloseCatalog={onExit}
        />
      )}
    </div>
  );
}
