import type { WeeklyMission, NexoraAgentMemory } from './CareerAgent';

// Helper to generate a random ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

export interface MissionTemplate {
  text: string;
  skill: string;
  category: WeeklyMission['category'];
  difficulty: WeeklyMission['difficulty'];
  why: string;
}

// =============================================================================
// ROLE-SPECIFIC MISSION TEMPLATES
// Each role maps to missions anchored in real, day-to-day deliverables for that
// profession. Missions are ordered Beginner → Intermediate → Advanced within
// each skill cluster, allowing the difficulty engine below to select the right
// tier based on readiness score and feedback history.
// =============================================================================
const MISSION_TEMPLATES: Record<string, MissionTemplate[]> = {

  // ---------------------------------------------------------------------------
  // DATA ANALYST
  // Focus areas: Python/Pandas, SQL, BI dashboards, data storytelling
  // ---------------------------------------------------------------------------
  "data analyst": [
    { text: "Analyze a CSV dataset using Pandas", skill: "Python", category: "Learning", difficulty: "Beginner", why: "Builds fundamental hands-on experience loading and slicing real-world tabular data using Pandas dataframes." },
    { text: "Clean and preprocess a dirty 100k-row customer dataset", skill: "Python", category: "Project", difficulty: "Intermediate", why: "Expands your data wrangling capability to handle missing values, outliers, and formatting issues at scale." },
    { text: "Build an automated ETL data pipeline in Python and deploy it as a script", skill: "Python", category: "Project", difficulty: "Advanced", why: "Demonstrates production-grade scripting and scheduling skills required for modern Data Analyst roles." },
    { text: "Build a basic Power BI dashboard with sales data", skill: "Power BI", category: "Learning", difficulty: "Beginner", why: "Covers the essentials of importing data, configuring visual layouts, and creating basic charts in Power BI." },
    { text: "Create a Power BI dashboard with interactive filters and DAX measures", skill: "Power BI", category: "Project", difficulty: "Intermediate", why: "Introduces advanced data analysis expressions (DAX) to build dynamic metrics and interactive reports." },
    { text: "Publish a business dashboard with scheduled refreshes and Row-Level Security", skill: "Power BI", category: "Project", difficulty: "Advanced", why: "Validates enterprise-level governance, security, and cloud distribution skills in Power BI." },
    { text: "Complete a SQL joins challenge on LeetCode", skill: "SQL", category: "Interview Preparation", difficulty: "Beginner", why: "Refreshes foundational multi-table query patterns (INNER, LEFT, OUTER joins) commonly asked in technical screenings." },
    { text: "Write complex window functions to calculate running totals and moving averages", skill: "SQL", category: "Interview Preparation", difficulty: "Intermediate", why: "Builds advanced analytical SQL query capabilities for cohort analysis, ranking, and financial reporting." },
    { text: "Optimize query execution plans and index structures for a database with 1M rows", skill: "SQL", category: "Project", difficulty: "Advanced", why: "Proves database optimization skills, query tuning, and index configuration under heavy data loads." },
    { text: "Create an exploratory data analysis report on a public Kaggle dataset", skill: "Data Storytelling", category: "Learning", difficulty: "Beginner", why: "Develops the ability to find correlations and formulate hypotheses from raw datasets." },
    { text: "Write a technical article explaining insights from your latest EDA project", skill: "Data Storytelling", category: "Networking", difficulty: "Intermediate", why: "Improves technical writing and visibility within the data community through public sharing." },
    { text: "Deliver a data presentation deck to simulate executive dashboard recommendations", skill: "Data Storytelling", category: "Interview Preparation", difficulty: "Advanced", why: "Prepares you for case-study presentations where translating technical findings into business decisions is critical." },
    { text: "Apply to 3 Junior Data Analyst internships on LinkedIn", skill: "Job Search", category: "Internship", difficulty: "Intermediate", why: "Encourages proactive outreach to build resume pipeline matching your target analyst profile." },
    { text: "Connect with 5 Senior Data Analysts on LinkedIn to request informational interviews", skill: "Networking", category: "Networking", difficulty: "Beginner", why: "Establishes a professional network and yields insider tips on hiring pipelines." }
  ],

  // ---------------------------------------------------------------------------
  // AI ENGINEER
  // Focus areas: LLMs/RAG, PyTorch, system design for AI, open source
  // ---------------------------------------------------------------------------
  "ai engineer": [
    { text: "Build a simple chat interface connected to the OpenAI API", skill: "AI Agents", category: "Learning", difficulty: "Beginner", why: "Introduces core chat-completion parameters, system messages, and streaming API mechanics." },
    { text: "Develop a RAG pipeline utilizing LangChain, ChromaDB, and vector embeddings", skill: "AI Agents", category: "Project", difficulty: "Intermediate", why: "Covers vector storage, document splitting, semantic search, and context injection into LLM prompts." },
    { text: "Build an autonomous multi-agent coding team using CrewAI or AutoGen", skill: "AI Agents", category: "Project", difficulty: "Advanced", why: "Demonstrates agent delegation, sequential tasks, tool usage, and loop correction in agentic architectures." },
    { text: "Build a simple classification network in PyTorch", skill: "PyTorch", category: "Learning", difficulty: "Beginner", why: "Teaches deep learning basics: tensors, forward/backward passes, loss functions, and optimizers." },
    { text: "Fine-tune a small LLM (like Llama-3-8B) on a custom instruction dataset using QLoRA", skill: "PyTorch", category: "Project", difficulty: "Intermediate", why: "Explores Parameter-Efficient Fine-Tuning (PEFT) and memory-optimized model loading on consumer GPUs." },
    { text: "Deploy a custom-trained model as an API endpoint using FastAPI and Docker", skill: "PyTorch", category: "Project", difficulty: "Advanced", why: "Bridges the gap between machine learning and backend engineering by containerizing production models." },
    { text: "Create a system architecture diagram for an LLM evaluation and safety firewall layer", skill: "System Design", category: "Learning", difficulty: "Beginner", why: "Encourages structuring guardrails, toxic input filtering, and budget rate limiters." },
    { text: "Design a high-throughput API architecture for a real-time speech assistant", skill: "System Design", category: "Interview Preparation", difficulty: "Intermediate", why: "Prepares you to discuss real-time streaming, WebSockets, and audio compression in technical interviews." },
    { text: "Optimize an LLM hosting solution with vLLM, TensorRT, and dynamic batching", skill: "System Design", category: "Project", difficulty: "Advanced", why: "Deepens expertise in infrastructure cost-saving and throughput optimization." },
    { text: "Contribute a bug fix or documentation to a popular open-source AI library (e.g., LangChain)", skill: "Open Source", category: "Networking", difficulty: "Advanced", why: "Validates your coding standards against large public projects and boosts portfolio credibility." },
    { text: "Schedule a mock AI coding challenge using LLM system prompts and time yourself", skill: "Interview Prep", category: "Interview Preparation", difficulty: "Intermediate", why: "Tests your behavioral and real-time coding articulation under timed pressure." }
  ],

  // ---------------------------------------------------------------------------
  // SOFTWARE ENGINEER
  // Focus areas: React/web, Node.js backend, system design, open source, DSA
  // ---------------------------------------------------------------------------
  "software engineer": [
    { text: "Build a dynamic React application using Context API for global state", skill: "React", category: "Learning", difficulty: "Beginner", why: "Consolidates hooks, state flows, and clean prop drilling prevention." },
    { text: "Optimize page rendering speeds with code-splitting, lazy loading, and useMemo", skill: "React", category: "Project", difficulty: "Intermediate", why: "Focuses on frontend speed, Lighthouse scores, and profiling tools." },
    { text: "Design a complex React component library styled from scratch with a responsive grid system", skill: "React", category: "Project", difficulty: "Advanced", why: "Builds fundamental design token knowledge and flexible UI system patterns." },
    { text: "Build a Node.js REST API with Express and SQLite", skill: "Node.js", category: "Learning", difficulty: "Beginner", why: "Establishes standard HTTP methods, route handling, and sqlite database seeding." },
    { text: "Implement a JWT-based authentication system with Redis session management", skill: "Node.js", category: "Project", difficulty: "Intermediate", why: "Covers secure password hashing, token expiry, and session caching patterns." },
    { text: "Deploy a distributed rate-limiter and API gateway using Express/NestJS", skill: "Node.js", category: "Project", difficulty: "Advanced", why: "Teaches application security, DDoS defense, and cluster scaling techniques." },
    { text: "Draw a system architecture diagram for a URL shortener", skill: "System Design", category: "Learning", difficulty: "Beginner", why: "Introduces standard system elements: DNS, web servers, databases, and caching." },
    { text: "Write a system design document for a real-time collaborative whiteboarding service", skill: "System Design", category: "Interview Preparation", difficulty: "Intermediate", why: "Deepens websocket synchronization, conflict resolution protocols, and horizontal scaling strategies." },
    { text: "Design a multi-region highly-available file storage system scaling to 10M users", skill: "System Design", category: "Interview Preparation", difficulty: "Advanced", why: "Prepares you for senior system architecture interviews concerning replication lag and CDN distribution." },
    { text: "Solve 5 LeetCode easy problems in your target language", skill: "DSA", category: "Interview Preparation", difficulty: "Beginner", why: "Refreshes array, string, and map fundamentals commonly screened in technical rounds." },
    { text: "Solve 3 LeetCode medium problems on trees or graphs", skill: "DSA", category: "Interview Preparation", difficulty: "Intermediate", why: "Builds depth in traversal algorithms required for mid-level engineering interviews." },
    { text: "Complete a LeetCode hard challenge and write a documented solution explanation", skill: "DSA", category: "Interview Preparation", difficulty: "Advanced", why: "Demonstrates peak problem-solving fluency for senior and FAANG-level technical screens." },
    { text: "Contribute a small improvement to an open-source project on GitHub", skill: "Open Source", category: "Networking", difficulty: "Intermediate", why: "Builds a public track record of code quality, collaboration, and community engagement." },
    { text: "Apply to 5 internships or junior roles using your updated resume", skill: "Job Search", category: "Internship", difficulty: "Intermediate", why: "Accelerates your internship pipeline and provides exposure to recruiter response rates." },
    { text: "Attend a local developer meet-up or virtual technology conference", skill: "Networking", category: "Networking", difficulty: "Beginner", why: "Opens direct channels for hidden job markets and networking with senior engineers." }
  ],

  // ---------------------------------------------------------------------------
  // PRODUCT MANAGER
  // Focus areas: PRDs, user research, product analytics, roadmapping, prioritization
  // A PM's output is decisions and documents, not code.
  // ---------------------------------------------------------------------------
  "product manager": [
    { text: "Write a one-page PRD for a feature you wish a product you use had", skill: "PRD Writing", category: "Learning", difficulty: "Beginner", why: "A PRD is the core PM artifact. Writing one forces you to think through user problems, scope, and success metrics." },
    { text: "Write a full PRD with edge cases, API dependencies, and a launch checklist", skill: "PRD Writing", category: "Project", difficulty: "Intermediate", why: "Expands your PRD depth to cover the engineering handoff quality that senior PMs are expected to deliver." },
    { text: "Create a PRD for a 0→1 product that includes a monetization model and go-to-market strategy", skill: "PRD Writing", category: "Project", difficulty: "Advanced", why: "Demonstrates executive-level PM thinking linking product decisions to business outcomes." },
    { text: "Conduct 3 user interviews and synthesize findings into a problem statement", skill: "User Research", category: "Learning", difficulty: "Beginner", why: "Practicing structured interviews and thematic synthesis is a core PM skill for evidence-based decisions." },
    { text: "Run a usability test on a live product and document friction points with severity ratings", skill: "User Research", category: "Project", difficulty: "Intermediate", why: "Builds the rigor to translate user behavior into prioritized product improvements." },
    { text: "Design and execute an A/B test hypothesis, including statistical significance calculation", skill: "User Research", category: "Project", difficulty: "Advanced", why: "Demonstrates quantitative thinking and experiment ownership required for data-driven PM roles." },
    { text: "Set up a simple funnel analysis using Mixpanel or Amplitude free tier", skill: "Product Analytics", category: "Learning", difficulty: "Beginner", why: "Understanding conversion funnels is fundamental to identifying where users drop off in your product." },
    { text: "Build a product health dashboard tracking DAU, retention, and NPS in a spreadsheet", skill: "Product Analytics", category: "Project", difficulty: "Intermediate", why: "Develops the habit of connecting metric movement to product decisions and team priorities." },
    { text: "Write a competitive analysis comparing 3 products across UX, pricing, and market positioning", skill: "Competitive Analysis", category: "Learning", difficulty: "Beginner", why: "Trains you to identify category whitespace and articulate differentiated product positioning." },
    { text: "Present a competitive landscape teardown and strategic recommendation to a peer", skill: "Competitive Analysis", category: "Interview Preparation", difficulty: "Intermediate", why: "Product strategy presentations are a core PM interview format—this builds that muscle." },
    { text: "Build a 6-month product roadmap with prioritized themes and OKR alignment", skill: "Product Roadmap", category: "Project", difficulty: "Intermediate", why: "Roadmap creation with clear trade-off rationale is one of the most-assessed PM skills in interviews." },
    { text: "Create a Now/Next/Later roadmap and write a stakeholder memo explaining prioritization decisions", skill: "Product Roadmap", category: "Interview Preparation", difficulty: "Advanced", why: "Tests your ability to communicate hard trade-offs upward, a key PM leadership expectation." },
    { text: "Apply to 3 Associate PM or PM internship programs (e.g., Google APM, Meta RPM, Microsoft PM)", skill: "Job Search", category: "Internship", difficulty: "Intermediate", why: "APM programs are the primary entry path for aspiring PMs. Applying now builds interview pipeline." },
    { text: "Join a product community (Lenny's Slack, Product School) and share one insight weekly", skill: "Networking", category: "Networking", difficulty: "Beginner", why: "PM hiring is highly referral-driven. Active participation in product communities builds your visibility." }
  ],

  // ---------------------------------------------------------------------------
  // DESIGNER (UX / Product / Visual)
  // Focus areas: Portfolio, UX research, design systems, interaction design, Figma
  // ---------------------------------------------------------------------------
  "designer": [
    { text: "Complete a UX case study for one feature in your portfolio with a problem/solution/outcome structure", skill: "Portfolio", category: "Project", difficulty: "Beginner", why: "Recruiters evaluate designers on case study clarity. A structured problem→solution→outcome format is the industry standard." },
    { text: "Redesign a poorly-rated app screen and document your design decisions in a Figma file", skill: "Portfolio", category: "Project", difficulty: "Intermediate", why: "Unsolicited redesigns demonstrate initiative, taste, and the ability to articulate design thinking." },
    { text: "Design a full end-to-end user flow for a 0→1 product with interactive Figma prototype", skill: "Portfolio", category: "Project", difficulty: "Advanced", why: "End-to-end flow design across screens is a core senior designer interview deliverable." },
    { text: "Conduct 5 unmoderated user tests using Maze or Useberry on your existing design", skill: "UX Research", category: "Learning", difficulty: "Beginner", why: "Remote unmoderated testing is the fastest way to get quantitative signal on your design usability." },
    { text: "Write an affinity map synthesizing 8+ user interview transcripts into insight clusters", skill: "UX Research", category: "Project", difficulty: "Intermediate", why: "Affinity mapping is a core synthesis technique that proves you can extract actionable insight from qualitative data." },
    { text: "Run a card sorting study and use findings to restructure an information architecture", skill: "UX Research", category: "Project", difficulty: "Advanced", why: "IA work based on participant mental models demonstrates senior-level systems thinking in UX." },
    { text: "Build a basic color + typography token system in Figma for a personal project", skill: "Design Systems", category: "Learning", difficulty: "Beginner", why: "Token-based design is now table stakes at every product company with a design system." },
    { text: "Create a component library in Figma with variants, auto-layout, and usage documentation", skill: "Design Systems", category: "Project", difficulty: "Intermediate", why: "A properly structured component library demonstrates Figma mastery and scalable design discipline." },
    { text: "Contribute a new component to an open-source design system (e.g., Radix, shadcn/ui documentation)", skill: "Design Systems", category: "Networking", difficulty: "Advanced", why: "Contributing to open design systems validates your systems thinking and public portfolio." },
    { text: "Prototype a micro-interaction (loading state, success toast, form error) in Figma Smart Animate", skill: "Interaction Design", category: "Learning", difficulty: "Beginner", why: "Motion and state design are increasingly important differentiators in strong design portfolios." },
    { text: "Apply to 3 Product Designer or UX Research internship positions and tailor your portfolio for each", skill: "Job Search", category: "Internship", difficulty: "Intermediate", why: "Design internships are competitive. A tailored portfolio introduction for each company increases callback rates." },
    { text: "Share a design breakdown or teardown post on LinkedIn or Behance", skill: "Networking", category: "Networking", difficulty: "Beginner", why: "Public design commentary builds brand, demonstrates taste, and attracts recruiter attention." }
  ],

  // ---------------------------------------------------------------------------
  // CYBERSECURITY
  // ---------------------------------------------------------------------------
  "cybersecurity": [
    { text: "Complete the first 5 TryHackMe rooms in the Beginner learning path", skill: "Penetration Testing", category: "Learning", difficulty: "Beginner", why: "Guided CTF rooms build foundational skills in enumeration, exploitation, and privilege escalation." },
    { text: "Run a basic vulnerability scan using Nmap and Nessus on a local test environment", skill: "Penetration Testing", category: "Project", difficulty: "Intermediate", why: "Hands-on scanning builds practical recon skills used in every penetration testing engagement." },
    { text: "Exploit a DVWA (Damn Vulnerable Web Application) SQL injection vulnerability end-to-end", skill: "Penetration Testing", category: "Project", difficulty: "Advanced", why: "Full-chain exploitation of OWASP Top 10 vulnerabilities is assessed in security certifications and interviews." },
    { text: "Set up a Wireshark capture and analyze HTTP vs HTTPS traffic differences", skill: "Network Security", category: "Learning", difficulty: "Beginner", why: "Packet analysis is a foundational skill for understanding protocol-level threats and anomalies." },
    { text: "Configure a basic firewall ruleset using iptables or pfSense", skill: "Network Security", category: "Project", difficulty: "Intermediate", why: "Firewall configuration is a core skill for security operations and network hardening roles." },
    { text: "Set up an Elastic SIEM stack and write a detection rule for a brute-force attack pattern", skill: "Network Security", category: "Project", difficulty: "Advanced", why: "SIEM rule authorship demonstrates real-world detection engineering capability sought by SOC roles." },
    { text: "Study the OWASP Top 10 and write a one-paragraph explanation of each vulnerability", skill: "Security Knowledge", category: "Learning", difficulty: "Beginner", why: "OWASP Top 10 fluency is tested in virtually every security interview and is referenced in compliance frameworks." },
    { text: "Apply to 3 Security Analyst or SOC Analyst internship positions", skill: "Job Search", category: "Internship", difficulty: "Intermediate", why: "SOC analyst roles are the most accessible entry point into cybersecurity for early-career professionals." },
    { text: "Pass the CompTIA Security+ practice exam with a score of 85%+", skill: "Certification", category: "Certification", difficulty: "Intermediate", why: "Security+ is the most widely recognized entry-level security certification and is required by many federal roles." }
  ]
};

