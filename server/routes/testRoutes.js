const express = require('express');
const { query, get } = require('../config/db');

const router = express.Router();

// Get list of tests with optional filters
router.get('/', async (req, res) => {
  try {
    const { module_type, difficulty, topic } = req.query;
    let sql = 'SELECT id, title, module_type, difficulty, topic, duration_minutes, total_questions, created_at FROM tests WHERE 1=1';
    const params = [];

    if (module_type && module_type !== 'all') {
      sql += ' AND module_type = ?';
      params.push(module_type.toLowerCase());
    }

    if (difficulty && difficulty !== 'all') {
      sql += ' AND difficulty = ?';
      params.push(difficulty.toLowerCase());
    }

    if (topic && topic !== 'all') {
      sql += ' AND topic = ?';
      params.push(topic.toLowerCase());
    }

    sql += ' ORDER BY id ASC';

    const tests = await query(sql, params);
    res.json({ tests });
  } catch (err) {
    console.error('Error fetching tests:', err);
    res.status(500).json({ error: 'Failed to fetch tests.' });
  }
});

// Get detailed test by ID (including passage, audio, transcript, and questions)
router.get('/:id', async (req, res) => {
  try {
    const testId = req.params.id;
    const test = await get('SELECT * FROM tests WHERE id = ?', [testId]);

    if (!test) {
      return res.status(404).json({ error: 'Test not found.' });
    }

    const questionsRaw = await query('SELECT * FROM questions WHERE test_id = ? ORDER BY question_number ASC', [testId]);

    const questions = questionsRaw.map((q) => ({
      ...q,
      options: q.options_json ? JSON.parse(q.options_json) : null
    }));

    res.json({
      test: {
        ...test,
        questions
      }
    });
  } catch (err) {
    console.error('Error fetching test detail:', err);
    res.status(500).json({ error: 'Failed to fetch test details.' });
  }
});

module.exports = router;
