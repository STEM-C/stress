const axios = require('axios')

axios.interceptors.request.use((config) => {
    
    config.metadata = { start: Date.now(), }
    return config
})

axios.interceptors.response.use((response) => {
    
    response.config.metadata.end = Date.now()
    response.duration = response.config.metadata.end - response.config.metadata.start
    return response
})

let LOAD = 100

for(let i = 0; i < LOAD; i++) {
    let start = Date.now()
    axios.get('https://stem-c-staging.herokuapp.com').then(resp => {
        console.log(`${resp.duration}ms - ${i}`)

        axios.get('https://stem-c-staging.heroku.com/activities').then(resps => {
            console.log(`- ${resps.duration} - ${i}`)
        })
    })
}