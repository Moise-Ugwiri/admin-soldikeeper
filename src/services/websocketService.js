import { io } from 'socket.io-client';

/**
 * WebSocket Service for Real-Time Admin Updates
 * Provides persistent Socket.io connection with automatic reconnection
 */

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connect to Socket.io server
   * @param {string} url - Socket.io server URL
   * @param {string} token - Authentication token
   */
  connect(url, token) {
    if (this.socket && this.socket.connected) {
      return; // Already connected, silent return
    }

    try {
      // Extract path from URL if present
      const urlObj = new URL(url);
      const path = urlObj.pathname || '/admin/realtime';

      // Create Socket.io connection with mobile-optimized settings
      this.socket = io(urlObj.origin, {
        path: path,
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        reconnection: true,
        reconnectionDelay: 1000, // Faster reconnection for mobile (was 5000)
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10, // More attempts for unstable connections (was 3)
        timeout: 20000,
        // Mobile network optimization
        upgrade: true, // Allow transport upgrades
        rememberUpgrade: true, // Remember successful upgrades
        // Handle slow/unstable mobile networks
        closeOnBeforeunload: false, // Keep connection when switching apps
        forceNew: false, // Reuse existing connection if possible
      });

      // Connection opened
      this.socket.on('connect', () => {
        // Notify listeners of connection (silent in production)
        this.emit('connected', { 
          socketId: this.socket.id,
          timestamp: new Date().toISOString() 
        });
      });

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error.message);
        
        // Notify listeners of error
        this.emit('error', { 
          error: error.message || 'Socket.io connection error',
          timestamp: new Date().toISOString()
        });
      });

      // Connection closed
      this.socket.on('disconnect', (reason) => {
        // Notify listeners of disconnection
        this.emit('disconnected', { 
          reason: reason,
          timestamp: new Date().toISOString()
        });
      });

      // Reconnection attempt (silent)
      this.socket.io.on('reconnect_attempt', (attempt) => {
        this.emit('reconnecting', { 
          attempt: attempt,
          maxAttempts: 10, // Updated to match new setting
          timestamp: new Date().toISOString()
        });
      });

      // Successful reconnection
      this.socket.io.on('reconnect', (attemptNumber) => {
        console.log(`Socket.io reconnected after ${attemptNumber} attempts`);
        this.emit('reconnected', {
          attemptNumber: attemptNumber,
          timestamp: new Date().toISOString()
        });
      });

      // Reconnection failed
      this.socket.io.on('reconnect_failed', () => {
        console.warn('Socket.io reconnection failed after all attempts');
        
        this.emit('reconnect_failed', {
          timestamp: new Date().toISOString()
        });
      });

      // Handle network status changes (mobile-specific)
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
          console.log('Network came back online, attempting reconnection...');
          if (!this.socket.connected) {
            this.socket.connect();
          }
        });

        window.addEventListener('offline', () => {
          console.log('Network went offline');
        });
      }

      // Listen for admin stats updates (silent)
      this.socket.on('admin:stats', (data) => {
        this.emit('admin:stats', data);
      });

      // Listen for admin realtime updates (silent)
      this.socket.on('admin:realtime', (data) => {
        this.emit('admin:realtime', data);
      });

    } catch (error) {
      console.error('Error creating Socket.io connection:', error);
      this.emit('error', { 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Send message to server
   * @param {string} event - Event name
   * @param {object} data - Data to send
   */
  send(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
      return true;
    } else {
      console.warn('⚠️ Socket.io not connected, cannot send message');
      return false;
    }
  }

  /**
   * Subscribe to event
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event).push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get connection state
   * @returns {string} Connection state
   */
  getState() {
    if (!this.socket) return 'DISCONNECTED';
    
    if (this.socket.connected) return 'CONNECTED';
    if (this.socket.disconnected) return 'DISCONNECTED';
    
    return 'CONNECTING';
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
