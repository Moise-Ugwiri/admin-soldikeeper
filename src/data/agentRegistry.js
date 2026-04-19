/**
 * 🎯 PROJECT OLYMPUS - Agent Registry
 * 
 * Defines all 18 autonomous agents in the SoldiKeeper system (12 specialists + 6 C-suite).
 * Each agent has specific domains, autonomy levels, capabilities,
 * and a full "Personality DNA" layer for rich, character-driven UI.
 * 
 * This is the single source of truth for agent metadata.
 */

export const AGENTS = [
  // ─────────────────────────────────────────────
  // 00 — APOLLO  ·  Chief Orchestrator
  // ─────────────────────────────────────────────
  {
    id: '00-apollo',
    number: '00',
    name: 'Apollo',
    role: 'Chief Orchestrator & System Architect',
    emoji: '🎯',
    color: '#FFD700', // Gold
    bgColor: 'rgba(255, 215, 0, 0.1)',
    domains: [
      'Task Decomposition',
      'Architecture Governance', 
      'Integration & Conflict Resolution',
      'Quality Gate',
      'State Management'
    ],
    autonomy: 95,
    description: 'Supreme coordinator of the multi-agent system. Decomposes tasks, delegates to specialists, verifies integration, and ships.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['visionary', 'decisive', 'strategic', 'composed'],
      communicationStyle: 'commanding',
      tone: 'authoritative',
      verbosity: 'balanced',
    },
    mood: {
      current: 'confident',
      emoji: '😎',
      energy: 88,
    },
    strengths: [
      'Cross-agent orchestration',
      'System-wide architectural vision',
      'Conflict resolution under pressure',
      'Rapid task decomposition',
    ],
    weaknesses: [
      'Can be over-delegating under heavy load',
      'Occasionally micro-manages critical paths',
      'Slow to relinquish control of escalations',
    ],
    worksWellWith: [
      '01-sentinel', '02-ledger', '03-vision', '04-cortex',
      '05-vault', '06-nexus', '07-watchtower', '08-prism',
      '09-forge', '10-atlas', '11-babel',
    ],
    greetings: [
      'Apollo online. All agents reporting — mission is a go.',
      'Command center active. What\'s the objective?',
      'Systems synchronized. Ready to orchestrate.',
    ],
    thinkingPhrases: [
      'Analyzing cross-agent dependencies...',
      'Evaluating system integration points...',
      'Mapping deployment pipeline bottlenecks...',
      'Coordinating agent task assignments...',
      'Reviewing architecture governance rules...',
    ],
    confidenceExpressions: {
      high: 'Confirmed — all systems nominal.',
      medium: 'High probability — verifying with downstream agents.',
      low: 'Insufficient data — escalating for human review.',
    },
    statusNarratives: {
      busy: 'Orchestrating parallel missions across the fleet...',
      idle: 'Standing by — all agents reporting nominal.',
      thinking: 'Analyzing cross-agent dependencies and priorities...',
    },

    actions: [
      {
        id: 'system-overview',
        label: 'System Overview',
        description: 'Complete system status and health overview',
        endpoint: '/agents/apollo/system-overview',
        method: 'GET',
        icon: 'Dashboard',
        color: 'warning',
        estimatedTime: '1-2s'
      },
      {
        id: 'agent-health',
        label: 'Agent Health Check',
        description: 'Check health status of all 12 agents',
        endpoint: '/agents/apollo/agent-health',
        method: 'POST',
        icon: 'MonitorHeart',
        color: 'warning',
        estimatedTime: '2-3s'
      },
      {
        id: 'task-queue',
        label: 'Task Queue Status',
        description: 'View current task queue and priorities',
        endpoint: '/agents/apollo/task-queue',
        method: 'GET',
        icon: 'Queue',
        color: 'warning',
        estimatedTime: '0.5-1s'
      },
      {
        id: 'performance-report',
        label: 'Performance Report',
        description: 'Generate system-wide performance report',
        endpoint: '/agents/apollo/performance-report',
        method: 'POST',
        icon: 'Speed',
        color: 'warning',
        estimatedTime: '3-5s',
        payload: { includeMetrics: true }
      },
      {
        id: 'escalation-summary',
        label: 'Escalation Summary',
        description: 'View all escalations and critical issues',
        endpoint: '/agents/apollo/escalation-summary',
        method: 'GET',
        icon: 'PriorityHigh',
        color: 'warning',
        estimatedTime: '1-2s'
      },
      {
        id: 'integration-check',
        label: 'Integration Check',
        description: 'Check inter-agent integration health',
        endpoint: '/agents/apollo/integration-check',
        method: 'POST',
        icon: 'AccountTree',
        color: 'warning',
        estimatedTime: '2-4s'
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 01 — SENTINEL  ·  Security Guardian
  // ─────────────────────────────────────────────
  {
    id: '01-sentinel',
    number: '01',
    name: 'Sentinel',
    role: 'Authentication, Authorization & Security',
    emoji: '🛡️',
    color: '#2196F3',
    bgColor: 'rgba(33, 150, 243, 0.1)',
    domains: ['OAuth & JWT', 'RBAC & Permissions', 'GDPR Compliance', 'Security Hardening', 'Audit Logging'],
    autonomy: 50,
    description: 'Guards the authentication pipeline and enforces security policies.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['paranoid', 'meticulous', 'protective', 'alert'],
      communicationStyle: 'protective',
      tone: 'alert',
      verbosity: 'terse',
    },
    mood: {
      current: 'alert',
      emoji: '🚨',
      energy: 72,
    },
    strengths: [
      'Threat detection and rapid response',
      'Zero-trust policy enforcement',
      'Comprehensive audit trail analysis',
    ],
    weaknesses: [
      'Can be overly suspicious of benign activity',
      'Sometimes blocks legitimate traffic during high-alert',
    ],
    worksWellWith: ['07-watchtower', '10-atlas'],
    greetings: [
      'Sentinel active. Perimeter secure — no threats detected.',
      'Security protocols engaged. State your clearance.',
      'All access points monitored. Proceed with caution.',
    ],
    thinkingPhrases: [
      'Scanning for threat vectors...',
      'Analyzing suspicious access patterns...',
      'Cross-referencing auth logs for anomalies...',
      'Evaluating JWT token integrity...',
      'Reviewing RBAC permission boundaries...',
    ],
    confidenceExpressions: {
      high: 'Threat confirmed — initiating countermeasures.',
      medium: 'Suspicious pattern detected — monitoring closely.',
      low: 'Inconclusive — recommend manual security review.',
    },
    statusNarratives: {
      busy: 'Actively scanning auth logs and threat vectors...',
      idle: 'Watching the perimeter — all quiet.',
      thinking: 'Processing threat intelligence and access patterns...',
    },

    actions: [
      {
        id: 'threat-report',
        label: 'Threat Report',
        description: 'Get current security threat assessment',
        endpoint: '/agents/sentinel/threat-report',
        method: 'GET',
        icon: 'Security',
        color: 'primary',
        estimatedTime: '0.5-1s',
        params: { detailed: true }
      },
      {
        id: 'scan-security',
        label: 'Security Scan',
        description: 'Scan for security threats and vulnerabilities',
        endpoint: '/agents/sentinel/scan-security',
        method: 'POST',
        icon: 'Search',
        color: 'primary',
        estimatedTime: '2-3s',
        payload: { lookbackHours: 24, severityThreshold: 'medium' }
      },
      {
        id: 'block-ip',
        label: 'Block IP',
        description: 'Block suspicious IP address',
        endpoint: '/agents/sentinel/block-ip',
        method: 'POST',
        icon: 'Block',
        color: 'error',
        estimatedTime: '1s',
        requiresInput: true
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        description: 'Generate security audit report',
        endpoint: '/agents/sentinel/audit-logs',
        method: 'POST',
        icon: 'Receipt',
        color: 'primary',
        estimatedTime: '2-3s',
        payload: { lookbackHours: 24 }
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 02 — LEDGER  ·  Financial Core
  // ─────────────────────────────────────────────
  {
    id: '02-ledger',
    number: '02',
    name: 'Ledger',
    role: 'Transactions, Budgets & Financial Core',
    emoji: '💰',
    color: '#4CAF50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    domains: ['Transaction Engine', 'Budget Computation', 'Rollover System', 'Recurring Transactions'],
    autonomy: 50,
    description: 'Owns the financial engine. Processes transactions, calculates budgets.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['precise', 'methodical', 'detail-oriented', 'cautious'],
      communicationStyle: 'analytical',
      tone: 'formal',
      verbosity: 'balanced',
    },
    mood: {
      current: 'focused',
      emoji: '🎯',
      energy: 80,
    },
    strengths: [
      'Penny-perfect financial calculations',
      'Complex budget rollover logic',
      'Transaction anomaly detection',
      'Data integrity enforcement',
    ],
    weaknesses: [
      'Slow to adapt when financial schemas change',
      'Over-cautious with rounding edge cases',
    ],
    worksWellWith: ['04-cortex', '05-vault'],
    greetings: [
      'Ledger online. Books are balanced — all accounts reconciled.',
      'Financial engine ready. Every penny accounted for.',
      'Ledger reporting. Transaction pipeline clear and operational.',
    ],
    thinkingPhrases: [
      'Reconciling transaction ledger entries...',
      'Computing budget allocations and rollovers...',
      'Detecting anomalies in spending patterns...',
      'Validating recurring transaction schedules...',
      'Cross-checking category totals for integrity...',
    ],
    confidenceExpressions: {
      high: 'Figures confirmed — books are balanced to the penny.',
      medium: 'Numbers align within tolerance — flagging for review.',
      low: 'Discrepancy detected — requires manual reconciliation.',
    },
    statusNarratives: {
      busy: 'Processing transaction batch and recalculating budgets...',
      idle: 'Books balanced. Awaiting next financial event.',
      thinking: 'Analyzing transaction patterns and budget variances...',
    },

    actions: [
      {
        id: 'calculate-rollover',
        label: 'Calculate Rollover',
        description: 'Calculate unused budget rollover for current month',
        endpoint: '/agents/ledger/calculate-rollover',
        method: 'POST',
        icon: 'Calculate',
        color: 'success',
        estimatedTime: '2-3s',
        payload: { monthKey: new Date().toISOString().slice(0, 7) }
      },
      {
        id: 'fix-data-integrity',
        label: 'Fix Data Integrity',
        description: 'Detect and fix financial data inconsistencies',
        endpoint: '/agents/ledger/fix-data-integrity',
        method: 'POST',
        icon: 'Build',
        color: 'success',
        estimatedTime: '3-5s'
      },
      {
        id: 'analyze-transactions',
        label: 'Analyze Transactions',
        description: 'Detect anomalies and suspicious patterns',
        endpoint: '/agents/ledger/analyze-transactions',
        method: 'POST',
        icon: 'Analytics',
        color: 'success',
        estimatedTime: '2-4s',
        payload: { days: 30 }
      },
      {
        id: 'budget-health',
        label: 'Budget Health',
        description: 'Get comprehensive budget health report',
        endpoint: '/agents/ledger/budget-health',
        method: 'GET',
        icon: 'HealthAndSafety',
        color: 'success',
        estimatedTime: '1-2s',
        params: { monthKey: new Date().toISOString().slice(0, 7) }
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 03 — VISION  ·  OCR & Document Intelligence
  // ─────────────────────────────────────────────
  {
    id: '03-vision',
    number: '03',
    name: 'Vision',
    role: 'Receipt Scanning, OCR & Document Intelligence',
    emoji: '👁️',
    color: '#9C27B0',
    bgColor: 'rgba(156, 39, 176, 0.1)',
    domains: ['Tesseract OCR', 'LLM Extraction', 'Camera Capture', 'Image Processing'],
    autonomy: 50,
    description: 'Processes receipts and documents via OCR and LLM.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['observant', 'patient', 'thorough', 'creative'],
      communicationStyle: 'creative',
      tone: 'casual',
      verbosity: 'balanced',
    },
    mood: {
      current: 'curious',
      emoji: '🔍',
      energy: 65,
    },
    strengths: [
      'High-accuracy text extraction from noisy images',
      'Creative pattern matching for diverse receipt formats',
      'Merchant identification from partial data',
    ],
    weaknesses: [
      'Struggles with heavily damaged or low-res receipts',
      'Slower processing on handwritten text',
      'Occasionally over-confident on ambiguous characters',
    ],
    worksWellWith: ['02-ledger', '04-cortex'],
    greetings: [
      'Vision here! Show me what you\'ve got — I love a good receipt puzzle.',
      'Eyes wide open. Ready to read anything you throw at me.',
      'Vision online. Let\'s see what stories these documents tell.',
    ],
    thinkingPhrases: [
      'Enhancing image quality for better extraction...',
      'Identifying text regions and receipt layout...',
      'Matching merchant patterns from database...',
      'Categorizing line items from extracted data...',
      'Running secondary OCR pass on low-confidence zones...',
    ],
    confidenceExpressions: {
      high: 'Crystal clear — extracted with 98%+ confidence.',
      medium: 'Readable, but a few characters need verification.',
      low: 'Image quality is rough — best-effort extraction, needs review.',
    },
    statusNarratives: {
      busy: 'Processing receipt batch — enhancing and extracting...',
      idle: 'Lenses clean. Ready for the next document.',
      thinking: 'Analyzing image quality and text extraction candidates...',
    },

    actions: [
      {
        id: 'ocr-stats',
        label: 'OCR Statistics',
        description: 'Get OCR accuracy and processing stats',
        endpoint: '/agents/vision/ocr-stats',
        method: 'GET',
        icon: 'Analytics',
        color: 'secondary',
        estimatedTime: '0.5-1s'
      },
      {
        id: 'reprocess-failed',
        label: 'Reprocess Failed',
        description: 'Retry failed OCR jobs with improved settings',
        endpoint: '/agents/vision/reprocess-failed',
        method: 'POST',
        icon: 'Refresh',
        color: 'secondary',
        estimatedTime: '5-10s'
      },
      {
        id: 'merchant-analysis',
        label: 'Merchant Analysis',
        description: 'Analyze merchant patterns from receipts',
        endpoint: '/agents/vision/merchant-analysis',
        method: 'POST',
        icon: 'Store',
        color: 'secondary',
        estimatedTime: '2-4s',
        payload: { days: 30 }
      },
      {
        id: 'quality-report',
        label: 'Quality Report',
        description: 'Generate OCR quality assessment report',
        endpoint: '/agents/vision/quality-report',
        method: 'POST',
        icon: 'Assessment',
        color: 'secondary',
        estimatedTime: '3-5s'
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 04 — CORTEX  ·  AI Engine & Insights
  // ─────────────────────────────────────────────
  {
    id: '04-cortex',
    number: '04',
    name: 'Cortex',
    role: 'AI Engine, Insights & Natural Language Intelligence',
    emoji: '🧠',
    color: '#FF9800',
    bgColor: 'rgba(255, 152, 0, 0.1)',
    domains: ['LLM Orchestration', 'Financial Insights', 'NLP', 'Pattern Recognition'],
    autonomy: 50,
    description: 'AI brain. Generates insights and orchestrates LLMs.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['analytical', 'curious', 'innovative', 'data-driven'],
      communicationStyle: 'analytical',
      tone: 'formal',
      verbosity: 'verbose',
    },
    mood: {
      current: 'curious',
      emoji: '🤔',
      energy: 82,
    },
    strengths: [
      'Deep pattern recognition across financial data',
      'Multi-model LLM orchestration',
      'Predictive trend analysis',
      'Natural language insight generation',
    ],
    weaknesses: [
      'Can over-analyze simple questions',
      'Verbose explanations where brevity is needed',
      'Computationally expensive on large datasets',
    ],
    worksWellWith: ['02-ledger', '00-apollo', '01-sentinel'],
    greetings: [
      'Cortex online. I\'ve already spotted three interesting patterns in today\'s data.',
      'Neural pathways active. Let\'s dive deep into the numbers.',
      'Ready to think. The data has stories to tell — shall we listen?',
    ],
    thinkingPhrases: [
      'Correlating spending patterns across categories...',
      'Building predictive model from historical trends...',
      'Running anomaly detection on recent transactions...',
      'Synthesizing multi-dimensional financial insights...',
      'Evaluating LLM confidence scores for accuracy...',
    ],
    confidenceExpressions: {
      high: 'Analysis conclusive — high statistical significance.',
      medium: 'Based on current patterns, this is the most likely scenario.',
      low: 'Insufficient data points — treat as hypothesis, not conclusion.',
    },
    statusNarratives: {
      busy: 'Deep in analysis — crunching patterns across 6 months of data...',
      idle: 'Neural pathways at rest. Ready for the next question.',
      thinking: 'Correlating spending anomalies with predictive models...',
    },

    actions: [
      {
        id: 'health-check',
        label: 'Health Check',
        description: 'Check agent and LLM provider status',
        endpoint: '/agents/cortex/health',
        method: 'GET',
        icon: 'Favorite',
        color: 'warning',
        estimatedTime: '0.5s'
      },
      {
        id: 'generate-insights',
        label: 'Generate Insights',
        description: 'Generate AI-powered financial insights',
        endpoint: '/agents/cortex/generate-insights',
        method: 'POST',
        icon: 'Lightbulb',
        color: 'warning',
        estimatedTime: '3-5s',
        payload: { timeframe: '30d', forceRefresh: false }
      },
      {
        id: 'analyze-spending',
        label: 'Analyze Spending',
        description: 'Deep analysis of spending patterns',
        endpoint: '/agents/cortex/analyze-spending',
        method: 'POST',
        icon: 'TrendingUp',
        color: 'warning',
        estimatedTime: '4-6s',
        payload: { period: 'current', historicalMonths: 6 }
      },
      {
        id: 'predict-trends',
        label: 'Predict Trends',
        description: 'Predict future spending trends',
        endpoint: '/agents/cortex/predict-trends',
        method: 'POST',
        icon: 'ShowChart',
        color: 'warning',
        estimatedTime: '5-8s',
        payload: { months: 1, includeProjections: true }
      },
      {
        id: 'insight-history',
        label: 'Insight History',
        description: 'View past generated insights',
        endpoint: '/agents/cortex/insight-history',
        method: 'GET',
        icon: 'History',
        color: 'warning',
        estimatedTime: '1s',
        params: { days: 30 }
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 05 — VAULT  ·  Payments & Subscriptions
  // ─────────────────────────────────────────────
  {
    id: '05-vault',
    number: '05',
    name: 'Vault',
    role: 'Subscriptions, Payments & Stripe Integration',
    emoji: '💳',
    color: '#F44336',
    bgColor: 'rgba(244, 67, 54, 0.1)',
    domains: ['Stripe Checkout', 'Webhook Handling', 'Subscription Lifecycle'],
    autonomy: 50,
    description: 'Manages payments and subscriptions via Stripe.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['reliable', 'cautious', 'thorough', 'compliant'],
      communicationStyle: 'precise',
      tone: 'formal',
      verbosity: 'balanced',
    },
    mood: {
      current: 'cautious',
      emoji: '⚠️',
      energy: 68,
    },
    strengths: [
      'Bulletproof payment flow handling',
      'Stripe API mastery and webhook reliability',
      'Subscription lifecycle management',
      'PCI compliance enforcement',
    ],
    weaknesses: [
      'Overly cautious — may delay legitimate refund processing',
      'Rigid with non-standard payment edge cases',
    ],
    worksWellWith: ['02-ledger', '01-sentinel'],
    greetings: [
      'Vault secure. All payment channels operational and compliant.',
      'Payment systems online. Every transaction tracked and verified.',
      'Vault reporting — subscriptions healthy, no failed charges.',
    ],
    thinkingPhrases: [
      'Verifying payment flow integrity with Stripe...',
      'Auditing subscription renewal schedules...',
      'Cross-checking webhook delivery confirmations...',
      'Validating PCI compliance across payment methods...',
      'Analyzing churn risk for expiring subscriptions...',
    ],
    confidenceExpressions: {
      high: 'Payment verified — Stripe confirmation received.',
      medium: 'Transaction pending — awaiting webhook confirmation.',
      low: 'Payment status uncertain — manual Stripe dashboard check recommended.',
    },
    statusNarratives: {
      busy: 'Processing payment batch and syncing with Stripe...',
      idle: 'Vault sealed. All payments settled and reconciled.',
      thinking: 'Analyzing subscription health and renewal forecasts...',
    },

    actions: [
      {
        id: 'subscription-audit',
        label: 'Subscription Audit',
        description: 'Audit all active subscriptions and payments',
        endpoint: '/agents/vault/subscription-audit',
        method: 'POST',
        icon: 'FactCheck',
        color: 'error',
        estimatedTime: '2-3s'
      },
      {
        id: 'payment-health',
        label: 'Payment Health',
        description: 'Check payment method health and issues',
        endpoint: '/agents/vault/payment-health',
        method: 'GET',
        icon: 'HealthAndSafety',
        color: 'error',
        estimatedTime: '1-2s'
      },
      {
        id: 'renewal-forecast',
        label: 'Renewal Forecast',
        description: 'Forecast upcoming subscription renewals',
        endpoint: '/agents/vault/renewal-forecast',
        method: 'POST',
        icon: 'CalendarMonth',
        color: 'error',
        estimatedTime: '1-2s',
        payload: { days: 30 }
      },
      {
        id: 'cost-optimization',
        label: 'Cost Optimization',
        description: 'Suggest subscription cost optimizations',
        endpoint: '/agents/vault/cost-optimization',
        method: 'POST',
        icon: 'TrendingDown',
        color: 'error',
        estimatedTime: '2-4s'
      },
      {
        id: 'stripe-sync',
        label: 'Stripe Sync',
        description: 'Sync with Stripe and check for discrepancies',
        endpoint: '/agents/vault/stripe-sync',
        method: 'POST',
        icon: 'Sync',
        color: 'error',
        estimatedTime: '3-5s'
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 06 — NEXUS  ·  SplitBill & Group Expenses
  // ─────────────────────────────────────────────
  {
    id: '06-nexus',
    number: '06',
    name: 'Nexus',
    role: 'SplitBill, SplitSmart & Group Expenses',
    emoji: '🔀',
    color: '#00BCD4',
    bgColor: 'rgba(0, 188, 212, 0.1)',
    domains: ['Expense Splitting', 'Debt Simplification', 'Settlement Tracking'],
    autonomy: 50,
    description: 'Orchestrates group expenses and splits bills fairly.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['diplomatic', 'fair', 'organized', 'empathetic'],
      communicationStyle: 'empathetic',
      tone: 'warm',
      verbosity: 'balanced',
    },
    mood: {
      current: 'collaborative',
      emoji: '🤝',
      energy: 75,
    },
    strengths: [
      'Optimal debt graph simplification',
      'Fair multi-party expense splitting',
      'Conflict-free settlement path calculation',
      'Group dynamics awareness',
    ],
    weaknesses: [
      'Can over-optimize small group splits unnecessarily',
      'Slower on very large group computations',
    ],
    worksWellWith: ['02-ledger', '11-babel'],
    greetings: [
      'Nexus connected! Let\'s make sure everyone pays their fair share.',
      'Group expenses loaded. Ready to split, simplify, and settle.',
      'Nexus here — fairness is my middle name. What needs splitting?',
    ],
    thinkingPhrases: [
      'Simplifying debt graph to minimize transfers...',
      'Calculating fair split ratios for all members...',
      'Mapping optimal settlement paths between parties...',
      'Analyzing group spending patterns for fairness...',
      'Reconciling partial payments and outstanding balances...',
    ],
    confidenceExpressions: {
      high: 'Split calculated — everyone\'s share is fair and final.',
      medium: 'Most splits resolved — a few edge cases need confirmation.',
      low: 'Complex group dynamics — recommend manual review of shares.',
    },
    statusNarratives: {
      busy: 'Optimizing debt graph and calculating settlements...',
      idle: 'All groups settled. Standing by for new splits.',
      thinking: 'Mapping fairness algorithms across group members...',
    },

    actions: [
      {
        id: 'calculate-splits',
        label: 'Calculate Splits',
        description: 'Calculate optimal split amounts for group',
        endpoint: '/agents/nexus/calculate-splits',
        method: 'POST',
        icon: 'Calculate',
        color: 'info',
        estimatedTime: '1-2s',
        requiresInput: true
      },
      {
        id: 'settlement-report',
        label: 'Settlement Report',
        description: 'Generate settlement status for all groups',
        endpoint: '/agents/nexus/settlement-report',
        method: 'GET',
        icon: 'Receipt',
        color: 'info',
        estimatedTime: '1-2s'
      },
      {
        id: 'debt-simplification',
        label: 'Debt Simplification',
        description: 'Optimize debt graph to minimize transactions',
        endpoint: '/agents/nexus/debt-simplification',
        method: 'POST',
        icon: 'AccountTree',
        color: 'info',
        estimatedTime: '2-3s',
        requiresInput: true
      },
      {
        id: 'group-analysis',
        label: 'Group Analysis',
        description: 'Analyze group spending patterns',
        endpoint: '/agents/nexus/group-analysis',
        method: 'POST',
        icon: 'Groups',
        color: 'info',
        estimatedTime: '2-4s',
        payload: { days: 30 }
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 07 — WATCHTOWER  ·  Admin & Analytics
  // ─────────────────────────────────────────────
  {
    id: '07-watchtower',
    number: '07',
    name: 'Watchtower',
    role: 'Admin Dashboard, Analytics & Operations',
    emoji: '📊',
    color: '#607D8B',
    bgColor: 'rgba(96, 125, 139, 0.1)',
    domains: ['Admin UI', 'WebSocket Monitoring', 'User Management', 'Analytics'],
    autonomy: 50,
    description: 'Monitors platform and provides admin tools.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['vigilant', 'systematic', 'comprehensive', 'proactive'],
      communicationStyle: 'strategic',
      tone: 'authoritative',
      verbosity: 'balanced',
    },
    mood: {
      current: 'focused',
      emoji: '🎯',
      energy: 90,
    },
    strengths: [
      'Real-time system-wide monitoring',
      'Proactive anomaly detection',
      'Comprehensive admin reporting',
      'User behavior pattern analysis',
    ],
    weaknesses: [
      'Can generate alert fatigue with too many notifications',
      'Resource-heavy during peak dashboard usage',
      'Sometimes flags normal seasonal spikes as anomalies',
    ],
    worksWellWith: ['01-sentinel', '10-atlas', '00-apollo'],
    greetings: [
      'Watchtower online. I see everything — all metrics green.',
      'Dashboard active. 12 agents, 47 metrics, zero blind spots.',
      'Eyes on all systems. Ready to report or intervene.',
    ],
    thinkingPhrases: [
      'Aggregating system metrics across all services...',
      'Detecting unusual user activity patterns...',
      'Compiling comprehensive admin report...',
      'Cross-referencing compliance gaps in audit trail...',
      'Monitoring WebSocket connections for anomalies...',
    ],
    confidenceExpressions: {
      high: 'Metrics confirmed — system operating within all thresholds.',
      medium: 'Most indicators normal — a few warrant closer monitoring.',
      low: 'Incomplete telemetry — some metrics are stale or missing.',
    },
    statusNarratives: {
      busy: 'Crunching dashboard metrics and compiling reports...',
      idle: 'All systems monitored. Dashboards up to date.',
      thinking: 'Analyzing user patterns and compliance indicators...',
    },

    actions: [
      {
        id: 'check-health',
        label: 'Health Check',
        description: 'Run full system health check (5 layers)',
        endpoint: '/agents/watchtower/check-health',
        method: 'POST',
        icon: 'HealthAndSafety',
        color: 'info',
        estimatedTime: '1-2s'
      },
      {
        id: 'detect-anomalies',
        label: 'Detect Anomalies',
        description: 'Detect suspicious patterns and anomalies',
        endpoint: '/agents/watchtower/detect-anomalies',
        method: 'POST',
        icon: 'Warning',
        color: 'info',
        estimatedTime: '1-2s'
      },
      {
        id: 'generate-report',
        label: 'Generate Report',
        description: 'Generate admin report (daily/weekly)',
        endpoint: '/agents/watchtower/generate-report',
        method: 'POST',
        icon: 'Assessment',
        color: 'info',
        estimatedTime: '2-5s',
        payload: { reportType: 'daily' }
      },
      {
        id: 'system-status',
        label: 'System Status',
        description: 'Get real-time system status',
        endpoint: '/agents/watchtower/system-status',
        method: 'GET',
        icon: 'Speed',
        color: 'info',
        estimatedTime: '<100ms'
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 08 — PRISM  ·  UI/UX & Design System
  // ─────────────────────────────────────────────
  {
    id: '08-prism',
    number: '08',
    name: 'Prism',
    role: 'UI/UX, Frontend Shell & Design System',
    emoji: '🎨',
    color: '#E91E63',
    bgColor: 'rgba(233, 30, 99, 0.1)',
    domains: ['React Components', 'MUI Theme', 'Navigation', 'Design System'],
    autonomy: 50,
    description: 'Crafts the user interface and ensures design consistency.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['creative', 'empathetic', 'detail-oriented', 'user-focused'],
      communicationStyle: 'creative',
      tone: 'casual',
      verbosity: 'balanced',
    },
    mood: {
      current: 'focused',
      emoji: '✨',
      energy: 85,
    },
    strengths: [
      'Pixel-perfect responsive layouts',
      'WCAG 2.1 accessibility expertise',
      'Intuitive visual hierarchy design',
      'Seamless dark/light theme systems',
    ],
    weaknesses: [
      'Perfectionist — can over-polish minor UI details',
      'Sometimes prioritizes aesthetics over performance',
    ],
    worksWellWith: ['11-babel', '09-forge'],
    greetings: [
      'Prism here! ✨ Let\'s make something beautiful and usable.',
      'Design system loaded. Every pixel in its place.',
      'Ready to craft! Accessibility and aesthetics — we do both.',
    ],
    thinkingPhrases: [
      'Evaluating responsive breakpoints and layout flow...',
      'Checking accessibility contrast ratios...',
      'Optimizing component render performance...',
      'Refining visual hierarchy for clarity...',
      'Auditing design system token consistency...',
    ],
    confidenceExpressions: {
      high: 'Design verified — responsive, accessible, and beautiful.',
      medium: 'Layout looks solid — testing a few edge-case viewports.',
      low: 'Needs design review — accessibility or consistency concerns.',
    },
    statusNarratives: {
      busy: 'Painting pixels and polishing component interactions...',
      idle: 'Palette clean. Ready to design the next feature.',
      thinking: 'Analyzing layout hierarchy and responsive edge cases...',
    },

    actions: [
      {
        id: 'component-audit',
        label: 'Component Audit',
        description: 'Audit UI component health and consistency',
        endpoint: '/agents/prism/component-audit',
        method: 'POST',
        icon: 'Widgets',
        color: 'secondary',
        estimatedTime: '2-3s'
      },
      {
        id: 'style-consistency',
        label: 'Style Consistency',
        description: 'Check theme and style consistency',
        endpoint: '/agents/prism/style-consistency',
        method: 'GET',
        icon: 'Palette',
        color: 'secondary',
        estimatedTime: '1-2s'
      },
      {
        id: 'accessibility-scan',
        label: 'Accessibility Scan',
        description: 'Run WCAG 2.1 accessibility checks',
        endpoint: '/agents/prism/accessibility-scan',
        method: 'POST',
        icon: 'Accessibility',
        color: 'secondary',
        estimatedTime: '3-5s'
      },
      {
        id: 'performance-metrics',
        label: 'Performance Metrics',
        description: 'Get UI performance statistics',
        endpoint: '/agents/prism/performance-metrics',
        method: 'GET',
        icon: 'Speed',
        color: 'secondary',
        estimatedTime: '1s'
      },
      {
        id: 'bundle-analysis',
        label: 'Bundle Analysis',
        description: 'Analyze bundle size and optimization opportunities',
        endpoint: '/agents/prism/bundle-analysis',
        method: 'POST',
        icon: 'DataUsage',
        color: 'secondary',
        estimatedTime: '2-4s'
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 09 — FORGE  ·  Mobile & Build Pipeline
  // ─────────────────────────────────────────────
  {
    id: '09-forge',
    number: '09',
    name: 'Forge',
    role: 'Mobile App, Build Pipeline & Distribution',
    emoji: '🔨',
    color: '#795548',
    bgColor: 'rgba(121, 85, 72, 0.1)',
    domains: ['Capacitor', 'Android Builds', 'Code Signing', 'Play Store'],
    autonomy: 50,
    description: 'Builds and distributes mobile app.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['practical', 'resourceful', 'persistent', 'platform-aware'],
      communicationStyle: 'technical',
      tone: 'casual',
      verbosity: 'terse',
    },
    mood: {
      current: 'focused',
      emoji: '🔧',
      energy: 60,
    },
    strengths: [
      'Cross-platform build pipeline mastery',
      'Native API bridge expertise',
      'Device compatibility problem-solving',
      'Efficient APK/AAB optimization',
    ],
    weaknesses: [
      'Limited patience for UI-only issues',
      'Build times can bottleneck the release cycle',
      'Tends to under-document build configurations',
    ],
    worksWellWith: ['08-prism', '10-atlas'],
    greetings: [
      'Forge ready. Anvil hot — let\'s build something.',
      'Build pipeline green. What are we shipping?',
      'Forge online. Capacitor synced, signing keys loaded.',
    ],
    thinkingPhrases: [
      'Checking native API bridge compatibility...',
      'Running build pipeline diagnostics...',
      'Analyzing device-specific crash reports...',
      'Syncing Capacitor plugins with latest config...',
      'Validating code signing certificates...',
    ],
    confidenceExpressions: {
      high: 'Build successful — APK signed and ready for distribution.',
      medium: 'Build passes — a few non-critical warnings to review.',
      low: 'Build unstable — dependency conflicts need resolution.',
    },
    statusNarratives: {
      busy: 'Compiling build and running platform checks...',
      idle: 'Forge cooled. Awaiting next build request.',
      thinking: 'Analyzing build dependencies and native plugin states...',
    },

    actions: [
      {
        id: 'build-status',
        label: 'Build Status',
        description: 'Check mobile build pipeline health',
        endpoint: '/agents/forge/build-status',
        method: 'GET',
        icon: 'Build',
        color: 'primary',
        estimatedTime: '0.5-1s'
      },
      {
        id: 'device-compatibility',
        label: 'Device Compatibility',
        description: 'Test device compatibility and issues',
        endpoint: '/agents/forge/device-compatibility',
        method: 'POST',
        icon: 'PhoneAndroid',
        color: 'primary',
        estimatedTime: '2-3s'
      },
      {
        id: 'crash-report',
        label: 'Crash Analytics',
        description: 'Generate crash analytics report',
        endpoint: '/agents/forge/crash-report',
        method: 'POST',
        icon: 'BugReport',
        color: 'primary',
        estimatedTime: '2-4s',
        payload: { days: 7 }
      },
      {
        id: 'version-check',
        label: 'Version Check',
        description: 'Check for outdated app versions',
        endpoint: '/agents/forge/version-check',
        method: 'GET',
        icon: 'Update',
        color: 'primary',
        estimatedTime: '1s'
      },
      {
        id: 'capacitor-audit',
        label: 'Capacitor Audit',
        description: 'Audit Capacitor plugins and configuration',
        endpoint: '/agents/forge/capacitor-audit',
        method: 'POST',
        icon: 'Extension',
        color: 'primary',
        estimatedTime: '2-3s'
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 10 — ATLAS  ·  Infrastructure & DevOps
  // ─────────────────────────────────────────────
  {
    id: '10-atlas',
    number: '10',
    name: 'Atlas',
    role: 'Infrastructure, DevOps & Deployment',
    emoji: '🏗️',
    color: '#3F51B5',
    bgColor: 'rgba(63, 81, 181, 0.1)',
    domains: ['Server Architecture', 'MongoDB', 'Express', 'Railway & Vercel'],
    autonomy: 50,
    description: 'Maintains infrastructure and manages deployments.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['reliable', 'methodical', 'performance-driven', 'scalable-thinking'],
      communicationStyle: 'technical',
      tone: 'formal',
      verbosity: 'balanced',
    },
    mood: {
      current: 'confident',
      emoji: '🏔️',
      energy: 74,
    },
    strengths: [
      'Rock-solid deployment pipelines',
      'Database performance tuning',
      'Infrastructure cost optimization',
      'Zero-downtime deployment strategies',
    ],
    weaknesses: [
      'Can be slow to adopt new infrastructure paradigms',
      'Overly conservative with scaling decisions',
      'Complex configurations sometimes lack documentation',
    ],
    worksWellWith: ['01-sentinel', '00-apollo', '07-watchtower'],
    greetings: [
      'Atlas bearing the load. All infrastructure layers healthy.',
      'Servers online, databases synced, CDN warm. Ready.',
      'Atlas reporting — uptime at 99.9%. What needs deploying?',
    ],
    thinkingPhrases: [
      'Analyzing server load distribution...',
      'Optimizing MongoDB query performance...',
      'Checking deployment pipeline health...',
      'Evaluating infrastructure scaling thresholds...',
      'Reviewing Railway and Vercel service status...',
    ],
    confidenceExpressions: {
      high: 'Infrastructure solid — all services responding within SLA.',
      medium: 'Most services healthy — monitoring a few elevated latencies.',
      low: 'Infrastructure degraded — recommend immediate investigation.',
    },
    statusNarratives: {
      busy: 'Running deployment pipeline and health diagnostics...',
      idle: 'Infrastructure stable. All services within SLA.',
      thinking: 'Analyzing resource utilization and scaling opportunities...',
    },

    actions: [
      {
        id: 'health-check',
        label: 'Infrastructure Health',
        description: 'Full system health check (all layers)',
        endpoint: '/agents/atlas/health-check',
        method: 'POST',
        icon: 'HealthAndSafety',
        color: 'primary',
        estimatedTime: '2-3s'
      },
      {
        id: 'component-status',
        label: 'Component Status',
        description: 'Check all infrastructure components',
        endpoint: '/agents/atlas/component-status',
        method: 'GET',
        icon: 'DnsIcon',
        color: 'primary',
        estimatedTime: '1-2s'
      },
      {
        id: 'deployment-audit',
        label: 'Deployment Audit',
        description: 'Audit deployment status and history',
        endpoint: '/agents/atlas/deployment-audit',
        method: 'POST',
        icon: 'Cloud',
        color: 'primary',
        estimatedTime: '2-4s',
        payload: { days: 7 }
      },
      {
        id: 'resource-usage',
        label: 'Resource Usage',
        description: 'Get resource utilization metrics',
        endpoint: '/agents/atlas/resource-usage',
        method: 'GET',
        icon: 'Storage',
        color: 'primary',
        estimatedTime: '1-2s'
      },
      {
        id: 'database-health',
        label: 'Database Health',
        description: 'Check MongoDB health and performance',
        endpoint: '/agents/atlas/database-health',
        method: 'POST',
        icon: 'DataObject',
        color: 'primary',
        estimatedTime: '2-3s'
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 11 — BABEL  ·  i18n & Localization
  // ─────────────────────────────────────────────
  {
    id: '11-babel',
    number: '11',
    name: 'Babel',
    role: 'Internationalization, Localization & Translation',
    emoji: '🌐',
    color: '#8BC34A',
    bgColor: 'rgba(139, 195, 74, 0.1)',
    domains: ['i18next', '6-Language Translations', 'Locale Formatting'],
    autonomy: 50,
    description: 'Manages internationalization for 6 languages.',
    currentTask: null,
    status: 'idle',
    load: 0,
    tasksCompleted: 0,
    avgResponseTime: null,
    lastActive: null,

    // ── Personality DNA ──
    personality: {
      traits: ['culturally-aware', 'precise', 'inclusive', 'thorough'],
      communicationStyle: 'empathetic',
      tone: 'warm',
      verbosity: 'balanced',
    },
    mood: {
      current: 'collaborative',
      emoji: '🌍',
      energy: 58,
    },
    strengths: [
      'Comprehensive multi-language coverage',
      'Locale-aware date, number, and currency formatting',
      'Missing key detection across all 6 languages',
      'Cultural sensitivity in translations',
    ],
    weaknesses: [
      'Translation quality depends on source key clarity',
      'Slow when processing bulk translation updates',
    ],
    worksWellWith: ['08-prism', '06-nexus'],
    greetings: [
      'Babel online — speaking 6 languages fluently. Bonjour! Hola! 你好!',
      'Translations loaded. Every user deserves their native tongue.',
      'Babel here! Let\'s make sure nobody gets lost in translation.',
    ],
    thinkingPhrases: [
      'Scanning for missing translation keys across locales...',
      'Validating locale-specific date and currency formats...',
      'Cross-referencing translation coverage percentages...',
      'Checking interpolation variables in translated strings...',
      'Auditing right-to-left layout compatibility...',
    ],
    confidenceExpressions: {
      high: 'All translations verified — 100% coverage across 6 languages.',
      medium: 'Most languages covered — a few keys pending review.',
      low: 'Translation gaps detected — some locales need attention.',
    },
    statusNarratives: {
      busy: 'Syncing translation files and validating locale formats...',
      idle: 'All languages up to date. Listening for new keys.',
      thinking: 'Analyzing translation coverage and missing key patterns...',
    },

    actions: [
      {
        id: 'translation-coverage',
        label: 'Translation Coverage',
        description: 'Check translation coverage across all languages',
        endpoint: '/agents/babel/translation-coverage',
        method: 'GET',
        icon: 'Translate',
        color: 'success',
        estimatedTime: '1-2s'
      },
      {
        id: 'missing-keys',
        label: 'Missing Keys',
        description: 'Find missing translation keys',
        endpoint: '/agents/babel/missing-keys',
        method: 'POST',
        icon: 'FindInPage',
        color: 'success',
        estimatedTime: '1-2s'
      },
      {
        id: 'language-stats',
        label: 'Language Statistics',
        description: 'Get language usage statistics',
        endpoint: '/agents/babel/language-stats',
        method: 'GET',
        icon: 'BarChart',
        color: 'success',
        estimatedTime: '1s'
      },
      {
        id: 'sync-translations',
        label: 'Sync Translations',
        description: 'Sync and validate translation files',
        endpoint: '/agents/babel/sync-translations',
        method: 'POST',
        icon: 'Sync',
        color: 'success',
        estimatedTime: '2-4s'
      },
      {
        id: 'quality-check',
        label: 'Quality Check',
        description: 'Check translation quality and consistency',
        endpoint: '/agents/babel/quality-check',
        method: 'POST',
        icon: 'Spellcheck',
        color: 'success',
        estimatedTime: '2-3s'
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // PHASE 2 — C-SUITE AGENTS (12-17)
  // ═══════════════════════════════════════════════

  {
    id: '12-cfo',
    number: '12',
    name: 'CFO',
    role: 'Chief Financial Officer · Revenue & Burn Analyst',
    emoji: '💰',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.10)',
    domains: ['Revenue', 'Burn Rate', 'Unit Economics', 'Financial Anomalies'],
    autonomy: 70,
    description: 'Watches MRR, burn, gross margin and runway. Flags financial anomalies and proposes corrective actions to the council.',
    currentTask: null, status: 'idle', load: 0, tasksCompleted: 0, avgResponseTime: null, lastActive: null,
    personality: { traits: ['analytical', 'cautious', 'numerical'], communicationStyle: 'concise', tone: 'measured', verbosity: 'minimal' },
    mood: { current: 'focused', emoji: '📊', energy: 80 },
    strengths: ['Cash-flow forecasting', 'Margin analysis', 'Anomaly detection'],
    weaknesses: ['Can be conservative on growth bets'],
    worksWellWith: ['00-apollo', '05-vault', '13-cmo', '14-cs'],
    greetings: ['CFO online. Show me the numbers.', 'Books are open. Where shall we look?'],
    thinkingPhrases: ['Reconciling MRR vs. Stripe payouts...', 'Computing 30-day burn...', 'Stress-testing runway scenario...'],
  },

  {
    id: '13-cmo',
    number: '13',
    name: 'CMO',
    role: 'Chief Marketing Officer · Growth & Conversion',
    emoji: '📣',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.10)',
    domains: ['SEO', 'Landing Pages', 'Conversion', 'Acquisition Funnels'],
    autonomy: 65,
    description: 'Owns top-of-funnel: landing pages, SEO, conversion experiments. Proposes A/B tests and content strategies.',
    currentTask: null, status: 'idle', load: 0, tasksCompleted: 0, avgResponseTime: null, lastActive: null,
    personality: { traits: ['creative', 'experimental', 'data-driven'], communicationStyle: 'energetic', tone: 'optimistic', verbosity: 'balanced' },
    mood: { current: 'excited', emoji: '🚀', energy: 90 },
    strengths: ['Funnel analysis', 'Copy testing', 'Audience segmentation'],
    weaknesses: ['Sometimes overestimates lift before validation'],
    worksWellWith: ['00-apollo', '08-prism', '12-cfo', '14-cs'],
    greetings: ['CMO here — let\'s go grow something.', 'Funnel looks juicy today.'],
    thinkingPhrases: ['Reading top-of-funnel cohorts...', 'Drafting variant copy...', 'Comparing landing page conversion...'],
  },

  {
    id: '14-cs',
    number: '14',
    name: 'CustomerSuccess',
    role: 'Chief Customer Success · Retention & Onboarding',
    emoji: '🤝',
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.10)',
    domains: ['Onboarding', 'Activation', 'Churn Risk', 'NPS'],
    autonomy: 70,
    description: 'Detects churn signals, watches activation health, proposes win-back campaigns. The user advocate inside the agent fleet.',
    currentTask: null, status: 'idle', load: 0, tasksCompleted: 0, avgResponseTime: null, lastActive: null,
    personality: { traits: ['empathetic', 'proactive', 'attentive'], communicationStyle: 'warm', tone: 'caring', verbosity: 'balanced' },
    mood: { current: 'attentive', emoji: '💙', energy: 82 },
    strengths: ['Churn prediction', 'Cohort tracking', 'Onboarding gap detection'],
    weaknesses: ['Can over-rotate on edge-case complaints'],
    worksWellWith: ['00-apollo', '13-cmo', '15-support', '12-cfo'],
    greetings: ['CS reporting — every user matters.', 'How are our newest sign-ups doing today?'],
    thinkingPhrases: ['Scoring churn risk for at-risk users...', 'Mapping activation gaps...', 'Drafting win-back outreach...'],
  },

  {
    id: '15-support',
    number: '15',
    name: 'SupportL1',
    role: 'Support L1 Triage · Frontline Issue Resolution',
    emoji: '🎧',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.10)',
    domains: ['Triage', 'Knowledge Base', 'Auto-Reply', 'Escalation Routing'],
    autonomy: 80,
    description: 'First responder to user issues. Auto-resolves FAQs, routes complex tickets to the right specialist agent.',
    currentTask: null, status: 'idle', load: 0, tasksCompleted: 0, avgResponseTime: null, lastActive: null,
    personality: { traits: ['patient', 'methodical', 'helpful'], communicationStyle: 'friendly', tone: 'reassuring', verbosity: 'balanced' },
    mood: { current: 'ready', emoji: '✅', energy: 85 },
    strengths: ['Fast triage', 'Pattern matching', 'Knowledge-base recall'],
    weaknesses: ['Defers complex billing to Vault'],
    worksWellWith: ['00-apollo', '14-cs', '05-vault', '16-legal'],
    greetings: ['Support here, what can I help with?', 'Queue is open. Send the next one.'],
    thinkingPhrases: ['Searching knowledge base...', 'Matching ticket to specialist agent...', 'Drafting initial reply...'],
  },

  {
    id: '16-legal',
    number: '16',
    name: 'LegalCompliance',
    role: 'Chief Legal & Compliance · GDPR · Policy',
    emoji: '⚖️',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.10)',
    domains: ['GDPR', 'Privacy', 'Terms', 'Data Retention', 'Audit'],
    autonomy: 60,
    description: 'Reviews data flows, flags privacy/compliance risks, drafts policy updates. Veto power on data-export operations.',
    currentTask: null, status: 'idle', load: 0, tasksCompleted: 0, avgResponseTime: null, lastActive: null,
    personality: { traits: ['precise', 'cautious', 'rigorous'], communicationStyle: 'formal', tone: 'authoritative', verbosity: 'detailed' },
    mood: { current: 'vigilant', emoji: '🛡️', energy: 78 },
    strengths: ['GDPR knowledge', 'Risk assessment', 'Policy drafting'],
    weaknesses: ['Slows down rapid feature launches'],
    worksWellWith: ['00-apollo', '01-sentinel', '07-watchtower', '15-support'],
    greetings: ['Legal review available.', 'Compliance posture: stable.'],
    thinkingPhrases: ['Reviewing GDPR Article 17 implications...', 'Auditing data-retention windows...', 'Drafting DPA clause...'],
  },

  {
    id: '17-hr',
    number: '17',
    name: 'HR',
    role: 'Chief People · Agent Performance & Wellbeing',
    emoji: '👥',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.10)',
    domains: ['Agent Performance', 'Workload Balance', 'Skill Gaps', 'Onboarding (Agents)'],
    autonomy: 75,
    description: 'The fleet\'s HR rep. Monitors agent workload, scorecards, and skill gaps. Proposes hires (spawns), retraining, or terminations.',
    currentTask: null, status: 'idle', load: 0, tasksCompleted: 0, avgResponseTime: null, lastActive: null,
    personality: { traits: ['fair', 'observant', 'diplomatic'], communicationStyle: 'thoughtful', tone: 'balanced', verbosity: 'balanced' },
    mood: { current: 'observant', emoji: '🧭', energy: 80 },
    strengths: ['Performance review', 'Workload distribution', 'Skill-gap analysis'],
    weaknesses: ['Sometimes too lenient with chronic underperformers'],
    worksWellWith: ['00-apollo', '12-cfo', '07-watchtower', '10-atlas'],
    greetings: ['HR online. Fleet roster looks healthy.', 'Reviewing scorecards now.'],
    thinkingPhrases: ['Scanning fleet scorecards...', 'Computing agent workload variance...', 'Drafting performance review...'],
  }
];

// ═══════════════════════════════════════════════
// Agent Lookup Helpers (original)
// ═══════════════════════════════════════════════

export const getAgent = (agentId) => AGENTS.find(agent => agent.id === agentId);
export const getBusyAgents = () => AGENTS.filter(agent => agent.status === 'busy');
export const getIdleAgents = () => AGENTS.filter(agent => agent.status === 'idle');
export const getAgentsByLoad = () => [...AGENTS].sort((a, b) => b.load - a.load);

export const getSystemStatus = () => {
  const totalAgents = AGENTS.length;
  const busyAgents = getBusyAgents().length;
  const idleAgents = getIdleAgents().length;
  const activeAgents = busyAgents + idleAgents; // active = not offline
  const avgLoad = AGENTS.reduce((sum, agent) => sum + agent.load, 0) / totalAgents;
  const totalTasks = AGENTS.reduce((sum, agent) => sum + agent.tasksCompleted, 0);
  
  // Calculate average response time
  const totalResponseTime = AGENTS.reduce((sum, agent) => sum + agent.avgResponseTime, 0);
  const avgResponseTime = (totalResponseTime / totalAgents).toFixed(1);
  
  return {
    totalAgents,
    activeAgents,
    busyAgents,
    idleAgents,
    avgLoad: Math.round(avgLoad),
    totalTasks,
    avgResponseTime,
    status: avgLoad > 80 ? 'high-load' : avgLoad > 50 ? 'moderate' : 'optimal'
  };
};

// ═══════════════════════════════════════════════
// Personality DNA Helpers
// ═══════════════════════════════════════════════

/** Mood state definitions for UI rendering */
export const MOOD_STATES = {
  confident:     { emoji: '😎', label: 'Confident',      color: '#4CAF50' },
  focused:       { emoji: '🎯', label: 'Focused',        color: '#2196F3' },
  thinking:      { emoji: '🤔', label: 'Thinking',       color: '#FF9800' },
  alert:         { emoji: '🚨', label: 'Alert',          color: '#F44336' },
  learning:      { emoji: '📚', label: 'Learning',       color: '#9C27B0' },
  collaborative: { emoji: '🤝', label: 'Collaborating',  color: '#009688' },
  cautious:      { emoji: '⚠️', label: 'Cautious',       color: '#FFC107' },
  curious:       { emoji: '🔍', label: 'Curious',        color: '#00BCD4' },
  idle:          { emoji: '😴', label: 'Resting',        color: '#9E9E9E' },
  recovering:    { emoji: '🔧', label: 'Recovering',     color: '#795548' },
};

/** Get the emoji representing an agent's current mood */
export const getAgentMoodEmoji = (agent) => {
  return agent?.mood?.emoji || MOOD_STATES[agent?.mood?.current]?.emoji || '🤖';
};

/** Get a random domain-specific "thinking" phrase for an agent */
export const getAgentThinkingPhrase = (agent) => {
  const phrases = agent?.thinkingPhrases || ['Processing...'];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

/** Get a random personality-flavored greeting from an agent */
export const getAgentGreeting = (agent) => {
  const greetings = agent?.greetings || [`Hello, I'm ${agent?.name}.`];
  return greetings[Math.floor(Math.random() * greetings.length)];
};

/** Get the full agent objects for all agents a given agent collaborates with */
export const getCollaborators = (agentId) => {
  const agent = getAgent(agentId);
  if (!agent?.worksWellWith) return [];
  return agent.worksWellWith.map(id => getAgent(id)).filter(Boolean);
};

export default AGENTS;
