import crypto from 'crypto-js'

export const decryptData = (data, secret) => {
    try {
      if(!data || !secret || !data?.trim() || !secret?.trim()) {
        throw ''
      } else {
        let bytes = crypto.AES.decrypt(data, secret)
        let decryptedData = bytes?.toString(crypto.enc.Utf8)
        if(!decryptedData) {
          throw ''
        } else {
          return {
            success : true,
            data : decryptedData
        }
        }
      }
    } catch (error) {
      return {
        success : false
    }
    }
  }

  export const encryptData = (data, secret) => {
      try {
        if (!data || !secret || !data?.trim() || !secret?.trim()) {
          throw "";
        } else {
          const encryptedData = crypto.AES.encrypt(data, secret)?.toString();
          if (!encryptedData) {
            throw "";
          } else {
            return {
              success: true,
              data: encryptedData,
            };
          }
        }
      } catch (error) {
        return {
          success: false,
        };
      }
    };