const router = require('express').Router();

const CAREERS = [
  { id:'software-dev', title:'Software Developer', emoji:'💻', salaryRange:'₹4L–₹40L', growth:'22%', skills:['JavaScript','Python','DSA','System Design'], relatedCareers:['Data Scientist','DevOps Engineer','ML Engineer'] },
  { id:'ui-ux', title:'UI/UX Designer', emoji:'🎨', salaryRange:'₹3L–₹25L', growth:'15%', skills:['Figma','User Research','Prototyping','CSS'], relatedCareers:['Product Designer','Graphic Designer','Frontend Dev'] },
  { id:'data-scientist', title:'Data Scientist', emoji:'📊', salaryRange:'₹6L–₹45L', growth:'28%', skills:['Python','ML','Statistics','SQL'], relatedCareers:['Data Analyst','ML Engineer','BI Analyst'] },
  { id:'product-manager', title:'Product Manager', emoji:'📱', salaryRange:'₹8L–₹50L', growth:'18%', skills:['Roadmapping','Agile','Analytics','Leadership'], relatedCareers:['Business Analyst','Project Manager','Startup Founder'] },
  { id:'doctor', title:'Doctor / Medical', emoji:'🏥', salaryRange:'₹5L–₹30L', growth:'10%', skills:['MBBS','Clinical Skills','Research','Empathy'], relatedCareers:['Surgeon','Researcher','Healthcare Admin'] },
  { id:'business-analyst', title:'Business Analyst', emoji:'📈', salaryRange:'₹4L–₹20L', growth:'14%', skills:['Excel','SQL','Communication','Problem Solving'], relatedCareers:['Consultant','Product Manager','Finance Analyst'] },
];

router.get('/', (_, res) => res.json({ careers: CAREERS, total: CAREERS.length }));
router.get('/:id', (req, res) => {
  const career = CAREERS.find(c => c.id === req.params.id);
  if (!career) return res.status(404).json({ error: 'Career not found' });
  res.json(career);
});

module.exports = router;