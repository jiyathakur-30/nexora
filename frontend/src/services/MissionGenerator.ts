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

// Extensive catalog of realistic, role-specific missions
const MISSION_TEMPLATES: Record<string, MissionTemplate[]> = {
  "data analyst": [
    // Python / Pandas / Wrangling
    {
      text: "Analyze a CSV dataset using Pandas",
      skill: "Python",
      category: "Learning",
      difficulty: "Beginner",
      why: "Builds fundamental hands-on experience loading and slicing real-world tabular data using Pandas dataframes."
    },
    {
      text: "Clean and preprocess a dirty 100k-row customer dataset",
      skill: "Python",
      category: "Project",
      difficulty: "Intermediate",
      why: "Expands your data wrangling capability to handle missing values, outliers, and data formatting issues at scale."
    },
    {
      text: "Build an automated ETL data pipeline in Python and deploy it as a script",
      skill: "Python",
      category: "Project",
      difficulty: "Advanced",
      why: "Demonstrates production-grade scripting and scheduling skills required for modern Data Analyst roles."
    },
    // Power BI / Dashboards
    {
      text: "Build a basic Power BI dashboard with sales data",
      skill: "Power BI",
      category: "Learning",
      difficulty: "Beginner",
      why: "Covers the essentials of importing data, configuring visual layouts, and creating basic charts in Power BI."
    },
    {
      text: "Create a Power BI dashboard with interactive filters and DAX measures",
      skill: "Power BI",
      category: "Project",
      difficulty: "Intermediate",
      why: "Introduces advanced data analysis expressions (DAX) to build dynamic metrics and interactive reports."
    },
    {
      text: "Publish a business dashboard with scheduled refreshes and Row-Level Security",
      skill: "Power BI",
      category: "Project",
      difficulty: "Advanced",
      why: "Validates enterprise-level governance, security, and cloud distribution skills in Power BI."
    },
    // SQL
    {
      text: "Complete a SQL joins challenge on LeetCode",
      skill: "SQL",
      category: "Interview Preparation",
      difficulty: "Beginner",
      why: "Refreshes foundational multi-table query patterns (INNER, LEFT, OUTER joins) commonly asked in technical screenings."
    },
    {
      text: "Write complex window functions to calculate running totals and moving averages",
      skill: "SQL",
      category: "Interview Preparation",
      difficulty: "Intermediate",
      why: "Builds advanced analytical SQL query capabilities for cohort analysis, ranking, and financial reporting."
    },
    {
      text: "Optimize query execution plans and index structures for a database with 1M rows",
      skill: "SQL",
      category: "Project",
      difficulty: "Advanced",
      why: "Proves database optimization skills, query tuning, and index configuration under heavy data loads."
    },
    // Data Storytelling / Communication
    {
      text: "Create a exploratory data analysis report on a public Kaggle dataset",
      skill: "Data Storytelling",
      category: "Learning",
      difficulty: "Beginner",
      why: "Develops the ability to find correlations and formulate hypotheses from raw datasets."
    },
    {
      text: "Write a detailed technical article explaining insights from your latest EDA project",
      skill: "Data Storytelling",
      category: "Networking",
      difficulty: "Intermediate",
      why: "Improves technical writing and visibility within the data community through public sharing."
    },
    {
      text: "Deliver a data presentation deck to simulate executive dashboard recommendations",
      skill: "Data Storytelling",
      category: "Interview Preparation",
      difficulty: "Advanced",
      why: "Prepares you for case-study presentations where translating technical findings into business decisions is critical."
    },
    // Career/General for Analyst
    {
      text: "Apply to 3 Junior Data Analyst internships on LinkedIn or Opportunity Hub",
      skill: "Job Search",
      category: "Internship",
      difficulty: "Intermediate",
      why: "Encourages proactive outreach to build resume pipeline matching your target analyst profile."
    },
    {
      text: "Connect with 5 Senior Data Analysts on LinkedIn to request informational interviews",
      skill: "Networking",
      category: "Networking",
      difficulty: "Beginner",
      why: "Establishes a professional network and yields insider tips on hiring pipelines."
    }
  ],
  "ai engineer": [
    // RAG / LLMs
    {
      text: "Build a simple chat interface connected to the OpenAI API",
      skill: "AI Agents",
      category: "Learning",
      difficulty: "Beginner",
      why: "Introduces core chat-completion parameters, system messages, and streaming API mechanics."
    },
    {
      text: "Develop a RAG pipeline utilizing LangChain, ChromaDB, and vector embeddings",
      skill: "AI Agents",
      category: "Project",
      difficulty: "Intermediate",
      why: "Covers vector storage, document splitting, semantic search, and context injection into LLM prompts."
    },
    {
      text: "Build an autonomous multi-agent coding team using CrewAI or AutoGen",
      skill: "AI Agents",
      category: "Project",
      difficulty: "Advanced",
      why: "Demonstrates agent delegation, sequential tasks, tool usage, and loop correction in agentic architectures."
    },
    // Neural Networks / Fine-tuning
    {
      text: "Build a simple classification network in PyTorch",
      skill: "PyTorch",
      category: "Learning",
      difficulty: "Beginner",
      why: "Teaches deep learning basics: tensors, forward/backward passes, loss functions, and optimizers."
    },
    {
      text: "Fine-tune a small LLM (like Llama-3-8B) on a custom instruction dataset using QLoRA",
      skill: "PyTorch",
      category: "Project",
      difficulty: "Intermediate",
      why: "Explores Parameter-Efficient Fine-Tuning (PEFT) and memory-optimized model loading on consumer GPUs."
    },
    {
      text: "Deploy a custom-trained segmentation model as an API endpoint using FastAPI and Docker",
      skill: "PyTorch",
      category: "Project",
      difficulty: "Advanced",
      why: "Bridges the gap between machine learning and backend engineering by containerizing production models."
    },
    // System Design / Cloud
    {
      text: "Design a high-throughput, low-latency API architecture for a real-time speech assistant",
      skill: "System Design",
      category: "Interview Preparation",
      difficulty: "Intermediate",
      why: "Prepares you to discuss real-time streaming, WebSockets, and audio compression in technical interviews."
    },
    {
      text: "Create a system architecture diagram for an LLM evaluation and safety firewall layer",
      skill: "System Design",
      category: "Learning",
      difficulty: "Beginner",
      why: "Encourages structuring guardrails, toxic input filtering, and budget rate limiters."
    },
    {
      text: "Optimize an LLM hosting solution with vLLM, TensorRT, and dynamic batching",
      skill: "System Design",
      category: "Project",
      difficulty: "Advanced",
      why: "Deepens expertise in infrastructure cost-saving and throughput optimization."
    },
    // Career/General
    {
      text: "Contribute a bug fix or documentation to a popular open-source AI library (e.g., LangChain, LlamaIndex)",
      skill: "Open Source",
      category: "Networking",
      difficulty: "Advanced",
      why: "Validates your coding standards against large public projects and boosts portfolio credibility."
    },
    {
      text: "Schedule a mock AI coding challenge with the Nexora Mentor using LLM system prompts",
      skill: "Interview Prep",
      category: "Interview Preparation",
      difficulty: "Intermediate",
      why: "Tests your behavioral and real-time coding articulation under timed pressure."
    }
  ],
  "software engineer": [
    // Web Dev / React
    {
      text: "Build a dynamic React state-managed application using Context API",
      skill: "React",
      category: "Learning",
      difficulty: "Beginner",
      why: "Consolidates hooks, state flows, and clean prop drilling prevention."
    },
    {
      text: "Optimize page rendering speeds with code-splitting, lazy loading, and useMemo",
      skill: "React",
      category: "Project",
      difficulty: "Intermediate",
      why: "Focuses on frontend speed, Lighthouse scores, and profiling tools."
    },
    {
      text: "Design a complex React component library styled from scratch with responsive grid systems",
      skill: "React",
      category: "Project",
      difficulty: "Advanced",
      why: "Builds fundamental design token knowledge and flexible UI system patterns."
    },
    // Backend
    {
      text: "Build a Node.js REST API with Express and SQLite",
      skill: "Node.js",
      category: "Learning",
      difficulty: "Beginner",
      why: "Establishes standard HTTP methods, route handling, and sqlite database seeding."
    },
    {
      text: "Implement a JWT-based authentication system with Redis session management",
      skill: "Node.js",
      category: "Project",
      difficulty: "Intermediate",
      why: "Covers secure passwords hashing, tokens expiry, and session caching patterns."
    },
    {
      text: "Deploy a distributed rate-limiter and API gateway using Express/NestJS",
      skill: "Node.js",
      category: "Project",
      difficulty: "Advanced",
      why: "Teaches application security, DDoS defense, and cluster scaling techniques."
    },
    // System Design / Cloud
    {
      text: "Draw a system architecture diagram for a URL shortener",
      skill: "System Design",
      category: "Learning",
      difficulty: "Beginner",
      why: "Introduces standard system elements: DNS, Web Servers, Database, and Caching."
    },
    {
      text: "Write a system design document outlining a real-time collaborative whiteboarding service",
      skill: "System Design",
      category: "Interview Preparation",
      difficulty: "Intermediate",
      why: "Deepens websocket synchronizations, conflicts resolution protocols, and horizontal scaling strategies."
    },
    {
      text: "Design a multi-region highly-available file storage system scaling to 10M users",
      skill: "System Design",
      category: "Interview Preparation",
      difficulty: "Advanced",
      why: "Prepares you for senior system architecture interviews concerning replication lag and CDN distribution."
    },
    // Career/General
    {
      text: "Apply to 5 internships or junior roles using your updated Resume",
      skill: "Job Search",
      category: "Internship",
      difficulty: "Intermediate",
      why: "Accelerates your internship pipeline and provides exposure to recruiter response rates."
    },
    {
      text: "Attend a local developer meet-up or virtual technology conference",
      skill: "Networking",
      category: "Networking",
      difficulty: "Beginner",
      why: "Opens direct channels for hidden job markets and networking with senior engineers."
    }
  ]
};

