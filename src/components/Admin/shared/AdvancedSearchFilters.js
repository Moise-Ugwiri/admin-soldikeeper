/* eslint-disable */
import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Paper,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  BookmarkBorder as SavedIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/**
 * Filter operators by field type
 */
const OPERATORS = {
  string: [
    { id: 'contains', label: 'Contains' },
    { id: 'equals', label: 'Equals' },
    { id: 'starts_with', label: 'Starts with' },
    { id: 'ends_with', label: 'Ends with' },
    { id: 'not_equals', label: 'Does not equal' },
    { id: 'is_empty', label: 'Is empty' },
    { id: 'is_not_empty', label: 'Is not empty' }
  ],
  number: [
    { id: 'equals', label: 'Equals' },
    { id: 'not_equals', label: 'Does not equal' },
    { id: 'greater_than', label: 'Greater than' },
    { id: 'less_than', label: 'Less than' },
    { id: 'between', label: 'Between' }
  ],
  date: [
    { id: 'equals', label: 'On' },
    { id: 'before', label: 'Before' },
    { id: 'after', label: 'After' },
    { id: 'between', label: 'Between' },
    { id: 'last_days', label: 'Last X days' },
    { id: 'this_week', label: 'This week' },
    { id: 'this_month', label: 'This month' },
    { id: 'this_year', label: 'This year' }
  ],
  boolean: [
    { id: 'is_true', label: 'Is true' },
    { id: 'is_false', label: 'Is false' }
  ],
  select: [
    { id: 'equals', label: 'Equals' },
    { id: 'not_equals', label: 'Does not equal' },
    { id: 'in', label: 'Is one of' },
    { id: 'not_in', label: 'Is not one of' }
  ]
};

const STORAGE_KEY = 'admin_saved_filters';

/**
 * AdvancedSearchFilters - Complex filtering component with saved filters
 * 
 * Features:
 * - Multiple filter conditions
 * - Field-type aware operators
 * - AND/OR logic
 * - Save and load filter presets
 * - Search history
 */
