import { gapi } from 'gapi-script';

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const initDrive = async (apiKey: string, clientId: string) => {
    await gapi.load('client:auth2', async () => {
        await gapi.client.init({
            apiKey: apiKey,
            clientId: clientId,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
        });
    });
};

export const saveToDrive = async (fileName: string, content: string) => {
    const file = new Blob([content], { type: 'application/json' });
    const metadata = {
        name: fileName,
        mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await gapi.client.request({
        path: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        method: 'POST',
        body: form,
    });

    return response.result;
};
