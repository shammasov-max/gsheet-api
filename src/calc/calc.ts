
import { Type, type Static,FormatRegistry } from '@sinclair/typebox'
import {TypeSystem} from '@sinclair/typebox/system'
import {DateTime} from 'luxon'
import {__, curry} from 'ramda'
import calculateTaroNewApi from './new-api/calculate-taro-new-api'
export const formatDDMMYYYY = 'DDMMYYYY'
 export const Chirality = Type.Union([Type.Literal('left'), Type.Literal('right')])
export const BirthDate = Type.String()

export type Chirality = Static<typeof Chirality>

export type BirthDate = Static<typeof BirthDate>
const dateTimeFromFormat = curry(DateTime.fromFormat)
const parseFromFormat = dateTimeFromFormat(__, formatDDMMYYYY)

export const CalcInput = Type.Object({
 date: BirthDate,
 chirality: Chirality
})
export type CalcInput = Static<typeof CalcInput>
//FormatRegistry.Set(formatDDMMYYYY, (value) => fromFormat(value).isValid)

export default async (input:CalcInput) => {
console.log('INPUT IS', JSON.stringify(input))
 return  await calculateTaroNewApi(input)
}