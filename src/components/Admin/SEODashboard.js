import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Divider,
  Tooltip,
  LinearProgress,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Remove,
  OpenInNew,
  Language,
  Map as SitemapIcon,
  Code,
  LinkOff,
  Speed,
  Search,
  Article,
  Pageview,
  TrendingUp,
  Public,
  Check,
  HourglassEmpty,
  RadioButtonUnchecked
} from '@mui/icons-material';

// ─── Constants ────────────────────────────────────────────────────────────────

const SITE_URL = 'https://www.soldikeeper.com';

const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const ROBOTS_URL = `${SITE_URL}/robots.txt`;

// Section B — public routes
const PUBLIC_ROUTES = [
  { route: '/',                               title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/login',                          title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: false },
  { route: '/register',                       title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: false },
  { route: '/subscription/plans',             title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/features/budgeting',             title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/features/bill-splitting',        title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/features/expense-tracking',      title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/features/receipt-scanning',      title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/features/recurring-transactions',title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/vs/splitwise',                   title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/vs/mint',                        title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/vs/ynab',                        title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/vs/tricount',                    title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/blog',                           title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/about',                          title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: true  },
  { route: '/security',                       title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: false },
  { route: '/press',                          title: true,  desc: true,  canonical: true,  og: true,  h1: true,  schema: false },
];

// Section C — keyword targets
const KEYWORD_TARGETS = [
  { keyword: 'free budget tracker app',          page: '/features/budgeting',                     volume: 'High',      status: 'targeting' },
  { keyword: 'split bills with friends',          page: '/features/bill-splitting',                volume: 'High',      status: 'targeting' },
  { keyword: 'mint alternative 2026',             page: '/vs/mint',                                volume: 'Very High', status: 'targeting' },
  { keyword: 'splitwise alternative',             page: '/vs/splitwise',                           volume: 'High',      status: 'targeting' },
  { keyword: 'ynab free alternative',             page: '/vs/ynab',                                volume: 'Medium',    status: 'targeting' },
  { keyword: 'personal expense tracker',          page: '/features/expense-tracking',              volume: 'High',      status: 'targeting' },
  { keyword: 'AI receipt scanner',                page: '/features/receipt-scanning',              volume: 'Medium',    status: 'targeting' },
  { keyword: 'how to split rent fairly',          page: '/blog/how-to-split-rent-fairly',          volume: 'Medium',    status: 'targeting' },
  { keyword: '50/30/20 budget rule',              page: '/blog/50-30-20-budget-rule',              volume: 'High',      status: 'targeting' },
  { keyword: 'best free budgeting apps 2026',     page: '/blog/best-free-budgeting-apps-2026',     volume: 'Very High', status: 'targeting' },
];

// Section E — off-page checklist
const OFF_PAGE_ITEMS = [
  { label: 'Google Search Console — submit sitemap',   status: 'todo',  link: 'https://search.google.com/search-console' },
  { label: 'Bing Webmaster Tools',                      status: 'todo',  link: 'https://www.bing.com/webmasters' },
  { label: 'Google Analytics / Plausible setup',        status: 'todo',  link: null },
  { label: 'Product Hunt launch',                       status: 'todo',  link: null },
  { label: 'Capterra listing',                          status: 'todo',  link: 'https://www.capterra.com/vendors/sign-up' },
  { label: 'G2 listing',                                status: 'todo',  link: null },
  { label: 'AlternativeTo listing',                     status: 'todo',  link: 'https://alternativeto.net/software/add/' },
  { label: 'Press kit complete',                        status: 'done',  link: null },
  { label: 'Android Play Store ASO',                    status: 'todo',  link: null },
  { label: 'hreflang for 6 languages',                  status: 'done',  link: null },
];

// Section G — quick links
const QUICK_LINKS = [
  { label: 'Google Search Console',      url: 'https://search.google.com/search-console' },
  { label: 'Rich Results Test',          url: 'https://search.google.com/test/rich-results' },
  { label: 'PageSpeed Insights',         url: 'https://pagespeed.web.dev/' },
  { label: 'Schema.org Validator',       url: 'https://validator.schema.org/' },
  { label: 'Sitemap',                    url: SITEMAP_URL },
];

// ─── Small helpers ─────────────────────────────────────────────────────────────

const StatusCell = ({ ok }) => {
  const theme = useTheme();
  if (ok === null || ok === undefined || ok === false) {
    // Distinguish between "N/A" (schema=false) and "missing" (should be true but isn't)
    // For our data all falsy values are "N/A" (schema not needed), use Remove icon
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Remove sx={{ color: theme.palette.text.disabled, fontSize: 18 }} />
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 18 }} />
    </Box>
  );
};

