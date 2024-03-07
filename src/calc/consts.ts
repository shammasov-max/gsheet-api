import {Auth} from 'googleapis'

export  const G_SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/gmail.send',
];
export const SPREADSHEET_ID = '1pcKXolfX_haM7FmERlMkvWj28OgRQF7ktWgflx4q3M4'
export const getGAuth = async () =>
    new Auth.GoogleAuth({
        keyFile: './src/key.json',
        clientOptions: { lifetime: 3600 * 12 },
        scopes: G_SCOPES,
    });