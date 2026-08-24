const router = require('express').Router();
const { GoogleGenAI } = require('@google/genai');

// In-memory store (replace with MongoDB in production)
const roadmaps = new Map();

// Curated detailed roadmaps by career domain & level
const CAREER_TEMPLATES = {
  'software developer': {
    title: 'Software Developer Career Roadmap',
    description: 'Comprehensive pathway to master computer science fundamentals, full-stack software development, and system design.',
    estimatedMonths: 12,
    phases: [
      {
        phase: 1,
        title: 'Core Programming & Data Structures',
        duration: '3 months',
        steps: [
          { title: 'Programming Fundamentals', description: 'Master language syntax, OOP, functions, memory models (Python/Java/C++ or JavaScript).', resources: ['freeCodeCamp', 'CS50 on edX', 'The Odin Project'], completed: false },
          { title: 'Data Structures & Algorithms', description: 'Arrays, Strings, Linked Lists, Trees, Graphs, Sorting, Dynamic Programming.', resources: ['LeetCode', 'NeetCode 150', 'Striver SDE Sheet'], completed: false },
          { title: 'Version Control & Git', description: 'Git workflow, branches, pull requests, collaborative development on GitHub.', resources: ['GitHub Skills', 'Pro Git Book'], completed: false }
        ]
      },
      {
        phase: 2,
        title: 'Web & Application Development',
        duration: '4 months',
        steps: [
          { title: 'Modern Frontend (React/Next.js)', description: 'HTML5, CSS3, JavaScript ES6+, React Hooks, State Management, Tailwind CSS.', resources: ['React Docs', 'Scrimba', 'Frontend Masters'], completed: false },
          { title: 'Backend APIs & Databases', description: 'Node.js/Express or Python FastApi, RESTful APIs, PostgreSQL & MongoDB.', resources: ['MDN Web Docs', 'MongoDB University', 'Prisma Docs'], completed: false },
          { title: 'Authentication & Security', description: 'JWT, OAuth2, session management, secure headers, CORS, SQL injection prevention.', resources: ['OWASP Top 10', 'Auth0 Guides'], completed: false }
        ]
      },
      {
        phase: 3,
        title: 'System Design & DevOps Basics',
        duration: '3 months',
        steps: [
          { title: 'Database Design & Optimization', description: 'Schema normalization, indexing, query optimization, caching with Redis.', resources: ['Redis University', 'Use The Index, Luke!'], completed: false },
          { title: 'Containerization & Cloud', description: 'Dockerizing apps, CI/CD pipelines with GitHub Actions, deploying on AWS/Vercel.', resources: ['Docker Docs', 'AWS Skill Builder'], completed: false },
          { title: 'System Architecture Fundamentals', description: 'Load balancers, microservices vs monoliths, rate limiting, message queues (Kafka/RabbitMQ).', resources: ['System Design Primer (GitHub)', 'ByteByteGo'], completed: false }
        ]
      },
      {
        phase: 4,
        title: 'Portfolio & Interview Preparation',
        duration: '2 months',
        steps: [
          { title: 'Capstone Full-Stack Projects', description: 'Build 2 production-ready applications with auth, payments/APIs, and clean documentation.', resources: ['GitHub Showcase', 'Vercel / Render'], completed: false },
          { title: 'Technical & Behavioral Interview Prep', description: 'Mock interviews, algorithmic problem solving under pressure, STAR method for leadership questions.', resources: ['Pramp', 'Interviewing.io', 'Blind 75'], completed: false }
        ]
      }
    ]
  },
  'data scientist': {
    title: 'Data Science & Machine Learning Roadmap',
    description: 'A complete guide to mastering statistical modeling, Python data stack, machine learning, and AI applications.',
    estimatedMonths: 10,
    phases: [
      {
        phase: 1,
        title: 'Math Foundations & Python Data Stack',
        duration: '3 months',
        steps: [
          { title: 'Linear Algebra & Calculus', description: 'Vectors, matrices, eigenvalues, gradients, optimization for machine learning.', resources: ['3Blue1Brown (Essence of Linear Algebra)', 'Khan Academy'], completed: false },
          { title: 'Python for Data Analysis', description: 'NumPy arrays, Pandas DataFrames, data cleaning, aggregation, exploratory data analysis.', resources: ['Kaggle Learn', 'Python for Data Analysis Book'], completed: false },
          { title: 'Data Visualization & Storytelling', description: 'Matplotlib, Seaborn, Plotly, dashboard creation, communicating insights.', resources: ['Kaggle Datasets', 'Storytelling with Data'], completed: false }
        ]
      },
      {
        phase: 2,
        title: 'Classical Machine Learning',
        duration: '3 months',
        steps: [
          { title: 'Supervised Learning', description: 'Linear/Logistic regression, Decision Trees, Random Forests, XGBoost, cross-validation.', resources: ['Scikit-Learn Docs', 'Coursera ML Specialization by Andrew Ng'], completed: false },
          { title: 'Unsupervised Learning', description: 'K-Means clustering, PCA, t-SNE, anomaly detection, feature engineering.', resources: ['StatQuest with Josh Starmer'], completed: false },
          { title: 'Model Evaluation & Metrics', description: 'Precision, Recall, F1-Score, ROC-AUC, bias-variance tradeoff, hyperparameter tuning.', resources: ['Kaggle Competitions'], completed: false }
        ]
      },
      {
        phase: 3,
        title: 'Deep Learning & Modern AI',
        duration: '3 months',
        steps: [
          { title: 'Neural Networks & PyTorch', description: 'Feedforward networks, backpropagation, CNNs for computer vision, RNNs/Transformers.', resources: ['Fast.ai Practical Deep Learning', 'PyTorch Tutorials'], completed: false },
          { title: 'NLP & Large Language Models', description: 'Tokenization, embeddings, Hugging Face Transformers, fine-tuning and prompt engineering.', resources: ['Hugging Face NLP Course', 'DeepLearning.AI Short Courses'], completed: false }
        ]
      },
      {
        phase: 4,
        title: 'MLOps & Capstone Portfolio',
        duration: '1 month',
        steps: [
          { title: 'Model Deployment & APIs', description: 'FastAPI, Docker, MLflow for experiment tracking, Streamlit interactive apps.', resources: ['Full Stack Deep Learning', 'Hugging Face Spaces'], completed: false },
          { title: 'Real-world Portfolio Case Studies', description: 'Publish end-to-end data products with clean GitHub repositories and technical write-ups.', resources: ['Medium / Towards Data Science', 'Kaggle Notebooks'], completed: false }
        ]
      }
    ]
  },
  'ui/ux designer': {
    title: 'UI/UX Design Career Roadmap',
    description: 'Master user research, wireframing, interactive prototyping in Figma, and design systems.',
    estimatedMonths: 8,
    phases: [
      {
        phase: 1,
        title: 'UX Research & Design Thinking',
        duration: '2 months',
        steps: [
          { title: 'User Research & Personas', description: 'Conducting user interviews, surveys, empathy mapping, defining problem statements.', resources: ['Nielsen Norman Group', 'Interaction Design Foundation'], completed: false },
          { title: 'Information Architecture & User Flows', description: 'Site mapping, task flows, navigation models, card sorting.', resources: ['UX Collective on Medium'], completed: false }
        ]
      },
      {
        phase: 2,
        title: 'UI Design & Figma Mastery',
        duration: '3 months',
        steps: [
          { title: 'Visual Design Fundamentals', description: 'Color theory, typography hierarchy, grid systems, spacing, visual balance.', resources: ['Refactoring UI Book', 'Google Material Design Guidelines'], completed: false },
          { title: 'Advanced Figma Techniques', description: 'Auto-layout, responsive components, variants, variables, interactive prototyping.', resources: ['Figma Community Tutorials', 'Mizko YouTube'], completed: false },
          { title: 'Design Systems', description: 'Creating scalable design tokens, component libraries, accessibility compliance (WCAG).', resources: ['Design Systems Repo', 'Apple Human Interface Guidelines'], completed: false }
        ]
      },
      {
        phase: 3,
        title: 'Portfolio & Client Projects',
        duration: '3 months',
        steps: [
          { title: 'Case Study Development', description: 'Create 3 detailed case studies illustrating problem, research, iterations, and final prototypes.', resources: ['Behance', 'Dribbble', 'Bestfolios'], completed: false },
          { title: 'Design Handoff & Frontend Basics', description: 'Inspecting CSS tokens, dev mode in Figma, collaborating effectively with engineers.', resources: ['Figma Dev Mode Docs'], completed: false }
        ]
      }
    ]
  },
  'product manager': {
    title: 'Product Management Roadmap',
    description: 'Learn product discovery, agile execution, metric frameworks, user psychology, and market strategy.',
    estimatedMonths: 8,
    phases: [
      {
        phase: 1,
        title: 'Product Strategy & Market Discovery',
        duration: '2 months',
        steps: [
          { title: 'Product Thinking & Frameworks', description: 'Jobs-to-be-done (JTBD), Product-Market Fit, SWOT analysis, competitive benchmarking.', resources: ['Inspired by Marty Cagan', 'Lenny’s Newsletter'], completed: false },
          { title: 'Customer Discovery & Validation', description: 'User interviews, MVP definition, hypothesis testing, feature prioritization (RICE, Kano).', resources: ['The Lean Startup', 'Product School'], completed: false }
        ]
      },
      {
        phase: 2,
        title: 'Execution, Agile & Analytics',
        duration: '3 months',
        steps: [
          { title: 'PRDs & Agile Scrum', description: 'Writing Product Requirement Documents (PRDs), user stories, sprint planning, Jira.', resources: ['Atlassian Agile Coach'], completed: false },
          { title: 'Product Metrics & Analytics', description: 'North Star metric, AARRR pirate metrics, retention curves, Mixpanel, Amplitude, SQL.', resources: ['Amplitude Playbook', 'Mode Analytics SQL Tutorial'], completed: false }
        ]
      },
      {
        phase: 3,
        title: 'Go-To-Market & Leadership',
        duration: '3 months',
        steps: [
          { title: 'GTM & Growth Loops', description: 'Launch strategies, user onboarding optimization, product-led growth (PLG).', resources: ['Reforge Growth Series'], completed: false },
          { title: 'Case Study Portfolio & PM Interviews', description: 'Product sense questions, metrics dissection, execution teardowns, mock interviews.', resources: ['Decode and Conquer Book', 'Exponent PM Prep'], completed: false }
        ]
      }
    ]
  }
};