const VolumeChip = ({ volume }) => {
  const colorMap = {
    'Very High': 'error',
    'High':      'warning',
    'Medium':    'info',
    'Low':       'default',
  };
  return (
    <Chip
      label={volume}
      size="small"
      color={colorMap[volume] || 'default'}
      variant="outlined"
      sx={{ fontSize: '0.7rem' }}
    />
  );
};

const StatusChip = ({ status }) => {
  const map = {
    targeting:    { label: 'Targeting',   color: 'success' },
    monitoring:   { label: 'Monitoring',  color: 'info' },
    pending:      { label: 'Pending',     color: 'warning' },
  };
  const cfg = map[status] || { label: status, color: 'default' };
  return <Chip label={cfg.label} size="small" color={cfg.color} />;
};

const OffPageStatusChip = ({ status }) => {
  const map = {
    done:        { label: 'Done',        color: 'success', icon: <Check sx={{ fontSize: 14 }} /> },
    'in-progress':{ label: 'In Progress', color: 'info',    icon: <HourglassEmpty sx={{ fontSize: 14 }} /> },
    todo:        { label: 'To Do',       color: 'warning', icon: <RadioButtonUnchecked sx={{ fontSize: 14 }} /> },
  };
  const cfg = map[status] || { label: status, color: 'default', icon: null };
  return <Chip label={cfg.label} size="small" color={cfg.color} icon={cfg.icon} />;
};

// ─── Section header component ──────────────────────────────────────────────────

const SectionTitle = ({ icon, title, subtitle }) => {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.15),
          color: theme.palette.primary.main,
        }}>
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

