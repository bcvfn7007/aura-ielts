const express = require('express');
const { query, get, run } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const { evaluateWritingEssay, evaluateSpeakingResponse } = require('../services/geminiService');

const router = express.Router();

// Helper: Convert raw correct count into IELTS Band Score (1.0 to 9.0)
const calculateIELTTSBandScore = (rawScore, totalQuestions) => {
  if (totalQuestions <= 0) return 1.0;
  const percentage = (rawScore / totalQuestions) * 100;

  if (percentage >= 95) return 9.0;
  if (percentage >= 88) return 8.5;
  if (percentage >= 80) return 8.0;
  if (percentage >= 72) return 7.5;
  if (percentage >= 64) return 7.0;
  if (percentage >= 55) return 6.5;
  if (percentage >= 45) return 6.0;
  if (percentage >= 36) return 5.5;
  if (percentage >= 28) return 5.0;
  if (percentage >= 20) return 4.5;
  if (percentage >= 12) return 4.0;
  return 3.5;
};

// Helper: String normalizer for completion and text matching
const normalizeAnswer = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
};

// Helper: Check if user answer matches any valid answer variation (pipe-separated)
const isAnswerCorrect = (userAnswer, correctAnswer) => {
  const normUser = normalizeAnswer(userAnswer);
  // Support pipe-separated multiple valid variations: "200|200 dollars|$200"
  const variations = correctAnswer.split('|').map(normalizeAnswer);
  return variations.some((v) => normUser === v);
};

// 1. Submit Listening & Reading Tests
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { test_id, user_answers, time_spent_seconds } = req.body;
    const userId = req.user.id;

    if (!test_id || !user_answers) {
      return res.status(400).json({ error: 'test_id and user_answers are required.' });
    }

    const test = await get('SELECT * FROM tests WHERE id = ?', [test_id]);
    if (!test) {
      return res.status(404).json({ error: 'Test not found.' });
    }

    const questions = await query('SELECT * FROM questions WHERE test_id = ? ORDER BY question_number ASC', [test_id]);

    let rawScore = 0;
    const breakdown = [];

    for (const q of questions) {
      const userAnswer = user_answers[q.id] || user_answers[q.question_number] || '';
      const isCorrect = isAnswerCorrect(userAnswer, q.correct_answer);

      if (isCorrect) rawScore += 1;

      breakdown.push({
        question_id: q.id,
        question_number: q.question_number,
        question_type: q.question_type,
        text: q.text,
        user_answer: userAnswer,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation,
        answer_location: q.answer_location
      });
    }

    const totalQuestions = questions.length;
    const bandScore = calculateIELTTSBandScore(rawScore, totalQuestions);

    const result = await run(
      `INSERT INTO user_results (user_id, test_id, band_score, raw_score, total_questions, answers_json, time_spent_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, test_id, bandScore, rawScore, totalQuestions, JSON.stringify(breakdown), time_spent_seconds || 0]
    );

    res.json({
      message: 'Test submitted successfully',
      result_id: result.lastID,
      band_score: bandScore,
      raw_score: rawScore,
      total_questions: totalQuestions,
      percentage: Math.round((rawScore / totalQuestions) * 100),
      transcript_text: test.transcript_text,
      passage_text: test.passage_text,
      breakdown
    });
  } catch (err) {
    console.error('Error submitting test:', err);
    res.status(500).json({ error: 'Failed to process submission.' });
  }
});

// 2. Submit Writing Task (Gemini AI Analysis)
router.post('/submit-writing', authenticateToken, async (req, res) => {
  try {
    const { test_id, task_type, prompt_text, essay_text, time_spent_seconds } = req.body;
    const userId = req.user.id;

    if (!test_id || !essay_text) {
      return res.status(400).json({ error: 'test_id and essay_text are required.' });
    }

    const aiEvaluation = await evaluateWritingEssay(task_type || 'task2', prompt_text || 'IELTS Writing Prompt', essay_text);
    const bandScore = aiEvaluation.band_score || 7.0;
    const wordCount = essay_text.trim().split(/\s+/).filter(Boolean).length;

    const result = await run(
      `INSERT INTO user_results (user_id, test_id, band_score, raw_score, total_questions, answers_json, time_spent_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        test_id,
        bandScore,
        wordCount,
        task_type === 'task1' ? 150 : 250,
        JSON.stringify({ essay_text, aiEvaluation }),
        time_spent_seconds || 0
      ]
    );

    res.json({
      message: 'Writing essay evaluated by Gemini AI',
      result_id: result.lastID,
      band_score: bandScore,
      word_count: wordCount,
      aiEvaluation
    });
  } catch (err) {
    console.error('Error in writing evaluation:', err);
    res.status(500).json({ error: 'Writing evaluation failed.' });
  }
});

