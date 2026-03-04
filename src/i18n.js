import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ─────────────────────────────────────────────────────────────────────────────
// Admin-Client Translation File
// Auto-generated comprehensive translations for the admin standalone app.
// Source: main client en/translation.json (admin, common, content sections)
// Total keys: 713 | Component keys covered: 334
// ─────────────────────────────────────────────────────────────────────────────

const translations = {
  "admin": {
    "actions": {
      "export": "Export",
      "logout": "Logout",
      "notifications": "Notifications",
      "refresh": "Refresh"
    },
    "activity": {
      "actions": {
        "create": "Created",
        "delete": "Deleted",
        "export": "Export",
        "login": "Logged In",
        "logout": "Logged Out",
        "refresh": "Refresh",
        "register": "Registered",
        "update": "Updated",
        "view": "Viewed"
      },
      "details": {
        "close": "Close",
        "ipAddress": "IP Address",
        "metadata": "Metadata",
        "severity": "Severity",
        "timestamp": "Timestamp",
        "title": "Activity Details",
        "type": "Type",
        "unknown": "Unknown",
        "user": "User",
        "userAgent": "User Agent"
      },
      "filters": {
        "allTypes": "All Types",
        "custom": "Custom",
        "dateRange": "Date Range",
        "endDate": "End Date",
        "startDate": "Start Date",
        "thisMonth": "This Month",
        "thisWeek": "This Week",
        "today": "Today",
        "type": "Type"
      },
      "pagination": {
        "rowsPerPage": "Rows per page:"
      },
      "resources": {
        "budget": "Budget",
        "category": "Category",
        "receipt": "Receipt",
        "splitbill": "Split Bill",
        "transaction": "Transaction",
        "user": "User"
      },
      "search": {
        "placeholder": "Search activity logs..."
      },
      "severity": {
        "error": "Error",
        "info": "Info",
        "success": "Success",
        "warning": "Warning"
      },
      "stats": {
        "errors": "Errors",
        "securityEvents": "Security Events",
        "todayTotal": "Today's Total",
        "userActivities": "User Activities"
      },
      "table": {
        "action": "Action",
        "details": "Details",
        "resource": "Resource",
        "severity": "Severity",
        "system": "System",
        "timestamp": "Timestamp",
        "type": "Type",
        "user": "User"
      },
      "types": {
        "admin": "Admin",
        "auth": "Authentication",
        "budget": "Budget",
        "category": "Category",
        "receipt": "Receipt",
        "security": "Security",
        "splitbill": "Split Bill",
        "system": "System",
        "transaction": "Transaction",
        "user": "User"
      },
      "views": {
        "table": "Table",
        "timeline": "Timeline"
      }
    },
    "analytics": {
      "actions": {
        "export": "Export Report",
        "refresh": "Refresh Data"
      },
      "advanced": {
        "automation": {
          "alerts": "Smart Alerts",
          "scheduled": "Scheduled Reports",
          "title": "Automated Reports & Alerts"
        },
        "charts": {
          "revenueGrowth": "Revenue Growth Analysis",
          "userDistribution": "User Distribution"
        },
        "createReport": "Create Report",
        "exportAll": "Export All",
        "filters": {
          "period": "Period"
        },
        "reportBuilder": {
          "cancel": "Cancel",
          "chartType": "Chart Type",
          "name": "Report Name",
          "save": "Save Report",
          "selectMetrics": "Select Metrics",
          "title": "Custom Report Builder"
        },
        "reports": {
          "createFirst": "Create your first custom report",
          "info": "Create custom reports by selecting metrics and visualization types.",
          "noReports": "No Custom Reports",
          "noReportsDesc": "You haven't created any custom reports yet. Use the report builder to create one.",
          "view": "View Report"
        },
        "schedule": "Schedule Reports",
        "stats": {
          "conversionRate": "Conversion Rate",
          "satisfaction": "User Satisfaction",
          "totalRevenue": "Total Revenue",
          "totalUsers": "Total Users"
        },
        "tabs": {
          "automation": "Automation",
          "customReports": "Custom Reports",
          "overview": "Overview",
          "trends": "Trends & Forecasting"
        },
        "title": "Advanced Analytics & Reporting",
        "trends": {
          "predictive": "Predictive Revenue & User Growth",
          "title": "Predictive Analytics",
          "warning": "Predictions are based on historical data and may not reflect future performance."
        }
      },
      "charts": {
        "engagement": "User Engagement Metrics",
        "revenue": "Revenue Trends",
        "subscriptionDistribution": "Subscription Distribution",
        "systemPerformance": "System Performance",
        "transactionVolume": "Transaction Volume",
        "userGrowth": "User Growth Over Time"
      },
      "controls": {
        "dateRange": "Date Range",
        "reportType": "Report Type"
      },
      "insights": {
        "needsAttention": "Needs Attention",
        "title": "Key Insights",
        "topPerforming": "Top Performing",
        "trending": "Trending"
      },
      "metrics": {
        "engagement": "User Engagement",
        "retention": "User Retention",
        "totalRevenue": "Total Revenue",
        "userGrowth": "User Growth"
      },
      "ranges": {
        "custom": "Custom Range",
        "last30Days": "Last 30 Days",
        "last7Days": "Last 7 Days",
        "last90Days": "Last 90 Days",
        "thisYear": "This Year"
      },
      "reports": {
        "financial": "Financial",
        "overview": "Overview",
        "system": "System",
        "users": "Users"
      }
    },
    "compliance": {
      "actions": {
        "close": "Close",
        "export": "Export",
        "exportLog": "Export Log",
        "exportReport": "Export Report",
        "refresh": "Refresh",
        "view": "View"
      },
      "filters": {
        "action": "Action",
        "allActions": "All Actions",
        "custom": "Custom",
        "dateRange": "Date Range",
        "last30Days": "Last 30 Days",
        "last7Days": "Last 7 Days",
        "today": "Today"
      },
      "gdpr": {
        "actions": {
          "approve": "Approve",
          "process": "Process",
          "reject": "Reject",
          "view": "View"
        },
        "details": {
          "description": "Description",
          "email": "Email",
          "title": "GDPR Request Details",
          "type": "Type"
        },
        "info": "GDPR requests must be processed within 30 days of receipt.",
        "table": {
          "actions": "Actions",
          "dueDate": "Due Date",
          "email": "Email",
          "requestDate": "Request Date",
          "status": "Status",
          "type": "Type"
        }
      },
      "logDetails": {
        "action": "Action",
        "details": "Details",
        "timestamp": "Timestamp",
        "title": "Audit Log Details",
        "user": "User"
      },
      "metrics": {
        "auditTrail": "Audit Trail",
        "dataRetention": "Data Retention",
        "gdprCompliance": "GDPR Compliance",
        "security": "Security Score"
      },
      "policies": {
        "dataAccess": "Data Access Policy",
        "dataAccessDesc": "Rules for accessing and managing user data",
        "dataRetention": "Data Retention Policy",
        "dataRetentionDesc": "Guidelines for data storage and deletion",
        "info": "Review and manage data privacy and security policies",
        "userConsent": "User Consent Policy",
        "userConsentDesc": "Requirements for obtaining user consent"
      },
      "reports": {
        "auditDescription": "Complete audit trail of all admin actions",
        "auditReport": "Audit Trail Report",
        "downloadAudit": "Download Audit Report",
        "downloadGdpr": "Download GDPR Report",
        "gdprDescription": "GDPR request processing and compliance status",
        "gdprReport": "GDPR Compliance Report"
      },
      "search": {
        "placeholder": "Search audit logs..."
      },
      "table": {
        "action": "Action",
        "actions": "Actions",
        "resource": "Resource",
        "severity": "Severity",
        "timestamp": "Timestamp",
        "user": "User"
      },
      "tabs": {
        "auditLog": "Audit Log",
        "gdpr": "GDPR Requests",
        "policies": "Policies",
        "reports": "Reports"
      },
      "title": "Compliance & Audit"
    },
    "content": {
      "actions": {
        "archive": "Archive",
        "delete": "Delete",
        "duplicate": "Duplicate",
        "edit": "Edit",
        "preview": "Preview",
        "publish": "Publish",
        "schedule": "Schedule",
        "send": "Send",
        "view": "View"
      },
      "campaigns": {
        "create": "Create Campaign",
        "metrics": {
          "clickRate": "Click Rate",
          "conversions": "Conversions",
          "emailsClicked": "Emails Clicked",
          "emailsOpened": "Emails Opened",
          "emailsSent": "Emails Sent",
          "openRate": "Open Rate",
          "performance": "Performance",
          "revenue": "Revenue",
          "sent": "Sent",
          "sentDate": "Sent Date"
        },
        "table": {
          "actions": "Actions",
          "clicked": "Clicked",
          "opened": "Opened",
          "recipients": "Recipients",
          "sent": "Sent Date",
          "status": "Status",
          "subject": "Subject",
          "title": "Title"
        },
        "title": "Email Campaigns"
      },
      "contentAnalytics": {
        "contentPerformance": "Content Performance",
        "engagement": "Communication Engagement",
        "metrics": {
          "clickRate": "Click Rate",
          "contentViews": "Content Views",
          "conversions": "Conversions",
          "emailMetrics": "Email Metrics",
          "engagement": "Engagement",
          "openRate": "Open Rate",
          "supportMetrics": "Support Metrics",
          "views": "Views"
        }
      },
      "contentTemplates": {
        "create": "Create Template",
        "title": "Content Templates"
      },
      "createContent": "Create Content",
      "forms": {
        "categories": {
          "budgeting": "Budgeting",
          "features": "Features",
          "general": "General",
          "onboarding": "Onboarding",
          "troubleshooting": "Troubleshooting"
        },
        "category": "Category",
        "content": "Content",
        "placeholder": "Write your content here...",
        "publish": "Publish",
        "saveAsDraft": "Save as Draft",
        "title": "Title",
        "type": "Type",
        "types": {
          "article": "Article",
          "faq": "FAQ",
          "guide": "Guide",
          "video": "Video"
        }
      },
      "helpCenter": {
        "create": "Create Content",
        "table": {
          "actions": "Actions",
          "category": "Category",
          "helpful": "Helpful Votes",
          "lastUpdated": "Last Updated",
          "status": "Status",
          "title": "Title",
          "type": "Type",
          "views": "Views"
        },
        "title": "Help Center Content"
      },
      "notifications": {
        "create": "Create Notification",
        "table": {
          "actions": "Actions",
          "clicked": "Clicked",
          "opened": "Opened",
          "recipients": "Recipients",
          "sent": "Sent",
          "status": "Status",
          "title": "Title",
          "type": "Type"
        },
        "title": "System Notifications"
      },
      "stats": {
        "monthlyViews": "Monthly Views",
        "responseTime": "Avg Response Time",
        "satisfaction": "User Satisfaction",
        "totalContent": "Total Content"
      },
      "status": {
        "active": "Active",
        "archived": "Archived",
        "draft": "Draft",
        "inactive": "Inactive",
        "pending": "Pending",
        "published": "Published",
        "scheduled": "Scheduled",
        "sent": "Sent"
      },
      "support": {
        "ticketCategories": "Support Ticket Categories",
        "title": "Support Analytics"
      },
      "tabs": {
        "campaigns": "Email Campaigns",
        "contentAnalytics": "Analytics",
        "contentTemplates": "Templates",
        "helpCenter": "Help Center",
        "notifications": "Notifications",
        "support": "Support"
      },
      "title": "Content & Communication Management",
      "tooltips": {
        "createCampaign": "Create Campaign",
        "createContent": "Create Content",
        "createNotification": "Create Notification",
        "delete": "Delete",
        "edit": "Edit",
        "manageTemplates": "Manage Templates"
      }
    },
    "dashboard": {
      "subtitle": "Monitor and manage your platform",
      "title": "Admin Dashboard"
    },
    "errors": {
      "accessDenied": "Access denied. Admin privileges required."
    },
    "export": {
      "csv": "Export as CSV",
      "excel": "Export as Excel",
      "pdf": "Export as PDF"
    },
    "financial": {
      "analytics": {
        "profitability": "Profitability Analysis",
        "unitEconomics": "Unit Economics"
      },
      "cashFlow": {
        "analysis": "Cash Flow Analysis"
      },
      "costs": {
        "breakdown": "Cost Breakdown",
        "noData": "No cost data available",
        "noDataDes": "Cost tracking data will appear once platform costs are recorded.",
        "trends": "Cost Trends"
      },
      "export": "Export Report",
      "forecasting": {
        "configure": "Configure Forecast",
        "notAvailable": "Forecasting unavailable",
        "notAvailableDes": "Insufficient data for projections. Data will appear once more activity is recorded.",
        "revenue": "Revenue Forecasting"
      },
      "overview": {
        "alerts": "Financial Alerts",
        "quickStats": "Quick Statistics",
        "revenueGrowth": "Revenue Growth Trend"
      },
      "period": "Period",
      "refresh": "Refresh Data",
      "revenue": {
        "mrrTrend": "Monthly Recurring Revenue Trend",
        "paymentMethods": "Payment Methods"
      },
      "subscriptions": {
        "cohortAnalysis": "Cohort Analysis",
        "details": "Subscription Details",
        "distribution": "Subscription Distribution"
      },
      "tabs": {
        "analytics": "Business Analytics",
        "cashFlow": "Cash Flow",
        "costs": "Cost Analysis",
        "forecasting": "Forecasting",
        "overview": "Overview",
        "revenue": "Revenue Analytics",
        "subscriptions": "Subscriptions"
      },
      "title": "Financial Intelligence"
    },
    "layout": {
      "customize": "Customize Layout",
      "dragToReorder": "Drag to reorder",
      "resetDefault": "Reset to Default"
    },
    "notifications": {
      "all": "All",
      "clearAll": "Clear All",
      "empty": "No notifications",
      "markAllRead": "Mark All as Read",
      "title": "Notifications",
      "unread": "Unread",
      "viewAll": "View All Notifications"
    },
    "overview": {
      "activity": {
        "largeTransaction": "Large transaction detected",
        "newUserRegistered": "New user registered",
        "securityAlert": "Security alert triggered",
        "systemUpdate": "System update completed"
      },
      "charts": {
        "revenue": "Revenue Overview",
        "transactionTypes": "Transaction Types",
        "userGrowth": "User Growth"
      },
      "metrics": {
        "averageSessionTime": "Average Session Time",
        "conversionRate": "Conversion Rate",
        "errorRate": "Error Rate",
        "minutes": "min",
        "responseTime": "Response Time"
      },
      "noSecurityAlerts": "No security alerts",
      "platformMetrics": "Platform Metrics",
      "quickActions": {
        "addUser": "Add User",
        "alerts": "View Alerts",
        "backup": "Backup",
        "export": "Export",
        "notify": "Notify",
        "refresh": "Refresh Data",
        "report": "Report",
        "settings": "Settings",
        "title": "Quick Actions"
      },
      "recentActivity": "Recent Activity",
      "securityAlerts": "Security Alerts",
      "status": {
        "critical": "Critical",
        "excellent": "Excellent",
        "good": "Good",
        "warning": "Warning"
      },
      "system": {
        "memory": "Memory",
        "network": "Network",
        "performance": "Performance",
        "storage": "Storage"
      },
      "systemHealth": "System Health",
      "transactions": {
        "expenses": "Expenses",
        "income": "Income"
      }
    },
    "reports": {
      "scheduler": {
        "addSchedule": "Add Schedule",
        "subtitle": "Automate your report generation",
        "title": "Report Scheduler"
      }
    },
    "security": {
      "actions": {
        "blockIP": "Block IP",
        "refresh": "Refresh"
      },
      "alertDetails": {
        "close": "Close",
        "details": "Details",
        "ip": "IP Address",
        "message": "Message",
        "severity": "Severity",
        "timestamp": "Timestamp",
        "title": "Alert Details",
        "type": "Type",
        "user": "User"
      },
      "alerts": {
        "actions": "Actions",
        "message": "Message",
        "search": "Search alerts...",
        "severity": "Severity",
        "time": "Time",
        "title": "Security Alerts",
        "type": "Type"
      },
      "blockedIPs": {
        "empty": "No blocked IP addresses",
        "title": "Blocked IP Addresses"
      },
      "settings": {
        "cancel": "Cancel",
        "maxAttempts": "Max Login Attempts",
        "requireTwoFactor": "Require Two-Factor Authentication",
        "save": "Save",
        "sessionTimeout": "Session Timeout",
        "title": "Security Settings",
        "twoFactor": "Two-Factor Authentication"
      },
      "stats": {
        "blockedIPs": "Blocked IPs",
        "failedLogins": "Failed Logins",
        "securityAlerts": "Security Alerts",
        "successfulLogins": "Successful Logins"
      }
    },
    "settings": {
      "actions": {
        "refresh": "Refresh",
        "save": "Save Settings"
      },
      "backup": {
        "actions": "Backup Actions",
        "autoBackup": "Auto Backup",
        "createBackup": "Create Backup",
        "daily": "Daily",
        "frequency": "Backup Frequency",
        "hourly": "Hourly",
        "lastBackup": "Last Backup",
        "monthly": "Monthly",
        "restoreBackup": "Restore Backup",
        "retentionDays": "Retention Days",
        "settings": "Backup Settings",
        "weekly": "Weekly"
      },
      "email": {
        "fromEmail": "From Email",
        "fromName": "From Name",
        "smtpHost": "SMTP Host",
        "smtpPassword": "SMTP Password",
        "smtpPort": "SMTP Port",
        "smtpUser": "SMTP Username"
      },
      "general": {
        "emailVerification": "Email Verification",
        "maintenanceMode": "Maintenance Mode",
        "siteDescription": "Site Description",
        "siteName": "Site Name",
        "systemSettings": "System Settings",
        "userRegistration": "User Registration"
      },
      "integrations": {
        "analytics": "Analytics Integration",
        "crashReporting": "Crash Reporting",
        "googleAnalytics": "Google Analytics",
        "payment": "Payment Integration"
      },
      "maintenance": {
        "actions": "Maintenance Actions",
        "autoUpdates": "Auto Updates",
        "cacheEnabled": "Cache Enabled",
        "clearCache": "Clear Cache",
        "debugMode": "Debug Mode",
        "logLevel": "Log Level",
        "optimizeDatabase": "Optimize Database",
        "system": "System Maintenance",
        "viewLogs": "View Logs"
      },
      "messages": {
        "backupCreated": "Backup created successfully",
        "error": "Error saving settings",
        "saved": "Settings saved successfully"
      },
      "notifications": {
        "emailDesc": "Send important updates via email",
        "emailNotifications": "Email Notifications",
        "pushDesc": "Enable push notifications for real-time updates",
        "pushNotifications": "Push Notifications",
        "securityAlerts": "Security Alerts",
        "securityDesc": "Get notified about security events",
        "systemAlerts": "System Alerts",
        "systemDesc": "Receive alerts about system performance",
        "title": "Notification Settings"
      },
      "tabs": {
        "backup": "Backup",
        "email": "Email",
        "general": "General",
        "integrations": "Integrations",
        "maintenance": "Maintenance",
        "notifications": "Notifications"
      },
      "title": "System Settings"
    },
    "stats": {
      "activeSessions": "Active Sessions",
      "notPlatformRevenue": "(Not platform revenue)",
      "thisMonth": "this month",
      "totalTransactions": "Total Transactions",
      "totalUserIncome": "User Income Tracked",
      "totalUsers": "Total Users"
    },
    "tabs": {
      "activity": "Activity",
      "advancedAnalytics": "Advanced Analytics",
      "analytics": "Analytics",
      "compliance": "Compliance & Audit",
      "content": "Content & Communication",
      "enhancedUsers": "Enhanced Users",
      "financial": "Financial Intelligence",
      "overview": "Overview",
      "security": "Security",
      "settings": "Settings",
      "transactions": "Transactions",
      "users": "Users"
    },
    "transactions": {
      "actions": {
        "approve": "Approve",
        "export": "Export Transactions",
        "flag": "Flag",
        "refresh": "Refresh Transactions",
        "reject": "Reject",
        "unflag": "Unflag",
        "viewDetails": "View Details"
      },
      "details": {
        "amount": "Amount",
        "category": "Category",
        "close": "Close",
        "date": "Date",
        "description": "Description",
        "noDescription": "No description",
        "status": "Status",
        "title": "Transaction Details",
        "type": "Type"
      },
      "filters": {
        "allStatuses": "All Statuses",
        "allTime": "All Time",
        "allTypes": "All Types",
        "completed": "Completed",
        "dateRange": "Date Range",
        "expense": "Expense",
        "failed": "Failed",
        "income": "Income",
        "pending": "Pending",
        "status": "Status",
        "thisMonth": "This Month",
        "thisWeek": "This Week",
        "thisYear": "This Year",
        "today": "Today",
        "transfer": "Transfer",
        "type": "Type"
      },
      "labels": {
        "flagged": "Flagged"
      },
      "pagination": {
        "rowsPerPage": "Rows per page:"
      },
      "search": {
        "placeholder": "Search transactions..."
      },
      "stats": {
        "flaggedTransactions": "Flagged Transactions",
        "suspiciousActivity": "Suspicious Activity",
        "totalTransactions": "Total Transactions",
        "totalVolume": "Total Volume"
      },
      "table": {
        "actions": "Actions",
        "amount": "Amount",
        "date": "Date",
        "noDescription": "No description",
        "status": "Status",
        "transaction": "Transaction",
        "type": "Type",
        "unknownUser": "Unknown User",
        "user": "User"
      }
    },
    "users": {
      "actions": {
        "activate": "Activate",
        "delete": "Delete",
        "edit": "Edit",
        "export": "Export",
        "refresh": "Refresh",
        "suspend": "Suspend"
      },
      "delete": {
        "cancel": "Cancel",
        "confirm": "Delete",
        "confirmation": "Are you sure you want to delete {{name}}?",
        "title": "Delete User",
        "warning": "This action is permanent and cannot be undone."
      },
      "edit": {
        "cancel": "Cancel",
        "email": "Email",
        "name": "Full Name",
        "save": "Save Changes",
        "status": "Status",
        "subscription": "Subscription",
        "title": "Edit User"
      },
      "enhanced": {
        "actions": {
          "edit": "Edit User",
          "more": "More Actions",
          "viewJourney": "View Journey"
        },
        "addUser": "Add User",
        "analytics": {
          "engagement": "User Engagement",
          "userGrowth": "User Growth Trend"
        },
        "bulk": {
          "batchUpdate": "Batch Profile Update",
          "batchUpdateDesc": "Update multiple user profiles simultaneously",
          "block": "Block Users",
          "cancel": "Cancel",
          "communication": "Communication Tools",
          "configure": "Configure Update",
          "confirm": "Confirm",
          "confirmMessage": "Are you sure you want to {{action}} {{count}} users?",
          "confirmTitle": "Confirm Bulk Action",
          "create": "Create Campaign",
          "delete": "Delete Users",
          "email": "Send Email",
          "management": "User Management",
          "massEmail": "Mass Email Campaign",
          "massEmailDesc": "Send targeted emails to selected user groups",
          "migration": "User Data Migration",
          "migrationDesc": "Migrate users between systems or update in bulk",
          "newsletter": "Newsletter Campaign",
          "newsletterDesc": "Create and send newsletters to subscribers",
          "start": "Start Migration",
          "warning": "Bulk operations can affect multiple users. Please proceed with caution."
        },
        "export": "Export Users",
        "filters": {
          "sortBy": "Sort By",
          "status": "Status"
        },
        "import": "Import Users",
        "journey": {
          "close": "Close",
          "title": "User Journey"
        },
        "journeys": {
          "info": "Track user progression through key milestones and identify drop-off points.",
          "onboarding": "Onboarding Funnel",
          "title": "User Journey Analytics"
        },
        "search": {
          "placeholder": "Search users by name, email, or ID..."
        },
        "segmentation": {
          "analyze": "Analyze Segment",
          "descriptions": {
            "at_risk": "Users showing signs of reduced engagement",
            "high_value": "Users with high lifetime value and engagement",
            "inactive": "Users who haven't been active recently",
            "new_user": "Recently registered users in onboarding phase"
          },
          "info": "User segmentation helps you understand different user groups and their behaviors."
        },
        "table": {
          "actions": "Actions",
          "engagement": "Engagement",
          "lastLogin": "Last Login",
          "role": "Role",
          "status": "Status",
          "totalSpent": "Total Spent",
          "user": "User"
        },
        "tabs": {
          "analytics": "Analytics",
          "bulkOperations": "Bulk Operations",
          "journeys": "User Journeys",
          "segmentation": "Segmentation",
          "userList": "User List"
        },
        "title": "Enhanced User Management"
      },
      "filters": {
        "active": "Active",
        "allStatus": "All Status",
        "allTime": "All Time",
        "dateRange": "Date Range",
        "pending": "Pending",
        "status": "Status",
        "suspended": "Suspended",
        "thisMonth": "This Month",
        "thisWeek": "This Week",
        "thisYear": "This Year",
        "today": "Today"
      },
      "pagination": {
        "rowsPerPage": "Rows per page:"
      },
      "search": {
        "placeholder": "Search users by name or email..."
      },
      "stats": {
        "activeUsers": "Active Users",
        "blockedUsers": "Blocked Users",
        "newUsers": "New Users",
        "totalUsers": "Total Users"
      },
      "status": {
        "active": "Active",
        "deleted": "Deleted",
        "pending": "Pending",
        "suspended": "Suspended"
      },
      "subscription": {
        "business": "Business",
        "family": "Family",
        "free": "Free",
        "premium": "Premium",
        "standard": "Standard"
      },
      "table": {
        "actions": "Actions",
        "email": "Email",
        "joinDate": "Join Date",
        "lastActive": "Last Active",
        "never": "Never",
        "status": "Status",
        "subscription": "Subscription",
        "unnamed": "Unnamed User",
        "user": "User"
      }
    }
  },
  "common": {
    "accessDenied": "Access Denied",
    "advancedExport": "Advanced Export",
    "back": "Back",
    "cancel": "Cancel",
    "close": "Close",
    "collapse": "Collapse",
    "confirm": "Confirm",
    "darkMode": "Dark Mode",
    "daysAgo": "{{count}} days ago",
    "delete": "Delete",
    "deleting": "Deleting...",
    "deselectAll": "Deselect All",
    "dragToReorder": "Drag to Reorder",
    "edit": "Edit",
    "emailExport": "Email Export",
    "error": "Error",
    "exitFullscreen": "Exit Fullscreen",
    "expand": "Expand",
    "export": "Export",
    "exportData": "Export Data",
    "exporting": "Exporting...",
    "exportingRows": "Exporting Rows",
    "fullscreen": "Fullscreen",
    "goBack": "Go Back",
    "hoursAgo": "{{count}} hours ago",
    "justNow": "Just now",
    "language": "Language",
    "loading": "Loading...",
    "minutesAgo": "{{count}} minutes ago",
    "no": "No",
    "noPermission": "No Permission",
    "print": "Print",
    "refresh": "Refresh",
    "remove": "Remove",
    "save": "Save Changes",
    "saving": "Saving...",
    "selectAll": "Select All",
    "selectColumns": "Select Columns",
    "selectFormat": "Select Format",
    "settings": "Settings",
    "start": "Start",
    "success": "Success",
    "try": "Try Again",
    "yes": "Yes"
  },
  "content": {
    "tooltips": {
      "createCampaign": "Create Campaign",
      "createContent": "Create Content",
      "createNotification": "Create Notification",
      "manageTemplates": "Manage Templates"
    }
  },
  "errors": {
    "email": "Please enter a valid email address",
    "general": "Something went wrong. Please try again.",
    "network": "Network error. Please check your connection.",
    "notFound": "The requested resource was not found.",
    "password": "Password must be at least 8 characters long",
    "passwordMatch": "Passwords do not match",
    "required": "This field is required",
    "unauthorized": "You are not authorized to perform this action.",
    "validation": "Please check your input and try again."
  },
  "navigation": {
    "budgets": "Budgets",
    "dashboard": "Dashboard",
    "features": "Features",
    "logout": "Logout",
    "pricing": "Pricing",
    "profile": "Profile",
    "receipts": "Receipts",
    "recurringTemplates": "Recurring Templates",
    "settings": "Settings",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "splitBills": "SplitSmart",
    "transactions": "Transactions"
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: translations,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  parseMissingKeyHandler: (key) => {
    const lastPart = key.split('.').pop();
    return lastPart
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  },
});

export default i18n;
