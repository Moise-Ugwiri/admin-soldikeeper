/* eslint-disable */
import React, { useState, useCallback, memo } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  useTheme
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  GridOn as ExcelIcon,
  Code as JsonIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Export formats configuration
 */
const EXPORT_FORMATS = {
  csv: {
    label: 'CSV',
    icon: <CsvIcon />,
    mimeType: 'text/csv',
    extension: '.csv'
  },
  excel: {
    label: 'Excel',
    icon: <ExcelIcon />,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx'
  },
  pdf: {
    label: 'PDF',
    icon: <PdfIcon />,
    mimeType: 'application/pdf',
    extension: '.pdf'
  },
  json: {
    label: 'JSON',
    icon: <JsonIcon />,
    mimeType: 'application/json',
    extension: '.json'
  }
};

/**
 * DataExporter - A comprehensive data export component
 * 
 * Features:
 * - Multiple export formats (CSV, Excel, PDF, JSON)
 * - Column selection
 * - Data filtering options
 * - Email export option
 * - Print functionality
 */
const DataExporter = memo(({
  data,
  columns,
  filename = 'export',
  onExport,
  formats = ['csv', 'excel', 'pdf', 'json'],
  showColumnSelection = true,
  showPrint = true,
  showEmail = false,
  onEmail,
  disabled = false,
  variant = 'button', // 'button' | 'menu' | 'dialog'
  buttonProps = {},
  sx = {}
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // State
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(formats[0] || 'csv');
  const [selectedColumns, setSelectedColumns] = useState(
    columns?.map(col => col.field || col.id) || []
  );
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // Handlers
  const handleMenuOpen = useCallback((event) => {
    setMenuAnchor(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleDialogOpen = useCallback(() => {
    setDialogOpen(true);
    setMenuAnchor(null);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setError(null);
  }, []);

  const handleFormatChange = useCallback((event) => {
    setSelectedFormat(event.target.value);
  }, []);

  const handleColumnToggle = useCallback((columnId) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnId)) {
        return prev.filter(id => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  }, []);

  const handleSelectAllColumns = useCallback(() => {
    const allColumnIds = columns?.map(col => col.field || col.id) || [];
    setSelectedColumns(allColumnIds);
  }, [columns]);

  const handleDeselectAllColumns = useCallback(() => {
    setSelectedColumns([]);
  }, []);

  // Export function
  const handleExport = useCallback(async (format = selectedFormat) => {
    setExporting(true);
    setError(null);

    try {
      // If custom export handler is provided, use it
      if (onExport) {
        await onExport({
          format,
          columns: selectedColumns,
          filename: `${filename}_${new Date().toISOString().split('T')[0]}${EXPORT_FORMATS[format].extension}`
        });
      } else {
        // Default export logic
        await defaultExport(format, data, columns, selectedColumns, filename);
      }

      handleDialogClose();
      handleMenuClose();
    } catch (err) {
      setError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  }, [selectedFormat, selectedColumns, onExport, data, columns, filename]);

  // Default export implementation
  const defaultExport = async (format, data, columns, selectedCols, filename) => {
    const filteredColumns = columns.filter(
      col => selectedCols.includes(col.field || col.id)
    );

    let content;
    let mimeType;
    let extension;

    switch (format) {
      case 'csv':
        content = convertToCSV(data, filteredColumns);
        mimeType = 'text/csv';
        extension = '.csv';
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = '.json';
        break;
      default:
        throw new Error(`Format ${format} not supported for client-side export`);
    }

    // Download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Convert data to CSV
  const convertToCSV = (data, columns) => {
    const headers = columns.map(col => col.label || col.field || col.id).join(',');
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col.field || col.id];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',');
    });
    return [headers, ...rows].join('\n');
  };

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
    handleMenuClose();
  }, []);

  // Handle email
  const handleEmail = useCallback(async () => {
    if (onEmail) {
      setExporting(true);
      try {
        await onEmail({
          format: selectedFormat,
          columns: selectedColumns,
          filename
        });
        handleMenuClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setExporting(false);
      }
    }
  }, [onEmail, selectedFormat, selectedColumns, filename]);

  // Quick export button
  const QuickExportButton = () => (
    <Button
      variant="outlined"
      startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
      onClick={() => handleExport(formats[0])}
      disabled={disabled || exporting || !data?.length}
      {...buttonProps}
      sx={sx}
    >
      {t('common.export')}
    </Button>
  );

  // Menu variant
  const MenuExportButton = () => (
    <>
      <Button
        variant="outlined"
        startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
        endIcon={<ArrowDownIcon />}
        onClick={handleMenuOpen}
        disabled={disabled || exporting || !data?.length}
        {...buttonProps}
        sx={sx}
      >
        {t('common.export')}
      </Button>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {formats.map(format => (
          <MenuItem
            key={format}
            onClick={() => handleExport(format)}
            disabled={exporting}
          >
            <ListItemIcon>{EXPORT_FORMATS[format]?.icon}</ListItemIcon>
            <ListItemText>
              {t(`common.exportAs`, { format: EXPORT_FORMATS[format]?.label })}
            </ListItemText>
          </MenuItem>
        ))}
        
        {(showPrint || showEmail) && <Divider />}
        
        {showPrint && (
          <MenuItem onClick={handlePrint}>
            <ListItemIcon><PrintIcon /></ListItemIcon>
            <ListItemText>{t('common.print')}</ListItemText>
          </MenuItem>
        )}
        
        {showEmail && onEmail && (
          <MenuItem onClick={handleEmail}>
            <ListItemIcon><EmailIcon /></ListItemIcon>
            <ListItemText>{t('common.emailExport')}</ListItemText>
          </MenuItem>
        )}
        
        {showColumnSelection && (
          <>
            <Divider />
            <MenuItem onClick={handleDialogOpen}>
              <ListItemText>{t('common.advancedExport')}</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );

  // Dialog variant
  const DialogExportButton = () => (
    <>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleDialogOpen}
        disabled={disabled || !data?.length}
        {...buttonProps}
        sx={sx}
      >
        {t('common.export')}
      </Button>
      <ExportDialog />
    </>
  );

  // Export dialog component
  const ExportDialog = () => (
    <Dialog
      open={dialogOpen}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('common.exportData')}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Format selection */}
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
          {t('common.selectFormat')}
        </Typography>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <RadioGroup
            value={selectedFormat}
            onChange={handleFormatChange}
            row
          >
            {formats.map(format => (
              <FormControlLabel
                key={format}
                value={format}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {EXPORT_FORMATS[format]?.icon}
                    <span>{EXPORT_FORMATS[format]?.label}</span>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Column selection */}
        {showColumnSelection && columns && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">
                {t('common.selectColumns')}
              </Typography>
              <Box>
                <Button size="small" onClick={handleSelectAllColumns}>
                  {t('common.selectAll')}
                </Button>
                <Button size="small" onClick={handleDeselectAllColumns}>
                  {t('common.deselectAll')}
                </Button>
              </Box>
            </Box>
            <FormGroup sx={{ maxHeight: 200, overflow: 'auto' }}>
              {columns.map(column => (
                <FormControlLabel
                  key={column.field || column.id}
                  control={
                    <Checkbox
                      checked={selectedColumns.includes(column.field || column.id)}
                      onChange={() => handleColumnToggle(column.field || column.id)}
                    />
                  }
                  label={column.label || column.field || column.id}
                />
              ))}
            </FormGroup>
          </>
        )}

        {/* Data info */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          {t('common.exportingRows', { count: data?.length || 0 })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} disabled={exporting}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={() => handleExport()}
          disabled={exporting || selectedColumns.length === 0}
          startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
        >
          {exporting ? t('common.exporting') : t('common.export')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render based on variant
  switch (variant) {
    case 'menu':
      return <MenuExportButton />;
    case 'dialog':
      return <DialogExportButton />;
    case 'button':
    default:
      return <QuickExportButton />;
  }
});

DataExporter.displayName = 'DataExporter';

export default DataExporter;
