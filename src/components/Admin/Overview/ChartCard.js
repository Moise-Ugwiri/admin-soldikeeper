import React, { Suspense } from 'react';
import { Card, CardContent, Box, Typography, Chip, Skeleton, useTheme, useMediaQuery } from '@mui/material';

// Dynamic recharts pieces — share a single dynamic import to keep one network request
let cached = null;
async function loadRecharts() {
  if (!cached) cached = await import('recharts');
  return cached;
}

const ChartFallback = ({ h }) => (
  <Skeleton variant="rectangular" height={h} sx={{ borderRadius: 1.5 }} />
);

/**
 * Generic chart card with a header (title + chip + optional action)
 * and a lazy-loaded Recharts canvas. Children receive the resolved
 * Recharts module so each chart consumer can compose its own series.
 */
function ChartCard({ title, chip, action, height, loading, children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const h = height ?? (isMobile ? 220 : isTablet ? 280 : 320);

  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {chip && (
              <Chip
                label={chip.label}
                color={chip.color || 'default'}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.65rem', borderRadius: 1 }}
              />
            )}
            {action}
          </Box>
        </Box>
        {loading ? (
          <ChartFallback h={h} />
        ) : (
          <Box sx={{ height: h }}>
            <Suspense fallback={<ChartFallback h={h} />}>
              {typeof children === 'function' ? <RechartsHost render={children} /> : children}
            </Suspense>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function RechartsHost({ render }) {
  const [mod, setMod] = React.useState(cached);
  React.useEffect(() => {
    if (!mod) loadRecharts().then(setMod);
  }, [mod]);
  if (!mod) return <ChartFallback h={300} />;
  return render(mod);
}

export default React.memo(ChartCard);
