// Token Refresh logic

import { useDispatch, useSelector } from 'react-redux'
import { axiosPrivate } from '../axios'
import { login } from '../store/auth.reducer'

function useRefresh() {
    const {auth} = useSelector(state=> state.user)
    const dispatch = useDispatch()
    let refreshToken = async() => {
        try {
            let response = await axiosPrivate.get('/user/refresh-token')
            if(response?.data?.success) {
                dispatch(login({...auth, accessToken :response?.data?.data.accessToken}))
                return true
            }
        } catch (error) {
            return false
        }
    }
  return refreshToken
}

export default useRefresh