// General fallback templates when role doesn't match above categories
const FALLBACK_TEMPLATES: MissionTemplate[] = [
  {
    text: "Read the clean code principles manual and apply refactoring to an old script",
    skill: "Code Quality",
    category: "Learning",
    difficulty: "Beginner",
    why: "Builds proper formatting, modularization, and naming standards."
  },
  {
    text: "Create a Github Repository for a current project with a comprehensive README and CI/CD workflow",
    skill: "Git & GitHub",
    category: "Project",
    difficulty: "Intermediate",
    why: "Validates your workflow practices using modern version control, automation, and project layouts."
  },
  {
    text: "Review 3 other GitHub repositories and submit pull requests or detailed issues",
    skill: "Collaboration",
    category: "Networking",
    difficulty: "Intermediate",
    why: "Enhances team code inspection habits and open source participation."
  },
  {
    text: "Complete 5 algorithmic challenges in JavaScript or Python on HackerRank",
    skill: "Algorithms",
    category: "Interview Preparation",
    difficulty: "Intermediate",
    why: "Boosts logic speed and prepares for strict coding screenings."
  },
  {
    text: "Apply to 2 junior positions matching your target profile",
    skill: "Job Application",
    category: "Internship",
    difficulty: "Intermediate",
    why: "Keeps your application pipeline consistently active."
  },
  {
    text: "Prepare a 1-page summary sheet explaining your core strengths and project architectures",
    skill: "Interview Prep",
    category: "Interview Preparation",
    difficulty: "Advanced",
    why: "Helps articulate technical design decisions clearly to recruiters."
  }
];

