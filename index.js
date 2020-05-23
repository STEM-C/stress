const fs = require('fs')
const axios = require('axios')
axios.interceptors.request.use((config) => {
    
    config.metadata = { start: Date.now() }
    return config
})
axios.interceptors.response.use((response) => {
    
    response.config.metadata.end = Date.now()
    response.duration = response.config.metadata.end - response.config.metadata.start
    return response
})

const HOST = 'http://stem-c-staging.herokuapp.com'
const PATHS = ['/', '/activities']
const LOADS = [25, 50, 75, 100, 250, 500, 1000]
const logTitle = (path, load) => console.log(`--- ${path} @ ${load} ---`)
const logEvent = (title, res) => console.log(`[${title}] ${res}ms`)

let tests = []
PATHS.forEach(path => LOADS.forEach(load => tests.push({ path, load })))

const maxResponse = (curr, last) => curr > last ? curr : last
const sumResponse = (curr, last) => curr + last
const sendLoad = () => {

    const test = tests.shift()
    const { path, load } = test
    logTitle(path, load)

    let reqs = []
    for(let i = 0; i < load; i++) reqs.push(axios.get(`${HOST}${path}`).then(resp => resp.duration))

    Promise.all(reqs).then(res => {

        let avg = Math.round(res.reduce(sumResponse, 0)/load)
        let max = res.reduce(maxResponse, 0)

        fs.appendFileSync('results.csv', `${HOST}, ${path}, ${load}, ${avg}, ${max} \n`)
        logEvent('Avg response', avg)
        logEvent('Max response', max)
        console.log('')

        if (tests.length) sendLoad()
    })
}

fs.writeFile('results.csv', 'Host, Path, Load, Avg, Max \n', (err) => null)
console.log(`Running tests for ${HOST}`)
sendLoad()