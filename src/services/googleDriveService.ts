import { Transaction } from "../types";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

let cachedAccessToken: string | null = null;

export const setGoogleAccessToken = (token: string) => {
  cachedAccessToken = token;
  localStorage.setItem('easyin_google_access_token', token);
};

export const getGoogleAccessToken = (): string | null => {
  if (!cachedAccessToken) {
    cachedAccessToken = localStorage.getItem('easyin_google_access_token');
  }
  return cachedAccessToken;
};

export const initGapi = () => {
  return Promise.resolve();
};

const BACKUP_FILENAME = "easyin_estimates_backup.json";

export const getAuthToken = async (): Promise<string> => {
  const existingToken = getGoogleAccessToken();
  if (existingToken) {
    return existingToken;
  }

  // Renew token by triggering a login popup
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Unable to obtain Google Access Token.");
    }
    setGoogleAccessToken(credential.accessToken);
    return credential.accessToken;
  } catch (err: any) {
    console.error("Failed to automatically authenticate with Google to access Drive:", err);
    throw new Error(err.message || "Failed to obtain Google authentication.", { cause: err });
  }
};

export const syncToDrive = async (transactions: Transaction[], _clientId?: string) => {
  try {
    const token = await getAuthToken();

    // 1. Search for existing file
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`)}&fields=files(id)`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!searchRes.ok) {
      if (searchRes.status === 401) {
        // Token might be expired, let's clear it and try once more
        localStorage.removeItem('easyin_google_access_token');
        cachedAccessToken = null;
        return syncToDrive(transactions, _clientId);
      }
      throw new Error(`Google Drive Search failed: ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    const files = searchData.files;
    const fileContent = JSON.stringify(transactions, null, 2);

    if (files && files.length > 0) {
      // 2. Update existing file
      const fileId = files[0].id;
      const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: fileContent
      });
      if (!updateRes.ok) {
        throw new Error(`Google Drive Update failed: ${updateRes.statusText}`);
      }
    } else {
      // 3. Create new file
      // First, create the metadata entry
      const createMetaRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: BACKUP_FILENAME,
          mimeType: 'application/json'
        })
      });
      if (!createMetaRes.ok) {
        throw new Error(`Google Drive File Creation failed: ${createMetaRes.statusText}`);
      }
      const createdFile = await createMetaRes.json();
      const fileId = createdFile.id;

      // Second, upload the content
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: fileContent
      });
      if (!uploadRes.ok) {
        throw new Error(`Google Drive Upload content failed: ${uploadRes.statusText}`);
      }
    }
    return true;
  } catch (error) {
    console.error("Cloud Sync Error:", error);
    throw error;
  }
};

export const restoreFromDrive = async (_clientId?: string): Promise<Transaction[] | null> => {
  try {
    const token = await getAuthToken();

    // 1. Search for existing file
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`)}&fields=files(id)`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!searchRes.ok) {
      if (searchRes.status === 401) {
        // Token might be expired, let's clear it and try once more
        localStorage.removeItem('easyin_google_access_token');
        cachedAccessToken = null;
        return restoreFromDrive(_clientId);
      }
      throw new Error(`Google Drive Search failed: ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    const files = searchData.files;

    if (files && files.length > 0) {
      const fileId = files[0].id;
      const getRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!getRes.ok) {
        throw new Error(`Google Drive Fetch content failed: ${getRes.statusText}`);
      }
      return await getRes.json();
    }
    return null;
  } catch (error) {
    console.error("Restore from Cloud Error:", error);
    throw error;
  }
};
