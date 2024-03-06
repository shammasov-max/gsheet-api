import * as path from 'path'
import Fastify, {FastifyLoggerOptions, FastifyRequest, RawServerBase} from 'fastify'
import {PinoLoggerOptions} from 'fastify/types/logger'

const events = {}
import {FastifyInstance, FastifyPluginAsync, FastifyPluginOptions} from 'fastify';
import '@fastify/multipart';
import {Auth} from 'googleapis';
import {googleSheetLibPromise} from './googleSheetLibPromise'
export const G_SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/gmail.send',
];

export const getGAuth = async () =>
     new Auth.GoogleAuth({
        keyFile: './src/key.json',
        clientOptions: { lifetime: 3600 * 12 },
        scopes: G_SCOPES,
    });

const SHEET_ID = '1pcKXolfX_haM7FmERlMkvWj28OgRQF7ktWgflx4q3M4'

export const main = async () => {

    let fastify = Fastify({
        logger: true,
        ignoreTrailingSlash: true,
        bodyLimit: 1048576 * 10,
        trustProxy: true,
        // ?modifyCoreObjects:false"
    })


    fastify.register(require('@fastify/multipart'))

    fastify.register(require('@fastify/cors'),{origin: false, allowedHeaders: '*'})

   
    fastify.get('/info', async (req, res) => {


        const {date, chirality} = req.query
        const auth = await getGAuth();
        const GSLib = await googleSheetLibPromise


        //const auth = authClient
        const doc = new GSLib.GoogleSpreadsheet(SHEET_ID, auth);

        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        await doc.updateProperties({ title: 'renamed doc' });

        const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
        await sheet.loadCells()
        let cell = sheet.getCell(4,9)
            cell.value = date
        await cell.save()
         let cell1 = sheet.getCell(4,15)
        cell1.value = chirality==='1' ? 'правша': "левша"
        await cell1.save()
        await sheet.loadCells()


        console.log(sheet.title);
        console.log(sheet.rowCount);
        var lx = 2
        var ly = 7
        var ar =[]
        while(ly < 34) {
            lx = 2
            var a = []
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
        return res.send(ar.map(a => JSON.stringify(a)).join(',\r'))
    })
     await fastify.listen(3000, '0.0.0.0')

}





console.time('startup')
main()
  .catch(e => console.error('Service Error', e))
  .then(() => console.timeEnd('startup'))

process.on('unhandledRejection', r => {
    console.error('Unhandled Rejection', r)
})

process.on('uncaughtException', r => {
    console.error('Unhandled error', r)
})

