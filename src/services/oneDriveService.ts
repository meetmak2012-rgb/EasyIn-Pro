
import { PublicClientApplication, Configuration, AuthenticationResult } from "@azure/msal-browser";
import { Transaction } from "../types";

const BACKUP_FILENAME = "easyin_estimates_backup.json";

let msalInstance: PublicClientApplication | null = null;

export const initMsal = async (clientId: string) => {
  if (msalInstance) return msalInstance;

  const msalConfig: Configuration = {
    auth: {
      clientId: clientId,
      authority: "https://login.microsoftonline.com/common",
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: "localStorage",
    },
  };

  msalInstance = new PublicClientApplication(msalConfig);
  await msalInstance.initialize();
  return msalInstance;
};

export const getOneDriveToken = async (clientId: string) => {
  const instance = await initMsal(clientId);
  const accounts = instance.getAllAccounts();

  const loginRequest = {
    scopes: ["Files.ReadWrite", "User.Read"],
  };

  if (accounts.length > 0) {
    try {
      const result: AuthenticationResult = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return result.accessToken;
    } catch {
      const result: AuthenticationResult = await instance.acquireTokenPopup(loginRequest);
      return result.accessToken;
    }
  } else {
    const result: AuthenticationResult = await instance.acquireTokenPopup(loginRequest);
    return result.accessToken;
  }
};

export const syncToOneDrive = async (transactions: Transaction[], clientId: string) => {
  try {
    const token = await getOneDriveToken(clientId);
    const content = JSON.stringify(transactions);

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${BACKUP_FILENAME}:/content`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: content,
    });

    if (!response.ok) {
      throw new Error(`OneDrive upload failed: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("OneDrive Sync Error:", error);
    throw error;
  }
};

export const restoreFromOneDrive = async (clientId: string): Promise<Transaction[] | null> => {
  try {
    const token = await getOneDriveToken(clientId);

    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${BACKUP_FILENAME}:/content`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`OneDrive download failed: ${response.statusText}`);

    return await response.json();
  } catch (error) {
    console.error("OneDrive Restore Error:", error);
    throw error;
  }
};