// =============================================================================
// GENERAL FALLBACK TEMPLATES
// Used when the target role does not match any specific template bucket.
// These are deliberately role-neutral professional development tasks.
// =============================================================================
const FALLBACK_TEMPLATES: MissionTemplate[] = [
  { text: "Read the clean code principles manual and apply refactoring to an old script", skill: "Code Quality", category: "Learning", difficulty: "Beginner", why: "Builds proper formatting, modularization, and naming standards applicable across all technical roles." },
  { text: "Create a GitHub Repository for a current project with a comprehensive README and CI/CD workflow", skill: "Git & GitHub", category: "Project", difficulty: "Intermediate", why: "Validates your workflow practices using modern version control, automation, and project layouts." },
  { text: "Review 3 other GitHub repositories and submit pull requests or detailed issues", skill: "Collaboration", category: "Networking", difficulty: "Intermediate", why: "Enhances team code inspection habits and open source participation." },
  { text: "Complete 5 algorithmic challenges in JavaScript or Python on HackerRank", skill: "Algorithms", category: "Interview Preparation", difficulty: "Intermediate", why: "Boosts logic speed and prepares for strict coding screenings." },
  { text: "Apply to 2 junior positions matching your target profile", skill: "Job Application", category: "Internship", difficulty: "Intermediate", why: "Keeps your application pipeline consistently active." },
  { text: "Prepare a 1-page summary sheet explaining your core strengths and project architectures", skill: "Interview Prep", category: "Interview Preparation", difficulty: "Advanced", why: "Helps articulate technical design decisions clearly to recruiters." }
];

