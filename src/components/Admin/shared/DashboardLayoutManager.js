/* eslint-disable */
import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import {
  Box,
  Grid,
  IconButton,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Chip,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Restore as RestoreIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Default widget configurations
 */
const DEFAULT_WIDGETS = [
  { id: 'stats', title: 'Quick Stats', enabled: true, order: 0, size: 'full' },
  { id: 'revenue', title: 'Revenue Overview', enabled: true, order: 1, size: 'half' },
  { id: 'users', title: 'User Activity', enabled: true, order: 2, size: 'half' },
  { id: 'transactions', title: 'Recent Transactions', enabled: true, order: 3, size: 'half' },
  { id: 'analytics', title: 'Analytics Summary', enabled: true, order: 4, size: 'half' },
  { id: 'security', title: 'Security Alerts', enabled: true, order: 5, size: 'third' },
  { id: 'tasks', title: 'Pending Tasks', enabled: true, order: 6, size: 'third' },
  { id: 'notifications', title: 'Notifications', enabled: true, order: 7, size: 'third' }
];

const STORAGE_KEY = 'admin_dashboard_layout';

/**
 * DashboardLayoutManager - Manages customizable dashboard widget layout
 * 
 * Features:
 * - Drag and drop widget reordering
 * - Show/hide widgets
 * - Widget size customization
 * - Layout persistence
 * - Reset to default
 */
const DashboardLayoutManager = memo(({
  widgets: customWidgets,
  onLayoutChange,
  children,
  renderWidget
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // State
  const [widgets, setWidgets] = useState(() => {
    // Try to load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load dashboard layout:', e);
    }
    return customWidgets || DEFAULT_WIDGETS;
  });
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [dragOverWidget, setDragOverWidget] = useState(null);

  // Save layout to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
      if (onLayoutChange) {
        onLayoutChange(widgets);
      }
    } catch (e) {
      console.warn('Failed to save dashboard layout:', e);
    }
  }, [widgets, onLayoutChange]);

  // Toggle widget visibility
  const toggleWidget = useCallback((widgetId) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    ));
  }, []);

  // Change widget size
  const changeWidgetSize = useCallback((widgetId, size) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, size } : w
    ));
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, widget) => {
    setDraggedWidget(widget);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  }, []);

  const handleDragOver = useCallback((e, widget) => {
    e.preventDefault();
    if (draggedWidget && draggedWidget.id !== widget.id) {
      setDragOverWidget(widget);
    }
  }, [draggedWidget]);

  const handleDragEnd = useCallback(() => {
    if (draggedWidget && dragOverWidget) {
      setWidgets(prev => {
        const newWidgets = [...prev];
        const draggedIndex = newWidgets.findIndex(w => w.id === draggedWidget.id);
        const dropIndex = newWidgets.findIndex(w => w.id === dragOverWidget.id);
        
        // Swap positions
        const [removed] = newWidgets.splice(draggedIndex, 1);
        newWidgets.splice(dropIndex, 0, removed);
        
        // Update order
        return newWidgets.map((w, i) => ({ ...w, order: i }));
      });
    }
    setDraggedWidget(null);
    setDragOverWidget(null);
  }, [draggedWidget, dragOverWidget]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    setWidgets(customWidgets || DEFAULT_WIDGETS);
    localStorage.removeItem(STORAGE_KEY);
  }, [customWidgets]);

  // Get grid size based on widget size
  const getGridSize = (size) => {
    switch (size) {
      case 'full': return { xs: 12 };
      case 'half': return { xs: 12, md: 6 };
      case 'third': return { xs: 12, md: 4 };
      case 'quarter': return { xs: 12, sm: 6, md: 3 };
      default: return { xs: 12, md: 6 };
    }
  };

  // Get enabled widgets sorted by order
  const enabledWidgets = widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <Box>
      {/* Layout settings button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Tooltip title={t('admin.layout.customize')}>
          <IconButton
            onClick={() => setSettingsOpen(true)}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Widget grid */}
      <Grid container spacing={3}>
        {enabledWidgets.map((widget) => (
          <Grid
            item
            key={widget.id}
            {...getGridSize(widget.size)}
            draggable
            onDragStart={(e) => handleDragStart(e, widget)}
            onDragOver={(e) => handleDragOver(e, widget)}
            onDragEnd={handleDragEnd}
            sx={{
              cursor: 'grab',
              transition: 'transform 0.2s ease',
              opacity: draggedWidget?.id === widget.id ? 0.5 : 1,
              transform: dragOverWidget?.id === widget.id ? 'scale(1.02)' : 'scale(1)',
              '&:active': { cursor: 'grabbing' }
            }}
          >
            {renderWidget ? (
              renderWidget(widget)
            ) : (
              children && React.Children.toArray(children).find(
                child => child.props?.widgetId === widget.id
              )
            )}
          </Grid>
        ))}
      </Grid>

      {/* Settings dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon />
          {t('admin.layout.customize')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('admin.layout.dragToReorder')}
          </Typography>

          <List>
            {widgets.sort((a, b) => a.order - b.order).map((widget, index) => (
              <React.Fragment key={widget.id}>
                <ListItem
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget)}
                  onDragOver={(e) => handleDragOver(e, widget)}
                  onDragEnd={handleDragEnd}
                  sx={{
                    bgcolor: dragOverWidget?.id === widget.id 
                      ? alpha(theme.palette.primary.main, 0.1) 
                      : 'transparent',
                    borderRadius: 1,
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' }
                  }}
                >
                  <ListItemIcon>
                    <DragIcon sx={{ cursor: 'grab' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={widget.title}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {['quarter', 'third', 'half', 'full'].map(size => (
                          <Chip
                            key={size}
                            label={size}
                            size="small"
                            variant={widget.size === size ? 'filled' : 'outlined'}
                            color={widget.size === size ? 'primary' : 'default'}
                            onClick={() => changeWidgetSize(widget.id, size)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={widget.enabled}
                      onChange={() => toggleWidget(widget.id)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {index < widgets.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button
            startIcon={<RestoreIcon />}
            onClick={resetLayout}
            color="warning"
          >
            {t('admin.layout.resetDefault')}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setSettingsOpen(false)}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

DashboardLayoutManager.displayName = 'DashboardLayoutManager';

export default DashboardLayoutManager;
