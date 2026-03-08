/**
 * pdfReportGenerator.js
 * Beautiful, branded PDF report generation for SoldiKeeper Admin Dashboard.
 * Uses jsPDF 4.x (built-in table support, no plugins required).
 */
import { jsPDF } from 'jspdf';

// ─── Brand constants ────────────────────────────────────────────────────────
const BRAND = {
  name: 'SoldiKeeper',
  tagline: 'Smart Financial Management Platform',
  green:      [27,  94,  32],   // #1B5E20
  greenMid:   [46, 125,  50],   // #2E7D32
  greenLight: [76, 175,  80],   // #4CAF50
  greenPale:  [232,245, 233],   // #E8F5E9
  blue:       [21,  101, 192],  // #1565C0
  blueLight:  [33, 150, 243],   // #2196F3
  bluePale:   [227,242, 253],   // #E3F2FD
  purple:     [106,  27, 154],  // #6A1B9A
  amber:      [245, 127,  23],  // #F57F17
  red:        [183,  28,  28],  // #B71C1C
  dark:       [33,   33,  33],  // #212121
  mid:        [97,   97,  97],  // #616161
  light:      [224, 224, 224],  // #E0E0E0
  white:      [255, 255, 255],
  rowAlt:     [249, 249, 249],  // #F9F9F9
};

// ─── Page layout ─────────────────────────────────────────────────────────────
const PAGE = { w: 210, h: 297, ml: 14, mr: 14 };
const CONTENT_W = PAGE.w - PAGE.ml - PAGE.mr;  // 182mm usable width

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setFill(doc, color) { doc.setFillColor(color[0], color[1], color[2]); }
function setDraw(doc, color) { doc.setDrawColor(color[0], color[1], color[2]); }
function setTxt(doc, color)  { doc.setTextColor(color[0], color[1], color[2]); }

