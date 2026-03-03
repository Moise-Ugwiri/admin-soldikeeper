import apiClient from './api';

class AdminService {
  // Dashboard Stats
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }

  // Real-time Data
  async getRealtimeData() {
    try {
      const response = await apiClient.get('/admin/realtime');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch realtime data');
    }
  }

  // User Management
  async getUsers(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await apiClient.get(`/admin/users?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  async getUserDetails(userId) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user details');
    }
  }

  async updateUser(userId, updates) {
    try {
      const response = await apiClient.put(`/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  async grantSubscription(userId, { plan, billingCycle = 'monthly', status = 'active', note = '' }) {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/subscription`, { plan, billingCycle, status, note });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update subscription');
    }
  }

  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  async suspendUser(userId, reason) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/suspend`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to suspend user');
    }
  }

  async activateUser(userId) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/activate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to activate user');
    }
  }

  async resetUserPassword(userId) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/reset-password`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send password reset');
    }
  }

  async forceVerifyEmail(userId) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/verify-email`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify email');
    }
  }

  async forceLogout(userId) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/force-logout`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to force logout');
    }
  }

  async sendEmailToUser(userId, subject, message) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/send-email`, { subject, message });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send email');
    }
  }

  async addAdminNote(userId, note) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/notes`, { note });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add note');
    }
  }

  async getAdminNotes(userId) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/notes`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notes');
    }
  }

  async deleteUserData(userId) {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}/data`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user data');
    }
  }

  async getUserStats(userId) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user stats');
    }
  }

  // Transaction Management
  async getTransactions(page = 1, limit = 50, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await apiClient.get(`/admin/transactions?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }

  async getTransactionDetails(transactionId) {
    try {
      const response = await apiClient.get(`/admin/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction details');
    }
  }

  async updateTransaction(transactionId, updates) {
    try {
      const response = await apiClient.put(`/admin/transactions/${transactionId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update transaction');
    }
  }

  async flagTransaction(transactionId, reason) {
    try {
      const response = await apiClient.post(`/admin/transactions/${transactionId}/flag`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to flag transaction');
    }
  }

  // Analytics
  async getAnalytics(dateRange = '30d') {
    try {
      const response = await apiClient.get(`/admin/analytics?range=${dateRange}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }

  async getUserGrowthAnalytics(period = 'monthly') {
    try {
      const response = await apiClient.get(`/admin/analytics/users/growth?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user growth analytics');
    }
  }

  async getRevenueAnalytics(period = 'monthly') {
    try {
      const response = await apiClient.get(`/admin/analytics/revenue?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch revenue analytics');
    }
  }

  async getTransactionAnalytics(period = 'monthly') {
    try {
      const response = await apiClient.get(`/admin/analytics/transactions?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction analytics');
    }
  }

  async getCategoryAnalytics(dateRange = '30d') {
    try {
      const response = await apiClient.get(`/admin/analytics/categories?range=${dateRange}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category analytics');
    }
  }

  // Activity Logs
  async getActivityLogs(page = 1, limit = 100, filters = {}) {
    try {
      // Filter out undefined, null, empty values, and 'all' which means no filter
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '' && 
            value !== 'undefined' && value !== 'null' && value !== 'all') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...cleanFilters
      });
      
      const response = await apiClient.get(`/admin/activity-logs?${params}`);
      
      // API returns { success: true, data: { logs, pagination } }
      // Extract the data object to match what AdminContext expects
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }

  async getActivityLogDetails(logId) {
    try {
      const response = await apiClient.get(`/admin/activity-logs/${logId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity log details');
    }
  }

  async getActivityAnalytics(dateRange = 'week') {
    try {
      const response = await apiClient.get(`/admin/activity-logs/analytics?dateRange=${dateRange}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity analytics');
    }
  }

  // Security
  async getSecurityAlerts() {
    try {
      const response = await apiClient.get('/admin/security/alerts');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch security alerts');
    }
  }

  async getFailedLogins(page = 1, limit = 50) {
    try {
      const response = await apiClient.get(`/admin/security/failed-logins?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch failed logins');
    }
  }

  async getSuspiciousActivity() {
    try {
      const response = await apiClient.get('/admin/security/suspicious-activity');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch suspicious activity');
    }
  }

  async blockIP(ipAddress, reason) {
    try {
      const response = await apiClient.post('/admin/security/block-ip', { ipAddress, reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to block IP address');
    }
  }

  async unblockIP(ipAddress) {
    try {
      const response = await apiClient.post('/admin/security/unblock-ip', { ipAddress });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unblock IP address');
    }
  }

  // System Settings
  async getSystemSettings() {
    try {
      const response = await apiClient.get('/admin/system/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch system settings');
    }
  }

  async updateSystemSettings(settings) {
    try {
      const response = await apiClient.put('/admin/system/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update system settings');
    }
  }

  async getSystemHealth() {
    try {
      const response = await apiClient.get('/admin/system/health');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch system health');
    }
  }

  async getSystemLogs(page = 1, limit = 100, level = 'all') {
    try {
      const response = await apiClient.get(`/admin/system/logs?page=${page}&limit=${limit}&level=${level}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch system logs');
    }
  }

  // Backup and Maintenance
  async createBackup() {
    try {
      const response = await apiClient.post('/admin/system/backup');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create backup');
    }
  }

  async getBackups() {
    try {
      const response = await apiClient.get('/admin/system/backups');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch backups');
    }
  }

  async restoreBackup(backupId) {
    try {
      const response = await apiClient.post(`/admin/system/backups/${backupId}/restore`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to restore backup');
    }
  }

  async enableMaintenanceMode(message) {
    try {
      const response = await apiClient.post('/admin/system/maintenance/enable', { message });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to enable maintenance mode');
    }
  }

  async disableMaintenanceMode() {
    try {
      const response = await apiClient.post('/admin/system/maintenance/disable');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to disable maintenance mode');
    }
  }

  // Export and Reporting
  async exportData(type, format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await apiClient.get(`/admin/export/${type}?${params}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export data');
    }
  }

  async generateReport(type, options = {}) {
    try {
      const response = await apiClient.post(`/admin/reports/${type}`, options);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate report');
    }
  }

  async getReports() {
    try {
      const response = await apiClient.get('/admin/reports');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  }

  async downloadReport(reportId) {
    try {
      const response = await apiClient.get(`/admin/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download report');
    }
  }

  // Notifications and Announcements
  async createNotification(notification) {
    try {
      const response = await apiClient.post('/admin/content/notifications', notification);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create notification');
    }
  }

  async sendNotification(notification) {
    try {
      const response = await apiClient.post('/admin/notifications/send', notification);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send notification');
    }
  }

  async createAnnouncement(announcement) {
    try {
      const response = await apiClient.post('/admin/announcements', announcement);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create announcement');
    }
  }

  async getAnnouncements() {
    try {
      const response = await apiClient.get('/admin/announcements');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch announcements');
    }
  }

  async updateAnnouncement(announcementId, updates) {
    try {
      const response = await apiClient.put(`/admin/announcements/${announcementId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update announcement');
    }
  }

  async deleteAnnouncement(announcementId) {
    try {
      const response = await apiClient.delete(`/admin/announcements/${announcementId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete announcement');
    }
  }

  // Content Management
  async getNotifications(page = 1, limit = 20, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await apiClient.get('/admin/content/notifications', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }

  async getEmailCampaigns(page = 1, limit = 20, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await apiClient.get('/admin/content/campaigns', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email campaigns');
    }
  }

  async createEmailCampaign(campaign) {
    try {
      const response = await apiClient.post('/admin/content/campaigns', campaign);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create email campaign');
    }
  }

  async getHelpContent(page = 1, limit = 20, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await apiClient.get('/admin/content/help', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch help content');
    }
  }

  async createHelpContent(content) {
    try {
      const response = await apiClient.post('/admin/content/help', content);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create help content');
    }
  }

  async getCommunicationAnalytics(dateRange = '6m') {
    try {
      const response = await apiClient.get('/admin/content/analytics', { 
        params: { dateRange } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch communication analytics');
    }
  }

  // Update and Delete methods for content management
  async updateNotification(notificationId, updates) {
    try {
      const response = await apiClient.put(`/admin/content/notifications/${notificationId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification');
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(`/admin/content/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  }

  async updateEmailCampaign(campaignId, updates) {
    try {
      const response = await apiClient.put(`/admin/content/campaigns/${campaignId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update email campaign');
    }
  }

  async deleteEmailCampaign(campaignId) {
    try {
      const response = await apiClient.delete(`/admin/content/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete email campaign');
    }
  }

  async updateHelpContent(contentId, updates) {
    try {
      const response = await apiClient.put(`/admin/content/help/${contentId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update help content');
    }
  }

  async deleteHelpContent(contentId) {
    try {
      const response = await apiClient.delete(`/admin/content/help/${contentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete help content');
    }
  }

  // Performance Monitoring
  async getPerformanceMetrics(timeRange = '1h') {
    try {
      const response = await apiClient.get(`/admin/performance/metrics?range=${timeRange}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch performance metrics');
    }
  }

  async getErrorRates(timeRange = '1h') {
    try {
      const response = await apiClient.get(`/admin/performance/errors?range=${timeRange}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch error rates');
    }
  }

  async getResponseTimes(timeRange = '1h') {
    try {
      const response = await apiClient.get(`/admin/performance/response-times?range=${timeRange}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch response times');
    }
  }

  // Database Management
  async getDatabaseStats() {
    try {
      const response = await apiClient.get('/admin/database/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch database stats');
    }
  }

  async optimizeDatabase() {
    try {
      const response = await apiClient.post('/admin/database/optimize');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to optimize database');
    }
  }

  async cleanupOldData(days = 30) {
    try {
      const response = await apiClient.post('/admin/database/cleanup', { days });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cleanup old data');
    }
  }

  // ==========================================
  // ENHANCED ADMIN ENDPOINTS (NEW)
  // ==========================================

  // Financial Intelligence
  async getFinancialIntelligence(dateRange = '30') {
    try {
      const response = await apiClient.get('/admin/financial-intelligence', {
        params: { dateRange }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch financial intelligence data');
    }
  }

  // Enhanced Security Center
  async getSecurityData(timeRange = '24h') {
    try {
      const response = await apiClient.get('/admin/security/data', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch security data');
    }
  }

  async blockIPEnhanced(ipAddress, reason, duration = null) {
    try {
      const response = await apiClient.post('/admin/security/block-ip', { 
        ipAddress, 
        reason, 
        duration 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to block IP address');
    }
  }

  async unblockIPEnhanced(ipAddress, reason) {
    try {
      const response = await apiClient.post('/admin/security/unblock-ip', { 
        ipAddress, 
        reason 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unblock IP address');
    }
  }

  async updateSecuritySettingsEnhanced(settings) {
    try {
      const response = await apiClient.put('/admin/security/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update security settings');
    }
  }

  // Compliance & Audit
  async getComplianceData(dateRange = 'last7days') {
    try {
      const response = await apiClient.get('/admin/compliance/data', {
        params: { dateRange }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch compliance data');
    }
  }

  async processGdprRequest(requestId, action, notes = '') {
    try {
      const response = await apiClient.post(`/admin/compliance/gdpr/${requestId}`, { 
        action, 
        notes 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process GDPR request');
    }
  }

  async exportAuditLogs(format = 'csv', dateRange = 'last30days') {
    try {
      const response = await apiClient.get('/admin/compliance/export', {
        params: { format, dateRange },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export audit logs');
    }
  }

  // Admin Roles Management
  async getAdminRoles() {
    try {
      const response = await apiClient.get('/admin/roles');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin roles');
    }
  }

  async getAdminUsers() {
    try {
      const response = await apiClient.get('/admin/admins');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin users');
    }
  }

  async updateAdminRole(userId, role, permissions = null) {
    try {
      const response = await apiClient.put(`/admin/admins/${userId}/role`, { 
        role, 
        permissions 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update admin role');
    }
  }

  async createAdminUser(userId, role) {
    try {
      const response = await apiClient.post('/admin/admins', { userId, role });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create admin user');
    }
  }

  async removeAdminPrivileges(userId) {
    try {
      const response = await apiClient.delete(`/admin/admins/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove admin privileges');
    }
  }

  async initializeAdminRoles() {
    try {
      const response = await apiClient.post('/admin/roles/initialize');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to initialize admin roles');
    }
  }
}

const adminServiceInstance = new AdminService();
export default adminServiceInstance;
