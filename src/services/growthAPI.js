import apiClient from './api';

export const getWarRoomDashboard = () => apiClient.get('/admin/growth/war-room');
export const getRevenueForecast = () => apiClient.get('/admin/growth/revenue-forecast');
export const getChurnRiskDashboard = (params) => apiClient.get('/admin/growth/churn-risk', { params });
export const getUpsellOpportunities = (params) => apiClient.get('/admin/growth/upsell-opportunities', { params });
export const getDripSequences = (params) => apiClient.get('/admin/growth/drip-sequences', { params });
export const getReferralStats = () => apiClient.get('/admin/growth/referral-stats');
export const getAiRecommendations = () => apiClient.get('/admin/growth/ai-recommendations');
export const getConversionFunnel = () => apiClient.get('/admin/growth/conversion-funnel');
export const draftCampaign = (data) => apiClient.post('/admin/growth/autopilot/draft-campaign', data);
export const getWeeklyStrategy = () => apiClient.get('/admin/growth/autopilot/weekly-strategy');
export const generateReferralCode = () => apiClient.post('/admin/growth/referral/generate');
export const sendUpsellEmail = (opportunityId) => apiClient.post('/admin/growth/upsell/send-email', { opportunityId });
export const triggerUpsellScan = () => apiClient.post('/admin/growth/upsell/scan');
export const draftNotificationAI = (payload) => apiClient.post('/admin/growth/ai/draft-notification', payload);
export const draftHelpArticleAI = (payload) => apiClient.post('/admin/growth/ai/draft-help-article', payload);
export const generateTemplateAI = (payload) => apiClient.post('/admin/growth/ai/generate-template', payload);
export const analyzeSupportTicketAI = (payload) => apiClient.post('/admin/growth/ai/analyze-support-ticket', payload);
