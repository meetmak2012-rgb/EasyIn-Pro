
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Transaction, BusinessProfile } from "../types";

export const generateInvoicePDF = (transaction: Transaction, profile: BusinessProfile) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const themeRGB: [number, number, number] = hexToRgb(profile.pdfThemeColor || "#2563eb");
    const currencyPrefix = profile.currencySymbol === '₹' ? 'Rs.' : profile.currencySymbol;

    // 1. Watermark Text
    doc.setFontSize(60).setTextColor(245, 245, 245).setFont(undefined, 'bold');
    doc.text("ESTIMATE", 196, 25, { align: 'right' });

    // 2. Main Title
    doc.setFontSize(28).setTextColor(themeRGB[0], themeRGB[1], themeRGB[2]).setFont(undefined, 'bold');
    doc.text("ESTIMATE", 14, 25);
    
    // Subtitle "OFFICIAL RECORD" removed as per user request

    // 3. Document Details (Top Right)
    doc.setFontSize(10).setTextColor(80, 80, 80).setFont(undefined, 'normal');
    doc.text(`Estimate #: ${transaction.invoiceNumber}`, 196, 40, { align: 'right' });
    doc.text(`Date: ${transaction.date}`, 196, 46, { align: 'right' });

    // 4. Status Badge
    const statusText = transaction.status;
    const badgeColor = statusText === 'PAID' ? [16, 163, 74] : [225, 29, 72]; // emerald-600 : rose-600
    doc.setDrawColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(166, 52, 30, 8, 1, 1, 'D');
    doc.setFontSize(8).setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]).setFont(undefined, 'bold');
    doc.text(statusText, 181, 57.5, { align: 'center' });

    // 5. Customer Details
    doc.setDrawColor(240, 240, 240);
    doc.line(14, 65, 196, 65);

    doc.setFontSize(9).setTextColor(160, 160, 160).setFont(undefined, 'bold');
    doc.text("BILLED TO", 14, 75);
    
    doc.setFontSize(16).setTextColor(30, 30, 30).setFont(undefined, 'bold');
    doc.text(transaction.partyName || "-", 14, 84);
    
    doc.setFontSize(10).setTextColor(100, 100, 100).setFont(undefined, 'normal');
    const splitAddress = doc.splitTextToSize(transaction.billingAddress || "-", 80);
    doc.text(splitAddress, 14, 91);

    // 6. Table Generation
    const headers = ["#", "Description", "Details", "Material", "Size", "Qty", "Total SqFt", "Rate", "Amount"];
    const tableRows = transaction.items.map((item, idx) => [
      idx + 1,
      item.description || "-",
      item.details || "-",
      item.material || "-",
      `${item.sizeA}x${item.sizeB}`,
      item.quantity,
      item.sqFt,
      Number(item.rate || 0).toFixed(2),
      Number(item.amount || 0).toFixed(2)
    ]);

    autoTable(doc, {
      head: [headers],
      body: tableRows,
      startY: 110,
      theme: 'grid',
      headStyles: { fillColor: themeRGB, textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: 60 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'right' },
        8: { halign: 'right', fontStyle: 'bold', textColor: 20 }
      },
      styles: { cellPadding: 3 }
    });

    // 7. Total Amount Box
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFillColor(themeRGB[0], themeRGB[1], themeRGB[2]);
    doc.roundedRect(126, finalY - 8, 70, 15, 1, 1, 'F');
    
    doc.setFontSize(10).setTextColor(255).setFont(undefined, 'bold');
    doc.text("TOTAL AMOUNT", 132, finalY + 1.5);
    
    const amountStr = `${currencyPrefix} ${Number(transaction.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    doc.setFontSize(14).text(amountStr, 192, finalY + 1.5, { align: 'right' });

    // 8. Terms & Conditions
    doc.setFontSize(9).setTextColor(160, 160, 160).setFont(undefined, 'bold');
    doc.text("TERMS & CONDITIONS", 14, finalY + 25);
    
    doc.setFontSize(9).setTextColor(100, 100, 100).setFont(undefined, 'italic');
    const footerText = profile.pdfFooterNote || "Thank you for your business! Goods once sold will not be taken back.";
    const splitFooter = doc.splitTextToSize(footerText, 100);
    doc.text(splitFooter, 14, finalY + 31);

    // 9. Signature
    const bottomY = doc.internal.pageSize.getHeight() - 40;
    doc.setDrawColor(220, 220, 220);
    doc.line(146, bottomY, 196, bottomY);
    doc.setFontSize(9).setTextColor(150).setFont(undefined, 'bold');
    doc.text("Authorized Signatory", 171, bottomY + 5, { align: 'center' });

    // 10. Footer Timestamp
    doc.setFontSize(7).setTextColor(200).setFont(undefined, 'bold');
    const timestamp = `Generated using EasyIn Invoicing • Date: ${new Date().toLocaleString()}`;
    doc.text(timestamp, 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    doc.save(`Estimate_${transaction.invoiceNumber}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error:", error);
  }
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [37, 99, 235];
}
