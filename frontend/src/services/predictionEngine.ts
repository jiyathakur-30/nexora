export interface UserProfile {
  targetRole: string;
  currentReadiness: number;
  history: Array<{ action: string; category: string; timestamp: number }>;
}

export interface PredictionResult {
  action: string;
  category: string;
  targetRoleAlignment: string; // "Very High", "High", "Medium", "Low", "None"
  affectedSkills: string[];
  estimatedDifficulty: string; // "High", "Medium", "Low"
  portfolioImpact: string; // "High", "Medium", "Low"
  interviewImpact: string; // "High", "Medium", "Low"
  industryDemand: string; // "Very High", "High", "Medium", "Low"
  confidence: string; // "High", "Medium", "Low"
  confidenceReason: string;
  readinessChange: number;
  explanation: string;
  increase: number; // Backward compatibility alias
  desc: string; // Backward compatibility alias
  current: number;
  projected: number;
}

// ----------------------------------------------------
// Data Configuration & Mapping Tables
// ----------------------------------------------------

export const VERB_EFFORT_MAP: Record<string, number> = {
  build: 1.0,
  create: 1.0,
  implement: 1.0,
  develop: 1.0,
  code: 1.0,
  ship: 1.0,
  launch: 1.0,
  publish: 1.0,
  win: 1.0,
  solve: 0.9,
  write: 0.85,
  contribute: 0.95,
  learn: 0.7,
  study: 0.7,
  master: 0.8,
  practice: 0.75,
  prepare: 0.75,
  complete: 0.8,
  watch: 0.4,
  read: 0.45,
  review: 0.5,
  explore: 0.4,
  try: 0.35,
  understand: 0.4,
  buy: 0.1,
  get: 0.2,
  upgrade: 0.15,
  switch: 0.75,
  play: 0.1,
  travel: 0.0,
  cook: 0.0,
  dance: 0.0,
  swim: 0.0,
};

export const CATEGORY_METADATA: Record<
  string,
  {
    defaultSkills: string[];
    difficulty: string;
    demand: string;
    portfolioImpact: string;
    interviewImpact: string;
    defaultReason: string;
  }
