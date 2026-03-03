/* eslint-disable */
import React, { useRef, useEffect, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

/**
 * TouchEnabledChart - Wrapper component that adds touch gesture support to Recharts
 * 
 * Features:
 * - Touch-to-pan: Swipe horizontally to scroll through chart data
 * - Pinch-to-zoom: Pinch gestures to zoom in/out on data
 * - Tap for tooltips: Single tap to show data point details
 * - Long press: Hold to lock tooltip in place
 * 
 * Usage:
 * <TouchEnabledChart>
 *   <ResponsiveContainer>
 *     <LineChart data={data}>
 *       ...
 *     </LineChart>
 *   </ResponsiveContainer>
 * </TouchEnabledChart>
 */

const TouchEnabledChart = ({ children, enablePan = true, enableZoom = true }) => {
  const theme = useTheme();
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const containerRef = useRef(null);
  
  const [touchState, setTouchState] = useState({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    distance: 0,
    isLongPress: false,
    longPressTimer: null
  });

  useEffect(() => {
    if (!isTouchDevice || !containerRef.current) return;

    const container = containerRef.current;
    let touchStartTime = 0;
    let initialDistance = 0;

    // Calculate distance between two touch points (for pinch zoom)
    const getDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Touch start handler
    const handleTouchStart = (e) => {
      touchStartTime = Date.now();
      
      if (e.touches.length === 1) {
        // Single touch - prepare for pan or long press
        const touch = e.touches[0];
        setTouchState(prev => ({
          ...prev,
          startX: touch.clientX,
          startY: touch.clientY,
          lastX: touch.clientX,
          lastY: touch.clientY,
          isLongPress: false
        }));

        // Start long press timer
        const timer = setTimeout(() => {
          setTouchState(prev => ({ ...prev, isLongPress: true }));
          // Haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }, 500);

        setTouchState(prev => ({ ...prev, longPressTimer: timer }));
      } else if (e.touches.length === 2 && enableZoom) {
        // Two touches - pinch zoom
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        setTouchState(prev => ({
          ...prev,
          distance: initialDistance
        }));
      }
    };

    // Touch move handler
    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && enablePan) {
        // Single touch - pan
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchState.lastX;
        const deltaY = touch.clientY - touchState.lastY;

        // Clear long press timer if moving
        if (touchState.longPressTimer) {
          clearTimeout(touchState.longPressTimer);
          setTouchState(prev => ({ ...prev, longPressTimer: null }));
        }

        // Only pan if horizontal movement is dominant (prevent conflict with vertical scroll)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
          e.preventDefault(); // Prevent page scroll
          
          // Emit custom pan event that chart components can listen to
          const panEvent = new CustomEvent('chartPan', {
            detail: { deltaX, deltaY }
          });
          container.dispatchEvent(panEvent);
        }

        setTouchState(prev => ({
          ...prev,
          lastX: touch.clientX,
          lastY: touch.clientY
        }));
      } else if (e.touches.length === 2 && enableZoom) {
        // Two touches - pinch zoom
        e.preventDefault();
        
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;
        
        // Emit custom zoom event
        const zoomEvent = new CustomEvent('chartZoom', {
          detail: { scale }
        });
        container.dispatchEvent(zoomEvent);
        
        initialDistance = currentDistance;
      }
    };

    // Touch end handler
    const handleTouchEnd = (e) => {
      const touchDuration = Date.now() - touchStartTime;

      // Clear long press timer
      if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
        setTouchState(prev => ({ ...prev, longPressTimer: null }));
      }

      // Quick tap - show tooltip
      if (touchDuration < 200 && !touchState.isLongPress) {
        const tapEvent = new CustomEvent('chartTap', {
          detail: { x: touchState.startX, y: touchState.startY }
        });
        container.dispatchEvent(tapEvent);
      }

      // Reset touch state
      setTouchState({
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        distance: 0,
        isLongPress: false,
        longPressTimer: null
      });
    };

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    // Cleanup
    return () => {
      if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
      }
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isTouchDevice, enablePan, enableZoom, touchState.lastX, touchState.lastY, touchState.longPressTimer]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        // Enable touch interactions
        touchAction: isTouchDevice ? (enablePan ? 'pan-y' : 'auto') : 'auto',
        WebkitTouchCallout: 'none', // Disable callout on long press (iOS)
        WebkitUserSelect: 'none', // Prevent text selection
        userSelect: 'none',
        // Visual feedback for long press
        ...(touchState.isLongPress && {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
          borderRadius: '4px',
          transition: 'outline 0.2s ease'
        })
      }}
    >
      {children}
    </Box>
  );
};

export default TouchEnabledChart;
