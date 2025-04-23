// Remove local image copy from server
import fs from 'fs'

const removeImageFromServer = async (path) => {
    if(!path?.trim()) return false
    try {
        fs.unlinkSync(path) 
        return true
    } catch (error) {
        return false
        
    }   
}

export default removeImageFromServer