> = {
  "Programming Language": {
    defaultSkills: ["Syntax", "Core Paradigms", "Language Fluency"],
    difficulty: "Medium",
    demand: "High",
    portfolioImpact: "Medium",
    interviewImpact: "High",
    defaultReason: "Programming languages are the core tools of execution. Building fluency directly supports technical interview coding rounds."
  },
  "Frontend": {
    defaultSkills: ["React", "UI Components", "HTML/CSS", "State Management"],
    difficulty: "Medium",
    demand: "High",
    portfolioImpact: "High",
    interviewImpact: "Medium",
    defaultReason: "Frontend skills directly translate into interactive user-facing portfolio projects and product prototyping velocity."
  },
  "Backend": {
    defaultSkills: ["API Design", "Server Logic", "Node.js/Express"],
    difficulty: "Medium",
    demand: "Very High",
    portfolioImpact: "Medium",
    interviewImpact: "High",
    defaultReason: "Robust backend system competency ensures stable data orchestration, security compliance, and performant operations."
  },
  "Cloud Computing": {
    defaultSkills: ["AWS/Azure/GCP", "Cloud Architecture", "Serverless Deployment"],
    difficulty: "High",
    demand: "Very High",
    portfolioImpact: "Medium",
    interviewImpact: "Medium",
    defaultReason: "Cloud engineering enables reliable deployment and cost-efficient management of production infrastructure at scale."
  },
  "DevOps": {
    defaultSkills: ["Docker", "Kubernetes", "CI/CD Pipelines", "Containerization"],
    difficulty: "High",
    demand: "Very High",
    portfolioImpact: "Medium",
    interviewImpact: "Medium",
    defaultReason: "Automation of deployment, testing pipelines, and environment management ensures high system reliability."
  },
  "Artificial Intelligence": {
    defaultSkills: ["Generative AI", "AI Architecture", "Model Integration"],
    difficulty: "High",
    demand: "Very High",
    portfolioImpact: "High",
    interviewImpact: "High",
    defaultReason: "Applied AI models enable next-generation intelligence feature suites in software products, matching current premium demand."
  },
  "Machine Learning": {
    defaultSkills: ["Data Prep", "Model Training", "PyTorch/TensorFlow"],
    difficulty: "High",
    demand: "Very High",
    portfolioImpact: "High",
    interviewImpact: "High",
    defaultReason: "Deep mathematical understanding of machine learning algorithms underpins predictive capabilities and intelligence products."
  },
  "LLMs": {
    defaultSkills: ["Large Language Models", "Prompt Engineering", "Fine-Tuning"],
    difficulty: "Medium",
    demand: "Very High",
    portfolioImpact: "High",
    interviewImpact: "High",
    defaultReason: "Utilizing model prompts and orchestrating LLMs drives modern agentic frameworks and generative systems."
  },
  "RAG": {
    defaultSkills: ["Retrieval-Augmented Generation", "Vector Databases", "Embeddings"],
    difficulty: "High",
    demand: "Very High",
    portfolioImpact: "High",
    interviewImpact: "High",
    defaultReason: "Integrating vector semantic indexing structures directly optimizes knowledge grounding for enterprise intelligent models."
  },
  "LangChain": {
    defaultSkills: ["LangChain/LlamaIndex", "AI Agents", "Agent Workflows"],
    difficulty: "Medium",
    demand: "Very High",
    portfolioImpact: "High",
    interviewImpact: "Medium",
    defaultReason: "Orchestration frameworks empower engineers to build composite stateful agents with structured memory and tools."
  },
  "Databases": {
    defaultSkills: ["SQL/NoSQL", "Database Optimization", "Data Modeling"],
    difficulty: "Medium",
    demand: "High",
    portfolioImpact: "Medium",
    interviewImpact: "High",
    defaultReason: "Efficient query engineering and proper relational schema indexing prevents downstream application bottlenecks."
  },
  "System Design": {
    defaultSkills: ["Microservices", "Scalability", "System Architecture", "Caching"],
    difficulty: "High",
    demand: "Very High",
    portfolioImpact: "Low",
    interviewImpact: "Very High",
    defaultReason: "Mastering system design concepts enables senior microservice scalability architecture analysis and clean technical system growth."
  },
  "Data Structures": {
    defaultSkills: ["DSA Concepts", "Algorithms", "LeetCode Solutions"],
    difficulty: "High",
    demand: "High",
    portfolioImpact: "Low",
    interviewImpact: "Very High",
    defaultReason: "Data structure mastery directly drives performance in algorithmic interviews at leading technology teams."
  },
  "Cybersecurity": {
    defaultSkills: ["Security Protocols", "Penetration Testing", "Vulnerability Fixes"],
    difficulty: "High",
    demand: "High",
    portfolioImpact: "Low",
    interviewImpact: "Medium",
    defaultReason: "Secure software practices protect customer pipelines, database leaks, and distributed exploit attempts."
  },
  "Mobile Development": {
    defaultSkills: ["React Native/Flutter", "iOS/Android build", "Mobile UX"],
    difficulty: "Medium",
    demand: "High",
    portfolioImpact: "High",
    interviewImpact: "Medium",
    defaultReason: "Cross-platform mobile environments target massive user ecosystems directly from a single compiled codebase."
  },
  "Projects": {
    defaultSkills: ["Full-Stack App", "Product Execution", "MVP Delivery"],
    difficulty: "High",
    demand: "Very High",
    portfolioImpact: "Very High",
    interviewImpact: "Medium",
    defaultReason: "Shipping real end-to-end applications displays execution capability, architecture choices, and product instinct."
  },
  "Open Source": {
    defaultSkills: ["Git Collaboration", "Code Reviews", "Open Source Contribution"],
    difficulty: "High",
    demand: "High",
    portfolioImpact: "High",
    interviewImpact: "Medium",
    defaultReason: "Contributing to established repos highlights collaboration skills, clean code habits, and code review compliance."
  },
  "Research": {
    defaultSkills: ["Academic Writing", "ML Research", "Literature Review"],
    difficulty: "High",
    demand: "Medium",
    portfolioImpact: "Medium",
    interviewImpact: "Low",
    defaultReason: "Conducting structured research keeps you ahead of industry curves and is highly valuable for advanced research labs."
  },
  "Internships": {
    defaultSkills: ["Production Code", "Agile Workflows", "Corporate Structure"],
    difficulty: "High",
    demand: "Very High",
    portfolioImpact: "Very High",
    interviewImpact: "High",
    defaultReason: "Professional industry experience demonstrates high adaptability, production workflows, and professional output."
  },
  "Certifications": {
    defaultSkills: ["Domain Validation", "Technical Credentials"],
    difficulty: "Medium",
    demand: "Medium",
    portfolioImpact: "Low",
    interviewImpact: "Low",
    defaultReason: "Industry certifications validate structured learning paths and verify platform skills to corporate HR systems."
  },
  "Leadership": {
    defaultSkills: ["Mentorship", "Team Management", "Agile Leadership"],
    difficulty: "Medium",
    demand: "High",
    portfolioImpact: "Low",
    interviewImpact: "High",
    defaultReason: "Demonstrated leadership indicates strong soft skill alignments and senior engineering path preparation."
  },
  "Communication": {
    defaultSkills: ["Technical Writing", "Presentations", "Client Interaction"],
    difficulty: "Low",
    demand: "High",
    portfolioImpact: "Low",
    interviewImpact: "High",
    defaultReason: "Clear articulation of architecture details aligns product requirements and technical teams efficiently."
  },
  "Networking": {
    defaultSkills: ["Professional Branding", "Industry Referrals", "Community Build"],
    difficulty: "Medium",
    demand: "Medium",
    portfolioImpact: "Low",
    interviewImpact: "Low",
    defaultReason: "Active developer community engagement unlocks direct referrals and collaborative side-projects."
  },
  "Career Planning": {
    defaultSkills: ["Goal Settings", "Resume Optimization", "Mock Interviews"],
    difficulty: "Low",
    demand: "High",
    portfolioImpact: "Low",
    interviewImpact: "High",
    defaultReason: "Structured career prep directly prepares you to convert opportunities from resume submission to active offers."
  },
  "Soft Skills": {
    defaultSkills: ["Empathy", "Time Management", "Collaboration"],
    difficulty: "Low",
    demand: "High",
    portfolioImpact: "Low",
    interviewImpact: "High",
    defaultReason: "Interpersonal adaptability ensures high retention rates and smooth integration inside fast-moving teams."
  },
  "Finance": {
    defaultSkills: ["Budgeting", "Quantitative Models"],
    difficulty: "Medium",
    demand: "Low",
    portfolioImpact: "Low",
    interviewImpact: "Low",
    defaultReason: "Financial intelligence aids in business operations but does not directly influence software code quality."
  },
  "Business": {
    defaultSkills: ["Product Market Fit", "SaaS Strategy"],
    difficulty: "Medium",
    demand: "Medium",
    portfolioImpact: "Medium",
    interviewImpact: "Low",
    defaultReason: "Understanding product-market fit assists engineers in prioritizing features during early product ideation."
  },
  "Lifestyle": {
    defaultSkills: [],
    difficulty: "Low",
    demand: "None",
    portfolioImpact: "None",
    interviewImpact: "None",
    defaultReason: "Personal lifestyle activities are excellent for balance but do not directly impact technical career readiness."
  },
  "Entertainment": {
    defaultSkills: [],
    difficulty: "Low",
    demand: "None",
    portfolioImpact: "None",
    interviewImpact: "None",
    defaultReason: "Recreational entertainment keeps focus fresh but carries no professional engineering weight."
  },
  "Non-technical Hobby": {
    defaultSkills: [],
    difficulty: "Low",
    demand: "None",
    portfolioImpact: "None",
    interviewImpact: "None",
    defaultReason: "Hobby projects represent excellent personal growth but are outside software engineering parameters."
  },
  "Unknown": {
    defaultSkills: ["Domain Exploration"],
    difficulty: "Medium",
    demand: "Low",
    portfolioImpact: "Low",
    interviewImpact: "Low",
    defaultReason: "Exploration activity builds miscellaneous competencies."
  }
};

