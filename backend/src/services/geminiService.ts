import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeResumeWithAI(resumeText: string, targetRole: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert ATS Resume Analyzer.

Target Role: ${targetRole}

Resume:
${resumeText}

Evaluate the resume and return THREE separate readiness scores.
Each score MUST reflect different criteria and MUST NOT be the same value.

Score Guidelines:
90-100 = Excellent  |  70-89 = Strong  |  50-69 = Moderate  |  30-49 = Weak  |  0-29 = Poor

SCORE DEFINITIONS:

careerReadiness (OVERALL score):
  Holistic long-term career fit. Consider everything together.

internshipReadiness (ENTRY-LEVEL emphasis):
  Weight HEAVILY: personal/academic projects, technical skills listed, education relevance, ATS keyword density, learning trajectory.
  Weight LIGHTLY: professional work experience, leadership.
  A student with strong projects but no job history should score HIGH here.

jobReadiness (PROFESSIONAL emphasis):
  Weight HEAVILY: paid work experience (years + relevance), leadership/ownership, measurable achievements with numbers, communication clarity, domain depth.
  Weight LIGHTLY: academic projects without production context, education alone.
  A professional with job history but few projects should score HIGH here.

RULES:
- All three scores MUST differ from each other by at least 5 points.
- Base scores purely on actual resume content. Do NOT invent or assume.
- Return ONLY raw JSON. No markdown. No backticks. No explanation.

Return exactly this JSON structure:
{
  "careerReadiness": 75,
  "internshipReadiness": 82,
  "jobReadiness": 61,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "missingSkills": ["skill 1", "skill 2", "skill 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = JSON.parse(
        text.replace(/```json/g, "").replace(/```/g, "").trim()
    );

    // Keep legacy `readiness` field so nothing else breaks
    parsed.readiness = parsed.careerReadiness;
    parsed.alignmentScore = parsed.careerReadiness;

    console.log("=== GEMINI THREE-SCORE RESULT ===");
    console.log("careerReadiness:", parsed.careerReadiness);
    console.log("internshipReadiness:", parsed.internshipReadiness);
    console.log("jobReadiness:", parsed.jobReadiness);
    console.log("=================================");

    return parsed;
}

// =============================================================================
// CAREER COPILOT MENTOR
// Generates a personalized mentor reply for the AI Mentor page. Unlike a
// generic chatbot, every call is grounded in the user's live agent memory
// (target role, readiness scores, strengths/gaps, GitHub, resume, active
// missions) so two different users — or the same user before/after an
// analysis — never get the same answer.
//
// The model is instructed to format its reply using a small, fixed markdown
// vocabulary ("## Heading", "- bullet", "1. numbered", "> Tip: ...",
// "**bold**") because the frontend (AIMentor.tsx) parses exactly that
// vocabulary into structured sections, bullet lists, numbered plans, and
// highlighted tips. Free-form prose without that structure will still render,
// but will look like a flat paragraph instead of a mentor-style breakdown.
// =============================================================================

export interface MentorRequestContext {
  targetRole: string;
  readiness: number | null;
  careerReadiness: number | null;
  internshipReadiness: number | null;
  jobReadiness: number | null;
  strengths: string[];
  gaps: string[];
  currentSkills: string[];
  futureSkills: string[];
  insights: string[];
  githubUsername: string | null;
  linkedinUrl: string | null;
  hasResume: boolean;
  isTwinGenerated: boolean;
  activeMissions: { text: string; skill: string; completed: boolean }[];
  careerTimelineMonths: number;
}

const list = (items: string[] | undefined, fallback: string) =>
  items && items.length > 0 ? items.join(', ') : fallback;

function buildMentorSystemPrompt(context: MentorRequestContext): string {
  const activeMissionLines = context.activeMissions.length > 0
    ? context.activeMissions
        .map(m => `  - [${m.completed ? 'done' : 'pending'}] ${m.text} (skill: ${m.skill})`)
        .join('\n')
    : '  - No active missions yet.';

  return `
You are the Career Copilot inside Nexora — a personalized AI career operating system, not a generic chatbot.

You are mentoring ONE specific user. You must use their real profile below in every answer. Never give a generic, one-size-fits-all response. If two questions are different, your structure and specifics must differ accordingly. Always tie your answer back to their target role, readiness scores, and skill gaps where relevant.

USER PROFILE
  Target role: ${context.targetRole}
  Career Twin generated: ${context.isTwinGenerated ? 'yes' : 'no'}
  Resume connected: ${context.hasResume ? 'yes' : 'no'}
  GitHub: ${context.githubUsername || 'not connected'}
  LinkedIn: ${context.linkedinUrl || 'not connected'}
  Career timeline goal: ${context.careerTimelineMonths} months

READINESS SCORES
  Overall career readiness: ${context.careerReadiness ?? context.readiness ?? 'unknown'}%
  Internship readiness: ${context.internshipReadiness ?? 'unknown'}%
  Job readiness: ${context.jobReadiness ?? 'unknown'}%

SKILLS
  Strengths: ${list(context.strengths, 'none recorded yet')}
  Current skills: ${list(context.currentSkills, 'none recorded yet')}
  Skill gaps (missing skills): ${list(context.gaps, 'none recorded yet')}
  Future/target skills: ${list(context.futureSkills, 'none recorded yet')}
  Prior insights: ${list(context.insights, 'none yet')}

ACTIVE WEEKLY MISSIONS
${activeMissionLines}

RESPONSE FORMAT RULES (follow exactly, this is parsed by the UI):
- Use "## " at the start of a line for each section heading (e.g. "## Why it matters", "## What you should learn", "## Next action").
- Use "- " at the start of a line for bullet points.
- Use "1. ", "2. ", etc. for ordered steps or plans.
- Use "> " at the start of a line for a single high-value tip or warning.
- Use "**text**" for inline emphasis on key terms.
- Do NOT use backticks, code fences, or raw markdown tables.
- Keep the whole answer focused and skimmable — prefer short sections over long paragraphs.
- Always ground the answer in this user's specific role, readiness numbers, strengths, and gaps. Reference the actual gap or skill names, not generic categories.
- If the user asks something unrelated to careers, answer briefly and steer back to how it connects to their goal of becoming a ${context.targetRole}.
`.trim();
}

export async function getMentorAdvice(prompt: string, context: MentorRequestContext): Promise<{ response: string }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = buildMentorSystemPrompt(context);

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: `USER QUESTION:\n${prompt}` }
  ]);

  const response = result.response.text().trim();

  return { response };
}