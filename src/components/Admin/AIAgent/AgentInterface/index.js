/* eslint-disable */
/**
 * 🎨 AGENT INTERFACE DRAWER
 * Main drawer component for interacting with autonomous agents
 * Features:
 * - 5 tabs: Chat, Configure, Activity, Brain, Actions
 * - Slides in from right (600px desktop, full-width mobile)
 * - Agent-colored header with emoji, name, role
 * - Smooth 300ms animations
 */

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  alpha,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  ChatBubbleOutline as ChatIcon,
  Settings as SettingsIcon,
  Timeline as ActivityIcon,
  Psychology as BrainIcon,
  PlayArrow as ActionsIcon
} from '@mui/icons-material';
import AgentChatTab from './AgentChatTab';
import AgentConfigTab from './AgentConfigTab';
import AgentActivityTab from './AgentActivityTab';
import AgentBrainTab from './AgentBrainTab';
import AgentActionsTab from './AgentActionsTab';

const AgentInterface = ({ open, onClose, agent }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);

  if (!agent) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const drawerWidth = isMobile ? '100vw' : 600;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: drawerWidth,
          maxWidth: '100vw',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'background.default'
        }
      }}
      transitionDuration={300}
    >
      {/* Header with agent info and close button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          background: `linear-gradient(135deg, ${alpha(agent.color, 0.15)} 0%, ${alpha(agent.color, 0.05)} 100%)`,
          borderBottom: `3px solid ${agent.color}`,
          minHeight: 80
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              fontSize: '2.5rem',
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          >
            {agent.emoji}
          </Box>
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: agent.color,
                  letterSpacing: '0.5px'
                }}
              >
                {agent.number}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                  color: agent.color
                }}
              >
                {agent.name.toUpperCase()}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.8rem',
                color: 'text.secondary',
                mt: 0.5
              }}
            >
              {agent.role}
            </Typography>
          </Box>
        </Box>
        
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha(agent.color, 0.1),
              color: agent.color
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Tabs Navigation */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'scrollable'}
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              fontWeight: 600,
              textTransform: 'none',
              '&.Mui-selected': {
                color: agent.color
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: agent.color,
              height: 3
            }
          }}
        >
          <Tab
            icon={<ChatIcon fontSize="small" />}
            iconPosition="start"
            label={isMobile ? '' : 'Chat'}
            sx={{ minWidth: isMobile ? 'auto' : 100 }}
          />
          <Tab
            icon={<SettingsIcon fontSize="small" />}
            iconPosition="start"
            label={isMobile ? '' : 'Configure'}
            sx={{ minWidth: isMobile ? 'auto' : 100 }}
          />
          <Tab
            icon={<ActivityIcon fontSize="small" />}
            iconPosition="start"
            label={isMobile ? '' : 'Activity'}
            sx={{ minWidth: isMobile ? 'auto' : 100 }}
          />
          <Tab
            icon={<BrainIcon fontSize="small" />}
            iconPosition="start"
            label={isMobile ? '' : 'Brain'}
            sx={{ minWidth: isMobile ? 'auto' : 100 }}
          />
          <Tab
            icon={<ActionsIcon fontSize="small" />}
            iconPosition="start"
            label={isMobile ? '' : 'Actions'}
            sx={{ minWidth: isMobile ? 'auto' : 100 }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: 'background.default'
        }}
      >
        {activeTab === 0 && <AgentChatTab agent={agent} />}
        {activeTab === 1 && <AgentConfigTab agent={agent} />}
        {activeTab === 2 && <AgentActivityTab agent={agent} />}
        {activeTab === 3 && <AgentBrainTab agent={agent} />}
        {activeTab === 4 && <AgentActionsTab agent={agent} />}
      </Box>
    </Drawer>
  );
};

export default AgentInterface;
