import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SpeakingFeedbackModal from './SpeakingFeedbackModal';
import { Mic, MicOff, Clock, ArrowLeft, Sparkles, Volume2, FileText } from 'lucide-react';

export default function SpeakingSimulator({ testId, onExit }) {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prep & Recording Timer States
  const [prepTimeLeft, setPrepTimeLeft] = useState(60);
  const [isPrepping, setIsPrepping] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  // 🔑 Live transcript from Web Speech API
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchTestDetails();
    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, [testId]);

  // Prep countdown
  useEffect(() => {
    if (!isPrepping || prepTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPrepping(false);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPrepping, prepTimeLeft]);

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => setRecordingSeconds((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const fetchTestDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/tests/${testId}`);
      setTestData(response.data.test);
    } catch (err) {
      console.error('Failed to load speaking test:', err);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // 🔑 Start Web Speech API live transcription
      startSpeechRecognition();
    } catch (err) {
      alert('Microphone access is required for Speaking practice. Please allow mic permissions.');
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      if (final) setLiveTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (e) => console.warn('Speech recognition error:', e.error);
    recognition.onend = () => {
      // Auto-restart if still recording (handles 60s browser timeout)
      if (isRecording) {
        try { recognition.start(); } catch (_) {}
      }
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setInterimTranscript('');
    }
  };

  const handleSubmitSpeaking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Build a rich transcript for Gemini to analyze
    const fullTranscript = liveTranscript.trim();
    const wordCount = fullTranscript.split(/\s+/).filter(Boolean).length;
    const transcriptForAI = fullTranscript
      ? `[Auto-transcribed speech — ${wordCount} words spoken]\n\n${fullTranscript}`
      : '';

    try {
      const response = await axios.post('/api/results/submit-speaking', {
        test_id: testId,
        part_name: 'Part 1, 2 & 3',
        prompt_text: testData.passage_text,
        transcript_notes: transcriptForAI,
        time_spent_seconds: recordingSeconds || 120
      });
      setEvaluationResult(response.data);
    } catch (err) {
      console.error('Error submitting speaking:', err);
      alert('Speaking AI evaluation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (s) => `${Math.floor(s / 60) < 10 ? '0' : ''}${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Speaking practice environment...</div>;

  const transcriptWordCount = liveTranscript.trim().split(/\s+/).filter(Boolean).length;

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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>{testData.title}</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isRecording && (
              <div className="glass-pill" style={{ borderColor: 'rgba(255, 70, 148, 0.5)', color: '#FF4694', background: 'rgba(255, 70, 148, 0.15)' }}>
                🔴 {formatTimer(recordingSeconds)} — {transcriptWordCount} words captured
              </div>
            )}
            <button
              onClick={handleSubmitSpeaking}
              disabled={isSubmitting || (!audioUrl && !isRecording)}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #FFB800 0%, #6C63FF 100%)', boxShadow: '0 0 20px rgba(255, 184, 0, 0.4)' }}
            >
              <Sparkles size={16} /> {isSubmitting ? 'Analysing with Gemini AI...' : 'Submit for AI Analysis'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        {/* Left: Prompts */}
        <div className="glass-card" style={{ padding: '32px', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h4 style={{ fontSize: '1.2rem', color: '#FFB800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mic size={20} /> Official Speaking Prompts
            </h4>
            <button
              onClick={() => {
                if (!('speechSynthesis' in window)) return alert('Text-to-speech not supported in this browser.');
                window.speechSynthesis.cancel();
                const textToSpeak = testData?.passage_text || 'Welcome to the IELTS Speaking exam.';
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'en-US';
                utterance.rate = 0.92;
                window.speechSynthesis.speak(utterance);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px', background: 'rgba(255, 184, 0, 0.15)', borderColor: 'rgba(255, 184, 0, 0.4)', color: '#FFB800' }}
            >
              🔊 AI Examiner: Speak Questions Aloud
            </button>
          </div>
          <div style={{ fontSize: '0.96rem', lineHeight: 1.8, color: '#E0DEFA', whiteSpace: 'pre-line' }}>
            {testData.passage_text}
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Prep Timer */}
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cue Card — 1 Minute Prep Timer</span>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: isPrepping ? '#00F0FF' : '#FFF', margin: '8px 0' }}>
              {formatTimer(prepTimeLeft)}
            </div>
            {!isPrepping ? (
              <button onClick={() => { setIsPrepping(true); setPrepTimeLeft(60); }} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <Clock size={16} /> Start 1-Minute Prep Countdown
              </button>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#00F0FF' }}>Preparing... Recording will auto-start at 00:00</div>
            )}
          </div>

          {/* Microphone */}
          <div className="glass-card" style={{ padding: '28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#FFF' }}>Microphone Station</h4>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: isRecording ? 'linear-gradient(135deg, #FF4694 0%, #FFB800 100%)' : 'linear-gradient(135deg, #6C63FF 0%, #00F0FF 100%)',
                border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isRecording ? '0 0 35px rgba(255, 70, 148, 0.8)' : '0 0 25px rgba(108, 99, 255, 0.5)',
                transition: 'all 0.3s ease',
                animation: isRecording ? 'pulseGlow 1.5s infinite' : 'none'
              }}
            >
              {isRecording ? <MicOff size={38} /> : <Mic size={38} />}
            </button>

            <div style={{ fontSize: '0.88rem', color: isRecording ? '#FF4694' : 'var(--text-muted)' }}>
              {isRecording ? 'Tap to stop recording' : 'Tap microphone to begin'}
            </div>

            {/* Speech API indicator */}
            {speechSupported ? (
              <div style={{ fontSize: '0.78rem', color: '#00F0FF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ✓ Live speech-to-text active — Gemini will analyse your words
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#FFB800' }}>
                ⚠ Speech recognition not supported — type notes below instead
              </div>
            )}

            {/* Playback */}
            {audioUrl && (
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.8rem', color: '#00F0FF', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Volume2 size={14} /> Recorded Audio
                </div>
                <audio src={audioUrl} controls style={{ width: '100%' }} />
              </div>
            )}
          </div>

          {/* Live Transcript Box */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.85rem', color: '#00F0FF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} /> Live Transcript (sent to Gemini AI)
              </label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{transcriptWordCount} words</span>
            </div>

            {/* Live interim (grey) + finalized (white) */}
            <div style={{
              minHeight: '80px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
              border: '1px solid var(--border-glass)', padding: '12px',
              fontSize: '0.88rem', lineHeight: 1.7, color: '#E0DEFA'
            }}>
              {liveTranscript || ''}
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{interimTranscript}</span>
              {!liveTranscript && !interimTranscript && (
                <span style={{ color: 'var(--text-muted)' }}>
                  {isRecording ? 'Listening... speak clearly into your microphone' : 'Start recording to see live transcript here'}
                </span>
              )}
            </div>

            {/* Manual edit fallback */}
            {!speechSupported && (
              <textarea
                placeholder="Speech recognition not available. Type what you said here so Gemini can analyse it..."
                value={liveTranscript}
                onChange={(e) => setLiveTranscript(e.target.value)}
                className="glass-input"
                rows={3}
                style={{ width: '100%', resize: 'none', marginTop: '10px' }}
              />
            )}
          </div>
        </div>
      </main>

      {/* AI Modal */}
      {evaluationResult && (
        <SpeakingFeedbackModal
          result={evaluationResult}
          onRetry={() => { setEvaluationResult(null); setAudioUrl(null); setRecordingSeconds(0); setLiveTranscript(''); setInterimTranscript(''); }}
          onCloseCatalog={onExit}
        />
      )}
    </div>
  );
}
