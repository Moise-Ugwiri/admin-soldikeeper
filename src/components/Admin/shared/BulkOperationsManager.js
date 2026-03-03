/* eslint-disable */
import React, { useState, useCallback, memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Email as EmailIcon,
  Download as ExportIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as RunIcon,
  Cancel as CancelIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Available bulk operations
 */
const BULK_OPERATIONS = {
  users: [
    { id: 'activate', label: 'Activate Users', icon: ActivateIcon, color: 'success' },
    { id: 'deactivate', label: 'Deactivate Users', icon: BlockIcon, color: 'warning' },
    { id: 'delete', label: 'Delete Users', icon: DeleteIcon, color: 'error', confirm: true },
    { id: 'email', label: 'Send Email', icon: EmailIcon, color: 'info' },
    { id: 'export', label: 'Export Selected', icon: ExportIcon, color: 'primary' },
    { id: 'updateRole', label: 'Update Role', icon: EditIcon, color: 'primary' }
  ],
  transactions: [
    { id: 'approve', label: 'Approve Transactions', icon: ActivateIcon, color: 'success' },
    { id: 'reject', label: 'Reject Transactions', icon: BlockIcon, color: 'error' },
    { id: 'flag', label: 'Flag for Review', icon: WarningIcon, color: 'warning' },
    { id: 'export', label: 'Export Selected', icon: ExportIcon, color: 'primary' }
  ]
};

/**
 * BulkOperationsManager - Component for performing bulk operations
 * 
 * Features:
 * - Select multiple items
 * - Apply operations to selected items
 * - Progress tracking
 * - Confirmation dialogs
 * - Operation history
 */
const BulkOperationsManager = memo(({
  type = 'users', // 'users' | 'transactions'
  items = [],
  selectedItems: externalSelectedItems,
  onSelectItems: externalOnSelectItems,
  onOperation,
  getItemId = (item) => item.id || item._id,
  getItemLabel = (item) => item.name || item.email || item.id,
  customOperations = [],
  disabled = false
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Internal selection state (used when external props not provided)
  const [internalSelectedItems, setInternalSelectedItems] = useState([]);
  
  // Use external or internal state
  const selectedItems = externalSelectedItems ?? internalSelectedItems;
  const onSelectItems = externalOnSelectItems ?? setInternalSelectedItems;

  // State
  const [operationDialogOpen, setOperationDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [operationParams, setOperationParams] = useState({});
  const [operationProgress, setOperationProgress] = useState(null);
  const [operationHistory, setOperationHistory] = useState([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [error, setError] = useState(null);

  // Get available operations
  const availableOperations = [
    ...(BULK_OPERATIONS[type] || []),
    ...customOperations
  ];

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === items.length) {
      onSelectItems([]);
    } else {
      onSelectItems(items.map(item => getItemId(item)));
    }
  }, [items, selectedItems, onSelectItems, getItemId]);

  const handleSelectItem = useCallback((itemId) => {
    if (selectedItems.includes(itemId)) {
      onSelectItems(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectItems([...selectedItems, itemId]);
    }
  }, [selectedItems, onSelectItems]);

  const handleClearSelection = useCallback(() => {
    onSelectItems([]);
  }, [onSelectItems]);

  // Operation handlers
  const handleOpenOperation = useCallback((operation) => {
    setSelectedOperation(operation);
    setOperationParams({});
    setError(null);
    setOperationDialogOpen(true);
  }, []);

  const handleCloseOperation = useCallback(() => {
    setOperationDialogOpen(false);
    setSelectedOperation(null);
    setOperationParams({});
    setError(null);
  }, []);

  const handleExecuteOperation = useCallback(async () => {
    if (!selectedOperation || selectedItems.length === 0) return;

    setOperationProgress({ current: 0, total: selectedItems.length, status: 'running' });
    setError(null);

    const results = { success: 0, failed: 0, errors: [] };

    try {
      for (let i = 0; i < selectedItems.length; i++) {
        const itemId = selectedItems[i];
        
        try {
          if (onOperation) {
            await onOperation(selectedOperation.id, itemId, operationParams);
          }
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push({ itemId, error: err.message });
        }

        setOperationProgress({
          current: i + 1,
          total: selectedItems.length,
          status: 'running'
        });
      }

      // Add to history
      setOperationHistory(prev => [{
        id: Date.now(),
        operation: selectedOperation.label,
        itemCount: selectedItems.length,
        success: results.success,
        failed: results.failed,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);

      setOperationProgress({ ...operationProgress, status: 'complete', results });

      // Close dialog if all successful
      if (results.failed === 0) {
        setTimeout(() => {
          handleCloseOperation();
          handleClearSelection();
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
      setOperationProgress({ status: 'error' });
    }
  }, [selectedOperation, selectedItems, operationParams, onOperation, handleCloseOperation, handleClearSelection]);

  const handleCancelOperation = useCallback(() => {
    setOperationProgress(prev => ({ ...prev, status: 'cancelled' }));
  }, []);

  // Render operation parameters based on type
  const renderOperationParams = () => {
    if (!selectedOperation) return null;

    switch (selectedOperation.id) {
      case 'updateRole':
        return (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Role</InputLabel>
            <Select
              value={operationParams.role || ''}
              onChange={(e) => setOperationParams({ ...operationParams, role: e.target.value })}
              label="New Role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        );
      case 'email':
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email Subject"
              value={operationParams.subject || ''}
              onChange={(e) => setOperationParams({ ...operationParams, subject: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Email Body"
              value={operationParams.body || ''}
              onChange={(e) => setOperationParams({ ...operationParams, body: e.target.value })}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  const isSomeSelected = selectedItems.length > 0 && selectedItems.length < items.length;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Selection toolbar */}
      <Paper
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: selectedItems.length > 0 
            ? alpha(theme.palette.primary.main, 0.1)
            : 'transparent',
          transition: 'background-color 0.3s'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isAllSelected ? 'Deselect All' : 'Select All'}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isSomeSelected}
              onChange={handleSelectAll}
              disabled={disabled || items.length === 0}
            />
          </Tooltip>

          {selectedItems.length > 0 ? (
            <Typography variant="body2" fontWeight="bold">
              {selectedItems.length} selected
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select items for bulk operations
            </Typography>
          )}
        </Box>

        {/* Operation buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {selectedItems.length > 0 && (
            <>
              {availableOperations.slice(0, 4).map(operation => {
                const Icon = operation.icon;
                return (
                  <Tooltip key={operation.id} title={operation.label}>
                    <Button
                      size="small"
                      variant="outlined"
                      color={operation.color || 'primary'}
                      startIcon={<Icon fontSize="small" />}
                      onClick={() => handleOpenOperation(operation)}
                      disabled={disabled}
                    >
                      {operation.label}
                    </Button>
                  </Tooltip>
                );
              })}

              <Button
                size="small"
                variant="text"
                onClick={handleClearSelection}
              >
                Clear
              </Button>
            </>
          )}

          {/* History toggle */}
          {operationHistory.length > 0 && (
            <IconButton
              size="small"
              onClick={() => setHistoryExpanded(!historyExpanded)}
            >
              <HistoryIcon />
            </IconButton>
          )}
        </Box>
      </Paper>

      {/* Operation history */}
      <Collapse in={historyExpanded}>
        <Paper sx={{ mt: 1, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recent Operations
          </Typography>
          <List dense>
            {operationHistory.map(history => (
              <ListItem key={history.id}>
                <ListItemText
                  primary={`${history.operation} - ${history.itemCount} items`}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${history.success} success`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      {history.failed > 0 && (
                        <Chip
                          label={`${history.failed} failed`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {new Date(history.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Collapse>

      {/* Operation dialog */}
      <Dialog
        open={operationDialogOpen}
        onClose={handleCloseOperation}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedOperation?.label}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {selectedOperation?.confirm && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This operation cannot be undone. Are you sure you want to proceed?
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This operation will be applied to {selectedItems.length} selected items.
          </Typography>

          {renderOperationParams()}

          {/* Progress */}
          {operationProgress && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Progress: {operationProgress.current} / {operationProgress.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {operationProgress.status}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(operationProgress.current / operationProgress.total) * 100}
                color={
                  operationProgress.status === 'error' ? 'error' :
                  operationProgress.status === 'complete' ? 'success' :
                  'primary'
                }
              />
              
              {operationProgress.results && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Chip
                    label={`${operationProgress.results.success} successful`}
                    color="success"
                    size="small"
                  />
                  {operationProgress.results.failed > 0 && (
                    <Chip
                      label={`${operationProgress.results.failed} failed`}
                      color="error"
                      size="small"
                    />
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOperation}>
            Cancel
          </Button>
          {!operationProgress || operationProgress.status !== 'running' ? (
            <Button
              variant="contained"
              color={selectedOperation?.color || 'primary'}
              onClick={handleExecuteOperation}
              startIcon={<RunIcon />}
              disabled={selectedItems.length === 0}
            >
              Execute
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelOperation}
              startIcon={<CancelIcon />}
            >
              Cancel Operation
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
});

BulkOperationsManager.displayName = 'BulkOperationsManager';

export default BulkOperationsManager;