// Map role -> category -> relevance (0 to 10)
export const ROLE_RELEVANCE_MAP: Record<string, Record<string, number>> = {
  "AI Engineer": {
    "Artificial Intelligence": 10,
    "Machine Learning": 10,
    "LLMs": 10,
    "RAG": 10,
    "LangChain": 10,
    "DevOps": 8,
    "Cloud Computing": 8,
    "Programming Language": 8,
    "Databases": 8,
    "System Design": 8,
    "Projects": 8,
    "Open Source": 8,
    "Research": 8,
    "Internships": 8,
    "Data Structures": 6,
    "Certifications": 6,
    "Leadership": 6,
    "Communication": 6,
    "Career Planning": 6,
    "Soft Skills": 6,
    "Frontend": 4,
    "Mobile Development": 4,
    "Cybersecurity": 4,
    "Business": 3,
    "Finance": 2,
  },
  "Frontend Engineer": {
    "Frontend": 10,
    "Programming Language": 9,
    "Projects": 9,
    "Open Source": 8,
    "Internships": 8,
    "Mobile Development": 7,
    "System Design": 6,
    "Data Structures": 6,
    "Soft Skills": 6,
    "Communication": 6,
    "Databases": 5,
    "DevOps": 4,
    "Cloud Computing": 4,
    "LLMs": 4,
    "RAG": 3,
    "LangChain": 3,
    "Machine Learning": 2,
    "Artificial Intelligence": 2,
    "Certifications": 4,
    "Cybersecurity": 3,
    "Business": 3,
    "Finance": 1,
  },
  "Backend Engineer": {
    "Backend": 10,
    "Databases": 10,
    "System Design": 10,
    "Programming Language": 9,
    "DevOps": 9,
    "Cloud Computing": 9,
    "Projects": 8,
    "Open Source": 8,
    "Internships": 8,
    "Cybersecurity": 7,
    "Data Structures": 7,
    "LLMs": 6,
    "RAG": 6,
    "LangChain": 6,
    "Communication": 6,
    "Soft Skills": 6,
    "Frontend": 4,
    "Machine Learning": 4,
    "Artificial Intelligence": 4,
    "Mobile Development": 3,
    "Business": 2,
    "Finance": 1,
  },
  "Fullstack Engineer": {
    "Frontend": 9,
    "Backend": 9,
    "Databases": 9,
    "Programming Language": 9,
    "Projects": 10,
    "Open Source": 8,
    "Internships": 8,
    "Cloud Computing": 8,
    "DevOps": 8,
    "System Design": 8,
    "LLMs": 6,
    "RAG": 5,
    "LangChain": 5,
    "Data Structures": 6,
    "Cybersecurity": 5,
    "Communication": 6,
    "Soft Skills": 6,
    "Machine Learning": 3,
    "Artificial Intelligence": 4,
    "Mobile Development": 5,
    "Business": 3,
    "Finance": 1,
  },
  "Data Scientist": {
    "Machine Learning": 10,
    "Artificial Intelligence": 9,
    "Programming Language": 9,
    "Databases": 9,
    "Research": 8,
    "Projects": 8,
    "Internships": 8,
    "LLMs": 7,
    "RAG": 6,
    "System Design": 5,
    "Data Structures": 6,
    "Cloud Computing": 6,
    "DevOps": 5,
    "Communication": 7,
    "Soft Skills": 6,
    "Frontend": 2,
    "Mobile Development": 1,
    "Cybersecurity": 2,
    "Business": 4,
    "Finance": 3,
  }
};

