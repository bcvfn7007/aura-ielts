import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SpeakingFeedbackModal from './SpeakingFeedbackModal';
import { Mic, MicOff, Play, Pause, Clock, ArrowLeft, Send, Sparkles, Volume2, RotateCcw } from 'lucide-react';

export default function SpeakingSimulator({ testId, onExit }) {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prep & Recording Timer States
  const [prepTimeLeft, setPrepTimeLeft] = useState(60); // 1-minute cue card preparation timer
  const [isPrepping, setIsPrepping] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Web Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcriptNotes, setTranscriptNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  // Preparation Countdown Timer Hook
  useEffect(() => {
    if (!isPrepping || prepTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPrepping(false);
          startRecording(); // Auto start voice recording after 1 min prep
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPrepping, prepTimeLeft]);

  // Active Voice Recording Timer Hook
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const fetchTestDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/tests/${testId}`);
      setTestData(response.data.test);
    } catch (err) {
      console.error('Failed to load speaking test detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const startPrepTimer = () => {
    setIsPrepping(true);
    setPrepTimeLeft(60);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        // Revoke previous object URL to prevent memory leak
        setAudioUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return url;
        });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Microphone access is required for Speaking practice. Please allow mic permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all mic tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmitSpeaking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/results/submit-speaking', {
        test_id: testId,
        part_name: 'Part 1, 2 & 3',
        prompt_text: testData.passage_text,
        transcript_notes: transcriptNotes || 'Audio recording analyzed',
        time_spent_seconds: recordingSeconds || 120
      });

      setEvaluationResult(response.data);
    } catch (err) {
      console.error('Error submitting speaking response:', err);
      alert('Speaking AI evaluation failed. Please try again.');
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
        Loading Speaking practice environment...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      {/* Header */}
      <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px 28px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={onExit} className="btn-secondary" style={{ padding: '8px 14px' }}>
              <ArrowLeft size={16} /> Exit
            </button>
            <div>
              <span className="glass-pill" style={{ fontSize: '0.75rem', borderColor: 'rgba(255, 184, 0, 0.4)', color: '#FFB800' }}>
                <Mic size={12} /> SPEAKING SIMULATOR
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>
                {testData.title}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {isRecording && (
              <div className="glass-pill" style={{ borderColor: 'rgba(255, 70, 148, 0.5)', color: '#FF4694', background: 'rgba(255, 70, 148, 0.15)' }}>
                🔴 Recording Live: {formatTimer(recordingSeconds)}
              </div>
            )}

            <button
              onClick={handleSubmitSpeaking}
              disabled={isSubmitting || (!audioUrl && !isRecording)}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #FFB800 0%, #6C63FF 100%)', boxShadow: '0 0 20px rgba(255, 184, 0, 0.4)' }}
            >
              <Sparkles size={16} /> {isSubmitting ? 'Evaluating AI...' : 'Submit Response for AI Analysis'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        {/* Left Column: Prompts & Prep Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '32px', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '1.2rem', color: '#FFB800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mic size={20} /> Official Speaking Prompts
            </h4>
            <div style={{ fontSize: '0.96rem', lineHeight: 1.8, color: '#E0DEFA', whiteSpace: 'pre-line' }}>
              {testData.passage_text}
            </div>
          </div>
        </div>

        {/* Right Column: Audio Recording & Playback Control Station */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Prep Timer Card */}
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cue Card 1-Minute Preparation Timer</span>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: isPrepping ? '#00F0FF' : '#FFF', margin: '8px 0' }}>
              {formatTimer(prepTimeLeft)}
            </div>
            {!isPrepping ? (
              <button onClick={startPrepTimer} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <Clock size={16} /> Start 1-Minute Prep Countdown
              </button>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#00F0FF' }}>
                Preparing notes... Recording will auto-start when timer reaches 00:00
              </div>
            )}
          </div>

          {/* Voice Recorder Console */}
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h4 style={{ fontSize: '1.2rem', color: '#FFF' }}>
              Web Audio Microphone Station
            </h4>

            {/* Pulsing Mic Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: isRecording
                  ? 'linear-gradient(135deg, #FF4694 0%, #FFB800 100%)'
                  : 'linear-gradient(135deg, #6C63FF 0%, #00F0FF 100%)',
                border: 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isRecording
                  ? '0 0 35px rgba(255, 70, 148, 0.8)'
                  : '0 0 25px rgba(108, 99, 255, 0.5)',
                transition: 'all 0.3s ease'
              }}
            >
              {isRecording ? <MicOff size={42} /> : <Mic size={42} />}
            </button>

            <div style={{ fontSize: '0.9rem', color: isRecording ? '#FF4694' : 'var(--text-muted)' }}>
              {isRecording ? 'Tap to Stop Voice Recording' : 'Tap Microphone to Begin Recording'}
            </div>

            {/* Playback Audio Player */}
            {audioUrl && (
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-glass)', marginTop: '12px' }}>
                <div style={{ fontSize: '0.85rem', color: '#00F0FF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Volume2 size={16} /> Listen to Your Recorded Audio Answer
                </div>
                <audio src={audioUrl} controls style={{ width: '100%', accentColor: '#6C63FF' }} />
              </div>
            )}
          </div>

          {/* Optional Transcript Notes Box */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
              Optional Transcript or Preparation Notes
            </label>
            <textarea
              placeholder="Add key vocabulary points or notes you used during your speech..."
              value={transcriptNotes}
              onChange={(e) => setTranscriptNotes(e.target.value)}
              className="glass-input"
              rows={3}
              style={{ width: '100%', resize: 'none' }}
            />
          </div>
        </div>
      </main>

      {/* AI Speaking Result Modal */}
      {evaluationResult && (
        <SpeakingFeedbackModal
          result={evaluationResult}
          onRetry={() => {
            setEvaluationResult(null);
            setAudioUrl(null);
            setAudioBlob(null);
            setRecordingSeconds(0);
          }}
          onCloseCatalog={onExit}
        />
      )}
    </div>
  );
}
