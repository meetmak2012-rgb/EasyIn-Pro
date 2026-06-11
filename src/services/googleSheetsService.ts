import { Transaction } from "../types";
import { getAuthToken } from "./googleDriveService";

const SHEET_NAME = "EasyIn Estimates & Line Items";

export interface SyncSheetsResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export const syncToGoogleSheets = async (
  transactions: Transaction[]
): Promise<SyncSheetsResult> => {
  try {
    const token = await getAuthToken();

    // 1. Search for existing Google Sheet with standard spreadsheet mimetype
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name = '${SHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    )}&fields=files(id,webViewLink)`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!searchRes.ok) {
      if (searchRes.status === 401) {
        // Clear cached token and retry auto-auth once
        localStorage.removeItem("easyin_google_access_token");
        return syncToGoogleSheets(transactions);
      }
      throw new Error(`Google Drive Search failed: ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    const files = searchData.files;

    let spreadsheetId = "";
    let spreadsheetUrl = "";

    if (files && files.length > 0) {
      spreadsheetId = files[0].id;
      spreadsheetUrl = files[0].webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    } else {
      // 2. Create a new Spreadsheet with two tabs
      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            title: SHEET_NAME,
          },
          sheets: [
            {
              properties: {
                title: "Estimates",
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
            },
            {
              properties: {
                title: "Estimate Items",
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
            },
          ],
        }),
      });

      if (!createRes.ok) {
        throw new Error(`Google Sheets creation failed: ${createRes.statusText}`);
      }

      const createdSheet = await createRes.json();
      spreadsheetId = createdSheet.spreadsheetId;
      spreadsheetUrl = createdSheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    }

    // 3. Prepare data rows
    // Sheets tab: "Estimates"
    const estimatesRows = [
      ["Date", "Estimate No", "Customer Name", "Sub Total", "Grand Total", "Status", "Billing Address", "Attachments Count"]
    ];

    // Sheets tab: "Estimate Items"
    const estimateItemsRows = [
      ["Estimate No", "Customer Name", "Item Description", "Details", "Material", "Size A", "Size B", "Quantity", "Sq Ft", "Rate", "Amount"]
    ];

    transactions.forEach((t) => {
      // Short date format
      const dateStr = t.date ? new Date(t.date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      }) : "";

      estimatesRows.push([
        dateStr,
        t.invoiceNumber || "",
        t.partyName || "",
        t.subTotal ? String(t.subTotal) : "0",
        t.grandTotal ? String(t.grandTotal) : "0",
        t.status || "",
        t.billingAddress || "",
        t.attachments ? String(t.attachments.length) : "0"
      ]);

      if (t.items && t.items.length > 0) {
        t.items.forEach((item) => {
          estimateItemsRows.push([
            t.invoiceNumber || "",
            t.partyName || "",
            item.description || "",
            item.details || "",
            item.material || "",
            item.sizeA ? String(item.sizeA) : "0",
            item.sizeB ? String(item.sizeB) : "0",
            item.quantity ? String(item.quantity) : "0",
            item.sqFt ? String(item.sqFt) : "0",
            item.rate ? String(item.rate) : "0",
            item.amount ? String(item.amount) : "0"
          ]);
        });
      }
    });

    // 4. Clear existing data in both sheets to prevent leftover rows
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Estimates'!A1:Z10000:clear`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Estimate Items'!A1:Z50000:clear`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 5. Batch update rows
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          valueInputOption: "USER_ENTERED",
          data: [
            {
              range: "'Estimates'!A1",
              values: estimatesRows,
            },
            {
              range: "'Estimate Items'!A1",
              values: estimateItemsRows,
            },
          ],
        }),
      }
    );

    if (!updateRes.ok) {
      throw new Error(`Google Sheets batchUpdate failed: ${updateRes.statusText}`);
    }

    return {
      spreadsheetId,
      spreadsheetUrl,
    };
  } catch (err: any) {
    console.error("Sheets sync error:", err);
    throw err;
  }
};
