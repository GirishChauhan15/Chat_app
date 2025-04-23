export const config = {
    backendUrl : import.meta.env.VITE_BACKEND_URL || '',
    nodeEnv : import.meta.env.VITE_NODE_ENV || '',
    messageEncryptionSecret : import.meta.env.VITE_MESSAGE_ENCRYPTION_KEY || '',
    imageEncryptionSecret : import.meta.env.VITE_IMAGE_ENCRYPTION_KEY || '',
    profilePictureEncryptionSecret : import.meta.env.VITE_PROFILE_PIC_ENCRYPTION_KEY || '',   
    // timeOutRange : 10000,
}