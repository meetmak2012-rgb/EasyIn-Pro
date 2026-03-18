
import { Transaction } from "../types";

// Replace with your real Client ID from Google Cloud Console
const SCOPES = "https://www.googleapis.com/auth/drive.file";

export const initGapi = () => {
  return new Promise<void>((resolve) => {
    (window as any).gapi.load('client', async () => {
      await (window as any).gapi.client.init({
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      });
      resolve();
    });
  });
};

export const getAccessToken = (clientId: string) => {
  return new Promise<string>((resolve, reject) => {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          reject(response);
        }
        resolve(response.access_token);
      },
    });
    client.requestAccessToken();
  });
};

const BACKUP_FILENAME = "easyin_estimates_backup.json";

export const syncToDrive = async (transactions: Transaction[], clientId: string) => {
  try {
    const token = await getAccessToken(clientId);
    (window as any).gapi.client.setToken({ access_token: token });

    // 1. Search for existing file
    const searchResponse = await (window as any).gapi.client.drive.files.list({
      q: `name = '${BACKUP_FILENAME}' and trashed = false`,
      fields: 'files(id)',
    });

    const files = searchResponse.result.files;
    const fileContent = JSON.stringify(transactions);
    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json',
    };

    if (files && files.length > 0) {
      // 2. Update existing file
      const fileId = files[0].id;
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: new Headers({ 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }),
        body: fileContent
      });
    } else {
      // 3. Create new file
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + token }),
        body: form
      });
    }
    return true;
  } catch (error) {
    console.error("Cloud Sync Error:", error);
    throw error;
  }
};

export const restoreFromDrive = async (clientId: string): Promise<Transaction[] | null> => {
  try {
    const token = await getAccessToken(clientId);
    (window as any).gapi.client.setToken({ access_token: token });

    const searchResponse = await (window as any).gapi.client.drive.files.list({
      q: `name = '${BACKUP_FILENAME}' and trashed = false`,
      fields: 'files(id)',
    });

    const files = searchResponse.result.files;
    if (files && files.length > 0) {
      const fileId = files[0].id;
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: new Headers({ 'Authorization': 'Bearer ' + token })
      });
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Restore from Cloud Error:", error);
    throw error;
  }
};
