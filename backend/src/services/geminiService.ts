import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY!
);

export async function analyzeResumeWithAI(
    resumeText: string,
    targetRole: string
) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
    });

    const prompt = `
You are an expert ATS Resume Analyzer.

Target Role:
${targetRole}

Resume:
${resumeText}

Evaluate the resume based on:

- Skills match
- Experience relevance
- Education
- Projects
- ATS friendliness

Score Guidelines:
90-100 = Excellent match
70-89 = Strong match
50-69 = Moderate match
30-49 = Weak match
0-29 = Poor match

Return ONLY valid JSON in this exact format:

{
  "readiness": 85,
  "strengths": ["strength 1", "strength 2"],
  "missingSkills": ["skill 1", "skill 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    return JSON.parse(
        text.replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()
    );
}