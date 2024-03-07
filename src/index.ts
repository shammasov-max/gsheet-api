import * as path from 'path'
import Fastify, {FastifyLoggerOptions, FastifyRequest, RawServerBase} from 'fastify'
import {PinoLoggerOptions} from 'fastify/types/logger'

const events = {}
import {FastifyInstance, FastifyPluginAsync, FastifyPluginOptions} from 'fastify';
import '@fastify/multipart';
import {Auth} from 'googleapis';
const disableCache = require("fastify-disablecache");

import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

import calc, {BirthDate, CalcInput, Chirality} from './calc/calc'




export const main = async () => {

    let fastify = Fastify({
        logger: true,
        ignoreTrailingSlash: true,
        bodyLimit: 1048576 * 10,
        trustProxy: true,
        // ?modifyCoreObjects:false"
    }).withTypeProvider<TypeBoxTypeProvider>()
    fastify.register(disableCache)

    fastify.register(require('@fastify/multipart'))

    fastify.register(require('@fastify/cors'),{origin: false, allowedHeaders: '*'})




    fastify.get('/info', {
        schema: {
            querystring: CalcInput
        }},
      async (req, res) => {

        const input= req.query
          const result = await calc(input)

        return res.send(result.map(a => JSON.stringify(a)).join(',\r'))
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

