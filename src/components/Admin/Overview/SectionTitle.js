import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const SectionTitle = React.memo(function SectionTitle({ title, chip, action }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="overline"
          sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.8, lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {chip && (
          <Chip
            label={chip.label}
            size="small"
            color={chip.color || 'default'}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem', borderRadius: 1 }}
          />
        )}
      </Box>
      {action}
    </Box>
  );
});

export default SectionTitle;
