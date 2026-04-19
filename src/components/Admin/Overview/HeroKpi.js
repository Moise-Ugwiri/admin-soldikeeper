import React from 'react';
import { Card, CardContent, Box, Typography, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

/**
 * KPI card with a colored accent strip and optional delta indicator.
 * Replaces the four bespoke gradient cards with a single composable primitive.
 */
const HeroKpi = React.memo(function HeroKpi({
  label,
  value,
  icon,
  color = '#667eea',
  delta = null,
  hint = null,
}) {
  const theme = useTheme();
  const positive = typeof delta === 'number' ? delta >= 0 : null;

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        transition: 'transform .18s ease, box-shadow .18s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: 4,
          background: color,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pl: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
            >
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, lineHeight: 1.1, mt: 0.5, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' } }}
            >
              {value}
            </Typography>
            {(delta !== null || hint) && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.75, gap: 0.5 }}>
                {delta !== null && (
                  <>
                    {positive ? (
                      <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                    )}
                    <Typography variant="caption" sx={{ color: positive ? 'success.main' : 'error.main', fontWeight: 600 }}>
                      {Math.abs(delta)}%
                    </Typography>
                  </>
                )}
                {hint && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                    {hint}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha(color, 0.12),
                color,
                flexShrink: 0,
              }}
            >
              {React.cloneElement(icon, { sx: { fontSize: { xs: 20, sm: 24 } } })}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

export default HeroKpi;
