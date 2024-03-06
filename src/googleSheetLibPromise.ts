export type * from "google-spreadsheet";

const preload = async () => {
    const lib = await import('google-spreadsheet')
    return lib
}


export type GoogleSheetLib = Awaited<ReturnType<typeof preload>>
export let googleSheetLibPromise: Promise<GoogleSheetLib> = preload()
