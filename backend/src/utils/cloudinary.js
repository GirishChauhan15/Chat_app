import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

// cloudinary Uploader and return image info
const cloudinaryUploader = async (file) => {
    try {
        const response = await cloudinary.uploader.upload(file,{resource_type: 'image'})
        return {
            publicId : response?.public_id,
            secureUrl : response?.secure_url
        }
    } catch (error) {
        return false
    }
}

// cloudinary delete resource (image) NotInUse
const cloudinaryDelete = async (publicId) => {
    try {
        const response = await cloudinary.api.delete_resources(publicId)
        if(response?.deleted) {
            return true
        }
    } catch (error) {
        return false
    }
}

export {
    cloudinaryDelete,
    cloudinaryUploader
}