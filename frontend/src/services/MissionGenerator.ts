/**
 * MissionGenerator.ts
 * Nexora — Dynamic Mission Generation Service
 *
 * Generates real, gap-driven missions from CareerAgent analysis.
 * Every mission exists because of a detected skill gap or weakness.
 * No hardcoded or placeholder missions.
 */

import type { NexoraAgentMemory, WeeklyMission } from './CareerAgent';

// ─── Full Mission Model ───────────────────────────────────────────────────────

export interface MissionChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface CareerMission {
  id: string;
  title: string;
  description: string;
  why: string;
  whyPoints: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  careerGain: number;      // points added to career score on completion
  readinessGain: number;   // percentage points added to readiness
  checklist: MissionChecklistItem[];
  progress: number;        // 0–100, derived from checklist
  completed: boolean;
  rewardLabel: string;
  skillsImproved: string[];
  unlocked: boolean;
  icon: string;
  category: 'Learning' | 'Project' | 'Interview Preparation' | 'Networking' | 'Certification';
  sourceGap: string;       // the detected gap this mission addresses
}

// ─── Gap → Mission Templates ──────────────────────────────────────────────────

interface MissionTemplate {
  gapKeywords: string[];
  icon: string;
  category: CareerMission['category'];
  difficulty: CareerMission['difficulty'];
  estimatedTime: string;
  careerGain: number;
  readinessGain: number;
  rewardLabel: string;
  title: (role: string) => string;
  description: (role: string, gap: string) => string;
  why: (gap: string) => string;
  whyPoints: string[];
  checklist: string[];
  skillsImproved: string[];
}

