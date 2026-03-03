import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Send as SendIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAdminData } from '../../../contexts/AdminContext';
import EscalationCard from './EscalationCard';
import EscalationDetailsDialog from './EscalationDetailsDialog';
import EscalationStats from './EscalationStats';

const EscalationInbox = () => {
  const {
    escalations,
    escalationStats,
    escalationChannels,
    loading,
    fetchEscalations,
    fetchEscalationStats,
    checkEscalationChannels,
    respondToEscalation,
    sendTestEscalation
  } = useAdminData();

  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(null);

  // Initial data load
  useEffect(() => {
    fetchEscalations();
    fetchEscalationStats();
    checkEscalationChannels();
  }, [fetchEscalations, fetchEscalationStats, checkEscalationChannels]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    fetchEscalations({ status: activeTab !== 'all' ? activeTab : undefined });
    fetchEscalationStats();
    checkEscalationChannels();
  }, [fetchEscalations, fetchEscalationStats, checkEscalationChannels, activeTab]);

  // Tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    fetchEscalations({ status: newValue !== 'all' ? newValue : undefined });
  };

  // Open details dialog
  const handleEscalationClick = (escalation) => {
    setSelectedEscalation(escalation);
    setDetailsOpen(true);
  };

  // Quick approve/reject from card
  const handleQuickApprove = async (escalation) => {
    const confirmed = window.confirm(`Approve escalation: ${escalation.title}?`);
    if (!confirmed) return;
    
    try {
      await respondToEscalation(escalation._id, 'Approved via quick action', 'approved');
      handleRefresh();
    } catch (error) {
      console.error('Quick approve failed:', error);
    }
  };

  const handleQuickReject = async (escalation) => {
    const reason = window.prompt(`Reason for rejecting "${escalation.title}":`);
    if (!reason) return;
    
    try {
      await respondToEscalation(escalation._id, reason, 'rejected');
      handleRefresh();
    } catch (error) {
      console.error('Quick reject failed:', error);
    }
  };

  // Send test escalation
  const handleSendTest = async () => {
    setSendingTest(true);
    setTestSuccess(null);
    
    try {
      await sendTestEscalation('warning');
      setTestSuccess('Test escalation sent successfully! Check your Telegram.');
      handleRefresh();
    } catch (error) {
      setTestSuccess(`Error: ${error.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  // Filter escalations
  const filteredEscalations = escalations.filter((esc) => {
    // Search filter
    if (searchQuery && !esc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !esc.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Severity filter
    if (severityFilter !== 'all' && esc.severity !== severityFilter) {
      return false;
    }
    
    return true;
  });

  // Count by status
  const counts = {
    all: escalations.length,
    pending: escalations.filter(e => e.status === 'pending').length,
    approved: escalations.filter(e => e.status === 'approved').length,
    rejected: escalations.filter(e => e.status === 'rejected').length
  };

  return (
    <Box>
      {/* Stats Section */}
      <Box mb={3}>
        <EscalationStats
          stats={escalationStats}
          channels={escalationChannels}
          loading={loading}
        />
      </Box>

      {/* Test Success Alert */}
      {testSuccess && (
        <Alert
          severity={testSuccess.startsWith('Error') ? 'error' : 'success'}
          onClose={() => setTestSuccess(null)}
          sx={{ mb: 2 }}
        >
          {testSuccess}
        </Alert>
      )}

      {/* Main Panel */}
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Escalation Inbox
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Send test escalation">
              <span>
                <IconButton
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  color="primary"
                >
                  {sendingTest ? <CircularProgress size={20} /> : <SendIcon />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Filters */}
        <Stack spacing={2} mb={3}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search escalations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 250 }}
            />
            <TextField
              select
              size="small"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
            </TextField>
          </Box>
        </Stack>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tab label={`All (${counts.all})`} value="all" />
          <Tab label={`Pending (${counts.pending})`} value="pending" />
          <Tab label={`Approved (${counts.approved})`} value="approved" />
          <Tab label={`Rejected (${counts.rejected})`} value="rejected" />
        </Tabs>

        {/* Loading State */}
        {loading && escalations.length === 0 && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty State */}
        {!loading && filteredEscalations.length === 0 && (
          <Box textAlign="center" py={6}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No escalations found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery || severityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'All clear! No escalations require attention.'}
            </Typography>
          </Box>
        )}

        {/* Escalation List */}
        {!loading && filteredEscalations.length > 0 && (
          <Stack spacing={2}>
            {filteredEscalations.map((escalation) => (
              <EscalationCard
                key={escalation._id}
                escalation={escalation}
                onClick={() => handleEscalationClick(escalation)}
                onApprove={handleQuickApprove}
                onReject={handleQuickReject}
              />
            ))}
          </Stack>
        )}
      </Paper>

      {/* Details Dialog */}
      <EscalationDetailsDialog
        open={detailsOpen}
        escalation={selectedEscalation}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedEscalation(null);
        }}
        onRespond={async (id, response, decision) => {
          await respondToEscalation(id, response, decision);
          handleRefresh();
        }}
      />
    </Box>
  );
};

export default EscalationInbox;
