
import { Transaction } from '../types';

export const exportTransactionsToCSV = (transactions: Transaction[], filename: string) => {
  const headers = ['Date', 'Invoice Number', 'Party Name', 'Subtotal', 'Grand Total', 'Status'];
  const rows = transactions.map(t => [
    t.date,
    t.invoiceNumber,
    t.partyName,
    t.subTotal,
    t.grandTotal,
    t.status
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const copyTransactionsToClipboard = (transactions: Transaction[]) => {
  const headers = ['Date', 'Invoice Number', 'Party Name', 'Subtotal', 'Grand Total', 'Status'];
  const rows = transactions.map(t => [
    t.date,
    t.invoiceNumber,
    t.partyName,
    t.subTotal,
    t.grandTotal,
    t.status
  ]);

  const textContent = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  navigator.clipboard.writeText(textContent).then(() => {
    alert('Copied to clipboard! You can now paste it into Excel or Google Sheets.');
  }).catch(err => {
    console.error('Could not copy text: ', err);
  });
};
