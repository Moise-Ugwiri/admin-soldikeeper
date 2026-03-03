/* eslint-disable */
import React, { useRef, useCallback, memo, useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Skeleton,
  CircularProgress,
  useTheme,
  TablePagination
} from '@mui/material';

// Note: For optimal performance with large datasets, install:
// npm install react-window react-virtualized-auto-sizer

// Try to import virtualization libraries (optional)
let FixedSizeList = null;
let AutoSizer = null;

try {
  const reactWindow = require('react-window');
  FixedSizeList = reactWindow.FixedSizeList;
} catch (e) {
  // react-window not installed, will use fallback
}

try {
  AutoSizer = require('react-virtualized-auto-sizer').default;
} catch (e) {
  // react-virtualized-auto-sizer not installed, will use fallback
}

/**
 * VirtualizedTable - A virtualized table component for handling large datasets
 * 
 * Features:
 * - Virtualized rows for performance with large datasets
 * - Sticky header
 * - Loading states
 * - Empty state
 * - Infinite scroll support
 */
const VirtualizedTable = memo(({
  columns,
  data = [],
  rowHeight = 52,
  headerHeight = 56,
  loading = false,
  loadingMore = false,
  emptyMessage = 'No data available',
  onLoadMore,
  hasMore = false,
  onRowClick,
  selectedRowId,
  getRowId = (row) => row.id || row._id,
  stickyHeader = true,
  maxHeight = 600,
  minHeight = 200,
  sx = {}
}) => {
  const theme = useTheme();
  const listRef = useRef(null);
  const loadingRef = useRef(false);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }) => {
    if (!onLoadMore || !hasMore || loadingMore || loadingRef.current) return;

    const listElement = listRef.current;
    if (!listElement) return;

    const { scrollHeight, clientHeight } = listElement._outerRef;
    const scrollThreshold = 100;

    if (scrollHeight - scrollOffset - clientHeight < scrollThreshold) {
      loadingRef.current = true;
      onLoadMore().finally(() => {
        loadingRef.current = false;
      });
    }
  }, [onLoadMore, hasMore, loadingMore]);

  // Render a single row
  const Row = useCallback(({ index, style }) => {
    const row = data[index];
    if (!row) return null;

    const rowId = getRowId(row);
    const isSelected = selectedRowId === rowId;

    return (
      <TableRow
        component="div"
        hover
        selected={isSelected}
        onClick={() => onRowClick?.(row)}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          cursor: onRowClick ? 'pointer' : 'default',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: isSelected ? theme.palette.action.selected : 'transparent'
        }}
      >
        {columns.map((column, colIndex) => (
          <TableCell
            key={column.id || colIndex}
            component="div"
            sx={{
              flex: column.flex || 1,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              py: 1,
              px: 2
            }}
          >
            {column.render ? column.render(row[column.field], row, index) : row[column.field]}
          </TableCell>
        ))}
      </TableRow>
    );
  }, [data, columns, getRowId, selectedRowId, onRowClick, theme]);

  // Render loading skeleton
  const LoadingSkeleton = () => (
    <Box sx={{ p: 2 }}>
      {[...Array(5)].map((_, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {columns.map((col, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="rectangular"
              width={col.minWidth || 100}
              height={36}
              sx={{ flex: col.flex || 1, borderRadius: 1 }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );

  // Render empty state
  const EmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: minHeight,
        color: 'text.secondary'
      }}
    >
      <Typography variant="body1">
        {emptyMessage}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <TableContainer component={Paper} sx={{ maxHeight, ...sx }}>
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={column.id || index}
                  sx={{
                    fontWeight: 'bold',
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
        <LoadingSkeleton />
      </TableContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <TableContainer component={Paper} sx={{ maxHeight, ...sx }}>
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={column.id || index}
                  sx={{
                    fontWeight: 'bold',
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
        <EmptyState />
      </TableContainer>
    );
  }

  // Fallback to standard table if virtualization libraries not available
  if (!FixedSizeList || !AutoSizer) {
    return (
      <TableContainer component={Paper} sx={{ maxHeight, overflow: 'auto', ...sx }}>
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={column.id || index}
                  sx={{
                    fontWeight: 'bold',
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isSelected = selectedRowId === rowId;
              return (
                <TableRow
                  key={rowId || rowIndex}
                  hover
                  selected={isSelected}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={column.id || colIndex}
                      sx={{
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth
                      }}
                    >
                      {column.render ? column.render(row[column.field], row, rowIndex) : row[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {loadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 1 }}>Loading more...</Typography>
          </Box>
        )}
      </TableContainer>
    );
  }

  return (
    <Paper sx={{ height: maxHeight, ...sx }}>
      {/* Header */}
      <Box
        component="div"
        sx={{
          display: 'flex',
          height: headerHeight,
          borderBottom: `2px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}
      >
        {columns.map((column, index) => (
          <Box
            key={column.id || index}
            sx={{
              flex: column.flex || 1,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
              display: 'flex',
              alignItems: 'center',
              px: 2,
              fontWeight: 'bold',
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            {column.label}
          </Box>
        ))}
      </Box>

      {/* Virtualized Body */}
      <Box sx={{ height: `calc(100% - ${headerHeight}px)` }}>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              ref={listRef}
              height={height}
              width={width}
              itemCount={data.length}
              itemSize={rowHeight}
              onScroll={handleScroll}
              overscanCount={5}
            >
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      </Box>

      {/* Loading more indicator */}
      {loadingMore && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Loading more...
          </Typography>
        </Box>
      )}
    </Paper>
  );
});

VirtualizedTable.displayName = 'VirtualizedTable';

/**
 * VirtualizedList - A simpler virtualized list for non-tabular data
 */
export const VirtualizedList = memo(({
  data = [],
  itemHeight = 72,
  renderItem,
  loading = false,
  emptyMessage = 'No items',
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  maxHeight = 500,
  sx = {}
}) => {
  const theme = useTheme();
  const listRef = useRef(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(({ scrollOffset }) => {
    if (!onLoadMore || !hasMore || loadingMore || loadingRef.current) return;

    const listElement = listRef.current;
    if (!listElement) return;

    const { scrollHeight, clientHeight } = listElement._outerRef;
    const scrollThreshold = 100;

    if (scrollHeight - scrollOffset - clientHeight < scrollThreshold) {
      loadingRef.current = true;
      onLoadMore().finally(() => {
        loadingRef.current = false;
      });
    }
  }, [onLoadMore, hasMore, loadingMore]);

  const Row = useCallback(({ index, style }) => {
    const item = data[index];
    if (!item) return null;

    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  }, [data, renderItem]);

  if (loading) {
    return (
      <Box sx={{ p: 2, ...sx }}>
        {[...Array(5)].map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={itemHeight - 16}
            sx={{ mb: 2, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          color: 'text.secondary',
          ...sx
        }}
      >
        <Typography variant="body1">{emptyMessage}</Typography>
      </Box>
    );
  }

  // Fallback for when virtualization libraries aren't available
  if (!FixedSizeList || !AutoSizer) {
    return (
      <Box sx={{ maxHeight, overflow: 'auto', ...sx }}>
        {data.map((item, index) => (
          <Box key={index}>
            {renderItem(item, index)}
          </Box>
        ))}
        {loadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ ml: 1 }}>Loading more...</Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ height: maxHeight, ...sx }}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            ref={listRef}
            height={height}
            width={width}
            itemCount={data.length}
            itemSize={itemHeight}
            onScroll={handleScroll}
            overscanCount={3}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>

      {loadingMore && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2
          }}
        >
          <CircularProgress size={20} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Loading more...
          </Typography>
        </Box>
      )}
    </Box>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

export default VirtualizedTable;
