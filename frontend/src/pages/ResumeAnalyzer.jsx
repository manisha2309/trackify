import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker from node_modules (Vite resolves this correctly)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

/* ─── helpers ──────────────────────────────────────── */
const SECTION_KEYWORDS = {
  'Contact Information': /\b(email|phone|address|linkedin|github|portfolio|website|mobile|tel)\b/i,
  'Professional Summary': /\b(summary|objective|profile|about\s*me|career\s*objective|professional\s*summary)\b/i,
  'Work Experience': /\b(experience|employment|work\s*history|professional\s*experience|internship)\b/i,
  'Education': /\b(education|academic|qualification|university|college|degree|bachelor|master|b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|b\.?com|m\.?com|b\.?a|m\.?a|bca|mca)\b/i,
  'Skills': /\b(skills|technical\s*skills|competencies|technologies|tools|proficiency)\b/i,
  'Projects': /\b(project|personal\s*project|academic\s*project|capstone)\b/i,
  'Certifications': /\b(certif|certification|licensed|credential|course|training)\b/i,
  'Achievements': /\b(achievement|award|honor|recognition|accomplishment)\b/i,
};

const POWER_VERBS = [
  'achieved','managed','developed','led','created','designed','implemented',
  'improved','increased','reduced','launched','built','delivered','established',
  'generated','negotiated','organized','resolved','streamlined','transformed',
  'analyzed','collaborated','coordinated','executed','facilitated','mentored',
  'optimized','pioneered','spearheaded','supervised',
];

const COMMON_SKILLS = [
  'javascript','typescript','python','java','c\\+\\+','c#','react','angular','vue',
  'node','express','django','flask','spring','sql','nosql','mongodb','postgresql',
  'mysql','redis','docker','kubernetes','aws','azure','gcp','git','linux',
  'html','css','sass','tailwind','rest','graphql','api','agile','scrum',
  'figma','photoshop','excel','power\\s*bi','tableau','machine\\s*learning',
  'deep\\s*learning','data\\s*science','tensorflow','pytorch',
];