// =============================================================================
// ROLE MATCHING
// Maps free-text target role strings to one of the template buckets above.
// Order matters: more specific patterns (e.g., "product manager") are checked
// before broader ones (e.g., "engineer") to avoid mis-classification.
// =============================================================================
const getMatchedTemplates = (targetRole: string): MissionTemplate[] => {
  const role = targetRole.toLowerCase();

  // Product Manager — check before "engineer" to avoid matching "pm engineer"
  if (role.includes("product manager") || role.includes("product manager") || role.includes(" pm") || role === "pm" || role.includes("apm") || role.includes("associate product")) {
    return MISSION_TEMPLATES["product manager"];
  }

  // Designer (UX / Product / Visual)
  if (role.includes("design") || role.includes("ux") || role.includes("ui ") || role.includes("figma") || role.includes("visual")) {
    return MISSION_TEMPLATES["designer"];
  }

  // Cybersecurity
  if (role.includes("cyber") || role.includes("security") || role.includes("infosec") || role.includes("pentest") || role.includes("soc")) {
    return MISSION_TEMPLATES["cybersecurity"];
  }

  // Data Analyst / BI
  if (role.includes("data") || role.includes("analyst") || role.includes("bi") || role.includes("power bi")) {
    return MISSION_TEMPLATES["data analyst"];
  }

  // AI / ML Engineer — check before "software engineer" since "AI engineer" contains "engineer"
  if (role.includes("ai") || role.includes("machine learning") || role.includes(" ml") || role.includes("llm") || role.includes("pytorch") || role.includes("deep learning")) {
    return MISSION_TEMPLATES["ai engineer"];
  }

  // Software Engineer / Developer (broadest technical bucket, checked last among tech roles)
  if (role.includes("software") || role.includes("engineer") || role.includes("developer") || role.includes("frontend") || role.includes("backend") || role.includes("full stack") || role.includes("fullstack")) {
    return MISSION_TEMPLATES["software engineer"];
  }

  // No match → generic fallback
  return FALLBACK_TEMPLATES;
};

