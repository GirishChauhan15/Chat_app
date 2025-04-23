import mongoose from 'mongoose'
import {db_Name} from '../constant.js'

const mongoDBUrl = process.env.MONGODB_URI || ''

const db_connect = async () => {
    try {
        const response = await mongoose.connect(`${mongoDBUrl}/${db_Name}`)
        // console.log(`Db is connected at host : ${response?.connection?.host}`)
    } catch (error) {
        // console.log(`Error while connecting MONGODB, ${error}`)
        process.exit(1)
    }
}

export default db_connect