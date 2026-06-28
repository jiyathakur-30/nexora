import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Opportunity {
    title: string;
    organization: string;
    category: string;
    location: string;
    deadline: string;
    mode: string;
    applyUrl: string;
    description: string;
    whyMatched: string;
    matchScore: number;
}

export interface OpportunityResult {
    internships: Opportunity[];
    hackathons: Opportunity[];
    opensource: Opportunity[];
    competitions: Opportunity[];
    mentorships: Opportunity[];
    fellowships: Opportunity[];
}

export interface OpportunityRequest {
    careerGoal: string;
    skills: string[];
    experience: string;
    resumeSummary: string;
    github?: string;
    linkedin?: string;
}

// ── In-memory cache (15-minute TTL) ──────────────────────────────────────────

interface CacheEntry {
    data: OpportunityResult;
    expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCacheKey(req: OpportunityRequest): string {
    // Key on careerGoal + sorted skills — stable across minor input noise
    const skillKey = [...req.skills].sort().join(",").toLowerCase();
    const goal = req.careerGoal.toLowerCase().trim();
    return `${goal}|${skillKey}`;
}

function getCached(key: string): OpportunityResult | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function setCache(key: string, data: OpportunityResult): void {
    cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ── Empty result shape ────────────────────────────────────────────────────────

function emptyResult(): OpportunityResult {
    return {
        internships: [],
        hackathons: [],
        opensource: [],
        competitions: [],
        mentorships: [],
        fellowships: [],
    };
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(req: OpportunityRequest): string {
    const today = new Date().toISOString().split("T")[0];
    return `
You are an AI career opportunity search engine.
Today's date is ${today}.
Search for currently OPEN opportunities on the internet.
Find opportunities relevant to this user.

Career Goal: ${req.careerGoal}
Skills: ${req.skills.join(", ")}
Experience: ${req.experience}
Resume: ${req.resumeSummary}
GitHub: ${req.github || "not provided"}
LinkedIn: ${req.linkedin || "not provided"}

Search categories:
- Internships (paid corporate positions, summer internships, entry-level roles)
- Hackathons (weekend sprints, MLH events, online hackathons)
- Open Source Programs (GSoC, Outreachy, MLH Fellowship, LFX Mentorship, GNOME internships)
- Technical Competitions (Kaggle, competitive programming, algorithm contests)
- Fellowships (research fellowships, startup fellowships, developer fellowship programs)
- Mentorship Programs (ADPList, LinkedIn mentorship, community mentorships)

Rules:
- Only include opportunities that are currently open or have upcoming deadlines after ${today}.
- Do NOT include expired opportunities.
- Prefer official websites for applyUrl.
- Find 4 to 6 real opportunities per category.
- If you genuinely cannot find verified open opportunities for a category, return an empty array for that category.
- Do NOT fabricate data. If deadline is unknown write "Rolling" or "Check website".
- matchScore must be 60-99 based on how well the user's skills match the opportunity.
- whyMatched must be a specific 1-sentence reason referencing the user's skills.
- Return ONLY raw JSON. No markdown. No backticks. No explanation.

Return exactly this JSON structure:
{
  "internships": [
    {
      "title": "",
      "organization": "",
      "location": "",
      "deadline": "",
      "mode": "",
      "applyUrl": "",
      "description": "",
      "whyMatched": "",
      "matchScore": 90
    }
  ],
  "hackathons": [],
  "opensource": [],
  "competitions": [],
  "mentorships": [],
  "fellowships": []
}
`.trim();
}

// ── Gemini call ───────────────────────────────────────────────────────────────

export async function fetchOpportunities(
    req: OpportunityRequest
): Promise<OpportunityResult> {
    const key = getCacheKey(req);

    // Return from cache if valid
    const cached = getCached(key);
    if (cached) {
        console.log("[opportunityService] Cache hit:", key);
        return cached;
    }

    console.log("[opportunityService] Cache miss — calling Gemini:", key);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature: 0.3,   // lower = more factual
            maxOutputTokens: 16384,
        },
    });

    const prompt = buildPrompt(req);

    let raw: string;
    try {
        const result = await model.generateContent(prompt);
        raw = result.response.text();
        console.log("============== GEMINI RESPONSE ==============");
        console.log(raw);
        console.log("=============================================");
    } catch (err: any) {
        console.error("[opportunityService] Gemini call failed:", err?.message);
        return emptyResult();
    }

    // Strip any accidental markdown fences
    let parsed: OpportunityResult;

    try {
        const match = raw.match(/\{[\s\S]*\}/);

        if (!match) {
            console.log(raw);
            throw new Error("No JSON found");
        }

        parsed = JSON.parse(match[0]);
    } catch (err) {
        console.error("[opportunityService] JSON parse failed.");
        console.error(raw);
        return emptyResult();
    }

    // Normalise: ensure all category keys exist
    const safe: OpportunityResult = {
        internships: Array.isArray(parsed.internships) ? parsed.internships : [],
        hackathons: Array.isArray(parsed.hackathons) ? parsed.hackathons : [],
        opensource: Array.isArray(parsed.opensource) ? parsed.opensource : [],
        competitions: Array.isArray(parsed.competitions) ? parsed.competitions : [],
        mentorships: Array.isArray(parsed.mentorships) ? parsed.mentorships : [],
        fellowships: Array.isArray(parsed.fellowships) ? parsed.fellowships : [],
    };

    // Add category field to each item (so the frontend knows where it came from)
    const label = (cat: string) => (opp: Opportunity) => ({ ...opp, category: cat });
    safe.internships = safe.internships.map(label("internships"));
    safe.hackathons = safe.hackathons.map(label("hackathons"));
    safe.opensource = safe.opensource.map(label("opensource"));
    safe.competitions = safe.competitions.map(label("competitions"));
    safe.mentorships = safe.mentorships.map(label("mentorships"));
    safe.fellowships = safe.fellowships.map(label("fellowships"));

    setCache(key, safe);
    return safe;
}
