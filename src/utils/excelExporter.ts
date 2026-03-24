
import * as XLSX from 'xlsx';
import { Transaction } from '../types';

/**
 * Detailed Excel Export: One row per item for granular reporting.
 * This provides a "proper" form for Excel users.
 */
export const exportTransactionsToExcel = (transactions: Transaction[], filename: string) => {
  const data: any[] = [];
  
  // Sort by date descending
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedTransactions.forEach(t => {
    // Format date as DD-MM-YYYY for Excel compatibility
    const dateObj = new Date(t.date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    t.items.forEach((item, index) => {
      data.push({
        'Date': formattedDate,
        'Invoice No.': t.invoiceNumber,
        'Party Name': t.partyName,
        'Item Description': item.description || '-',
        'Material': item.material || '-',
        'Size (A x B)': `${item.sizeA} x ${item.sizeB}`,
        'Quantity': item.quantity || 0,
        'Rate': item.rate || 0,
        'Total Sq. Ft.': item.sqFt || 0,
        'Item Amount': item.amount || 0,
        'Invoice Total': index === 0 ? t.grandTotal : '',
        'Status': t.status
      });
    });
  });

  // Add a summary row at the bottom
  const totalAmount = transactions.reduce((sum, t) => sum + (t.grandTotal || 0), 0);
  data.push({}); // Empty row
  data.push({
    'Date': 'TOTAL',
    'Invoice Total': totalAmount,
    'Status': 'SUMMARY'
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Register');

  // Generate buffer and trigger download
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Copies detailed data to clipboard in TSV format for direct Excel/Google Sheets paste.
 */
export const copyTransactionsToClipboard = (transactions: Transaction[]) => {
  const headers = [
    "Date",
    "Invoice No.",
    "Party Name",
    "Description",
    "Material",
    "Size",
    "QTY",
    "Rate",
    "Sq. Ft.",
    "Amount",
    "Invoice Total",
    "Status"
  ];

  const rows: string[][] = [];
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedTransactions.forEach(t => {
    const dateObj = new Date(t.date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    t.items.forEach((item, index) => {
      rows.push([
        formattedDate,
        t.invoiceNumber,
        t.partyName || "-",
        item.description || "-",
        item.material || "-",
        `${item.sizeA} x ${item.sizeB}`,
        (item.quantity || 0).toString(),
        (item.rate || 0).toString(),
        (item.sqFt || 0).toString(),
        (item.amount || 0).toString(),
        index === 0 ? (t.grandTotal || 0).toString() : "",
        t.status
      ]);
    });
  });

  const tsvContent = [
    headers.join("\t"),
    ...rows.map(row => row.join("\t"))
  ].join("\n");

  navigator.clipboard.writeText(tsvContent).then(() => {
    alert("Detailed data copied! Ready to paste (Ctrl+V) directly into Excel or Google Sheets.");
  }).catch(err => {
    console.error('Copy error: ', err);
    alert("Clipboard copy failed.");
  });
};
