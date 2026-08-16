const { supabase } = require('../config/supabaseClient');
const path = require('path');
const fs = require('fs');

/**
 * Upload speaking audio buffer or base64 payload to Supabase Storage or return URL
 */
const uploadSpeakingAudio = async (userId, audioBufferOrBase64, mimeType = 'audio/webm') => {
  const fileName = `user_${userId}_${Date.now()}.webm`;

  // 1. Try Supabase Storage if configured
  if (supabase) {
    try {
      let buffer = audioBufferOrBase64;
      if (typeof audioBufferOrBase64 === 'string' && audioBufferOrBase64.startsWith('data:')) {
        const base64Data = audioBufferOrBase64.split(',')[1];
        buffer = Buffer.from(base64Data, 'base64');
      }

      const { data, error } = await supabase
        .storage
        .from('speaking-recordings')
        .upload(fileName, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase
          .storage
          .from('speaking-recordings')
          .getPublicUrl(fileName);
        return publicUrlData.publicUrl;
      } else {
        console.warn('Supabase storage upload error:', error?.message);
      }
    } catch (err) {
      console.error('Storage upload exception:', err.message);
    }
  }

  // 2. Fallback to local uploads directory or placeholder CDN URL
  try {
    const uploadsDir = path.resolve(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const localFilePath = path.join(uploadsDir, fileName);
    if (Buffer.isBuffer(audioBufferOrBase64)) {
      fs.writeFileSync(localFilePath, audioBufferOrBase64);
      return `/uploads/${fileName}`;
    }
  } catch (err) {
    console.error('Local file storage failed:', err.message);
  }

  return `https://storage.bandup.app/recordings/${fileName}`;
};

module.exports = {
  uploadSpeakingAudio
};
