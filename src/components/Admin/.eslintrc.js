// ESLint overrides for migrated Admin components
// These rules are relaxed during migration from the main client app.
// TODO: Fix these issues progressively and remove overrides.
module.exports = {
  rules: {
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
