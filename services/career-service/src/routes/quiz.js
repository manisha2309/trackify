const router = require('express').Router();
const { GoogleGenAI } = require('@google/genai');

const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
const RETRYABLE_STATUSES = [503, 429, 404];

function getErrorStatus(err) {
  if (!err) return null;
  if (typeof err.status === 'number') return err.status;
  if (typeof err.statusCode === 'number') return err.statusCode;
  if (typeof err.code === 'number') return err.code;
  if (err.status && !isNaN(Number(err.status))) return Number(err.status);
  if (err.response?.status) return Number(err.response.status);
  try {
    const parsed = typeof err.message === 'string' ? JSON.parse(err.message) : null;
    if (parsed?.error?.code) return Number(parsed.error.code);
  } catch {}
  if (typeof err.message === 'string') {
    if (err.message.includes('503')) return 503;
    if (err.message.includes('429')) return 429;
    if (err.message.includes('404')) return 404;
  }
  return null;
}

async function callGeminiWithFallback(ai, requestConfig) {
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < GEMINI_MODELS.length; i++) {
      const model = GEMINI_MODELS[i];
      try {
        const response = await ai.models.generateContent({
          ...requestConfig,
          model,
        });
        return response;
      } catch (err) {
        const status = getErrorStatus(err);
        if (!RETRYABLE_STATUSES.includes(status)) {
          throw err;
        }
        if (i < GEMINI_MODELS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }
    if (pass === 0) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  throw new Error('All Gemini attempts failed');
}

// Static quiz questions
const QUESTIONS = [
  {
    id: 1,
    question: "What type of work environment energizes you the most?",
    options: ["Collaborative team environment","Independent remote work","Dynamic startup atmosphere","Structured corporate setting"],
  },
  {
    id: 2,
    question: "Which activity sounds most exciting to you?",
    options: ["Building apps or websites","Designing user interfaces","Analysing data and finding patterns","Teaching or mentoring others"],
  },
  {
    id: 3,
    question: "What is your strongest skill area?",
    options: ["Logical problem solving","Creative thinking","Communication & leadership","Research & analysis"],
  },
  {
    id: 4,
    question: "Which subject did you enjoy the most in school?",
    options: ["Mathematics / Computer Science","Arts / Design","Biology / Chemistry","Economics / Commerce"],
  },
  {
    id: 5,
    question: "How do you prefer to solve problems?",
    options: ["Write code or build tools","Sketch wireframes or prototypes","Talk it through with a team","Research and read documentation"],
  },
  {
    id: 6,
    question: "What kind of impact do you want to make?",
    options: ["Build technology products","Create meaningful designs","Help people directly","Drive business growth"],
  },
  {
    id: 7,
    question: "How comfortable are you with mathematics?",
    options: ["Love it â€” the more complex the better","Fine with basics, prefer visual stuff","Moderate â€” can handle statistics","I prefer words over numbers"],
  },
  {
    id: 8,
    question: "Where do you see yourself in 5 years?",
    options: ["Leading an engineering team","Running my own design studio","Working in healthcare or research","Managing a business or startup"],
  },
];

const CAREERS = [
  "Software Developer",
  "UI/UX Designer",
  "Data Scientist",
  "Product Manager",
  "Doctor / Medical",
  "Business Analyst",
  "Graphic Designer",
  "Research Scientist"
];

// OPTION_POINTS[questionIndex][optionIndex] = career -> points (3: strong, 2: good, 1: slight)
const OPTION_POINTS = [
  // Q0: What type of work environment energizes you the most?
  [
    { "Product Manager": 3, "UI/UX Designer": 2, "Business Analyst": 1 }, // 0: Collaborative team environment
    { "Software Developer": 3, "Graphic Designer": 3, "Research Scientist": 1 }, // 1: Independent remote work
    { "Data Scientist": 3, "Software Developer": 2, "Product Manager": 1 }, // 2: Dynamic startup atmosphere
    { "Doctor / Medical": 3, "Business Analyst": 3, "Research Scientist": 1 }  // 3: Structured corporate setting
  ],
  // Q1: Which activity sounds most exciting to you?
  [
    { "Software Developer": 3, "Product Manager": 1 }, // 0: Building apps or websites
    { "UI/UX Designer": 3, "Graphic Designer": 1 }, // 1: Designing user interfaces
    { "Data Scientist": 3, "Business Analyst": 2, "Research Scientist": 1 }, // 2: Analysing data and finding patterns
    { "Doctor / Medical": 3, "Research Scientist": 2 } // 3: Teaching or mentoring others
  ],
  // Q2: What is your strongest skill area?
  [
    { "Software Developer": 3, "Data Scientist": 2 }, // 0: Logical problem solving
    { "Graphic Designer": 3, "UI/UX Designer": 2 }, // 1: Creative thinking
    { "Product Manager": 3, "Business Analyst": 2, "Doctor / Medical": 1 }, // 2: Communication & leadership
    { "Research Scientist": 3, "Data Scientist": 3, "Business Analyst": 1 } // 3: Research & analysis
  ],
  // Q3: Which subject did you enjoy the most in school?
  [
    { "Data Scientist": 3, "Software Developer": 3 }, // 0: Mathematics / Computer Science
    { "Graphic Designer": 3, "UI/UX Designer": 2 }, // 1: Arts / Design
    { "Doctor / Medical": 3, "Research Scientist": 3 }, // 2: Biology / Chemistry
    { "Business Analyst": 3, "Product Manager": 2 } // 3: Economics / Commerce
  ],
  // Q4: How do you prefer to solve problems?
  [
    { "Software Developer": 3, "Data Scientist": 2 }, // 0: Write code or build tools
    { "UI/UX Designer": 3, "Graphic Designer": 1 }, // 1: Sketch wireframes or prototypes
    { "Product Manager": 3, "Business Analyst": 2 }, // 2: Talk it through with a team
    { "Research Scientist": 3, "Doctor / Medical": 2, "Data Scientist": 1 } // 3: Research and read documentation
  ],
  // Q5: What kind of impact do you want to make?
  [
    { "Software Developer": 3, "Product Manager": 2 }, // 0: Build technology products
    { "Graphic Designer": 3, "UI/UX Designer": 2 }, // 1: Create meaningful designs
    { "Doctor / Medical": 3, "Research Scientist": 2 }, // 2: Help people directly
    { "Business Analyst": 3, "Data Scientist": 2, "Product Manager": 1 } // 3: Drive business growth
  ],
  // Q6: How comfortable are you with mathematics?
  [
    { "Data Scientist": 3, "Research Scientist": 2 }, // 0: Love it â€” the more complex the better
    { "Graphic Designer": 3, "UI/UX Designer": 2 }, // 1: Fine with basics, prefer visual stuff
    { "Business Analyst": 3, "Software Developer": 2, "Doctor / Medical": 1 }, // 2: Moderate â€” can handle statistics
    { "Doctor / Medical": 3, "Product Manager": 1 } // 3: I prefer words over numbers
  ],
  // Q7: Where do you see yourself in 5 years?
  [
    { "Software Developer": 3, "Data Scientist": 2 }, // 0: Leading an engineering team
    { "Graphic Designer": 3, "UI/UX Designer": 3 }, // 1: Running my own design studio
    { "Doctor / Medical": 3, "Research Scientist": 3 }, // 2: Working in healthcare or research
    { "Product Manager": 3, "Business Analyst": 2 } // 3: Managing a business or startup
  ]
];

// Precompute maxPossible for each career
const maxPossible = {};
for (const career of CAREERS) {
  maxPossible[career] = OPTION_POINTS.reduce((total, questionOptions) => {
    return total + Math.max(0, ...questionOptions.map(opt => opt[career] || 0));
  }, 0);
}

// GET /quiz/questions
router.get('/questions', (_, res) => res.json({ questions: QUESTIONS, total: QUESTIONS.length }));

// POST /quiz/submit  â€” body: { answers: [0,1,2,...] }  (index of chosen option per question)
router.post('/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length !== QUESTIONS.length || !answers.every(a => Number.isInteger(a) && a >= 0 && a <= 3)) {
      return res.status(400).json({ error: 'answers must be an array of 8 numbers between 0 and 3' });
    }

    const scores = {};
    for (const career of CAREERS) {
      scores[career] = answers.reduce((sum, ans, i) => {
        return sum + (OPTION_POINTS[i][ans][career] || 0);
      }, 0);
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topCareer = sorted[0][0];
    const topScore  = sorted[0][1];
    const matchPercentage  = Math.min(98, Math.round((topScore / maxPossible[topCareer]) * 100));

    // Use Gemini API if available, else return "" if it fails
    let aiInsight = "";

    if (process.env.GEMINI_API_KEY && 
        process.env.GEMINI_API_KEY !== 'your_gemini_key_here') {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const contents = `A student's career quiz suggests they are best suited for: "${topCareer}". 
          Give a 2-sentence personalized insight about this career path for an Indian student, 
          mentioning relevant entrance exams or skills to focus on. Be encouraging and specific.`;

        const geminiPromise = callGeminiWithFallback(ai, { contents });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Quiz Gemini timeout')), 8000)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]);
        if (response && response.text) {
          aiInsight = response.text.trim();
        }
      } catch (e) {
        console.warn("Gemini Error in Quiz (returning empty insight):", e.message);
        aiInsight = "";
      }
    }

    res.json({
      topCareer,
      matchPercentage,
      allMatches: sorted.slice(0, 5).map(([career, score]) => ({
        career,
        matchPercentage: Math.min(98, Math.round((score / maxPossible[career]) * 100)),
      })),
      aiInsight,
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;
