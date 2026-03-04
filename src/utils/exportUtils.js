/**
 * Client-side export utilities for admin dashboard.
 * Used as a primary local export mechanism and as a fallback when server-side
 * export endpoints are unavailable.
 */

/**
 * Escapes a CSV cell value — wraps in quotes if it contains commas, quotes, or newlines.
 */
const escapeCSVCell = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Converts an array of objects to a CSV string.
 * @param {Array<Object>} data - Array of flat objects
 * @param {string[]} [columns] - Optional explicit column order; defaults to all keys from first row
 * @returns {string} CSV content
 */
const arrayToCSV = (data, columns) => {
  if (!Array.isArray(data) || data.length === 0) return '';

  const headers = columns || Object.keys(data[0]);
  const headerRow = headers.map(escapeCSVCell).join(',');
  const rows = data.map((row) =>
    headers.map((h) => escapeCSVCell(row[h])).join(',')
  );

  return [headerRow, ...rows].join('\r\n');
};

/**
 * Triggers a browser file download from a string/blob.
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Exports an array of objects as a CSV file.
 * @param {Array<Object>} data - Data rows
 * @param {string} [filename='export'] - Filename without extension
 * @param {string[]} [columns] - Optional column ordering
 */
export const exportToCSV = (data, filename = 'export', columns) => {
  if (!data || data.length === 0) {
    console.warn('exportToCSV: no data to export');
    return;
  }

  const csv = arrayToCSV(data, columns);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `${filename}_${timestamp}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Exports an array of objects as an Excel-friendly CSV (.xlsx extension but CSV
 * content with BOM so Excel opens it correctly with UTF-8).
 * For a true XLSX binary you'd need a library like SheetJS — this is a lightweight
 * alternative that works well for tabular data.
 * @param {Array<Object>} data - Data rows
 * @param {string} [filename='export'] - Filename without extension
 * @param {string[]} [columns] - Optional column ordering
 */
export const exportToExcel = (data, filename = 'export', columns) => {
  if (!data || data.length === 0) {
    console.warn('exportToExcel: no data to export');
    return;
  }

  const csv = arrayToCSV(data, columns);
  // Prepend UTF-8 BOM so Excel recognises the encoding
  const bom = '\uFEFF';
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    bom + csv,
    `${filename}_${timestamp}.xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
};

/**
 * Simple PDF-style export: opens a printable window with the data rendered as
 * an HTML table so the user can print/save to PDF via the browser dialog.
 * @param {Array<Object>} data - Data rows
 * @param {string} [title='Export'] - Title shown at the top of the printable page
 * @param {string[]} [columns] - Optional column ordering
 */
export const exportToPDF = (data, title = 'Export', columns) => {
  if (!data || data.length === 0) {
    console.warn('exportToPDF: no data to export');
    return;
  }

  const headers = columns || Object.keys(data[0]);
  const headerCells = headers.map((h) => `<th style="border:1px solid #ddd;padding:8px;background:#f4f4f4;text-align:left">${h}</th>`).join('');
  const bodyRows = data
    .map(
      (row) =>
        '<tr>' +
        headers.map((h) => `<td style="border:1px solid #ddd;padding:8px">${row[h] ?? ''}</td>`).join('') +
        '</tr>'
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { margin-bottom: 4px; }
        p { color: #666; margin-bottom: 16px; }
        table { border-collapse: collapse; width: 100%; font-size: 13px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on ${new Date().toLocaleString()} — ${data.length} record(s)</p>
      <table>
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
};

/**
 * Flattens a nested user object into a flat row suitable for CSV export.
 */
export const flattenUser = (user) => ({
  ID: user._id || '',
  Name: user.name || '',
  Email: user.email || '',
  Status: user.status || '',
  Plan: user.subscription?.plan || 'free',
  'Created At': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
});

/**
 * Flattens a nested transaction object into a flat row suitable for CSV export.
 */
export const flattenTransaction = (tx) => ({
  ID: tx._id || '',
  Description: tx.description || '',
  Amount: tx.amount ?? 0,
  Type: tx.type || '',
  Category: tx.category || '',
  User: tx.user?.name || tx.user?.email || '',
  Flagged: tx.flagged ? 'Yes' : 'No',
  Date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''
});
