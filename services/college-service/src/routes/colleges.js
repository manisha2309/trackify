// const router = require('express').Router();

// const COLLEGES = [
//   { id:1, name:'Indian Institute of Technology Delhi', city:'New Delhi', state:'Delhi', type:'Government', rating:4.8, established:1961, annualFee:250000, cutoff:'JEE Rank 1–500', courses:['Computer Science','Mechanical Engg.','Electrical Engg.','Civil Engg.','Chemical Engg.'], website:'https://iitd.ac.in' },
//   { id:2, name:'National Institute of Technology Trichy', city:'Tiruchirappalli', state:'Tamil Nadu', type:'Government', rating:4.7, established:1964, annualFee:175000, cutoff:'JEE Rank 800–1000', courses:['Computer Science','Electronics','Mechanical','Civil'], website:'https://nitt.edu' },
//   { id:3, name:'Birla Institute of Technology and Science', city:'Pilani', state:'Rajasthan', type:'Private', rating:4.6, established:1964, annualFee:450000, cutoff:'BITSAT 330+', courses:['Computer Science','Electronics','Mechanical','Chemical'], website:'https://bits-pilani.ac.in' },
//   { id:4, name:'Indian Institute of Technology Bombay', city:'Mumbai', state:'Maharashtra', type:'Government', rating:4.9, established:1958, annualFee:250000, cutoff:'JEE Rank 1–200', courses:['Computer Science','Aerospace','Mechanical','Electrical'], website:'https://iitb.ac.in' },
//   { id:5, name:'Vellore Institute of Technology', city:'Vellore', state:'Tamil Nadu', type:'Private', rating:4.3, established:1984, annualFee:195000, cutoff:'VITEEE 80+ percentile', courses:['Computer Science','IT','Electronics','Mechanical'], website:'https://vit.ac.in' },
//   { id:6, name:'Delhi Technological University', city:'New Delhi', state:'Delhi', type:'Government', rating:4.2, established:1941, annualFee:90000, cutoff:'JEE Rank 3000–5000', courses:['Computer Science','Electronics','Mechanical','Civil'], website:'https://dtu.ac.in' },
// ];

// // GET /colleges?search=&type=&state=&page=1&limit=10
// router.get('/', (req, res) => {
//   let results = [...COLLEGES];
//   const { search, type, state, page = 1, limit = 10 } = req.query;

//   if (search) results = results.filter(c =>
//     c.name.toLowerCase().includes(search.toLowerCase()) ||
//     c.city.toLowerCase().includes(search.toLowerCase())
//   );
//   if (type)  results = results.filter(c => c.type === type);
//   if (state) results = results.filter(c => c.state === state);

//   const total = results.length;
//   const start = (page - 1) * limit;
//   results = results.slice(start, start + parseInt(limit));

//   res.json({ colleges: results, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
// });

// router.get('/:id', (req, res) => {
//   const college = COLLEGES.find(c => c.id === parseInt(req.params.id));
//   if (!college) return res.status(404).json({ error: 'College not found' });
//   res.json(college);
// });

// module.exports = router;

const router = require('express').Router();
const axios  = require('axios');

const SERP_KEY = process.env.SERPAPI_KEY;

// Helper: fetch from Hipolabs
async function searchHipolabs(query, country) {
  const params = new URLSearchParams({ name: query });
  if (country) params.append('country', country);
  const { data } = await axios.get(`http://universities.hipolabs.com/search?${params}`);
  return data.slice(0, 20);
}

// Helper: fetch rich details from SerpAPI
async function enrichWithSerp(collegeName) {
  if (!SERP_KEY) return null;
  try {
    const { data } = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google',
        q: `${collegeName} college fees ranking courses admission`,
        api_key: SERP_KEY,
        num: 3,
      }
    });
    const snippet = data.organic_results?.[0]?.snippet || '';
    const knowledgeGraph = data.knowledge_graph || {};
    return { snippet, knowledgeGraph };
  } catch { return null; }
}

// GET /colleges?search=&country=&page=1&limit=12
router.get('/', async (req, res) => {
  try {
    const { search = 'engineering', country, page = 1, limit = 12 } = req.query;

    const hipoResults = await searchHipolabs(search, country);

    const colleges = hipoResults.map((c, i) => ({
      id: i + 1,
      name: c.name,
      country: c.country,
      state: c['state-province'] || '',
      type: c.name.match(/IIT|NIT|AIIMS|Government|National|Central/i) ? 'Government' : 'Private',
      website: c.web_pages?.[0] || '#',
      domains: c.domains || [],
      alpha_two_code: c.alpha_two_code,
    }));

    const total = colleges.length;
    const start = (page - 1) * limit;
    const paginated = colleges.slice(start, start + parseInt(limit));

    res.json({
      colleges: paginated,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /colleges/:name/details  — enriched SerpAPI details for one college
router.get('/:name/details', async (req, res) => {
  try {
    const details = await enrichWithSerp(decodeURIComponent(req.params.name));
    if (!details) return res.json({ snippet: '', knowledgeGraph: {} });
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;