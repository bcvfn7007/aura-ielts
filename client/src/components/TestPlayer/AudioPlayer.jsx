import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, FastForward } from 'lucide-react';

export default function AudioPlayer({ audioUrl }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const cycleSpeed = () => {
    const rates = [1, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-card" style={{
      padding: '16px 24px',
      background: 'rgba(18, 17, 36, 0.85)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      border: '1px solid rgba(0, 240, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 240, 255, 0.15)'
    }}>
      <audio
        ref={audioRef}
        src={audioUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ocean-wave-112906.mp3'}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play / Pause Toggle Button */}
      <button
        onClick={togglePlay}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00F0FF 0%, #6C63FF 100%)',
          border: 'none',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 16px rgba(0, 240, 255, 0.5)'
        }}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
      </button>

      {/* Time & Progress Slider */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#00F0FF', fontWeight: 600 }}>
          <span>🎧 Listening Audio Track</span>
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            accentColor: '#00F0FF',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* Speed control */}
      <button
        onClick={cycleSpeed}
        className="glass-pill"
        style={{
          borderColor: 'rgba(0, 240, 255, 0.4)',
          color: '#00F0FF',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '0.8rem'
        }}
      >
        <FastForward size={14} /> {playbackRate}x Speed
      </button>

      {/* Mute Toggle */}
      <button
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
          }
        }}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}