const AdvancedSearchFilters = memo(({
  fields = [],
  onApplyFilters,
  onClearFilters,
  initialFilters = [],
  showHistory = true,
  maxHistory = 5
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // State
  const [expanded, setExpanded] = useState(true);
  const [filters, setFilters] = useState(initialFilters.length > 0 ? initialFilters : [
    { id: 1, field: '', operator: '', value: '', logic: 'AND' }
  ]);
  const [savedFilters, setSavedFilters] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [savedMenuAnchor, setSavedMenuAnchor] = useState(null);
  const [historyMenuAnchor, setHistoryMenuAnchor] = useState(null);

  // Get operators for a field type
  const getOperators = useCallback((fieldType) => {
    return OPERATORS[fieldType] || OPERATORS.string;
  }, []);

  // Get field by id
  const getField = useCallback((fieldId) => {
    return fields.find(f => f.id === fieldId);
  }, [fields]);

  // Filter handlers
  const handleAddFilter = useCallback(() => {
    setFilters(prev => [
      ...prev,
      { id: Date.now(), field: '', operator: '', value: '', logic: 'AND' }
    ]);
  }, []);

  const handleRemoveFilter = useCallback((filterId) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  const handleFilterChange = useCallback((filterId, key, value) => {
    setFilters(prev => prev.map(f => {
      if (f.id !== filterId) return f;
      
      const updated = { ...f, [key]: value };
      
      // Reset operator and value when field changes
      if (key === 'field') {
        const field = fields.find(field => field.id === value);
        const operators = getOperators(field?.type || 'string');
        updated.operator = operators[0]?.id || '';
        updated.value = '';
        updated.value2 = '';
      }
      
      return updated;
    }));
  }, [fields, getOperators]);

  const handleApplyFilters = useCallback(() => {
    const validFilters = filters.filter(f => f.field && f.operator);
    
    if (validFilters.length > 0 && onApplyFilters) {
      onApplyFilters(validFilters);
      
      // Add to history
      if (showHistory) {
        setSearchHistory(prev => {
          const newHistory = [{ filters: validFilters, timestamp: Date.now() }, ...prev];
          return newHistory.slice(0, maxHistory);
        });
      }
    }
  }, [filters, onApplyFilters, showHistory, maxHistory]);

  const handleClearFilters = useCallback(() => {
    setFilters([{ id: 1, field: '', operator: '', value: '', logic: 'AND' }]);
    if (onClearFilters) {
      onClearFilters();
    }
  }, [onClearFilters]);

  const handleSaveFilter = useCallback(() => {
    if (!filterName.trim()) return;

    const validFilters = filters.filter(f => f.field && f.operator);
    const newSaved = {
      id: Date.now(),
      name: filterName,
      filters: validFilters
    };

    const updated = [...savedFilters, newSaved];
    setSavedFilters(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    setFilterName('');
    setSaveDialogOpen(false);
  }, [filterName, filters, savedFilters]);

  const handleLoadSavedFilter = useCallback((savedFilter) => {
    setFilters(savedFilter.filters.map((f, i) => ({
      ...f,
      id: Date.now() + i
    })));
    setSavedMenuAnchor(null);
  }, []);

  const handleDeleteSavedFilter = useCallback((filterId, e) => {
    e.stopPropagation();
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [savedFilters]);

  const handleLoadFromHistory = useCallback((historyItem) => {
    setFilters(historyItem.filters.map((f, i) => ({
      ...f,
      id: Date.now() + i
    })));
    setHistoryMenuAnchor(null);
  }, []);

  // Render value input based on field type
  const renderValueInput = useCallback((filter, field) => {
    if (!field) return null;
    
    const needsNoValue = ['is_empty', 'is_not_empty', 'is_true', 'is_false', 
                          'this_week', 'this_month', 'this_year'].includes(filter.operator);
    
    if (needsNoValue) return null;

    switch (field.type) {
      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={filter.value ? new Date(filter.value) : null}
              onChange={(date) => handleFilterChange(filter.id, 'value', date?.toISOString() || '')}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            {filter.operator === 'between' && (
              <DatePicker
                label="End Date"
                value={filter.value2 ? new Date(filter.value2) : null}
                onChange={(date) => handleFilterChange(filter.id, 'value2', date?.toISOString() || '')}
                slotProps={{ textField: { size: 'small', fullWidth: true, sx: { mt: 1 } } }}
              />
            )}
            {filter.operator === 'last_days' && (
              <TextField
                size="small"
                type="number"
                label="Days"
                value={filter.value}
                onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
                sx={{ mt: 1 }}
                fullWidth
              />
            )}
          </LocalizationProvider>
        );

      case 'number':
        return (
          <Box>
            <TextField
              size="small"
              type="number"
              label="Value"
              value={filter.value}
              onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
              fullWidth
            />
            {filter.operator === 'between' && (
              <TextField
                size="small"
                type="number"
                label="To"
                value={filter.value2 || ''}
                onChange={(e) => handleFilterChange(filter.id, 'value2', e.target.value)}
                sx={{ mt: 1 }}
                fullWidth
              />
            )}
          </Box>
        );

      case 'select':
        return (
          <FormControl size="small" fullWidth>
            <InputLabel>Value</InputLabel>
            <Select
              multiple={['in', 'not_in'].includes(filter.operator)}
              value={['in', 'not_in'].includes(filter.operator) 
                ? (Array.isArray(filter.value) ? filter.value : []) 
                : filter.value
              }
              onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
              label="Value"
              renderValue={(selected) => 
                Array.isArray(selected) 
                  ? selected.map(s => field.options?.find(o => o.value === s)?.label || s).join(', ')
                  : field.options?.find(o => o.value === selected)?.label || selected
              }
            >
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      default:
        return (
          <TextField
            size="small"
            label="Value"
            value={filter.value}
            onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
            fullWidth
          />
        );
    }
  }, [handleFilterChange]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return filters.filter(f => f.field && f.operator).length;
  }, [filters]);

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2,
        borderColor: activeFilterCount > 0 ? 'primary.main' : 'divider'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            Advanced Filters
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={`${activeFilterCount} active`}
              size="small"
              color="primary"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {savedFilters.length > 0 && (
            <Tooltip title="Saved Filters">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSavedMenuAnchor(e.currentTarget);
                }}
              >
                <SavedIcon />
              </IconButton>
            </Tooltip>
          )}
          {showHistory && searchHistory.length > 0 && (
            <Tooltip title="Search History">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setHistoryMenuAnchor(e.currentTarget);
                }}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small">
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Saved filters menu */}
      <Menu
        anchorEl={savedMenuAnchor}
        open={Boolean(savedMenuAnchor)}
        onClose={() => setSavedMenuAnchor(null)}
      >
        <Typography variant="caption" sx={{ px: 2, color: 'text.secondary' }}>
          Saved Filters
        </Typography>
        <Divider sx={{ my: 1 }} />
        {savedFilters.map(sf => (
          <MenuItem
            key={sf.id}
            onClick={() => handleLoadSavedFilter(sf)}
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <ListItemText primary={sf.name} secondary={`${sf.filters.length} conditions`} />
            <IconButton
              size="small"
              onClick={(e) => handleDeleteSavedFilter(sf.id, e)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        ))}
      </Menu>

      {/* History menu */}
      <Menu
        anchorEl={historyMenuAnchor}
        open={Boolean(historyMenuAnchor)}
        onClose={() => setHistoryMenuAnchor(null)}
      >
        <Typography variant="caption" sx={{ px: 2, color: 'text.secondary' }}>
          Recent Searches
        </Typography>
        <Divider sx={{ my: 1 }} />
        {searchHistory.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => handleLoadFromHistory(item)}
          >
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={`${item.filters.length} filter${item.filters.length > 1 ? 's' : ''}`}
              secondary={new Date(item.timestamp).toLocaleString()}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Filter content */}
      <Collapse in={expanded}>
        <CardContent sx={{ pt: 0 }}>
          {/* Filter rows */}
          {filters.map((filter, index) => {
            const field = getField(filter.field);
            const operators = field ? getOperators(field.type) : OPERATORS.string;

            return (
              <Paper
                key={filter.id}
                variant="outlined"
                sx={{ p: 2, mb: 1 }}
              >
                <Grid container spacing={2} alignItems="flex-start">
                  {/* Logic operator (AND/OR) */}
                  {index > 0 && (
                    <Grid item xs={12} sm={1}>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={filter.logic}
                          onChange={(e) => handleFilterChange(filter.id, 'logic', e.target.value)}
                        >
                          <MenuItem value="AND">AND</MenuItem>
                          <MenuItem value="OR">OR</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {/* Field select */}
                  <Grid item xs={12} sm={index > 0 ? 3 : 4}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Field</InputLabel>
                      <Select
                        value={filter.field}
                        onChange={(e) => handleFilterChange(filter.id, 'field', e.target.value)}
                        label="Field"
                      >
                        {fields.map(f => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Operator select */}
                  <Grid item xs={12} sm={3}>
                    <FormControl size="small" fullWidth disabled={!filter.field}>
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={filter.operator}
                        onChange={(e) => handleFilterChange(filter.id, 'operator', e.target.value)}
                        label="Operator"
                      >
                        {operators.map(op => (
                          <MenuItem key={op.id} value={op.id}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Value input */}
                  <Grid item xs={12} sm={index > 0 ? 4 : 4}>
                    {filter.field && renderValueInput(filter, field)}
                  </Grid>

                  {/* Remove button */}
                  <Grid item xs={12} sm={1}>
                    <Tooltip title="Remove filter">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFilter(filter.id)}
                        disabled={filters.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 2,
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddFilter}
                size="small"
              >
                Add Condition
              </Button>
              <Button
                startIcon={<SaveIcon />}
                onClick={() => setSaveDialogOpen(true)}
                size="small"
                disabled={activeFilterCount === 0}
              >
                Save Filter
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                size="small"
                color="inherit"
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleApplyFilters}
                disabled={activeFilterCount === 0}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>

          {/* Save filter dialog */}
          {saveDialogOpen && (
            <Paper
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                p: 3,
                zIndex: 1000,
                minWidth: 300
              }}
              elevation={8}
            >
              <Typography variant="h6" gutterBottom>
                Save Filter Preset
              </Typography>
              <TextField
                fullWidth
                label="Filter Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSaveFilter}>
                  Save
                </Button>
              </Box>
            </Paper>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
});

AdvancedSearchFilters.displayName = 'AdvancedSearchFilters';

export default AdvancedSearchFilters;
