import crypto from 'crypto-js'
import isDataValid from './isDataValid.js'

const encryptData = (data, secret) => {
    try {
        if(isDataValid(data, secret) ) {
            const encryptedData = crypto.AES.encrypt(data, secret)?.toString()
                if(isDataValid(encryptedData)) {
                    return {
                        success : true,
                        data : encryptedData
                    }
                } else {
                    throw ''
                }
            } else {
                throw ''
            }
    } catch (error) {
        return {
            success : false
        }
    }
}

export {encryptData}