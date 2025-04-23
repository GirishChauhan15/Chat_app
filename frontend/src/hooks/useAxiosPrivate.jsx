// Axios retry logic
import { useEffect } from 'react'
import { axiosPrivate } from '../axios'
import {useSelector} from 'react-redux'
import useRefresh from './useRefresh'

function useAxiosPrivate() {
  const {auth} = useSelector(state=> state.user)
  const refreshToken = useRefresh()
  
  useEffect(()=>{
    let requestInterceptor = axiosPrivate.interceptors.request.use(
      config=> {
        // Setting headers
        if(auth?.accessToken) {
          config.headers.Authorization = `Bearer ${auth?.accessToken}`
        }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )
    let responseInterceptor = axiosPrivate.interceptors.response.use(
      response => response,
      async(error) => {
        // Identifying failed request and retry logic
        let previousRequest = error.config;
        if(error?.response?.status === 401 && !previousRequest?.sent) {
          previousRequest.sent = true
          // Refresh tokens and retry
          const tokenInfo = await refreshToken()
          if(tokenInfo) {
              return axiosPrivate(previousRequest)
          }
        } else if(error?.message === 'canceled') {
          return null
        } else if(error?.message?.includes('timeout of')) {
          return Promise.reject({message: "Request timed out. Please try again."})
        } else {
            return Promise.reject(error)
        }
      }
    )
    
    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor)
      axiosPrivate.interceptors.response.eject(responseInterceptor)
    }
    
  },[refreshToken])
  
  return axiosPrivate
}

export default useAxiosPrivate