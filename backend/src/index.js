import server from './socket.js'
import db_connect from "./db/index.js";
import 'dotenv/config'
import ping from './Ping.js';

const port = process.env.PORT || 8000

db_connect().then(()=>{
    server.on('error',()=>{
        console.log(`Error while connecting to Server`)
    })

    server.listen(port, ()=>{
        ping()
        // console.log(`Port is running at http://localhost:${port}`)
    })
}).catch(err=>{
    console.log(`Error while connecting Database, ${err}`)
})
