import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress, alpha, useTheme } from '@mui/material';

const SystemHealthCard = React.memo(function SystemHealthCard({ name, value, icon, color, status }) {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32, height: 32,
                borderRadius: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha(color, 0.12),
                color,
              }}
            >
              {React.cloneElement(icon, { sx: { fontSize: 18 } })}
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                {name}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, mt: 0.25 }}>
                {value}%
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 0.75,
              bgcolor: alpha(color, 0.12),
              color,
              fontSize: '0.6rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.4,
            }}
          >
            {status}
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: alpha(color, 0.15),
            '& .MuiLinearProgress-bar': { backgroundColor: color, borderRadius: 3 },
          }}
        />
      </CardContent>
    </Card>
  );
});

export default SystemHealthCard;