function generateFallbackRoadmap(career, currentLevel) {
  const normalized = career.toLowerCase().trim();
  for (const [key, template] of Object.entries(CAREER_TEMPLATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      const copy = JSON.parse(JSON.stringify(template));
      copy.title = `${career} Career Roadmap (${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)})`;
      return copy;
    }
  }

  // Dynamic customized roadmap for any custom career
  return {
    title: `${career} Roadmap (${currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)})`,
    description: `A tailored step-by-step pathway to build core expertise, hands-on projects, and career readiness for ${career}.`,
    estimatedMonths: currentLevel === 'advanced' ? 6 : currentLevel === 'intermediate' ? 9 : 12,
    phases: [
      {
        phase: 1,
        title: 'Foundational Knowledge & Core Principles',
        duration: currentLevel === 'advanced' ? '1 month' : '3 months',
        steps: [
          { title: `${career} Core Fundamentals`, description: `Master the essential principles, standard workflows, and baseline terminology required in ${career}.`, resources: ['Coursera', 'edX', 'YouTube Tutorials'], completed: false },
          { title: 'Industry Tools & Environment Setup', description: 'Configure modern industry software, productivity tools, and essential development environments.', resources: ['Official Documentation', 'GitHub'], completed: false },
          { title: 'First Hands-On Practice', description: 'Complete practical guided exercises and beginner-friendly problem sets.', resources: ['Guided Tutorials', 'Community Forums'], completed: false }
        ]
      },
      {
        phase: 2,
        title: 'Intermediate Applied Skills & Practical Projects',
        duration: currentLevel === 'advanced' ? '2 months' : '4 months',
        steps: [
          { title: 'Advanced Methodologies & Best Practices', description: `Explore professional standards, optimization techniques, and efficient workflows for ${career}.`, resources: ['Specialized Masterclasses', 'Industry Blogs'], completed: false },
          { title: 'Real-World Project Implementation', description: 'Build 2 comprehensive practical projects demonstrating end-to-end capabilities.', resources: ['GitHub Showcase', 'Project Blueprints'], completed: false },
          { title: 'Collaboration & Version Control', description: 'Learn collaborative workflow practices, code/design reviews, and agile milestones.', resources: ['Agile Guides', 'Open Source Communities'], completed: false }
        ]
      },
      {
        phase: 3,
        title: 'Portfolio, Networking & Industry Readiness',
        duration: currentLevel === 'advanced' ? '2 months' : '3 months',
        steps: [
          { title: 'Professional Portfolio & Case Studies', description: 'Curate a polished portfolio showcasing your best work, methodology, and quantifiable results.', resources: ['Portfolio Website', 'LinkedIn Showcase'], completed: false },
          { title: 'Interview & Assessment Preparation', description: `Prepare for technical evaluations, portfolio reviews, domain-specific assessments, and mock interviews for ${career}.`, resources: ['Mock Interviews', 'Domain Question Banks'], completed: false },
          { title: 'Job Applications & Networking', description: 'Target relevant companies, participate in developer/designer communities, and connect with industry mentors.', resources: ['LinkedIn', 'AngelList / Wellfound', 'Tech Meetups'], completed: false }
        ]
      }
    ]
  };
}