function analyzeResume(text) {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lines = text.split('\n').filter(l => l.trim());

  // ── Sections found / missing ──
  const foundSections = [];
  const missingSections = [];
  for (const [name, regex] of Object.entries(SECTION_KEYWORDS)) {
    if (regex.test(text)) foundSections.push(name);
    else missingSections.push(name);
  }

  // ── Contact info ──
  const hasEmail = /[\w.-]+@[\w.-]+\.\w{2,}/.test(text);
  const hasPhone = /(\+?\d[\d\s\-()]{7,}\d)/.test(text);
  const hasLinkedIn = /linkedin/i.test(text);
  const hasGitHub = /github/i.test(text);

  // ── Skills detected ──
  const detectedSkills = COMMON_SKILLS
    .filter(s => new RegExp(`\\b${s}\\b`, 'i').test(text))
    .map(s => s.replace(/\\\+/g, '+').replace(/\\s\*/g, ' '));

  // ── Power verbs ──
  const usedVerbs = POWER_VERBS.filter(v => new RegExp(`\\b${v}`, 'i').test(text));

  // ── Quantified achievements (numbers near %, $, etc.) ──
  const quantified = (text.match(/\d+\s*[%$]/g) || []).length
    + (text.match(/\b\d{2,}\b/g) || []).filter(n => parseInt(n) > 1 && parseInt(n) < 100000).length;

  // ── Scoring ──
  let overallScore = 30; // baseline
  overallScore += Math.min(foundSections.length * 6, 30);
  overallScore += hasEmail ? 5 : 0;
  overallScore += hasPhone ? 5 : 0;
  overallScore += hasLinkedIn ? 3 : 0;
  overallScore += detectedSkills.length >= 5 ? 10 : detectedSkills.length >= 2 ? 5 : 0;
  overallScore += usedVerbs.length >= 5 ? 7 : usedVerbs.length >= 2 ? 3 : 0;
  overallScore += quantified >= 3 ? 5 : quantified >= 1 ? 2 : 0;
  overallScore += wordCount >= 200 && wordCount <= 800 ? 5 : 0;
  overallScore = Math.min(overallScore, 100);

  let atsScore = 25;
  atsScore += foundSections.length * 5;
  atsScore += detectedSkills.length >= 5 ? 15 : detectedSkills.length * 3;
  atsScore += hasEmail ? 5 : 0;
  atsScore += hasPhone ? 5 : 0;
  atsScore += wordCount >= 200 ? 5 : 0;
  atsScore += usedVerbs.length >= 3 ? 5 : 0;
  atsScore = Math.min(atsScore, 100);

  // ── Strengths ──
  const strengths = [];
  if (foundSections.length >= 5) strengths.push('Well-structured resume with most key sections present');
  if (detectedSkills.length >= 5) strengths.push(`Strong technical skills — ${detectedSkills.length} relevant skills detected`);
  if (usedVerbs.length >= 4) strengths.push('Good use of action/power verbs to describe experience');
  if (hasEmail && hasPhone) strengths.push('Contact information is clearly provided');
  if (hasLinkedIn || hasGitHub) strengths.push('Includes professional profile links (LinkedIn/GitHub)');
  if (quantified >= 2) strengths.push('Uses quantified achievements to demonstrate impact');
  if (wordCount >= 200 && wordCount <= 800) strengths.push('Resume length is appropriate (concise and focused)');
  if (strengths.length === 0) strengths.push('Resume uploaded successfully — see improvement suggestions below');

  // ── Mistakes ──
  const mistakes = [];
  if (!hasEmail) mistakes.push({ issue: 'Missing Email Address', detail: 'No email address was detected in your resume.', fix: 'Add a professional email address at the top of your resume (e.g., name@gmail.com).' });
  if (!hasPhone) mistakes.push({ issue: 'Missing Phone Number', detail: 'No phone number was detected.', fix: 'Include your phone number in the contact section.' });
  if (wordCount < 150) mistakes.push({ issue: 'Resume Too Short', detail: `Only ${wordCount} words detected. This may seem incomplete.`, fix: 'Expand each section with more detail — aim for 300-700 words for a single page resume.' });
  if (wordCount > 1000) mistakes.push({ issue: 'Resume Too Long', detail: `${wordCount} words detected. This is likely more than 2 pages.`, fix: 'Trim to the most relevant experience. For entry-level, aim for 1 page (300-600 words).' });
  if (usedVerbs.length < 3) mistakes.push({ issue: 'Weak Action Verbs', detail: 'Your resume lacks strong action verbs to describe your experience.', fix: 'Start bullet points with verbs like "Developed", "Managed", "Implemented", "Increased", "Designed".' });
  if (detectedSkills.length < 3) mistakes.push({ issue: 'Few Technical Skills Listed', detail: `Only ${detectedSkills.length} common technical skills detected.`, fix: 'Add a dedicated "Skills" section listing your technical stack, tools, and technologies.' });
  if (quantified < 2) mistakes.push({ issue: 'Lacks Quantified Results', detail: 'Your resume has few or no measurable achievements.', fix: 'Add numbers: "Improved load time by 40%", "Managed a team of 5", "Increased sales by $10K".' });

  // ── ATS Tips ──
  const atsTips = [];
  atsTips.push('Use standard section headings like "Experience", "Education", "Skills"');
  atsTips.push('Avoid tables, images, and complex formatting — ATS cannot read them');
  if (!hasEmail) atsTips.push('Include a clear email address — ATS uses it as a primary identifier');
  if (detectedSkills.length < 5) atsTips.push('Add more relevant keywords from the job description to your skills section');
  atsTips.push('Save your resume as a simple PDF to preserve formatting for ATS');
  if (missingSections.length > 0) atsTips.push(`Add missing sections: ${missingSections.slice(0, 3).join(', ')}`);

  // ── Summary ──
  const summary = overallScore >= 70
    ? `Good resume overall! It covers key areas well and scores ${overallScore}/100. Focus on the suggestions below to make it even stronger.`
    : overallScore >= 40
    ? `Your resume has a decent foundation scoring ${overallScore}/100, but needs improvement in several areas. Address the issues below to increase your chances.`
    : `Your resume needs significant improvements (score: ${overallScore}/100). Focus on adding missing sections and strengthening your content with specific achievements.`;

  return {
    overallScore,
    atsScore,
    summary,
    strengths,
    mistakes,
    missingSection: missingSections,
    atsTips,
    detectedSkills,
    wordCount,
    foundSections,
  };
}

