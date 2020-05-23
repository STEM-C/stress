const axios = require('axios')
const path = 'http://stem-c-staging.herokuapp.com'
let LOADS = [25, 50, 75, 100]

axios.interceptors.request.use((config) => {
    
    config.metadata = { start: Date.now() }
    return config
})

axios.interceptors.response.use((response) => {
    
    response.config.metadata.end = Date.now()
    response.duration = response.config.metadata.end - response.config.metadata.start
    return response
})

const maxResponse = (curr, last) => curr > last ? curr : last
const sumResponse = (curr, last) => curr + last
const sendLoad = () => {

    let load = LOADS.shift()
    console.log(`--- ${load} ---`)

    let reqs = []
    for(let i = 0; i < load; i++) reqs.push(axios.get(path).then(resp => resp.duration))

    Promise.all(reqs).then(res => {
        // console.log(`Resps: ${res}`)
        console.log(`Max Response: ${res.reduce(maxResponse, 0)}`)
        console.log(`Avg Response: ${res.reduce(sumResponse, 0)/load} \n`)

        if (LOADS.length) sendLoad()
    })
}

sendLoad()