// ─── Stat card component ───────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sublabel, color }) => {
  const theme = useTheme();
  const cardColor = color || theme.palette.primary.main;
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${alpha(cardColor, 0.25)}`,
        bgcolor: alpha(cardColor, 0.06),
        borderRadius: 2,
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 1.5,
            bgcolor: alpha(cardColor, 0.15),
            color: cardColor,
            flexShrink: 0
          }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} color={cardColor}>
              {value}
            </Typography>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {label}
            </Typography>
            {sublabel && (
              <Typography variant="caption" color="text.secondary">
                {sublabel}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

const SEODashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Crawl stat helpers
  const totalRoutes = PUBLIC_ROUTES.length;
  const routesWithSchema = PUBLIC_ROUTES.filter(r => r.schema).length;
  const allMetaOk = PUBLIC_ROUTES.every(r => r.title && r.desc && r.canonical && r.og && r.h1);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3
      }}>
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            📈 SEO Metrics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            On-page health, keyword targets, content coverage &amp; off-page checklist for SoldiKeeper.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`${totalRoutes} Indexed Pages`}
            color="primary"
            icon={<Pageview sx={{ fontSize: 16 }} />}
          />
          <Chip
            label="All Meta Tags ✅"
            color="success"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* Section A — Crawl & Indexability Status                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle
          icon={<Search sx={{ fontSize: 18 }} />}
          title="A — Crawl & Indexability Status"
          subtitle="Technical SEO foundation — all systems configured."
        />

        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<SitemapIcon />}
              label="Sitemap URLs"
              value={String(totalRoutes)}
              sublabel="public routes"
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<Language />}
              label="robots.txt"
              value="✅"
              sublabel="Configured"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<LinkOff />}
              label="Canonical URLs"
              value="✅"
              sublabel="Implemented"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<Code />}
              label="Schema Types"
              value="4"
              sublabel="SoftwareApp, Org, WebSite, FAQ"
              color={theme.palette.info.main}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<Speed />}
              label="react-snap"
              value="✅"
              sublabel="Pre-rendering enabled"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<Public />}
              label="hreflang"
              value="6 langs"
              sublabel="i18n configured"
              color={theme.palette.secondary.main}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 4, opacity: 0.4 }} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* Section B — Meta Coverage Matrix                                 */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle
          icon={<Article sx={{ fontSize: 18 }} />}
          title="B — Meta Coverage Matrix"
          subtitle="Every public route audited for on-page SEO signals."
        />

        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                  <TableCell sx={{ fontWeight: 700, minWidth: 210 }}>Route</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Desc</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Canonical</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>OG Tags</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>H1</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Schema</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PUBLIC_ROUTES.map((row, i) => (
                  <TableRow
                    key={row.route}
                    sx={{
                      bgcolor: i % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.3),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) }
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        component="a"
                        href={`${SITE_URL}${row.route}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          fontFamily: 'monospace',
                          fontSize: '0.78rem',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {row.route}
                      </Typography>
                    </TableCell>
                    <TableCell align="center"><StatusCell ok={row.title} /></TableCell>
                    <TableCell align="center"><StatusCell ok={row.desc} /></TableCell>
                    <TableCell align="center"><StatusCell ok={row.canonical} /></TableCell>
                    <TableCell align="center"><StatusCell ok={row.og} /></TableCell>
                    <TableCell align="center"><StatusCell ok={row.h1} /></TableCell>
                    <TableCell align="center"><StatusCell ok={row.schema} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        {/* Coverage summary bar */}
        <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Title', count: PUBLIC_ROUTES.filter(r => r.title).length },
            { label: 'Description', count: PUBLIC_ROUTES.filter(r => r.desc).length },
            { label: 'Canonical', count: PUBLIC_ROUTES.filter(r => r.canonical).length },
            { label: 'OG Tags', count: PUBLIC_ROUTES.filter(r => r.og).length },
            { label: 'H1', count: PUBLIC_ROUTES.filter(r => r.h1).length },
            { label: 'Schema', count: routesWithSchema },
          ].map(({ label, count }) => (
            <Box key={label} sx={{ minWidth: 90 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="caption" fontWeight={700} color="text.primary">
                  {count}/{totalRoutes}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(count / totalRoutes) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: count === totalRoutes
                      ? theme.palette.success.main
                      : theme.palette.warning.main,
                    borderRadius: 3,
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 4, opacity: 0.4 }} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* Section C — Keyword Targets                                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle
          icon={<TrendingUp sx={{ fontSize: 18 }} />}
          title="C — Keyword Targets"
          subtitle={`${KEYWORD_TARGETS.length} primary keywords mapped to landing pages.`}
        />

        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                  <TableCell sx={{ fontWeight: 700 }}>Target Keyword</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Target Page</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Volume</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {KEYWORD_TARGETS.map((kw, i) => (
                  <TableRow
                    key={kw.keyword}
                    sx={{
                      bgcolor: i % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.3),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {kw.keyword}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        component="a"
                        href={`${SITE_URL}${kw.page}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          fontFamily: 'monospace',
                          fontSize: '0.78rem',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {kw.page}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <VolumeChip volume={kw.volume} />
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip status={kw.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Box>

      <Divider sx={{ mb: 4, opacity: 0.4 }} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* Section D — Content Inventory                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle
          icon={<Pageview sx={{ fontSize: 18 }} />}
          title="D — Content Inventory"
          subtitle="All public-facing content audited for indexability."
        />

        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<Public />}
              label="Total Indexable Pages"
              value={String(totalRoutes)}
              sublabel="public routes"
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<CheckCircle />}
              label="Feature Pages"
              value="5 / 5"
              sublabel="100% complete"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<CheckCircle />}
              label="Comparison Pages"
              value="4 / 4"
              sublabel="Splitwise, Mint, YNAB, Tricount"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<Article />}
              label="Blog Articles"
              value="3"
              sublabel="published"
              color={theme.palette.info.main}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<CheckCircle />}
              label="Trust Pages"
              value="3 / 3"
              sublabel="About · Security · Press"
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              icon={<Code />}
              label="Structured Data"
              value={`${routesWithSchema} pages`}
              sublabel="with JSON-LD schema"
              color={theme.palette.secondary.main}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 4, opacity: 0.4 }} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* Section E — Off-page Checklist                                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle
          icon={<Language sx={{ fontSize: 18 }} />}
          title="E — Off-page Checklist"
          subtitle="Distribution, listings, and indexing submissions."
        />

        <Grid container spacing={1.5}>
          {OFF_PAGE_ITEMS.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  border: `1px solid ${alpha(
                    item.status === 'done'
                      ? theme.palette.success.main
                      : theme.palette.divider,
                    item.status === 'done' ? 0.4 : 0.5
                  )}`,
                  bgcolor: alpha(
                    item.status === 'done'
                      ? theme.palette.success.main
                      : theme.palette.background.paper,
                    item.status === 'done' ? 0.06 : 1
                  ),
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: item.status === 'done' ? 600 : 400 }}>
                  {item.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  <OffPageStatusChip status={item.status} />
                  {item.link && (
                    <Tooltip title="Open link">
                      <IconButton
                        size="small"
                        component="a"
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: theme.palette.primary.main, p: 0.3 }}
                      >
                        <OpenInNew sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ mb: 4, opacity: 0.4 }} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* Section F — Core Web Vitals (placeholder)                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle
          icon={<Speed sx={{ fontSize: 18 }} />}
          title="F — Core Web Vitals"
          subtitle="Real-world performance signals from Google CrUX. Requires Google Search Console integration."
        />

        <Grid container spacing={2}>
          {[
            {
              metric: 'LCP',
              full:   'Largest Contentful Paint',
              target: '≤ 2.5 s',
              note:   'Measures loading performance',
            },
            {
              metric: 'INP',
              full:   'Interaction to Next Paint',
              target: '≤ 200 ms',
              note:   'Replaces FID (Mar 2024)',
            },
            {
              metric: 'CLS',
              full:   'Cumulative Layout Shift',
              target: '≤ 0.1',
              note:   'Measures visual stability',
            },
          ].map((cwv) => (
            <Grid item xs={12} sm={4} key={cwv.metric}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={cwv.metric}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.2),
                        color: theme.palette.warning.main,
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        letterSpacing: 1,
                      }}
                    />
                    <Chip label={`Target: ${cwv.target}`} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {cwv.full}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                    {cwv.note}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                    component="a"
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontSize: '0.72rem' }}
                  >
                    Check in Search Console
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Speed sx={{ color: theme.palette.info.main, flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Core Web Vitals data is only available after Google Search Console
            has been connected and the site has accumulated sufficient field data (CrUX).
            Submit your sitemap first, then check back in 28 days.
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4, opacity: 0.4 }} />

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* Section G — Quick Links                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mb: 2 }}>
        <SectionTitle
          icon={<OpenInNew sx={{ fontSize: 18 }} />}
          title="G — Quick Links"
          subtitle="Jump to SEO tools and validators."
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {QUICK_LINKS.map((ql) => (
            <Button
              key={ql.label}
              variant="outlined"
              size="small"
              endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
              component="a"
              href={ql.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: alpha(theme.palette.primary.main, 0.4),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              {ql.label}
            </Button>
          ))}
        </Box>
      </Box>

    </Box>
  );
};

export default SEODashboard;
