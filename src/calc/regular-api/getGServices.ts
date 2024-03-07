

import {GoogleAuth} from "google-auth-library/build/src/auth/googleauth";

import {sheets_v4} from "googleapis/build/src/apis/sheets/v4";
import {times} from "ramda";
import {RangeScheme} from "iso/src/stencil/makeRangeScheme";

import {google, Auth} from 'googleapis';

export const G_SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/gmail.send'
];


const colNameAlphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] as const

export type RangeData = sheets_v4.Schema$ValueRange['values']

export const getGAuth = async (keyFile, scopes = G_SCOPES) =>
    await new Auth.GoogleAuth({
        keyFile,
        scopes,
    }).getClient();


const colNamesByNumber = []

export const colIndexToName = (columnNumber) => {
    const length = colNameAlphabet.length
    if (!colNamesByNumber[columnNumber]) {
        let columnName = "";
        while (columnNumber > 0) {
            const rem = columnNumber % length;
            columnName += rem === 0 ? "Z" : colNameAlphabet[rem - 1];
            columnNumber = rem === 0 ? columnNumber / length - 1 : Math.floor(columnNumber / length);
        }
        colNamesByNumber[columnNumber] = columnName.split("").reverse().join("");
    }
    return colNamesByNumber[columnNumber]
}


export const getGServices = async (keyFile = MASTRO_G_KEY_FILE_PATH, scopes = G_SCOPES) => {
    const getSheetServices = (auth: GoogleAuth<any>) => {
        const gSheetService = google.sheets({version: 'v4', auth,}).spreadsheets
        const duplicateSpreadSheetAndGetId = async (fromSheetId, folderId, newName: string = new Date().toISOString()) => {
            const res = await google.drive({version: 'v3', auth}).files.copy({
                fileId: fromSheetId,
                requestBody: {
                    name: newName,
                    parents: [folderId],

                }
            });
            return res.data.id
        }


        const withSpreadsheet = <SheetName extends string>(spreadsheetId: string) => {
            const fetchRangesValues = async (a1Ranges: A1Range[], rowsToSkip = 0 as number | number[]): Promise<sheets_v4.Schema$ValueRange[]> => {
                const rowToSkipPerRange = typeof rowsToSkip === 'number' ? times((i) => rowsToSkip, a1Ranges.length) : rowsToSkip
                const res = await gSheetService.values.batchGet({spreadsheetId, auth, ranges: a1Ranges})
                return res.data.valueRanges.map((v, index) => ({
                    ...v,
                    values: v.values.slice(rowToSkipPerRange[index])
                }))
            }
            return {
                ...gSheetService,
                getRangesData: async (rangeRequests: { range: A1Range }[], rowsToSkip = 0): Promise<sheets_v4.Schema$ValueRange[]> => {
                    const res = await gSheetService.values.batchGet({
                        spreadsheetId,
                        auth,
                        ranges: rangeRequests.map(r => r.range)
                    })
                    return res.data.valueRanges.map(v => ({...v, values: v.values.slice(rowsToSkip)}))
                },
                clearRanges: async (rangeRequests: { range: A1Range }[]): Promise<sheets_v4.Schema$ValueRange[]> => {
                    const res = await gSheetService.values.batchClear({
                        spreadsheetId,
                        auth,
                        ranges: rangeRequests.map(r => r.range)
                    })
                    return res.data
                },
                fetchRangesValues,
                fetchRangesItems: async (rangeSchemes: RangeScheme[]) => {
                    const rangeValues = await fetchRangesValues(rangeSchemes.map(r => r.a1RangeFullNotation))
                    return rangeValues.map((v, i) => rangeSchemes[i].parseValuesRange(v))
                },
                updateRangesData: async (rangeUpdates: { range: A1Range, values: RangeData }[]) =>
                    (await gSheetService.values.batchUpdate({
                        spreadsheetId, auth, requestBody: {
                            data: rangeUpdates, valueInputOption: 'USER_ENTERED'
                        }
                    })).data
                ,
            }
        }

        return {
            withSpreadsheet,
            duplicateSpreadSheetAndGetId,
            gSheetService,
        }

    }
    const auth = await getGAuth(keyFile, scopes)
    const sheets = getSheetServices(auth)
    return {
        auth,
        sheets,
    }
}

export type GServices = UnPromisify<ReturnType<typeof getGServices>>

export default getGServices
