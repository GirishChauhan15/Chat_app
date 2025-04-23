import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../axios'
import { useDispatch } from 'react-redux'
import {Spinner} from './index'
import { login } from '../store/auth.reducer'
import toast from 'react-hot-toast'

function AuthLayout({children}) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

    const getCurrentUser = async(signal) => {
      setLoading(true)
      try {
        const response = await axios.get('/user/get-current-user', {signal})
        if(response?.data?.success) {
          dispatch(login(response?.data?.data))
          navigate('/')
        }
      } catch (error) {
        if(error?.message?.includes('timeout of')) {
          toast.error("Request timed out. Please try again.")
        }
        if(error?.message === 'canceled') {
          return null
        }
        navigate('/login')
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 200);
      }
    }

    
    useEffect(()=> {
      const abortController = new AbortController()
      
      getCurrentUser(abortController?.signal)

      return ()=> {
        setLoading(true)
        abortController.abort()
      }
    },[])

  return (
    <section className='w-full h-screen flex justify-center items-center min-h-[400px]'>
        { loading ? <Spinner /> :
           children
        }
    </section>
  )
}

export default AuthLayout