// =============================================================================
// SKILL COMPLETION STATS
// Returns a map of skill → completed mission count, used to calibrate
// difficulty and unlock "level up" missions within an already-mastered skill.
// =============================================================================
export const getSkillCompletionStats = (history: WeeklyMission[]) => {
  const stats: Record<string, number> = {};
  history.forEach(m => {
    if (m.completed) {
      stats[m.skill] = (stats[m.skill] || 0) + 1;
    }
  });
  return stats;
};

// =============================================================================
// MAIN MISSION GENERATOR
// Selects and ranks templates based on:
//   1. Role match
//   2. Gap vs. strength weighting (gaps get priority)
//   3. Difficulty calibrated from readiness score + feedback history
//   4. Deduplication against active, suggested, and history lists
//   5. Category balancing (avoid all-Learning or all-Interview-Prep batches)
// =============================================================================
export const generateMissions = (
  memory: NexoraAgentMemory,
  count: number = 3,
  excludeIds: string[] = []
): WeeklyMission[] => {
  const matched = getMatchedTemplates(memory.targetRole);

  // Track how many times each skill has been completed to reward progression
  const completionStats = getSkillCompletionStats(memory.missionHistory || []);

  // ---------------------------------------------------------------------------
  // DIFFICULTY CALIBRATION
  // Base difficulty comes from the overall readiness score.
  // User feedback ('Easy' / 'Difficult') shifts the base by ±1 tier.
  // ---------------------------------------------------------------------------
  let easyCount = 0;
  let hardCount = 0;
  (memory.missionHistory || []).forEach(m => {
    if (m.feedback === 'Easy') easyCount++;
    if (m.feedback === 'Difficult') hardCount++;
  });
  const feedbackOffset = easyCount > hardCount ? 1 : (hardCount > easyCount ? -1 : 0);

  const readiness = memory.analysis?.readiness ?? 50;
  let baseDifficulty: WeeklyMission['difficulty'] = 'Beginner';
  if (readiness >= 80) baseDifficulty = 'Advanced';
  else if (readiness >= 55) baseDifficulty = 'Intermediate';

  const difficulties: WeeklyMission['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced'];
  let adjustedIndex = difficulties.indexOf(baseDifficulty) + feedbackOffset;
  adjustedIndex = Math.max(0, Math.min(2, adjustedIndex));
  const targetDifficulty = difficulties[adjustedIndex];

  // ---------------------------------------------------------------------------
  // DEDUPLICATION
  // Exclude missions already active, suggested, in history, or in excludeIds.
  // ---------------------------------------------------------------------------
  const activeTexts = new Set(memory.weeklyMissions.map(m => m.text));
  const suggestedTexts = new Set((memory.suggestedMissions || []).map(m => m.text));
  const historyTexts = new Set((memory.missionHistory || []).map(m => m.text));
  const excludedIdsSet = new Set(excludeIds);

  let pool = matched.filter(t =>
    !activeTexts.has(t.text) &&
    !suggestedTexts.has(t.text) &&
    !historyTexts.has(t.text)
  );

  // If pool is exhausted (user has done everything), reset to matched + fallback without history filter
  if (pool.length === 0) {
    pool = [...matched, ...FALLBACK_TEMPLATES].filter(t => !excludedIdsSet.has(t.text));
  }

  // ---------------------------------------------------------------------------
  // RANKING
  // Score each template. Higher score → more likely to be selected.
  //   +10 if skill directly matches a gap from AI analysis
  //   +4  if skill matches a strength (deepen mastery)
  //   +5  if template difficulty matches the calibrated target
  //   +2-6 if user has already completed related missions (progression reward)
  // ---------------------------------------------------------------------------
  const gaps = new Set((memory.analysis?.gaps || []).map(g => g.toLowerCase()));
  const strengths = new Set((memory.analysis?.strengths || []).map(s => s.toLowerCase()));

  const ranked = pool.map(template => {
    let score = 0;
    const skillLower = template.skill.toLowerCase();

    if (gaps.has(skillLower)) score += 10;          // Close critical gap
    if (strengths.has(skillLower)) score += 4;       // Deepen a strength
    if (template.difficulty === targetDifficulty) score += 5; // Right difficulty

    // Progression bonus: suggest more advanced tasks in areas they've completed
    const completedCount = completionStats[template.skill] || 0;
    if (completedCount > 0) {
      score += Math.min(6, completedCount * 2);
      if (template.difficulty === 'Advanced' && completedCount >= 2) score += 5;
      if (template.difficulty === 'Intermediate' && completedCount >= 1) score += 3;
    }

    return { template, score };
  });

  ranked.sort((a, b) => b.score - a.score);

  // ---------------------------------------------------------------------------
  // CATEGORY BALANCING
  // Try to ensure a varied set (e.g., one Learning + one Project + one Interview)
  // rather than returning three Interview Preparation tasks in a row.
  // ---------------------------------------------------------------------------
  const selected: WeeklyMission[] = [];
  const categoriesUsed = new Set<string>();

  for (const item of ranked) {
    if (selected.length >= count) break;

    if (!categoriesUsed.has(item.template.category) || selected.length >= 2) {
      categoriesUsed.add(item.template.category);

      // Write a personalized "why" explanation
      let why = item.template.why;
      const completedCount = completionStats[item.template.skill] || 0;
      if (completedCount > 0) {
        why = `Assigned to level up your ${item.template.skill} expertise — you've already completed ${completedCount} related mission(s).`;
      } else if (gaps.has(item.template.skill.toLowerCase())) {
        why = `Assigned to close your critical skill gap in ${item.template.skill}, identified during analysis for your ${memory.targetRole} target role.`;
      }

      selected.push({
        id: generateId(),
        text: item.template.text,
        completed: false,
        why,
        difficulty: item.template.difficulty,
        skill: item.template.skill,
        category: item.template.category,
        source: 'AI Generated',
        createdAt: new Date().toISOString()
      });
    }
  }

  // Fallback fill if category balancing left us short
  if (selected.length < count) {
    for (const item of ranked) {
      if (selected.length >= count) break;
      if (selected.find(s => s.text === item.template.text)) continue;
      selected.push({
        id: generateId(),
        text: item.template.text,
        completed: false,
        why: item.template.why,
        difficulty: item.template.difficulty,
        skill: item.template.skill,
        category: item.template.category,
        source: 'AI Generated',
        createdAt: new Date().toISOString()
      });
    }
  }

  return selected;
};