// Keyword mapping arrays for Layer 1 & Layer 2 subject matching
export const KEYWORD_RULES: Array<{
  keywords: string[];
  category: string;
  skills: string[];
}> = [
  {
    keywords: ["docker", "kubernetes", "k8s", "container", "containers", "orchestration"],
    category: "DevOps",
    skills: ["Docker", "Containerization", "Kubernetes", "Orchestration"]
  },
  {
    keywords: ["aws", "azure", "gcp", "lambda", "serverless", "cloud", "s3", "ec2"],
    category: "Cloud Computing",
    skills: ["AWS", "Cloud Infrastructure", "Scalability"]
  },
  {
    keywords: ["react", "nextjs", "next.js", "vue", "angular", "svelte", "tailwind", "css", "html", "figma"],
    category: "Frontend",
    skills: ["React", "UI Components", "CSS", "Frontend Architecture"]
  },
  {
    keywords: ["langchain", "llama_index", "llamaindex", "agentic", "agent", "agents"],
    category: "LangChain",
    skills: ["LangChain", "AI Agents", "Agentic Orchestration"]
  },
  {
    keywords: ["rag", "vector db", "vector database", "embeddings", "pinecone", "chromadb", "milvus", "qdrant"],
    category: "RAG",
    skills: ["RAG", "Vector Databases", "Semantic Search"]
  },
  {
    keywords: ["llm", "llms", "gpt", "openai", "claude", "gemini", "llama", "prompt", "prompting", "fine-tuning"],
    category: "LLMs",
    skills: ["LLMs", "Prompt Engineering", "Model APIs"]
  },
  {
    keywords: ["pytorch", "tensorflow", "keras", "scikit-learn", "scikit", "numpy", "pandas", "dataset", "datasets", "training", "model training"],
    category: "Machine Learning",
    skills: ["Machine Learning", "Model Training", "Data Pipelines"]
  },
  {
    keywords: ["machine learning", "deep learning", "ai", "artificial intelligence", "neural network", "neural networks"],
    category: "Artificial Intelligence",
    skills: ["AI Foundations", "Applied AI Integration"]
  },
  {
    keywords: ["system design", "architecture", "microservices", "load balancer", "caching", "scalability", "redis", "kafka", "rabbitmq"],
    category: "System Design",
    skills: ["System Design", "Microservices", "Scalability"]
  },
  {
    keywords: ["dsa", "leetcode", "algorithms", "data structures", "hackerrank", "binary tree", "sorting", "graph"],
    category: "Data Structures",
    skills: ["DSA Concepts", "Problem Solving", "Complexity Analysis"]
  },
  {
    keywords: ["sql", "postgres", "postgresql", "mysql", "mongodb", "database", "databases", "nosql", "prisma", "query", "queries"],
    category: "Databases",
    skills: ["SQL Querying", "Database Schema Design", "Index Optimization"]
  },
  {
    keywords: ["security", "cybersecurity", "hack", "penetration", "auth", "oauth", "jwt", "ssl", "tls", "encryption"],
    category: "Cybersecurity",
    skills: ["Web Security", "Auth Protocols", "Encryption Standards"]
  },
  {
    keywords: ["mobile", "android", "ios", "react native", "flutter", "swift", "kotlin", "app store"],
    category: "Mobile Development",
    skills: ["Mobile UI", "React Native/Flutter", "App Deployment"]
  },
  {
    keywords: ["open source", "contribution", "github contribution", "pr", "pull request", "contributor"],
    category: "Open Source",
    skills: ["Git Workflow", "Code Reviews", "Collaborative Development"]
  },
  {
    keywords: ["research paper", "arxiv", "academic", "thesis", "research project"],
    category: "Research",
    skills: ["Academic Research", "Technical Writing"]
  },
  {
    keywords: ["internship", "intern", "junior developer job", "coop", "co-op"],
    category: "Internships",
    skills: ["Corporate Workflows", "Production Code Delivery"]
  },
  {
    keywords: ["certification", "cert", "aws certified", "diploma", "credentials"],
    category: "Certifications",
    skills: ["Structured Domain Knowledge", "Credential Validation"]
  },
  {
    keywords: ["python", "javascript", "typescript", "rust", "go", "golang", "c++", "java", "ruby", "c#"],
    category: "Programming Language",
    skills: ["Programming Language Fluency", "Syntax Standards"]
  },
  {
    keywords: ["saas", "project", "build a website", "app", "application", "startup", "mvp"],
    category: "Projects",
    skills: ["Full-Stack App", "Product Execution", "MVP Delivery"]
  },
  {
    keywords: ["lead", "manage", "leadership", "mentor", "scrum master", "scrum"],
    category: "Leadership",
    skills: ["Technical Leadership", "Agile Project Flow"]
  },
  {
    keywords: ["communicate", "write document", "present", "talk", "speaking", "technical writing"],
    category: "Communication",
    skills: ["Technical Communication", "Presentations"]
  },
  {
    keywords: ["meetup", "conference", "network", "devpost", "referral", "referrals"],
    category: "Networking",
    skills: ["Developer Networking", "Referral Pipelines"]
  },
  {
    keywords: ["resume", "interview prep", "mock interview", "portfolio site", "optimize resume"],
    category: "Career Planning",
    skills: ["Interview Prep", "Resume Engineering"]
  },
  {
    keywords: ["cooking", "cook", "food", "recipe", "baking", "pizza"],
    category: "Lifestyle",
    skills: []
  },
  {
    keywords: ["dance", "dancing", "music", "singing", "guitar", "piano"],
    category: "Lifestyle",
    skills: []
  },
  {
    keywords: ["swim", "swimming", "run", "running", "gym", "fitness", "yoga", "cricket", "football", "chess"],
    category: "Lifestyle",
    skills: []
  },
  {
    keywords: ["netflix", "movies", "movie", "youtube", "anime", "gaming", "play games", "game"],
    category: "Entertainment",
    skills: []
  },
  {
    keywords: ["iphone", "macbook", "buy laptop", "shop", "shopping", "clothes", "car"],
    category: "Non-technical Hobby",
    skills: []
  }
];

