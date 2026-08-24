const router = require('express').Router();
const { GoogleGenAI } = require('@google/genai');

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
    options: ["Love it — the more complex the better","Fine with basics, prefer visual stuff","Moderate — can handle statistics","I prefer words over numbers"],
  },
  {
    id: 8,
    question: "Where do you see yourself in 5 years?",
    options: ["Leading an engineering team","Running my own design studio","Working in healthcare or research","Managing a business or startup"],
  },
];

// Career matching weights map
const CAREER_MAP = {
  "Software Developer":        [3,0,3,3,3,0,3,0],
  "UI/UX Designer":            [0,3,0,0,3,3,0,3],
  "Data Scientist":            [2,3,2,0,0,0,3,0],
  "Product Manager":           [2,0,3,0,0,2,0,3],
  "Doctor / Medical":          [0,0,0,3,0,3,0,2],
  "Business Analyst":          [1,0,2,3,0,0,2,2],
  "Graphic Designer":          [0,3,0,0,2,3,0,2],
  "Research Scientist":        [2,0,2,3,2,0,3,0],
};

const DEFAULT_INSIGHTS = {
  "Software Developer": "High demand in product companies and tech hubs across India (Bengaluru, Hyderabad, Pune). Focus on Data Structures, Algorithms (LeetCode), and building full-stack web applications.",
  "UI/UX Designer": "Growing demand as Indian consumer tech and global design agencies expand. Focus on mastering Figma, building a case study portfolio, and understanding usability heuristics.",
  "Data Scientist": "Tremendous opportunity across fintech, e-commerce, and analytics firms. Focus on Python, statistics, SQL, and practical machine learning projects on Kaggle.",
  "Product Manager": "Excellent pathway for cross-functional thinkers in high-growth startups. Focus on product sense, wireframing, metrics analysis (SQL/Mixpanel), and leadership.",
  "Doctor / Medical": "Noble and resilient career path in healthcare. Focus on NEET prep, medical sciences, and clinical research.",
  "Business Analyst": "Crucial role bridging business stakeholders and tech teams. Focus on Excel modeling, SQL, PowerBI/Tableau, and business communication.",
  "Graphic Designer": "Creative career in branding, marketing, and media agencies. Master Adobe Illustrator/Photoshop, visual identity design, and motion graphics.",
  "Research Scientist": "Specialized path in cutting-edge R&D laboratories and academia. Focus on publications, GATE/CSIR-NET, and advanced domain research."
};

// GET /quiz/questions
router.get('/questions', (_, res) => res.json({ questions: QUESTIONS, total: QUESTIONS.length }));

// POST /quiz/submit  — body: { answers: [0,1,2,...] }  (index of chosen option per question)
router.post('/submit', async (req, res) => {
  try {
    const { answers, userId } = req.body;
    if (!answers || answers.length !== QUESTIONS.length)
      return res.status(400).json({ error: 'Must answer all 8 questions' });

    const scores = {};
    for (const [career, weights] of Object.entries(CAREER_MAP)) {
      scores[career] = answers.reduce((sum, ans, i) => {
        return sum + (ans === Math.round(weights[i] / 3 * 3) ? weights[i] : 0);
      }, 0);
    }

    const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
    const topCareer = sorted[0][0];
    const maxScore  = sorted[0][1];
    const matchPct  = Math.min(95, Math.round((maxScore / 9) * 100));

    // Use Gemini API if available, else curated insight
    let aiInsight = DEFAULT_INSIGHTS[topCareer] || `Great choice! Pursuing a path in ${topCareer} offers immense growth opportunities. Focus on practical projects and industry-relevant skills.`;

    if (process.env.GEMINI_API_KEY && 
        process.env.GEMINI_API_KEY !== 'your_gemini_key_here' && 
        !process.env.GEMINI_API_KEY.includes('AIzaSyCVZdi7Roqv4m8v1yQKvrlv_aa_POHUL_g')) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `A student's career quiz suggests they are best suited for: "${topCareer}". 
            Give a 2-sentence personalized insight about this career path for an Indian student, 
            mentioning relevant entrance exams or skills to focus on. Be encouraging and specific.`
        });
        if (response && response.text) {
          aiInsight = response.text.trim();
        }
      } catch (e) {
        console.warn("Gemini Error in Quiz (using default insight):", e.message);
      }
    }

    res.json({
      topCareer,
      matchPercentage: matchPct,
      allMatches: sorted.slice(0,5).map(([career, score]) => ({
        career,
        matchPercentage: Math.min(95, Math.round((score / 9) * 100)),
      })),
      aiInsight,
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;