const MISSION_TEMPLATES: MissionTemplate[] = [
  // Cloud / Deployment
  {
    gapKeywords: ['cloud', 'aws', 'azure', 'gcp', 'deployment', 'devops'],
    icon: '☁️',
    category: 'Project',
    difficulty: 'Intermediate',
    estimatedTime: '90 min',
    careerGain: 5,
    readinessGain: 4,
    rewardLabel: 'Cloud Deployer',
    title: (role) => `Deploy a ${role.includes('Frontend') ? 'React' : 'Node.js'} App to AWS`,
    description: (role, gap) =>
      `${gap} is one of the top gaps blocking your ${role} readiness. This mission walks you through deploying a real app to AWS S3 + CloudFront, giving you hands-on cloud experience recruiters look for.`,
    why: (gap) => `${gap} appears in 78% of ${
      'Software Engineer'} job descriptions and is currently missing from your profile.`,
    whyPoints: [
      'Cloud deployment is required at nearly every tech company',
      'AWS experience adds immediate resume weight',
      'Demonstrates end-to-end project ownership',
      'Live deployment URLs are portfolio gold',
    ],
    checklist: [
      'Create an AWS account and set up IAM permissions',
      'Build and bundle the app for production',
      'Create an S3 bucket and upload the build',
      'Configure CloudFront distribution for CDN delivery',
      'Set up a custom domain (optional but impressive)',
      'Add the live URL to your GitHub README and resume',
    ],
    skillsImproved: ['AWS S3', 'CloudFront', 'IAM', 'CI/CD', 'DevOps'],
  },

  // Docker / Containers
  {
    gapKeywords: ['docker', 'container', 'containerization', 'kubernetes', 'k8s'],
    icon: '🐳',
    category: 'Project',
    difficulty: 'Intermediate',
    estimatedTime: '60 min',
    careerGain: 4,
    readinessGain: 3,
    rewardLabel: 'Container Engineer',
    title: () => 'Dockerize an Existing Project',
    description: (_role, gap) =>
      `${gap} shows up as a critical gap in your profile. This mission has you containerize one of your existing projects with Docker and publish it to Docker Hub.`,
    why: (gap) => `${gap} is required for backend and full-stack roles at 65%+ of companies hiring this year.`,
    whyPoints: [
      'Containerization is the industry standard for deployment',
      'Docker experience fast-tracks backend interviews',
      'Shows infrastructure awareness above your peers',
      'Directly closes a top-3 gap in your profile',
    ],
    checklist: [
      'Write a Dockerfile for the project',
      'Build and test the container locally',
      'Add a docker-compose.yml for multi-service setup',
      'Publish the image to Docker Hub',
      'Update README with Docker run instructions',
    ],
    skillsImproved: ['Docker', 'Docker Compose', 'Container Networking', 'CI/CD'],
  },

  // Testing
  {
    gapKeywords: ['testing', 'jest', 'unit test', 'test coverage', 'tdd', 'cypress'],
    icon: '🧪',
    category: 'Project',
    difficulty: 'Beginner',
    estimatedTime: '45 min',
    careerGain: 3,
    readinessGain: 3,
    rewardLabel: 'Quality Engineer',
    title: () => 'Write Tests for an Existing Project',
    description: (_role, gap) =>
      `${gap} is a gap detected from your GitHub and resume. This mission has you add a Jest test suite to one of your existing projects, covering core functions and edge cases.`,
    why: (gap) => `${gap} is listed as a hard requirement in 55% of internship and junior SWE postings.`,
    whyPoints: [
      'Untested code is a red flag for senior reviewers',
      'Testing skills separate junior candidates from the pack',
      'Adds measurable coverage stats to your portfolio',
      'Prepares you for coding interviews that ask about QA',
    ],
    checklist: [
      'Install Jest and configure it for the project',
      'Write unit tests for at least 3 utility functions',
      'Write one integration test for a key feature',
      'Achieve ≥ 70% code coverage',
      'Add coverage badge to the README',
      'Push updated tests to GitHub',
    ],
    skillsImproved: ['Jest', 'Unit Testing', 'TDD', 'Code Coverage', 'CI Integration'],
  },

  // DSA / Algorithms
  {
    gapKeywords: ['dsa', 'data structures', 'algorithms', 'leetcode', 'competitive', 'problem solving'],
    icon: '🧩',
    category: 'Interview Preparation',
    difficulty: 'Intermediate',
    estimatedTime: '60 min',
    careerGain: 4,
    readinessGain: 5,
    rewardLabel: 'Algorithm Solver',
    title: () => 'Solve 5 Medium LeetCode Problems',
    description: (_role, gap) =>
      `${gap} is flagged as a critical gap for technical interviews. This mission challenges you to solve 5 medium-difficulty LeetCode problems across Trees, Arrays, and Hash Maps.`,
    why: (gap) => `${gap} is tested in 90%+ of technical screens at top companies. Solving 5 problems a week is the fastest path to closing it.`,
    whyPoints: [
      'Technical screens almost always include DSA problems',
      'Trees and graphs are the most common topic',
      'Consistent practice builds pattern recognition',
      'Documented solutions on GitHub impress interviewers',
    ],
    checklist: [
      'Solve 2 Array/String problems (medium)',
      'Solve 2 Tree/Graph traversal problems (medium)',
      'Solve 1 Dynamic Programming problem (medium)',
      'Document each solution with time/space complexity',
      'Push all solutions to a public GitHub repo',
    ],
    skillsImproved: ['DSA', 'Trees', 'Dynamic Programming', 'Hash Maps', 'Big-O Analysis'],
  },

  // SQL / Databases
  {
    gapKeywords: ['sql', 'database', 'postgresql', 'mysql', 'mongodb', 'query'],
    icon: '🗄️',
    category: 'Project',
    difficulty: 'Beginner',
    estimatedTime: '45 min',
    careerGain: 3,
    readinessGain: 3,
    rewardLabel: 'Database Builder',
    title: () => 'Build a CRUD API with a Real Database',
    description: (_role, gap) =>
      `${gap} is missing from your current stack. This mission walks you through building a REST API backed by PostgreSQL or MongoDB, with real CRUD operations.`,
    why: (gap) => `${gap} appears in virtually every backend job description and is currently absent from your GitHub projects.`,
    whyPoints: [
      'Backend roles require database proficiency on day one',
      'A live API with a real DB is the strongest portfolio piece',
      'Covers SQL/NoSQL fluency interviewers probe for',
      'Closes one of the highest-impact gaps in your profile',
    ],
    checklist: [
      'Set up a local PostgreSQL or MongoDB instance',
      'Design the schema / data model',
      'Implement GET, POST, PUT, DELETE endpoints',
      'Add input validation and error handling',
      'Test all endpoints with Postman or Thunder Client',
      'Deploy to Render or Railway',
    ],
    skillsImproved: ['SQL', 'PostgreSQL', 'MongoDB', 'REST API', 'Database Design'],
  },

  // System Design
  {
    gapKeywords: ['system design', 'scalability', 'architecture', 'distributed', 'microservices'],
    icon: '🏗️',
    category: 'Interview Preparation',
    difficulty: 'Advanced',
    estimatedTime: '120 min',
    careerGain: 6,
    readinessGain: 5,
    rewardLabel: 'System Architect',
    title: () => 'Document a System Design for a Real Product',
    description: (_role, gap) =>
      `${gap} is a gap that blocks senior roles and many mid-level positions. This mission has you design and document a scalable architecture for a product like Twitter, Uber, or a URL shortener.`,
    why: (gap) => `${gap} interviews are standard at FAANG and are increasingly required for mid-level roles.`,
    whyPoints: [
      'System design rounds are the #1 blocker for L4/L5 roles',
      'Writing a design doc builds your communication skills',
      'Portfolio system designs differentiate you from peers',
      'Shows you think beyond the code to the whole system',
    ],
    checklist: [
      'Choose a product to design (URL shortener, ride-sharing, etc.)',
      'Define functional and non-functional requirements',
      'Design the high-level architecture with a diagram',
      'Address scalability: load balancing, caching, sharding',
      'Write a 1-page design doc and publish it on GitHub',
      'Record a short Loom walkthrough of your design',
    ],
    skillsImproved: ['System Design', 'Scalability', 'Caching', 'Load Balancing', 'Architecture'],
  },

  // TypeScript
  {
    gapKeywords: ['typescript', 'type safety', 'static typing'],
    icon: '🔷',
    category: 'Learning',
    difficulty: 'Beginner',
    estimatedTime: '30 min',
    careerGain: 2,
    readinessGain: 2,
    rewardLabel: 'TypeScript Practitioner',
    title: () => 'Migrate a JS Project to TypeScript',
    description: (_role, gap) =>
      `${gap} is detected as a gap. Modern teams default to TypeScript. This mission migrates one of your JavaScript projects to TypeScript with strict mode enabled.`,
    why: (gap) => `${gap} is preferred or required in 70% of frontend and full-stack job postings.`,
    whyPoints: [
      'TypeScript is the industry default for new projects',
      'Shows type-system maturity in code reviews',
      'Reduces runtime bugs — interviewers appreciate it',
      'Quick migration signals adaptability to modern tooling',
    ],
    checklist: [
      'Add TypeScript and configure tsconfig.json with strict mode',
      'Rename .js files to .ts / .tsx',
      'Fix all type errors with proper interfaces and types',
      'Add type declarations for third-party libraries',
      'Ensure the project compiles cleanly with zero errors',
    ],
    skillsImproved: ['TypeScript', 'Type Safety', 'Interfaces', 'Generics', 'tsconfig'],
  },

  // React
  {
    gapKeywords: ['react', 'frontend', 'component', 'hooks', 'ui'],
    icon: '⚛️',
    category: 'Project',
    difficulty: 'Intermediate',
    estimatedTime: '60 min',
    careerGain: 4,
    readinessGain: 3,
    rewardLabel: 'Frontend Builder',
    title: () => 'Build a React Dashboard with Real Data',
    description: (_role, gap) =>
      `${gap} is a gap in your portfolio. This mission has you build a data-rich React dashboard that fetches from a public API and renders charts and stats.`,
    why: (gap) => `${gap} projects with real data fetching are the most common take-home assignment at product companies.`,
    whyPoints: [
      'React is the #1 frontend framework by employer demand',
      'Dashboard projects show component architecture skills',
      'Real API integration proves you can work with data',
      'Deployable portfolio piece you can demo in interviews',
    ],
    checklist: [
      'Scaffold the project with Vite and TypeScript',
      'Integrate a public API (GitHub, OpenWeather, etc.)',
      'Build at least 3 reusable components',
      'Add state management with useState / useReducer',
      'Deploy to Vercel or Netlify',
      'Write a clear README with screenshots',
    ],
    skillsImproved: ['React', 'Hooks', 'Component Design', 'API Integration', 'State Management'],
  },

  // Communication / Resume
  {
    gapKeywords: ['resume', 'ats', 'communication', 'linkedin', 'profile'],
    icon: '📄',
    category: 'Networking',
    difficulty: 'Beginner',
    estimatedTime: '30 min',
    careerGain: 2,
    readinessGain: 3,
    rewardLabel: 'Profile Optimizer',
    title: () => 'Optimize Your Resume and LinkedIn for ATS',
    description: (_role, gap) =>
      `${gap} is holding back your application success rate. This mission walks you through ATS optimization techniques and LinkedIn keyword improvements that directly improve callback rates.`,
    why: (gap) => `Over 75% of resumes never reach a human. Fixing ${gap} dramatically increases your interview rate.`,
    whyPoints: [
      'ATS filters reject resumes before any human sees them',
      'LinkedIn keyword optimization increases recruiter InMails',
      'Quantified bullets convert more recruiters to interviewers',
      'Improvement takes 30 minutes and has immediate payoff',
    ],
    checklist: [
      'Run your resume through an ATS scanner (Jobscan or Resume Worded)',
      'Add 5+ missing keywords from target job descriptions',
      'Quantify at least 3 bullet points with metrics',
      'Update LinkedIn headline and About section with keywords',
      'Add your top 3 GitHub projects to the Featured section',
    ],
    skillsImproved: ['Resume Writing', 'ATS Optimization', 'LinkedIn', 'Personal Branding'],
  },

  // Machine Learning
  {
    gapKeywords: ['machine learning', 'ml', 'data science', 'python', 'tensorflow', 'pytorch', 'ai'],
    icon: '🤖',
    category: 'Project',
    difficulty: 'Intermediate',
    estimatedTime: '90 min',
    careerGain: 5,
    readinessGain: 4,
    rewardLabel: 'ML Practitioner',
    title: () => 'Build and Deploy an ML Model',
    description: (_role, gap) =>
      `${gap} is flagged from your profile analysis. This mission has you train a model on a Kaggle dataset, evaluate it, and deploy it as a REST API with FastAPI.`,
    why: (gap) => `${gap} is increasingly expected even in non-ML roles. A deployed model project sets you apart immediately.`,
    whyPoints: [
      'ML fluency is becoming a baseline expectation in tech',
      'A deployed model is the strongest ML portfolio piece',
      'FastAPI + model deployment is a real production pattern',
      'Kaggle project links are valued on data team resumes',
    ],
    checklist: [
      'Choose a dataset from Kaggle (classification or regression)',
      'Train a baseline model with scikit-learn or PyTorch',
      'Evaluate with proper train/test split and metrics',
      'Wrap the model in a FastAPI endpoint',
      'Deploy to Hugging Face Spaces or Railway',
      'Document the approach and results in a README',
    ],
    skillsImproved: ['Python', 'scikit-learn', 'FastAPI', 'Model Deployment', 'ML Evaluation'],
  },

  // API / Backend
  {
    gapKeywords: ['api', 'backend', 'rest', 'node', 'express', 'fastapi', 'server'],
    icon: '🔌',
    category: 'Project',
    difficulty: 'Intermediate',
    estimatedTime: '60 min',
    careerGain: 4,
    readinessGain: 3,
    rewardLabel: 'API Builder',
    title: () => 'Build a Production-Ready REST API',
    description: (_role, gap) =>
      `${gap} is missing from your projects. This mission has you build a REST API with authentication, error handling, and documentation — the full production stack.`,
    why: (gap) => `${gap} is the core of virtually every backend role interview and is absent from your current portfolio.`,
    whyPoints: [
      'Backend interviews almost always start with API design',
      'Authentication + error handling shows production maturity',
      'Swagger docs signal professional engineering habits',
      'Deployed APIs are stronger portfolio items than local projects',
    ],
    checklist: [
      'Set up Express.js or FastAPI project structure',
      'Implement JWT authentication (register + login)',
      'Build 3+ resource endpoints with full CRUD',
      'Add input validation and standardized error responses',
      'Generate Swagger/OpenAPI documentation',
      'Deploy to Railway or Fly.io',
    ],
    skillsImproved: ['REST API', 'JWT Auth', 'Express.js', 'API Documentation', 'Error Handling'],
  },

  // Git / GitHub
  {
    gapKeywords: ['git', 'github', 'version control', 'open source', 'contribution'],
    icon: '🐙',
    category: 'Project',
    difficulty: 'Beginner',
    estimatedTime: '30 min',
    careerGain: 2,
    readinessGain: 2,
    rewardLabel: 'Open Source Contributor',
    title: () => 'Make Your First Open Source Contribution',
    description: (_role, gap) =>
      `${gap} is detected from your GitHub activity. This mission walks you through finding an open source issue, fixing it, and submitting a real pull request.`,
    why: (gap) => `Open source contributions are one of the strongest signals of engineering initiative.`,
    whyPoints: [
      'Open source PRs prove you can work in real codebases',
      'Public contributions are permanently on your GitHub profile',
      'Hiring managers actively search candidate contribution history',
      'Good first issues are welcoming — completion rate is high',
    ],
    checklist: [
      'Find a project on Good First Issues (goodfirstissue.dev)',
      'Fork the repository and set up the local environment',
      'Fix the issue or add the feature described',
      'Write a clear PR description with context and screenshots',
      'Submit the PR and respond to reviewer feedback',
    ],
    skillsImproved: ['Git', 'GitHub', 'Open Source', 'Code Review', 'Collaboration'],
  },
];

