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