// POST /roadmaps/generate
router.post('/generate', async (req, res) => {
  try {
    const { career, currentLevel = 'beginner', userId } = req.body;
    if (!career) return res.status(400).json({ error: 'career is required' });

    let roadmapData = null;

    // Attempt generation with Gemini API if key is configured
    if (process.env.GEMINI_API_KEY && 
        process.env.GEMINI_API_KEY !== 'your_gemini_key_here' && 
        !process.env.GEMINI_API_KEY.includes('AIzaSyCVZdi7Roqv4m8v1yQKvrlv_aa_POHUL_g')) {
      try {
        const prompt = `Create a detailed learning roadmap for someone who wants to become a "${career}".
Current level: ${currentLevel}.
Target audience: Indian students and aspiring professionals.

Return ONLY a JSON object with this exact structure (no markdown, no backticks):
{
  "title": "${career} Roadmap",
  "description": "Brief inspiring description",
  "estimatedMonths": 12,
  "phases": [
    {
      "phase": 1,
      "title": "Phase title",
      "duration": "2 months",
      "steps": [
        { "title": "Step title", "description": "What to learn", "resources": ["Resource 1", "Resource 2"], "completed": false }
      ]
    }
  ]
}`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        if (response && response.text) {
          const cleanedText = response.text.replace(/```json|```/g, '').trim();
          roadmapData = JSON.parse(cleanedText);
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to curated generator:', geminiError.message);
        roadmapData = null;
      }
    }

    // If Gemini failed or is not configured, generate fallback roadmap
    if (!roadmapData || !roadmapData.phases || !Array.isArray(roadmapData.phases)) {
      roadmapData = generateFallbackRoadmap(career, currentLevel);
    }

    const id = `${userId || 'anon'}-${Date.now()}`;
    const roadmap = { id, career, userId, createdAt: new Date(), progress: 0, ...roadmapData };
    roadmaps.set(id, roadmap);

    res.status(201).json(roadmap);
  } catch (err) {
    console.error('Error generating roadmap:', err.response?.data || err.message);
    // Even in total catch block, return a valid roadmap
    const fallback = generateFallbackRoadmap(req.body?.career || 'Software Developer', req.body?.currentLevel || 'beginner');
    const id = `fallback-${Date.now()}`;
    const roadmap = { id, career: req.body?.career || 'Software Developer', createdAt: new Date(), progress: 0, ...fallback };
    res.status(201).json(roadmap);
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
  if (roadmap.phases && roadmap.phases[phaseIndex]?.steps?.[stepIndex]) {
    roadmap.phases[phaseIndex].steps[stepIndex].completed = completed;

    // Recalculate progress
    const allSteps = roadmap.phases.flatMap(p => p.steps || []);
    roadmap.progress = allSteps.length > 0 
      ? Math.round((allSteps.filter(s => s.completed).length / allSteps.length) * 100)
      : 0;

    roadmaps.set(req.params.id, roadmap);
  }
  res.json(roadmap);
});

module.exports = router;