/* ─── component ────────────────────────────────────── */
export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0] || null;
    setFile(selected);
    setResult(null);
    setError(null);
  };

  const extractTextFromPDF = useCallback(async (pdfFile) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let resumeText = '';
      if (file.name.toLowerCase().endsWith('.pdf')) {
        resumeText = await extractTextFromPDF(file);
      } else {
        resumeText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      }

      if (!resumeText || resumeText.trim().length < 20) {
        setError('Could not extract text from this file. Please try a text-based PDF or TXT file.');
        return;
      }

      const analysis = analyzeResume(resumeText);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze resume. Please make sure it is a valid PDF or text file.');
    } finally {
      setLoading(false);
    }
  };

  const ScoreRing = ({ score, label, color }) => (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 ${color}`}>
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-xs text-gray-400 absolute bottom-1">/100</span>
      </div>
      <span className="text-sm text-gray-400 text-center font-medium">{label}</span>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0d1117] text-white p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-cyan-400">📄 Resume Analyzer</h1>
        <p className="text-center text-gray-400 mb-8">Get instant feedback on your resume — 100% private, runs in your browser</p>

        {/* Upload Area */}
        <div className="bg-[#161b22] border-2 border-dashed border-cyan-500/40 rounded-2xl p-10 flex flex-col items-center gap-4 mb-6 hover:border-cyan-400/70 transition-colors">
          <div className="text-6xl">📋</div>
          <label className="cursor-pointer">
            <span className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-full transition inline-block">
              Choose File
            </span>
            <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="hidden" />
          </label>
          {file && <p className="text-cyan-300 text-sm">✅ {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
          {!file && <p className="text-gray-500 text-sm">Supports PDF and TXT files</p>}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-lg rounded-xl transition mb-8"
        >
          {loading ? '🔍 Analyzing your resume...' : '⚡ Analyze Resume'}
        </button>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Reading your resume and generating feedback...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-500 rounded-xl p-4 text-red-300 text-center">{error}</div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Score Cards */}
            <div className="bg-[#161b22] rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-300">📊 Overall Scores</h2>
              <div className="flex justify-around mb-4">
                <ScoreRing score={result.overallScore} label="Resume Score" color={result.overallScore >= 70 ? 'border-green-400' : result.overallScore >= 40 ? 'border-yellow-400' : 'border-red-400'} />
                <ScoreRing score={result.atsScore} label="ATS Score" color={result.atsScore >= 70 ? 'border-green-400' : result.atsScore >= 40 ? 'border-yellow-400' : 'border-red-400'} />
              </div>
              <p className="text-gray-300 text-sm text-center">{result.summary}</p>
              <p className="text-gray-500 text-xs text-center mt-2">📝 {result.wordCount} words • {result.foundSections.length}/{Object.keys(SECTION_KEYWORDS).length} sections detected</p>
            </div>

            {/* Detected Skills */}
            {result.detectedSkills.length > 0 && (
              <div className="bg-[#161b22] rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 text-blue-400">🛠️ Detected Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {result.detectedSkills.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-900/40 border border-blue-500/40 rounded-full text-blue-300 text-sm capitalize">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            <div className="bg-[#161b22] rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3 text-green-400">✅ Strengths</h2>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-gray-300 text-sm"><span className="text-green-400 flex-shrink-0">•</span>{s}</li>
                ))}
              </ul>
            </div>

            {/* Mistakes */}
            {result.mistakes.length > 0 && (
              <div className="bg-[#161b22] rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 text-red-400">⚠️ Issues to Fix</h2>
                <div className="space-y-4">
                  {result.mistakes.map((m, i) => (
                    <div key={i} className="border border-red-500/30 rounded-xl p-4 bg-red-900/10">
                      <p className="font-semibold text-red-300">{m.issue}</p>
                      <p className="text-gray-400 text-sm mt-1">{m.detail}</p>
                      <p className="text-cyan-400 text-sm mt-2">💡 Fix: {m.fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Sections */}
            {result.missingSection?.length > 0 && (
              <div className="bg-[#161b22] rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 text-yellow-400">📋 Missing Sections</h2>
                <div className="flex flex-wrap gap-2">
                  {result.missingSection.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-yellow-900/40 border border-yellow-500/40 rounded-full text-yellow-300 text-sm">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ATS Tips */}
            <div className="bg-[#161b22] rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3 text-cyan-400">🤖 ATS Optimization Tips</h2>
              <ul className="space-y-2">
                {result.atsTips.map((t, i) => (
                  <li key={i} className="flex gap-2 text-gray-300 text-sm"><span className="text-cyan-400 flex-shrink-0">→</span>{t}</li>
                ))}
              </ul>
            </div>

            {/* Sections Found */}
            <div className="bg-[#161b22] rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3 text-purple-400">📑 Sections Found</h2>
              <div className="flex flex-wrap gap-2">
                {result.foundSections.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-900/40 border border-purple-500/40 rounded-full text-purple-300 text-sm">{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}