function fmt(val, decimals = 0) {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtCurrency(val, symbol = '$') {
  const n = Number(val);
  if (isNaN(n)) return '—';
  return symbol + fmt(n, 2);
}

function fmtPct(val) {
  const n = Number(val);
  if (isNaN(n)) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
}

// ─── Header / Footer ──────────────────────────────────────────────────────────
function addPageHeader(doc, title, subtitle = '', pageNum = 1) {
  const w = PAGE.w;

  // Dark green banner
  setFill(doc, BRAND.green);
  doc.rect(0, 0, w, 28, 'F');

  // Accent stripe
  setFill(doc, BRAND.greenLight);
  doc.rect(0, 28, w, 2, 'F');

  // Brand name
  setTxt(doc, BRAND.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(BRAND.name.toUpperCase(), PAGE.ml, 11);

  // Page number (top right)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Page ${pageNum}`, w - PAGE.mr, 11, { align: 'right' });

  // Report title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, PAGE.ml, 22);

  // Subtitle
  if (subtitle) {
    setTxt(doc, [200, 230, 201]);  // pale green
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, PAGE.ml + 1, 27);
  }

  return 36; // y position after header
}

function addPageFooter(doc, pageNum, totalPages, generatedBy = 'Admin') {
  const y = PAGE.h - 8;
  const w = PAGE.w;

  // Separator line
  setDraw(doc, BRAND.greenLight);
  doc.setLineWidth(0.3);
  doc.line(PAGE.ml, y - 3, w - PAGE.mr, y - 3);

  setTxt(doc, BRAND.mid);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${BRAND.name} Admin Report  ·  Generated ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })} by ${generatedBy}`,
    PAGE.ml, y
  );
  doc.text(`Page ${pageNum} of ${totalPages}`, w - PAGE.mr, y, { align: 'right' });
}

// ─── Section header ───────────────────────────────────────────────────────────
function addSectionHeader(doc, title, y) {
  setFill(doc, BRAND.greenPale);
  doc.rect(PAGE.ml, y, CONTENT_W, 7, 'F');
  setDraw(doc, BRAND.greenMid);
  doc.setLineWidth(0.4);
  doc.line(PAGE.ml, y + 7, PAGE.ml + CONTENT_W, y + 7);

  setTxt(doc, BRAND.green);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title.toUpperCase(), PAGE.ml + 3, y + 5.2);
  return y + 12;
}

// ─── KPI cards row ─────────────────────────────────────────────────────────
/** kpis: [{ label, value, sub, color? }] - up to 4 per row */
function addKPIRow(doc, kpis, y, cardH = 22) {
  const n = Math.min(kpis.length, 4);
  const gap = 3;
  const cardW = (CONTENT_W - (n - 1) * gap) / n;

  kpis.slice(0, n).forEach((kpi, i) => {
    const x = PAGE.ml + i * (cardW + gap);
    const color = kpi.color || BRAND.greenMid;

    // Card background
    setFill(doc, color);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F');

    // Label
    setTxt(doc, [200, 230, 201]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(kpi.label, x + cardW / 2, y + 6, { align: 'center' });

    // Value
    setTxt(doc, BRAND.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(String(kpi.value ?? '—'), x + cardW / 2, y + 15, { align: 'center' });

    // Sub
    if (kpi.sub) {
      setTxt(doc, [200, 230, 201]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(String(kpi.sub), x + cardW / 2, y + 20, { align: 'center' });
    }
  });

  return y + cardH + 4;
}

// ─── Data table ───────────────────────────────────────────────────────────────
/**
 * Draws a styled table.
 * @param {jsPDF} doc
 * @param {string[]} headers - Column labels
 * @param {Array<string[]>} rows - 2D array of string values
 * @param {number} y - start Y
 * @param {object} opts
 * @returns {number} y after table
 */
function addTable(doc, headers, rows, y, opts = {}) {
  const {
    colWidths,       // optional array of column widths in mm
    fontSize = 8,
    headerColor = BRAND.greenMid,
    rowH = 6,
  } = opts;

  const n = headers.length;
  // Auto-distribute widths if not provided
  const widths = colWidths || headers.map(() => CONTENT_W / n);

  const startX = PAGE.ml;
  const headerH = rowH + 1;

  // ── Header row ──────────────────────────────────────────────────────────────
  setFill(doc, headerColor);
  doc.rect(startX, y, CONTENT_W, headerH, 'F');
  setTxt(doc, BRAND.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize);

  let cx = startX;
  headers.forEach((h, i) => {
    const w = widths[i];
    doc.text(String(h), cx + 2, y + headerH - 1.5);
    cx += w;
  });
  y += headerH;

  // ── Data rows ────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  rows.forEach((row, ri) => {
    // Page overflow check
    if (y + rowH > PAGE.h - 15) {
      doc.addPage();
      y = 40;
      // Re-draw header on new page
      setFill(doc, headerColor);
      doc.rect(startX, y, CONTENT_W, headerH, 'F');
      setTxt(doc, BRAND.white);
      doc.setFont('helvetica', 'bold');
      let cx2 = startX;
      headers.forEach((h, i) => {
        doc.text(String(h), cx2 + 2, y + headerH - 1.5);
        cx2 += widths[i];
      });
      doc.setFont('helvetica', 'normal');
      y += headerH;
    }

    // Alternating row bg
    if (ri % 2 === 0) {
      setFill(doc, BRAND.rowAlt);
      doc.rect(startX, y, CONTENT_W, rowH, 'F');
    }

    setTxt(doc, BRAND.dark);
    let cx3 = startX;
    row.forEach((cell, ci) => {
      const txt = String(cell ?? '—');
      const maxW = widths[ci] - 4;
      // Clip long text
      const fitted = doc.splitTextToSize(txt, maxW);
      doc.text(fitted[0] || '', cx3 + 2, y + rowH - 1.5);
      cx3 += widths[ci];
    });

    // Bottom border (light)
    setDraw(doc, BRAND.light);
    doc.setLineWidth(0.1);
    doc.line(startX, y + rowH, startX + CONTENT_W, y + rowH);
    y += rowH;
  });

  // Table outer border
  setDraw(doc, BRAND.greenMid);
  doc.setLineWidth(0.3);
  doc.rect(startX, y - rows.length * rowH - headerH, CONTENT_W, rows.length * rowH + headerH);

  return y + 4;
}

// ─── Cover page ───────────────────────────────────────────────────────────────
function addCoverPage(doc, reportTitle, meta = {}) {
  const w = PAGE.w; const h = PAGE.h;

  // Top green band
  setFill(doc, BRAND.green);
  doc.rect(0, 0, w, 80, 'F');

  // Decorative circle accent
  setFill(doc, BRAND.greenMid);
  doc.circle(w - 35, 35, 45, 'F');
  setFill(doc, BRAND.green);
  doc.circle(w - 25, 25, 35, 'F');

  // Logo text
  setTxt(doc, BRAND.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.text(BRAND.name, 20, 35);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  setTxt(doc, [200, 230, 201]);
  doc.text(BRAND.tagline, 20, 45);

  // Green stripe
  setFill(doc, BRAND.greenLight);
  doc.rect(0, 80, w, 3, 'F');

  // Report title block
  setTxt(doc, BRAND.dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(reportTitle, 20, 115);

  // Underline
  setFill(doc, BRAND.greenLight);
  doc.rect(20, 119, 100, 1.5, 'F');

  // Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  setTxt(doc, BRAND.mid);
  let my = 135;
  const metaItems = [
    ['Generated',  new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })],
    ['Generated by', meta.generatedBy || 'Admin'],
    ...(meta.dateRange ? [['Period', meta.dateRange]] : []),
    ...(meta.totalRecords !== undefined ? [['Total Records', String(meta.totalRecords)]] : []),
    ...(meta.version ? [['Platform Version', meta.version]] : []),
  ];
  metaItems.forEach(([label, val]) => {
    setTxt(doc, BRAND.mid);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 20, my);
    doc.setFont('helvetica', 'normal');
    setTxt(doc, BRAND.dark);
    doc.text(val, 80, my);
    my += 9;
  });

  // Bottom band
  setFill(doc, BRAND.greenPale);
  doc.rect(0, h - 30, w, 30, 'F');
  setDraw(doc, BRAND.greenLight);
  doc.setLineWidth(0.5);
  doc.line(0, h - 30, w, h - 30);

  setTxt(doc, BRAND.greenMid);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('CONFIDENTIAL — For internal administrative use only', w / 2, h - 12, { align: 'center' });
}

// ─── Report generators ────────────────────────────────────────────────────────

/**
 * Generate Dashboard Overview Report
 * @param {object} stats - adminStats from AdminContext
 * @returns {jsPDF} doc
 */
export function generateDashboardReport(stats = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Cover
  addCoverPage(doc, 'Dashboard Overview Report', {
    generatedBy: 'Admin',
    version: '1.0',
  });

  // Page 2 — main content
  doc.addPage();
  let y = addPageHeader(doc, 'Dashboard Overview', `Generated ${new Date().toLocaleDateString()}`, 1);

  // KPI row 1
  y = addSectionHeader(doc, 'Platform Summary', y);
  y = addKPIRow(doc, [
    { label: 'Total Users',       value: fmt(stats.totalUsers),        sub: 'registered accounts', color: BRAND.greenMid },
    { label: 'Active Users',      value: fmt(stats.activeUsers),       sub: 'last 30 days',        color: BRAND.blueLight },
    { label: 'New Users (Month)', value: fmt(stats.newUsers),          sub: 'this month',           color: BRAND.purple },
    { label: 'Premium Users',     value: fmt(stats.premiumUsers),      sub: 'paid subscribers',    color: BRAND.amber },
  ], y);

  // KPI row 2
  y = addKPIRow(doc, [
    { label: 'Total Transactions', value: fmt(stats.totalTransactions), sub: 'all time',             color: BRAND.greenMid },
    { label: 'Total Income',       value: fmtCurrency(stats.totalUserIncome || 0), sub: 'across all users', color: BRAND.blueLight },
    { label: 'Total Expenses',     value: fmtCurrency(stats.totalUserExpenses || 0), sub: 'across all users', color: BRAND.red },
    { label: 'Platform MRR',       value: fmtCurrency(stats.mrr || 0), sub: 'monthly recurring',   color: BRAND.amber },
  ], y);

  y += 4;

  // Summary table
  y = addSectionHeader(doc, 'Key Metrics', y);
  const tableHeaders = ['Metric', 'Value', 'Notes'];
  const tableRows = [
    ['Total Registered Users',     fmt(stats.totalUsers),              'All time registrations'],
    ['Active Users (30d)',          fmt(stats.activeUsers),             'Logged in within 30 days'],
    ['New Signups This Month',      fmt(stats.newUsers),                'Calendar month'],
    ['Premium Subscribers',         fmt(stats.premiumUsers),            'Paid plan users'],
    ['Free Plan Users',             fmt((stats.totalUsers || 0) - (stats.premiumUsers || 0)), 'Free tier'],
    ['Total Transactions',          fmt(stats.totalTransactions),       'All transactions created'],
    ['User-Reported Income',        fmtCurrency(stats.totalUserIncome || 0), 'Sum of income transactions'],
    ['User-Reported Expenses',      fmtCurrency(stats.totalUserExpenses || 0), 'Sum of expense transactions'],
    ['Avg Transactions / User',     fmt(stats.avgTransactionsPerUser || 0, 1), 'Engagement metric'],
    ['Security Alerts (Active)',    fmt(stats.securityAlerts),          'Requires attention'],
    ['System Health Score',         (stats.systemHealth || 100) + '%',  'Uptime / performance'],
  ];
  addTable(doc, tableHeaders, tableRows, y, {
    colWidths: [78, 42, 62],
    fontSize: 8,
  });

  // Footer
  addPageFooter(doc, 1, doc.getNumberOfPages(), 'Admin');
  return doc;
}

/**
 * Generate User Report
 */
export function generateUsersReport(users = []) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  addCoverPage(doc, 'User Management Report', {
    totalRecords: users.length,
  });
  doc.addPage();

  let pageNum = 1;
  let y = addPageHeader(doc, 'User Directory', `${users.length} total users  ·  ${new Date().toLocaleDateString()}`, pageNum);

  // Summary KPIs
  const active = users.filter(u => u.status === 'active').length;
  const premium = users.filter(u => u.subscription?.plan && u.subscription.plan !== 'free').length;
  y = addKPIRow(doc, [
    { label: 'Total Users',   value: fmt(users.length), color: BRAND.greenMid },
    { label: 'Active',        value: fmt(active),        color: BRAND.blueLight },
    { label: 'Premium',       value: fmt(premium),       color: BRAND.amber },
    { label: 'Free',          value: fmt(users.length - premium), color: BRAND.mid },
  ], y);

  y = addSectionHeader(doc, 'User List', y);
  const headers = ['Name', 'Email', 'Plan', 'Status', 'Joined'];
  const rows = users.map(u => [
    u.name || '—',
    u.email || '—',
    u.subscription?.plan || 'free',
    u.status || 'active',
    u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
  ]);
  addTable(doc, headers, rows, y, { colWidths: [40, 58, 22, 22, 26], fontSize: 7.5 });

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    if (p > 1) addPageFooter(doc, p, total);
  }
  addPageFooter(doc, 1, total);
  return doc;
}

/**
 * Generate Transaction Report
 */
export function generateTransactionsReport(transactions = []) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  addCoverPage(doc, 'Transaction Report', { totalRecords: transactions.length });
  doc.addPage();

  let y = addPageHeader(doc, 'Transactions', `${transactions.length} records  ·  ${new Date().toLocaleDateString()}`, 1);

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  y = addKPIRow(doc, [
    { label: 'Total Records', value: fmt(transactions.length),  color: BRAND.greenMid },
    { label: 'Total Income',  value: fmtCurrency(income),       color: BRAND.blueLight },
    { label: 'Total Expense', value: fmtCurrency(expense),      color: BRAND.red },
    { label: 'Net',           value: fmtCurrency(income - expense), color: income >= expense ? BRAND.greenMid : BRAND.red },
  ], y);

  y = addSectionHeader(doc, 'Transaction Details', y);
  const headers = ['Description', 'Amount', 'Type', 'Category', 'User', 'Date'];
  const rows = transactions.map(t => [
    t.description || '—',
    fmtCurrency(t.amount || 0),
    t.type || '—',
    t.category || '—',
    t.user?.name || t.user?.email || '—',
    t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—',
  ]);
  addTable(doc, headers, rows, y, { colWidths: [52, 24, 18, 28, 34, 22], fontSize: 7.5 });

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) { doc.setPage(p); addPageFooter(doc, p, total); }
  return doc;
}

/**
 * Generate Financial Intelligence Report
 */
export function generateFinancialReport(data = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { summary = {}, kpiMetrics = [], revenueData = [], subscriptionData = [], cashFlowData = [], dateRange = '' } = data;

  addCoverPage(doc, 'Financial Intelligence Report', { dateRange, generatedBy: 'Finance Team' });
  doc.addPage();
  let y = addPageHeader(doc, 'Financial Intelligence', dateRange || new Date().toLocaleDateString(), 1);

  // KPIs
  y = addSectionHeader(doc, 'Revenue Overview', y);
  y = addKPIRow(doc, [
    { label: 'Total Revenue',    value: fmtCurrency(summary.totalRevenue || 0),     color: BRAND.greenMid },
    { label: 'MRR',              value: fmtCurrency(summary.mrr || 0),               color: BRAND.blueLight },
    { label: 'ARR',              value: fmtCurrency(summary.arr || 0),               color: BRAND.purple },
    { label: 'Avg Rev / User',   value: fmtCurrency(summary.avgRevenuePerUser || 0), color: BRAND.amber },
  ], y);
  y = addKPIRow(doc, [
    { label: 'Churn Rate',       value: fmtPct(summary.churnRate),                  color: BRAND.red },
    { label: 'Growth Rate',      value: fmtPct(summary.growthRate),                 color: BRAND.greenMid },
    { label: 'Active Subs',      value: fmt(summary.activeSubscriptions),            color: BRAND.blueLight },
    { label: 'Trial Users',      value: fmt(summary.trialUsers),                    color: BRAND.amber },
  ], y);
  y += 2;

  if (kpiMetrics.length > 0) {
    y = addSectionHeader(doc, 'KPI Metrics', y);
    const headers = ['Metric', 'Value', 'Change', 'Target'];
    const rows = kpiMetrics.map(m => [m.name || m.label, String(m.value ?? '—'), String(m.change ?? '—'), String(m.target ?? '—')]);
    y = addTable(doc, headers, rows, y, { colWidths: [70, 36, 36, 36] });
  }

  if (revenueData.length > 0) {
    y = addSectionHeader(doc, 'Revenue Data', y);
    const rKeys = Object.keys(revenueData[0]);
    const rows = revenueData.map(r => rKeys.map(k => String(r[k] ?? '—')));
    y = addTable(doc, rKeys, rows, y, { fontSize: 7.5 });
  }

  if (subscriptionData.length > 0) {
    if (y > 240) { doc.addPage(); y = 40; }
    y = addSectionHeader(doc, 'Subscription Breakdown', y);
    const sKeys = Object.keys(subscriptionData[0]);
    const rows = subscriptionData.map(r => sKeys.map(k => String(r[k] ?? '—')));
    y = addTable(doc, sKeys, rows, y, { fontSize: 7.5 });
  }

  if (cashFlowData.length > 0) {
    if (y > 240) { doc.addPage(); y = 40; }
    y = addSectionHeader(doc, 'Cash Flow', y);
    const cfKeys = Object.keys(cashFlowData[0]);
    const cfRows = cashFlowData.map(r => cfKeys.map(k => String(r[k] ?? '—')));
    addTable(doc, cfKeys, cfRows, y, { fontSize: 7.5 });
  }

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) { doc.setPage(p); addPageFooter(doc, p, total, 'Finance Team'); }
  return doc;
}

/**
 * Generate Compliance / Audit Report
 */
export function generateComplianceReport(data = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { auditLogs = [], complianceScore = 0, gdprStatus = {}, securitySummary = {} } = data;

  addCoverPage(doc, 'Compliance & Audit Report', { totalRecords: auditLogs.length, generatedBy: 'Compliance Officer' });
  doc.addPage();
  let y = addPageHeader(doc, 'Compliance & Audit', new Date().toLocaleDateString(), 1);

  y = addSectionHeader(doc, 'Compliance Overview', y);
  y = addKPIRow(doc, [
    { label: 'Compliance Score',  value: (complianceScore || 0) + '%',   color: complianceScore >= 80 ? BRAND.greenMid : BRAND.red },
    { label: 'GDPR Status',       value: gdprStatus.status || 'Compliant', color: BRAND.blueLight },
    { label: 'Audit Events',      value: fmt(auditLogs.length),           color: BRAND.purple },
    { label: 'Security Alerts',   value: fmt(securitySummary.alerts || 0), color: (securitySummary.alerts || 0) > 0 ? BRAND.red : BRAND.greenMid },
  ], y);
  y += 2;

  if (auditLogs.length > 0) {
    y = addSectionHeader(doc, 'Audit Log', y);
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'IP Address', 'Status'];
    const rows = auditLogs.slice(0, 200).map(log => [  // cap at 200 for readability
      log.timestamp ? new Date(log.timestamp).toLocaleString() : (log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'),
      log.user?.name || log.user?.email || log.userId || '—',
      log.action || '—',
      log.resourceType || log.resource || '—',
      log.ipAddress || '—',
      log.status || 'success',
    ]);
    addTable(doc, headers, rows, y, { colWidths: [34, 34, 28, 28, 26, 18], fontSize: 7 });
  }

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) { doc.setPage(p); addPageFooter(doc, p, total, 'Compliance Officer'); }
  return doc;
}

/**
 * Generate System Analytics Report
 */
export function generateAnalyticsReport(data = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { stats = {}, tableData = [], reportType = 'System Analytics', dateRange = '' } = data;

  addCoverPage(doc, `${reportType} Report`, { dateRange, generatedBy: 'Admin' });
  doc.addPage();
  let y = addPageHeader(doc, reportType, dateRange || new Date().toLocaleDateString(), 1);

  // Summary KPIs if stats available
  const kpiEntries = Object.entries(stats).filter(([, v]) => typeof v !== 'object');
  if (kpiEntries.length > 0) {
    y = addSectionHeader(doc, 'Summary Statistics', y);
    const chunks = [];
    for (let i = 0; i < kpiEntries.length; i += 4) chunks.push(kpiEntries.slice(i, i + 4));
    const colors = [BRAND.greenMid, BRAND.blueLight, BRAND.purple, BRAND.amber];
    for (const chunk of chunks) {
      y = addKPIRow(doc, chunk.map(([k, v], i) => ({
        label: k.replace(/([A-Z])/g, ' $1').trim(),
        value: typeof v === 'number' ? (v > 1000 ? fmt(v) : v) : String(v ?? '—'),
        color: colors[i % 4],
      })), y);
    }
    y += 2;
  }

  if (tableData.length > 0) {
    y = addSectionHeader(doc, 'Detailed Report', y);
    const keys = Object.keys(tableData[0]);
    const rows = tableData.map(r => keys.map(k => String(r[k] ?? '—')));
    addTable(doc, keys, rows, y, { fontSize: 7.5 });
  }

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) { doc.setPage(p); addPageFooter(doc, p, total); }
  return doc;
}

/**
 * Generate Activity Log Report
 */
export function generateActivityReport(logs = []) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  addCoverPage(doc, 'Activity Log Report', { totalRecords: logs.length });
  doc.addPage();
  let y = addPageHeader(doc, 'Activity Log', `${logs.length} events  ·  ${new Date().toLocaleDateString()}`, 1);

  const types = [...new Set(logs.map(l => l.type))];
  y = addKPIRow(doc, [
    { label: 'Total Events', value: fmt(logs.length), color: BRAND.greenMid },
    { label: 'Event Types',  value: fmt(types.length), color: BRAND.blueLight },
    { label: 'Today',        value: fmt(logs.filter(l => new Date(l.timestamp || l.createdAt).toDateString() === new Date().toDateString()).length), color: BRAND.purple },
    { label: 'Errors',       value: fmt(logs.filter(l => l.status === 'error' || l.type === 'error').length), color: BRAND.red },
  ], y);

  y = addSectionHeader(doc, 'Event Log', y);
  const headers = ['Timestamp', 'Type', 'Action', 'User', 'Details'];
  const rows = logs.slice(0, 300).map(log => [
    log.timestamp ? new Date(log.timestamp).toLocaleString() : (log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'),
    log.type || '—',
    log.action || '—',
    log.userId?.name || log.userId?.email || String(log.userId || '—'),
    log.metadata ? JSON.stringify(log.metadata).substring(0, 40) : '—',
  ]);
  addTable(doc, headers, rows, y, { colWidths: [36, 22, 30, 36, 54], fontSize: 7 });

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) { doc.setPage(p); addPageFooter(doc, p, total); }
  return doc;
}

// ─── Universal download helper ────────────────────────────────────────────────
/**
 * Save a jsPDF document as a download.
 * @param {jsPDF} doc
 * @param {string} filename - without extension
 */
export function savePDF(doc, filename) {
  const stamp = new Date().toISOString().split('T')[0];
  doc.save(`${filename}_${stamp}.pdf`);
}

/**
 * All-in-one: build + download a report by type.
 * @param {string} type - 'dashboard'|'users'|'transactions'|'financial'|'compliance'|'analytics'|'activity-logs'
 * @param {object} data - payload for that report type
 * @param {string} [filename]
 */
export function downloadReport(type, data = {}, filename) {
  let doc;
  switch (type) {
    case 'dashboard':
      doc = generateDashboardReport(data.stats || data);
      savePDF(doc, filename || 'soldikeeper_dashboard_report');
      break;
    case 'users':
      doc = generateUsersReport(data.users || data);
      savePDF(doc, filename || 'soldikeeper_users_report');
      break;
    case 'transactions':
      doc = generateTransactionsReport(data.transactions || data);
      savePDF(doc, filename || 'soldikeeper_transactions_report');
      break;
    case 'financial':
      doc = generateFinancialReport(data);
      savePDF(doc, filename || 'soldikeeper_financial_report');
      break;
    case 'compliance':
      doc = generateComplianceReport(data);
      savePDF(doc, filename || 'soldikeeper_compliance_report');
      break;
    case 'activity-logs':
      doc = generateActivityReport(data.logs || data);
      savePDF(doc, filename || 'soldikeeper_activity_report');
      break;
    default:
      doc = generateAnalyticsReport({ ...data, reportType: type });
      savePDF(doc, filename || `soldikeeper_${type}_report`);
  }
}
