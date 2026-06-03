const router = require('express').Router();
const axios  = require('axios');
const { GoogleGenAI } = require('@google/genai');

// In-memory store (replace with MongoDB in production)
const roadmaps = new Map();

// POST /roadmaps/generate
router.post('/generate', async (req, res) => {
  try {
    const { career, currentLevel = 'beginner', userId } = req.body;
    if (!career) return res.status(400).json({ error: 'career is required' });

    const prompt = `Create a detailed learning roadmap for someone who wants to become a "${career}".
Current level: ${currentLevel}.
Target audience: Indian students.

Return ONLY a JSON object with this structure (no markdown):
{
  "title": "Career Roadmap title",
  "description": "Brief description",
  "estimatedMonths": 12,
  "phases": [
    {
      "phase": 1,
      "title": "Phase title",
      "duration": "2 months",
      "steps": [
        { "title": "Step title", "description": "What to learn", "resources": ["Resource 1"], "completed": false }
      ]
    }
  ]
}`;

    let roadmapData;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_key_here') {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      roadmapData = JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } else {
      // Fallback static roadmap
      roadmapData = {
        title: `${career} Roadmap`,
        description: `Step-by-step path to become a ${career}`,
        estimatedMonths: 12,
        phases: [
          { phase: 1, title: 'Foundations', duration: '3 months', steps: [
            { title: 'Core Concepts', description: 'Learn the fundamentals', resources: ['YouTube', 'Coursera'], completed: false },
            { title: 'Practice Projects', description: 'Build small projects', resources: ['GitHub'], completed: false },
          ]},
          { phase: 2, title: 'Intermediate', duration: '4 months', steps: [
            { title: 'Advanced Topics', description: 'Deep dive into advanced areas', resources: ['Udemy', 'Docs'], completed: false },
          ]},
          { phase: 3, title: 'Job Ready', duration: '5 months', steps: [
            { title: 'Portfolio', description: 'Build impressive portfolio', resources: ['GitHub Pages'], completed: false },
            { title: 'Interviews', description: 'Interview preparation', resources: ['LeetCode', 'Pramp'], completed: false },
          ]},
        ]
      };
    }

    const id = `${userId || 'anon'}-${Date.now()}`;
    const roadmap = { id, career, userId, createdAt: new Date(), progress: 0, ...roadmapData };
    roadmaps.set(id, roadmap);

    res.status(201).json(roadmap);
  } catch (err) {
    console.error('Error generating roadmap:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// GET /roadmaps/:id
router.get('/:id', (req, res) => {
  const roadmap = roadmaps.get(req.params.id);
  if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
  res.json(roadmap);
});

// GET /roadmaps/user/:userId
router.get('/user/:userId', (req, res) => {
  const userRoadmaps = [...roadmaps.values()].filter(r => r.userId === req.params.userId);
  res.json({ roadmaps: userRoadmaps });
});

// PATCH /roadmaps/:id/step  — mark a step complete
router.patch('/:id/step', (req, res) => {
  const roadmap = roadmaps.get(req.params.id);
  if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

  const { phaseIndex, stepIndex, completed } = req.body;
  roadmap.phases[phaseIndex].steps[stepIndex].completed = completed;

  // Recalculate progress
  const allSteps = roadmap.phases.flatMap(p => p.steps);
  roadmap.progress = Math.round((allSteps.filter(s => s.completed).length / allSteps.length) * 100);

  roadmaps.set(req.params.id, roadmap);
  res.json(roadmap);
});

module.exports = router;