// Determine role category matching
const getMatchedTemplates = (targetRole: string): MissionTemplate[] => {
  const role = targetRole.toLowerCase();
  if (role.includes("data") || role.includes("analyst") || role.includes("bi") || role.includes("power")) {
    return MISSION_TEMPLATES["data analyst"];
  }
  if (role.includes("ai") || role.includes("agent") || role.includes("machine") || role.includes("ml") || role.includes("pytorch")) {
    return MISSION_TEMPLATES["ai engineer"];
  }
  if (role.includes("software") || role.includes("engineer") || role.includes("developer") || role.includes("frontend") || role.includes("backend") || role.includes("full")) {
    return MISSION_TEMPLATES["software engineer"];
  }
  return FALLBACK_TEMPLATES;
};

// Calculate skill completed count to adjust recommendations and difficulty
export const getSkillCompletionStats = (history: WeeklyMission[]) => {
  const stats: Record<string, number> = {};
  history.forEach(m => {
    if (m.completed) {
      stats[m.skill] = (stats[m.skill] || 0) + 1;
    }
  });
  return stats;
};

// Main generator function
export const generateMissions = (
  memory: NexoraAgentMemory,
  count: number = 3,
  excludeIds: string[] = []
): WeeklyMission[] => {
  const matched = getMatchedTemplates(memory.targetRole);
  
  // Calculate skill completed count to determine confidence levels and adjustment
  const completionStats = getSkillCompletionStats(memory.missionHistory || []);
  
  // Feedback-adjusted difficulty offsets
  // If user frequently reviews completed missions as "Easy", push for higher difficulty.
  // If "Difficult", keep at Beginner/Intermediate.
  let easyCount = 0;
  let hardCount = 0;
  (memory.missionHistory || []).forEach(m => {
    if (m.feedback === 'Easy') easyCount++;
    if (m.feedback === 'Difficult') hardCount++;
  });
  
  const feedbackOffset = easyCount > hardCount ? 1 : (hardCount > easyCount ? -1 : 0);

  // Base difficulty from readiness score
  const readiness = memory.analysis?.readiness ?? 50;
  let baseDifficulty: WeeklyMission['difficulty'] = 'Beginner';
  if (readiness >= 80) {
    baseDifficulty = 'Advanced';
  } else if (readiness >= 55) {
    baseDifficulty = 'Intermediate';
  }

  // Adjust base difficulty based on feedbackOffset
  const difficulties: WeeklyMission['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced'];
  let adjustedIndex = difficulties.indexOf(baseDifficulty) + feedbackOffset;
  adjustedIndex = Math.max(0, Math.min(2, adjustedIndex));
  const targetDifficulty = difficulties[adjustedIndex];

  // Filter templates
  // Avoid templates already in active list, suggestions pool, history, or excludeIds
  const activeTexts = new Set(memory.weeklyMissions.map(m => m.text));
  const suggestedTexts = new Set((memory.suggestedMissions || []).map(m => m.text));
  const historyTexts = new Set((memory.missionHistory || []).map(m => m.text));
  const excludedIdsSet = new Set(excludeIds);

  let pool = matched.filter(t => {
    return !activeTexts.has(t.text) && 
           !suggestedTexts.has(t.text) && 
           !historyTexts.has(t.text);
  });

  if (pool.length === 0) {
    pool = [...matched, ...FALLBACK_TEMPLATES].filter(t => {
      return !activeTexts.has(t.text) && !excludedIdsSet.has(t.text);
    });
  }

  // Rank pool templates
  // - Gaps matching: Boost templates that match critical gaps
  // - Strengths matching: Boost templates matching strengths if no gaps, or to balance
  // - Difficulty matching: Boost templates matching targetDifficulty or higher if completed counts are high
  const gaps = new Set((memory.analysis?.gaps || []).map(g => g.toLowerCase()));
  const strengths = new Set((memory.analysis?.strengths || []).map(s => s.toLowerCase()));

  const ranked = pool.map(template => {
    let score = 0;
    const skillLower = template.skill.toLowerCase();

    // Prioritize Gaps
    if (gaps.has(skillLower)) {
      score += 10;
    }
    // Deepen Strengths
    if (strengths.has(skillLower)) {
      score += 4;
    }
    // Difficulty Alignment
    if (template.difficulty === targetDifficulty) {
      score += 5;
    }
    
    // Agent learning: Adjust score based on completed history
    const completedCount = completionStats[template.skill] || 0;
    if (completedCount > 0) {
      // User has completed tasks in this area: increase confidence and suggest advanced
      score += Math.min(6, completedCount * 2);
      if (template.difficulty === 'Advanced' && completedCount >= 2) score += 5;
      if (template.difficulty === 'Intermediate' && completedCount >= 1) score += 3;
    }

    return { template, score };
  });

  // Sort by score descending
  ranked.sort((a, b) => b.score - a.score);

  // Group by category to balance types
  const selected: WeeklyMission[] = [];
  const categoriesUsed = new Set<string>();

  for (const item of ranked) {
    if (selected.length >= count) break;

    // Try to balance categories
    if (!categoriesUsed.has(item.template.category) || selected.length >= 2) {
      categoriesUsed.add(item.template.category);

      // Build explanation
      let why = item.template.why;
      const completedCount = completionStats[item.template.skill] || 0;
      if (completedCount > 0) {
        why = `Assigned to level up your ${item.template.skill} expertise, since you have successfully completed ${completedCount} related mission(s).`;
      } else if (gaps.has(item.template.skill.toLowerCase())) {
        why = `Assigned to close your critical skill gap in ${item.template.skill} identified during analysis for the ${memory.targetRole} role.`;
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

  // Fallback to plain select if not enough
  while (selected.length < count && ranked.length > selected.length) {
    const item = ranked[selected.length];
    if (!item) break;
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

  return selected;
};

// Check relevance and output audit logs
export const checkMissionRelevance = (
  memory: NexoraAgentMemory
): { active: WeeklyMission[]; suggestions: WeeklyMission[]; log: string[] } => {
  const active: WeeklyMission[] = [];
  const suggestions: WeeklyMission[] = [];
  const log: string[] = [];

  const matched = getMatchedTemplates(memory.targetRole);
  const matchedSkills = new Set(matched.map(t => t.skill.toLowerCase()));

  // Process Active
  memory.weeklyMissions.forEach(mission => {
    // Pinned missions are kept unconditionally
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

    // AI/Edited relevance check
    const isRelevant = matchedSkills.has(mission.skill.toLowerCase());
    if (isRelevant) {
      active.push(mission);
      log.push(`Kept relevant active mission: "${mission.text}"`);
    } else {
      // Archive/Replace
      log.push(`Archived outdated active mission: "${mission.text}" (Not relevant to new role: ${memory.targetRole})`);
    }
  });

  // Process Suggestions
  (memory.suggestedMissions || []).forEach(mission => {
    if (mission.pinned) {
      suggestions.push(mission);
      log.push(`Kept pinned suggested mission: "${mission.text}"`);
      return;
    }

    const isRelevant = matchedSkills.has(mission.skill.toLowerCase());
    if (isRelevant) {
      suggestions.push(mission);
    } else {
      log.push(`Removed irrelevant suggestion: "${mission.text}"`);
    }
  });

  return { active, suggestions, log };
};

// Regenerate single mission with replaced explanation
export const regenerateSingleMission = (
  memory: NexoraAgentMemory,
  missionId: string,
  skipReason: string = 'User requested regeneration to focus on other areas'
): WeeklyMission | null => {
  const activeMission = memory.weeklyMissions.find(m => m.id === missionId) ||
                       (memory.suggestedMissions || []).find(m => m.id === missionId);
  if (!activeMission) return null;

  // Generate a replacement
  const replacements = generateMissions(memory, 1, [activeMission.text]);
  if (replacements.length === 0) return null;

  const replacement = replacements[0];
  replacement.replacedWhy = `Replaced previous mission ("${activeMission.text}") because: ${skipReason}`;
  return replacement;
};