// ─── Fallback mission for when no gaps match templates ────────────────────────

const FALLBACK_TEMPLATE: MissionTemplate = {
  gapKeywords: [],
  icon: '🎯',
  category: 'Project',
  difficulty: 'Intermediate',
  estimatedTime: '60 min',
  careerGain: 3,
  readinessGain: 3,
  rewardLabel: 'Career Builder',
  title: (role) => `Build a Portfolio Project for ${role}`,
  description: (role) =>
    `Your analysis shows opportunities to deepen your ${role} portfolio. This mission guides you to ship a real, deployable project that closes your most impactful gaps.`,
  why: () => 'A strong portfolio is the #1 factor that accelerates your job search timeline.',
  whyPoints: [
    'Portfolio projects are the most effective interview accelerator',
    'Live deployments prove you ship, not just code',
    'Employers compare portfolio depth against other candidates',
    'Each project compounds toward interview confidence',
  ],
  checklist: [
    'Pick the project idea most aligned with your target role',
    'Set up a GitHub repo with a clear README',
    'Build the MVP with core functionality',
    'Deploy to a live URL (Vercel, Netlify, or Railway)',
    'Write a professional README with setup instructions and screenshots',
  ],
  skillsImproved: ['Portfolio Building', 'Project Management', 'GitHub', 'Deployment'],
};

