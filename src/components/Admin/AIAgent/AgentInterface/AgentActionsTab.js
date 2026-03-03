/**
 * 🎯 AGENT ACTIONS TAB — WORLD-CLASS ADMIN UX
 * 
 * Displays available actions for each agent with rich visual design.
 * Features:
 * - Agent Capabilities Banner (domains + description)
 * - Action Cards with visible descriptions, icons, estimated time
 * - Smart Result Renderer (StatTiles, lists, alerts, booleans)
 * - Result history (last 5 executions)
 * - Raw JSON view (collapsible)
 * - Empty state with agent emoji hero
 * 
 * Redesigned from plain buttons + raw JSON dumps to a rich, scannable interface.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
  Chip,
  IconButton,
  Collapse,
  alpha,
  Divider,
  Stack,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Code as CodeIcon,
  CheckCircleOutline as CheckIcon,
  CancelOutlined as CancelIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { getAgent } from '../../../../data/agentRegistry';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * Smart Result Renderer Component
 * Parses result data and displays it in human-readable format
 */
const SmartResultRenderer = ({ result, agent, onToggleRaw }) => {
  const [showRaw, setShowRaw] = useState(false);

  if (!result.success) {
    return (
      <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {result.error}
        </Typography>
      </Alert>
    );
  }

  const data = result.data || {};
  
  // Extract different types of data
  const numericFields = [];
  const booleanFields = [];
  const arrayFields = [];
  const messageFields = [];
  const otherFields = [];

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'number') {
      numericFields.push({ key, value });
    } else if (typeof value === 'boolean') {
      booleanFields.push({ key, value });
    } else if (Array.isArray(value)) {
      arrayFields.push({ key, value });
    } else if (typeof value === 'string' && (
      key.toLowerCase().includes('message') || 
      key.toLowerCase().includes('summary') || 
      key.toLowerCase().includes('recommendation') ||
      key.toLowerCase().includes('note')
    )) {
      messageFields.push({ key, value });
    } else {
      otherFields.push({ key, value });
    }
  });

  return (
    <Box>
      {/* Message/Summary Alerts */}
      {messageFields.map(({ key, value }) => (
        <Alert 
          key={key} 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mb: 2, fontSize: '0.875rem' }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, textTransform: 'capitalize' }}>
            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
          </Typography>
          <Typography variant="body2">
            {value}
          </Typography>
        </Alert>
      ))}

      {/* Numeric Fields as Stat Tiles */}
      {numericFields.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {numericFields.map(({ key, value }) => (
            <Grid item xs={6} sm={4} md={3} key={key}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: alpha(agent.color, 0.08),
                  borderLeft: `3px solid ${agent.color}`,
                  borderRadius: 1
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800, 
                    color: agent.color,
                    mb: 0.5
                  }}
                >
                  {value.toLocaleString()}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    textTransform: 'capitalize',
                    fontWeight: 600
                  }}
                >
                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Boolean Fields */}
      {booleanFields.length > 0 && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {booleanFields.map(({ key, value }) => (
            <Box 
              key={key} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 1.5,
                backgroundColor: alpha(value ? '#4CAF50' : '#f44336', 0.08),
                borderRadius: 1,
                border: `1px solid ${alpha(value ? '#4CAF50' : '#f44336', 0.2)}`
              }}
            >
              {value ? (
                <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
              ) : (
                <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
              )}
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      {/* Array Fields as Compact Lists */}
      {arrayFields.map(({ key, value }) => (
        <Box key={key} sx={{ mb: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mb: 1, 
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontSize: '0.7rem'
            }}
          >
            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')} ({value.length})
          </Typography>
          <Stack spacing={1}>
            {value.slice(0, 5).map((item, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 1.5,
                  backgroundColor: 'background.default',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                {typeof item === 'object' ? (
                  <Grid container spacing={1}>
                    {Object.entries(item).map(([k, v]) => (
                      <Grid item xs={12} sm={6} key={k}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          {k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          {typeof v === 'boolean' ? (v ? '✅' : '❌') : String(v)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2">{String(item)}</Typography>
                )}
              </Paper>
            ))}
            {value.length > 5 && (
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                ... and {value.length - 5} more
              </Typography>
            )}
          </Stack>
        </Box>
      ))}

      {/* Other Fields (simple key-value) */}
      {otherFields.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1}>
            {otherFields.map(({ key, value }) => (
              <Grid item xs={12} sm={6} key={key}>
                <Box sx={{ p: 1.5, backgroundColor: 'background.default', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* View Raw JSON Toggle */}
      <Box sx={{ mt: 2 }}>
        <Button
          size="small"
          startIcon={<CodeIcon />}
          onClick={() => setShowRaw(!showRaw)}
          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
        >
          {showRaw ? 'Hide' : 'View'} Raw JSON
        </Button>
        <Collapse in={showRaw}>
          <Box
            component="pre"
            sx={{
              mt: 1,
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              overflow: 'auto',
              maxHeight: 300,
              backgroundColor: 'background.paper',
              p: 2,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {JSON.stringify(data, null, 2)}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

const AgentActionsTab = ({ agent }) => {
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState([]);
  const [expandedResult, setExpandedResult] = useState(null);
  const [error, setError] = useState(null);
  const [capabilitiesExpanded, setCapabilitiesExpanded] = useState(() => {
    // Collapse after first view (check localStorage)
    const hasViewed = localStorage.getItem(`agent-capabilities-viewed-${agent.id}`);
    return !hasViewed;
  });

  const agentConfig = getAgent(agent.id);
  const actions = agentConfig?.actions || [];

  // Mark capabilities as viewed
  useEffect(() => {
    if (capabilitiesExpanded) {
      localStorage.setItem(`agent-capabilities-viewed-${agent.id}`, 'true');
    }
  }, [capabilitiesExpanded, agent.id]);

  // Clear error after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const executeAction = async (action) => {
    setLoading(action.id);
    setError(null);
    
    const startTime = Date.now();

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Build URL with query params for GET requests
      let url = `${API_BASE_URL}${action.endpoint}`;
      if (action.method === 'GET' && action.params) {
        const queryString = new URLSearchParams(action.params).toString();
        url += `?${queryString}`;
      }

      const requestOptions = {
        method: action.method,
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      };

      // Add body for POST requests
      if (action.method === 'POST' && action.payload) {
        requestOptions.body = JSON.stringify(action.payload);
      }

      const response = await fetch(url, requestOptions);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { rawResponse: text };
      }

      const duration = Date.now() - startTime;

      // Check for errors
      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Add to results (keep last 5)
      const newResult = {
        id: Date.now(),
        action: action.label,
        actionId: action.id,
        success: true,
        data: data,
        duration,
        timestamp: new Date().toISOString(),
        agent: agent.name
      };

      setResults(prev => [newResult, ...prev.slice(0, 4)]); // Keep last 5
      setExpandedResult(newResult.id);

    } catch (err) {
      console.error('Action execution error:', err);
      setError(err.message);
      
      // Add error to results
      const errorResult = {
        id: Date.now(),
        action: action.label,
        actionId: action.id,
        success: false,
        error: err.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        agent: agent.name
      };
      
      setResults(prev => [errorResult, ...prev.slice(0, 4)]);
    } finally {
      setLoading(null);
    }
  };

  const toggleExpand = (resultId) => {
    setExpandedResult(expandedResult === resultId ? null : resultId);
  };

  const clearResults = () => {
    setResults([]);
    setExpandedResult(null);
  };

  if (!actions || actions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Actions Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {agent.name} doesn't have any executable actions configured yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Agent Capabilities Banner */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 3, 
          backgroundColor: alpha(agent.color, 0.05),
          border: `1px solid ${alpha(agent.color, 0.2)}`,
          borderRadius: 2
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              cursor: 'pointer'
            }}
            onClick={() => setCapabilitiesExpanded(!capabilitiesExpanded)}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="h3" sx={{ fontSize: '2rem' }}>
                  {agent.emoji}
                </Typography>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {agent.name} Capabilities
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {agent.role}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton 
              size="small"
              sx={{
                transform: capabilitiesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <ExpandIcon />
            </IconButton>
          </Box>

          <Collapse in={capabilitiesExpanded}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {agent.description}
              </Typography>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  fontSize: '0.7rem'
                }}
              >
                Domain Ownership
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {agent.domains?.map((domain, idx) => (
                  <Chip
                    key={idx}
                    label={domain}
                    size="small"
                    sx={{
                      backgroundColor: alpha(agent.color, 0.15),
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      border: `1px solid ${alpha(agent.color, 0.3)}`
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Action Cards Grid */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Available Actions
        </Typography>
        <Grid container spacing={2}>
          {actions.map(action => (
            <Grid item xs={12} md={6} key={action.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: `4px solid ${agent.color}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                  {/* Card Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlayIcon sx={{ color: agent.color, fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        {action.label}
                      </Typography>
                    </Box>
                    <Chip
                      label={action.estimatedTime}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: alpha(agent.color, 0.15),
                        color: 'text.primary'
                      }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, flex: 1, lineHeight: 1.6 }}
                  >
                    {action.description}
                  </Typography>

                  {/* Run Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => executeAction(action)}
                    disabled={loading !== null}
                    startIcon={loading === action.id ? <CircularProgress size={18} color="inherit" /> : <PlayIcon />}
                    sx={{
                      backgroundColor: agent.color,
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.25,
                      '&:hover': {
                        backgroundColor: agent.color,
                        opacity: 0.9
                      },
                      '&:disabled': {
                        backgroundColor: alpha(agent.color, 0.4),
                        color: '#fff'
                      }
                    }}
                  >
                    {loading === action.id ? 'Running...' : 'Run Action'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Results Section */}
      {results.length > 0 ? (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Execution History
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last {results.length} execution{results.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Tooltip title="Clear history">
              <IconButton size="small" onClick={clearResults}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Stack spacing={2}>
            {results.map(result => (
              <Card 
                key={result.id}
                elevation={3}
                sx={{
                  borderLeft: `4px solid ${result.success ? '#4CAF50' : '#f44336'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  {/* Result Header */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      mb: expandedResult === result.id ? 2 : 0,
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleExpand(result.id)}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {result.success ? (
                          <SuccessIcon sx={{ fontSize: 20, color: 'success.main' }} />
                        ) : (
                          <ErrorIcon sx={{ fontSize: 20, color: 'error.main' }} />
                        )}
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {result.action}
                        </Typography>
                        <Chip 
                          label={result.success ? 'Success' : 'Failed'}
                          size="small"
                          color={result.success ? 'success' : 'error'}
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                        <Chip 
                          label={`${result.duration}ms`}
                          size="small"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            backgroundColor: alpha(agent.color, 0.15)
                          }}
                        />
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        {new Date(result.timestamp).toLocaleString()} • {result.agent}
                      </Typography>
                    </Box>

                    <IconButton 
                      size="small"
                      sx={{
                        transform: expandedResult === result.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}
                    >
                      <ExpandIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Smart Result Details (Collapsible) */}
                  <Collapse in={expandedResult === result.id}>
                    <Box 
                      sx={{ 
                        pt: 2,
                        borderTop: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <SmartResultRenderer 
                        result={result} 
                        agent={agent}
                      />
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      ) : (
        <>
          <Divider sx={{ my: 3 }} />
          
          {/* Empty State */}
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 2,
              backgroundColor: alpha(agent.color, 0.03),
              borderRadius: 2,
              border: `2px dashed ${alpha(agent.color, 0.2)}`
            }}
          >
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: '4rem', 
                mb: 2,
                opacity: 0.5
              }}
            >
              {agent.emoji}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              Run an action to see results here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Results from the last 5 executions will appear in this section
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AgentActionsTab;
