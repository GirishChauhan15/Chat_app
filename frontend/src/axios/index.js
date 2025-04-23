import axios from 'axios'
import { config } from '../config'

// No axios retry
export default axios.create({
    // timeout: config?.timeOutRange,
    baseURL : `${config?.backendUrl}/api/v1`, 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
})

// Axios retry (Private request that may need retry)
export const axiosPrivate =  axios.create({
    // timeout: config?.timeOutRange,
    baseURL : `${config?.backendUrl}/api/v1`, 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
})
