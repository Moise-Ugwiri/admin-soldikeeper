import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, List, ListItem, ListItemText, ListItemIcon, alpha, useTheme } from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';

export const RecentActivityCard = React.memo(function RecentActivityCard({ items, title }) {
  const theme = useTheme();
  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>{title}</Typography>
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            <Typography variant="body2">No recent activity yet.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {items.map((a, i) => (
              <ListItem key={i} sx={{ px: 0, py: 1, borderBottom: i < items.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <Avatar sx={{ bgcolor: alpha(a.color, 0.12), color: a.color, width: 32, height: 32 }}>
                    {a.icon}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={a.message}
                  secondary={a.time}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
});

export const SecurityAlertsCard = React.memo(function SecurityAlertsCard({ alerts = [], title, emptyText, errorColor, warnColor }) {
  const theme = useTheme();
  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>{title}</Typography>
        {alerts.length > 0 ? (
          <List disablePadding>
            {alerts.slice(0, 4).map((alert, i) => {
              const c = alert.severity === 'high' ? errorColor : warnColor;
              return (
                <ListItem key={i} sx={{ px: 0, py: 1, borderBottom: i < Math.min(alerts.length, 4) - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Avatar sx={{ bgcolor: alpha(c, 0.12), color: c, width: 32, height: 32 }}>
                      <Warning fontSize="small" />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.message}
                    secondary={alert.timestamp}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{emptyText}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});
