// Debug script to check admin authentication
import api from '../services/api';

const checkAdminAuth = async () => {
  console.log('🔍 Checking admin authentication...');
  
  // Check if we have a token in localStorage
  const token = localStorage.getItem('token');
  console.log('📱 Token in localStorage:', token ? 'Present' : 'Not found');
  
  if (!token) {
    console.log('❌ No authentication token found');
    return;
  }
  
  try {
    // Test user info first
    console.log('📡 Testing /auth/me endpoint...');
    const userResponse = await api.get('/auth/me');
    console.log('✅ User info:', userResponse.data);
    
    // Check if user is admin
    const user = userResponse.data?.data?.user || userResponse.data?.user;
    console.log('👤 User role:', user?.role);
    console.log('👤 Is admin:', user?.isAdmin);
    console.log('👤 User email:', user?.email);
    
    if (!user?.isAdmin && user?.role !== 'admin') {
      console.log('⚠️ User is not an admin. Current role:', user?.role || 'user');
      console.log('💡 Please login with: superadmin@soldikeeper.com / SuperAdmin123!');
      return;
    }
    
    // Test admin endpoint
    console.log('📡 Testing admin dashboard stats...');
    const adminResponse = await api.get('/admin/dashboard/stats');
    console.log('✅ Admin stats:', adminResponse.data);
    
  } catch (error) {
    console.error('❌ Authentication check failed:', error);
    console.error('❌ Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
};

export default checkAdminAuth;
