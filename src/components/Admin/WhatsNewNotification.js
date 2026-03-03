import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  useTheme,
  IconButton,
  Fade,
  Slide,
} from '@mui/material';
import {
  Close as CloseIcon,
  StarBorder as NewIcon,
  Celebration as CelebrationIcon,
  BrushOutlined as DesignIcon,
  PhoneAndroid as MobileIcon,
  MenuBook as DocsIcon,
  BugReport as BugIcon,
  Speed as PerformanceIcon,
} from '@mui/icons-material';

// Current app version
const CURRENT_VERSION = '2.5.0';

// Changelog data
const CHANGELOG = {
  '2.5.0': {
    date: 'February 2026',
    title: 'Enhanced Admin Experience',
    items: [
      {
        icon: <CelebrationIcon />,
        text: 'Added interactive admin onboarding tour',
        type: 'feature',
      },
      {
        icon: <DesignIcon />,
        text: 'Fixed UI inconsistencies across admin dashboard',
        type: 'improvement',
      },
      {
        icon: <MobileIcon />,
        text: 'Optimized dashboard for tablet devices',
        type: 'improvement',
      },
      {
        icon: <DocsIcon />,
        text: 'Added comprehensive documentation page',
        type: 'feature',
      },
      {
        icon: <PerformanceIcon />,
        text: 'Improved real-time data refresh performance',
        type: 'performance',
      },
      {
        icon: <BugIcon />,
        text: 'Fixed WebSocket reconnection issues',
        type: 'bugfix',
      },
    ],
  },
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const WhatsNewNotification = ({ open: controlledOpen, onClose: controlledOnClose }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [hasNewFeatures, setHasNewFeatures] = useState(false);

  // Check for new features on mount
  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('admin_last_seen_version');
    
    if (!lastSeenVersion || lastSeenVersion !== CURRENT_VERSION) {
      setHasNewFeatures(true);
      
      // Auto-show after a delay if it's the first time
      if (!lastSeenVersion) {
        const timer = setTimeout(() => {
          setOpen(true);
        }, 3000); // Show after 3 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Support both controlled and uncontrolled modes
  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen);
    }
  }, [controlledOpen]);

  const handleClose = () => {
    // Mark as seen
    localStorage.setItem('admin_last_seen_version', CURRENT_VERSION);
    setHasNewFeatures(false);
    setOpen(false);
    
    if (controlledOnClose) {
      controlledOnClose();
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'feature':
        return theme.palette.success.main;
      case 'improvement':
        return theme.palette.primary.main;
      case 'performance':
        return theme.palette.warning.main;
      case 'bugfix':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'feature':
        return 'New';
      case 'improvement':
        return 'Improved';
      case 'performance':
        return 'Faster';
      case 'bugfix':
        return 'Fixed';
      default:
        return 'Update';
    }
  };

  const currentChangelog = CHANGELOG[CURRENT_VERSION];

  return (
    <>
      {/* Expose method to open dialog */}
      {typeof window !== 'undefined' && (
        <div
          ref={(ref) => {
            if (ref && !window.__whatsNewDialog) {
              window.__whatsNewDialog = {
                open: handleOpen,
                hasNewFeatures,
              };
            }
          }}
          style={{ display: 'none' }}
        />
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: theme.shadows[20],
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 2,
            pt: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <NewIcon
              sx={{
                fontSize: 32,
                color: theme.palette.primary.main,
              }}
            />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                What's New in v{CURRENT_VERSION}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentChangelog.date}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                background: `${theme.palette.primary.main}15`,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            {currentChangelog.title}
          </Typography>

          <List sx={{ pt: 0 }}>
            {currentChangelog.items.map((item, index) => (
              <Fade
                in
                key={index}
                timeout={300}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <ListItem
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.03)',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: getTypeColor(item.type),
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography variant="body2">{item.text}</Typography>
                        <Chip
                          label={getTypeLabel(item.type)}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: `${getTypeColor(item.type)}20`,
                            color: getTypeColor(item.type),
                            border: `1px solid ${getTypeColor(item.type)}40`,
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              </Fade>
            ))}
          </List>

          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              background: theme.palette.mode === 'dark'
                ? `${theme.palette.primary.main}15`
                : `${theme.palette.primary.main}08`,
              border: `1px solid ${theme.palette.primary.main}30`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Tip:</strong> Access the Help menu anytime to start the 
              interactive tour or view documentation.
            </Typography>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Got it, thanks!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WhatsNewNotification;

// Export helper to check for new features
export const hasNewFeatures = () => {
  const lastSeenVersion = localStorage.getItem('admin_last_seen_version');
  return !lastSeenVersion || lastSeenVersion !== CURRENT_VERSION;
};

// Export helper to open dialog
export const openWhatsNewDialog = () => {
  if (window.__whatsNewDialog) {
    window.__whatsNewDialog.open();
  }
};
