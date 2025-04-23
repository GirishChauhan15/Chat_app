import {configureStore} from '@reduxjs/toolkit'
import authReducer from './auth.reducer'
import userReducer from './message.reducer'
import { config } from '../config'

const store = configureStore({
    reducer : {
        user : authReducer,
        message : userReducer
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),    
    devTools : config?.nodeEnv === 'development'
})

export default store