// Use for keyboard navigation ( Focus ) 
import { createContext, useContext } from "react";

export const userContext = createContext()

export const UserContextProvider = userContext.Provider

export const useUser = () => {
    return useContext(userContext)
}
