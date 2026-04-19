import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

/**
 * Compact list of "platform metrics" (avg session, conversion, error rate, response time).
 * Replaces the previous oversized cards with a tight, scannable list.
 */
const PlatformMetricsList = React.memo(function PlatformMetricsList({ metrics, color }) {
  const theme = useTheme();
  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Platform Metrics</Typography>
          <Box sx={{ px: 0.75, py: 0.25, borderRadius: 0.75, bgcolor: alpha(theme.palette.success.main, 0.12), color: 'success.main', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Live
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {metrics.map((m, i) => {
            const positive = m.change >= 0;
            return (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1.25,
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all .15s',
                  '&:hover': { borderColor: alpha(color, 0.4), transform: 'translateX(2px)' },
                }}
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(color, 0.12), color, mr: 1.5 }}>
                  {m.icon}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block', lineHeight: 1.2 }}>
                    {m.title}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, mt: 0.25 }}>
                    {m.value}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: positive ? 'success.main' : 'error.main' }}>
                  {positive ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                    {Math.abs(m.change)}%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
});

export default PlatformMetricsList;
