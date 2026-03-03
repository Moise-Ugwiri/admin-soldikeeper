/**
 * 🎯 PROJECT OLYMPUS - Agent Registry
 * 
 * Defines all 12 autonomous agents in the SoldiKeeper system.
 * Each agent has specific domains, autonomy levels, and capabilities.
 * 
 * This is the single source of truth for agent metadata.
 */

export const AGENTS = [
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
    currentTask: 'Orchestrating Mission Control UI redesign',
    status: 'busy',
    load: 65,
    tasksCompleted: 1247,
    avgResponseTime: 2.3,
    lastActive: new Date().toISOString(),
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
    load: 12,
    tasksCompleted: 523,
    avgResponseTime: 1.8,
    lastActive: new Date(Date.now() - 300000).toISOString(),
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
    currentTask: 'Calculating monthly budget allocations',
    status: 'busy',
    load: 34,
    tasksCompleted: 1892,
    avgResponseTime: 3.1,
    lastActive: new Date().toISOString(),
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
    load: 8,
    tasksCompleted: 687,
    avgResponseTime: 4.2,
    lastActive: new Date(Date.now() - 600000).toISOString(),
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
    currentTask: 'Analyzing spending patterns',
    status: 'busy',
    load: 45,
    tasksCompleted: 934,
    avgResponseTime: 5.7,
    lastActive: new Date().toISOString(),
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
    load: 23,
    tasksCompleted: 412,
    avgResponseTime: 2.1,
    lastActive: new Date(Date.now() - 900000).toISOString(),
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
    currentTask: 'Optimizing debt algorithm',
    status: 'busy',
    load: 67,
    tasksCompleted: 328,
    avgResponseTime: 3.8,
    lastActive: new Date().toISOString(),
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
    currentTask: 'Processing dashboard metrics',
    status: 'busy',
    load: 89,
    tasksCompleted: 2145,
    avgResponseTime: 1.5,
    lastActive: new Date().toISOString(),
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
    currentTask: 'Building Mission Control UI',
    status: 'busy',
    load: 78,
    tasksCompleted: 1567,
    avgResponseTime: 4.5,
    lastActive: new Date().toISOString(),
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
    load: 12,
    tasksCompleted: 89,
    avgResponseTime: 8.2,
    lastActive: new Date(Date.now() - 1800000).toISOString(),
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
    load: 34,
    tasksCompleted: 756,
    avgResponseTime: 6.1,
    lastActive: new Date(Date.now() - 1200000).toISOString(),
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
    load: 5,
    tasksCompleted: 234,
    avgResponseTime: 2.7,
    lastActive: new Date(Date.now() - 2400000).toISOString(),
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
  }
];

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

export default AGENTS;
