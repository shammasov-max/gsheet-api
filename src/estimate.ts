export const estimate = (name: string) => {
    let startTime = Date.now()
    let currentTime = startTime
    let previousTime =currentTime
    const log = (...args: any[]) => {
        currentTime = Date.now()
        console.log(`LOGTIME ${name}:${(currentTime-previousTime)}`, ...args)
        previousTime = currentTime
    }
    const end = (...args: any[]) => {
        log(...args)
        currentTime = Date.now()
        console.log(`ENDTIME ${name}:${(currentTime-startTime)}`, ...args)
     
        currentTime = Date.now()
    }

    return Object.assign(log, {end})
}