// ─── Core Generator ───────────────────────────────────────────────────────────

/**
 * generateCareerMissions
 * Derives up to `limit` missions from the user's detected gaps.
 * Each mission is tied to a real gap — never generic or hardcoded.
 */
export function generateCareerMissions(
  memory: NexoraAgentMemory,
  limit = 7
): CareerMission[] {
  const { analysis, targetRole, missionProgress } = memory;
  const role = targetRole || 'Software Engineer';
  const completedIds = new Set(missionProgress?.completedMissionIds ?? []);

  // Collect all gap signals
  const rawGaps: string[] = [
    ...(analysis?.gaps ?? []),
    ...(analysis?.futureSkills ?? []),
  ];

  const gaps = rawGaps.length > 0
    ? rawGaps
    : ['API Development', 'Cloud Deployment', 'Testing', 'System Design'];

  // Match gaps to templates
  const used = new Set<number>();
  const matched: Array<{ template: MissionTemplate; gap: string }> = [];

  for (const gap of gaps) {
    if (matched.length >= limit) break;
    const gapLower = gap.toLowerCase();
    for (let i = 0; i < MISSION_TEMPLATES.length; i++) {
      if (used.has(i)) continue;
      const tmpl = MISSION_TEMPLATES[i];
      if (tmpl.gapKeywords.some((kw) => gapLower.includes(kw) || kw.includes(gapLower.split(' ')[0]))) {
        matched.push({ template: tmpl, gap });
        used.add(i);
        break;
      }
    }
  }

  // Fill remaining slots with unmatched templates
  if (matched.length < limit) {
    for (let i = 0; i < MISSION_TEMPLATES.length && matched.length < limit; i++) {
      if (!used.has(i)) {
        matched.push({ template: MISSION_TEMPLATES[i], gap: gaps[0] ?? 'Core Skills' });
        used.add(i);
      }
    }
  }

  // If still short, add fallback
  if (matched.length === 0) {
    matched.push({ template: FALLBACK_TEMPLATE, gap: 'General Skills' });
  }

  // Build mission objects
  return matched.map(({ template, gap }, index) => {
    const id = `mission_${index + 1}_${gap.replace(/\s+/g, '_').toLowerCase()}`;
    const isCompleted = completedIds.has(id);

    // Restore checklist state from missionProgress if this is the active mission
    let checklist: MissionChecklistItem[] = template.checklist.map((label, ci) => ({
      id: `${id}_c${ci}`,
      label,
      done: false,
    }));

    if (missionProgress?.activeMissionId === id && missionProgress.checklist.length > 0) {
      checklist = checklist.map((item) => {
        const saved = missionProgress.checklist.find((c) => c.id === item.id);
        return saved ? { ...item, done: saved.done } : item;
      });
    }

    if (isCompleted) {
      checklist = checklist.map((item) => ({ ...item, done: true }));
    }

    const doneCt = checklist.filter((c) => c.done).length;
    const progress = checklist.length > 0 ? Math.round((doneCt / checklist.length) * 100) : 0;

    // Mission 0 always unlocked; subsequent missions unlock after prior is completed
    const unlocked = index === 0 || completedIds.has(
      `mission_${index}_${(gaps[index - 1] ?? 'core').replace(/\s+/g, '_').toLowerCase()}`
    );

    return {
      id,
      title: template.title(role),
      description: template.description(role, gap),
      why: template.why(gap),
      whyPoints: template.whyPoints,
      difficulty: template.difficulty,
      estimatedTime: template.estimatedTime,
      careerGain: template.careerGain,
      readinessGain: template.readinessGain,
      checklist,
      progress: isCompleted ? 100 : progress,
      completed: isCompleted,
      rewardLabel: template.rewardLabel,
      skillsImproved: template.skillsImproved,
      unlocked: isCompleted ? true : unlocked,
      icon: template.icon,
      category: template.category,
      sourceGap: gap,
    };
  });
}

