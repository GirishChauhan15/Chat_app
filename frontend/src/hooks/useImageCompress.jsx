// Image compression logic ( browser image compression )
import { useState } from 'react'
import toast from 'react-hot-toast'
import imageCompression from 'browser-image-compression'
function useImageCompress() {
  const options = {
    // Max image size 0.5 Mb and dimensions of 1920
    maxSizeMB: .5, 
    maxWidthOrHeight: 1920
  }
    const [compressImageBlob, setCompressImageBlob] =  useState(null)
    const imageCompress = async(file) => {
        try {
            let compressFile = await imageCompression(file, options)
            if(compressFile?.type?.includes('image/')) {
                setCompressImageBlob(compressFile)
                return compressFile
              }
            } catch (error) {
              toast?.error(error?.message)
              return null
          }
        }

  return  {imageCompress, compressImageBlob, setCompressImageBlob}
}

export default useImageCompress