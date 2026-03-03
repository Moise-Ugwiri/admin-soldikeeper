import React from 'react';
import { Box, Grid } from '@mui/material';
import AgentCard from './AgentCard';
import { AGENTS as STATIC_AGENTS } from '../../../data/agentRegistry';

/**
 * AgentGrid - Responsive 4x3 grid displaying all 12 PROJECT OLYMPUS agents
 * Mobile: 4x3 → 2x6 → 1x12 responsive stack
 */
const AgentGrid = ({ agents = STATIC_AGENTS, onAgentClick }) => {
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Grid container spacing={2}>
        {agents.map((agent) => (
          <Grid 
            item 
            xs={12}  // Mobile: 1 column
            sm={6}   // Tablet: 2 columns
            md={4}   // Desktop: 3 columns
            lg={3}   // Large: 4 columns
            key={agent.id}
          >
            <AgentCard 
              agent={agent} 
              onClick={() => onAgentClick && onAgentClick(agent)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AgentGrid;