// =============================================================================
// MISSION RELEVANCE CHECK
// Called when the user changes their target role. Keeps missions that are still
// relevant to the new role and archives the rest (unless pinned or user-created).
// =============================================================================
export const checkMissionRelevance = (
  memory: NexoraAgentMemory
): { active: WeeklyMission[]; suggestions: WeeklyMission[]; log: string[] } => {
  const active: WeeklyMission[] = [];
  const suggestions: WeeklyMission[] = [];
  const log: string[] = [];

  const matched = getMatchedTemplates(memory.targetRole);
  const matchedSkills = new Set(matched.map(t => t.skill.toLowerCase()));

  memory.weeklyMissions.forEach(mission => {
    if (mission.pinned) {
      active.push(mission);
      log.push(`Kept pinned active mission: "${mission.text}"`);
      return;
    }
    if (mission.source === 'User Created') {
      active.push(mission);
      log.push(`Kept custom user mission: "${mission.text}"`);
      return;
    }
    const isRelevant = matchedSkills.has(mission.skill.toLowerCase());
    if (isRelevant) {
      active.push(mission);
      log.push(`Kept relevant active mission: "${mission.text}"`);
    } else {
      log.push(`Archived outdated mission: "${mission.text}" (not relevant to ${memory.targetRole})`);
    }
  });

  (memory.suggestedMissions || []).forEach(mission => {
    if (mission.pinned) {
      suggestions.push(mission);
      log.push(`Kept pinned suggested mission: "${mission.text}"`);
      return;
    }
    const isRelevant = matchedSkills.has(mission.skill.toLowerCase());
    if (isRelevant) suggestions.push(mission);
    else log.push(`Removed irrelevant suggestion: "${mission.text}"`);
  });

  return { active, suggestions, log };
};

// =============================================================================
// SINGLE MISSION REGENERATION
// Replaces one mission by ID, avoiding its old text.
// Records why it was replaced so the agent can learn from the skip.
// =============================================================================
export const regenerateSingleMission = (
  memory: NexoraAgentMemory,
  missionId: string,
  skipReason: string = 'User requested regeneration'
): WeeklyMission | null => {
  const activeMission =
    memory.weeklyMissions.find(m => m.id === missionId) ||
    (memory.suggestedMissions || []).find(m => m.id === missionId);
  if (!activeMission) return null;

  const replacements = generateMissions(memory, 1, [activeMission.text]);
  if (replacements.length === 0) return null;

  const replacement = replacements[0];
  replacement.replacedWhy = `Replaced "${activeMission.text}" because: ${skipReason}`;
  return replacement;
};
