import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, Alert, CircularProgress, Grid
} from '@mui/material';
import { Add, Edit, Delete, TrendingUp, Assessment } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const CostManagement = () => {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [summary, setSummary] = useState({ totalAmount: 0, currency: 'USD' });
  const [formData, setFormData] = useState({
    date: new Date(),
    service: '',
    category: 'Infrastructure',
    amount: '',
    currency: 'USD',
    notes: '',
    recurring: false,
    billingPeriod: 'monthly'
  });

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/costs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setCosts(response.data.data.costs);
        setSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error('Fetch costs error:', error);
      setError('Failed to fetch costs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      // Validate form
      if (!formData.service || !formData.amount) {
        setError('Service and amount are required');
        return;
      }

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      if (editingCost) {
        await axios.put(`/api/admin/costs/${editingCost._id}`, formData, { headers });
        setSuccess('Cost entry updated successfully');
      } else {
        await axios.post('/api/admin/costs', formData, { headers });
        setSuccess('Cost entry created successfully');
      }
      
      setDialogOpen(false);
      setEditingCost(null);
      fetchCosts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Submit cost error:', error);
      setError(error.response?.data?.message || 'Failed to save cost entry');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cost entry?')) {
      try {
        setError('');
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/costs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setSuccess('Cost entry deleted successfully');
        fetchCosts();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Delete cost error:', error);
        setError('Failed to delete cost entry');
      }
    }
  };

  const handleOpenDialog = (cost = null) => {
    if (cost) {
      setEditingCost(cost);
      setFormData({
        date: new Date(cost.date),
        service: cost.service,
        category: cost.category,
        amount: cost.amount,
        currency: cost.currency,
        notes: cost.notes || '',
        recurring: cost.recurring,
        billingPeriod: cost.billingPeriod
      });
    } else {
      setEditingCost(null);
      setFormData({
        date: new Date(),
        service: '',
        category: 'Infrastructure',
        amount: '',
        currency: 'USD',
        notes: '',
        recurring: false,
        billingPeriod: 'monthly'
      });
    }
    setDialogOpen(true);
    setError('');
  };

  const getCategoryColor = (category) => {
    const colors = {
      Infrastructure: 'primary',
      Services: 'secondary',
      Tools: 'info',
      Marketing: 'warning',
      Other: 'default'
    };
    return colors[category] || 'default';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp /> Platform Cost Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Track infrastructure expenses and calculate profit margins
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add Cost Entry
          </Button>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Costs
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  ${summary.totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {summary.currency}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Entries
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  {costs.length}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Cost records
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Average Cost
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  ${costs.length > 0 ? (summary.totalAmount / costs.length).toFixed(2) : '0.00'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Per entry
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Costs Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : costs.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No cost entries yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Start tracking your platform costs to enable profit margin calculations
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                >
                  Add First Cost Entry
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Billing Period</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {costs.map((cost) => (
                      <TableRow key={cost._id} hover>
                        <TableCell>
                          {new Date(cost.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {cost.service}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={cost.category} 
                            size="small"
                            color={getCategoryColor(cost.category)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${cost.amount.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cost.currency}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={cost.billingPeriod}
                            color={cost.billingPeriod === 'yearly' ? 'primary' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" noWrap>
                            {cost.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(cost)}
                            color="primary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(cost._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCost ? 'Edit Cost Entry' : 'Add New Cost Entry'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(date) => setFormData({...formData, date})}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select
                  value={formData.service}
                  label="Service"
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                >
                  <MenuItem value="Railway">Railway</MenuItem>
                  <MenuItem value="Vercel">Vercel</MenuItem>
                  <MenuItem value="MongoDB Atlas">MongoDB Atlas</MenuItem>
                  <MenuItem value="Stripe Fees">Stripe Fees</MenuItem>
                  <MenuItem value="Domain Hosting">Domain Hosting</MenuItem>
                  <MenuItem value="Email Service">Email Service</MenuItem>
                  <MenuItem value="CDN">CDN</MenuItem>
                  <MenuItem value="API Services">API Services</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                  <MenuItem value="Services">Services</MenuItem>
                  <MenuItem value="Tools">Tools</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                fullWidth
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Billing Period</InputLabel>
                <Select
                  value={formData.billingPeriod}
                  label="Billing Period"
                  onChange={(e) => setFormData({...formData, billingPeriod: e.target.value})}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                  <MenuItem value="one-time">One-time</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                fullWidth
                placeholder="Additional details about this cost..."
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!formData.service || !formData.amount}
            >
              {editingCost ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CostManagement;
