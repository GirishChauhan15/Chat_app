import {Server} from 'socket.io'
import app from './app.js'
import {createServer} from 'http'
import { User } from './models/user.model.js'

const server = createServer(app)

// Socket io initialization
const io = new Server(server, {
    cors :{
        origin : process.env.CORS_ORIGIN
    }
})

// online user list 
let onlineList = []

const isUserOnline = (userId) => {
    if(onlineList?.length> 0) {
        return onlineList?.find(user => user?.userId === userId)
    } else return null
} 

// Socket io connection and disconnect as well as typing logic
io.on('connection',async(socket)=> {
    // console.log(`User Connected ${socket?.id}`)
    onlineList = onlineList?.filter(user=> user?.userId !== socket.handshake.query.userId)
    try {
        const data = await User.findById(socket.handshake.query.userId).select('fullName email profilePicture createdAt updatedAt').lean().exec()
        if(data?._id) {
            onlineList.push({...data, userId : socket?.handshake?.query?.userId, socketId : socket?.id})
            io.emit('onlineUserInfo', onlineList)
        }
    } catch (error) {
        return
    }

    socket.on('typing', (data)=> {
        const user = isUserOnline(data?.receiverId)
        if(user?.socketId) {
                io.to(user?.socketId).emit('typing', {...data, success: true})
            }
        }
    )
    socket.on('stop typing', (data)=> {
        const user = isUserOnline(data?.receiverId)
        if(user?.socketId) {
            io.to(user?.socketId).emit('stop typing', {...data, success: false})
        }
    }
)

    socket.on('disconnect', ()=> {
        // console.log(`User Disconnected ${socket?.id}`)
        onlineList = onlineList.filter(user => user?.socketId !== socket?.id)
        io.emit('onlineUserInfo', onlineList)
    })
})


export default server
export {io, isUserOnline}