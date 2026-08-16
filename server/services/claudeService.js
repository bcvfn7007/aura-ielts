const { Anthropic } = require('@anthropic-ai/sdk');

const apiKey = process.env.ANTHROPIC_API_KEY || null;
let anthropic = null;

if (apiKey) {
  try {
    anthropic = new Anthropic({ apiKey });
    console.log('✅ Anthropic Claude API Client initialized successfully.');
  } catch (err) {
    console.error('⚠️ Failed to initialize Anthropic client:', err.message);
  }
}

/**
 * Evaluate IELTS Writing Essay using Claude 3.5 Sonnet / Haiku
 */
const evaluateWritingEssayWithClaude = async (taskType, prompt, essayText) => {
  if (!anthropic) return null;

  try {
    const promptMessage = `You are a certified Senior IELTS Writing Examiner. Evaluate the candidate's IELTS ${taskType} essay strictly adhering to official IELTS Band Descriptors (Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).

Exam Prompt:
"${prompt}"

Candidate Essay:
"${essayText}"

Instructions:
1. Provide a numerical score from 0.0 to 9.0 (half-band increments) for each criterion and overall.
2. Under "error_corrections", quote 2-4 exact phrases from the essay that contain grammar, vocabulary, or cohesion errors, providing the corrected version and explanation.
3. Return ONLY raw JSON without markdown formatting or code blocks:
{
  "band_score": 7.5,
  "task_achievement": {
    "score": 7.5,
    "feedback": "Detailed feedback on response to prompt and key features."
  },
  "coherence_cohesion": {
    "score": 7.0,
    "feedback": "Detailed feedback on paragraphing, linking words, and logical progression."
  },
  "lexical_resource": {
    "score": 8.0,
    "feedback": "Detailed feedback on vocabulary precision, academic collocations, and register."
  },
  "grammar_accuracy": {
    "score": 7.5,
    "feedback": "Detailed feedback on sentence structures, complex clauses, and punctuation."
  },
  "error_corrections": [
    {
      "original_quote": "exact phrase from essay",
      "corrected": "corrected phrase",
      "explanation": "Why this change improves accuracy or Band score."
    }
  ],
  "overall_feedback": "Comprehensive summary of essay performance.",
  "recommendations": [
    "Actionable tip 1",
    "Actionable tip 2",
    "Actionable tip 3"
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.2,
      messages: [{ role: 'user', content: promptMessage }]
    });

    const rawContent = response.content[0]?.text || '';
    const cleanJsonText = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonText);
  } catch (err) {
    console.error('Claude API writing evaluation failed:', err.message);
    return null;
  }
};

/**
 * Evaluate IELTS Speaking Performance using Claude 3.5 Sonnet / Haiku
 */
const evaluateSpeakingResponseWithClaude = async (partName, promptText, transcriptOrNotes) => {
  if (!anthropic) return null;

  try {
    const promptMessage = `You are an expert certified IELTS Speaking Examiner. Evaluate the candidate's spoken performance for IELTS ${partName} based on official criteria: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation / Accent Intelligibility.

Exam Prompt:
"${promptText}"

Candidate Spoken Transcript / Notes:
"${transcriptOrNotes || 'No speech captured'}"

Instructions:
1. Evaluate candidate spoken transcript.
2. Return ONLY raw JSON without markdown formatting:
{
  "band_score": 7.0,
  "fluency_coherence": {
    "score": 7.0,
    "feedback": "Specific evaluation of speech length, hesitation, and natural flow."
  },
  "lexical_resource": {
    "score": 7.5,
    "feedback": "Specific evaluation of topic-specific vocabulary and idioms used."
  },
  "grammar_accuracy": {
    "score": 7.0,
    "feedback": "Specific evaluation of sentence structures and tenses."
  },
  "pronunciation": {
    "score": 7.5,
    "feedback": "Specific evaluation of delivery and acoustic clarity."
  },
  "accent_analysis": {
    "clarity_percentage": 88,
    "accent_type": "Clear & Intelligible Accent",
    "phoneme_tips": [
      "Focus on soft 'th' (/θ/) sound in 'think' or 'three'",
      "Maintain clear word-ending consonants (-t, -d, -s)"
    ]
  },
  "error_corrections": [
    {
      "original_quote": "exact phrase spoken",
      "corrected": "native phrasing",
      "explanation": "Why this phrasing sounds more natural or accurate."
    }
  ],
  "overall_feedback": "Comprehensive summary of speaking performance.",
  "recommendations": [
    "Actionable tip 1",
    "Actionable tip 2"
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.2,
      messages: [{ role: 'user', content: promptMessage }]
    });

    const rawContent = response.content[0]?.text || '';
    const cleanJsonText = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonText);
  } catch (err) {
    console.error('Claude API speaking evaluation failed:', err.message);
    return null;
  }
};

module.exports = {
  evaluateWritingEssayWithClaude,
  evaluateSpeakingResponseWithClaude
};
