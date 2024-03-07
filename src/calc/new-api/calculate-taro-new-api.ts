
import {estimate} from '../../estimate'
import type {CalcInput} from '../calc'
import {getGAuth, SPREADSHEET_ID} from '../consts'

export type * from "google-spreadsheet";

const preload = async () => {
    const lib = await import('google-spreadsheet')
    return lib
}


 type GoogleSheetLib = Awaited<ReturnType<typeof preload>>
 let calculateTaroNewApi: Promise<GoogleSheetLib> = preload()
export default async (input: CalcInput) => {
    const {date,chirality} = input
    const log = estimate('info')
    log('start')
    const auth = await getGAuth();
    log('gauth')
    const GSLib = await calculateTaroNewApi

    log('libawaited')
    //const auth = authClient
    const doc = new GSLib.GoogleSpreadsheet(SPREADSHEET_ID, auth);
    // await doc.loadInfo()
    await doc.loadInfo(false); // loads document properties and worksheets

    log('loadInfo')
    // console.log(doc.title);

    const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    await sheet.loadCells('A1:S35')
    log('preload cells')
    let dateCell = sheet.getCell(4,9)
    dateCell.value = date

    log('save date')
    let chiralityCell = sheet.getCell(4,15)
    chiralityCell.value = chirality==='left' ?  "левша":'правша'
    await sheet.saveCells([dateCell, chiralityCell])
    log('save chirality')
    await sheet.loadCells('A1:S34')

    log('2nd load cells')
    var lx = 2
    var ly = 7
    var ar =[]
    while(ly < 34) {
        lx = 2
        const a = [] as any[]
        ar.push(a)
        while(lx < 18) {
            try {
                a.push(sheet.getCell( ly,lx,).value)
            }catch(e) {
                console.error('Cell '+ly+':'+lx+' not loaded')
            }
            lx++
        }
        ly++
    }
    log.end()

    return ar;
}