// List of action verb keywords to help Layer 1 parse intent
export const ACTION_VERBS = [
  "build",
  "create",
  "implement",
  "develop",
  "code",
  "ship",
  "launch",
  "publish",
  "win",
  "solve",
  "write",
  "contribute",
  "learn",
  "study",
  "master",
  "practice",
  "prepare",
  "complete",
  "watch",
  "read",
  "review",
  "explore",
  "try",
  "understand",
  "buy",
  "get",
  "upgrade",
  "switch"
];

// ----------------------------------------------------
// Predictive Reasoning Logic
// ----------------------------------------------------

/**
 * Predicts the career readiness impact of a user simulation query based on target career alignment,
 * dynamic scoring mechanics, diminishing returns, and anti-exploit rules.
 * Exposed through a single interface, making it easily mockable or replaceable by a live LLM endpoint later.
 */
export function predictCareerImpact(
  query: string,
  profile: UserProfile
): PredictionResult {
  const normQuery = query.toLowerCase().trim();

  // --- LAYER 1: Intent Extraction ---
  let detectedVerb = "explore";
  for (const verb of ACTION_VERBS) {
    if (new RegExp(`\\b${verb}\\b`, "i").test(normQuery)) {
      detectedVerb = verb;
      break;
    }
  }

  // --- LAYER 2: Knowledge Mapping ---
  let matchedCategory = "Unknown";
  let matchedSkills: string[] = [];

  for (const rule of KEYWORD_RULES) {
    const hasMatch = rule.keywords.some((kw) =>
      new RegExp(`\\b${kw}\\b`, "i").test(normQuery)
    );
    if (hasMatch) {
      matchedCategory = rule.category;
      matchedSkills = rule.skills;
      break;
    }
  }

  const categoryMeta = CATEGORY_METADATA[matchedCategory] || CATEGORY_METADATA["Unknown"];

  // --- LAYER 3: Reasoning & Scoring Engine ---
  const normalizedTargetRole = profile.targetRole || "AI Engineer";
  
  // Calculate role alignment weight
  const roleRelevanceTable =
    ROLE_RELEVANCE_MAP[normalizedTargetRole] ||
    ROLE_RELEVANCE_MAP["AI Engineer"];
  
  const relevanceScore =
    roleRelevanceTable[matchedCategory] !== undefined
      ? roleRelevanceTable[matchedCategory]
      : 5; // Default score of 5 for unknown/unspecified combinations

  // Determine relevance text
  let roleAlignmentText = "None";
  let relevanceMultiplier = 0.0;

  if (relevanceScore >= 9) {
    roleAlignmentText = "Very High";
    relevanceMultiplier = 1.0;
  } else if (relevanceScore >= 7) {
    roleAlignmentText = "High";
    relevanceMultiplier = 0.8;
  } else if (relevanceScore >= 5) {
    roleAlignmentText = "Medium";
    relevanceMultiplier = 0.6;
  } else if (relevanceScore >= 3) {
    roleAlignmentText = "Low";
    relevanceMultiplier = 0.3;
  } else {
    roleAlignmentText = "None";
    relevanceMultiplier = 0.0;
  }

  // Verb effort multiplier
  const effortMultiplier =
    VERB_EFFORT_MAP[detectedVerb] !== undefined
      ? VERB_EFFORT_MAP[detectedVerb]
      : 0.5;

  // Check if non-career lifestyle/entertainment
  const isOffTopic =
    matchedCategory === "Lifestyle" ||
    matchedCategory === "Entertainment" ||
    matchedCategory === "Non-technical Hobby";

  // Base Category Max Impact
  let baseCategoryMax = 10;
  if (["Projects", "System Design", "LLMs", "RAG", "LangChain", "Machine Learning", "Artificial Intelligence"].includes(matchedCategory)) {
    baseCategoryMax = 15;
  } else if (["Soft Skills", "Certifications", "Leadership", "Communication", "Networking"].includes(matchedCategory)) {
    baseCategoryMax = 6;
  }

  // Calculate dynamic readiness improvement
  let rawChange = 0;
  if (!isOffTopic && matchedCategory !== "Unknown") {
    rawChange = baseCategoryMax * relevanceMultiplier * effortMultiplier;
  } else if (matchedCategory === "Unknown") {
    rawChange = 2.0 * effortMultiplier;
  }

  // Anti-Exploit Layer: Duplicate detection
  let isDuplicate = false;
  let dupCount = 0;
  for (const hist of profile.history) {
    if (hist.action.toLowerCase().trim() === normQuery) {
      isDuplicate = true;
      dupCount++;
    }
  }

  let exploitMultiplier = 1.0;
  if (isDuplicate) {
    exploitMultiplier = dupCount === 1 ? 0.2 : 0.0;
  }

  // Anti-Exploit Layer: Similarity limit (diminishing return on repeating same category)
  let categoryHistoryCount = 0;
  const maxRecentToCheck = 4;
  const recentHistory = profile.history.slice(0, maxRecentToCheck);
  for (const hist of recentHistory) {
    if (hist.category === matchedCategory) {
      categoryHistoryCount++;
    }
  }

  let categoryScaleFactor = 1.0;
  if (categoryHistoryCount > 0) {
    categoryScaleFactor = Math.max(0.3, 1.0 - (categoryHistoryCount * 0.25));
  }

  // Apply Diminishing Returns based on current score
  const current = profile.currentReadiness;
  const gapToMax = 100 - current;
  const progressScale = gapToMax / 100.0; // scales down as current moves closer to 100%

  let finalIncrease = Math.round(
    rawChange * exploitMultiplier * categoryScaleFactor * progressScale
  );

  // Safeguard bounds
  if (current + finalIncrease > 100) {
    finalIncrease = 100 - current;
  }
  if (finalIncrease < 0) {
    finalIncrease = 0;
  }

  // Force absolute zero for pure off-topic queries
  if (isOffTopic) {
    finalIncrease = 0;
  }

  // Formulate natural-language reasoning explanation
  let generatedExplanation = "";
  if (isOffTopic) {
    generatedExplanation = `This activity ("${query}") may be personally valuable, but it is not expected to significantly improve career readiness for your target role of ${normalizedTargetRole}. To boost your scores, focus on technical capabilities, project shipping, or interview preparations.`;
  } else if (isDuplicate) {
    generatedExplanation = `You have already simulated this specific scenario recently. Running identical exercises has zero additional return on career readiness. Experiment with new subjects or projects to explore different milestones.`;
  } else if (categoryHistoryCount >= 2) {
    generatedExplanation = `Your AI Twin notices heavy focus on ${matchedCategory} recently. While this building block is valuable, you are experiencing diminishing returns. We recommend diversifying into your remaining development gaps to maintain a balanced profile.`;
  } else if (matchedCategory === "Unknown") {
    generatedExplanation = `Exploring "${query}" builds secondary general competencies. However, it lacks direct alignment with the core requirements of a ${normalizedTargetRole}. Focus on core domain tools to accelerate your progress.`;
  } else {
    // Standard contextual advice
    const importanceAdvice = categoryMeta.defaultReason;
    const actionVerbAdvice =
      effortMultiplier >= 0.9
        ? "Taking direct hands-on project ownership is the fastest way to build technical authority."
        : "Acquiring structured knowledge creates a strong foundation, though building an operational application next will yield higher impact.";

    generatedExplanation = `Your AI Twin predicts that committing to this scenario strengthens your target capabilities. ${importanceAdvice} ${actionVerbAdvice}`;
  }

  // Derive Confidence details
  let confidenceLevel = "Medium";
  let confidenceReason = "Derived from general software engineering industry benchmarks.";

  if (isOffTopic) {
    confidenceLevel = "High";
    confidenceReason = "Verified against absolute non-technical career exclusion parameters.";
  } else if (relevanceScore >= 8 && effortMultiplier >= 0.8) {
    confidenceLevel = "High";
    confidenceReason = "Calibrated directly against core technology stacks and project requirements matching the target role.";
  } else if (relevanceScore <= 4) {
    confidenceLevel = "Medium";
    confidenceReason = "Estimated from secondary supporting roles and indirect alignments.";
  }

  // Return standard prediction structure
  return {
    action: query,
    category: matchedCategory,
    targetRoleAlignment: roleAlignmentText,
    affectedSkills: matchedSkills.length > 0 ? matchedSkills : categoryMeta.defaultSkills,
    estimatedDifficulty: categoryMeta.difficulty,
    portfolioImpact: categoryMeta.portfolioImpact,
    interviewImpact: categoryMeta.interviewImpact,
    industryDemand: categoryMeta.demand,
    confidence: confidenceLevel,
    confidenceReason: confidenceReason,
    readinessChange: finalIncrease,
    explanation: generatedExplanation,
    increase: finalIncrease,
    desc: generatedExplanation,
    current: current,
    projected: current + finalIncrease
  };
}