// 3. Submit Speaking Response (Web Audio AI Analysis)
router.post('/submit-speaking', authenticateToken, async (req, res) => {
  try {
    const { test_id, part_name, prompt_text, transcript_notes, time_spent_seconds } = req.body;
    const userId = req.user.id;

    // Use test_id from request, fallback to a safe default if missing
    const safeTestId = test_id || null;

    const aiEvaluation = await evaluateSpeakingResponse(
      part_name || 'Part 1, 2 & 3',
      prompt_text || 'IELTS Speaking Practice',
      transcript_notes || 'Audio recording submitted'
    );
    const bandScore = aiEvaluation.band_score || 7.5;

    // Only save to DB if we have a valid test_id
    let resultId = null;
    if (safeTestId) {
      const result = await run(
        `INSERT INTO user_results (user_id, test_id, band_score, raw_score, total_questions, answers_json, time_spent_seconds)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          safeTestId,
          bandScore,
          1,
          1,
          JSON.stringify({ transcript_notes: transcript_notes || 'Audio recording submitted', aiEvaluation }),
          time_spent_seconds || 120
        ]
      );
      resultId = result.lastID;
    }

    res.json({
      message: 'Speaking performance evaluated',
      result_id: resultId,
      band_score: bandScore,
      aiEvaluation
    });
  } catch (err) {
    console.error('Error in speaking evaluation:', err.message, err.stack);
    res.status(500).json({ error: 'Speaking evaluation failed.', detail: err.message });
  }
});

// 4. Get User History
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await query(
      `SELECT r.id, r.test_id, t.title, t.module_type, t.difficulty, r.band_score, r.raw_score, r.total_questions, r.time_spent_seconds, r.completed_at
       FROM user_results r
       JOIN tests t ON r.test_id = t.id
       WHERE r.user_id = ?
       ORDER BY r.completed_at DESC`,
      [userId]
    );
    res.json({ results });
  } catch (err) {
    console.error('Error fetching result history:', err);
    res.status(500).json({ error: 'Failed to fetch result history.' });
  }
});

// 5. Get Summary Stats
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await query(
      `SELECT t.module_type, AVG(r.band_score) as avg_band, MAX(r.band_score) as max_band, COUNT(r.id) as tests_completed
       FROM user_results r
       JOIN tests t ON r.test_id = t.id
       WHERE r.user_id = ?
       GROUP BY t.module_type`,
      [userId]
    );

    const historyTrend = await query(
      `SELECT r.band_score, r.completed_at, t.module_type
       FROM user_results r
       JOIN tests t ON r.test_id = t.id
       WHERE r.user_id = ?
       ORDER BY r.completed_at ASC`,
      [userId]
    );

    const moduleScores = {
      listening: { avg: null, count: 0, max: null },
      reading:   { avg: null, count: 0, max: null },
      writing:   { avg: null, count: 0, max: null },
      speaking:  { avg: null, count: 0, max: null }
    };

    stats.forEach((s) => {
      if (moduleScores[s.module_type] !== undefined) {
        moduleScores[s.module_type] = {
          avg: parseFloat(s.avg_band.toFixed(1)),
          max: parseFloat(s.max_band.toFixed(1)),
          count: s.tests_completed
        };
      }
    });

    res.json({
      summary: moduleScores,
      historyTrend: historyTrend.map(h => ({
        date: h.completed_at.split(' ')[0],
        band: h.band_score,
        module: h.module_type
      }))
    });
  } catch (err) {
    console.error('Error generating summary:', err);
    res.status(500).json({ error: 'Failed to generate summary stats.' });
  }
});

module.exports = router;