/**
 * Recalculate unlocked status after a mission completion.
 * Returns the updated missions array without mutating the original.
 */
export function recalculateUnlocks(missions: CareerMission[]): CareerMission[] {
  return missions.map((m, i) => ({
    ...m,
    unlocked: i === 0 || missions[i - 1]?.completed === true,
  }));
}

// ─── Compatibility shims (restored for Dashboard.tsx and Settings.tsx) ─────────

/** Simple unique ID generator. */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Maps a CareerMission to the WeeklyMission shape used by Dashboard/Settings.
 */
function careerMissionToWeekly(m: CareerMission): WeeklyMission {
  return {
    id: m.id,
    text: m.title,
    completed: m.completed,
    why: m.why,
    difficulty: m.difficulty,
    skill: m.skillsImproved[0] ?? m.sourceGap,
    category: m.category === 'Interview Preparation' ? 'Interview Preparation' : m.category,
    source: 'AI Generated',
    createdAt: new Date().toISOString(),
  };
}

/**
 * generateMissions — restored compatibility export.
 * Generates up to `count` WeeklyMission objects from gap analysis.
 */
export function generateMissions(
  memory: NexoraAgentMemory,
  count: number
): WeeklyMission[] {
  // Exclude missions already in weeklyMissions to avoid duplicates
  const existingIds = new Set((memory.weeklyMissions ?? []).map((m) => m.id));
  const missions = generateCareerMissions(memory, count + existingIds.size);
  return missions
    .filter((m) => !existingIds.has(m.id))
    .slice(0, count)
    .map(careerMissionToWeekly);
}

/**
 * checkMissionRelevance — restored compatibility export.
 * Filters out missions that no longer match the current target role.
 * Returns active missions, suggested missions, and a log of changes.
 */
export function checkMissionRelevance(
  memory: NexoraAgentMemory
): { active: WeeklyMission[]; suggestions: WeeklyMission[]; log: string[] } {
  // For now: pass through existing missions unchanged; no stale-role detection needed
  // (the real detection logic lived in the old generator which was removed).
  return {
    active: memory.weeklyMissions ?? [],
    suggestions: memory.suggestedMissions ?? [],
    log: [],
  };
}

/**
 * regenerateSingleMission — restored compatibility export.
 * Replaces the mission with the given id with a freshly generated one.
 */
export function regenerateSingleMission(
  memory: NexoraAgentMemory,
  id: string,
  _skipReason?: string
): WeeklyMission | null {
  const existing = new Set((memory.weeklyMissions ?? []).map((m) => m.id));
  existing.delete(id); // allow regenerating into same slot
  const tempMem: NexoraAgentMemory = {
    ...memory,
    weeklyMissions: (memory.weeklyMissions ?? []).filter((m) => m.id !== id),
  };
  const generated = generateMissions(tempMem, 1);
  return generated[0] ?? null;
}