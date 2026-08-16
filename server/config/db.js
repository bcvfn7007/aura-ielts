const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const pgConnectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || null;

let isPostgres = false;
let pgPool = null;
let sqliteDb = null;

if (pgConnectionString) {
  try {
    pgPool = new Pool({
      connectionString: pgConnectionString,
      ssl: process.env.NODE_ENV === 'production' || pgConnectionString.includes('supabase') ? { rejectUnauthorized: false } : false
    });
    isPostgres = true;
    console.log('✅ Connected to PostgreSQL (Supabase/Neon) successfully.');
  } catch (err) {
    console.error('⚠️ Failed to initialize PostgreSQL pool, falling back to SQLite:', err.message);
  }
}

if (!isPostgres) {
  const dbPath = path.resolve(__dirname, '../db/database.sqlite');
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err.message);
    } else {
      console.log('Connected to local SQLite database successfully.');
    }
  });
}

// Convert SQLite '?' placeholders to PostgreSQL '$1, $2...'
function convertSqlPlaceholders(sql) {
  if (!isPostgres) return sql;
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

const query = (sql, params = []) => {
  if (isPostgres) {
    const formattedSql = convertSqlPlaceholders(sql);
    return pgPool.query(formattedSql, params).then(res => res.rows);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

const get = (sql, params = []) => {
  if (isPostgres) {
    const formattedSql = convertSqlPlaceholders(sql);
    return pgPool.query(formattedSql, params).then(res => res.rows[0] || null);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
};

const run = async (sql, params = []) => {
  if (isPostgres) {
    let formattedSql = convertSqlPlaceholders(sql);
    const isInsert = /^\s*INSERT\s+INTO/i.test(formattedSql);

    if (isInsert && !/RETURNING/i.test(formattedSql)) {
      formattedSql += ' RETURNING id';
    }

    const res = await pgPool.query(formattedSql, params);
    const lastID = res.rows && res.rows[0] ? res.rows[0].id : null;
    return { lastID, changes: res.rowCount };
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

const initDB = async () => {
  try {
    if (isPostgres) {
      await run(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          target_band REAL DEFAULT 7.5,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await run(`
        CREATE TABLE IF NOT EXISTS tests (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          module_type TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          topic TEXT NOT NULL,
          duration_minutes INTEGER DEFAULT 30,
          total_questions INTEGER DEFAULT 10,
          audio_url TEXT,
          passage_text TEXT,
          transcript_text TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await run(`
        CREATE TABLE IF NOT EXISTS questions (
          id SERIAL PRIMARY KEY,
          test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
          question_number INTEGER NOT NULL,
          question_type TEXT NOT NULL,
          text TEXT NOT NULL,
          options_json TEXT,
          correct_answer TEXT NOT NULL,
          explanation TEXT,
          answer_location TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await run(`
        CREATE TABLE IF NOT EXISTS user_results (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
          band_score REAL NOT NULL,
          raw_score INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          answers_json TEXT NOT NULL,
          time_spent_seconds INTEGER NOT NULL,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await run(`
        CREATE TABLE IF NOT EXISTS user_recordings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
          part_name TEXT,
          audio_url TEXT NOT NULL,
          transcript_text TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      await run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          target_band REAL DEFAULT 7.5,
          avatar_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await run(`
        CREATE TABLE IF NOT EXISTS tests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          module_type TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          topic TEXT NOT NULL,
          duration_minutes INTEGER DEFAULT 30,
          total_questions INTEGER DEFAULT 10,
          audio_url TEXT,
          passage_text TEXT,
          transcript_text TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await run(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_id INTEGER NOT NULL,
          question_number INTEGER NOT NULL,
          question_type TEXT NOT NULL,
          text TEXT NOT NULL,
          options_json TEXT,
          correct_answer TEXT NOT NULL,
          explanation TEXT,
          answer_location TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
        )
      `);

      await run(`
        CREATE TABLE IF NOT EXISTS user_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          test_id INTEGER,
          band_score REAL NOT NULL,
          raw_score INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          answers_json TEXT NOT NULL,
          time_spent_seconds INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
        )
      `);

      await run(`
        CREATE TABLE IF NOT EXISTS user_recordings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          test_id INTEGER,
          part_name TEXT,
          audio_url TEXT NOT NULL,
          transcript_text TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
        )
      `);
    }

    const existingCount = await get("SELECT COUNT(*) as count FROM tests");
    const countVal = existingCount ? parseInt(existingCount.count || existingCount.COUNT || 0, 10) : 0;
    if (countVal === 0) {
      console.log('Seeding BandUp original IELTS practice test suites...');
      await seedOriginalIELTSTests();
    }
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
};

const seedOriginalIELTSTests = async () => {
  const scriptListening1 = `RECEPTIONIST: Good morning, Sydney Harbour Executive Apartments. How may I assist you today?
CALLER: Hello! I'd like to book a holiday apartment for an upcoming business trip and family stay.
RECEPTIONIST: Certainly! Could I take your full name, please?
CALLER: Yes, it's Sarah Jenkins. That's J-E-N-K-I-N-S.
RECEPTIONIST: Thank you, Ms. Jenkins. And what is the date of your arrival?
CALLER: We plan to arrive on the 14th of October.
RECEPTIONIST: Perfect. How many nights will you be staying with us?
CALLER: We will be staying for 5 nights in total.
RECEPTIONIST: Excellent. And a contact mobile number?
CALLER: It's 0412 890 334.
RECEPTIONIST: Got it. Do you have any special room preferences?
CALLER: Yes, we prefer a ocean view suite on a higher floor, if available.
RECEPTIONIST: Absolutely. To confirm the reservation, a deposit of 200 dollars is required today.
CALLER: That sounds great. Let us proceed with that.`;

  const test1 = await run(
    `INSERT INTO tests (title, module_type, difficulty, topic, duration_minutes, total_questions, audio_url, passage_text, transcript_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Listening Part 1: Sydney Harbour Apartment Booking Form',
      'listening',
      'easy',
      'education',
      12,
      6,
      'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ocean-wave-112906.mp3',
      null,
      scriptListening1
    ]
  );

  const q1List = [
    { num: 1, type: 'form_completion', text: 'Write the customer\'s surname: _______', options: null, answer: 'Jenkins', exp: 'The caller states her surname as J-E-N-K-I-N-S.', loc: 'Sarah Jenkins. That\'s J-E-N-K-I-N-S' },
    { num: 2, type: 'form_completion', text: 'Arrival Date: 14th of _______', options: null, answer: 'October', exp: 'Arrival date is stated as the 14th of October.', loc: '14th of October' },
    { num: 3, type: 'form_completion', text: 'Length of Stay: _______ nights', options: null, answer: '5|five', exp: 'The family will stay for 5 nights.', loc: 'staying for 5 nights in total' },
    { num: 4, type: 'form_completion', text: 'Contact Mobile Number: 0412 _______ 334', options: null, answer: '890', exp: 'The mobile number is 0412 890 334.', loc: '0412 890 334' },
    { num: 5, type: 'form_completion', text: 'Room Preference: _______ view suite', options: null, answer: 'ocean', exp: 'The caller requests an ocean view suite.', loc: 'ocean view suite' },
    { num: 6, type: 'form_completion', text: 'Deposit Amount required to confirm: $_______', options: null, answer: '200|200 dollars|$200', exp: 'A deposit of $200 is required to confirm booking.', loc: 'deposit of 200 dollars is required' }
  ];

  for (const q of q1List) {
    await run(
      `INSERT INTO questions (test_id, question_number, question_type, text, options_json, correct_answer, explanation, answer_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [test1.lastID, q.num, q.type, q.text, q.options, q.answer, q.exp, q.loc]
    );
  }

  const passageReading1 = `Paragraph A: Sustainable eco-architecture has evolved from a niche architectural trend into a core mandate for modern urban development. In the early 20th century, building designs focused almost exclusively on aesthetic grandeur and structural scale, often neglecting thermal efficiency and carbon footprints. However, contemporary architects now integrate passive solar design, natural cross-ventilation, and recycled building materials to minimize environmental impact.

Paragraph B: One of the most effective passive strategies is the use of green roofs—rooftop gardens layered with drought-resistant vegetation. Research demonstrates that green roofs reduce urban heat island effects by lowering surface temperatures up to 15 degrees Celsius compared to conventional asphalt roofs. Additionally, they absorb heavy rainwater, preventing stormwater runoff from overloading municipal drainage systems.

Paragraph C: Despite these proven advantages, widespread adoption faces economic skepticism. Initial capital expenditure for sustainable materials and specialized engineering can be 10% to 20% higher than traditional construction methods. Nevertheless, long-term operational savings on heating, cooling, and electricity typically offset these upfront costs within seven to ten years.`;

  const test2 = await run(
    `INSERT INTO tests (title, module_type, difficulty, topic, duration_minutes, total_questions, audio_url, passage_text, transcript_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Reading Passage 1: Evolution of Sustainable Eco-Architecture',
      'reading',
      'medium',
      'environment',
      15,
      5,
      null,
      passageReading1,
      null
    ]
  );

  const q2List = [
    {
      num: 1,
      type: 'true_false_not_given',
      text: 'Early 20th-century building designs prioritized environmental thermal efficiency over structural scale.',
      options: JSON.stringify(['TRUE', 'FALSE', 'NOT GIVEN']),
      answer: 'FALSE',
      exp: 'Paragraph A states early 20th-century designs focused almost exclusively on aesthetic grandeur, neglecting thermal efficiency.',
      loc: 'Paragraph A: building designs focused almost exclusively on aesthetic grandeur... neglecting thermal efficiency'
    },
    {
      num: 2,
      type: 'true_false_not_given',
      text: 'Green roofs can decrease rooftop surface temperatures by as much as 15 degrees Celsius.',
      options: JSON.stringify(['TRUE', 'FALSE', 'NOT GIVEN']),
      answer: 'TRUE',
      exp: 'Paragraph B explicitly notes green roofs lower surface temperatures up to 15 degrees Celsius.',
      loc: 'Paragraph B: lowering surface temperatures up to 15 degrees Celsius'
    },
    {
      num: 3,
      type: 'true_false_not_given',
      text: 'Most European governments offer tax incentives for installing green roofs on private residences.',
      options: JSON.stringify(['TRUE', 'FALSE', 'NOT GIVEN']),
      answer: 'NOT GIVEN',
      exp: 'The passage mentions benefits and costs, but does not mention European government tax incentives.',
      loc: 'Not mentioned in text'
    },
    {
      num: 4,
      type: 'form_completion',
      text: 'Initial capital costs for eco-architecture can be 10% to _____ higher than traditional methods.',
      options: null,
      answer: '20%',
      exp: 'Paragraph C states upfront costs can be 10% to 20% higher.',
      loc: 'Paragraph C: 10% to 20% higher than traditional construction'
    },
    {
      num: 5,
      type: 'form_completion',
      text: 'Operational energy savings usually recoup initial investments within seven to _____ years.',
      options: null,
      answer: 'ten',
      exp: 'Paragraph C states savings offset upfront costs within seven to ten years.',
      loc: 'Paragraph C: offset these upfront costs within seven to ten years'
    }
  ];

  for (const q of q2List) {
    await run(
      `INSERT INTO questions (test_id, question_number, question_type, text, options_json, correct_answer, explanation, answer_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [test2.lastID, q.num, q.type, q.text, q.options, q.answer, q.exp, q.loc]
    );
  }

  const passageReading2 = `List of Headings:
i. Economic barriers to technological adoption
ii. Psychological drivers of team innovation
iii. The shift from physical to digital collaboration
iv. Measuring long-term organizational productivity

Paragraph A: Innovation in modern organizations is rarely the product of isolated genius; rather, it emerges from collaborative team dynamics. Psychological safety—the shared belief that team members can take interpersonal risks without fear of ridicule—has been identified as the single strongest predictor of workplace creativity. When employees feel safe to propose unorthodox ideas, problem-solving efficiency increases significantly.

Paragraph B: However, transitioning to remote digital workspaces has introduced distinct friction points. While video conferencing and instant messaging tools facilitate rapid communication, they often lack the spontaneous informal interactions—such as casual hallway conversations—that spark novel cross-disciplinary insights.

Paragraph C: Furthermore, financial constraints frequently stifle experimental projects before they gain momentum. Executive boards under quarterly revenue pressure tend to prioritize short-term incremental improvements over high-risk, radical innovation initiatives with uncertain return horizons.`;

  const test3 = await run(
    `INSERT INTO tests (title, module_type, difficulty, topic, duration_minutes, total_questions, audio_url, passage_text, transcript_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Reading Passage 2: The Psychology of Urban Innovation',
      'reading',
      'hard',
      'technology',
      18,
      3,
      null,
      passageReading2,
      null
    ]
  );

  const q3List = [
    {
      num: 1,
      type: 'matching',
      text: 'Choose the correct heading for Paragraph A:',
      options: JSON.stringify(['i. Economic barriers', 'ii. Psychological drivers of team innovation', 'iii. Physical to digital collaboration', 'iv. Measuring productivity']),
      answer: 'ii. Psychological drivers of team innovation',
      exp: 'Paragraph A discusses psychological safety and team collaboration as drivers of innovation.',
      loc: 'Paragraph A: Psychological safety... identified as the single strongest predictor'
    },
    {
      num: 2,
      type: 'matching',
      text: 'Choose the correct heading for Paragraph B:',
      options: JSON.stringify(['i. Economic barriers', 'ii. Psychological drivers of team innovation', 'iii. The shift from physical to digital collaboration', 'iv. Measuring productivity']),
      answer: 'iii. The shift from physical to digital collaboration',
      exp: 'Paragraph B explores remote digital workspaces, video conferencing, and digital communication friction.',
      loc: 'Paragraph B: transitioning to remote digital workspaces'
    },
    {
      num: 3,
      type: 'matching',
      text: 'Choose the correct heading for Paragraph C:',
      options: JSON.stringify(['i. Economic barriers to technological adoption', 'ii. Psychological drivers', 'iii. Digital collaboration', 'iv. Measuring productivity']),
      answer: 'i. Economic barriers to technological adoption',
      exp: 'Paragraph C details financial constraints, revenue pressures, and budget barriers.',
      loc: 'Paragraph C: financial constraints frequently stifle experimental projects'
    }
  ];

  for (const q of q3List) {
    await run(
      `INSERT INTO questions (test_id, question_number, question_type, text, options_json, correct_answer, explanation, answer_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [test3.lastID, q.num, q.type, q.text, q.options, q.answer, q.exp, q.loc]
    );
  }

  const promptWriting2 = `Some people believe that university education should be completely free for all students, funded entirely by government taxation. Others argue that students should pay tuition fees as higher education primarily benefits the individual's career prospects.

Discuss both views and give your own opinion. Give reasons for your answer and include relevant examples. Write at least 250 words.`;

  await run(
    `INSERT INTO tests (title, module_type, difficulty, topic, duration_minutes, total_questions, audio_url, passage_text, transcript_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Writing Task 2: Higher Education Funding & Free Tuition',
      'writing',
      'medium',
      'education',
      40,
      1,
      null,
      promptWriting2,
      null
    ]
  );

  const promptSpeaking = `PART 1: INTRODUCTORY QUESTIONS
- What type of accommodation do you live in? What is your favorite room?
- How often do you use public transportation in your city?

PART 2: CUE CARD (Preparation: 1 Minute | Response: 2 Minutes)
Describe a memorable travel experience you had with friends or family.
You should say:
- Where you went and who you traveled with
- What activities you participated in
- What made this trip particularly memorable
And explain what you learned from this journey.

PART 3: TWO-WAY DISCUSSION
- How has modern technology changed the way people plan their holidays?
- Do you think tourism always brings economic benefits to local communities?`;

  await run(
    `INSERT INTO tests (title, module_type, difficulty, topic, duration_minutes, total_questions, audio_url, passage_text, transcript_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Speaking Practice: Accommodation, Travel & Tourism',
      'speaking',
      'medium',
      'culture',
      15,
      3,
      null,
      promptSpeaking,
      null
    ]
  );

  console.log('Database successfully initialized with BandUp practice material.');
};

module.exports = {
  db: sqliteDb,
  query,
  get,
  run,
  initDB
};
