// src/utils/helpers.js

// Module-level currency singleton — updated by CurrencyContext so ALL callers auto-reflect user's preference
let _activeCurrency = localStorage.getItem('soldikeeper-currency') || 'EUR';

export const setActiveCurrency = (code) => {
  if (code && typeof code === 'string') _activeCurrency = code;
};

export const getActiveCurrency = () => _activeCurrency;

export const formatCurrency = (amount, showPositive = false, overrideCurrency) => {
    const currency = overrideCurrency || _activeCurrency;
    const safeAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    let formatted;
    try {
      formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2
      }).format(Math.abs(safeAmount));
    } catch {
      formatted = `${currency} ${Math.abs(safeAmount).toFixed(2)}`;
    }
    if (showPositive && safeAmount > 0) {
      return `+${formatted}`;
    }
    return formatted;
  };
  
  export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };
  
  export const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };
  
  export const groupByMonth = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          income: 0,
          expenses: 0,
          savings: 0
        };
      }
  
      if (transaction.type === 'income') {
        acc[monthKey].income += transaction.amount;
      } else {
        acc[monthKey].expenses += transaction.amount;
      }
  
      acc[monthKey].savings = acc[monthKey].income - acc[monthKey].expenses;
      return acc;
    }, {});
  };