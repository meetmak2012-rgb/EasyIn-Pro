
import { Transaction } from "../types";

/**
 * Detailed Export: One row per item for granular reporting in Excel.
 * Headers: Date, Name, Description, Details, Material, Size A, Size B, QTY, Rate, Total Sq. Feet, Total Amount
 * This version includes a UTF-8 BOM to prevent character corruption (â,¹) in Excel.
 */
export const exportTransactionsToCSV = (transactions: Transaction[], filename: string) => {
  const headers = [
    "Date",
    "Name",
    "Description",
    "Details",
    "Material",
    "Size A",
    "Size B",
    "QTY",
    "Rate",
    "Total Sq. Feet",
    "Total Amount"
  ];

  const rows: string[][] = [];
  
  // Sort by date descending
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedTransactions.forEach(t => {
    // Format date as DD-MM-YYYY to match the user's image
    const [year, month, day] = t.date.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    t.items.forEach(item => {
      rows.push([
        formattedDate,
        `"${(t.partyName || "-").replace(/"/g, '""')}"`,
        `"${(item.description || "-").replace(/"/g, '""')}"`,
        `"${(item.details || "-").replace(/"/g, '""')}"`,
        `"${(item.material || "-").replace(/"/g, '""')}"`,
        (item.sizeA || 0).toString(),
        (item.sizeB || 0).toString(),
        (item.quantity || 0).toString(),
        (item.rate || 0).toString(),
        (item.sqFt || 0).toString(),
        (item.amount || 0).toString()
      ]);
    });
  });

  // Adding \uFEFF (UTF-8 BOM) at the start for Excel compatibility
  const csvContent = "\uFEFF" + [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copies detailed data to clipboard in TSV format for direct Excel/Google Sheets paste.
 */
export const copyTransactionsToClipboard = (transactions: Transaction[]) => {
  const headers = [
    "Date",
    "Name",
    "Description",
    "Details",
    "Material",
    "Size A",
    "Size B",
    "QTY",
    "Rate",
    "Total Sq. Feet",
    "Total Amount"
  ];

  const rows: string[][] = [];
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedTransactions.forEach(t => {
    const [year, month, day] = t.date.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    t.items.forEach(item => {
      rows.push([
        formattedDate,
        t.partyName || "-",
        item.description || "-",
        item.details || "-",
        item.material || "-",
        (item.sizeA || 0).toString(),
        (item.sizeB || 0).toString(),
        (item.quantity || 0).toString(),
        (item.rate || 0).toString(),
        (item.sqFt || 0).toString(),
        (item.amount || 0).toString()
      ]);
    });
  });

  const tsvContent = [
    headers.join("\t"),
    ...rows.map(row => row.join("\t"))
  ].join("\n");

  navigator.clipboard.writeText(tsvContent).then(() => {
    alert("Data copied! Ready to paste into Excel.");
  }).catch(err => {
    console.error('Copy error: ', err);
    alert("Clipboard copy failed.");
  });
};
