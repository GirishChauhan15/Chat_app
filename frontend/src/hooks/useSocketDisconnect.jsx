// Socket io disconnect logic 
import { useSelector } from 'react-redux'
import {getSocket} from '../hooks/socket'

let socket;

function useSocketDisconnect() {
    const {auth} = useSelector(state=> state.user)

    const disconnectSocket = async() => {
        if(!auth?._id) return
        socket = getSocket()
        if(socket?.connected) {
            socket.disconnect()
        }
    }

      return {disconnectSocket}
}


export default useSocketDisconnect
